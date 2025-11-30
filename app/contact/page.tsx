"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import { useCsrfToken, CsrfInput } from "@/hooks/useCsrfToken";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "hello@vishwalifestyle.com",
    link: "mailto:hello@vishwalifestyle.com",
  },
  {
    icon: Phone,
    title: "Phone",
    content: "+91 98765 43210",
    link: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Address",
    content: "Sacred Valley, Rishikesh, Uttarakhand, India",
  },
  {
    icon: Clock,
    title: "Hours",
    content: "Mon - Sat: 10:00 AM - 7:00 PM IST",
  },
];

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, we ship within India only. International shipping coming soon!",
  },
  {
    q: "What is your return policy?",
    a: "We offer hassle-free returns within 7 days of delivery for unused products in original packaging.",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrfToken = useCsrfToken();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // Real-time validation on blur
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Message sent! We'll get back to you soon.");
        reset();
      } else {
        toast.error(result.error || "Unable to send message. Please check your information and try again.");
      }
    } catch (error) {
      log.error("Contact form error", error);
      toast.error("Unable to send message. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="bg-background-alt py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground-muted text-lg max-w-2xl mx-auto"
          >
            Have questions about our products or need guidance on your spiritual
            journey? We're here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-serif mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <CsrfInput />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("name")}
                        className={`w-full border px-4 py-3 pr-10 focus:outline-none focus:border-accent-gold transition-colors ${
                          errors.name 
                            ? "border-red-500 bg-red-50" 
                            : touchedFields.name && !errors.name
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                        placeholder="Your name"
                      />
                      {touchedFields.name && !errors.name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
                        </div>
                      )}
                      {errors.name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <XCircle size={18} className="text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("email")}
                        className={`w-full border px-4 py-3 pr-10 focus:outline-none focus:border-accent-gold transition-colors ${
                          errors.email 
                            ? "border-red-500 bg-red-50" 
                            : touchedFields.email && !errors.email
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                        placeholder="your@email.com"
                      />
                      {touchedFields.email && !errors.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
                        </div>
                      )}
                      {errors.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <XCircle size={18} className="text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Subject</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("subject")}
                      className={`w-full border px-4 py-3 pr-10 focus:outline-none focus:border-accent-gold transition-colors ${
                        errors.subject 
                          ? "border-red-500 bg-red-50" 
                          : touchedFields.subject && !errors.subject
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                      placeholder="How can we help?"
                    />
                    {touchedFields.subject && !errors.subject && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
                      </div>
                    )}
                    {errors.subject && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XCircle size={18} className="text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} aria-hidden="true" />
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2">Message</label>
                  <div className="relative">
                    <textarea
                      {...register("message")}
                      rows={5}
                      className={`w-full border px-4 py-3 pr-10 focus:outline-none focus:border-accent-gold resize-none transition-colors ${
                        errors.message 
                          ? "border-red-500 bg-red-50" 
                          : touchedFields.message && !errors.message
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Tell us more..."
                    />
                    {touchedFields.message && !errors.message && (
                      <div className="absolute right-3 top-3">
                        <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
                      </div>
                    )}
                    {errors.message && (
                      <div className="absolute right-3 top-3">
                        <XCircle size={18} className="text-red-500" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} aria-hidden="true" />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-serif mb-8">Contact Information</h2>
              <div className="space-y-6 mb-12">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-background-alt flex items-center justify-center flex-shrink-0">
                      <info.icon size={20} className="text-accent-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-foreground-muted hover:text-accent-gold transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-foreground-muted">{info.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick FAQs */}
              <div className="bg-background-alt p-6">
                <h3 className="font-serif text-lg mb-4">Frequently Asked</h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-sm mb-1">{faq.q}</p>
                      <p className="text-sm text-foreground-muted">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

