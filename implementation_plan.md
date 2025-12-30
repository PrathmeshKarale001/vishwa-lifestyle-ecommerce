# Implementation Plan - Product Bulk Import (Apparel & Footwear)

This plan outlines the updates to the `import-variants-data.mjs` script to import products from the provided spreadsheets with correct category mapping and size variant handling.

## User Review Required

> [!IMPORTANT]
> - **Category Change**: "Footwear" will be created/referenced as a **Main Category**, not a subcategory of Apparel.
> - **No Images**: As requested, product images will NOT be included in this import.
> - **Size Mapping**:
>   - **Apparel**: S, M, L, XL (mapped from the "Size" column).
>   - **Footwear**: 37, 38, 39, 40, 41 (numeric sequence).
> - **Inventory**: Defaulting each variant to 100 units (total 400 or 500 per product).

## Proposed Changes

### Scripts

#### [MODIFY] [import-variants-data.mjs](file:///Users/prathmeshkarale/Downloads/Vishwa-Lifestyle/scripts/import-variants-data.mjs)

- Update `FILES_TO_IMPORT` to include `Apparels.xlsx` and `Footwear.xlsx`.
- Update `importFile` function:
  - Force "Apparel" (singular) as the category for `Apparels.xlsx`.
  - Force "Footwear" as the category for `Footwear.xlsx`.
  - Refine header mapping for `Size`, `HSN Code`, `GST %`, `WEIGHT`, and `DIMENSIONS` based on the spreadsheet analysis.
  - Implement size normalization (e.g., ensuring "Small" becomes "S" if needed, or using the specific size columns).
  - Ensure `subCategory` is correctly extracted from `SUB-CATEGORY` or `SUB -CATEGORY`.
  - Ensure all variants are created with sequential SKUs provided in the data.

## Verification Plan

### Automated Tests
- Run the script with a `DRY_RUN` flag first (if I add one) or inspect the first few created documents in Sanity.
- Check Sanity Studio to verify:
  - Products appear under correct Main Categories (Apparel, Footwear).
  - Variants are correctly linked with appropriate sizes and SKUs.
  - No images are attached.

### Manual Verification
- Verify that "Footwear" is indeed a main category in the shop filters.
- Confirm total inventory matches the variant sum.
