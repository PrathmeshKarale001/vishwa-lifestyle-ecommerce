import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const searchTerm = `*${query.trim()}*`;
    const products = await sanityClient.fetch(
      `*[_type == "product" && (name match $query || tags[] match $query || description match $query)]
      | score(name match $query)
      | order(_score desc)[0...6] {
        _id,
        name,
        "slug": slug.current,
        price,
        "image": images[0].asset->url,
        "categoryName": category->name
      }`,
      { query: searchTerm } as Record<string, unknown>,
      { cache: "no-store" },
    );

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [] });
  }
}
