
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
            <h2 className="text-2xl font-serif text-foreground">Symbiosis with Nature</h2>
            <p className="text-foreground-muted leading-relaxed">
              We see ourselves not as conquerors of nature but as integral parts of it. Our products and practices, like Agnihotra, are designed to heal the atmosphere, which in turn heals the mind and body. This symbiotic relationship is the cornerstone of our existence.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Holistic Wellness</h2>
            <p className="text-foreground-muted leading-relaxed">
              Wellness is not just the absence of disease; it is a state of vibrant health and inner balance. We advocate for a lifestyle that nourishes the soul through spiritual practices, the body through pure ingredients, and the mind through positive vibrations.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Authenticity & Tradition</h2>
            <p className="text-foreground-muted leading-relaxed">
              In a world of fast-paced changes, we hold onto the timeless truths. Our commitment to authenticity ensures that every product, from our copper pyramids to our herbal supplements, is crafted with strict adherence to traditional methods and purity.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif text-foreground">Universal Oneness</h2>
            <p className="text-foreground-muted leading-relaxed">
              Vasudhaiva Kutumbakam — The World is One Family. Our philosophy extends beyond boundaries of caste, creed, or nation. We aim to share the gift of Vedic wisdom with every human being, fostering a global community united by peace and love.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
