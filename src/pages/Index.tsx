import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PropertySearch } from "@/components/home/PropertySearch";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { WhyShamah } from "@/components/home/WhyShamah";
import { DiasporaSection } from "@/components/home/DiasporaSection";
import NewsSection from "@/components/home/NewsSection";
import { ServicesEcosystemSection } from "@/components/home/ServicesEcosystemSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PropertySearch />
      <FeaturedProperties />
      <WhyShamah />
      <DiasporaSection />
      <ServicesEcosystemSection />
      <NewsSection />
    </Layout>
  );
};

export default Index;
