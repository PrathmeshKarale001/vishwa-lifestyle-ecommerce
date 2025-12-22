
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { getFilteredProducts } from "./lib/sanity";

async function debug() {
    console.log("Testing getFilteredProducts with category='crafts'...");
    try {
        const res = await getFilteredProducts({
            category: "crafts",
            sub: "Heritage Craft",
            page: 1,
            limit: 12
        });
        console.log("Products found:", res.products?.length);
        console.log("Total matching:", res.total);
        if (res.products && res.products.length > 0) {
            console.log("First product category slug:", res.products[0].category);
            console.log("First product subCategory:", res.products[0].subCategory);
        }

        console.log("\nTesting with category='crafts' (no sub)...");
        const res2 = await getFilteredProducts({
            category: "crafts",
            page: 1,
            limit: 12
        });
        console.log("Products found:", res2.products?.length);
        console.log("Total matching:", res2.total);

    } catch (err) {
        console.error("Error during debug:", err);
    }
}

debug();
