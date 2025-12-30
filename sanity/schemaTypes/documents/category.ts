import { type SchemaTypeDefinition } from 'sanity';

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
        {
            name: 'subCategories',
            title: 'Sub-Categories',
            description: 'Define sub-items for this category (e.g. Men, Women)',
            type: 'array',
            of: [{ type: 'string' }],
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
    ],
};

export default category;
