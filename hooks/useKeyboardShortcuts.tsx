"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Common keyboard shortcuts for the app
export function useAppKeyboardShortcuts() {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: "/",
      action: () => {
        // Focus search
        const searchButton = document.querySelector('[aria-label="Search"]') as HTMLElement;
        if (searchButton) {
          searchButton.click();
        }
      },
      description: "Focus search",
    },
    {
      key: "Escape",
      action: () => {
        // Close modals/drawers
        const closeButtons = document.querySelectorAll('[aria-label*="Close"], [aria-label*="close"]');
        closeButtons.forEach((btn) => {
          (btn as HTMLElement).click();
        });
      },
      description: "Close modals",
    },
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Quick search (Cmd/Ctrl + K)
        const searchButton = document.querySelector('[aria-label="Search"]') as HTMLElement;
        if (searchButton) {
          searchButton.click();
        }
      },
      description: "Quick search",
    },
  ]);
}

