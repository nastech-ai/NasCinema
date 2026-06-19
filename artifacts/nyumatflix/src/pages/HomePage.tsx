import { useEffect, useState } from "react";
import { PageBackground } from "@/components/layout/page-background";
import { MediaCarousel } from "@/components/hero/media-carousel";
import { LazyContentRows } from "@/components/content/lazy-content-rows";
import { getRecommendedRowsForPage, getRowConfig, generateRowHref, generateRowTitle } from "@/utils/content-filters";
import { apiJson } from "@/lib/api";
import type { MediaItem } from "@/utils/typings";

const HOME_CUSTOM_TITLES: Record<string, string> = {
  "top-rated-movies": "Top Rated Movies",
  "top-rated-tvshows": "Top Rated TV Shows",
  "early-2000s-movies": "Early 2000s Movies",
  "popular-movies": "Popular Movies",
  "popular-tvshows": "Popular TV Shows",
  "nolan-films": "Christopher Nolan Films",
  "scifi-fantasy-movies": "Sci-Fi & Fantasy Movies",
  "binge-worthy-series": "Binge-Worthy Series",
  "comedy-movies": "Comedies",
  "a24-films": "A24 Films",
  "thriller-movies": "Edge of Your Seat Thrillers",
  "limited-series": "Limited Series",
  "drama-movies": "Dramas",
  "critically-acclaimed": "Critically Acclaimed",
  "eighties-movies": "80s Movies",
  "reality-tv": "Reality TV",
  "nineties-movies": "90s Movies",
  "romcom-movies": "Rom-Coms",
  "docuseries": "Docuseries",
  "hidden-gems": "Hidden Gems",
  "marvel-mcu": "Marvel Studios",
  "horror-movies": "Spine Chilling Horror",
  "crime-movies": "Crime Movies",
  "mystery-movies": "Mystery Movies",
  "warner-bros": "Warner Bros. Films",
  "universal-films": "Universal Pictures",
  "spielberg-films": "Steven Spielberg Films",
  "scorsese-films": "Martin Scorsese Films",
  "fincher-films": "David Fincher Films",
  "villeneuve-films": "Denis Villeneuve Films",
  "blockbuster-hits": "Blockbuster Hits",
};

function getRowTitle(rowId: string): string {
  return HOME_CUSTOM_TITLES[rowId] || generateRowTitle(rowId);
}

export default function HomePage() {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    apiJson<{ results: MediaItem[] }>("/api/content?category=top-rated-movies&type=movie&page=1")
      .then((data) => {
        const items = (data.results || []).slice(0, 9).map((item) => ({ ...item, media_type: "movie" as const }));
        setHeroItems(items);
      })
      .catch(console.error)
      .finally(() => setHeroLoading(false));
  }, []);

  const recommendedRows = getRecommendedRowsForPage("home");
  const contentRowsConfig = recommendedRows
    .map((rowId) => {
      const config = getRowConfig(rowId);
      if (!config) return null;
      return {
        rowId,
        title: getRowTitle(rowId),
        href: generateRowHref(config, config.mediaType as "movie" | "tv"),
        variant: rowId === "top-rated-movies" || rowId === "top-rated-tvshows" ? ("ranked" as const) : undefined,
        enrich: rowId !== "marvel-mcu",
      };
    })
    .filter(Boolean) as Array<{ rowId: string; title: string; href: string; variant?: "ranked"; enrich?: boolean }>;

  return (
    <div>
      <PageBackground imageUrl="/movie-banner.webp" title="Home" />
      <main>
        {heroLoading ? (
          <div className="relative h-[75vh] md:h-[85vh] lg:h-[92vh] overflow-hidden bg-black" />
        ) : (
          <MediaCarousel items={heroItems} />
        )}
        <div className="relative z-10 min-h-[200vh]">
          <LazyContentRows rows={contentRowsConfig} initialCount={2} batchSize={1} rootMargin="100px" />
        </div>
      </main>
    </div>
  );
}
