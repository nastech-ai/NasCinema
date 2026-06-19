import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import type { MediaItem } from "@/utils/typings";
import { ContentCard } from "@/components/content/content-card";
import { Button } from "@/components/ui/button";

interface BrowseClientProps {
  apiPath: string;
  mediaType: "movie" | "tv";
  extraParams?: Record<string, string>;
}

export function BrowseClient({ apiPath, mediaType, extraParams = {} }: BrowseClientProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), ...extraParams });
      const data = await apiJson<{ results: MediaItem[]; page: number; total_pages: number }>(`${apiPath}?${params}`);
      const results = (data.results || []).map((item) => ({ ...item, media_type: mediaType }));
      if (append) setItems((prev) => [...prev, ...results]);
      else setItems(results);
      setPage(data.page || pageNum);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error("Browse error:", e);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  };

  useEffect(() => { fetchPage(1); }, [apiPath]);

  if (loading) return (
    <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-pulse">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-lg bg-muted" />
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} mediaType={mediaType} />
        ))}
      </div>
      {page < totalPages && (
        <div className="flex justify-center">
          <Button onClick={() => fetchPage(page + 1, true)} disabled={loadingMore} variant="outline">
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
