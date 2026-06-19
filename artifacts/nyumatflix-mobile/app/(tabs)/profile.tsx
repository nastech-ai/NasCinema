import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchSession, sendMagicLink, signOut, type SessionState } from "@/lib/auth";
import { fetchWatchlist, fetchMovieDetail, fetchTvDetail, TMDB_IMG, MEDIA_TITLE, type MediaItem, type WatchlistItem } from "@/lib/api";

type Tab = "watchlist" | "login";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [session, setSession] = useState<SessionState>({ data: null, status: "loading" });
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Array<MediaItem & { watchlistItem: WatchlistItem }>>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    fetchSession().then(setSession);
  }, []);

  useEffect(() => {
    if (session.status !== "authenticated") return;
    setWatchlistLoading(true);
    fetchWatchlist()
      .then(async (items) => {
        const detailed = await Promise.all(
          items.map(async (item) => {
            try {
              const media = item.mediaType === "movie"
                ? await fetchMovieDetail(item.contentId)
                : await fetchTvDetail(item.contentId);
              return { ...media, watchlistItem: item };
            } catch {
              return null;
            }
          })
        );
        setWatchlist(detailed.filter(Boolean) as Array<MediaItem & { watchlistItem: WatchlistItem }>);
      })
      .catch(console.error)
      .finally(() => setWatchlistLoading(false));
  }, [session.status]);

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    setSendError(null);
    const result = await sendMagicLink(email.trim());
    setSending(false);
    if (result.ok) {
      setSent(true);
    } else {
      setSendError(result.error || "Failed to send link");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSession({ data: null, status: "unauthenticated" });
    setWatchlist([]);
  };

  const handleMediaPress = (item: MediaItem) => {
    const type = item.media_type;
    if (type === "tv") router.push(`/tv/${item.id}`);
    else router.push(`/movie/${item.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 90 }}
      >
        <View style={{ height: topPad + 8 }} />
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        </View>

        {session.status === "loading" ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : session.status === "authenticated" ? (
          <>
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {(session.data?.user?.email?.[0] || "U").toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                {session.data?.user?.name && (
                  <Text style={[styles.profileName, { color: colors.foreground }]}>
                    {session.data.user.name}
                  </Text>
                )}
                <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                  {session.data?.user?.email}
                </Text>
              </View>
              <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
                <Ionicons name="log-out-outline" size={22} color={colors.destructive} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Watchlist</Text>
              {watchlistLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : watchlist.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bookmarks-outline" size={48} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    Your watchlist is empty
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                    Browse and add titles to watch later
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.watchlistScroll}>
                  {watchlist.map((item) => {
                    const imageUri = TMDB_IMG(item.poster_path);
                    const title = MEDIA_TITLE(item);
                    return (
                      <Pressable
                        key={item.watchlistItem.id}
                        style={({ pressed }) => [
                          styles.watchlistCard,
                          { opacity: pressed ? 0.8 : 1, backgroundColor: colors.card, borderRadius: colors.radius },
                        ]}
                        onPress={() => handleMediaPress(item)}
                      >
                        {imageUri ? (
                          <Image
                            source={{ uri: imageUri }}
                            style={[styles.watchlistImage, { borderRadius: colors.radius }]}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.watchlistImagePlaceholder, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
                            <Ionicons name="film-outline" size={28} color={colors.mutedForeground} />
                          </View>
                        )}
                        <Text style={[styles.watchlistTitle, { color: colors.foreground }]} numberOfLines={2}>
                          {title}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.watchlistItem.status === "finished" ? colors.primary + "33" : colors.muted }]}>
                          <Text style={[styles.statusText, { color: item.watchlistItem.status === "finished" ? colors.primary : colors.mutedForeground }]}>
                            {item.watchlistItem.status === "watching" ? "Watching" : item.watchlistItem.status === "finished" ? "Finished" : "Waiting"}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </>
        ) : (
          <View style={[styles.loginCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-circle-outline" size={64} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={[styles.loginTitle, { color: colors.foreground }]}>Sign In</Text>
            <Text style={[styles.loginSubtitle, { color: colors.mutedForeground }]}>
              Sign in to access your watchlist and personalized content
            </Text>
            {sent ? (
              <View style={[styles.sentBox, { backgroundColor: colors.accent, borderRadius: colors.radius }]}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
                <Text style={[styles.sentText, { color: colors.foreground }]}>
                  Check your email for the magic link!
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.emailInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
                {sendError && (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{sendError}</Text>
                )}
                <Pressable
                  style={({ pressed }) => [
                    styles.sendBtn,
                    { backgroundColor: colors.primary, opacity: pressed || sending ? 0.8 : 1, borderRadius: colors.radius },
                  ]}
                  onPress={handleSendLink}
                  disabled={sending}
                  testID="send-magic-link-btn"
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="mail-outline" size={18} color="#fff" />
                      <Text style={styles.sendBtnText}>Send Magic Link</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800" as const },
  center: { paddingVertical: 40, alignItems: "center" },
  profileCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" as const },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700" as const, marginBottom: 2 },
  profileEmail: { fontSize: 13 },
  signOutBtn: { padding: 4 },
  section: { paddingHorizontal: 0 },
  sectionTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 12, paddingHorizontal: 16 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 6 },
  emptyText: { fontSize: 16, fontWeight: "600" as const, marginTop: 8 },
  emptySubtext: { fontSize: 13, textAlign: "center" },
  watchlistScroll: { paddingHorizontal: 16, paddingRight: 6 },
  watchlistCard: { width: 130, marginRight: 10 },
  watchlistImage: { width: 130, height: 195 },
  watchlistImagePlaceholder: { width: 130, height: 195, alignItems: "center", justifyContent: "center" },
  watchlistTitle: { fontSize: 12, fontWeight: "500" as const, marginTop: 6, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start" },
  statusText: { fontSize: 10, fontWeight: "600" as const },
  loginCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  loginTitle: { fontSize: 24, fontWeight: "800" as const },
  loginSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emailInput: {
    width: "100%",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  sendBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 16 },
  sentBox: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  sentText: { fontSize: 15, fontWeight: "600" as const, textAlign: "center" },
  errorText: { fontSize: 13, alignSelf: "flex-start" },
});
