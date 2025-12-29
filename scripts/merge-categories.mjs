import { createClient } from '@sanity/client';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
});

// Source -> Target Category IDs
const CATEGORY_MERGE_MAP = {
    'QmUBZ99X6fXBYmzDS2SEtG': 'category-home-essentials',     // Home Decor -> Home Essentials
    'Kvp6thepvh0yhb8VrdJmqJ': 'tEd8iBKhcj7OcpLBqGHITS',        // Bag -> Bags & Accessories
    'kjEdd2iZ2L3t1bV7zFRCKu': 'category-apparel',               // Vishwa Apparel -> Apparel
    'fPWdm1RArLKxxRbRaKmq3J': 'category-pooja-essentials',      // Pooja Needs -> Pooja Essentials
    'WiZ4juxYpBiyzlhKIeedIB': 'category-crafts',                // Handicraft -> Crafts
    'X0QbIMEIFZk3zMuIj5LvhR': 'category-gifts-combos',          // Combos & Gifts -> Gifts & Combos
    'X0QbIMEIFZk3zMuIj5Lufd': 'kjEdd2iZ2L3t1bV7zFRB2P',         // Lifestyle & Sacred Home -> Ritual Essentials
};

// Subcategory Cleanup Map
const SUBCATEGORY_FIX_MAP = {
    'kitchen': 'Kitchen',
    'heritage Craft': 'Heritage Craft',
    'Desing Plate': 'Design Plate',
    'Desing Plates': 'Design Plate',
    "Women's": 'Women',
};

async function migrate() {
    console.log('🚀 Starting Category Migration...');

    for (const [sourceId, targetId] of Object.entries(CATEGORY_MERGE_MAP)) {
        console.log(`\n📦 Merging ${sourceId} to ${targetId}...`);

        // 1. Find all products referencing the source category
        const products = await client.fetch(`*[_type == "product" && references($sourceId)]{_id, name, subCategory}`, { sourceId });
        console.log(`Found ${products.length} products to move.`);

        for (const product of products) {
            let patch = client.patch(product._id).set({
                category: { _type: 'reference', _ref: targetId }
            });

            // 2. Fix subcategory if needed
            if (product.subCategory && SUBCATEGORY_FIX_MAP[product.subCategory]) {
                console.log(`  🔧 Fixing subcategory: ${product.subCategory} -> ${SUBCATEGORY_FIX_MAP[product.subCategory]}`);
                patch = patch.set({ subCategory: SUBCATEGORY_FIX_MAP[product.subCategory] });
            }

            try {
                await patch.commit();
                console.log(`  ✅ Moved: ${product.name}`);
            } catch (err) {
                console.error(`  ❌ Failed to move product ${product._id}:`, err.message);
            }
        }

        // 3. Delete source category if it's not a protected one
        if (products.length >= 0) { // Even if 0 products, delete the duplicate
            try {
                console.log(`🗑️  Deleting source category: ${sourceId}`);
                await client.delete(sourceId);
            } catch (err) {
                console.error(`  ⚠️ Could not delete category ${sourceId}:`, err.message);
            }
        }
    }

    console.log('\n✨ All migrations completed!');
}

migrate().catch(console.error);
