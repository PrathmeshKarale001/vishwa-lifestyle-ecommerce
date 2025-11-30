# Bulk Product Import Script

This script allows you to bulk import products from Google Docs/Sheets into Sanity CMS.

## Setup

1. **Get Sanity API Token:**
   - Go to https://sanity.io/manage
   - Select your project
   - Go to **API** → **Tokens**
   - Click **Add API token**
   - Name it "Bulk Import"
   - Give it **Editor** permissions
   - Copy the token

2. **Add Token to Environment:**
   Add to your `.env.local`:
   ```
   SANITY_API_TOKEN=your_token_here
   ```

## Usage

### Option 1: CSV Format (Easiest from Google Sheets)

1. **Export from Google Sheets:**
   - Open your Google Sheet with products
   - File → Download → Comma-separated values (.csv)
   - Save as `products.csv` in the project root

2. **CSV Format:**
   ```csv
   name,slug,price,description,category,inventory,sku,isNew,isBestSeller,tags,features,ritualSignificance
   Agnihotra Kit,agnihotra-kit,2100,Complete kit for daily practice,ritual,15,VL-001,false,true,"ritual;essential","Copper Pyramid;Cow Dung Cakes",Agnihotra creates healing atmosphere
   ```

   **Required columns:**
   - `name` - Product name
   - `price` - Product price (number)
   - `category` - Category (string: ritual, lifestyle, apparel, combos)
   
   **Optional columns:**
   - `slug` - URL slug (auto-generated from name if not provided)
   - `description` - Product description
   - `inventory` - Stock count (number)
   - `sku` - SKU code
   - `isNew` - true/false
   - `isBestSeller` - true/false
   - `tags` - Semicolon-separated (e.g., "ritual;essential")
   - `features` - Semicolon-separated (e.g., "Feature 1;Feature 2")
   - `ritualSignificance` - Text about ritual importance

3. **Run the script:**
   ```bash
   node scripts/bulk-import-products.js
   ```

### Option 2: JSON Format

1. **Create `products.json` in project root:**
   ```json
   [
     {
       "name": "Agnihotra Kit",
       "slug": "agnihotra-kit",
       "price": 2100,
       "description": "Complete kit for daily practice",
       "category": "ritual",
       "inventory": 15,
       "sku": "VL-001",
       "isNew": false,
       "isBestSeller": true,
       "tags": ["ritual", "essential"],
       "features": ["Copper Pyramid", "Cow Dung Cakes"],
       "ritualSignificance": "Agnihotra creates healing atmosphere"
     }
   ]
   ```

2. **Run the script:**
   ```bash
   node scripts/bulk-import-products.js
   ```

## Features

- ✅ Dry run mode (preview before importing)
- ✅ Batch processing (imports in batches of 10)
- ✅ Error handling (continues even if some products fail)
- ✅ Auto-generates slugs from names
- ✅ Validates required fields

## Notes

- **Images:** Images need to be uploaded separately in Sanity Studio or use image URLs
- **Categories:** Currently uses string values. If you want to use category references, we'll need to update the script
- **Duplicates:** The script will create new documents. If you run it twice, you'll get duplicates. Delete them in Sanity Studio first if needed.

## Troubleshooting

**"SANITY_API_TOKEN is required"**
- Make sure you've added the token to `.env.local`
- Restart your terminal/IDE after adding it

**"No products.csv or products.json found"**
- Make sure the file is in the project root (same level as package.json)
- Check the filename is exactly `products.csv` or `products.json`

**Import fails for some products**
- Check the console output for specific error messages
- Common issues: missing required fields, invalid data types

