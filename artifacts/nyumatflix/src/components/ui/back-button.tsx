
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  className?: string;
  fallbackUrl?: string;
}

// routes where we should hide the back button
const HIDE_BACK_BUTTON_ROUTES = [
  "/",
  "/home",
  "/movies",
  "/tvshows",
  "/search",
  "/watchlist",
];

export function BackButton({
  className,
  fallbackUrl = "/home",
}: BackButtonProps) {
  const [, navigate] = useLocation();
  const [pathname] = useLocation();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate(fallbackUrl);
    }
  };


  // hide on top-level routes
  if (HIDE_BACK_BUTTON_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <button
      type="button"
      title="Go back"
      onClick={handleBack}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "h-8 w-8 rounded-full backdrop-blur-md bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all shrink-0 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent",
        className,
      )}
      aria-label="Go back"
    >
      <ChevronLeft
        size={18}
        className="text-white drop-shadow-lg"
        strokeWidth={2.5}
      />
    </button>
  );
}
