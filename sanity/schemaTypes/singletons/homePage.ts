import type { SchemaTypeDefinition } from 'sanity'

export default {
    name: 'homePage',
    title: 'Homepage Content',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Page Title (Internal Only)',
            type: 'string',
            initialValue: 'Main Homepage',
            hidden: true
        },
        // Hero Section
        {
            name: 'heroSlides',
            title: 'Hero Slides',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Main Heading', type: 'string' },
                        { name: 'subtitle', title: 'Sub-heading (Top Text)', type: 'string' },
                        { name: 'image', title: 'Desktop Image', type: 'image', options: { hotspot: true } },
                        { name: 'mobileImage', title: 'Mobile Image', type: 'image', options: { hotspot: true } },
                        { name: 'ctaText', title: 'Button Text', type: 'string' },
                        { name: 'ctaLink', title: 'Button Link', type: 'string' },
                    ]
                }
            ]
        },
        // Philosophy Section
        {
            name: 'philosophy',
            title: 'Philosophy Section',
            type: 'object',
            fields: [
                { name: 'essence', title: 'Essence Label', type: 'string', description: 'Small text at top' },
                { name: 'heading', title: 'Main Heading', type: 'string' },
                { name: 'body', title: 'Philosophy Body Text', type: 'text' },
                { name: 'quote', title: 'Highlight Quote', type: 'string' },
            ]
        },
        // Story Section (If exists)
        {
            name: 'story',
            title: 'Story Section',
            type: 'object',
            fields: [
                { name: 'heading', title: 'Heading', type: 'string' },
                { name: 'content', title: 'Story Content', type: 'text' },
                { name: 'image', title: 'Story Image', type: 'image', options: { hotspot: true } },
            ]
        },
        // Lifestyle Grid
        {
            name: 'lifestyleGrid',
            title: 'Lifestyle Preview Grid',
            description: 'The grid of 5 images on the home page. The first item will be larger.',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Title', type: 'string' },
                        { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
                        { name: 'link', title: 'Link (e.g. /shop?category=apparel)', type: 'string' },
                    ]
                }
            ],
            validation: (Rule) => Rule.max(5)
        },
        // Benefits
        {
            name: 'benefits',
            title: 'Benefit Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'text', title: 'Benefit Label', type: 'string' },
                        {
                            name: 'icon',
                            title: 'Icon Type',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Leaf (Natural)', value: 'leaf' },
                                    { title: 'Sun (Wisdom)', value: 'sun' },
                                    { title: 'Heart (Handcrafted)', value: 'heart' },
                                    { title: 'Check (Ethical)', value: 'check' },
                                    { title: 'Shield (Trusted)', value: 'shield' },
                                    { title: 'Sparkles (Premium)', value: 'sparkles' },
                                ]
                            }
                        },
                    ]
                }
            ]
        }
    ]
} as SchemaTypeDefinition
