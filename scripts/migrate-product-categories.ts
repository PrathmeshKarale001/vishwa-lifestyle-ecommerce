
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from 'next-sanity';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SHOP_CATEGORIES = [
    { title: "Agnihotra & Essentials", slug: "agnihotra-essentials", items: ["Starter Kits", "Essentials", "Accessories", "Combos"] },
    { title: "Apparel", slug: "apparel", items: ["Men", "Women", "Footwear"] },
    { title: "Pooja Essentials", slug: "pooja-essentials", items: ["Idol", "Diya", "Aarti Lamp", "Lota", "Temple", "Chowki", "Aarti Thali", "Panch Aarti", "Samai"] },
    { title: "Home Essentials", slug: "home-essentials", items: ["Living Room", "Bedroom", "Kitchen", "Bathroomware"] },
    { title: "Aromas", slug: "aromas", items: ["Incense", "Dhoop", "Havan Cups", "Candles"] },
    { title: "Crafts", slug: "crafts", items: ["Heritage Craft", "Design Plate", "Wall Clock", "Wall Painting", "Showpiece", "Jewellery Box", "Bracelet"] },
    { title: "Vishwa Wellness", slug: "vishwa-wellness", items: ["Oil", "Lotion", "Shampoo", "Body Wash", "Face Pack", "Honey", "Chavanprasha", "Gulkand"] },
    { title: "Food", slug: "food", items: ["Grains", "Pulses", "Edible Oils", "Sweeteners & Salts", "Flours", "Spices", "Pre-Mixes", "Ready to Eat"] },
    { title: "Gifts & Combos", slug: "gifts-combos", items: [] }
];

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-01-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN,
});

async function migrateCategoryReferences() {
    console.log("Fetching products to update category references...");
    const products = await client.fetch(`*[_type == "product"] { _id, name, subCategory, "currentCategory": category->name }`);
    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;

    for (const product of products) {
        if (!product.subCategory) {
            console.log(`⏭️ Skipping "${product.name}" (no subCategory)`);
            continue;
        }

        // Find the matching category from SHOP_CATEGORIES
        const matchedCategory = SHOP_CATEGORIES.find(cat =>
            cat.items.includes(product.subCategory)
        );

        if (matchedCategory) {
            const categoryId = `category-${matchedCategory.slug}`;

            console.log(`🔄 Updating "${product.name}": "${product.subCategory}" -> Category: "${matchedCategory.title}" (${categoryId})`);

            await client.patch(product._id)
                .set({
                    category: {
                        _type: 'reference',
                        _ref: categoryId
                    }
                })
                .commit();

            updatedCount++;
        } else {
            console.log(`⚠️ No match found for "${product.subCategory}" in product "${product.name}"`);
        }
    }

    console.log(`Done! Updated ${updatedCount} products.`);
}

migrateCategoryReferences().catch(console.error);
