import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchMovieDetail, TMDB_IMG, type MediaItem } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BACKDROP_HEIGHT = 260;

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [movie, setMovie] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMovieDetail(id)
      .then(setMovie)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>Failed to load movie</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const backdropUri = TMDB_IMG(movie.backdrop_path || movie.poster_path, "w780");
  const posterUri = TMDB_IMG(movie.poster_path);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const hours = Math.floor((movie.runtime || 0) / 60);
  const mins = (movie.runtime || 0) % 60;
  const runtime = movie.runtime ? `${hours}h ${mins}m` : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ height: BACKDROP_HEIGHT }}>
          {backdropUri ? (
            <Image source={{ uri: backdropUri }} style={[styles.backdrop, { width: SCREEN_WIDTH }]} resizeMode="cover" />
          ) : (
            <View style={[styles.backdropPlaceholder, { backgroundColor: colors.muted }]} />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)", colors.background]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Pressable
          style={[styles.backButton, { top: (Platform.OS === "web" ? 67 : insets.top) + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.mainRow}>
            {posterUri && (
              <Image
                source={{ uri: posterUri }}
                style={[styles.poster, { borderRadius: colors.radius }]}
                resizeMode="cover"
              />
            )}
            <View style={styles.mainInfo}>
              <Text style={[styles.movieTitle, { color: colors.foreground }]}>{movie.title}</Text>
              {movie.tagline ? (
                <Text style={[styles.tagline, { color: colors.mutedForeground }]} numberOfLines={2}>{movie.tagline}</Text>
              ) : null}
              <View style={styles.metaChips}>
                {year && (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.chipText, { color: colors.foreground }]}>{year}</Text>
                  </View>
                )}
                {runtime && (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.chipText, { color: colors.foreground }]}>{runtime}</Text>
                  </View>
                )}
                {movie.vote_average && movie.vote_average > 0 ? (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[styles.chipText, { color: colors.foreground }]}>
                      {movie.vote_average.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>
              {movie.genres && movie.genres.length > 0 && (
                <View style={styles.genreRow}>
                  {movie.genres.slice(0, 3).map((g) => (
                    <View key={g.id} style={[styles.genreBadge, { backgroundColor: colors.accent, borderRadius: 6 }]}>
                      <Text style={[styles.genreText, { color: colors.accentForeground }]}>{g.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {movie.overview ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
              <Text style={[styles.overview, { color: colors.mutedForeground }]}>{movie.overview}</Text>
            </View>
          ) : null}

          {((movie.budget ?? 0) > 0 || (movie.revenue ?? 0) > 0) && (
            <View style={[styles.statsRow, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              {(movie.budget ?? 0) > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Budget</Text>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>
                    ${(movie.budget! / 1_000_000).toFixed(0)}M
                  </Text>
                </View>
              )}
              {(movie.revenue ?? 0) > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Revenue</Text>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>
                    ${(movie.revenue! / 1_000_000).toFixed(0)}M
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontWeight: "600" as const },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  backdrop: { height: BACKDROP_HEIGHT },
  backdropPlaceholder: { width: "100%", height: BACKDROP_HEIGHT },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: { paddingHorizontal: 16, marginTop: -20 },
  mainRow: { flexDirection: "row", gap: 14, marginBottom: 20 },
  poster: { width: 100, height: 150 },
  mainInfo: { flex: 1, justifyContent: "flex-end", gap: 6 },
  movieTitle: { fontSize: 20, fontWeight: "800" as const, lineHeight: 26 },
  tagline: { fontSize: 13, fontStyle: "italic" },
  metaChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: { fontSize: 12, fontWeight: "500" as const },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  genreBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  genreText: { fontSize: 11, fontWeight: "600" as const },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 8 },
  overview: { fontSize: 14, lineHeight: 22 },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 24,
    marginBottom: 20,
  },
  statItem: { alignItems: "flex-start" },
  statLabel: { fontSize: 12, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "700" as const },
});
