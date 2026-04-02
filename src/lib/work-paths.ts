/** Work index routes: pathname → Sanity category slug (null = show all). */
export const WORK_PATH_TO_CATEGORY: Record<string, string | null> = {
  "/": null,
  "/commercial": "commercial",
  "/music-video": "music-video",
  "/documentary": "narrative",
};

export const WORK_PATHNAMES = new Set(Object.keys(WORK_PATH_TO_CATEGORY));

export function isWorkPathname(pathname: string): boolean {
  return WORK_PATHNAMES.has(pathname);
}
