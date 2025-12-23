import { type SchemaTypeDefinition } from 'sanity';

// Product Schema
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
      name: 'size',
      title: 'Size (Apparel & Footwear)',
      type: 'string',
    },
    {
      name: 'dimensions',
      title: 'Dimensions (Products)',
      type: 'string',
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
      options: {
        list: [
          'Men', 'Women', 'Oil', 'Lotion', 'Shampoo', 'Body Wash', 'Face Pack',
          'Heritage Craft', 'Design Plate', 'Wall Clock', 'Wall Painting', 'Showpiece',
          'Jewellery Box', 'Bracelet', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroomware',
          'Idol', 'Diya', 'Aarti Lamp', 'Lota', 'Temple', 'Chowki', 'Aarti Thali',
          'Panch Aarti', 'Samai', 'Bell', 'Grains', 'Pulses', 'Edible Oils', 'Sweeteners & Salts',
          'Flours', 'Spices', 'Pre-Mixes', 'Ready to Eat', 'Honey', 'Chavanprasha', 'Gulkand'
        ]
      }
    },
    {
      name: 'segments',
      title: 'Segments (Optional)',
      type: 'string',
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'ritualSignificance',
      title: 'Ritual Significance',
      type: 'text',
      description: 'Spiritual or ritual importance of the product',
    },
    {
      name: 'subSegments',
      title: 'Sub-Segments',
      type: 'string',
    },
    {
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      description: 'FG (Finished Goods), RM (Raw Material), PKG (Packaging)',
      options: {
        list: [
          { title: 'Finished Goods', value: 'FG' },
          { title: 'Raw Material', value: 'RM' },
          { title: 'Packaging', value: 'PKG' },
        ],
      },
    },
    {
      name: 'department',
      title: 'Department',
      type: 'string',
      description: 'DOM (Domestic), EXP (Export)',
      options: {
        list: [
          { title: 'Domestic', value: 'DOM' },
          { title: 'Export', value: 'EXP' },
        ],
      },
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
      name: 'gs1Barcode',
      title: 'GS1 Barcode',
      type: 'string',
    },
    {
      name: 'gtin',
      title: 'GTIN',
      type: 'string',
    },
    {
      name: 'shelfLife',
      title: 'Shelf Life',
      type: 'string',
    },
    {
      name: 'unitType',
      title: 'Unit Type',
      type: 'string',
      description: 'Unit, KG, Litres, Pieces, etc.',
    },
    {
      name: 'packaging',
      title: 'Packaging',
      type: 'string',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
    },
    {
      name: 'supplierCode',
      title: 'Supplier Code',
      type: 'string',
    },
    {
      name: 'supplierName',
      title: 'Supplier Name',
      type: 'string',
    },
    {
      name: 'supplierContact',
      title: 'Supplier Contact',
      type: 'string',
    },
    {
      name: 'inventory',
      title: 'Inventory',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
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
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
    },
    {
      name: 'reviewCount',
      title: 'Review Count',
      type: 'number',
    },
    {
      name: 'variants',
      title: 'Product Variants (Sizes)',
      type: 'array',
      description: 'Add different sizes/variants for this product. If empty, the top-level price and SKU will be used.',
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
              options: {
                list: [
                  { title: 'Small (S)', value: 'S' },
                  { title: 'Medium (M)', value: 'M' },
                  { title: 'Large (L)', value: 'L' },
                  { title: 'Extra Large (XL)', value: 'XL' },
                  { title: 'Size 37', value: '37' },
                  { title: 'Size 38', value: '38' },
                  { title: 'Size 39', value: '39' },
                  { title: 'Size 40', value: '40' },
                  { title: 'Size 41', value: '41' },
                ]
              }
            },
            { name: 'sku', title: 'SKU', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'price', title: 'Price', type: 'number', validation: (Rule) => Rule.required().positive() },
            { name: 'compareAtPrice', title: 'Compare at Price', type: 'number' },
            { name: 'inventory', title: 'Inventory', type: 'number', validation: (Rule) => Rule.min(0) },
          ],
          preview: {
            select: {
              title: 'size',
              subtitle: 'sku',
              price: 'price',
            },
            prepare({ title, subtitle, price }) {
              return {
                title: `Size: ${title}`,
                subtitle: `${subtitle} | ₹${price}`,
              };
            },
          },
        },
      ],
    },
    {
      name: 'metaTitle',
      title: 'Meta Title (SEO)',
      type: 'string',
      description: 'Highly recommended for SEO. Keep under 60 characters.',
      validation: (Rule) => Rule.max(60),
    },
    {
      name: 'metaDescription',
      title: 'Meta Description (SEO)',
      type: 'text',
      rows: 3,
      description: 'Highly recommended for SEO. Keep under 160 characters.',
      validation: (Rule) => Rule.max(160),
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      price: 'price',
      sku: 'sku',
    },
    prepare({ title, media, price, sku }) {
      return {
        title,
        subtitle: `${sku ? sku + ' | ' : ''}₹${price}`,
        media,
      };
    },
  },
};


// Category Schema
const category: SchemaTypeDefinition = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Category name (e.g., "Other"). "Ritual Essentials" has been renamed to "Other".',
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
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
    {
      name: 'metaTitle',
      title: 'Meta Title (SEO)',
      type: 'string',
      description: 'Highly recommended for SEO. Keep under 60 characters.',
      validation: (Rule) => Rule.max(60),
    },
    {
      name: 'metaDescription',
      title: 'Meta Description (SEO)',
      type: 'text',
      rows: 3,
      description: 'Highly recommended for SEO. Keep under 160 characters.',
      validation: (Rule) => Rule.max(160),
    },
  ],
};

// Blog Post Schema
const post: SchemaTypeDefinition = {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author && `by ${author}`,
        media,
      };
    },
  },
};

// Author Schema
const author: SchemaTypeDefinition = {
  name: 'author',
  title: 'Author',
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
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
    },
  ],
};

// Site Settings Schema
const siteSettings: SchemaTypeDefinition = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'facebook', title: 'Facebook', type: 'url' },
        { name: 'twitter', title: 'Twitter', type: 'url' },
      ],
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
    },
  ],
};

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, category, post, author, siteSettings],
};
