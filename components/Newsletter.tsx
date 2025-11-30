"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // In production, send to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      toast.success("Welcome to the Vishwa family!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-accent-gold/10 py-16"
      >
        <div className="container mx-auto px-6 text-center">
          <CheckCircle size={48} className="mx-auto text-accent-gold mb-4" />
          <h3 className="text-2xl font-serif mb-2">You're In!</h3>
          <p className="text-foreground-muted">
            Thank you for subscribing. Sacred wisdom awaits in your inbox.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="bg-background-alt py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Mail size={32} className="mx-auto text-accent-gold mb-4" />
          <h2 className="text-3xl font-serif mb-4">Join the Sacred Circle</h2>
          <p className="text-foreground-muted mb-8">
            Subscribe to receive wisdom, rituals, and exclusive offers delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-white px-6 py-3 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe <Send size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-foreground-muted mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

