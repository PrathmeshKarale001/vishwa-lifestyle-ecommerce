import { MetadataRoute } from "next";
import { getProducts } from "@/lib/sanity";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://vishwalifestyle.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/story",
    "/ingredients",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/auth/login",
    "/auth/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "daily" : "weekly") as ChangeFrequency,
    priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.7,
  }));

  // Dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await getProducts();
    productRoutes = products.map(
      (product: { slug: string; _updatedAt?: string }) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product._updatedAt
          ? new Date(product._updatedAt)
          : new Date(),
        changeFrequency: "weekly" as ChangeFrequency,
        priority: 0.8,
      }),
    );
  } catch {
    // If product fetch fails, continue with static routes
  }

  return [...staticRoutes, ...productRoutes];
}
