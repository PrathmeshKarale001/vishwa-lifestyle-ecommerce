
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const subCategoryMapping: Record<string, string> = {
    "Women's": "Women",
    "Men's": "Men",
    "heritage Craft": "Heritage Craft",
    "Desing Plate": "Design Plate",
    "Read to Eat": "Ready to Eat",
    "heritage craft": "Heritage Craft",
    "Stone": "Heritage Craft", // Example fallback if we know the context
    "Starter Kits": "Living Room", // Placeholder mapping if needed, but better to be safe
};

async function migrateProducts() {
    console.log("Starting product subcategory migration...");

    const { createClient } = await import("@sanity/client");

    if (!process.env.SANITY_WRITE_TOKEN) {
        console.error("SANITY_WRITE_TOKEN is missing!");
        return;
    }

    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
        apiVersion: "2023-01-01",
        useCdn: false,
        token: process.env.SANITY_WRITE_TOKEN,
    });

    const products = await client.fetch(`*[_type == "product"]{
        _id,
        name,
        subCategory
    }`);

    console.log(`Checking ${products.length} products...`);

    let updatedCount = 0;
    const allowedSubCategories = [
        'Men', 'Women', 'Oil', 'Lotion', 'Shampoo', 'Body Wash', 'Face Pack',
        'Heritage Craft', 'Design Plate', 'Wall Clock', 'Wall Painting', 'Showpiece',
        'Jewellery Box', 'Bracelet', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroomware',
        'Idol', 'Diya', 'Aarti Lamp', 'Lota', 'Temple', 'Chowki', 'Aarti Thali',
        'Panch Aarti', 'Samai', 'Grains', 'Pulses', 'Edible Oils', 'Sweeteners & Salts',
        'Flours', 'Spices', 'Pre-Mixes', 'Ready to Eat', 'Honey', 'Chavanprasha', 'Gulkand'
    ];

    for (const product of products) {
        let newSubCategory = product.subCategory;

        // 1. Try direct mapping
        if (product.subCategory && subCategoryMapping[product.subCategory]) {
            newSubCategory = subCategoryMapping[product.subCategory];
        }
        // 2. Try case-insensitive match against allowed list
        else if (product.subCategory) {
            const match = allowedSubCategories.find(s => s.toLowerCase() === product.subCategory.toLowerCase());
            if (match) {
                newSubCategory = match;
            }
        }

        // If changed, update
        if (newSubCategory !== product.subCategory) {
            console.log(`Updating "${product.name}": "${product.subCategory}" -> "${newSubCategory}"`);
            await client.patch(product._id).set({ subCategory: newSubCategory }).commit();
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
}

migrateProducts().catch(console.error);
