import Hero from "@/components/Hero";
import LifestylePreview from "@/components/LifestylePreview";
import StorySection from "@/components/StorySection";
import ShopGrid from "@/components/ShopGrid";
import SaleProducts from "@/components/SaleProducts";
import PhilosophySection from "@/components/PhilosophySection";
import BenefitStrip from "@/components/BenefitStrip";



import { getHomePage } from "@/lib/sanity";

export default async function Home() {
  const homeData = await getHomePage();

  return (
    <main className="min-h-screen bg-white">
      <Hero slides={homeData?.heroSlides} />
      <LifestylePreview items={homeData?.lifestyleGrid} />
      <StorySection data={homeData?.story} />
      <ShopGrid />
      <SaleProducts />
      <PhilosophySection data={homeData?.philosophy} />
      <BenefitStrip benefits={homeData?.benefits} />
    </main>
  );
}
