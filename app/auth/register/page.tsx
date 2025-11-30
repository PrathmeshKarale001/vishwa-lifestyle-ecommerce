"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { signUp, signInWithGoogle } from "@/lib/supabase";
import { log } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/verify-email");
    } catch (error: any) {
      log.error("Registration error", error);
      if (error.message?.includes("already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account. Please check your information and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      log.error("Google signup error", error);
      toast.error(error.message || "Google sign-up failed. Please try again.");
    }
  };

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

          <h2 className="text-2xl font-serif text-center mb-8">Create Account</h2>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full border border-gray-200 py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 flex-1" />
            <span className="px-4 text-sm text-foreground-muted">or</span>
            <div className="border-t border-gray-200 flex-1" />
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full border pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Your Name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full border pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Phone (Optional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full border border-gray-200 pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full border pl-12 pr-12 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Min. 8 characters"
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

            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`w-full border pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("acceptTerms")}
                className="accent-accent-gold mt-1"
              />
              <span className="text-sm text-foreground-muted">
                I agree to the{" "}
                <Link href="/terms" className="text-accent-gold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent-gold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent-gold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
