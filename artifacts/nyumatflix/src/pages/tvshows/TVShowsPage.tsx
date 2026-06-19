import { useEffect, useState } from "react";
import { PageBackground } from "@/components/layout/page-background";
import { MediaCarousel } from "@/components/hero/media-carousel";
import { LazyContentRows } from "@/components/content/lazy-content-rows";
import { getRecommendedRowsForPage, getRowConfig, generateRowHref, generateRowTitle } from "@/utils/content-filters";
import { apiJson } from "@/lib/api";
import type { MediaItem } from "@/utils/typings";

export default function TVShowsPage() {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    apiJson<{ results: MediaItem[] }>("/api/content?category=popular-tvshows&type=tv&page=1")
      .then((data) => {
        const items = (data.results || []).slice(0, 10).map((item) => ({ ...item, media_type: "tv" as const }));
        setHeroItems(items);
      })
      .catch(console.error)
      .finally(() => setHeroLoading(false));
  }, []);

  const recommendedRows = getRecommendedRowsForPage("tvshows");
  const contentRowsConfig = recommendedRows
    .map((rowId) => {
      const config = getRowConfig(rowId);
      if (!config) return null;
      return {
        rowId,
        title: generateRowTitle(rowId),
        href: generateRowHref(config, "tv"),
        variant: rowId === "top-rated-tvshows" ? ("ranked" as const) : undefined,
        enrich: true,
      };
    })
    .filter(Boolean) as Array<{ rowId: string; title: string; href: string; variant?: "ranked"; enrich?: boolean }>;

  return (
    <>
      <PageBackground imageUrl="/movie-banner.webp" title="TV Shows" />
      {heroLoading ? (
        <div className="relative h-[80vh] md:h-[92vh] overflow-hidden bg-black" />
      ) : (
        <MediaCarousel items={heroItems} />
      )}
      <div className="relative z-10 min-h-[200vh]">
        <LazyContentRows rows={contentRowsConfig} initialCount={2} batchSize={1} rootMargin="100px" />
      </div>
    </>
  );
}
