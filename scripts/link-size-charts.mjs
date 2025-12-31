
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

async function linkSizeCharts() {
    console.log('🔗 Linking products to size charts...');

    const products = await client.fetch(`*[_type == "product" && defined(category)] {
        _id,
        name,
        subCategory,
        "categorySlug": category->slug.current
    }`);

    console.log(`📦 Checking ${products.length} products...`);

    let linkedCount = 0;

    for (const product of products) {
        let chartId = null;

        const name = (product.name || '').toLowerCase();
        const sub = (product.subCategory || '').toLowerCase();
        const cat = (product.categorySlug || '').toLowerCase();
        const combinedText = `${name} ${sub}`;

        const isMen = /\bmen\b/i.test(combinedText);
        const isWomen = /\bwomen\b/i.test(combinedText);

        if (cat === 'apparel') {
            if (isMen && combinedText.includes('long')) {
                chartId = 'size-chart-mens-long-kurta';
            } else if (isMen && combinedText.includes('short')) {
                chartId = 'size-chart-mens-short-kurta';
            }
        } else if (cat === 'footwear') {
            if (isWomen) {
                chartId = 'size-chart-womens-footwear';
            } else if (isMen) {
                chartId = 'size-chart-mens-footwear';
            }
        }

        if (chartId) {
            console.log(`🎯 Match found: ${product.name} (${sub}) -> ${chartId}`);
            try {
                await client.patch(product._id)
                    .set({ sizeChart: { _type: 'reference', _ref: chartId } })
                    .commit();
                linkedCount++;
                console.log(`✅ Success`);
            } catch (err) {
                console.error(`❌ Failed ${product.name}:`, err.message);
            }
            // Small delay to prevent hitting rate limits
            await new Promise(r => setTimeout(r, 200));
        } else {
            // console.log(`⏩ No match for: ${product.name} (Cat: ${cat}, Sub: ${sub})`);
        }
    }

    console.log(`✨ Linking complete! Linked ${linkedCount} products.`);
}

linkSizeCharts();
