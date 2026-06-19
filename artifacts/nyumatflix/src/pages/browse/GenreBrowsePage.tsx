import { useParams, useSearch } from "wouter";
import { StaticHero } from "@/components/hero/carousel-static";
import { ContentContainer } from "@/components/layout/content-container";
import { BrowseClient } from "@/components/browse/browse-client";

export default function GenreBrowsePage() {
  const params = useParams<{ id: string }>();
  const searchStr = useSearch();
  const searchParams = new URLSearchParams(searchStr);
  const type = (searchParams.get("type") || "movie") as "movie" | "tv";

  return (
    <div className="w-full flex flex-col">
      <StaticHero imageUrl="/movie-banner.webp" title="" route="" />
      <ContentContainer className="w-full flex flex-col items-center z-10 pt-12">
        <div className="text-center my-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Browse by Genre
          </h1>
        </div>
        <BrowseClient apiPath={`/api/genre/${params.id}`} mediaType={type} extraParams={{ type }} />
      </ContentContainer>
    </div>
  );
}
