const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
});

async function getExistingSkus() {
    try {
        const products = await client.fetch(`*[_type == "product"]{sku, "variantSkus": variants[].sku}`);
        const skus = new Set();
        products.forEach(p => {
            if (p.sku) skus.add(p.sku);
            if (p.variantSkus) {
                p.variantSkus.forEach(vSku => skus.add(vSku));
            }
        });
        console.log(JSON.stringify(Array.from(skus)));
    } catch (error) {
        console.error('Error fetching SKUs:', error.message);
        process.exit(1);
    }
}

getExistingSkus();
