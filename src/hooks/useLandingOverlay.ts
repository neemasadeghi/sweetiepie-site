"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export const LANDING_REVEALED_EVENT = "landing:revealed";
const LANDING_DISMISSED_LOAD_KEY = "landing-dismissed-load-id";

let pageLoadId: string | null = null;
let initialPathHandled = false;
let overlayActive = false;
const listeners = new Set<() => void>();

function getPageLoadId(): string {
  if (!pageLoadId) {
    pageLoadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
  }
  return pageLoadId;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return overlayActive;
}

function markLandingDismissed() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LANDING_DISMISSED_LOAD_KEY, getPageLoadId());
}

function isLandingDismissedForThisLoad(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LANDING_DISMISSED_LOAD_KEY) === getPageLoadId();
}

function ensureInitialPathHandled(pathname: string) {
  if (initialPathHandled) return;
  initialPathHandled = true;

  if (pathname !== "/") {
    markLandingDismissed();
  }
}

function shouldShowLandingNow(pathname: string): boolean {
  if (typeof window === "undefined") {
    return pathname === "/";
  }

  ensureInitialPathHandled(pathname);

  if (pathname !== "/") return false;
  return !isLandingDismissedForThisLoad();
}

function syncDocumentLandingState(active: boolean) {
  if (typeof document === "undefined") return;

  if (active) {
    document.documentElement.dataset.page = "landing";
    document.body.style.overflow = "hidden";
    return;
  }

  if (document.documentElement.dataset.page === "landing") {
    delete document.documentElement.dataset.page;
  }
  document.body.style.overflow = "";
}

function syncOverlay(pathname: string) {
  const next = shouldShowLandingNow(pathname);
  syncDocumentLandingState(next);

  if (next !== overlayActive) {
    overlayActive = next;
    emit();
  }
}

/** True while the full-screen landing overlay is visible on `/`. */
export function useLandingOverlayActive(): boolean {
  const pathname = usePathname();

  if (typeof window !== "undefined") {
    syncOverlay(pathname);
  }

  const active = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => pathname === "/"
  );

  useLayoutEffect(() => {
    syncOverlay(pathname);
  }, [pathname]);

  useEffect(() => {
    const onRevealed = () => syncOverlay(pathname);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        syncOverlay(pathname);
      }
    };

    window.addEventListener(LANDING_REVEALED_EVENT, onRevealed);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener(LANDING_REVEALED_EVENT, onRevealed);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  return active;
}

export function notifyLandingRevealed() {
  markLandingDismissed();
  syncDocumentLandingState(false);

  if (overlayActive) {
    overlayActive = false;
    emit();
  }

  window.dispatchEvent(new Event(LANDING_REVEALED_EVENT));
}
