/**
 * Bulk Product Import Script for Vishwa Lifestyle
 * 
 * This script reads product data from the folder structure and imports to Sanity.
 * Run with: node scripts/bulk-import-products.mjs
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Sanity client configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
    console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
    process.exit(1);
}

if (!token) {
    console.error('❌ Missing SANITY_WRITE_TOKEN in .env.local');
    console.error('   Add a write token from: https://www.sanity.io/manage/project/' + projectId + '/api#tokens');
    process.exit(1);
}

console.log(`📦 Using Sanity project: ${projectId} / dataset: ${dataset}\n`);

const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
});

// Products folder path
const PRODUCTS_BASE_PATH = path.join(__dirname, '..', 'Vishwa-Lifestyle Products');


// Category mapping (folder name -> Sanity category slug)
const CATEGORY_MAP = {
    'Bags & Accessories': 'bags-accessories',
    'Bodycare': 'body-care',
    'Handicraft': 'handicraft',
    'Home Decor': 'home-decor',
    'Pooja Needs': 'pooja-needs',
};

// Missing SKUs to exclude (provided by user)
const MISSING_SKUS = new Set([
    // Pooja Needs
    'VG-PN-03', 'VG-PN-08', 'VG-PN-16', 'VG-PN-18', 'VG-PN-19', 'VG-PN-20',
    'VG-PN-21', 'VG-PN-22', 'VG-PN-25', 'VG-PN-26', 'VG-PN-27', 'VG-PN-28',
    'VG-PN-29', 'VG-PN-30', 'VG-PN-34', 'VG-PN-35',
    // Bags & Accessories
    'VG-BG-07', 'VG-BG-09', 'VG-BG-10', 'VG-BG-11', 'VG-BG-12', 'VG-BG-13', 'VG-BG-14',
    // Home Decor
    'VG-HDR-01', 'VG-HDR-02', 'VG-HDR-03', 'VG-HDR-04', 'VG-HDR-05', 'VG-HDR-06',
    'VG-HDR-07', 'VG-HDR-08', 'VG-HDR-09', 'VG-HDR-10', 'VG-HDR-11', 'VG-HDR-12',
    'VG-HDR-13', 'VG-HDR-14', 'VG-HDR-15', 'VG-HDR-16', 'VG-HDR-17', 'VG-HDR-18',
    'VG-HDR-19', 'VG-HDR-20', 'VG-HDR-21', 'VG-HDR-22', 'VG-HDR-23', 'VG-HDR-24',
    'VG-HDR-25', 'VG-HDR-26', 'VG-HDR-27', 'VG-HDR-28', 'VG-HDR-29', 'VG-HDR-30',
    'VG-HDR-31', 'VG-HDR-32', 'VG-HDR-33', 'VG-HDR-34', 'VG-HDR-36', 'VG-HDR-37',
    'VG-HDR-38', 'VG-HDR-40', 'VG-HDR-41', 'VG-HDR-42', 'VG-HDR-43', 'VG-HDR-44',
    'VG-HDR-48', 'VG-HDR-49', 'VG-HDR-50', 'VG-HDR-51', 'VG-HDR-52', 'VG-HDR-56',
    'VG-HDR-57', 'VG-HDR-58', 'VG-HDR-59', 'VG-HDR-61', 'VG-HDR-62', 'VG-HDR-64',
    'VG-HDR-65', 'VG-HDR-66', 'VG-HDR-67', 'VG-HDR-69', 'VG-HDR-70', 'VG-HDR-71',
    'VG-HDR-72', 'VG-HDR-73', 'VG-HDR-74', 'VG-HDR-75',
    // Handicrafts
    'VG-HCR-01', 'VG-HCR-03', 'VG-HCR-04', 'VG-HCR-06', 'VG-HCR-08', 'VG-HCR-09',
    'VG-HCR-10', 'VG-HCR-11', 'VG-HCR-12', 'VG-HCR-15', 'VG-HCR-16', 'VG-HCR-18',
    'VG-HCR-19', 'VG-HCR-20', 'VG-HCR-26', 'VG-HCR-27', 'VG-HCR-31', 'VG-HCR-36',
    'VG-HCR-40', 'VG-HCR-41', 'VG-HCR-42', 'VG-HCR-43', 'VG-HCR-44', 'VG-HCR-45',
    'VG-HCR-46',
]);

// Maximum batch size (set high to import all)
const BATCH_LIMIT = 999;


/**
 * Generate a URL-friendly slug from a product name
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 96);
}

/**
 * Parse GST percentage from string (e.g., "0.05" -> 5)
 */
function parseGstPercent(gstStr) {
    if (!gstStr) return null;
    const num = parseFloat(gstStr);
    if (isNaN(num)) return null;
    // If value is less than 1, it's a decimal (0.05 = 5%)
    return num < 1 ? num * 100 : num;
}

/**
 * Parse price from string (e.g., "699" -> 699)
 */
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

/**
 * Upload an image to Sanity with unique _key
 */
async function uploadImage(imagePath, index = 0) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const asset = await client.assets.upload('image', imageBuffer, {
            filename: path.basename(imagePath),
        });
        // Generate a unique key for the image (required for Sanity arrays)
        const uniqueKey = `img_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            _type: 'image',
            _key: uniqueKey,
            asset: {
                _type: 'reference',
                _ref: asset._id,
            },
        };
    } catch (error) {
        console.error(`Failed to upload image: ${imagePath}`, error.message);
        return null;
    }
}


/**
 * Get or create a category in Sanity
 */
async function getOrCreateCategory(categoryName, categorySlug) {
    // Check if category exists
    const existing = await client.fetch(
        `*[_type == "category" && slug.current == $slug][0]`,
        { slug: categorySlug }
    );

    if (existing) {
        return existing._id;
    }

    // Create new category
    const newCategory = await client.create({
        _type: 'category',
        name: categoryName,
        slug: { _type: 'slug', current: categorySlug },
        order: Object.keys(CATEGORY_MAP).indexOf(categoryName),
    });

    console.log(`Created category: ${categoryName}`);
    return newCategory._id;
}

/**
 * Read and parse product info from a SKU folder
 */
function readProductInfo(skuFolderPath) {
    const jsonPath = path.join(skuFolderPath, 'product_info.json');

    if (!fs.existsSync(jsonPath)) {
        console.warn(`No product_info.json found in ${skuFolderPath}`);
        return null;
    }

    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error(`Failed to parse JSON in ${skuFolderPath}:`, error.message);
        return null;
    }
}

/**
 * Get all image files from a product's images folder
 */
function getProductImages(skuFolderPath) {
    const imagesFolder = path.join(skuFolderPath, 'images');

    if (!fs.existsSync(imagesFolder)) {
        return [];
    }

    return fs.readdirSync(imagesFolder)
        .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
        .map(file => path.join(imagesFolder, file))
        .sort(); // Sort to ensure consistent ordering
}

/**
 * Import a single product to Sanity
 */
async function importProduct(productInfo, categoryId, skuFolderPath) {
    const fields = productInfo.fields;
    const sku = fields['SKU'] || fields['SKU (Folder Name)'];
    const productName = fields['PRODUCT NAME'];

    if (!productName || !sku) {
        console.warn(`Skipping product with missing name or SKU in ${skuFolderPath}`);
        return null;
    }

    // Check if product already exists by SKU
    const existing = await client.fetch(
        `*[_type == "product" && sku == $sku][0]`,
        { sku }
    );

    if (existing) {
        console.log(`Product already exists: ${sku} - ${productName}`);
        return existing;
    }

    // Upload images (first image will be the main/hero image)
    const imagePaths = getProductImages(skuFolderPath);
    const uploadedImages = [];

    for (let i = 0; i < imagePaths.length; i++) {
        const uploaded = await uploadImage(imagePaths[i], i);
        if (uploaded) {
            uploadedImages.push(uploaded);
        }
    }

    // Build product document
    const productDoc = {
        _type: 'product',
        name: productName,
        slug: { _type: 'slug', current: generateSlug(productName) },
        sku: sku,
        price: parsePrice(fields['MRP']),
        description: fields['DESCRIPTION'] || '',
        category: { _type: 'reference', _ref: categoryId },
        subCategory: fields['SUB-CATEGORY'] || fields['SUB -CATEGORY'] || '',
        segments: fields['Segments'] || '',
        subSegments: fields['Sub -Segments'] || fields['Sub-Segments'] || '',
        productType: fields['TYPE OF PRODUCT (FG / RM / PKG)'] || '',
        department: fields['DEPARTMENT (DOM / EXP)'] || '',
        brand: fields['BRAND'] || 'Vishwa Lifestyle',
        gstPercent: parseGstPercent(fields['GST %']),
        hsCode: fields['HS Code'] || fields['HS CODE'] || '',
        hsnCode: fields['HSN Code'] || fields['HSN CODE'] || '',
        gs1Barcode: fields['GS1 BARCODE'] || '',
        gtin: fields['GTIN'] || '',
        shelfLife: fields['SHELF LIFE (DAYS)'] || '',
        size: fields['Size'] || '',
        unitType: fields['Type of Unit (Unit, KG, Litres)'] || '',
        packaging: fields['PACKAGING'] || '',
        weight: fields['WEIGHT IN KG'] || '',
        dimensions: fields['DIMENSION IN CM (LXBXH)'] || '',
        supplierCode: fields['Supplier Code'] || '',
        supplierName: fields['SUPPLIER NAME'] || '',
        supplierContact: fields['SUPPLIER Contact'] || '',
        inventory: 100, // Default inventory
        isNew: true,
        isBestSeller: false,
        rating: 4.5,
        reviewCount: 0,
    };

    // Add gallery images (first image = main/hero image)
    if (uploadedImages.length > 0) {
        productDoc.images = uploadedImages;
    }


    // Create product in Sanity
    try {
        const created = await client.create(productDoc);
        console.log(`✅ Created: ${sku} - ${productName}`);
        return created;
    } catch (error) {
        console.error(`❌ Failed to create ${sku}:`, error.message);
        return null;
    }
}

/**
 * Discover all products from the folder structure
 */
function discoverProducts() {
    const products = [];

    for (const [categoryFolder, categorySlug] of Object.entries(CATEGORY_MAP)) {
        const categoryPath = path.join(PRODUCTS_BASE_PATH, categoryFolder);

        if (!fs.existsSync(categoryPath)) {
            console.warn(`Category folder not found: ${categoryFolder}`);
            continue;
        }

        const skuFolders = fs.readdirSync(categoryPath)
            .filter(name => !name.startsWith('.'))
            .filter(name => fs.statSync(path.join(categoryPath, name)).isDirectory());

        for (const skuFolder of skuFolders) {
            // Skip missing SKUs
            if (MISSING_SKUS.has(skuFolder)) {
                console.log(`⏭️  Skipping missing SKU: ${skuFolder}`);
                continue;
            }

            products.push({
                categoryFolder,
                categorySlug,
                skuFolder,
                path: path.join(categoryPath, skuFolder),
            });
        }
    }

    return products;
}

/**
 * Main import function
 */
async function main() {
    console.log('🚀 Starting Bulk Product Import...\n');

    // Discover all products
    const allProducts = discoverProducts();
    console.log(`Found ${allProducts.length} products to import (after excluding missing SKUs)\n`);

    // Limit to batch size
    const productsToImport = allProducts.slice(0, BATCH_LIMIT);
    console.log(`Importing batch of ${productsToImport.length} products...\n`);

    let imported = 0;
    let failed = 0;

    for (const product of productsToImport) {
        console.log(`\nProcessing: ${product.skuFolder} (${product.categoryFolder})`);

        // Get or create category
        const categoryId = await getOrCreateCategory(product.categoryFolder, product.categorySlug);

        // Read product info
        const productInfo = readProductInfo(product.path);
        if (!productInfo) {
            failed++;
            continue;
        }

        // Import product
        const result = await importProduct(productInfo, categoryId, product.path);
        if (result) {
            imported++;
        } else {
            failed++;
        }
    }

    console.log(`\n✨ Import Complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Remaining: ${allProducts.length - BATCH_LIMIT} products`);
    console.log(`\nTo import more, increase BATCH_LIMIT in the script.`);
}

// Run the import
main().catch(console.error);
