import { type SchemaTypeDefinition } from 'sanity'

// Define your schema types here
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Agnihotra', value: 'agnihotra' },
          { title: 'Home Decor', value: 'home-decor' },
          { title: 'Lifestyle', value: 'lifestyle' },
          { title: 'Rituals', value: 'rituals' },
        ],
      },
    },
  ],
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product],
}


