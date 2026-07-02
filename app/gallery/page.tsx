import fs from "fs";
import path from "path";
import GalleryContent from "@/components/GalleryContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Vishwa Lifestyle",
  description:
    "Explore the essence of Vishwa Lifestyle through our visual journey. Discover Agnihotra rituals, Vedic living, and mindful moments.",
};

export default function GalleryPage() {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  let images: string[] = [];

  try {
    if (fs.existsSync(galleryDir)) {
      images = fs
        .readdirSync(galleryDir)
        .filter((file) => /\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$/.test(file))
        .map((file) => `/gallery/${file}`);
    }
  } catch (error) {
    console.error("Error reading gallery directory:", error);
  }

  return (
    <main className="min-h-screen bg-[#FDFCF8] pt-24 pb-24 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-accent-gold/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {images.length > 0 ? (
          <GalleryContent images={images} />
        ) : (
          <div className="text-center py-20">
            <header className="text-center mb-24 max-w-4xl mx-auto">
              <span className="text-accent-gold text-xs font-bold uppercase tracking-[0.5em] mb-4 block">
                The Visual Narrative
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 tracking-tight leading-[1.1]">
                Sacred Spaces <br />
                <span className="text-gray-400 font-light italic">&</span>{" "}
                Mindful Moments
              </h1>
              <div className="w-16 h-[2px] bg-accent-gold/30 mx-auto mb-10"></div>
              <p className="text-lg md:text-xl text-gray-600 font-serif leading-relaxed italic">
                "A curation of moments reflecting the purity of Agnihotra, the
                beauty of Vedic traditions, and the serenity of mindful living."
              </p>
            </header>
            <p className="text-gray-500 italic">
              Our gallery is currently being curated. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
