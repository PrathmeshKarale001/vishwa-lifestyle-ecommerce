import Hero from "@/components/Hero";
import LifestylePreview from "@/components/LifestylePreview";
import StorySection from "@/components/StorySection";
import ShopGrid from "@/components/ShopGrid";
import PhilosophySection from "@/components/PhilosophySection";
import BenefitStrip from "@/components/BenefitStrip";




export default async function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <LifestylePreview />
      <StorySection />
      <ShopGrid />
      <PhilosophySection />
      <BenefitStrip />

    </main>
  );
}
