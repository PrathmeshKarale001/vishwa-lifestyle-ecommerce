
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp, staggerContainer } from "@/utils/animations";

export default function AboutPage() {
    return (
        <main className="bg-white min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Placeholder for banner image - using generic pattern or color if image not available */}
                    <div className="w-full h-full bg-stone-100" />
                </div>
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6"
                    >
                        Elevating Everyday Life Through Teachings from the 5 Fold Path
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-foreground-muted font-light"
                    >
                        Enhancing Modern Living and Rebuilding the Planet by blending Timeless Wisdom with Modern Scientific Knowledge.
                    </motion.p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-16 md:py-24 px-6 container mx-auto">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20"
                >
                    {/* Vision */}
                    <motion.div variants={fadeInUp} className="text-center md:text-left">
                        <div className="mb-6 flex justify-center md:justify-start">
                            <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-serif text-foreground mb-4">Our Vision</h2>
                        <div className="w-16 h-1 bg-accent-gold mb-6 mx-auto md:mx-0"></div>
                        <p className="text-foreground-muted leading-relaxed">
                            Vishwa envisions a world of universal oneness and profound inner peace. Our vision is to create a global community where the timeless wisdom of the Vedas guides individuals to channel their spiritual energy to manifest a new life.
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div variants={fadeInUp} className="text-center md:text-left">
                        <div className="mb-6 flex justify-center md:justify-start">
                            <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-serif text-foreground mb-4">Our Mission</h2>
                        <div className="w-16 h-1 bg-accent-gold mb-6 mx-auto md:mx-0"></div>
                        <p className="text-foreground-muted leading-relaxed">
                            Our mission at Vishwa is to disseminate the profound teachings of the 170+ year old Guru Lineage, enabling individuals to embark on a transformative journey and learn to heal themselves. Vishwa is committed to cultivating individuals who are spiritually awakened, environmentally aware and driven to create a better future through mindful living.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Values Section */}
            <section className="bg-stone-50 py-16 md:py-24 px-6">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Our Values</h2>
                        <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Value 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-lg shadow-sm text-center transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="text-5xl font-serif text-accent-gold/20 mb-4">V</div>
                            <h3 className="text-xl font-medium mb-3">Visionary Leadership</h3>
                            <p className="text-foreground-muted text-sm">
                                We are blessed to have exemplary leadership with divine vision for not just our community, but for the world at large. We are upholding this vision that inspires and guides our journey, in everything that we do.
                            </p>
                        </motion.div>

                        {/* Value 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-lg shadow-sm text-center transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="text-5xl font-serif text-accent-gold/20 mb-4">I</div>
                            <h3 className="text-xl font-medium mb-3">Inspiration</h3>
                            <p className="text-foreground-muted text-sm">
                                Cultivating a culture that inspires generations and will continue to do so by enabling individuals to become guided by the Divine.
                            </p>
                        </motion.div>

                        {/* Value 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-lg shadow-sm text-center transform hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="text-5xl font-serif text-accent-gold/20 mb-4">S</div>
                            <h3 className="text-xl font-medium mb-3">Spiritual Wisdom</h3>
                            <p className="text-foreground-muted text-sm">
                                Embracing the profound philosophy of the Guru Lineage.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
}
