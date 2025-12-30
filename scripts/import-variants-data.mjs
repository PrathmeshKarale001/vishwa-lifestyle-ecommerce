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

const DRY_RUN = process.argv.includes('--dryrun');
if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE ENABLED - No changes will be made to Sanity');
}

// Debugging Auth
console.log('🔍 Auth Debug:');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Token Length (Write):', process.env.SANITY_WRITE_TOKEN?.length || 'MISSING');
console.log('Token Length (API):', process.env.SANITY_API_TOKEN?.length || 'MISSING');

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

        // Category Handling
        let categoryName = 'Apparel'; // Default to Apparel for Apparel file
        if (fileName === 'Footwear.xlsx') {
            categoryName = 'Footwear'; // Force Footwear for Footwear file
        }

        const categoryId = DRY_RUN ? 'dry-run-id' : await getOrCreateCategory(categoryName);

        // Size Mapping Logic
        const variants = rows.map(row => {
            let size = cleanText(row['Size '] || row['Size']);

            // Normalize Apparel Sizes
            if (fileName === 'Apparels.xlsx') {
                if (size.toLowerCase().includes('small')) size = 'S';
                else if (size.toLowerCase().includes('medium')) size = 'M';
                else if (size.toLowerCase().includes('large') && !size.toLowerCase().includes('extra')) size = 'L';
                else if (size.toLowerCase().includes('extra large') || size.toLowerCase() === 'xl') size = 'XL';
                else if (size.length > 2) size = size.substring(0, 2).trim().toUpperCase(); // Fallback
            }

            // Footwear Sizes are already numeric (37-41)

            return {
                _type: 'variant',
                _key: Math.random().toString(36).substr(2, 9),
                size: size,
                sku: cleanText(row['SKU']),
                price: parseFloat(row['MRP']) || 0,
                inventory: 100 // Default
            };
        });

        // Check if product already exists
        const slug = slugify(name, { lower: true, strict: true }).substring(0, 96);
        let existing = null;
        if (!DRY_RUN) {
            existing = await client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug });
        }

        if (existing) {
            console.log(`⏭️  Skipping existing product: ${name}`);
            continue;
        }

        const subCategory = cleanText(firstRow['SUB-CATEGORY'] || firstRow['SUB -CATEGORY']);
        const description = cleanText(firstRow['DESCRIPTION']);

        // SEO Generation
        const metaTitle = `${name} | Vishwa Lifestyle`.substring(0, 60);
        const metaDescription = (description || `Buy ${name} at Vishwa Lifestyle. Authentic and premium quality.`).substring(0, 160);

        const hsnCode = cleanText(firstRow['HSN Code'] || firstRow['HS Code'] || firstRow['HSN CODE']);
        const hsCode = cleanText(firstRow['HS CODE'] || firstRow['HS Code'] || firstRow['HS Code']);

        const doc = {
            _type: 'product',
            name,
            slug: { _type: 'slug', current: slug },
            sku: variants[0].sku,
            price: variants[0].price,
            category: { _type: 'reference', _ref: categoryId },
            subCategory: subCategory,
            description: description,
            variants: variants,
            brand: cleanText(firstRow['BRAND']),
            gstPercent: (parseFloat(firstRow['GST %']) * 100) || 0,
            hsnCode: hsnCode,
            hsCode: hsCode,
            department: cleanText(firstRow['DEPARTMENT (DOM / EXP)']),
            productType: cleanText(firstRow['TYPE OF PRODUCT (FG / RM / PKG)'])?.includes('FG') ? 'FG' : 'FG', // Default to FG
            weight: cleanText(firstRow['WEIGHT \nIN KG'] || firstRow['WEIGHT \r\nIN KG'] || firstRow['WEIGHT IN KG']),
            dimensions: cleanText(firstRow['DIMENSION IN CM  (LXBXH)'] || firstRow['DIMENSION IN CM (LXBXH)'] || firstRow['Dimensions']),
            inventory: variants.reduce((acc, v) => acc + v.inventory, 0),
            metaTitle,
            metaDescription,
            isNew: true, // Mark newly imported as new
        };

        if (DRY_RUN) {
            console.log(`🧪 [DRY RUN] Would create: ${name}`);
            console.log(`   - Category: ${categoryName}, Sub: ${subCategory}`);
            console.log(`   - Variants: ${variants.length} (${variants.map(v => v.size).join(', ')})`);
            importedCount++;
            continue;
        }

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
