import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/sanity";
import { getProductRecommendations } from "@/lib/recommendations";
import { generateMetadata as generateSeoMetadata, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";
import ProductPageContent from "@/components/ProductPageContent";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return generateSeoMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
    });
  }

  return generateSeoMetadata({
    title: product.metaTitle || `${product.name} | Vishwa Lifestyle`,
    description: product.metaDescription || product.description,
    image: product.images?.[0] || product.mainImage,
    canonical: `/product/${slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  console.log(`[Server] Loading product page for slug: ${slug}`);
  const product = await getProductBySlug(slug);

  if (!product) {
    console.warn(`[Server] Product not found for slug: ${slug}, showing 404`);
    notFound();
  }

  // Fetch recommendations on server
  let relatedProducts = [];
  try {
    const rawRecommendations = await getProductRecommendations(product as any, 4);
    // Map recommendations to match the interface expected by ProductPageContent
    relatedProducts = rawRecommendations.map((rec: any) => ({
      _id: rec._id,
      slug: rec.slug,
      name: rec.name,
      price: rec.price,
      compareAtPrice: rec.compareAtPrice,
      category: rec.category || null,
      description: rec.description || "",
      image: rec.image || "",
      inventory: rec.inventory,
      isNew: rec.isNew,
      isBestSeller: rec.isBestSeller,
    }));
  } catch (error) {
    console.error("[Server] Error fetching recommendations:", error);
    // Fallback
    const allProducts = await getProducts();
    relatedProducts = allProducts
      .filter((p: any) => p.category === product.category && p.slug !== slug)
      .slice(0, 4);
  }

  // Generate Schemas
  const productSchema = generateProductSchema({
    name: product.metaTitle || product.name,
    description: product.metaDescription || product.description,
    image: product.images?.[0] || product.mainImage || "",
    price: product.price,
    currency: "INR",
    availability: (product.inventory ?? 0) > 0 ? "InStock" : "OutOfStock",
    sku: product.sku || product._id,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    variants: product.variants?.map((v: any) => ({
      size: v.size,
      price: v.price,
      sku: v.sku,
      inventory: v.inventory
    }))
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.name, url: `/product/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductPageContent
        product={product as any}
        relatedProducts={relatedProducts as any}
        slug={slug}
      />
    </>
  );
}
