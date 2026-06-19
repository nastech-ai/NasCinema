import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { apiJson } from "@/lib/api";

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  useEffect(() => {
    const id = params.id;
    if (!id) { navigate("/"); return; }

    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}`).then(r => r.ok ? "movie" : null).catch(() => null),
      fetch(`https://api.themoviedb.org/3/tv/${id}`).then(r => r.ok ? "tv" : null).catch(() => null),
    ]).then(([movieType, tvType]) => {
      if (movieType) navigate(`/movies/${id}`);
      else if (tvType) navigate(`/tvshows/${id}`);
      else navigate("/");
    });
  }, [params.id]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white">Redirecting...</div>
    </div>
  );
}
