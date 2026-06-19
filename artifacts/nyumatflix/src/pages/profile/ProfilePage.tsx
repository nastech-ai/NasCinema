import { useSession } from "@/lib/useSession";
import { signOut } from "@/lib/auth-client";
import { PageContainer } from "@/components/layout/page-container";
import { ContentContainer } from "@/components/layout/content-container";
import { StableBackground } from "@/components/layout/stable-background";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { BookMarked, LogIn, LogOut, Settings, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(email: string, name?: string | null) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const session = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  if (session.status === "loading") {
    return (
      <PageContainer>
        <StableBackground imageUrl="/movie-banner.webp" />
        <ContentContainer>
          <div className="pt-28 pb-16 max-w-xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-white/50">Loading profile...</div>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (session.status === "unauthenticated" || !session.data?.user) {
    return (
      <PageContainer>
        <StableBackground imageUrl="/movie-banner.webp" />
        <ContentContainer>
          <div className="pt-28 pb-16 max-w-xl mx-auto">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-8 w-8 text-white/50" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">Not signed in</h2>
                <p className="text-white/50 text-sm">Sign in to access your profile, watchlist, and personalized settings.</p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full gap-2 font-semibold">
                  <LogIn className="h-4 w-4" />
                  Sign In with Email
                </Button>
              </Link>
            </div>
          </div>
        </ContentContainer>
      </PageContainer>
    );
  }

  const user = session.data.user;
  const userEmail = user.email || "";
  const userName = user.name;
  const userImage = user.image;

  const menuItems = [
    { href: "/watchlist", icon: BookMarked, label: "My Watchlist", desc: "Movies and shows you've saved" },
    { href: "/settings", icon: Settings, label: "Settings", desc: "Server, preferences, and ad protection" },
  ];

  return (
    <PageContainer>
      <StableBackground imageUrl="/movie-banner.webp" />
      <ContentContainer>
        <div className="pt-28 pb-16 max-w-xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-white">Profile</h1>

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/40 shadow-xl">
                <AvatarImage src={userImage || ""} alt={userName || userEmail} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl border-2 border-primary/30">
                  {getInitials(userEmail, userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                {userName && <p className="text-white text-xl font-semibold truncate">{userName}</p>}
                <p className="text-white/60 text-sm truncate">{userEmail}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Shield className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Verified member</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            {menuItems.map((item, i) => (
              <div key={item.href}>
                {i > 0 && <Separator className="bg-white/10" />}
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center gap-4 px-6 py-4 transition-all duration-200 cursor-pointer",
                    "hover:bg-white/5 group"
                  )}>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <item.icon className="h-5 w-5 text-white/60 group-hover:text-white/90" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-2xl overflow-hidden">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-4 px-6 py-4 w-full transition-all duration-200 hover:bg-red-500/10 group"
            >
              <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-red-400 font-medium text-sm">Sign out</p>
                <p className="text-white/30 text-xs">You'll need to sign in again to access your account</p>
              </div>
            </button>
          </div>
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
