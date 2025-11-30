"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have a valid reset token in the URL
    const checkToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      if (type === "recovery" && accessToken) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    };

    checkToken();
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!supabase) {
      toast.error("Supabase not configured");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password reset successfully! Please login with your new password.");
      router.push("/auth/login");
    } catch (error: any) {
      log.error("Error resetting password", error);
      toast.error(error.message || "Unable to reset password. Please check your reset link and try again.");
    }
  };

  if (isValidToken === null) {
    return (
      <main className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
      </main>
    );
  }

  if (isValidToken === false) {
    return (
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-serif mb-4">Invalid Reset Link</h1>
            <p className="text-foreground-muted mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
            >
              Request New Link
            </Link>
          </div>
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

          <h2 className="text-2xl font-serif text-center mb-8">Reset Your Password</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm mb-2">New Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="inline animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-foreground-muted">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-accent-gold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

