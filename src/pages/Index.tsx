import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PropertySearch } from "@/components/home/PropertySearch";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { WhyShamah } from "@/components/home/WhyShamah";
import { DiasporaSection } from "@/components/home/DiasporaSection";
import NewsSection from "@/components/home/NewsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PropertySearch />
      <FeaturedProperties />
      <WhyShamah />
      <DiasporaSection />
      <NewsSection />
    </Layout>
  );
};

export default Index;
