"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkReturnPath } from "@/lib/work-scroll";

export function ProjectBackLink({ className }: { className?: string }) {
  const [href, setHref] = useState("/");

  useEffect(() => {
    setHref(getWorkReturnPath());
  }, []);

  return (
    <Link href={href} scroll={false} className={className}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </Link>
  );
}
