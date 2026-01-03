import { type SchemaTypeDefinition } from 'sanity';
import { SubCategorySelect } from '../../components/SubCategorySelect';

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
            description: 'Select a Category first to see available Sub-Categories',
            components: {
                input: SubCategorySelect
            },
            validation: (Rule) => Rule.custom((value, context) => {
                const parent: any = context.parent;
                if (parent?.category && !value) {
                    return 'Sub-Category is required when Category is selected';
                }
                return true;
            })
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
            name: 'dimensions',
            title: 'Dimensions',
            type: 'string',
        },
        {
            name: 'weight',
            title: 'Weight',
            type: 'string',
        },
        {
            name: 'packaging',
            title: 'Packaging',
            type: 'string',
        },
        {
            name: 'department',
            title: 'Department',
            type: 'string',
        },
        {
            name: 'gtin',
            title: 'GTIN / Barcode',
            type: 'string',
        },
        {
            name: 'unitType',
            title: 'Unit Type',
            type: 'string',
            description: 'E.g., Pieces, Grams, etc.',
        },
        {
            name: 'productType',
            title: 'Product Type',
            type: 'string',
        },
        {
            name: 'supplierName',
            title: 'Supplier Name',
            type: 'string',
        },
        {
            name: 'supplierCode',
            title: 'Supplier Code',
            type: 'string',
        },
        {
            name: 'supplierContact',
            title: 'Supplier Contact',
            type: 'string',
        },
        {
            name: 'segments',
            title: 'Segments',
            type: 'string',
        },
        {
            name: 'subSegments',
            title: 'Sub Segments',
            type: 'string',
        },
        {
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags'
            }
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
            name: 'additionalDetails',
            title: 'Additional Description (Grid Sections)',
            type: 'array',
            description: 'Add up to 4 highlights like Material, Care, Size Info etc.',
            of: [
                {
                    type: 'object',
                    name: 'detail',
                    fields: [
                        { name: 'title', title: 'Section Title', type: 'string', validation: (Rule) => Rule.required() },
                        {
                            name: 'content',
                            title: 'Content',
                            type: 'array',
                            of: [{ type: 'block' }],
                            validation: (Rule) => Rule.required()
                        },
                    ],
                },
            ],
            validation: (Rule) => Rule.max(4),
        },
        {
            name: 'sizeChart',
            title: 'Size Chart',
            description: 'Link a size chart for this product',
            type: 'reference',
            to: [{ type: 'sizeChart' }]
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
        {
            name: 'isOnSale',
            title: 'Is On Sale',
            type: 'boolean',
            initialValue: false,
        },
    ],
};

export default product;
