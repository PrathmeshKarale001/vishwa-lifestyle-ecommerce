import { createClient } from '@sanity/client';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function listCategories() {
    const categories = await client.fetch(`*[_type == "category"]{ name, "slug": slug.current, _id }`);
    console.log('Existing Categories:');
    categories.forEach(c => console.log(`- ${c.name} (${c.slug}) [${c._id}]`));
}

listCategories().catch(console.error);
