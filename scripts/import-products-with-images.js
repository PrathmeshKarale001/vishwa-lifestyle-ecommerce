/**
 * Import Products with Images to Sanity
 * 
 * This script imports products from a folder structure and uploads images to Sanity.
 * 
 * Folder Structure Options:
 * 
 * Option 1: Individual Product Folders
 * products/
 *   product-1/
 *     image.jpg (or image.png, etc.)
 *     image-2.jpg (additional images)
 *     data.json (product data)
 *   product-2/
 *     ...
 * 
 * Option 2: Flat Structure with JSON
 * products/
 *   product-1.json
 *   product-1.jpg
 *   product-1-2.jpg (additional images)
 *   product-2.json
 *   product-2.jpg
 *   ...
 * 
 * Option 3: CSV/JSON with Image Paths
 * products/
 *   products.csv or products.json
 *   images/
 *     product-1.jpg
 *     product-2.jpg
 *     ...
 * 
 * Usage:
 * 1. Place your products in a 'products' folder
 * 2. Run: node scripts/import-products-with-images.js
 * 
 * JSON Format (data.json or product-name.json):
 * {
 *   "name": "Agnihotra Kit",
 *   "slug": "agnihotra-kit", // optional, will be generated from name
 *   "price": 2100,
 *   "compareAtPrice": 2500, // optional
 *   "description": "Complete Agnihotra kit...",
 *   "category": "ritual", // or category reference ID
 *   "inventory": 15,
 *   "tags": ["ritual", "essential"],
 *   "features": ["Copper Pyramid", "Cow Dung Cakes"],
 *   "ritualSignificance": "Agnihotra is performed...",
 *   "isNew": false,
 *   "isBestSeller": true,
 *   "rating": 4.5,
 *   "reviewCount": 10,
 *   "image": "image.jpg", // optional, will auto-detect
 *   "images": ["image-2.jpg", "image-3.jpg"] // optional, additional images
 * }
 */

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
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-28',
});

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Check if file is an image
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// Find all image files in a directory
function findImages(dir) {
  const files = fs.readdirSync(dir);
  const images = files
    .filter(file => isImageFile(file))
    .map(file => path.join(dir, file))
    .sort(); // Sort to ensure consistent order
  
  return images;
}

// Upload image to Sanity
async function uploadImageToSanity(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);
    
    console.log(`  📤 Uploading image: ${filename}...`);
    
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
    });
    
    console.log(`  ✅ Uploaded: ${filename} (${asset._id})`);
    return asset;
  } catch (error) {
    console.error(`  ❌ Failed to upload ${path.basename(imagePath)}:`, error.message);
    throw error;
  }
}

// Upload multiple images
async function uploadImages(imagePaths) {
  const uploadedImages = [];
  
  for (const imagePath of imagePaths) {
    try {
      const asset = await uploadImageToSanity(imagePath);
      uploadedImages.push({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      });
    } catch (error) {
      console.warn(`  ⚠️  Skipping image: ${path.basename(imagePath)}`);
    }
  }
  
  return uploadedImages;
}

// Parse product data from JSON file
function parseProductData(jsonPath) {
  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing ${jsonPath}:`, error.message);
    return null;
  }
}

// Find product data file (JSON) in directory
function findProductData(dir) {
  const files = fs.readdirSync(dir);
  const jsonFile = files.find(file => 
    file.endsWith('.json') && 
    (file === 'data.json' || file.startsWith(path.basename(dir)))
  );
  
  return jsonFile ? path.join(dir, jsonFile) : null;
}

// Discover products from folder structure
function discoverProducts(productsDir) {
  const products = [];
  
  if (!fs.existsSync(productsDir)) {
    console.error(`❌ Products directory not found: ${productsDir}`);
    return products;
  }
  
  const entries = fs.readdirSync(productsDir, { withFileTypes: true });
  
  // Check if it's a flat structure (JSON files at root)
  const jsonFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.json'))
    .map(e => path.join(productsDir, e.name));
  
  if (jsonFiles.length > 0) {
    // Flat structure: JSON files with matching images
    console.log('📁 Detected flat structure (JSON files)');
    
    for (const jsonFile of jsonFiles) {
      const baseName = path.basename(jsonFile, '.json');
      const productData = parseProductData(jsonFile);
      
      if (!productData) continue;
      
      // Find images with same base name
      const images = findImages(productsDir)
        .filter(img => {
          const imgBase = path.basename(img, path.extname(img));
          return imgBase === baseName || imgBase.startsWith(baseName + '-');
        });
      
      products.push({
        data: productData,
        images: images,
        source: jsonFile,
      });
    }
  } else {
    // Folder structure: each product in its own folder
    console.log('📁 Detected folder structure');
    
    const folders = entries.filter(e => e.isDirectory());
    
    for (const folder of folders) {
      const folderPath = path.join(productsDir, folder.name);
      const dataFile = findProductData(folderPath);
      
      let productData = {};
      
      if (dataFile) {
        productData = parseProductData(dataFile) || {};
      } else {
        // No JSON file, use folder name as product name
        productData.name = folder.name
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Find all images in folder
      const images = findImages(folderPath);
      
      if (images.length > 0 || productData.name) {
        products.push({
          data: productData,
          images: images,
          source: folderPath,
        });
      }
    }
  }
  
  return products;
}

// Transform product data to Sanity format
async function transformProduct(product, uploadedImages) {
  const mainImage = uploadedImages.length > 0 ? uploadedImages[0] : null;
  const galleryImages = uploadedImages.slice(1);
  
  const transformed = {
    _type: 'product',
    name: product.data.name,
    slug: {
      _type: 'slug',
      current: generateSlug(product.data.slug || product.data.name),
    },
    price: product.data.price,
    description: product.data.description || '',
    inventory: product.data.inventory !== undefined ? product.data.inventory : 0,
    tags: product.data.tags || [],
    features: product.data.features || [],
    ritualSignificance: product.data.ritualSignificance || '',
    isNew: product.data.isNew || false,
    isBestSeller: product.data.isBestSeller || false,
  };
  
  // Add main image
  if (mainImage) {
    transformed.image = mainImage;
  }
  
  // Add gallery images
  if (galleryImages.length > 0) {
    transformed.images = galleryImages;
  }
  
  // Add optional fields
  if (product.data.compareAtPrice) {
    transformed.compareAtPrice = product.data.compareAtPrice;
  }
  
  if (product.data.rating !== undefined) {
    transformed.rating = product.data.rating;
  }
  
  if (product.data.reviewCount !== undefined) {
    transformed.reviewCount = product.data.reviewCount;
  }
  
  // Handle category (can be string slug or reference ID)
  if (product.data.category) {
    // Try to find category by slug first
    try {
      const categories = await client.fetch(
        `*[_type == "category" && slug.current == $slug][0]`,
        { slug: product.data.category }
      );
      
      if (categories) {
        transformed.category = {
          _type: 'reference',
          _ref: categories._id,
        };
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not resolve category: ${product.data.category}`);
    }
  }
  
  return transformed;
}

// Import products to Sanity
async function importProducts(products, dryRun = false) {
  if (dryRun) {
    console.log('\n🔍 DRY RUN - Would import:');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.data.name || 'Unnamed Product'}`);
      console.log(`   Images: ${p.images.length}`);
      console.log(`   Price: ₹${p.data.price || 'N/A'}`);
    });
    console.log(`\nTotal: ${products.length} products`);
    return;
  }
  
  console.log(`\n📦 Importing ${products.length} products...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productName = product.data.name || `Product ${i + 1}`;
    
    console.log(`\n[${i + 1}/${products.length}] Processing: ${productName}`);
    
    try {
      // Upload images first
      let uploadedImages = [];
      if (product.images.length > 0) {
        console.log(`  📷 Found ${product.images.length} image(s)`);
        uploadedImages = await uploadImages(product.images);
      } else {
        console.log(`  ⚠️  No images found for this product`);
      }
      
      // Transform and create product
      const transformed = await transformProduct(product, uploadedImages);
      
      // Check if product already exists (by slug)
      const existing = await client.fetch(
        `*[_type == "product" && slug.current == $slug][0]`,
        { slug: transformed.slug.current }
      );
      
      if (existing) {
        console.log(`  ⚠️  Product with slug "${transformed.slug.current}" already exists. Skipping...`);
        continue;
      }
      
      // Create product
      const created = await client.create(transformed);
      console.log(`  ✅ Created product: ${created._id}`);
      success++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`  ❌ Failed to import "${productName}":`, error.message);
      failed++;
    }
  }
  
  console.log(`\n✨ Import complete!`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

// Main function
async function main() {
  console.log('🚀 Sanity Product Importer with Images\n');
  
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
  
  // Find products directory
  const productsDir = path.join(process.cwd(), 'products');
  
  if (!fs.existsSync(productsDir)) {
    console.error(`❌ Products directory not found: ${productsDir}`);
    console.log('\nPlease create a "products" folder in the root directory.');
    console.log('See the script comments for folder structure options.\n');
    process.exit(1);
  }
  
  // Discover products
  console.log(`📂 Scanning: ${productsDir}\n`);
  const products = discoverProducts(productsDir);
  
  if (products.length === 0) {
    console.error('❌ No products found!');
    console.log('\nPlease ensure your products folder contains:');
    console.log('- Product folders with images and data.json files, OR');
    console.log('- JSON files with matching image files\n');
    process.exit(1);
  }
  
  console.log(`📊 Found ${products.length} product(s)\n`);
  
  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const answer = await new Promise((resolve) => {
    rl.question('Do a dry run first? (y/n): ', resolve);
  });
  
  if (answer.toLowerCase() === 'y') {
    await importProducts(products, true);
    
    const proceed = await new Promise((resolve) => {
      rl.question('\nProceed with actual import? (y/n): ', resolve);
    });
    
    if (proceed.toLowerCase() === 'y') {
      await importProducts(products, false);
    } else {
      console.log('Import cancelled.');
    }
  } else {
    const confirm = await new Promise((resolve) => {
      rl.question('\nProceed with import? (y/n): ', resolve);
    });
    
    if (confirm.toLowerCase() === 'y') {
      await importProducts(products, false);
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

