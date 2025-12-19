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
      name: 'segments',
      title: 'Segments',
      type: 'string',
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
      name: 'size',
      title: 'Size',
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
      name: 'dimensions',
      title: 'Dimensions (LxBxH)',
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
