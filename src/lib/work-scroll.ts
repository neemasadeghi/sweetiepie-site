const SCROLL_KEY = "sweetiepie:work-scroll-y";
const PATH_KEY = "sweetiepie:work-return-path";
const RESTORING_FLAG = "sweetiepie:work-restoring";

/** Remember list scroll position before opening a project. */
export function saveWorkScrollState(pathname: string, scrollY: number) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PATH_KEY, pathname);
  sessionStorage.setItem(SCROLL_KEY, String(Math.round(scrollY)));
}

/** Return path saved when the user opened a project (defaults to home). */
export function getWorkReturnPath(): string {
  if (typeof window === "undefined") return "/";
  return sessionStorage.getItem(PATH_KEY) || "/";
}

function peekWorkScrollRestore(pathname: string): number | null {
  const savedPath = sessionStorage.getItem(PATH_KEY);
  const savedY = sessionStorage.getItem(SCROLL_KEY);
  if (!savedPath || savedY == null || savedPath !== pathname) return null;

  const y = Number(savedY);
  return Number.isFinite(y) ? y : null;
}

function clearWorkScrollRestore() {
  sessionStorage.removeItem(SCROLL_KEY);
  sessionStorage.removeItem(PATH_KEY);
}

/** Read and clear saved scroll for this work route, if any. */
export function consumeWorkScrollRestore(pathname: string): number | null {
  const y = peekWorkScrollRestore(pathname);
  if (y == null) return null;

  clearWorkScrollRestore();
  sessionStorage.setItem(RESTORING_FLAG, "1");
  return y;
}

/** True once after returning from a project — skip grid enter animations. */
export function consumeWorkScrollRestoring(): boolean {
  if (typeof window === "undefined") return false;
  const restoring = sessionStorage.getItem(RESTORING_FLAG) === "1";
  sessionStorage.removeItem(RESTORING_FLAG);
  return restoring;
}

export function isProjectPathname(pathname: string): boolean {
  return pathname.startsWith("/project/");
}
