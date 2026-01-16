"use client";

import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconPaths: Record<string, string> = {
  clock: "M12 6v6l4 2m-4-10a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  scale: "M12 3v18m-7-4l7-7 7 7M5 17h14",
  droplet: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  dumbbell: "M6.5 6.5h11M4 10h2.5m11 0H20M4 14h2.5m11 0H20M6.5 17.5h11M6.5 6.5v11M17.5 6.5v11",
  bed: "M3 18V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11M3 14h18M7 14V9",
  coffee: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3",
  "shower-head": "M4 4v5M4 9a8 8 0 0 0 16 0V4M4 4h16M12 9v11M8 13h8M8 17h8",
  "hands-praying": "M12 2v4M12 22v-4M5.5 8l2.5 2.5M18.5 8l-2.5 2.5M7 17a5 5 0 0 1 5-5 5 5 0 0 1 5 5",
  "notebook-pen": "M4 4h12a2 2 0 0 1 2 2v14H4V4zM8 2v4M12 2v4M8 10h6M8 14h6",
  "book-open": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  footprints: "M4 16v-2a4 4 0 0 1 8 0v2M12 16v-2a4 4 0 0 1 8 0v2M8 16v4M16 16v4",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  check: "M20 6L9 17l-5-5",
  skip: "M19 5l-7 7 7 7M5 5l7 7-7 7",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "bar-chart": "M12 20V10M18 20V4M6 20v-4",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  x: "M18 6L6 18M6 6l12 12",
};

export function Icon({ name, className, size = 24 }: IconProps) {
  const path = iconPaths[name] || iconPaths.check;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block", className)}
    >
      <path d={path} />
    </svg>
  );
}
