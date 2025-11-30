"use client";

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-foreground focus:text-white focus:px-6 focus:py-3 focus:text-sm focus:uppercase focus:tracking-widest"
    >
      Skip to main content
    </a>
  );
}

