
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from 'next-sanity';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-01-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN,
});

const CATEGORY_MAPPING: Record<string, string> = {
    "lifestyle": "home-essentials",
    "pooja-needs": "pooja-essentials",
    "ritual": "pooja-essentials",
    "handicraft": "crafts",
    "bags-accessories": "apparel",
    "body-care": "vishwa-wellness"
};

async function finalMigration() {
    console.log("Fetching products to update legacy category references...");
    const products = await client.fetch(`*[_type == "product"] { _id, name, "catSlug": category->slug.current }`);
    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;

    for (const product of products) {
        const newSlug = CATEGORY_MAPPING[product.catSlug];

        if (newSlug) {
            const newCategoryId = `category-${newSlug}`;
            console.log(`🔄 Migrating "${product.name}": ${product.catSlug} -> ${newSlug} (${newCategoryId})`);

            await client.patch(product._id)
                .set({
                    category: {
                        _type: 'reference',
                        _ref: newCategoryId
                    }
                })
                .commit();
            updatedCount++;
        }
    }

    console.log(`Final migration complete! Updated ${updatedCount} products.`);
}

finalMigration().catch(console.error);
