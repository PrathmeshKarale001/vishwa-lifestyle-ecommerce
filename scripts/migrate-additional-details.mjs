
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

async function migrateAdditionalDetails() {
    console.log('🔍 Fetching products for migration...');

    // Fetch products where additionalDetails exists
    const products = await client.fetch(`*[_type == "product" && defined(additionalDetails)] {
        _id,
        name,
        additionalDetails
    }`);

    console.log(`📦 Found ${products.length} products to check.`);

    let updatedCount = 0;

    for (const product of products) {
        let isModified = false;
        const newDetails = product.additionalDetails.map((detail) => {
            // Check if content is a string
            if (typeof detail.content === 'string') {
                isModified = true;
                // Convert string to Portable Text block
                // Split by newlines to create multiple blocks if it looks like a list
                const lines = detail.content.split('\n').filter(line => line.trim() !== '');

                const blocks = lines.map(line => {
                    // Check if line starts with a bullet point
                    const trimmedLine = line.trim();
                    const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('*') || trimmedLine.startsWith('-');
                    const content = isBullet ? trimmedLine.replace(/^[•\*\-]\s*/, '') : trimmedLine;

                    return {
                        _type: 'block',
                        _key: Math.random().toString(36).substring(2, 11), // Generate unique key
                        children: [
                            {
                                _type: 'span',
                                _key: Math.random().toString(36).substring(2, 11),
                                text: content,
                                marks: []
                            }
                        ],
                        markDefs: [],
                        style: 'normal',
                        listItem: isBullet ? 'bullet' : undefined,
                        level: isBullet ? 1 : undefined
                    };
                });

                return {
                    ...detail,
                    content: blocks
                };
            }
            return detail;
        });

        if (isModified) {
            try {
                await client.patch(product._id)
                    .set({ additionalDetails: newDetails })
                    .commit();
                console.log(`✅ Migrated: ${product.name}`);
                updatedCount++;
            } catch (err) {
                console.error(`❌ Failed to migrate ${product.name}:`, err.message);
            }
        }
    }

    console.log(`✨ Migration complete! Updated ${updatedCount} products.`);
}

migrateAdditionalDetails().catch(console.error);
