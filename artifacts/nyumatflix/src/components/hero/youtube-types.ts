export interface YouTubePlayerInstance {
  destroy: () => void;
  getPlayerState?: () => number;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            rel?: number;
            mute?: number;
            modestbranding?: number;
            showinfo?: number;
            iv_load_policy?: number;
            disablekb?: number;
            playsinline?: number;
          };
          events?: {
            onStateChange?: (event: { data: number }) => void;
            onReady?: (event: { target: YouTubePlayerInstance }) => void;
          };
        },
      ) => YouTubePlayerInstance;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// Type for YouTube Player (nullable)
export type YouTubePlayer = YouTubePlayerInstance | null;
