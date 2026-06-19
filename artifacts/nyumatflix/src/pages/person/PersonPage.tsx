import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { ContentContainer } from "@/components/layout/content-container";
import { PageContainer } from "@/components/layout/page-container";
import { StableBackground } from "@/components/layout/stable-background";
import { Calendar, MapPin, User } from "lucide-react";
import { apiJson } from "@/lib/api";
import type { MediaItem } from "@/utils/typings";

interface Person {
  id: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  combined_credits?: {
    cast: Array<MediaItem & { character?: string; job?: string }>;
    crew: Array<MediaItem & { character?: string; job?: string }>;
  };
}

export default function PersonPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiJson<Person>(`/api/person/${id}`)
      .then(setPerson)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-pulse text-white">Loading...</div></div>;
  if (error || !person) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Person not found</div></div>;

  const credits = [...(person.combined_credits?.cast || []), ...(person.combined_credits?.crew || [])]
    .filter((item) => item.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 30);

  return (
    <PageContainer>
      <StableBackground imageUrl="/movie-banner.webp" />
      <ContentContainer>
        <div className="pt-24 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                  alt={person.name}
                  className="rounded-lg shadow-xl w-full max-w-sm mx-auto"
                />
              ) : (
                <div className="rounded-lg shadow-xl w-full max-w-sm mx-auto aspect-[2/3] bg-muted flex items-center justify-center">
                  <User size={64} className="text-muted-foreground" />
                </div>
              )}
              <div className="mt-6 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 space-y-3">
                {person.known_for_department && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Known For:</span>
                    <span className="text-white">{person.known_for_department}</span>
                  </div>
                )}
                {person.birthday && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-white">{new Date(person.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-white">{person.place_of_birth}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <h1 className="text-4xl font-bold text-white">{person.name}</h1>
              {person.biography && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Biography</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{person.biography}</p>
                </div>
              )}
              {credits.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Filmography</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {credits.map((item) => (
                      <a key={`${item.id}-${item.media_type}`} href={`/${item.media_type === "tv" ? "tvshows" : "movies"}/${item.id}`} className="group">
                        <div className="aspect-[2/3] rounded overflow-hidden bg-muted">
                          <img
                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-xs text-gray-300 mt-1 truncate">{item.title || item.name}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
