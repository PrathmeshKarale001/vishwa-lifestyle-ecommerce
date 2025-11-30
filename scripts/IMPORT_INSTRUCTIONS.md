# 📦 Complete Product Import Instructions

Follow these steps in order to import your products to Sanity.

## Step 1: Setup Sanity API Token

1. Go to [Sanity Manage](https://sanity.io/manage)
2. Select your project
3. Navigate to **API** > **Tokens**
4. Click **Add API token**
5. Name it (e.g., "Product Import Token")
6. Select **Editor** permissions
7. Copy the token

Add to `.env.local`:
```bash
SANITY_API_TOKEN=your_token_here
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

## Step 2: Create Categories First

**IMPORTANT:** Categories must exist before importing products!

Run the category setup script:
```bash
npm run setup:categories
```

This will create:
- ✅ Ritual Essentials (slug: `ritual`)
- ✅ Lifestyle & Sacred Home (slug: `lifestyle`)
- ✅ Vishwa Apparel (slug: `apparel`)
- ✅ Combos & Gifts (slug: `combos`)

The script will:
- Create categories if they don't exist
- Update them if they already exist
- Show you the results

## Step 3: Import Products with Images

Once categories are set up, import your products:

```bash
npm run import:products:images
```

The script will:
1. Scan the `products` folder
2. Read `data.json` files from each product folder
3. Find all images in each folder
4. Upload images to Sanity
5. Create product documents with uploaded images

### What to Expect

1. **Dry Run Prompt**: The script will ask if you want to do a dry run first (recommended)
   - Type `y` to preview what will be imported
   - Review the list
   - Confirm to proceed with actual import

2. **Import Process**:
   - For each product:
     - Shows product name
     - Counts images found
     - Uploads each image (you'll see progress)
     - Creates the product document
   - Shows success/failure for each product

3. **Completion**:
   - Summary of successful imports
   - List of any failures
   - Products are now in Sanity!

## 📁 Your Product Structure

Your products are organized like this:
```
products/
  Agnihotra Starter Kit/
    data.json ✅ (created)
    image1.jpg
    image2.jpg
    ...
  Classic Brass Deepam (Oil Lamp)/
    data.json ✅ (created)
    image1.jpg
    ...
  ...
```

All `data.json` files have been created with:
- Product names
- Descriptions
- Prices (review and update if needed)
- Categories (ritual, lifestyle, apparel)
- Tags, features, and more

## ⚠️ Before Importing

### 1. Review Prices
Check the prices in each `data.json` file and update if needed:
```json
{
  "price": 2100,  // Update this if needed
  "compareAtPrice": 2500  // Update this if needed
}
```

### 2. Verify Categories
Make sure categories are created (run `npm run setup:categories` first)

### 3. Check Images
Ensure images are in the correct folders and have valid extensions (.jpg, .jpeg, .png, .webp, .gif, .svg)

## 🚀 Quick Start Commands

```bash
# 1. Setup categories first
npm run setup:categories

# 2. Import products with images
npm run import:products:images
```

## 📊 What Gets Imported

For each product:
- ✅ Product name and slug
- ✅ Price and compare-at price
- ✅ Description
- ✅ Category (linked to Sanity category)
- ✅ Inventory count
- ✅ Tags
- ✅ Features list
- ✅ Ritual significance
- ✅ Best seller / New flags
- ✅ Ratings and reviews
- ✅ **All images** (main image + gallery)

## 🐛 Troubleshooting

### "Category not found" error
- Run `npm run setup:categories` first
- Make sure the category slug matches (ritual, lifestyle, apparel, combos)

### "Failed to upload image"
- Check image file size (Sanity has limits)
- Ensure image is not corrupted
- Check file extension is supported

### "Product already exists"
- The script skips duplicates automatically
- If you want to update, delete the product in Sanity Studio first

### "SANITY_API_TOKEN is required"
- Add token to `.env.local`
- Restart terminal/IDE after adding
- Verify token has Editor permissions

## ✅ Verification

After import, verify in Sanity Studio:
1. Go to `/studio` in your app
2. Navigate to **Products**
3. You should see all imported products
4. Check that images are uploaded
5. Verify categories are linked correctly

## 🎯 Next Steps

After successful import:
1. Review products in Sanity Studio
2. Update any prices or details if needed
3. Add more images if you have them
4. Products will appear on your website automatically!

---

**Ready to import? Run these commands:**

```bash
npm run setup:categories
npm run import:products:images
```

Good luck! 🚀

