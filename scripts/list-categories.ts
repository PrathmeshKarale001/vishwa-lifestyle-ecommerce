
import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listCategories() {
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
        apiVersion: "2023-01-01",
        useCdn: false,
    });

    const categories = await client.fetch(`*[_type == "category"]{_id, name, "slug": slug.current}`);
    console.log(JSON.stringify(categories, null, 2));
}

listCategories().catch(console.error);
