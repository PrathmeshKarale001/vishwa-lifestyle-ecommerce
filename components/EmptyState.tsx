"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Icon size={40} className="text-foreground-muted" />
      </div>
      <h3 className="text-xl font-serif mb-2">{title}</h3>
      <p className="text-foreground-muted mb-8 max-w-md">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="bg-foreground text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors"
        >
          {action.label}
        </Link>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="mt-4 text-accent-gold hover:underline text-sm"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}

