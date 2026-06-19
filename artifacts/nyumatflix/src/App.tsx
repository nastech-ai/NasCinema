import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import MoviesPage from "@/pages/movies/MoviesPage";
import MovieDetailPage from "@/pages/movies/MovieDetailPage";
import TVShowsPage from "@/pages/tvshows/TVShowsPage";
import TVShowDetailPage from "@/pages/tvshows/TVShowDetailPage";
import SearchPage from "@/pages/search/SearchPage";
import WatchlistPage from "@/pages/watchlist/WatchlistPage";
import WatchPage from "@/pages/watch/WatchPage";
import PersonPage from "@/pages/person/PersonPage";
import CountryBrowsePage from "@/pages/browse/CountryBrowsePage";
import GenreBrowsePage from "@/pages/browse/GenreBrowsePage";
import LoginPage from "@/pages/auth/LoginPage";
import VerifyPage from "@/pages/auth/VerifyPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import TermsPage from "@/pages/legal/TermsPage";
import DMCAPage from "@/pages/legal/DMCAPage";
import CookiePolicyPage from "@/pages/legal/CookiePolicyPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfilePage from "@/pages/profile/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Route path="/movies" component={MoviesPage} />
      <Route path="/movies/:id" component={MovieDetailPage} />
      <Route path="/tvshows" component={TVShowsPage} />
      <Route path="/tvshows/:id" component={TVShowDetailPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/watchlist" component={WatchlistPage} />
      <Route path="/watch/:id" component={WatchPage} />
      <Route path="/person/:id" component={PersonPage} />
      <Route path="/browse/country/:country" component={CountryBrowsePage} />
      <Route path="/browse/genre/:id" component={GenreBrowsePage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/verify" component={VerifyPage} />
      <Route path="/legal/privacy" component={PrivacyPage} />
      <Route path="/legal/terms" component={TermsPage} />
      <Route path="/legal/dmca" component={DMCAPage} />
      <Route path="/legal/cookie-policy" component={CookiePolicyPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
