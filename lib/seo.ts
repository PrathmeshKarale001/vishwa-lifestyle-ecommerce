import { Metadata } from 'next';

const siteConfig = {
  name: 'Vishwa Lifestyle',
  description: 'A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://vishwalifestyle.com',
  ogImage: '/og-image.jpg',
  creator: 'Vishwa Lifestyle',
  keywords: [
    'Agnihotra',
    'Vedic',
    'Lifestyle',
    'Sacred',
    'Rituals',
    'India',
    'Spiritual',
    'Home Decor',
    'Cow Dung',
    'Ghee',
    'Copper Pyramid',
    'Sacred Home',
    'Mindful Living',
  ],
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noIndex,
  canonical,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageImage = image || siteConfig.ogImage;
  const pageKeywords = keywords
    ? [...siteConfig.keywords, ...keywords]
    : siteConfig.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: canonical || siteConfig.url,
      siteName: siteConfig.name,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
  };
}

// Generate product structured data (JSON-LD)
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  variants?: { size: string; price: number; sku: string; inventory?: number }[];
}) {
  const hasVariants = product.variants && product.variants.length > 0;

  const offers = hasVariants
    ? product.variants!.map((variant) => ({
      '@type': 'Offer',
      price: variant.price,
      priceCurrency: product.currency || 'INR',
      availability: `https://schema.org/${(variant.inventory ?? 1) > 0 ? 'InStock' : 'OutOfStock'}`,
      sku: variant.sku,
      name: `${product.name} - ${variant.size}`,
      url: `${siteConfig.url}/product/${product.sku}`, // Assuming SKU is part of slug or similar
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    }))
    : {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'INR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || siteConfig.name,
    },
    offers: hasVariants ? offers : [offers],
    ...(product.rating && product.reviewCount
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
      }
      : {}),
  };
}

// Generate organization structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/vishwalogo-v2.png`,
    description: siteConfig.description,
    sameAs: [
      'https://instagram.com/vishwalifestyle',
      'https://facebook.com/vishwalifestyle',
      'https://twitter.com/vishwalifestyle',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

// Generate FAQ structured data
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

