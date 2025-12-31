
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

async function fixSubCategoryIntegrity() {
    console.log('🔍 Fetching all categories and their sub-categories...');

    // 1. Fetch all categories and their defined subCategories
    const categories = await client.fetch(`*[_type == "category"] {
        _id,
        name,
        subCategories
    }`);

    console.log(`📊 Found ${categories.length} categories.`);

    // 2. Fetch all products with their categories
    const products = await client.fetch(`*[_type == "product" && defined(category)] {
        _id,
        name,
        subCategory,
        "categoryRef": category._ref
    }`);

    console.log(`📦 Found ${products.length} products to check.`);

    let fixedCount = 0;

    for (const product of products) {
        const productSub = product.subCategory;
        if (!productSub) continue;

        // Find the category this product belongs to
        const category = categories.find(c => c._id === product.categoryRef);
        if (!category || !category.subCategories) continue;

        // Check if the current subCategory is in the valid list
        const isValid = category.subCategories.includes(productSub);

        if (!isValid) {
            // Try to find a fuzzy match (e.g., "Women's" -> "Women")
            const normalizedProductSub = productSub.toLowerCase().replace(/['s]/g, '').trim();
            const bestMatch = category.subCategories.find(sub => {
                const normalizedSub = sub.toLowerCase().replace(/['s]/g, '').trim();
                return normalizedSub === normalizedProductSub || normalizedSub.startsWith(normalizedProductSub) || normalizedProductSub.startsWith(normalizedSub);
            });

            if (bestMatch && bestMatch !== productSub) {
                console.log(`🔧 Fixing: "${productSub}" -> "${bestMatch}" for product: ${product.name}`);
                try {
                    await client.patch(product._id)
                        .set({ subCategory: bestMatch })
                        .commit();
                    fixedCount++;
                } catch (err) {
                    console.error(`❌ Failed to fix ${product.name}:`, err.message);
                }
            } else {
                console.warn(`⚠️  No match found for sub-category "${productSub}" in category "${category.name}" for product: ${product.name}`);
            }
        }
    }

    console.log(`✨ Integrity fix complete! Fixed ${fixedCount} products.`);
}

fixSubCategoryIntegrity().catch(console.error);
