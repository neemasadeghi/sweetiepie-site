const SCROLL_KEY = "sweetiepie:work-scroll-y";
const PATH_KEY = "sweetiepie:work-return-path";

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

/** Read and clear saved scroll for this work route, if any. */
export function consumeWorkScrollRestore(pathname: string): number | null {
  if (typeof window === "undefined") return null;
  const savedPath = sessionStorage.getItem(PATH_KEY);
  const savedY = sessionStorage.getItem(SCROLL_KEY);
  if (!savedPath || savedY == null || savedPath !== pathname) return null;

  sessionStorage.removeItem(SCROLL_KEY);
  sessionStorage.removeItem(PATH_KEY);

  const y = Number(savedY);
  return Number.isFinite(y) ? y : null;
}
