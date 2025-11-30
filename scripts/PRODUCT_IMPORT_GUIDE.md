# 📦 Product Import Guide

This guide explains how to import products with images to Sanity CMS.

## 🚀 Quick Start

1. **Set up your Sanity API Token**
   ```bash
   # Add to .env.local
   SANITY_API_TOKEN=your_token_here
   ```

2. **Organize your products** (see folder structure options below)

3. **Run the import script**
   ```bash
   node scripts/import-products-with-images.js
   ```

## 📁 Folder Structure Options

### Option 1: Individual Product Folders (Recommended)

Create a `products` folder in the root directory:

```
products/
  agnihotra-kit/
    data.json
    main-image.jpg
    image-2.jpg
    image-3.jpg
  sambrani-cups/
    data.json
    main-image.jpg
  copper-pyramid/
    data.json
    main-image.jpg
    detail-1.jpg
    detail-2.jpg
```

**data.json format:**
```json
{
  "name": "Agnihotra Kit",
  "slug": "agnihotra-kit",
  "price": 2100,
  "compareAtPrice": 2500,
  "description": "Complete Agnihotra kit with copper pyramid, cow dung cakes, and ghee.",
  "category": "ritual",
  "inventory": 15,
  "tags": ["ritual", "essential", "best-seller"],
  "features": [
    "Copper Pyramid",
    "Cow Dung Cakes",
    "Pure Cow Ghee",
    "Instruction Manual"
  ],
  "ritualSignificance": "Agnihotra is an ancient Vedic fire ritual performed at sunrise and sunset.",
  "isNew": false,
  "isBestSeller": true,
  "rating": 4.5,
  "reviewCount": 10
}
```

### Option 2: Flat Structure with JSON Files

```
products/
  agnihotra-kit.json
  agnihotra-kit.jpg
  agnihotra-kit-2.jpg
  agnihotra-kit-3.jpg
  sambrani-cups.json
  sambrani-cups.jpg
  copper-pyramid.json
  copper-pyramid.jpg
  copper-pyramid-detail.jpg
```

The script will automatically match images to JSON files based on the base filename.

### Option 3: CSV/JSON with Image Paths

If you have a CSV or JSON file with product data and separate image folder:

```
products/
  products.json
  images/
    agnihotra-kit.jpg
    sambrani-cups.jpg
    ...
```

Update the script to handle this structure if needed.

## 📝 Product Data Fields

### Required Fields
- `name` - Product name (string)

### Optional Fields
- `slug` - URL slug (auto-generated from name if not provided)
- `price` - Product price (number, required for e-commerce)
- `compareAtPrice` - Original price for showing discounts (number)
- `description` - Product description (string)
- `category` - Category slug or reference ID (string)
- `inventory` - Stock quantity (number, default: 0)
- `tags` - Array of tags (string[])
- `features` - Array of feature descriptions (string[])
- `ritualSignificance` - Spiritual/ritual importance (string)
- `isNew` - Mark as new product (boolean, default: false)
- `isBestSeller` - Mark as best seller (boolean, default: false)
- `rating` - Average rating (number, 0-5)
- `reviewCount` - Number of reviews (number)
- `image` - Main image filename (string, auto-detected if not specified)
- `images` - Additional image filenames (string[], auto-detected if not specified)

## 🖼️ Image Requirements

### Supported Formats
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`
- `.svg`

### Image Naming
- **Main image**: Any image in the product folder (first one alphabetically becomes main)
- **Gallery images**: All other images in the folder
- **For flat structure**: Images matching the JSON filename (e.g., `product-name.jpg`, `product-name-2.jpg`)

### Image Best Practices
- Use high-quality images (recommended: 1200x1200px minimum)
- Optimize images before uploading (use tools like ImageOptim or TinyPNG)
- Use descriptive filenames
- First image will be used as the main product image

## 🔧 Setup Instructions

### 1. Get Sanity API Token

1. Go to [Sanity Manage](https://sanity.io/manage)
2. Select your project
3. Navigate to **API** > **Tokens**
4. Click **Add API token**
5. Name it (e.g., "Product Import Token")
6. Select **Editor** permissions
7. Copy the token

### 2. Add Token to Environment

Add to `.env.local`:
```bash
SANITY_API_TOKEN=your_token_here
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Create Products Folder

```bash
mkdir products
```

### 4. Organize Your Products

Choose one of the folder structure options above and organize your products accordingly.

### 5. Run the Import

```bash
node scripts/import-products-with-images.js
```

The script will:
1. Scan the products folder
2. Detect the folder structure
3. Read product data from JSON files
4. Find associated images
5. Upload images to Sanity
6. Create product documents

## 📊 Category Setup

Before importing products, make sure your categories exist in Sanity:

1. Go to `/studio` in your app
2. Navigate to **Categories**
3. Create categories like:
   - `ritual` (slug: "ritual")
   - `lifestyle` (slug: "lifestyle")
   - `apparel` (slug: "apparel")
   - `combos` (slug: "combos")

Then reference them in your product JSON using the slug:
```json
{
  "category": "ritual"
}
```

## ⚠️ Important Notes

1. **Duplicate Prevention**: The script checks for existing products by slug and skips duplicates
2. **Rate Limiting**: The script includes delays to avoid hitting Sanity rate limits
3. **Image Upload**: Large images may take time to upload. Be patient!
4. **Dry Run**: Always do a dry run first to preview what will be imported
5. **Backup**: Consider backing up your Sanity data before bulk imports

## 🐛 Troubleshooting

### "Products directory not found"
- Make sure you created a `products` folder in the root directory
- Check that you're running the script from the project root

### "No products found"
- Check your folder structure matches one of the supported options
- Ensure JSON files are valid JSON
- Make sure image files have supported extensions

### "Failed to upload image"
- Check image file size (Sanity has limits)
- Ensure image file is not corrupted
- Check your API token has proper permissions

### "Category not found"
- Make sure categories exist in Sanity first
- Use the exact slug from Sanity
- Check category spelling in your JSON files

### "SANITY_API_TOKEN is required"
- Add the token to `.env.local`
- Make sure you're using the correct token with Editor permissions
- Restart your terminal/IDE after adding the token

## 📚 Example Product JSON

```json
{
  "name": "Agnihotra Kit",
  "slug": "agnihotra-kit",
  "price": 2100,
  "compareAtPrice": 2500,
  "description": "Complete Agnihotra kit with everything you need to perform the ancient Vedic fire ritual. Includes copper pyramid, organic cow dung cakes, pure cow ghee, and detailed instruction manual.",
  "category": "ritual",
  "inventory": 15,
  "tags": ["ritual", "essential", "best-seller", "agnihotra"],
  "features": [
    "Handcrafted Copper Pyramid",
    "Organic Cow Dung Cakes (50 pieces)",
    "Pure Cow Ghee (500ml)",
    "Detailed Instruction Manual",
    "Traditional Design"
  ],
  "ritualSignificance": "Agnihotra is an ancient Vedic fire ritual performed at sunrise and sunset. It purifies the atmosphere, promotes health, and brings peace and harmony to the home.",
  "isNew": false,
  "isBestSeller": true,
  "rating": 4.8,
  "reviewCount": 24
}
```

## 🎯 Tips for Success

1. **Start Small**: Test with 2-3 products first
2. **Use Dry Run**: Always preview before importing
3. **Organize Images**: Keep images organized in product folders
4. **Validate JSON**: Use a JSON validator before importing
5. **Check Categories**: Ensure all categories exist in Sanity
6. **Image Optimization**: Compress images to reduce upload time
7. **Descriptive Names**: Use clear, descriptive product names
8. **Complete Data**: Fill in as many fields as possible for better SEO

## 📞 Need Help?

If you encounter issues:
1. Check the error messages carefully
2. Verify your folder structure
3. Ensure your JSON files are valid
4. Check your Sanity API token permissions
5. Review the troubleshooting section above

Happy importing! 🚀

