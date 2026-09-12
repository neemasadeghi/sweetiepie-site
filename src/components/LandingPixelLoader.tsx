"use client";

import { useEffect, useRef } from "react";
import styles from "./LandingPixelLoader.module.css";

const GRID_W = 80;
const GRID_H = 54;
const PIXEL_COUNT = GRID_W * GRID_H;
const SCRAMBLE_CYCLE_MS = 2800;
const SCRAMBLE_FORM_RATIO = 0.72;
const RESOLVE_MS = 1100;
const QUANT_LEVELS = 8;

const BAYER_4X4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
];

function hash(x: number, y: number, t: number): number {
  let n = x * 374761393 + y * 668265263 + t * 982451653;
  n = (n ^ (n >>> 13)) * 1274126177;
  return (n ^ (n >>> 16)) >>> 0;
}

function quantize8(value: number, x: number, y: number): number {
  const step = 255 / (QUANT_LEVELS - 1);
  const dither = (BAYER_4X4[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * step;
  return Math.max(0, Math.min(255, Math.round((value + dither) / step) * step));
}

function videoTo8BitGrid(
  video: HTMLVideoElement,
  sampleCtx: CanvasRenderingContext2D
): Uint8ClampedArray | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;

  const gridAspect = GRID_W / GRID_H;
  const videoAspect = video.videoWidth / video.videoHeight;
  let sx = 0;
  let sy = 0;
  let sw = video.videoWidth;
  let sh = video.videoHeight;

  if (videoAspect > gridAspect) {
    sw = video.videoHeight * gridAspect;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = video.videoWidth / gridAspect;
    sy = (video.videoHeight - sh) / 2;
  }

  sampleCtx.imageSmoothingEnabled = false;
  sampleCtx.fillStyle = "#000";
  sampleCtx.fillRect(0, 0, GRID_W, GRID_H);
  sampleCtx.drawImage(video, sx, sy, sw, sh, 0, 0, GRID_W, GRID_H);

  const src = sampleCtx.getImageData(0, 0, GRID_W, GRID_H).data;
  const grid = new Uint8ClampedArray(PIXEL_COUNT * 3);

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const i = y * GRID_W + x;
      const si = i * 4;
      const di = i * 3;
      grid[di] = quantize8(src[si], x, y);
      grid[di + 1] = quantize8(src[si + 1], x, y);
      grid[di + 2] = quantize8(src[si + 2], x, y);
    }
  }

  return grid;
}

function buildScramblePerm(seed: number): Uint16Array {
  const perm = new Uint16Array(PIXEL_COUNT);
  for (let i = 0; i < PIXEL_COUNT; i++) {
    perm[i] = i;
  }
  for (let i = PIXEL_COUNT - 1; i > 0; i--) {
    const j = hash(i, seed, 0) % (i + 1);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  return perm;
}

function buildRandomThresholds(seed: number): Float32Array {
  const thresholds = new Float32Array(PIXEL_COUNT);
  for (let i = 0; i < PIXEL_COUNT; i++) {
    thresholds[i] = hash(i, seed, 19) / 4294967296;
  }
  return thresholds;
}

function sourceIndexForPixel(
  pixelIndex: number,
  perm: Uint16Array,
  tick: number,
  seed: number,
  locked: boolean
): number {
  if (locked) return pixelIndex;
  if (hash(pixelIndex, tick, seed) % 7 === 0) {
    return hash(pixelIndex, tick, seed + 7) % PIXEL_COUNT;
  }
  return perm[pixelIndex];
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function getNativeVideoFromMedia(
  media: unknown
): HTMLVideoElement | null {
  if (!media) return null;
  if (media instanceof HTMLVideoElement) return media;

  const candidate = media as {
    media?: HTMLVideoElement | null;
    shadowRoot?: ShadowRoot | null;
  };

  if (candidate.media instanceof HTMLVideoElement) return candidate.media;
  return candidate.shadowRoot?.querySelector("video") ?? null;
}

type LandingPixelLoaderProps = {
  video: HTMLVideoElement | null;
  visible: boolean;
  startResolve: boolean;
  onResolveProgress?: (progress: number) => void;
  onResolveComplete?: () => void;
};

export function LandingPixelLoader({
  video,
  visible,
  startResolve,
  onResolveProgress,
  onResolveComplete,
}: LandingPixelLoaderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const imageDataRef = useRef<ImageData | null>(null);
  const resolveStartedRef = useRef(false);
  const resolveCompleteRef = useRef(false);
  const resolveStartRef = useRef(0);
  const onResolveProgressRef = useRef(onResolveProgress);
  const onResolveCompleteRef = useRef(onResolveComplete);

  useEffect(() => {
    onResolveProgressRef.current = onResolveProgress;
    onResolveCompleteRef.current = onResolveComplete;
  }, [onResolveProgress, onResolveComplete]);

  useEffect(() => {
    resolveStartedRef.current = false;
    resolveCompleteRef.current = false;
    resolveStartRef.current = 0;
  }, [video]);

  useEffect(() => {
    if (!startResolve) {
      resolveStartedRef.current = false;
      resolveCompleteRef.current = false;
      resolveStartRef.current = 0;
    }
  }, [startResolve]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cycleSeed = 1;
    let phaseStart = performance.now();
    let thresholds = buildRandomThresholds(cycleSeed);
    let perm = buildScramblePerm(cycleSeed);

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = GRID_W;
    sampleCanvas.height = GRID_H;
    const sampleCtx = sampleCanvas.getContext("2d");
    if (!sampleCtx) return;

    const offscreen = document.createElement("canvas");
    offscreen.width = GRID_W;
    offscreen.height = GRID_H;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    if (!imageDataRef.current) {
      imageDataRef.current = offCtx.createImageData(GRID_W, GRID_H);
    }
    const imageData = imageDataRef.current;
    const pixels = imageData.data;

    const resize = () => {
      const parent = wrap.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(parent.clientWidth * dpr);
      canvas.height = Math.floor(parent.clientHeight * dpr);
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const resolving = startResolve;
      if (resolving && !resolveStartedRef.current) {
        resolveStartedRef.current = true;
        resolveStartRef.current = now;
      }

      const resolveElapsed = resolving
        ? now - resolveStartRef.current
        : 0;
      const resolveProgress = resolving
        ? Math.min(resolveElapsed / RESOLVE_MS, 1)
        : 0;

      if (resolving) {
        onResolveProgressRef.current?.(easeOutCubic(resolveProgress));
      }

      if (
        resolving &&
        resolveProgress >= 1 &&
        !resolveCompleteRef.current
      ) {
        resolveCompleteRef.current = true;
        onResolveCompleteRef.current?.();
      }

      if (!resolving) {
        const elapsed = now - phaseStart;
        if (elapsed >= SCRAMBLE_CYCLE_MS) {
          cycleSeed += 1;
          thresholds = buildRandomThresholds(cycleSeed);
          perm = buildScramblePerm(cycleSeed);
          phaseStart = now;
        }
      }

      const formProgress = resolving
        ? resolveProgress
        : Math.min((now - phaseStart) / SCRAMBLE_CYCLE_MS, SCRAMBLE_FORM_RATIO);
      const tick = Math.floor(now / 80);
      const flickerMod = resolving ? 23 : 17;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grid = video ? videoTo8BitGrid(video, sampleCtx) : null;

      if (!grid) {
        offCtx.fillStyle = "#0a0a0a";
        offCtx.fillRect(0, 0, GRID_W, GRID_H);
      } else {
        for (let i = 0; i < PIXEL_COUNT; i++) {
          const pi = i * 4;
          const flicker = hash(i, tick, cycleSeed) % flickerMod === 0;
          const locked = formProgress >= thresholds[i] && !flicker;
          const srcIndex = sourceIndexForPixel(
            i,
            perm,
            tick,
            cycleSeed,
            locked
          );
          const gi = srcIndex * 3;

          pixels[pi] = grid[gi];
          pixels[pi + 1] = grid[gi + 1];
          pixels[pi + 2] = grid[gi + 2];
          pixels[pi + 3] = 255;
        }

        offCtx.putImageData(imageData, 0, 0);
      }

      const scale = Math.max(canvas.width / GRID_W, canvas.height / GRID_H);
      const dw = GRID_W * scale;
      const dh = GRID_H * scale;
      const dx = (canvas.width - dw) / 2;
      const dy = (canvas.height - dh) / 2;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, GRID_W, GRID_H, dx, dy, dw, dh);

      wrap.style.opacity = resolving
        ? String(1 - easeOutCubic(resolveProgress))
        : "1";

      if (visible) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (visible) {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      wrap.style.opacity = "1";
    };
  }, [visible, video, startResolve]);

  return (
    <div
      ref={wrapRef}
      className={`${styles.loader} ${visible ? styles.loaderVisible : styles.loaderHidden}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
