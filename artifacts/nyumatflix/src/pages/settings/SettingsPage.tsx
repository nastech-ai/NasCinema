import { useState } from "react";
import { useServerStore, videoServers } from "@/lib/stores/server-store";
import { PageContainer } from "@/components/layout/page-container";
import { ContentContainer } from "@/components/layout/content-container";
import { StableBackground } from "@/components/layout/stable-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Monitor, Shield, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { selectedServer, setSelectedServer, animePreference, setAnimePreference } = useServerStore();
  const [saved, setSaved] = useState(false);

  const handleServerSelect = (server: typeof videoServers[0]) => {
    setSelectedServer(server);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAnimePreference = (pref: "sub" | "dub") => {
    setAnimePreference(pref);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageContainer>
      <StableBackground imageUrl="/movie-banner.webp" />
      <ContentContainer>
        <div className="pt-28 pb-16 max-w-3xl mx-auto space-y-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Settings</h1>
            <p className="text-white/60 text-sm">Customize your NyumatFlix experience</p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              <CheckCircle className="h-4 w-4" />
              Settings saved
            </div>
          )}

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Video Server</h2>
                <p className="text-white/50 text-xs">Choose which server streams your content</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videoServers.map((server) => {
                const isActive = selectedServer.id === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200 text-left",
                      isActive
                        ? "border-primary/60 bg-primary/15 text-white shadow-lg shadow-primary/10"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{server.name}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate max-w-[160px]">{server.baseUrl}</p>
                    </div>
                    {isActive && (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Tv className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Anime Preference</h2>
                <p className="text-white/50 text-xs">Default audio for anime content</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex gap-3">
              {(["sub", "dub"] as const).map((pref) => (
                <button
                  key={pref}
                  onClick={() => handleAnimePreference(pref)}
                  className={cn(
                    "flex-1 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 uppercase tracking-wide",
                    animePreference === pref
                      ? "border-purple-400/60 bg-purple-500/15 text-purple-300 shadow-lg shadow-purple-500/10"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80"
                  )}
                >
                  {pref === "sub" ? "Subtitled (Sub)" : "Dubbed (Dub)"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Ad Protection</h2>
                <p className="text-white/50 text-xs">NyumatFlix actively blocks ads from video servers</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div>
                  <p className="text-white text-sm font-medium">Popup blocker</p>
                  <p className="text-white/50 text-xs">Prevents video servers from opening new tabs</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div>
                  <p className="text-white text-sm font-medium">Navigation hijack protection</p>
                  <p className="text-white/50 text-xs">Stops iframes from redirecting your browser</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div>
                  <p className="text-white text-sm font-medium">Browser ad blocker</p>
                  <p className="text-white/50 text-xs">For best results, also install uBlock Origin</p>
                </div>
                <a
                  href="https://ublockorigin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs cursor-pointer hover:bg-yellow-500/30">
                    Get it free
                  </Badge>
                </a>
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
