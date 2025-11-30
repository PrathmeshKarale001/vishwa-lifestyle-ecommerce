"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Heart, Sparkles, Sun } from "lucide-react";
import Footer from "@/components/Footer";

const principles = [
  {
    icon: Leaf,
    title: "Natural Materials",
    description:
      "Every product is crafted from natural, sustainable materials that honor the earth and your wellbeing.",
  },
  {
    icon: Heart,
    title: "Handcrafted with Love",
    description:
      "Each piece is made with intention, care, and the wisdom of traditional artisans who understand the sacred.",
  },
  {
    icon: Sparkles,
    title: "Vedic Wisdom",
    description:
      "Rooted in ancient Vedic principles, our products carry the essence of purity, harmony, and spiritual connection.",
  },
  {
    icon: Sun,
    title: "Modern Living",
    description:
      "We bridge the gap between ancient wisdom and contemporary life, making sacred practices accessible to all.",
  },
];

const values = [
  {
    title: "Purity",
    description:
      "We believe in the power of purity - in materials, intentions, and the energy that surrounds us. Every product is chosen and crafted to maintain the highest standards of purity.",
  },
  {
    title: "Intention",
    description:
      "In Vedic culture, objects weren't just material - they carried energy, purpose, and intention. We infuse every product with positive intention and sacred purpose.",
  },
  {
    title: "Harmony",
    description:
      "Our products are designed to bring harmony to your home and life. From the sacred rituals to everyday living, we help you create spaces of peace and balance.",
  },
  {
    title: "Connection",
    description:
      "We connect you to the timeless wisdom of Vedic culture, helping you create meaningful rituals and practices that enrich your daily life.",
  },
];

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-background-alt flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-4 text-foreground"
          >
            Our Philosophy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground-muted text-lg font-light tracking-wide"
          >
            Not Just Products. A Way of Living.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <p className="text-lg text-foreground-muted leading-relaxed mb-6">
              In Vedic India, everything inside the home carried intention - from the clothes one
              wore, to the lamp one lit, to the jar that stored grains.
            </p>
            <p className="text-lg text-foreground-muted leading-relaxed">
              Vishwa revives this sacred philosophy for today's world - through products that add
              meaning, purity, and serenity to everyday life.
            </p>
          </motion.div>

          {/* Principles */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-center mb-12">Our Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {principles.map((principle, idx) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-background-alt p-8 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-accent-gold/10 rounded-full">
                      <principle.icon size={32} className="text-accent-gold" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl mb-3">{principle.title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-serif text-center mb-12">What We Stand For</h2>
            <div className="space-y-8">
              {values.map((value, idx) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-l-4 border-accent-gold pl-6"
                >
                  <h3 className="font-serif text-2xl mb-3">{value.title}</h3>
                  <p className="text-foreground-muted leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-background-alt p-12"
          >
            <h2 className="text-3xl font-serif mb-4">Experience the Difference</h2>
            <p className="text-foreground-muted mb-8 max-w-2xl mx-auto">
              Discover products that carry intention, purity, and the wisdom of ancient Vedic
              culture into your modern home.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-foreground text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
            >
              Explore Our Collection
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

