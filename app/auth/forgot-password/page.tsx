"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <main className="min-h-screen bg-white pt-24 pb-16 flex items-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-serif mb-4">Check Your Email</h2>
            <p className="text-foreground-muted mb-8">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-accent-gold hover:underline"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/">
              <h1 className="text-3xl font-serif font-bold">VISHWA</h1>
              <span className="text-xs tracking-[0.4em] uppercase text-accent-gold">
                Lifestyle
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-serif text-center mb-4">Reset Password</h2>
          <p className="text-center text-foreground-muted mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center mt-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

