import { useEffect, useState } from "react";

let scriptLoaded = false;
let scriptLoading = false;
const readyCallbacks: (() => void)[] = [];

function notifyReady() {
  readyCallbacks.forEach((cb) => cb());
}

export function useYouTubeAPI(): boolean {
  const [isReady, setIsReady] = useState<boolean>(
    typeof window !== "undefined" && !!window.YT?.Player,
  );

  useEffect(() => {
    if (isReady) return;

    if (typeof window === "undefined") return;

    if (window.YT?.Player) {
      setIsReady(true);
      return;
    }

    const onReady = () => setIsReady(true);
    readyCallbacks.push(onReady);

    if (!scriptLoaded && !scriptLoading) {
      scriptLoading = true;

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        scriptLoaded = true;
        scriptLoading = false;
        if (prev) prev();
        notifyReady();
      };

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }

    return () => {
      const idx = readyCallbacks.indexOf(onReady);
      if (idx !== -1) readyCallbacks.splice(idx, 1);
    };
  }, [isReady]);

  return isReady;
}
