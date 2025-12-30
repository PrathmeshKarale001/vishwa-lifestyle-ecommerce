import { type SchemaTypeDefinition } from 'sanity';

const product: SchemaTypeDefinition = {
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'sku',
            title: 'SKU',
            type: 'string',
            description: 'Stock Keeping Unit - unique product identifier',
        },
        {
            name: 'images',
            title: 'Product Images',
            type: 'array',
            description: 'First image will be used as the main/hero image',
            of: [{ type: 'image', options: { hotspot: true } }],
        },
        {
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().positive(),
        },
        {
            name: 'compareAtPrice',
            title: 'Compare at Price',
            type: 'number',
            description: 'Original price for showing discounts',
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
        },
        {
            name: 'subCategory',
            title: 'Sub-Category',
            type: 'string',
        },
        {
            name: 'brand',
            title: 'Brand',
            type: 'string',
        },
        {
            name: 'gstPercent',
            title: 'GST %',
            type: 'number',
        },
        {
            name: 'hsCode',
            title: 'HS Code',
            type: 'string',
        },
        {
            name: 'hsnCode',
            title: 'HSN Code',
            type: 'string',
        },
        {
            name: 'weight',
            title: 'Weight',
            type: 'string',
        },
        {
            name: 'dimensions',
            title: 'Dimensions',
            type: 'string',
        },
        {
            name: 'inventory',
            title: 'Inventory',
            type: 'number',
            validation: (Rule) => Rule.min(0),
        },
        {
            name: 'variants',
            title: 'Product Variants (Sizes)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'variant',
                    fields: [
                        {
                            name: 'size',
                            title: 'Size',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        },
                        { name: 'sku', title: 'SKU', type: 'string', validation: (Rule) => Rule.required() },
                        { name: 'price', title: 'Price', type: 'number', validation: (Rule) => Rule.required().positive() },
                        { name: 'inventory', title: 'Inventory', type: 'number', validation: (Rule) => Rule.min(0) },
                    ],
                },
            ],
        },
        {
            name: 'metaTitle',
            title: 'Meta Title (SEO)',
            type: 'string',
            validation: (Rule) => Rule.max(60),
        },
        {
            name: 'metaDescription',
            title: 'Meta Description (SEO)',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.max(160),
        },
        {
            name: 'isNew',
            title: 'Is New',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'isBestSeller',
            title: 'Is Best Seller',
            type: 'boolean',
            initialValue: false,
        },
    ],
};

export default product;
