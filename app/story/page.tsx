"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Sprout, Home } from "lucide-react";

const timeline = [
  {
    year: "1978",
    title: "The Foundation",
    description:
      "The work begins with Agnihotra materials and Vedic fire infused products under the guidance of Shree Shreekantji Maharaj.",
  },
  {
    year: "1980's–2000's",
    title: "Living the Practice",
    description:
      "Agnihotra and Vishwa Agnihotra lifestyle quietly spread through homes, farms, and communities, guided by lineage and discipline.",
  },
  {
    year: "2010's",
    title: "Growing Awareness",
    description:
      "As interest in conscious living rises globally, Vishwa Agnihotra lifestyle begins reaching seekers beyond geography and culture.",
  },
  {
    year: "2018",
    title: "Structuring the Mission",
    description:
      "Vishwa Lifestyle takes formal shape to make authentic, earth-friendly, fair-trade Vedic lifestyle products accessible without compromise.",
  },
  {
    year: "Today",
    title: "A Global Movement",
    description:
      "Vishwa serves Pan-India and reaches 45+ countries worldwide, supported by practitioners, farmers, and conscious consumers.",
  },
];

const values = [
  {
    icon: Sprout,
    title: "Earth-Friendly",
    description:
      "Sustainable and nature-conscious products created with deep respect for the planet's rhythm.",
  },
  {
    icon: Users,
    title: "Fair-Trade",
    description:
      "Supporting artisans and farmers through ethical partnerships and fair-trade creations.",
  },
  {
    icon: Heart,
    title: "Ayurveda-Based",
    description:
      "Herbal and natural formulations rooted in ancient wisdom for holistic well-being.",
  },
  {
    icon: Home,
    title: "Intentional Living",
    description:
      "Lifestyle essentials aligned with purity and intention, helping transform homes into sanctuaries.",
  },
];

export default function StoryPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${isMobile ? "/hero-images/1X1.jpg" : "/hero-images/VISHWA%20WORLD.png"})`,
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
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
            From a Sacred Fire
            <br />
            to a Global Movement
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed">
            A mission born in 1978 to protect a conscious, earth-friendly way of
            living
          </p>
        </motion.div>
      </section>

      {/* A Legacy Reimagined for Modern Living */}
      <section className="py-24 bg-white border-b border-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/products/philosophy/1.jpg"
                  alt="A Legacy Reimagined for Modern Living"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <span className="text-accent-gold text-sm tracking-[0.2em] uppercase mb-4 block font-medium">
                Our Heritage
              </span>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-foreground">
                A Legacy Reimagined
                <br />
                <span className="text-accent-sage italic">
                  for Modern Living
                </span>
              </h2>
              <div className="space-y-6 text-foreground-muted text-base md:text-lg leading-relaxed font-light">
                <p>
                  Long before sustainability became a movement, wellness became
                  an industry, or conscious living became a global aspiration,
                  the Vedic way of life showed humanity how to live in
                  harmony—with nature, with one another, and with ourselves.
                </p>
                <p>
                  For generations, this timeless wisdom has been preserved and
                  shared through the teachings and blessings of{" "}
                  <strong>Param Sadguru Shree Gajanan Maharaj</strong>, whose
                  revival of Agnihotra and the Five-Fold Path inspired a global
                  movement dedicated to creating healthier homes, happier
                  families, and a more harmonious world.
                </p>
                <p>
                  As this movement grew, so did a simple realization: people
                  were not only seeking knowledge—they wanted to live it.
                </p>
                <p>
                  They wanted products made with integrity, homes inspired by
                  nature, and everyday choices that reflected their values.
                </p>
                <p>
                  <strong>Vishwa Lifestyle</strong> was born from this vision.
                </p>
                <p>
                  Our mission is to bring the timeless principles of the Vedic
                  lifestyle into modern living through thoughtfully curated
                  products that are natural, sustainable, beautifully crafted,
                  and designed to enrich everyday life.
                </p>
                <p>
                  More than a lifestyle brand, Vishwa Lifestyle is an invitation
                  to rediscover a way of living where beauty, wellbeing, and
                  sustainability exist in perfect harmony.
                </p>
                <p className="text-accent-gold font-medium tracking-[0.1em] uppercase text-sm mt-8 block">
                  Inspired by Ancient Wisdom. Designed for Modern Living.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
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
                More Than a Brand
                <br />
                <span className="text-accent-sage italic">It Is a Mission</span>
              </h2>
              <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
                <p>
                  Vishwa did not begin as a brand. It began as a mission. In
                  1978, under the guidance of{" "}
                  <strong>Shree Shreekantji Maharaj</strong>, a quiet yet
                  powerful effort was initiated—to make authentic Agnihotra kits
                  and essentials available worldwide in its purest form.
                </p>
                <p>
                  This work was blessed with grace by{" "}
                  <strong>Param Sadguru Shree Gajanan Maharaj</strong>, whose
                  vision was never limited to ritual, but rooted in human
                  transformation and planetary healing.
                </p>
                <p>
                  Vishwa was born from a constant challenge: authentic materials
                  were disappearing. True copper pyramids, indigenous cow-based
                  products, pure ghee—everything essential to Vedic living was
                  becoming rare. We exist to protect a way of living that is
                  conscious, earth-friendly, and sustainable.
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              Our Journey
            </h2>
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
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                  >
                    <span className="inline-block text-5xl font-serif text-accent-gold mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-2xl font-serif mb-3">{item.title}</h3>
                    <p className="text-foreground-muted leading-relaxed">
                      {item.description}
                    </p>
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              Our Core Values
            </h2>
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
                  <value.icon
                    className="text-accent-gold group-hover:text-white transition-colors duration-300"
                    size={32}
                  />
                </div>
                <h3 className="text-xl font-serif mb-3">{value.title}</h3>
                <p className="text-foreground-muted leading-relaxed">
                  {value.description}
                </p>
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
                We dream of an India where every household experiences the
                peace, purity, and healing power of Vedic rituals. Where modern
                homes are sanctuaries. Where ancient wisdom lives alongside
                contemporary life.
              </p>
              <a
                href="/shop"
                className="inline-block bg-white text-accent-sage px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-accent-gold hover:text-white transition-colors duration-300"
              >
                Shop the Collection
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
              Vishwa Lifestyle is a family—a community of seekers,
              practitioners, and believers in conscious living. We host
              workshops, share knowledge, and support each other on this journey
              of mindful living.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <p className="text-4xl font-serif text-accent-gold mb-2">
                  10,000+
                </p>
                <p className="text-sm uppercase tracking-wider text-foreground-muted">
                  Homes Served
                </p>
              </div>
              <div>
                <p className="text-4xl font-serif text-accent-gold mb-2">50+</p>
                <p className="text-sm uppercase tracking-wider text-foreground-muted">
                  Artisan Partners
                </p>
              </div>
              <div>
                <p className="text-4xl font-serif text-accent-gold mb-2">
                  100%
                </p>
                <p className="text-sm uppercase tracking-wider text-foreground-muted">
                  Authentic Materials
                </p>
              </div>
              <div>
                <p className="text-4xl font-serif text-accent-gold mb-2">∞</p>
                <p className="text-sm uppercase tracking-wider text-foreground-muted">
                  Peace Created
                </p>
              </div>
            </div>
            <a
              href="/shop"
              className="inline-block border-2 border-foreground px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-foreground hover:text-white transition-colors duration-300"
            >
              Explore Shop
            </a>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section
        id="philosophy"
        className="py-24 bg-background-alt border-t border-gray-100"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-accent-gold text-sm tracking-[0.2em] uppercase mb-4 block font-medium">
              Our Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">
              Living in Harmony
            </h2>
            <div className="w-24 h-0.5 bg-accent-gold/40 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl font-serif text-foreground italic max-w-3xl mx-auto leading-relaxed">
              "At Vishwa Lifestyle, we believe that the way we live shapes the
              world we leave behind."
            </p>
          </motion.div>

          {/* Beliefs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Belief 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-serif text-accent-gold/30 mb-6 block font-bold">
                  01
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Ancient Sustainability
                </h3>
                <p className="text-foreground-muted leading-relaxed font-light text-sm sm:text-base">
                  We believe sustainability is not a modern trend—it is an
                  ancient way of life.
                </p>
              </div>
            </motion.div>

            {/* Belief 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-serif text-accent-gold/30 mb-6 block font-bold">
                  02
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Conscious Design
                </h3>
                <p className="text-foreground-muted leading-relaxed font-light text-sm sm:text-base">
                  We believe the products we bring into our homes should be
                  natural, responsibly made, timeless in design, and created to
                  enrich everyday living rather than encourage unnecessary
                  consumption.
                </p>
              </div>
            </motion.div>

            {/* Belief 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-serif text-accent-gold/30 mb-6 block font-bold">
                  03
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Earth's Circle
                </h3>
                <p className="text-foreground-muted leading-relaxed font-light text-sm sm:text-base">
                  We are committed to protecting the environment through
                  sustainable practices, thoughtful sourcing, eco-friendly
                  materials, responsible packaging, and a continuous journey
                  towards zero waste. We believe that what comes from the Earth
                  should, wherever possible, return gently to the Earth.
                </p>
              </div>
            </motion.div>

            {/* Belief 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between lg:col-span-1 lg:col-start-1"
            >
              <div>
                <span className="text-3xl font-serif text-accent-gold/30 mb-6 block font-bold">
                  04
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Artisanal Empowerment
                </h3>
                <p className="text-foreground-muted leading-relaxed font-light text-sm sm:text-base">
                  We believe in supporting traditional artisans, preserving
                  craftsmanship, empowering women entrepreneurs, strengthening
                  rural communities, and partnering with small businesses and
                  cottage industries that keep timeless skills and local
                  economies alive.
                </p>
              </div>
            </motion.div>

            {/* Belief 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between lg:col-span-2"
            >
              <div>
                <span className="text-3xl font-serif text-accent-gold/30 mb-6 block font-bold">
                  05
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Mindful Wellbeing
                </h3>
                <p className="text-foreground-muted leading-relaxed font-light text-sm sm:text-base">
                  Above all, we believe that wellbeing begins with the choices
                  we make every day. A beautiful home, meaningful rituals,
                  natural products, and conscious living have the power to
                  nurture healthier people, stronger communities, and a
                  healthier planet.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Commitment Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white border-2 border-accent-gold/30 p-8 md:p-12 lg:p-16 rounded-2xl text-center max-w-4xl mx-auto shadow-sm"
          >
            <span className="text-accent-gold text-xs sm:text-sm tracking-[0.2em] uppercase font-bold mb-6 block">
              Our Commitment
            </span>

            <div className="space-y-4 mb-8">
              <p className="text-lg md:text-xl font-serif text-foreground">
                To create with purpose.
              </p>
              <p className="text-lg md:text-xl font-serif text-foreground">
                To live in harmony.
              </p>
              <p className="text-lg md:text-xl font-serif text-foreground">
                To honour nature.
              </p>
              <p className="text-lg md:text-xl font-serif text-foreground">
                To inspire a better way of living.
              </p>
            </div>

            <div className="w-16 h-0.5 bg-accent-gold/30 mx-auto mb-8"></div>

            <h3 className="text-accent-sage font-serif italic text-xl md:text-2xl font-medium tracking-wide">
              Inspired by Ancient Wisdom. Designed for Modern Living.
            </h3>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
