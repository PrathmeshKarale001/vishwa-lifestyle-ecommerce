"use client";

import { motion } from "framer-motion";
import { Heart, Users, Sprout, Home } from "lucide-react";


const timeline = [
    {
        year: "2018",
        title: "The Beginning",
        description: "Founded by a group of Agnihotra practitioners seeking to make Vedic rituals accessible to modern households.",
    },
    {
        year: "2019",
        title: "First Products",
        description: "Launched our first Agnihotra starter kits, handcrafting each copper pyramid with traditional methods.",
    },
    {
        year: "2021",
        title: "Expanding the Vision",
        description: "Introduced lifestyle products—candles, decor, and apparel—bringing Vedic philosophy beyond rituals.",
    },
    {
        year: "2023",
        title: "Community Growth",
        description: "Reached 10,000+ homes across India, creating a network of conscious living practitioners.",
    },
    {
        year: "2025",
        title: "Vishwa Lifestyle Today",
        description: "A complete ecosystem of Vedic living products, workshops, and a thriving community.",
    },
];

const values = [
    {
        icon: Heart,
        title: "Authenticity",
        description: "Every product is rooted in genuine Vedic knowledge, not trends or aesthetics alone.",
    },
    {
        icon: Sprout,
        title: "Sustainability",
        description: "We honor the earth through ethical sourcing, minimal waste, and supporting local artisans.",
    },
    {
        icon: Users,
        title: "Community",
        description: "We're building a family of conscious individuals who believe in intentional, mindful living.",
    },
    {
        icon: Home,
        title: "Sacred Spaces",
        description: "Our mission is to help you transform your home into a sanctuary of peace and purity.",
    },
];

export default function StoryPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center bg-black text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{
                        backgroundImage:
                            "url(/products/3.jpg)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="relative z-10 text-center px-6 max-w-4xl"
                >
                    <span className="text-accent-gold text-sm tracking-[0.3em] uppercase mb-6 block">
                        Our Journey
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
                        Reviving Ancient Wisdom<br />for Modern Homes
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed">
                        A story of tradition, community, and the mission to bring Vedic purity into everyday life
                    </p>
                </motion.div>
            </section>

            {/* Origin Story */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full lg:w-1/2"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-2xl">
                                <img
                                    src="/products/34.jpg"
                                    alt="Agnihotra ritual"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full lg:w-1/2"
                        >
                            <span className="text-accent-gold text-sm tracking-[0.2em] uppercase mb-4 block">
                                How It Started
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                                From a Small Fire<br />
                                <span className="text-accent-sage italic">to a Movement</span>
                            </h2>
                            <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
                                <p>
                                    In 2018, a small group of us gathered around an Agnihotra fire at sunrise. We had all experienced the profound calm, the mental clarity, and the subtle shift in energy that this ancient Vedic ritual brought into our lives.
                                </p>
                                <p>
                                    But we noticed a problem: sourcing authentic materials was nearly impossible. Copper pyramids were expensive or poorly made. Organic cow dung cakes were hard to find. Pure cow ghee from indigenous breeds was a rarity.
                                </p>
                                <p>
                                    And so, <strong>Vishwa Lifestyle</strong> was born—not as a business, but as a mission to make Vedic living accessible, authentic, and beautiful.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 bg-background-alt">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Journey</h2>
                        <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                            From humble beginnings to a thriving community
                        </p>
                    </motion.div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Timeline Line */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent-gold/20" />

                        <div className="space-y-16">
                            {timeline.map((item, index) => (
                                <motion.div
                                    key={item.year}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                >
                                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                        <span className="inline-block text-5xl font-serif text-accent-gold mb-3">
                                            {item.year}
                                        </span>
                                        <h3 className="text-2xl font-serif mb-3">{item.title}</h3>
                                        <p className="text-foreground-muted leading-relaxed">{item.description}</p>
                                    </div>

                                    <div className="hidden md:flex w-2/12 justify-center">
                                        <div className="w-4 h-4 rounded-full bg-accent-gold border-4 border-background-alt relative z-10" />
                                    </div>

                                    <div className="w-full md:w-5/12" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-accent-gold text-sm tracking-[0.2em] uppercase mb-4 block">
                            What We Stand For
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Core Values</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center group"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-accent-gold rounded-full group-hover:bg-accent-gold transition-all duration-300">
                                    <value.icon className="text-accent-gold group-hover:text-white transition-colors duration-300" size={32} />
                                </div>
                                <h3 className="text-xl font-serif mb-3">{value.title}</h3>
                                <p className="text-foreground-muted leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-24 bg-accent-sage text-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-serif mb-8">
                                Our Vision: Har Ghar Agnihotra
                            </h2>
                            <p className="text-white/90 text-xl leading-relaxed mb-6">
                                "Agnihotra in every home."
                            </p>
                            <p className="text-white/80 text-lg leading-relaxed mb-10">
                                We dream of an India where every household experiences the peace, purity, and healing power of Vedic rituals. Where modern homes are sanctuaries. Where ancient wisdom lives alongside contemporary life.
                            </p>
                            <a
                                href="/shop"
                                className="inline-block bg-white text-accent-sage px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-accent-gold hover:text-white transition-colors duration-300"
                            >
                                Join the Movement
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Team/Community Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-8">
                            More Than a Brand
                        </h2>
                        <p className="text-foreground-muted text-lg leading-relaxed mb-12">
                            Vishwa Lifestyle is a family—a community of seekers, practitioners, and believers in conscious living. We host workshops, share knowledge, and support each other on this journey of mindful living.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            <div>
                                <p className="text-4xl font-serif text-accent-gold mb-2">10,000+</p>
                                <p className="text-sm uppercase tracking-wider text-foreground-muted">Homes Served</p>
                            </div>
                            <div>
                                <p className="text-4xl font-serif text-accent-gold mb-2">50+</p>
                                <p className="text-sm uppercase tracking-wider text-foreground-muted">Artisan Partners</p>
                            </div>
                            <div>
                                <p className="text-4xl font-serif text-accent-gold mb-2">100%</p>
                                <p className="text-sm uppercase tracking-wider text-foreground-muted">Authentic Materials</p>
                            </div>
                            <div>
                                <p className="text-4xl font-serif text-accent-gold mb-2">∞</p>
                                <p className="text-sm uppercase tracking-wider text-foreground-muted">Peace Created</p>
                            </div>
                        </div>
                        <a
                            href="/shop"
                            className="inline-block border-2 border-foreground px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-foreground hover:text-white transition-colors duration-300"
                        >
                            Start Your Journey
                        </a>
                    </motion.div>
                </div>
            </section>


        </main>
    );
}

