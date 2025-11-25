import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// Mock Data to Seed
const categories = [
    {
        _type: "category",
        title: "Ritual Essentials",
        description: "Pure ingredients for your daily Agnihotra practice.",
        image: "https://images.unsplash.com/photo-1602192509153-0b77cbcc402c?q=80&w=800&auto=format&fit=crop"
    },
    {
        _type: "category",
        title: "Vishwa Lifestyle",
        description: "Decor and tools for a mindful, Vedic home.",
        image: "https://images.unsplash.com/photo-1608508644127-5362d41a37c6?q=80&w=800&auto=format&fit=crop"
    },
    {
        _type: "category",
        title: "Vishwa Apparel",
        description: "Clothing treated with sacred Agnihotra ash.",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop"
    }
];

const products = [
    {
        _type: "product",
        title: "Agnihotra Kit",
        price: 2100,
        description: "Complete kit for daily Agnihotra practice.",
        categoryTitle: "Ritual Essentials",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        tag: "Best Seller"
    },
    {
        _type: "product",
        title: "Sacred Soy Wax Candle",
        price: 850,
        description: "Hand-poured soy wax candle with essential oils.",
        categoryTitle: "Vishwa Lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1608508644127-5362d41a37c6?q=80&w=800&auto=format&fit=crop",
        tag: "New"
    },
    {
        _type: "product",
        title: "Agnihotra-washed Kurta",
        price: 2500,
        description: "Organic cotton kurta washed in Agnihotra ash water.",
        categoryTitle: "Vishwa Apparel",
        imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop",
        tag: "Exclusive"
    }
];

export async function GET() {
    try {
        // 1. Create Categories
        const categoryIds: Record<string, string> = {};

        for (const cat of categories) {
            // Upload image from URL
            const imageRes = await fetch(cat.image);
            const imageBlob = await imageRes.blob();
            const imageAsset = await client.assets.upload('image', imageBlob, { filename: cat.title });

            const doc = await client.create({
                _type: 'category',
                title: cat.title,
                description: cat.description,
                image: {
                    _type: 'image',
                    asset: {
                        _type: "reference",
                        _ref: imageAsset._id
                    }
                }
            });
            categoryIds[cat.title] = doc._id;
            console.log(`Created category: ${cat.title}`);
        }

        // 2. Create Products
        for (const prod of products) {
            // Upload image
            const imageRes = await fetch(prod.imageUrl);
            const imageBlob = await imageRes.blob();
            const imageAsset = await client.assets.upload('image', imageBlob, { filename: prod.title });

            await client.create({
                _type: 'product',
                title: prod.title,
                price: prod.price,
                description: prod.description,
                tag: prod.tag,
                category: {
                    _type: 'reference',
                    _ref: categoryIds[prod.categoryTitle]
                },
                mainImage: {
                    _type: 'image',
                    asset: {
                        _type: "reference",
                        _ref: imageAsset._id
                    }
                }
            });
            console.log(`Created product: ${prod.title}`);
        }

        return NextResponse.json({ message: "Data seeded successfully!" });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json({ error: "Seeding failed", details: error }, { status: 500 });
    }
}
