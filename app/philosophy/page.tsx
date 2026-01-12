
"use client";

import { motion } from "framer-motion";

export default function PhilosophyPage() {
  return (
    <div className="bg-white pb-16">
      <div className="container mx-auto px-6 py-12 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Our Philosophy</h1>
          <div className="w-24 h-1 bg-accent-gold mx-auto mb-8"></div>
          <p className="text-lg text-foreground-muted leading-relaxed">
            At Vishwa Lifestyle, our philosophy is rooted in the ancient wisdom of the Vedas, harmonized with modern living. We believe that true well-being encompasses the body, mind, and the environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Sustainable Vedic Living</h2>
            <p className="text-foreground-muted leading-relaxed">
              Vishwa exists to support a complete Agnihotra-aligned lifestyle—not just ritual, but how one lives, eats, dresses, builds, farms, and thinks. We prioritize earth-friendly, sustainable, and nature-conscious products.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Artisan Supported</h2>
            <p className="text-foreground-muted leading-relaxed">
              Every creation is a testament to fair-trade practices. We support artisans and farmers who share our core values, ensuring that the ancient arts are preserved through ethical and sustainable livelihood.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Pure Formulations</h2>
            <p className="text-foreground-muted leading-relaxed">
              Our products are rooted in Ayurveda-based, herbal, and natural formulations. We strictly avoid commercial dilution, ensuring that every essential you bring into your home is pure, potent, and traditionally crafted.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Rhythm & Intention</h2>
            <p className="text-foreground-muted leading-relaxed">
              We believe in lifestyle essentials aligned with the rhythm of nature. Every product is curated with a specific intention—to facilitate the transition from low-energy living to a high-energy, Agnihotra-aligned lifestyle.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
