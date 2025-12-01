"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "gold" | "black" | "white";
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  color = "gold",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const colorClasses = {
    gold: "border-accent-gold/30 border-t-accent-gold",
    black: "border-foreground/30 border-t-foreground",
    white: "border-white/30 border-t-white",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <p className="text-sm text-foreground-muted animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Full page loading state
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Image
            src="/vishwalogo-v2.png"
            alt="Vishwa Lifestyle"
            width={150}
            height={50}
            className="h-12 w-auto mx-auto"
            priority
          />
        </motion.div>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    </div>
  );
}

