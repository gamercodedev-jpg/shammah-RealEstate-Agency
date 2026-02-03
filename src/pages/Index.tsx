import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PropertySearch } from "@/components/home/PropertySearch";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { WhyShammah } from "@/components/home/WhyShammah";
import { DiasporaSection } from "@/components/home/DiasporaSection";
import NewsSection from "@/components/home/NewsSection";
import { ServicesEcosystemSection } from "@/components/home/ServicesEcosystemSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PropertySearch />
      <FeaturedProperties />
      <WhyShammah />
      <DiasporaSection />
      <ServicesEcosystemSection />
      <NewsSection />
    </Layout>
  );
};

export default Index;
