const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false
});

async function runCleaner() {
    console.log('--- Database Integrity Cleaner ---');
    const categories = await client.fetch('*[_type == "category"]{_id, slug, name}');
    const appRef = categories.find(c => c.slug.current === 'apparel')?._id;
    const footRef = categories.find(c => c.slug.current === 'footwear')?._id;
    const bagsRef = categories.find(c => c.slug.current === 'bags-accessories')?._id;

    if (!appRef || !footRef || !bagsRef) {
        console.log('Critical categories missing. Check slugs.');
        return;
    }

    console.log(`IDs - Apparel: ${appRef}, Footwear: ${footRef}, Bags: ${bagsRef}`);

    // 1. Move Bags from Apparel
    const bagsInApparel = await client.fetch('*[_type == "product" && category._ref == $id && (name match "*Bag*" || name match "*Backpack*" || name match "*Tote*" || name match "*Sling*")]', { id: appRef });
    console.log(`Found ${bagsInApparel.length} misplaced bags.`);
    for (const b of bagsInApparel) {
        await client.patch(b._id).set({ category: { _type: 'reference', _ref: bagsRef } }).commit();
        console.log(`✅ [BAG MOVED] ${b.name}`);
    }

    // 2. Move Footwear from Apparel
    const footInApparel = await client.fetch('*[_type == "product" && category._ref == $id && (name match "*Mojari*" || name match "*Jutti*" || name match "*Chappal*" || name match "*Heels*" || name match "*Kolhapuri*")]', { id: appRef });
    console.log(`Found ${footInApparel.length} misplaced footwear.`);
    for (const f of footInApparel) {
        await client.patch(f._id).set({ category: { _type: 'reference', _ref: footRef } }).commit();
        console.log(`✅ [FOOTWEAR MOVED] ${f.name}`);
    }

    // 3. Subcategory Normalization
    const products = await client.fetch('*[_type == "product" && (category._ref == $app || category._ref == $foot)]', { app: appRef, foot: footRef });
    console.log(`Checking ${products.length} products for subcategory normalization...`);
    for (const p of products) {
        let newSub = p.subCategory;
        if (p.subCategory) {
            if (p.subCategory.includes("Women")) newSub = "Women";
            else if (p.subCategory.includes("Men")) newSub = "Men";
        }

        if (newSub && p.subCategory !== newSub) {
            await client.patch(p._id).set({ subCategory: newSub }).commit();
            console.log(`✅ [SUB REFIXED] ${p.name}: "${p.subCategory}" -> "${newSub}"`);
        }
    }

    console.log('--- Cleanup Finished ---');
}

runCleaner().catch(console.error);
