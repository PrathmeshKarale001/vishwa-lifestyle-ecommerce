
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

async function cleanupDuplicates() {
    console.log('🔍 Fetching all categories to identify duplicates...');
    const allCategories = await client.fetch('*[_type == "category"]{_id, name, "slug": slug.current}');

    const slugToNewId = {};
    const oldIdsToNewId = {};
    const idsToDelete = [];

    // First pass: Identify "category-" prefixed IDs as the winners
    allCategories.forEach(cat => {
        if (cat._id.startsWith('category-')) {
            slugToNewId[cat.slug] = cat._id;
        }
    });

    // Second pass: Identify old IDs for the same slugs
    allCategories.forEach(cat => {
        if (!cat._id.startsWith('category-')) {
            const newId = slugToNewId[cat.slug];
            if (newId) {
                oldIdsToNewId[cat._id] = newId;
                idsToDelete.push(cat._id);
                console.log(`📍 Found duplicate: ${cat.name} (${cat._id}) -> ${newId}`);
            } else {
                // If it's a draft or another type of ID without a category- counterpart
                if (cat._id.startsWith('drafts.')) {
                    idsToDelete.push(cat._id);
                    console.log(`📍 Found draft to delete: ${cat.name} (${cat._id})`);
                }
            }
        }
    });

    if (Object.keys(oldIdsToNewId).length > 0) {
        console.log('🔄 Migrating products to new category IDs...');
        const products = await client.fetch('*[_type == "product" && category._ref in $oldIds]{_id, category}', {
            oldIds: Object.keys(oldIdsToNewId)
        });

        console.log(`📦 Found ${products.length} products to update.`);

        for (const product of products) {
            const oldId = product.category._ref;
            const newId = oldIdsToNewId[oldId];

            await client
                .patch(product._id)
                .set({ 'category._ref': newId })
                .commit();
            console.log(`✅ Updated product ${product._id}: ${oldId} -> ${newId}`);
        }
    }

    if (idsToDelete.length > 0) {
        console.log('🗑️ Deleting duplicate categories...');
        const transaction = client.transaction();
        idsToDelete.forEach(id => {
            transaction.delete(id);
        });
        await transaction.commit();
        console.log(`✨ Deleted ${idsToDelete.length} duplicate/old category documents.`);
    } else {
        console.log('✅ No duplicate categories found to delete.');
    }

    console.log('🎉 Cleanup complete!');
}

cleanupDuplicates().catch(console.error);
