"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!supabase) {
      toast.error("Supabase not configured");
      return;
    }

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      router.push("/account/settings");
    } catch (error: any) {
      log.error("Error updating password", error);
      const errorMessage = error.message || "Unable to update password. Please check your current password and try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Settings", href: "/account/settings" },
              { label: "Change Password" },
            ]}
            className="mb-6"
          />

          <h1 className="text-3xl font-serif mb-8">Change Password</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm mb-2">Current Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  type={showCurrent ? "text" : "password"}
                  {...register("currentPassword")}
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${errors.currentPassword ? "border-red-500" : "border-gray-200"
                    }`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm mb-2">New Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  type={showNew ? "text" : "password"}
                  {...register("newPassword")}
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${errors.newPassword ? "border-red-500" : "border-gray-200"
                    }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
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
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${errors.confirmPassword ? "border-red-500" : "border-gray-200"
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

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/account/settings"
                className="flex-1 border border-gray-200 py-3 text-center text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="inline animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>


    </main>
  );
}

