
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    apiVersion: '2023-01-01',
});

const sizeCharts = [
    {
        _id: 'size-chart-mens-long-kurta',
        _type: 'sizeChart',
        title: "Men's Long Kurta",
        type: 'kurta',
        gender: 'men',
        headers: ["Size", "Chest (in)", "Shoulder (in)", "Length (in)", "Sleeve Length (in)"],
        rows: [
            { _key: 'row1', cells: ["S", "38", "16.5 - 17", "42 - 43", "23 - 24"] },
            { _key: 'row2', cells: ["M", "40", "17.5 - 18", "43 - 44", "24 - 25"] },
            { _key: 'row3', cells: ["L", "42", "18.5 - 19", "44 - 45", "25 - 26"] },
            { _key: 'row4', cells: ["XL", "44", "19.5 - 20", "45 - 46", "26 - 27"] },
        ]
    },
    {
        _id: 'size-chart-mens-short-kurta',
        _type: 'sizeChart',
        title: "Men's Short Kurta",
        type: 'kurta',
        gender: 'men',
        headers: ["Size", "Chest (in)", "Shoulder (in)", "Length (in)", "Sleeve Length (in)"],
        rows: [
            { _key: 'row1', cells: ["S", "38", "16.5 - 17", "27 - 28", "23 - 24"] },
            { _key: 'row2', cells: ["M", "40", "17.5 - 18", "28 - 29", "24 - 25"] },
            { _key: 'row3', cells: ["L", "42", "18.5 - 19", "29 - 30", "25 - 26"] },
            { _key: 'row4', cells: ["XL", "44", "19.5 - 20", "30 - 31", "26 - 27"] },
        ]
    },
    {
        _id: 'size-chart-womens-footwear',
        _type: 'sizeChart',
        title: "Women's Footwear",
        type: 'footwear',
        gender: 'women',
        headers: ["EURO", "To Fit Foot Length (cm)"],
        rows: [
            { _key: 'row1', cells: ["36", "22.5"] },
            { _key: 'row2', cells: ["37", "23.2"] },
            { _key: 'row3', cells: ["38", "24.0"] },
            { _key: 'row4', cells: ["39", "24.5"] },
            { _key: 'row5', cells: ["40", "25.0"] },
            { _key: 'row6', cells: ["41", "25.5"] },
        ]
    },
    {
        _id: 'size-chart-mens-footwear',
        _type: 'sizeChart',
        title: "Men's Footwear",
        type: 'footwear',
        gender: 'men',
        headers: ["UK", "To Fit Foot Length (cm)"],
        rows: [
            { _key: 'row2', cells: ["7", "26.6"] },
            { _key: 'row3', cells: ["8", "27.4"] },
            { _key: 'row4', cells: ["9", "28.2"] },
            { _key: 'row5', cells: ["10", "29.0"] },
            { _key: 'row6', cells: ["11", "30.0"] },
        ]
    }
];

async function seedSizeCharts() {
    console.log('🚀 Seeding size charts...');
    for (const chart of sizeCharts) {
        try {
            await client.createOrReplace(chart);
            console.log(`✅ Seeded: ${chart.title}`);
        } catch (err) {
            console.error(`❌ Error seeding ${chart.title}:`, err.message);
        }
    }
    console.log('✨ Size charts seeding complete.');
}

seedSizeCharts();
