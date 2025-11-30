import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <Link href="/">
              <h1 className="text-3xl font-serif font-bold">VISHWA</h1>
              <span className="text-xs tracking-[0.4em] uppercase text-accent-gold">
                Lifestyle
              </span>
            </Link>
          </div>

          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
            <Mail size={40} className="text-accent-gold" />
          </div>

          <h2 className="text-2xl font-serif mb-4">Check Your Email</h2>
          <p className="text-foreground-muted mb-8">
            We've sent a verification link to your email address. Please click the link to verify your account and complete registration.
          </p>

          <div className="bg-background-alt p-6 text-left mb-8">
            <h3 className="font-medium mb-3">Didn't receive the email?</h3>
            <ul className="text-sm text-foreground-muted space-y-2">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          <Link
            href="/auth/login"
            className="inline-block bg-foreground text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

