
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkProducts() {
    console.log("Checking current products in Sanity...");

    // Dynamic import to handle potential ESM issues with sanity client
    const { createClient } = await import("@sanity/client");

    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
        apiVersion: "2023-01-01",
        useCdn: false,
    });

    const products = await client.fetch(`*[_type == "product"]{
        _id,
        name,
        category->{name, slug},
        subCategory,
        segments
    }`);

    console.log(`Found ${products.length} products.`);

    const subCategories = new Set();
    products.forEach((p: any) => {
        if (p.subCategory) subCategories.add(p.subCategory);
    });

    console.log("Current Sub-Categories in use:");
    console.log(Array.from(subCategories));

    console.log("\nSample Products:");
    products.slice(0, 10).forEach((p: any) => {
        console.log(`- ${p.name} | Cat: ${p.category?.name} | Sub: ${p.subCategory}`);
    });
}

checkProducts().catch(console.error);
