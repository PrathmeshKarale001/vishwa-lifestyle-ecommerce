
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

const FINAL_MAPPING = {
    '2jZWwrc9pxxlov2iy5tir8': 'category-gems-jewellers', // Gems & Jewellers
    'kjEdd2iZ2L3t1bV7zFRB2P': 'category-agnihotra-essentials', // Ritual Essentials -> Agnihotra
    'tEd8iBKhcj7OcpLBqGXgce': 'category-vishwa-wellness', // Bodycare -> Vishwa Wellness
};

async function finalCleanup() {
    console.log('🔄 Final migration of legacy categories...');

    for (const [oldId, newId] of Object.entries(FINAL_MAPPING)) {
        const products = await client.fetch('*[_type == "product" && category._ref == $oldId]{_id}', { oldId });
        console.log(`📦 Found ${products.length} products for ${oldId}.`);

        for (const product of products) {
            await client
                .patch(product._id)
                .set({ 'category._ref': newId })
                .commit();
            console.log(`✅ Updated product ${product._id} to ${newId}`);
        }

        try {
            await client.delete(oldId);
            console.log(`🗑️ Deleted old category: ${oldId}`);
        } catch (err) {
            console.warn(`⚠️ Could not delete ${oldId}:`, err.message);
        }
    }

    console.log('🎉 Final cleanup complete!');
}

finalCleanup().catch(console.error);
