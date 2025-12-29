import { createClient } from '@sanity/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import slugify from 'slugify';

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

const DATA_FOLDER = path.join(process.cwd(), 'Vishwa Products (23Dec)');
const FILES_TO_IMPORT = [
    'Apparels.xlsx',
    'Footwear.xlsx'
];

async function getOrCreateCategory(name) {
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await client.fetch(`*[_type == "category" && slug.current == $slug][0]`, { slug });

    if (existing) return existing._id;

    console.log(`➕ Creating category: ${name}`);
    const created = await client.create({
        _type: 'category',
        name: name.trim(),
        slug: { _type: 'slug', current: slug }
    });
    return created._id;
}

function cleanText(val) {
    if (val === undefined || val === null) return '';
    return String(val).trim();
}

async function importFile(fileName) {
    console.log(`\n📄 Processing Variants for: ${fileName}`);
    const filePath = path.join(DATA_FOLDER, fileName);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Group rows by Product Name
    const productsMap = new Map();

    data.forEach(row => {
        const name = cleanText(row['PRODUCT NAME']);
        if (!name) return;

        if (!productsMap.has(name)) {
            productsMap.set(name, []);
        }
        productsMap.get(name).push(row);
    });

    console.log(`📊 Found ${productsMap.size} unique products with variants`);

    let importedCount = 0;

    for (const [name, rows] of productsMap.entries()) {
        // Base product info from the first row
        const firstRow = rows[0];
        const categoryName = cleanText(firstRow['CATEGORY']);
        const categoryId = await getOrCreateCategory(categoryName || fileName.replace('.xlsx', ''));

        // Check if product already exists
        const slug = slugify(name, { lower: true, strict: true }).substring(0, 96);
        const existing = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug });

        if (existing) {
            console.log(`⏭️  Skipping existing product: ${name}`);
            continue;
        }

        const variants = rows.map(row => ({
            _type: 'variant',
            _key: Math.random().toString(36).substr(2, 9),
            size: cleanText(row['Size']),
            sku: cleanText(row['SKU']),
            price: parseFloat(row['MRP']) || 0,
            inventory: 100 // Default
        }));

        const doc = {
            _type: 'product',
            name,
            slug: { _type: 'slug', current: slug },
            sku: variants[0].sku, // Main SKU from first variant
            price: variants[0].price,
            category: { _type: 'reference', _ref: categoryId },
            subCategory: cleanText(firstRow['SUB-CATEGORY'] || firstRow['SUB -CATEGORY']),
            description: cleanText(firstRow['DESCRIPTION']),
            variants: variants,
            brand: cleanText(firstRow['BRAND']),
            gstPercent: parseFloat(firstRow['GST %']) * 100 || 0,
            hsCode: cleanText(firstRow['HS CODE'] || firstRow['HS Code']),
            weight: cleanText(firstRow['WEIGHT \r\nIN KG'] || firstRow['WEIGHT IN KG']),
            dimensions: cleanText(firstRow['DIMENSION IN CM  (LXBXH)'] || firstRow['DIMENSION IN CM (LXBXH)'] || firstRow['Dimensions']),
            inventory: variants.reduce((acc, v) => acc + v.inventory, 0),
        };

        try {
            await client.create(doc);
            importedCount++;
            console.log(`✅ Created ${name} with ${variants.length} variants`);
        } catch (err) {
            console.error(`❌ Failed to import ${name}:`, err.message);
        }
    }

    console.log(`✨ Finished ${fileName}: Imported ${importedCount} products.`);
}

async function main() {
    try {
        for (const file of FILES_TO_IMPORT) {
            await importFile(file);
        }
        console.log('\n🚀 Variant imports completed!');
    } catch (err) {
        console.error('💥 Fatal error:', err);
    }
}

main();
