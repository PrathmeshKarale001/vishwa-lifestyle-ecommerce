"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav 
      className={`text-sm text-foreground-muted ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link 
            href="/" 
            className="hover:text-foreground transition-colors flex items-center gap-1"
            aria-label="Home"
          >
            <Home size={14} aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-foreground-muted" aria-hidden="true" />
              {isLast || !item.href ? (
                <span 
                  className={isLast ? "text-foreground font-medium" : "text-foreground-muted"}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

