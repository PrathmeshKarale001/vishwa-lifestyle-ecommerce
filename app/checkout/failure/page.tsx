"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowRight, HelpCircle } from "lucide-react";

import { Suspense } from "react";

function FailureContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || searchParams.get("reason");
    const message = searchParams.get("message") || searchParams.get("msg") || "The payment transaction could not be completed.";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
        >
            {/* Failure Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 flex items-center justify-center"
            >
                <XCircle size={48} className="text-red-600" />
            </motion.div>

            {/* Header */}
            <h1 className="text-4xl font-serif mb-4">Payment Failed</h1>
            <p className="text-lg text-foreground-muted mb-6">
                We couldn't process your payment.
            </p>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-6 mb-8 text-left max-w-lg mx-auto">
                <h3 className="text-red-800 font-medium mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Transaction Error
                </h3>
                <p className="text-sm text-red-600">
                    {error === "callback_error"
                        ? "There was an issue verifying the payment response. Please contact support if you were charged."
                        : message}
                </p>
            </div>

            {/* Common Reasons */}
            <div className="bg-background-alt p-8 mb-12 text-left">
                <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-accent-gold" />
                    Common Reasons for Failure
                </h2>
                <ul className="space-y-3 text-sm text-foreground-muted list-disc pl-5">
                    <li>Insufficient funds in the account.</li>
                    <li>Incorrect card details or CVV entered.</li>
                    <li>Bank server downtime or authentication failure (OTP).</li>
                    <li>Transaction limit exceeded on the card/account.</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/checkout"
                    className="bg-foreground text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} /> Try Again
                </Link>
                <Link
                    href="/contact"
                    className="border border-foreground text-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-foreground hover:text-white transition-colors"
                >
                    Contact Support
                </Link>
            </div>
        </motion.div>
    );
}

export default function CheckoutFailurePage() {
    return (
        <main className="min-h-screen bg-white pt-24 pb-16">
            <div className="container mx-auto px-6">
                <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
                    <FailureContent />
                </Suspense>
            </div>
        </main>
    );
}

