
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    apiVersion: '2023-01-01',
});

// Helper to upload image and return reference
async function uploadImage(path) {
    const fullPath = join(process.cwd(), 'public', path);
    if (!existsSync(fullPath)) {
        console.warn(`⚠️ File not found: ${fullPath}`);
        return null;
    }

    try {
        const asset = await client.assets.upload('image', readFileSync(fullPath), {
            filename: path.split('/').pop()
        });
        return {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: asset._id
            }
        };
    } catch (err) {
        console.error(`❌ Failed to upload ${path}:`, err.message);
        return null;
    }
}

async function seedHomepage() {
    console.log('🚀 Seeding static content to Sanity singletons...');

    // 1. Hero Slides
    const slidesData = [
        {
            title: "Har Ghar Agnihotra",
            subtitle: "The Ritual of Peace",
            ctaText: "Shop Rituals",
            ctaLink: "/shop",
            imagePath: "/products/hero-swipe/6.png",
        },
        {
            title: "Vishwa Living",
            subtitle: "Pure. Sacred. Inspired.",
            ctaText: "Explore Lifestyle",
            ctaLink: "/shop",
            imagePath: "/hero-images/VISHWA WORLD.png",
            mobileImagePath: "/hero-images/1X1.jpg",
        },
        {
            title: "Experience the Vedic Way",
            subtitle: "From Rituals to Everyday Living",
            ctaText: "Discover More",
            ctaLink: "/shop",
            imagePath: "/products/hero-swipe/2.jpeg",
        },
    ];

    const heroSlides = [];
    for (const s of slidesData) {
        const image = await uploadImage(s.imagePath);
        const mobileImage = s.mobileImagePath ? await uploadImage(s.mobileImagePath) : null;
        heroSlides.push({
            title: s.title,
            subtitle: s.subtitle,
            ctaText: s.ctaText,
            ctaLink: s.ctaLink,
            image,
            mobileImage
        });
    }

    // 2. Philosophy & Story
    const philosophy = {
        essence: "Our Essence",
        heading: "The Philosophy Behind Vedic Lifestyle",
        body: "In Vedic culture, objects weren't just material - they carried energy, purity, and intention. A jar wasn't just storage, it was sanctity. A candle wasn't decor, it was light for the soul. A kurta wasn't clothing, it was a second skin of purity.",
        quote: "Vishwa's lifestyle collection brings this philosophy to your modern home.",
    };

    const storyImage = await uploadImage("/products/philosophy/1.jpg");
    const story = {
        heading: "Not Just Products. \nA Way of Living.",
        content: "In Vedic India, everything inside the home carried intention - from the clothes one wore, to the lamp one lit, to the jar that stored grains.\n\nVishwa revives this sacred philosophy for today's world - through products that add meaning, purity, and serenity to everyday life.",
        image: storyImage
    };

    // 3. Lifestyle Grid
    const gridItemsData = [
        { title: "Vishwa Kurta", path: "/products/home-productgrid/Kurta.png", link: "/shop?category=apparel" },
        { title: "Sacred Candles", path: "/products/home-productgrid/Candle.jpeg", link: "/shop?category=aromas&sub=Candles" },
        { title: "Artifacts & Decor", path: "/products/home-productgrid/artifacts.jpeg", link: "/shop?category=crafts" },
        { title: "Bags", path: "/products/home-productgrid/Bags.jpeg", link: "/shop?category=bags-accessories" },
        { title: "Other", path: "/products/home-productgrid/juti.png", link: "/shop?category=footwear" },
    ];

    const lifestyleGrid = [];
    for (const item of gridItemsData) {
        const image = await uploadImage(item.path);
        lifestyleGrid.push({
            title: item.title,
            image,
            link: item.link
        });
    }

    // 4. Benefits
    const benefits = [
        { icon: 'leaf', text: "Natural Materials" },
        { icon: 'sun', text: "Vedic Wisdom" },
        { icon: 'heart', text: "Handcrafted with Love" },
        { icon: 'check', text: "Ethically Sourced" },
    ];

    // Create HomePage Singleton
    const homeDoc = {
        _type: 'homePage',
        _id: 'homePage',
        title: 'Main Homepage',
        heroSlides,
        philosophy,
        story,
        lifestyleGrid,
        benefits
    };

    try {
        await client.createOrReplace(homeDoc);
        console.log('✅ Seeded Homepage Config');
    } catch (err) {
        console.error('❌ Failed to seed Homepage Config:', err.message);
    }

    // 5. Site Settings
    const logoFile = await uploadImage("/vishwalogo-v2.png");
    const settingsDoc = {
        _type: 'siteSettings',
        _id: 'siteSettings',
        title: "Vishwa Lifestyle | Modern Vedic Living",
        description: "A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.",
        brandDescription: "A Modern Vedic Lifestyle Brand. Bringing the purity of ancient rituals into your everyday living.",
        logo: logoFile,
        footerNavigation: [
            {
                _key: 'nav1',
                title: "Shop",
                links: [
                    { _key: 'link1', label: "All Products", url: "/shop" },
                    { _key: 'link2', label: "New Arrivals", url: "/shop?sort=newest" },
                    { _key: 'link3', label: "Best Sellers", url: "/shop?sort=bestselling" },
                ]
            },
            {
                _key: 'nav2',
                title: "About",
                links: [
                    { _key: 'link4', label: "Our Story", url: "/story" },
                    { _key: 'link5', label: "Philosophy", url: "/philosophy" },
                    { _key: 'link6', label: "Contact Us", url: "/contact" },
                    { _key: 'link7', label: "FAQ", url: "/faq" },
                ]
            }
        ],
        socialLinks: {
            instagram: "#",
            facebook: "#",
            twitter: "#",
            youtube: "#"
        },
        contactInfo: {
            email: "care@vishwalifestyle.com",
            phone: "+91 00000 00000",
            address: "Vishwa Lifestyle HQ, India"
        },
        announcementBar: {
            show: true,
            text: "✨ NEW YEAR SALE: Use Code VISHWA20 for Flat 20% Off! ✨",
            link: "/shop",
            backgroundColor: "#D4AF37",
            textColor: "#FFFFFF"
        }
    };

    try {
        await client.createOrReplace(settingsDoc);
        console.log('✅ Seeded Site Settings');
    } catch (err) {
        console.error('❌ Failed to seed Site Settings:', err.message);
    }

    console.log('✨ All content seeded! Checkout your Studio at https://vishwalifestyle.sanity.studio/');
}

seedHomepage().catch(console.error);
