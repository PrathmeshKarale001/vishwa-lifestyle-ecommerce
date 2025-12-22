
import dotenv from 'dotenv';
import path from 'path';

// Load env vars before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedCategories() {
    console.log("Starting category seed...");

    // Dynamic imports to ensure env vars are loaded first
    const { createClient } = await import('next-sanity');
    const { apiVersion, dataset, projectId } = await import('../sanity/env');
    const { SHOP_CATEGORIES } = await import('../lib/shop-categories');

    if (!process.env.SANITY_WRITE_TOKEN) {
        console.error("Missing SANITY_WRITE_TOKEN in .env.local");
        process.exit(1);
    }

    const client = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token: process.env.SANITY_WRITE_TOKEN,
    });

    for (const cat of SHOP_CATEGORIES) {
        const doc = {
            _type: 'category',
            name: cat.title,
            slug: { _type: 'slug', current: cat.slug },
            description: `Shop for ${cat.title}`,
        };

        try {
            const id = `category-${cat.slug}`;
            const res = await client.createIfNotExists({ ...doc, _id: id });
            console.log(`✅ Category created/verified: ${res.name} (${res._id})`);
        } catch (err) {
            console.error(`❌ Failed to create category ${cat.title}:`, err);
        }
    }

    console.log("Category seed complete!");
}

seedCategories();
