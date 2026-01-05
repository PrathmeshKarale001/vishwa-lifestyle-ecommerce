"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

import Link from "next/link";
import { generateFAQSchema } from "@/lib/seo";

const faqCategories = [
  {
    name: "Orders & Shipping",
    faqs: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 5-7 business days within India. Express shipping (2-3 days) is available at checkout for an additional charge. Orders above ₹999 qualify for free standard shipping.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we ship within India only. We're working on expanding our shipping to other countries. Sign up for our newsletter to be notified when international shipping becomes available.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order ships, you'll receive a tracking number via email and SMS. You can also track your order from your Account dashboard under 'My Orders'.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can be modified or cancelled within 2 hours of placing them. After that, the order enters processing and cannot be changed. Please contact us immediately if you need to make changes.",
      },
    ],
  },
  {
    name: "Returns & Refunds",
    faqs: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unused products in their original packaging. Perishable items like ghee and consumables are non-returnable for hygiene reasons.",
      },
      {
        q: "How do I initiate a return?",
        a: "Go to 'My Orders' in your account, select the order, and click 'Request Return'. Our team will review and approve your request within 24 hours. You'll receive instructions for shipping the item back.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 7-10 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.",
      },
      {
        q: "Who pays for return shipping?",
        a: "Return shipping costs are borne by the customer unless the return is due to our error (wrong item, defective product). In such cases, we'll provide a prepaid shipping label.",
      },
    ],
  },
  {
    name: "Products",
    faqs: [
      {
        q: "Are your products authentic?",
        a: "Yes! All our products are sourced directly from trusted artisans and farms. Our Agnihotra supplies are prepared following traditional Vedic methods. We guarantee authenticity and purity.",
      },
      {
        q: "How should I store the products?",
        a: "Ghee should be stored in a cool, dry place away from direct sunlight. Cow dung cakes should be kept dry. Copper items can be cleaned with lemon and salt to maintain their shine.",
      },
      {
        q: "Are your products cruelty-free?",
        a: "Yes, all our products are cruelty-free and ethically sourced. Our cow-based products come from sheltered, well-cared-for indigenous breeds.",
      },
      {
        q: "Do you offer wholesale pricing?",
        a: "Yes, we offer special pricing for temples, ashrams, and bulk orders. Please contact us at wholesale@vishwalifestyle.com for more information.",
      },
    ],
  },
  {
    name: "Payments",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major payment methods through Razorpay: UPI, Credit/Debit Cards, Net Banking, and Wallets (Paytm, PhonePe, etc.).",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are processed through Razorpay, India's most trusted payment gateway. We never store your card details on our servers.",
      },
      {
        q: "Do you offer Cash on Delivery?",
        a: "Currently, we do not offer Cash on Delivery. All orders must be prepaid. This helps us serve you better and reduces fraudulent orders.",
      },
      {
        q: "Can I use multiple payment methods?",
        a: "Each order can only be paid with one payment method. However, you can apply a promo code along with any payment method.",
      },
    ],
  },
  {
    name: "Account",
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign In' at the top of the page and select 'Create Account'. You can register with your email or sign up with Google for faster access.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Click 'Forgot Password' on the login page. Enter your email, and we'll send you a link to reset your password.",
      },
      {
        q: "Can I shop without creating an account?",
        a: "Yes! You can checkout as a guest. However, creating an account lets you track orders, save addresses, and earn loyalty points.",
      },
    ],
  },
];

// Generate all FAQs for structured data
const allFaqs = faqCategories.flatMap((category) =>
  category.faqs.map((faq) => ({
    question: faq.q,
    answer: faq.a,
  }))
);

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return faqCategories.map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((category) => category.faqs.length > 0);
  }, [searchQuery]);

  // Generate FAQ schema
  const faqSchema = generateFAQSchema(allFaqs);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <>
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white">
        {/* Hero */}
        <section className="bg-background-alt py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-serif mb-4">Frequently Asked Questions</h1>
            <p className="text-foreground-muted mb-8">
              Find answers to common questions about our products and services
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
              <input
                id="faq-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full border border-gray-200 pl-12 pr-4 py-4 focus:outline-none focus:border-accent-gold"
              />
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {/* Category Tabs */}
              <nav className="flex flex-wrap gap-2 mb-8" aria-label="FAQ categories">
                {faqCategories.map((category, idx) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setActiveCategory(idx);
                      setOpenFaq(null);
                    }}
                    aria-selected={activeCategory === idx}
                    className={`px-4 py-2 text-sm transition-colors ${activeCategory === idx
                      ? "bg-foreground text-white"
                      : "bg-background-alt hover:bg-gray-200"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>

              {/* FAQs */}
              <div className="space-y-4" role="region" aria-label="FAQ list">
                {(searchQuery ? filteredCategories : [faqCategories[activeCategory]]).map(
                  (category) =>
                    category.faqs.map((faq, idx) => {
                      const faqId = `${category.name}-${idx}`;
                      const isOpen = openFaq === faqId;

                      return (
                        <motion.div
                          key={faqId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border border-gray-200"
                        >
                          <h3>
                            <button
                              onClick={() => toggleFaq(faqId)}
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                              aria-expanded={isOpen}
                              aria-controls={`faq-answer-${faqId}`}
                            >
                              <span className="font-medium pr-8">{faq.q}</span>
                              <ChevronDown
                                size={20}
                                className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
                                  }`}
                                aria-hidden="true"
                              />
                            </button>
                          </h3>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                id={`faq-answer-${faqId}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                                role="region"
                                aria-labelledby={`faq-${faqId}`}
                              >
                                <p className="px-6 pb-6 text-foreground-muted">{faq.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                )}
              </div>

              {/* No Results */}
              {searchQuery && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-foreground-muted mb-4">
                    No results found for "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-accent-gold hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* Still Need Help */}
              <div className="mt-16 bg-background-alt p-8 text-center">
                <h2 className="font-serif text-2xl mb-4">Still have questions?</h2>
                <p className="text-foreground-muted mb-6">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-foreground text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>


      </div>
    </>
  );
}
