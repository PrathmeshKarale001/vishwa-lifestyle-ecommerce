
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    apiVersion: '2023-01-01',
});

const CATEGORIES_TO_SEED = [
    { title: "Agnihotra & Essentials", slug: "agnihotra-essentials", items: ["Starter Kits", "Essentials", "Accessories", "Combos"] },
    { title: "Apparel", slug: "apparel", items: ["Men", "Women"] },
    { title: "Footwear", slug: "footwear", items: ["Men", "Women"] },
    { title: "Pooja Essentials", slug: "pooja-essentials", items: ["Idol", "Diya", "Aarti Lamp", "Lota", "Temple", "Chowki", "Aarti Thali", "Panch Aarti", "Samai"] },
    { title: "Home Essentials", slug: "home-essentials", items: ["Living Room", "Bedroom", "Kitchen", "Bathroomware", "Dinnerware"] },
    { title: "Bags & Accessories", slug: "bags-accessories", items: ["Women"] },
    { title: "Aromas", slug: "aromas", items: ["Incense", "Dhoop", "Havan Cups", "Candles"] },
    { title: "Crafts", slug: "crafts", items: ["Heritage Craft", "Design Plate", "Wall Clock", "Wall Painting", "Showpiece"] },
    { title: "Gems & Jewellers", slug: "gems-jewellers", items: ["Jewellery Box", "Bracelet"] },
    { title: "Vishwa Wellness", slug: "vishwa-wellness", items: ["Oil", "Lotion", "Shampoo", "Body Wash", "Face Pack", "Honey", "Chavanprasha", "Gulkand"] },
    { title: "Food", slug: "food", items: ["Grains", "Pulses", "Edible Oils", "Sweeteners & Salts", "Flours", "Spices", "Pre-Mixes", "Ready to Eat"] },
    { title: "Gifts & Combos", slug: "gifts-combos", items: [] }
];

async function seedCategories() {
    console.log('🚀 Seeding categories to Sanity...');

    for (const cat of CATEGORIES_TO_SEED) {
        const doc = {
            _type: 'category',
            _id: `category-${cat.slug}`,
            name: cat.title,
            slug: {
                _type: 'slug',
                current: cat.slug,
            },
            subCategories: cat.items,
            order: CATEGORIES_TO_SEED.indexOf(cat) * 10,
        };

        try {
            await client.createOrReplace(doc);
            console.log(`✅ Seeded Category: ${cat.title} (${cat.items.length} sub-categories)`);
        } catch (err) {
            console.error(`❌ Failed to seed ${cat.title}:`, err.message);
        }
    }

    console.log('✨ Seeding complete!');
}

seedCategories().catch(console.error);
