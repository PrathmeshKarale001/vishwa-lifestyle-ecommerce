import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Use SANITY_API_TOKEN as it was verified to have write permissions and a valid session
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: token,
  apiVersion: '2024-01-01',
});

async function fixSlugs() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`🔍 Auditing product slugs (${isDryRun ? 'DRY RUN' : 'LIVE UPDATE'})...`);
  
  try {
    const products = await client.fetch(`*[_type == "product"]{_id, name, "slug": slug.current}`);
    
    const toUpdate = products.filter(p => {
      if (!p.slug) return true;
      const newSlug = slugify(p.name, { lower: true, strict: true }).substring(0, 96);
      return p.slug !== newSlug;
    });
    
    console.log(`📊 Total products: ${products.length}`);
    console.log(`🛠️  Products to fix: ${toUpdate.length}`);
    
    if (toUpdate.length === 0) {
      console.log('✨ All slugs are already correct!');
      return;
    }

    for (const p of toUpdate) {
      const newSlug = slugify(p.name, { lower: true, strict: true }).substring(0, 96);
      console.log(`- "${p.name}": "${p.slug}" -> "${newSlug}"`);
      
      if (!isDryRun) {
        try {
          await client
            .patch(p._id)
            .set({ 'slug.current': newSlug })
            .commit();
          console.log(`  ✅ Updated!`);
        } catch (err) {
          console.error(`  ❌ Failed to update "${p.name}": ${err.message}`);
        }
      }
    }
    
    console.log(`\n✨ Done! ${isDryRun ? '' : 'All malformed slugs have been corrected.'}`);
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      console.error('❌ Auth Error: Your Sanity token is invalid or expired.');
      console.error('   Please check SANITY_API_TOKEN in .env.local');
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

fixSlugs().catch(console.error);
