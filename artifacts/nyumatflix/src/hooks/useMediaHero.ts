
import type { YouTubePlayer } from "@/components/hero/youtube-types";
import { useEpisodeStore } from "@/lib/stores/episode-store";
import type { MediaItem } from "@/utils/typings";
import { getFirstRegularSeason, isTVShow } from "@/utils/typings";
import { LegacyAnimationControls, useAnimation } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseMediaHeroState {
  currentItemIndex: number;
  isPlayingVideo: boolean;
  isPlayingTrailer: boolean;
  isPreviewPlaying: boolean;
  isMuted: boolean;
  youtubePlayer: YouTubePlayer;
  previewPlayer: YouTubePlayer;
  historyLength: number;
  previewTrailerKey: string | null;
}

export interface UseMediaHeroComputed {
  currentItem: MediaItem | undefined;
  controls: LegacyAnimationControls;
  mediaType: "tv" | "movie" | undefined;
}

export interface UseMediaHeroActions {
  handleNext: () => void;
  handleWatch: () => void;
  handlePlayTrailer: () => void;
  handleTrailerEnded: () => void;
  handleToggleMute: () => void;
  handlePreviewEnded: () => void;
  setYoutubePlayer: (player: YouTubePlayer) => void;
  setPreviewPlayer: (player: YouTubePlayer) => void;
}

export interface UseMediaHeroOptions {
  media: MediaItem[];
  noSlide?: boolean;
  isWatch?: boolean;
  passedMediaType?: "tv" | "movie";
}

export interface UseMediaHeroReturn
  extends UseMediaHeroState,
    UseMediaHeroComputed,
    UseMediaHeroActions {}

function getVideosFromItem(item: MediaItem | undefined): { type: string; key: string }[] {
  if (!item?.videos) return [];
  if (Array.isArray(item.videos)) return item.videos as { type: string; key: string }[];
  const obj = item.videos as { results?: unknown };
  if (Array.isArray(obj.results)) return obj.results as { type: string; key: string }[];
  return [];
}

const ACCEPTABLE_VIDEO_TYPES = ["Trailer", "Teaser", "Clip", "Featurette"];
// How long to wait before auto-starting muted preview (ms)
const PREVIEW_DELAY_MS = 5000;

export const useMediaHero = ({
  media,
  noSlide,
  isWatch = false,
  passedMediaType,
}: UseMediaHeroOptions): UseMediaHeroReturn => {
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayer>(null);
  const [previewPlayer, setPreviewPlayer] = useState<YouTubePlayer>(null);
  const [historyLength, setHistoryLength] = useState<number>(2);
  const [previewTrailerKey, setPreviewTrailerKey] = useState<string | null>(null);
  const controls = useAnimation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pathname, navigate] = useLocation();
  const searchStr = useSearch();
  const searchParams = new URLSearchParams(searchStr);

  // Clear preview when slide changes
  const clearPreview = useCallback((player?: YouTubePlayer) => {
    setIsPreviewPlaying(false);
    setIsMuted(true);
    if (player) {
      try { player.destroy(); } catch { /* ignore */ }
    }
    setPreviewPlayer(null);
    setPreviewTrailerKey(null);
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }, []);

  const currentItem = useMemo(
    () => media[currentItemIndex],
    [media, currentItemIndex],
  );

  // Fetch trailer key for current item when it changes (list items don't include videos)
  useEffect(() => {
    if (!currentItem?.id || isWatch || noSlide) return;

    // First try the embedded videos data (detail pages already have it)
    const existingVideos = getVideosFromItem(currentItem);
    const existingTrailer = existingVideos.find((v) => ACCEPTABLE_VIDEO_TYPES.includes(v.type));
    if (existingTrailer?.key) {
      setPreviewTrailerKey(existingTrailer.key);
      return;
    }

    // Otherwise fetch from the API
    const isTv = currentItem.media_type === "tv" ||
      currentItem.name !== undefined ||
      currentItem.first_air_date !== undefined;
    const endpoint = isTv ? `/api/tv/${currentItem.id}` : `/api/movies/${currentItem.id}`;

    let cancelled = false;
    fetch(endpoint)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const vids = getVideosFromItem(data as MediaItem);
        const trailer = vids.find((v) => ACCEPTABLE_VIDEO_TYPES.includes(v.type));
        if (trailer?.key) setPreviewTrailerKey(trailer.key);
      })
      .catch(() => { /* ignore */ });

    return () => { cancelled = true; };
  }, [currentItem?.id, isWatch, noSlide]);

  const handleNext = useCallback(() => {
    setCurrentItemIndex((prevIndex) =>
      prevIndex === media.length - 1 ? 0 : prevIndex + 1,
    );
    setIsPlayingVideo(false);
    setIsPlayingTrailer(false);
    clearPreview();
  }, [media.length, clearPreview]);

  useEffect(() => {
    const ref = timeoutRef.current;
    return () => {
      if (ref) clearTimeout(ref);
    };
  }, []);

  // Auto-advance carousel (paused when anything is playing)
  useEffect(() => {
    if (!isPlayingVideo && !noSlide && !isWatch && !isPlayingTrailer && !isPreviewPlaying) {
      const interval = setInterval(() => {
        handleNext();
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isPlayingVideo, noSlide, isWatch, isPlayingTrailer, isPreviewPlaying, handleNext]);

  // Auto-start muted preview after delay (only on non-watch carousel pages)
  // Depends on previewTrailerKey being fetched first
  useEffect(() => {
    if (isWatch || noSlide || isPlayingVideo || isPlayingTrailer) return;
    if (!previewTrailerKey) return; // wait until trailer key is fetched

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    previewTimerRef.current = setTimeout(() => {
      setIsPreviewPlaying(true);
      setIsMuted(true);
    }, PREVIEW_DELAY_MS);

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    };
  }, [previewTrailerKey, isWatch, noSlide, isPlayingVideo, isPlayingTrailer]);

  const handleWatch = useCallback(() => {
    setIsPlayingTrailer(false);
    clearPreview(previewPlayer ?? undefined);
    setIsPlayingVideo(true);
  }, [clearPreview, previewPlayer]);

  useEffect(() => {
    const shouldAutoplay = searchParams.get("autoplay") === "true";
    if (!shouldAutoplay || !isWatch) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const maybeAutoplay = async () => {
      if (passedMediaType === "tv" && currentItem) {
        const firstSeason = getFirstRegularSeason(currentItem);
        if (firstSeason) {
          try {
            const res = await fetch(
              `/api/tv/${currentItem.id}/season/${firstSeason.season_number}`,
            );
            const seasonData = await res.json();
            if (
              Array.isArray(seasonData.episodes) &&
              seasonData.episodes.length > 0
            ) {
              const firstEpisode = seasonData.episodes[0];
              useEpisodeStore
                .getState()
                .setSelectedEpisode(
                  firstEpisode,
                  currentItem.id.toString(),
                  firstSeason.season_number,
                );
            }
          } catch {
            // we could log this, but failure shouldn't block autoplay
          }
        }
      }

      timer = setTimeout(() => {
        handleWatch();
        const params = new URLSearchParams(searchParams.toString());
        params.delete("autoplay");
        const newSearch = params.toString();
        navigate(`${pathname}${newSearch ? `?${newSearch}` : ""}`);
      }, 500);
    };

    void maybeAutoplay();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    searchStr,
    isWatch,
    pathname,
    passedMediaType,
    currentItem,
    handleWatch,
  ]);

  const handlePlayTrailer = useCallback(() => {
    const videos = getVideosFromItem(currentItem);
    const trailerVideo = videos.find((v) => ACCEPTABLE_VIDEO_TYPES.includes(v.type));

    if (!trailerVideo?.key) {
      return;
    }

    // Stop preview when playing full trailer
    clearPreview(previewPlayer ?? undefined);
    setIsPlayingTrailer(true);
  }, [currentItem, clearPreview, previewPlayer]);

  const handleTrailerEnded = useCallback(() => {
    setIsPlayingTrailer(false);
    setIsPlayingVideo(false);
    setIsPreviewPlaying(false);
  }, []);

  const handlePreviewEnded = useCallback(() => {
    setIsPreviewPlaying(false);
    setIsMuted(true);
    setPreviewPlayer(null);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (previewPlayer) {
        try {
          if (next) previewPlayer.mute();
          else previewPlayer.unMute();
        } catch { /* ignore */ }
      }
      return next;
    });
  }, [previewPlayer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHistoryLength(window.history.length);
    }
  }, []);

  const mediaType = useMemo((): "tv" | "movie" | undefined => {
    if (passedMediaType) return passedMediaType;
    if (pathname.includes("/tvshows/")) return "tv";
    if (pathname.includes("/movies/")) return "movie";
    if (pathname.includes("/watch/")) {
      const currentMedia = media[currentItemIndex];
      if (currentMedia) {
        return isTVShow(currentMedia) ? "tv" : "movie";
      }
    }
    return undefined;
  }, [passedMediaType, pathname, media, currentItemIndex]);

  return {
    currentItemIndex,
    isPlayingVideo,
    isPlayingTrailer,
    isPreviewPlaying,
    isMuted,
    youtubePlayer,
    previewPlayer,
    historyLength,
    previewTrailerKey,
    currentItem,
    controls,
    mediaType,
    handleNext,
    handleWatch,
    handlePlayTrailer,
    handleTrailerEnded,
    handleToggleMute,
    handlePreviewEnded,
    setYoutubePlayer,
    setPreviewPlayer,
  };
};

export type UseMediaHero = typeof useMediaHero;
