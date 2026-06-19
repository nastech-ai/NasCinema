
import { WatchlistItem } from "@/utils/watchlist-types";
import { Icons } from "@/lib/icons";
import { useEpisodeStore } from "@/lib/stores/episode-store";
import { cn } from "@/lib/utils";
import { Episode } from "@/utils/typings";
import { Youtube } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { WatchlistButton } from "../watchlist/watchlist-button";

interface HeroButtonsProps {
  handleWatch(): void;
  handlePlayTrailer(): void;
  mediaType?: "tv" | "movie";
  isUpcoming?: boolean;
  contentId: number;
  watchlistItem?: WatchlistItem | null;
  initialEpisode?: Episode | null;
  initialSeasonNumber?: number | null;
  isPreviewPlaying?: boolean;
}

export function HeroButtons({
  handleWatch,
  handlePlayTrailer,
  mediaType,
  isUpcoming = false,
  contentId,
  watchlistItem,
  initialEpisode,
  initialSeasonNumber,
  isPreviewPlaying = false,
}: HeroButtonsProps) {
  const { selectedEpisode, setSelectedEpisode } = useEpisodeStore();

  const handleWatchClick = () => {
    if (isUpcoming) return;

    // If a specific episode was pre-selected via initialEpisode, register it in the store
    if (mediaType === "tv" && !selectedEpisode && initialEpisode && initialSeasonNumber) {
      setSelectedEpisode(
        initialEpisode,
        contentId.toString(),
        initialSeasonNumber,
        undefined,
        false,
      );
      return; // callback triggers handleWatch
    }

    // Proceed with watch (for TV without episode: streaming server handles episode picker)
    handleWatch();
  };

  const getWatchButtonText = () => {
    if (isUpcoming) return "Coming Soon";
    if (mediaType === "tv") {
      if (selectedEpisode) {
        return `Watch S${useEpisodeStore.getState().seasonNumber}E${selectedEpisode.episode_number}`;
      }
      if (watchlistItem?.lastWatchedSeason && watchlistItem?.lastWatchedEpisode) {
        return `Watch S${watchlistItem.lastWatchedSeason}E${watchlistItem.lastWatchedEpisode}`;
      }
      return "Watch Now";
    }
    return "Watch Now";
  };

  const isWatchDisabled = isUpcoming;

  const getDisabledTooltip = () => {
    if (isUpcoming) {
      return "This content is not yet available for streaming";
    }
    return "Please select an episode from the seasons below";
  };

  const disabledTooltip = getDisabledTooltip();

  const WatchButton = (
    <button
      onClick={handleWatchClick}
      disabled={isWatchDisabled}
      className={cn(
        "opacity-75 backdrop-blur-md bg-white/20 border border-white/30 text-white py-2 px-4 rounded-full font-bold transition flex items-center shadow-lg whitespace-nowrap",
        isWatchDisabled
          ? "bg-white/10 border-white/20 text-white/60 cursor-not-allowed opacity-60"
          : "hover:bg-white/30 hover:border-white/40 hover:shadow-xl",
      )}
    >
      <Icons.play className="mr-2 h-4 w-4" />
      <span className="text-sm">{getWatchButtonText()}</span>
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {isWatchDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>{WatchButton}</TooltipTrigger>
          <TooltipContent>
            <p>{disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        WatchButton
      )}

      <WatchlistButton
        contentId={contentId}
        mediaType={mediaType}
        variant="outline"
        size="default"
        className="backdrop-blur-md bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40"
      />

      <button
        className="backdrop-blur-md bg-white/10 border border-white/30 text-white py-2 px-4 rounded-full font-bold hover:bg-white/20 hover:border-white/40 hover:shadow-xl transition flex items-center shadow-lg whitespace-nowrap"
        onClick={handlePlayTrailer}
      >
        <Youtube className="mr-2 h-4 w-4" />
        <span className="text-sm">{isPreviewPlaying ? "Full Trailer" : "Play Trailer"}</span>
      </button>
    </div>
  );
}
