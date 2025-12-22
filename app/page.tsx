import Hero from "@/components/Hero";
import LifestylePreview from "@/components/LifestylePreview";
import StorySection from "@/components/StorySection";
import ShopGrid from "@/components/ShopGrid";
import PhilosophySection from "@/components/PhilosophySection";
import BenefitStrip from "@/components/BenefitStrip";


import { getHeroProduct } from "@/lib/sanity";

export default async function Home() {
  const heroProduct = await getHeroProduct();
  const heroProductImage = heroProduct?.image;

  return (
    <main className="min-h-screen bg-white">
      <Hero heroProductImage={heroProductImage} />
      <LifestylePreview />
      <StorySection />
      <ShopGrid />
      <PhilosophySection />
      <BenefitStrip />

    </main>
  );
}
