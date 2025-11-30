/**
 * Setup Categories in Sanity
 * 
 * This script creates the required categories in Sanity before importing products.
 * 
 * Usage:
 * node scripts/setup-categories.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-28',
});

// Categories to create
const categories = [
  {
    name: 'Ritual Essentials',
    slug: 'ritual',
    description: 'Sacred ritual items including Agnihotra kits, deepams, bells, and puja accessories.',
    order: 1,
  },
  {
    name: 'Lifestyle & Sacred Home',
    slug: 'lifestyle',
    description: 'Wellness products, home decor, and lifestyle accessories for mindful living.',
    order: 2,
  },
  {
    name: 'Vishwa Apparel',
    slug: 'apparel',
    description: 'Traditional and contemporary footwear, bags, and clothing for the conscious lifestyle.',
    order: 3,
  },
  {
    name: 'Combos & Gifts',
    slug: 'combos',
    description: 'Curated gift sets and product combinations for special occasions.',
    order: 4,
  },
];

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create or update category
async function createCategory(categoryData) {
  try {
    // Check if category already exists
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug: categoryData.slug }
    );

    if (existing) {
      console.log(`  ℹ️  Category "${categoryData.name}" already exists. Updating...`);
      
      // Update existing category
      const updated = await client
        .patch(existing._id)
        .set({
          name: categoryData.name,
          description: categoryData.description,
          order: categoryData.order,
        })
        .commit();
      
      console.log(`  ✅ Updated: ${categoryData.name} (${updated._id})`);
      return updated;
    } else {
      // Create new category
      const created = await client.create({
        _type: 'category',
        name: categoryData.name,
        slug: {
          _type: 'slug',
          current: categoryData.slug,
        },
        description: categoryData.description,
        order: categoryData.order,
      });
      
      console.log(`  ✅ Created: ${categoryData.name} (${created._id})`);
      return created;
    }
  } catch (error) {
    console.error(`  ❌ Error with "${categoryData.name}":`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Sanity Category Setup\n');
  
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
  
  console.log(`📦 Setting up ${categories.length} categories...\n`);
  
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
  };
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(`[${i + 1}/${categories.length}] ${category.name}`);
    
    try {
      const existing = await client.fetch(
        `*[_type == "category" && slug.current == $slug][0]`,
        { slug: category.slug }
      );
      
      if (existing) {
        await createCategory(category);
        results.updated++;
      } else {
        await createCategory(category);
        results.created++;
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      results.failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n✨ Category setup complete!`);
  console.log(`✅ Created: ${results.created}`);
  console.log(`🔄 Updated: ${results.updated}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log(`\n🎉 All categories are ready! You can now import products.`);
    console.log(`\nNext step: Run the product import script:`);
    console.log(`  npm run import:products:images`);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

