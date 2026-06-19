
import { useEpisodeStore } from "@/lib/stores/episode-store";
import { useServerStore } from "@/lib/stores/server-store";
import { logger } from "@/lib/utils";
import { MediaItem } from "@/utils/typings";
import {
  AnimatePresence,
  LegacyAnimationControls,
  motion,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { YouTubePlayer } from "./youtube-types";
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";

interface HeroBackgroundProps {
  media: MediaItem;
  mediaType?: "tv" | "movie";
  isPlayingVideo: boolean;
  isPlayingTrailer: boolean;
  isPreviewPlaying: boolean;
  isMuted: boolean;
  controls: LegacyAnimationControls;
  onTrailerEnded(): void;
  onPreviewEnded(): void;
  youtubePlayer: YouTubePlayer;
  setYoutubePlayer(player: YouTubePlayer): void;
  anilistId?: number | null | undefined;
  previewTrailerKey?: string | null;
}

export function HeroBackground({
  media,
  mediaType,
  isPlayingVideo,
  isPlayingTrailer,
  isPreviewPlaying,
  controls,
  onTrailerEnded,
  onPreviewEnded,
  youtubePlayer,
  setYoutubePlayer,
  anilistId,
  previewTrailerKey: externalTrailerKey,
}: HeroBackgroundProps) {
  const ytReady = useYouTubeAPI();
  const { getEmbedUrl } = useEpisodeStore();
  const { selectedServer, vidnestContentType, animePreference } =
    useServerStore();

  let currentItemVideos: { type: string; key: string }[] = [];

  if (media.videos) {
    if (Array.isArray(media.videos)) {
      currentItemVideos = media.videos as { type: string; key: string }[];
    } else if (typeof media.videos === "object" && media.videos !== null) {
      const videosObj = media.videos as { results?: unknown };
      if (videosObj.results && Array.isArray(videosObj.results)) {
        currentItemVideos = videosObj.results as { type: string; key: string }[];
      }
    }
  }

  const acceptableVideoTypes = ["Trailer", "Teaser", "Clip", "Featurette"];
  const trailerVideo = currentItemVideos.find((video: { type: string }) =>
    acceptableVideoTypes.includes(video.type),
  );
  const trailerKey = trailerVideo?.key;

  // For "Play Trailer" — prefer fetched key over embedded (carousel items have no videos)
  const activeTrailerKey = externalTrailerKey || trailerKey;

  const getMediaType = (): "movie" | "tv" => {
    if (mediaType) return mediaType;
    if (media) {
      const isTvShow =
        media.media_type === "tv" ||
        media.name !== undefined ||
        media.first_air_date !== undefined ||
        media.number_of_seasons !== undefined ||
        media.number_of_episodes !== undefined;
      if (isTvShow) return "tv";
    }
    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("/tvshows/")) return "tv";
      if (window.location.pathname.includes("/movies/")) return "movie";
    }
    return "movie";
  };

  // URL for the streaming server background preview
  const getPreviewUrl = () => {
    const type = getMediaType();
    return type === "tv"
      ? selectedServer.getTvUrl(media.id)
      : selectedServer.getMovieUrl(media.id);
  };

  const getVideoSrc = () => {
    const detectedMediaType = getMediaType();
    if (selectedServer.id === "vidnest" && selectedServer.getVidnestUrl) {
      const episodeStore = useEpisodeStore.getState();
      if (vidnestContentType === "movie") {
        return selectedServer.getVidnestUrl(media.id, "movie");
      }
      if (vidnestContentType === "tv") {
        if (episodeStore.selectedEpisode) {
          return selectedServer.getVidnestUrl(
            parseInt(episodeStore.tvShowId || ""),
            "tv",
            episodeStore.seasonNumber || undefined,
            episodeStore.selectedEpisode.episode_number,
          );
        }
        return selectedServer.getVidnestUrl(media.id, "tv");
      }
      if (vidnestContentType === "anime") {
        if (episodeStore.isAnimeEpisode && episodeStore.anilistId && episodeStore.relativeEpisodeNumber) {
          return selectedServer.getVidnestUrl(media.id, "anime", undefined, episodeStore.relativeEpisodeNumber, episodeStore.anilistId);
        }
        const episode = episodeStore.selectedEpisode?.episode_number || 1;
        const idToUse = anilistId || media.id;
        return `https://vidnest.fun/anime/${idToUse}/${episode}/${animePreference}`;
      }
      if (vidnestContentType === "animepahe") {
        if (episodeStore.isAnimeEpisode && episodeStore.anilistId && episodeStore.relativeEpisodeNumber) {
          return selectedServer.getVidnestUrl(media.id, "animepahe", undefined, episodeStore.relativeEpisodeNumber, episodeStore.anilistId);
        }
        const episode = episodeStore.selectedEpisode?.episode_number || 1;
        const idToUse = anilistId || media.id;
        return `https://vidnest.fun/animepahe/${idToUse}/${episode}/${animePreference}`;
      }
    }
    if (detectedMediaType === "tv") {
      const episodeEmbedUrl = getEmbedUrl();
      if (episodeEmbedUrl) return episodeEmbedUrl;
      // No episode selected — load the show URL so the streaming server handles episode selection
      return selectedServer.getTvUrl(media.id);
    }
    return selectedServer.getMovieUrl(media.id);
  };

  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Key X to stop trailer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isPlayingTrailer && (e.key === "x" || e.key === "X")) {
        if (youtubePlayer) {
          youtubePlayer.destroy();
          setYoutubePlayer(null);
        }
        onTrailerEnded();
      }
    };
    if (isPlayingTrailer) window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlayingTrailer, youtubePlayer, onTrailerEnded, setYoutubePlayer]);

  // Full-screen YouTube trailer player (user clicked "Play Trailer")
  useEffect(() => {
    if (isPlayingTrailer && activeTrailerKey && ytReady && typeof window !== "undefined" && window.YT) {
      if (!youtubePlayer) {
        try {
          const player = new window.YT.Player("trailer-player", {
            videoId: activeTrailerKey,
            playerVars: { autoplay: 1, controls: 1, rel: 0 },
            events: {
              onStateChange: (event: { data: number }) => {
                if (event.data === 0) {
                  onTrailerEnded();
                  return;
                }
                if (event.data === 2) {
                  if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
                  pauseTimeoutRef.current = setTimeout(() => {
                    try {
                      const state = (player as YouTubePlayer)?.getPlayerState?.();
                      if (state === 2) onTrailerEnded();
                    } catch { /* ignore */ }
                  }, 1000);
                  return;
                }
                if (pauseTimeoutRef.current) {
                  clearTimeout(pauseTimeoutRef.current);
                  pauseTimeoutRef.current = null;
                }
              },
            },
          });
          setYoutubePlayer(player);
        } catch (error) {
          logger.error("Error initializing YouTube trailer player", error);
        }
      }
    }
    return () => {
      if (pauseTimeoutRef.current) { clearTimeout(pauseTimeoutRef.current); pauseTimeoutRef.current = null; }
      if (!isPlayingTrailer && youtubePlayer?.destroy) {
        youtubePlayer.destroy();
        setYoutubePlayer(null);
      }
    };
  }, [isPlayingTrailer, activeTrailerKey, ytReady, onTrailerEnded, youtubePlayer, setYoutubePlayer]);

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={media.backdrop_path}
          className="relative h-full w-full"
          animate={controls}
        >
          {/* Backdrop image — fades out when preview is playing */}
          <motion.img
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path ?? media.poster_path}`}
            fetchPriority="high"
            alt={(media.title || media.name) as string}
            className="w-full h-full object-cover absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPreviewPlaying ? 0 : 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Background streaming preview (Netflix-style) — uses selected server, no YouTube */}
          {isPreviewPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-[1] bg-black overflow-hidden"
              onAnimationComplete={() => {
                // End preview after 3 min max so carousel can advance
                setTimeout(onPreviewEnded, 3 * 60 * 1000);
              }}
            >
              <iframe
                key={`preview-${media.id}-${selectedServer.id}`}
                src={getPreviewUrl()}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                referrerPolicy="no-referrer"
                style={{ pointerEvents: "none", border: "none" }}
                title={`Preview: ${media.title || media.name}`}
              />
            </motion.div>
          )}

          {/* Gradient overlay — always present so content is readable */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Full-screen trailer player (user-triggered, YouTube) */}
          {isPlayingTrailer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full absolute z-30 px-4 sm:px-6 lg:px-8"
              style={{ top: "5rem", height: "calc(100% - 11rem)" }}
            >
              <div className="md:max-w-7xl lg:max-w-8xl mx-auto h-full">
                <div
                  id="trailer-player"
                  className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-border/20"
                />
              </div>
            </motion.div>
          )}

          {/* Embed video player (watch mode) */}
          {isPlayingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full absolute z-30 px-4 sm:px-6 lg:px-8"
              style={{ top: "5rem", height: "calc(100% - 11rem)" }}
            >
              <div className="md:max-w-7xl lg:max-w-8xl mx-auto h-full">
                {(() => {
                  const videoSrc = getVideoSrc();
                  const iframeKey = `${videoSrc}-${vidnestContentType}-${animePreference}-${selectedServer.id}`;
                  if (!videoSrc) {
                    return (
                      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-border/20 bg-black/80 flex items-center justify-center">
                        <div className="text-white text-center"><p>Loading video...</p></div>
                      </div>
                    );
                  }
                  return (
                    <motion.iframe
                      key={iframeKey}
                      src={videoSrc}
                      className="w-full h-full rounded-lg overflow-hidden shadow-2xl border border-border/20"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-downloads"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
