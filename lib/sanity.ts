import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId, useCdn } from '@/sanity/env';

// Create Sanity client
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// GROQ Queries
export const queries = {
  // Get all products
  allProducts: `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    description,
    "category": category->slug.current,
    "image": image.asset->url,
    inventory,
    tags,
    isNew,
    isBestSeller
  }`,

  // Get single product by slug
  productBySlug: `*[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    description,
    "category": category->slug.current,
    "images": images[].asset->url,
    "mainImage": coalesce(image.asset->url, ""),
    features,
    ritualSignificance,
    inventory,
    tags,
    isNew,
    isBestSeller,
    rating,
    reviewCount
  }`,

  // Get products by category
  productsByCategory: `*[_type == "product" && category->slug.current == $category] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    description,
    "category": category->slug.current,
    "image": coalesce(image.asset->url, ""),
    inventory,
    tags,
    isNew,
    isBestSeller
  }`,

  // Get featured products (prioritize ritual category, then best sellers/new)
  featuredProducts: `*[_type == "product" && category->slug.current == "ritual"] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": coalesce(image.asset->url, ""),
    "category": category->slug.current,
    inventory,
    tags,
    isNew,
    isBestSeller,
    _createdAt
  } | order(isBestSeller desc, isNew desc, _createdAt desc)[0...8]`,

  // Search products
  searchProducts: `*[_type == "product" && (name match $query || description match $query)] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": coalesce(image.asset->url, ""),
    "category": category->slug.current
  }`,

  // Get categories
  allCategories: `*[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "image": image.asset->url
  }`,

  // Get blog/story posts
  allPosts: `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "mainImage": mainImage.asset->url,
    publishedAt,
    "author": author->name
  }`,

  // Get single post
  postBySlug: `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    body,
    "mainImage": mainImage.asset->url,
    publishedAt,
    "author": author->name
  }`,
};

// Fetch functions
export async function getProducts() {
  return await sanityClient.fetch(queries.allProducts);
}

export async function getProductBySlug(slug: string) {
  return await sanityClient.fetch(queries.productBySlug, { slug } as Record<string, unknown>);
}

export async function getProductsByCategory(category: string) {
  return await sanityClient.fetch(queries.productsByCategory, { category } as Record<string, unknown>);
}

export async function getFeaturedProducts() {
  return await sanityClient.fetch(queries.featuredProducts);
}

export async function searchProducts(searchQuery: string) {
  return await sanityClient.fetch(queries.searchProducts, { query: `*${searchQuery}*` } as Record<string, unknown>);
}

export async function getPosts() {
  return await sanityClient.fetch(queries.allPosts);
}

export async function getPostBySlug(slug: string) {
  return await sanityClient.fetch(queries.postBySlug, { slug } as Record<string, unknown>);
}

