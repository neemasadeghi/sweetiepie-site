"use client";

import { useRouter } from "next/navigation";
import { getWorkReturnPath } from "@/lib/work-scroll";

export function ProjectBackLink({ className }: { className?: string }) {
  const router = useRouter();

  const handleBack = () => {
    const returnPath = getWorkReturnPath();

    // Same behavior for every project: back to the tab you came from.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(returnPath);
  };

  return (
    <button type="button" className={className} onClick={handleBack}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
