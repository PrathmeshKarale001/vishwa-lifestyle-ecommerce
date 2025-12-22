
import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2023-01-01",
    useCdn: false,
});

async function testQuery() {
    const params = {
        category: "crafts",
        sub: "Heritage Craft",
        search: "",
        minPrice: 0,
        maxPrice: 100000,
        start: 0,
        end: 12
    };

    const filteredProductsQuery = `*[_type == "product" 
    && ($category == "all" || (
        ($category == "ritual" && category->slug.current in ["ritual", "lifestyle", "apparel", "combos"]) ||
        ($category != "ritual" && category->slug.current == $category)
       ))
    && ($sub == "" || subCategory == $sub)
    && ($search == "" || name match $search || description match $search)
    && price >= $minPrice && price <= $maxPrice
  ]`;

    const orderClause = "| order(_createdAt desc)";
    const projection = `{
        _id,
        name,
        "slug": slug.current,
        price,
        "category": category->slug.current,
        subCategory
    }`;

    const query = `{
        "products": ${filteredProductsQuery} ${orderClause} [0...12] ${projection},
        "total": count(${filteredProductsQuery})
    }`;

    console.log("Running query with params:", params);
    const result = await client.fetch(query, params);
    console.log("Result:", JSON.stringify(result, null, 2));
}

testQuery().catch(console.error);
