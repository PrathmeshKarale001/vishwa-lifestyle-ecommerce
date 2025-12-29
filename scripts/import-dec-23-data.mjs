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
    'Accessories.xlsx',
    'Crafts.xlsx',
    'Gems & Jewellers.xlsx',
    'Home Essentials.xlsx',
    'Pooja Essentials.xlsx'
];

async function getExistingSkus() {
    console.log('🔍 Fetching existing SKUs...');
    const products = await client.fetch(`*[_type == "product"]{sku}`);
    return new Set(products.map(p => p.sku).filter(Boolean));
}

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

// Map spreadsheet headers to Sanity field names
const HEADER_MAP = {
    'SKU': 'sku',
    'PRODUCT NAME': 'name',
    'CATEGORY': 'categoryName', // Temporary, will be ref
    'SUB-CATEGORY': 'subCategory',
    'SUB -CATEGORY': 'subCategory',
    'Segments ': 'segments',
    'Segments': 'segments',
    'Sub -Segments ': 'subSegments',
    'Sub-Segments': 'subSegments',
    'TYPE OF PRODUCT (FG / RM / PKG)': 'productType',
    'DEPARTMENT (DOM / EXP)': 'department',
    'BRAND': 'brand',
    'MRP': 'price',
    'DESCRIPTION': 'description',
    'GST %': 'gstPercent',
    'HS CODE': 'hsCode',
    'HS Code': 'hsCode',
    'Type of Unit (Unit, KG, Litres)': 'unitType',
    'PACKAGING': 'packaging',
    'WEIGHT \r\nIN KG': 'weight',
    'WEIGHT IN KG': 'weight',
    'DIMENSION IN CM  (LXBXH)': 'dimensions',
    'DIMENSION IN CM (LXBXH)': 'dimensions',
    'Supplier Code': 'supplierCode',
    'SUPPLIER NAME': 'supplierName',
    'SUPPLIER Contact': 'supplierContact',
    'GTIN': 'gtin'
};

function cleanText(val) {
    if (val === undefined || val === null) return '';
    return String(val).trim();
}

/**
 * Attempt to match images locally
 * @param {string} sku 
 * @param {string} name 
 */
function findImageForProduct(sku, name) {
    // This is a simplified placeholder for the image matching logic.
    // In actual implementation, we'd search in public/products and Vishwa-Lifestyle Products.
    // For now, return null as we don't have a reliable automatic matching without folder crawl.
    return null;
}

async function importFile(fileName, existingSkus) {
    console.log(`\n📄 Processing: ${fileName}`);
    const filePath = path.join(DATA_FOLDER, fileName);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${data.length} rows`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
        const sku = cleanText(row['SKU']);
        // Handle potential duplicate column names (XLSX parser appends _1, _2 etc)
        const name = cleanText(row['PRODUCT NAME'] || row['PRODUCT NAME_1'] || row['Product Name']);

        if (!sku || !name) continue;

        if (existingSkus.has(sku)) {
            skippedCount++;
            continue;
        }

        const categoryName = cleanText(row['CATEGORY'] || row['CATEGORY_1'] || row['Category']);
        const categoryId = await getOrCreateCategory(categoryName || fileName.replace('.xlsx', ''));

        const doc = {
            _type: 'product',
            name,
            slug: { _type: 'slug', current: slugify(name, { lower: true, strict: true }).substring(0, 96) },
            sku,
            category: { _type: 'reference', _ref: categoryId },
            subCategory: cleanText(row['SUB-CATEGORY'] || row['SUB -CATEGORY']),
            segments: cleanText(row['Segments'] || row['Segments ']),
            subSegments: cleanText(row['Sub -Segments '] || row['Sub-Segments']),
            productType: cleanText(row['TYPE OF PRODUCT (FG / RM / PKG)']),
            department: cleanText(row['DEPARTMENT (DOM / EXP)']),
            brand: cleanText(row['BRAND']),
            price: parseFloat(row['MRP']) || 0,
            description: cleanText(row['DESCRIPTION']),
            gstPercent: parseFloat(row['GST %']) * 100 || 0,
            hsCode: cleanText(row['HS CODE'] || row['HS Code']),
            unitType: cleanText(row['Type of Unit (Unit, KG, Litres)']),
            packaging: cleanText(row['PACKAGING']),
            weight: cleanText(row['WEIGHT \r\nIN KG'] || row['WEIGHT IN KG']),
            dimensions: cleanText(row['DIMENSION IN CM  (LXBXH)'] || row['DIMENSION IN CM (LXBXH)'] || row['Dimensions']),
            supplierCode: cleanText(row['Supplier Code']),
            supplierName: cleanText(row['SUPPLIER NAME']),
            supplierContact: cleanText(row['SUPPLIER Contact']),
            gtin: cleanText(row['GTIN']),
            inventory: 100, // Default inventory
        };

        try {
            await client.create(doc);
            existingSkus.add(sku);
            importedCount++;
            if (importedCount % 10 === 0) console.log(`✅ Imported ${importedCount}...`);
        } catch (err) {
            console.error(`❌ Failed to import SKU ${sku}:`, err.message);
        }
    }

    console.log(`✨ Finished ${fileName}: Imported ${importedCount}, Skipped ${skippedCount}`);
}

async function main() {
    try {
        const existingSkus = await getExistingSkus();
        console.log(`📊 Found ${existingSkus.size} existing products in Sanity.`);

        for (const file of FILES_TO_IMPORT) {
            await importFile(file, existingSkus);
        }

        console.log('\n🚀 All imports completed successfully!');
    } catch (err) {
        console.error('💥 Fatal error during import:', err);
    }
}

main();
