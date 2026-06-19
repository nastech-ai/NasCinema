import { StaticHero } from "@/components/hero/carousel-static";
import { ContentContainer } from "@/components/layout/content-container";
import { SearchPageClient } from "@/components/search/search";

export default function SearchPage() {
  return (
    <div className="w-full flex flex-col">
      <StaticHero imageUrl="/movie-banner.webp" title="" route="" />
      <ContentContainer className="w-full flex flex-col items-center z-10 pt-12">
        <div className="text-center my-12">
          <h1 className="text-4xl md:text-7xl font-bold text-foreground tracking-tight">Search</h1>
        </div>
        <div className="w-full max-w-6xl mx-auto">
          <SearchPageClient />
        </div>
      </ContentContainer>
    </div>
  );
}
