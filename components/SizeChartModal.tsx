"use client";

import { useEffect } from "react";
import { X, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SizeChart {
  title: string;
  type: string;
  gender: string;
  headers: string[];
  rows: { cells: string[] }[];
  image?: string;
}

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChart: SizeChart;
}

export default function SizeChartModal({
  isOpen,
  onClose,
  sizeChart,
}: SizeChartModalProps) {
  // Escape key handler + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!sizeChart) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Mobile: Bottom sheet | Desktop: Centered modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white z-[101] shadow-2xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col"
          >
            {/* Drag handle for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-accent-gold/10 rounded-lg text-accent-gold">
                  <Ruler size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-serif font-bold text-foreground">
                    Size Guide
                  </h2>
                  <p className="text-[10px] sm:text-xs text-foreground-muted uppercase tracking-wider">
                    {sizeChart.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-full transition-all duration-200 text-foreground-muted hover:text-foreground hover:shadow-sm"
                aria-label="Close size guide"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - single scroll container */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6">
                {/* Mobile: Card layout */}
                <div className="sm:hidden space-y-3">
                  {sizeChart.rows?.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="border border-gray-100 rounded-xl p-3 bg-gray-50/30"
                    >
                      {/* First cell as the size label header */}
                      <div className="text-sm font-bold text-foreground mb-2 pb-2 border-b border-gray-100">
                        {sizeChart.headers?.[0]}: {row.cells?.[0]}
                      </div>
                      {/* Remaining cells as key-value pairs */}
                      <div className="space-y-1.5">
                        {row.cells?.slice(1).map((cell, cellIdx) => (
                          <div
                            key={cellIdx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-foreground-muted uppercase tracking-wider font-medium">
                              {sizeChart.headers?.[cellIdx + 1]}
                            </span>
                            <span className="text-foreground font-semibold">
                              {cell}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-foreground-muted uppercase text-[10px] tracking-widest font-bold">
                      <tr>
                        {sizeChart.headers?.map((header, idx) => (
                          <th
                            key={idx}
                            className="px-6 py-4 border-b border-gray-100 whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sizeChart.rows?.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {row.cells?.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className={`px-6 py-4 text-foreground whitespace-nowrap ${cellIdx === 0 ? "font-bold" : "font-light"}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Measurement Instructions */}
                {sizeChart.image && (
                  <div className="mt-6 sm:mt-8 space-y-4">
                    <h3 className="font-serif text-base sm:text-lg text-foreground border-b border-gray-100 pb-2">
                      How to Measure
                    </h3>
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-gray-100">
                      <Image
                        src={sizeChart.image}
                        alt="Measurement Guide"
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 sm:mt-8 p-3 sm:p-4 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
                  <p className="text-[10px] sm:text-xs text-foreground-muted leading-relaxed font-light italic">
                    * Most measurements are in inches unless specified. For the
                    perfect fit, please allow for a 0.5 - 1 inch margin of error
                    in handcrafted apparel.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 text-center flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 text-sm font-medium text-accent-gold hover:text-accent-gold/80 sm:bg-transparent bg-accent-gold/10 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
