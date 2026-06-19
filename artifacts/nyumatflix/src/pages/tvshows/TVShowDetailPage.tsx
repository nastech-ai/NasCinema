import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { MediaDetailLayout } from "@/components/media/media-detail-layout";
import { MediaCarousels } from "@/components/media/media-carousels";
import { MediaErrorPage } from "@/components/media/media-error-page";
import { MediaNotFoundError } from "@/components/media/media-not-found-error";
import { Poster } from "@/components/media/media-poster";
import { CountryBadge } from "@/components/ui/country-badge";
import { PrimaryGenreBadge } from "@/components/ui/genre-badge";
import { apiJson } from "@/lib/api";
import type { Genre, MediaItem, ProductionCountry } from "@/utils/typings";
import { Calendar, Star, Tv } from "lucide-react";

export default function TVShowDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    apiJson<MediaItem>(`/api/tv/${id}`)
      .then((data) => setDetails({ ...data, media_type: "tv" }))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-pulse text-white">Loading...</div></div>;
  if (error) return <MediaErrorPage mediaType="tv" title="Error Loading TV Show" />;
  if (!details) return <MediaNotFoundError mediaType="tv" title="TV Show Not Found" />;

  const firstAirDate = details.first_air_date
    ? new Date(details.first_air_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Air Date TBA";

  return (
    <MediaDetailLayout media={[details]} mediaType="tv" isUpcoming={false} anilistId={null} contentContainerClassName="mx-auto px-4 relative z-10 max-w-7xl !pt-4 sm:!pt-6 lg:!pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-1">
          <div className="hidden lg:block mt-4 mb-4">
            <Poster posterPath={details.poster_path ?? undefined} title={details.name || details.title} size="large" className="rounded-lg shadow-xl" />
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-white">{firstAirDate}</span>
            </div>
            {details.number_of_seasons && (
              <div className="flex items-center space-x-3">
                <Tv size={18} className="text-gray-400" />
                <span className="text-white">{details.number_of_seasons} Season{details.number_of_seasons !== 1 ? "s" : ""}</span>
              </div>
            )}
            {(details.vote_count && details.vote_count > 0) && (
              <div className="flex items-center space-x-3">
                <Star size={18} className="text-yellow-500" />
                <span className="text-white">{details.vote_average?.toFixed(1)}/10</span>
                <span className="text-gray-400">({details.vote_count?.toLocaleString()} votes)</span>
              </div>
            )}
            {(details.production_countries as ProductionCountry[] | undefined)?.length > 0 && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-gray-400 text-sm mb-2">Production Countries</h3>
                <div className="flex flex-wrap gap-2">
                  {(details.production_countries as ProductionCountry[]).map((country) => (
                    <CountryBadge key={country.iso_3166_1} country={country} variant="outline" mediaType="tv" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8 lg:mt-12">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{details.overview}</p>
            {(details.genres as Genre[] | undefined)?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(details.genres as Genre[]).map((genre) => (
                  <PrimaryGenreBadge key={genre.id} genreId={genre.id} genreName={genre.name} mediaType="tv" />
                ))}
              </div>
            )}
          </section>
          <MediaCarousels cast={details.credits?.cast} videos={details.videos?.results} recommendations={details.similar?.results} mediaType="tv" />
        </div>
      </div>
    </MediaDetailLayout>
  );
}
