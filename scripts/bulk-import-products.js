/**
 * Bulk Import Products to Sanity
 * 
 * Usage:
 * 1. Export your Google Doc as CSV
 * 2. Place it in the root directory as 'products.csv'
 * 3. Run: node scripts/bulk-import-products.js
 * 
 * CSV Format (with headers):
 * name,slug,price,description,category,inventory,sku,isNew,isBestSeller,tags,features,ritualSignificance
 * 
 * Or use JSON format (products.json):
 * [
 *   {
 *     "name": "Agnihotra Kit",
 *     "slug": "agnihotra-kit",
 *     "price": 2100,
 *     "description": "Complete kit...",
 *     "category": "ritual",
 *     "inventory": 15,
 *     "sku": "VL-001",
 *     "isNew": false,
 *     "isBestSeller": true,
 *     "tags": ["ritual", "essential"],
 *     "features": ["Copper Pyramid", "Cow Dung Cakes"],
 *     "ritualSignificance": "Agnihotra is performed..."
 *   }
 * ]
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // You'll need to create a token in Sanity
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-28',
});

// Parse CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const product = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Handle boolean fields
      if (header === 'isNew' || header === 'isBestSeller') {
        value = value.toLowerCase() === 'true' || value === '1' || value === 'yes';
      }
      
      // Handle number fields
      if (header === 'price' || header === 'inventory' || header === 'rating' || header === 'reviewCount') {
        value = value ? parseFloat(value) : undefined;
      }
      
      // Handle array fields (comma-separated in CSV)
      if (header === 'tags' || header === 'features') {
        value = value ? value.split(';').map(v => v.trim()).filter(v => v) : [];
      }
      
      product[header] = value;
    });
    
    return product;
  });
}

// Parse JSON
function parseJSON(jsonContent) {
  return JSON.parse(jsonContent);
}

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Transform product data to Sanity format
function transformProduct(product) {
  return {
    _type: 'product',
    name: product.name,
    slug: {
      _type: 'slug',
      current: generateSlug(product.slug || product.name),
    },
    price: product.price,
    description: product.description || '',
    category: product.category || 'ritual', // Default category or handle reference
    inventory: product.inventory !== undefined ? product.inventory : 0,
    tags: product.tags || [],
    features: product.features || [],
    ritualSignificance: product.ritualSignificance || '',
    isNew: product.isNew || false,
    isBestSeller: product.isBestSeller || false,
    rating: product.rating,
    reviewCount: product.reviewCount,
    // Note: Images need to be uploaded separately or use URLs
    // You can add image URLs in your CSV/JSON and handle them here
  };
}

// Upload products to Sanity
async function uploadProducts(products, dryRun = false) {
  const transformed = products.map(transformProduct);
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN - Would import:');
    transformed.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ₹${p.price}`);
    });
    console.log(`\nTotal: ${transformed.length} products`);
    return;
  }
  
  console.log(`\n📦 Importing ${transformed.length} products...\n`);
  
  let success = 0;
  let failed = 0;
  
  // Import in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);
    
    try {
      const mutations = batch.map(product => ({
        create: product,
      }));
      
      const result = await client.mutate(mutations);
      success += batch.length;
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)`);
    } catch (error) {
      console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      failed += batch.length;
      
      // Try individual imports if batch fails
      for (const product of batch) {
        try {
          await client.create(product);
          success++;
          failed--;
          console.log(`  ✅ Imported: ${product.name}`);
        } catch (err) {
          console.error(`  ❌ Failed: ${product.name} - ${err.message}`);
        }
      }
    }
  }
  
  console.log(`\n✨ Import complete!`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

// Main function
async function main() {
  console.log('🚀 Sanity Bulk Product Importer\n');
  
  // Check for API token
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN environment variable is required');
    console.log('\nTo get a token:');
    console.log('1. Go to https://sanity.io/manage');
    console.log('2. Select your project');
    console.log('3. Go to API > Tokens');
    console.log('4. Create a new token with Editor permissions');
    console.log('5. Add it to your .env.local: SANITY_API_TOKEN=your_token_here\n');
    process.exit(1);
  }
  
  // Check for project ID
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is required');
    process.exit(1);
  }
  
  // Find input file
  const csvPath = path.join(process.cwd(), 'products.csv');
  const jsonPath = path.join(process.cwd(), 'products.json');
  
  let products = [];
  let fileType = '';
  
  if (fs.existsSync(csvPath)) {
    console.log('📄 Found products.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    products = parseCSV(content);
    fileType = 'csv';
  } else if (fs.existsSync(jsonPath)) {
    console.log('📄 Found products.json');
    const content = fs.readFileSync(jsonPath, 'utf-8');
    products = parseJSON(content);
    fileType = 'json';
  } else {
    console.error('❌ Error: No products.csv or products.json found in root directory');
    console.log('\nPlease create one of these files:');
    console.log('1. products.csv - Export from Google Sheets as CSV');
    console.log('2. products.json - JSON array of products\n');
    process.exit(1);
  }
  
  console.log(`📊 Found ${products.length} products`);
  
  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const answer = await new Promise((resolve) => {
    rl.question('\nDo a dry run first? (y/n): ', resolve);
  });
  
  if (answer.toLowerCase() === 'y') {
    await uploadProducts(products, true);
    
    const proceed = await new Promise((resolve) => {
      rl.question('\nProceed with actual import? (y/n): ', resolve);
    });
    
    if (proceed.toLowerCase() === 'y') {
      await uploadProducts(products, false);
    } else {
      console.log('Import cancelled.');
    }
  } else {
    const confirm = await new Promise((resolve) => {
      rl.question('\nProceed with import? (y/n): ', resolve);
    });
    
    if (confirm.toLowerCase() === 'y') {
      await uploadProducts(products, false);
    } else {
      console.log('Import cancelled.');
    }
  }
  
  rl.close();
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

