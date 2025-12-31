
export default {
    name: 'sizeChart',
    title: 'Size Chart',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Chart Title',
            type: 'string',
            description: 'e.g., Men\'s Long Kurta Standard',
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'type',
            title: 'Chart Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Kurta', value: 'kurta' },
                    { title: 'Footwear', value: 'footwear' },
                    { title: 'Apparel', value: 'apparel' }
                ]
            },
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'gender',
            title: 'Gender',
            type: 'string',
            options: {
                list: [
                    { title: 'Men', value: 'men' },
                    { title: 'Women', value: 'women' },
                    { title: 'Unisex', value: 'unisex' }
                ]
            },
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'headers',
            title: 'Table Headers',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Labels for the columns, e.g., ["Size", "Chest (in)", "Shoulder (in)"]'
        },
        {
            name: 'rows',
            title: 'Table Rows',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'cells',
                            title: 'Cells',
                            type: 'array',
                            of: [{ type: 'string' }]
                        }
                    ]
                }
            ]
        },
        {
            name: 'instructions',
            title: 'Measurement Instructions',
            type: 'array',
            of: [{ type: 'block' }]
        },
        {
            name: 'image',
            title: 'Measurement Guide Image',
            type: 'image',
            options: { hotspot: true }
        }
    ]
}
