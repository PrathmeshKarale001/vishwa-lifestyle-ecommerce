/**
 * Image utility functions for generating blur placeholders
 */

// Base64 encoded 1x1 transparent pixel
const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//Z";

/**
 * Generate a blur placeholder for Sanity images
 * @param imageUrl - The Sanity image URL
 * @returns A base64 blur placeholder
 */
export function getBlurPlaceholder(imageUrl?: string): string {
  if (!imageUrl) return BLUR_DATA_URL;

  // If it's a Sanity image, return a low-quality, highly blurred URL
  if (imageUrl.includes("cdn.sanity.io")) {
    return getLowQualityImageUrl(imageUrl, 10);
  }

  return BLUR_DATA_URL;
}

/**
 * Generate a low-quality image URL for Sanity images (for blur effect)
 * @param imageUrl - The Sanity image URL
 * @param width - Desired width (default: 20)
 * @returns A low-quality image URL
 */
export function getLowQualityImageUrl(imageUrl: string, width: number = 20): string {
  if (!imageUrl) return "";

  // If it's a Sanity CDN URL, add quality and blur parameters
  if (imageUrl.includes("cdn.sanity.io")) {
    const url = new URL(imageUrl);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", "20"); // Low quality
    url.searchParams.set("blur", "50"); // Blur effect
    return url.toString();
  }

  return imageUrl;
}

