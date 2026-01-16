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
    "categoryName": category->name,
    "image": images[0].asset->url,
    "lqip": images[0].asset->metadata.lqip,
    "inventory": coalesce(inventory, 10),
    tags,
    isNew,
    isBestSeller
  }`,

  // Get single product by slug
  productBySlug: `*[_type == "product" && (slug.current == $slug || slug.current == $altSlug || lower(name) == lower($altSlug))][0] {
    _id,
    name,
    "slug": slug.current,
    sku,
    price,
    compareAtPrice,
    description,
    "category": category->slug.current,
    "categoryName": category->name,
    subCategory,
    brand,
    "images": images[].asset->url,
    "imageLqips": images[].asset->metadata.lqip,
    "mainImage": images[0].asset->url,
    "mainImageLqip": images[0].asset->metadata.lqip,
    features,
    additionalDetails,
    "inventory": coalesce(inventory, 10),
    tags,
    isNew,
    isBestSeller,
    rating,
    reviewCount,
    weight,
    dimensions,
    shelfLife,
    unitType,
    packaging,
    hsnCode,
    variants,
    metaTitle,
    metaDescription,
    "sizeChart": sizeChart-> {
      title,
      type,
      gender,
      headers,
      rows,
      "image": image.asset->url
    }
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
    "categoryName": category->name,
    "image": images[0].asset->url,
    "lqip": images[0].asset->metadata.lqip,
    "inventory": coalesce(inventory, 10),
    tags,
    isNew,
    isBestSeller
  }`,

  // Get featured products (those tagged with 'featured' OR best sellers/new if none tagged)
  featuredProducts: `*[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": images[0].asset->url,
    "lqip": images[0].asset->metadata.lqip,
    "category": category->slug.current,
    "categoryName": category->name,
    "inventory": coalesce(inventory, 10),
    tags,
    isNew,
    isBestSeller,
    isOnSale,
    _createdAt
  } | order(
    select(
      "featured" in tags[] || "Featured" in tags[] || lower("featured") in tags[] => 0,
      isBestSeller == true => 1,
      isNew == true => 2,
      3
    ),
    _createdAt desc
  )[0...12]`,

  // Get sale products
  saleProducts: `*[_type == "product" && (isOnSale == true || compareAtPrice > price)] {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": images[0].asset->url,
    "lqip": images[0].asset->metadata.lqip,
    "category": category->slug.current,
    "categoryName": category->name,
    "inventory": coalesce(inventory, 10),
    tags,
    isNew,
    isBestSeller,
    isOnSale,
    _createdAt
  } | order(_createdAt desc)[0...12]`,

  // Search products
  searchProducts: `*[_type == "product" && (name match $query || tags[] match $query || description match $query)]
  | score(name match $query)
  | order(_score desc)
  {
    _id,
    name,
    "slug": slug.current,
    price,
    compareAtPrice,
    "image": images[0].asset->url,
    "lqip": images[0].asset->metadata.lqip,
    "category": category->slug.current,
    "categoryName": category->name,
    "inventory": coalesce(inventory, 10)
  }`,

  // Get categories
  allCategories: `*[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "image": image.asset->url,
    subCategories,
    categorySegments,
    metaTitle,
    metaDescription
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
  // Get filtered products with dynamic sorting
  filteredProducts: `*[_type == "product" 
    && ($category == "all" || lower(category->slug.current) == lower($category))
    && ($sub == "" || subCategory == $sub)
    && ($segment == "" || $segment in segments)
    && ($search == "" || name match $search || description match $search)
    && price >= $minPrice && price <= $maxPrice
  ]`,

  // Get a product with horizontal image for Hero
  heroProduct: `*[_type == "product" && defined(images) && defined(images[0].asset)] {
    "image": images[0].asset->url,
    "aspectRatio": images[0].asset->metadata.dimensions.width / images[0].asset->metadata.dimensions.height
  } | order(aspectRatio desc)[0]`,

  // Homepage Dynamic Content
  homePage: `*[_type == "homePage" && _id == "homePage"][0] {
    heroSlides[] {
      title,
      subtitle,
      "image": image.asset->url,
      "mobileImage": mobileImage.asset->url,
      ctaText,
      ctaLink
    },
    philosophy,
    story {
      heading,
      content,
      "image": image.asset->url
    },
    lifestyleGrid[] {
      title,
      link,
      "image": image.asset->url
    },
    benefits[] {
      text,
      icon
    }
  }`,

  // Global Site Settings
  siteSettings: `*[_type == "siteSettings" && _id == "siteSettings"][0] {
    title,
    description,
    "logo": logo.asset->url,
    brandDescription,
    footerNavigation,
    socialLinks,
    contactInfo,
    announcementBar {
      show,
      text,
      link,
      backgroundColor,
      textColor
    }
  }`
};

export async function getHeroProduct() {
  return await sanityClient.fetch(queries.heroProduct);
}

// Fetch functions
export async function getProducts() {
  return await sanityClient.fetch(queries.allProducts);
}
export async function getFilteredProducts({
  category = "all",
  sub = "",
  segment = "",
  sort = "featured",
  search = "",
  minPrice = 0,
  maxPrice = 100000,
  page = 1,
  limit = 12,
}: {
  category?: string;
  sub?: string;
  segment?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const start = (page - 1) * limit;
  const end = start + limit;

  const params = {
    category: category || "all",
    sub: sub || "",
    segment: segment || "",
    search: search?.trim() ? `*${search.trim()}*` : "",
    minPrice: minPrice || 0,
    maxPrice: maxPrice || 1000000,
    start,
    end,
  };

  let orderClause = "| order(_createdAt desc)";
  if (sort === "price-asc") orderClause = "| order(price asc)";
  else if (sort === "price-desc") orderClause = "| order(price desc)";
  else if (sort === "newest") orderClause = "| order(_createdAt desc)";
  else if (sort === "bestselling") orderClause = "| order(isBestSeller desc)";

  const projection = `{
  _id,
    name,
    "slug": slug.current,
      price,
      compareAtPrice,
      description,
      "category": category -> slug.current,
        "image": images[0].asset -> url,
          "inventory": coalesce(inventory, 10),
          tags,
          isNew,
          isBestSeller,
          "lqip": images[0].asset->metadata.lqip,
          variants,
          segments
} `;


  // We need two queries: one for data, one for count
  const query = `{
  "products": ${queries.filteredProducts} ${orderClause} [${start}...${end}] ${projection},
  "total": count(${queries.filteredProducts})
} `;

  console.log("Fetching products with params:", JSON.stringify(params, null, 2));
  const result = await sanityClient.fetch(query, params, { cache: 'no-store' });
  console.log(`Fetched ${result?.products?.length || 0} products. Total matching: ${result?.total || 0}`);

  return result;
}
export async function getProductBySlug(slug: string) {
  console.log(`Fetching product by slug: ${slug}`);
  const altSlug = slug.replace(/-/g, ' ');
  const data = await sanityClient.fetch(
    queries.productBySlug,
    { slug, altSlug } as Record<string, unknown>,
    { cache: 'no-store' }
  );
  console.log(`Product data ${data ? 'found' : 'NOT found'} for slug: ${slug} (alt: ${altSlug})`);
  return data;
}

export async function getProductsByCategory(category: string) {
  return await sanityClient.fetch(queries.productsByCategory, { category } as Record<string, unknown>);
}

export async function getFeaturedProducts() {
  return await sanityClient.fetch(queries.featuredProducts);
}

export async function getSaleProducts() {
  return await sanityClient.fetch(queries.saleProducts);
}

export async function searchProducts(searchQuery: string) {
  return await sanityClient.fetch(queries.searchProducts, { query: `* ${searchQuery}* ` } as Record<string, unknown>);
}

export async function getPosts() {
  return await sanityClient.fetch(queries.allPosts);
}

export async function getPostBySlug(slug: string) {
  return await sanityClient.fetch(queries.postBySlug, { slug } as Record<string, unknown>);
}

export async function getCategories() {
  return await sanityClient.fetch(queries.allCategories);
}

export async function getHomePage() {
  return await sanityClient.fetch(queries.homePage, {}, { cache: 'no-store' });
}


export async function getSiteSettings() {
  return await sanityClient.fetch(queries.siteSettings, {}, { cache: 'no-store' });
}

export async function getProductsByIds(ids: string[]) {
  return await sanityClient.fetch(
    `*[_type == "product" && _id in $ids] {
      _id,
      name,
      price,
      "slug": slug.current,
      "image": images[0].asset->url,
      variants
    }`,
    { ids },
    { cache: 'no-store' }
  );
}
