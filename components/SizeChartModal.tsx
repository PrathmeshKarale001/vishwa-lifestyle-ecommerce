"use client";

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

export default function SizeChartModal({ isOpen, onClose, sizeChart }: SizeChartModalProps) {
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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[101] shadow-2xl rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-gold/10 rounded-lg text-accent-gold">
                                    <Ruler size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-foreground">Size Guide</h2>
                                    <p className="text-xs text-foreground-muted uppercase tracking-wider">{sizeChart.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-all duration-200 text-foreground-muted hover:text-foreground hover:shadow-sm"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 text-foreground-muted uppercase text-[10px] tracking-widest font-bold">
                                        <tr>
                                            {sizeChart.headers?.map((header, idx) => (
                                                <th key={idx} className="px-6 py-4 border-b border-gray-100">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sizeChart.rows?.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                                                {row.cells?.map((cell, cellIdx) => (
                                                    <td
                                                        key={cellIdx}
                                                        className={`px-6 py-4 text-foreground ${cellIdx === 0 ? "font-bold" : "font-light"}`}
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Measurement Instructions (Wait until we have instructions or image) */}
                            {sizeChart.image && (
                                <div className="mt-8 space-y-4">
                                    <h3 className="font-serif text-lg text-foreground border-b border-gray-100 pb-2">How to Measure</h3>
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

                            <div className="mt-8 p-4 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
                                <p className="text-xs text-foreground-muted leading-relaxed font-light italic">
                                    * Most measurements are in inches unless specified. For the perfect fit, please allow for a 0.5 - 1 inch margin of error in handcrafted apparel.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button
                                onClick={onClose}
                                className="text-sm font-medium text-accent-gold hover:text-accent-gold/80 transition-colors"
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
