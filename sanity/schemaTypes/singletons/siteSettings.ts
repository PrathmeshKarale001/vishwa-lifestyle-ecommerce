import { type SchemaTypeDefinition } from 'sanity';

const siteSettings: SchemaTypeDefinition = {
    name: 'siteSettings',
    title: 'Global Configuration',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Site Title',
            type: 'string',
        },
        {
            name: 'description',
            title: 'Site Description (SEO)',
            type: 'text',
        },
        {
            name: 'logo',
            title: 'Site Logo',
            type: 'image',
        },
        {
            name: 'brandDescription',
            title: 'Footer Brand Description',
            type: 'text',
            rows: 2,
            description: 'Short description shown in the footer footer'
        },
        {
            name: 'footerNavigation',
            title: 'Footer Navigation Columns',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Column Title', type: 'string' },
                        {
                            name: 'links',
                            title: 'Links',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'label', title: 'Label', type: 'string' },
                                        { name: 'url', title: 'URL', type: 'string' },
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            validation: (Rule) => Rule.max(3)
        },
        {
            name: 'socialLinks',
            title: 'Social Links',
            type: 'object',
            fields: [
                { name: 'instagram', title: 'Instagram', type: 'url' },
                { name: 'facebook', title: 'Facebook', type: 'url' },
                { name: 'twitter', title: 'Twitter', type: 'url' },
                { name: 'youtube', title: 'YouTube', type: 'url' },
            ],
        },
        {
            name: 'contactInfo',
            title: 'Contact Information',
            type: 'object',
            fields: [
                { name: 'email', title: 'Contact Email', type: 'string' },
                { name: 'phone', title: 'Contact Phone', type: 'string' },
                { name: 'address', title: 'Address', type: 'text' },
            ],
        },
        {
            name: 'announcementBar',
            title: 'Announcement Bar',
            type: 'object',
            fields: [
                { name: 'show', title: 'Show Announcement', type: 'boolean' },
                { name: 'text', title: 'Announcement Text', type: 'string' },
                { name: 'link', title: 'Announcement Link', type: 'string' },
                { name: 'backgroundColor', title: 'Background Color (Hex)', type: 'string', description: 'e.g. #D4AF37' },
                { name: 'textColor', title: 'Text Color (Hex)', type: 'string', description: 'e.g. #FFFFFF' },
            ]
        }
    ],
};

export default siteSettings;
