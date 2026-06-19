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
import { fetchTvDetail, TMDB_IMG, type MediaItem } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BACKDROP_HEIGHT = 260;

export default function TVDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchTvDetail(id)
      .then(setShow)
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

  if (error || !show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.foreground }]}>Failed to load show</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const backdropUri = TMDB_IMG(show.backdrop_path || show.poster_path, "w780");
  const posterUri = TMDB_IMG(show.poster_path);
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;

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
              <Text style={[styles.showTitle, { color: colors.foreground }]}>{show.name}</Text>
              {show.tagline ? (
                <Text style={[styles.tagline, { color: colors.mutedForeground }]} numberOfLines={2}>{show.tagline}</Text>
              ) : null}
              <View style={styles.metaChips}>
                {year && (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.chipText, { color: colors.foreground }]}>{year}</Text>
                  </View>
                )}
                {show.number_of_seasons && (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="tv-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.chipText, { color: colors.foreground }]}>
                      {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
                    </Text>
                  </View>
                )}
                {show.vote_average && show.vote_average > 0 ? (
                  <View style={[styles.chip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[styles.chipText, { color: colors.foreground }]}>
                      {show.vote_average.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>
              {show.genres && show.genres.length > 0 && (
                <View style={styles.genreRow}>
                  {show.genres.slice(0, 3).map((g) => (
                    <View key={g.id} style={[styles.genreBadge, { backgroundColor: colors.accent, borderRadius: 6 }]}>
                      <Text style={[styles.genreText, { color: colors.accentForeground }]}>{g.name}</Text>
                    </View>
                  ))}
                </View>
              )}
              {show.status && (
                <View style={[styles.statusBadge, { backgroundColor: show.status === "Ended" ? colors.muted : colors.primary + "22", borderRadius: 6 }]}>
                  <Text style={[styles.statusText, { color: show.status === "Ended" ? colors.mutedForeground : colors.primary }]}>
                    {show.status}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {show.overview ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
              <Text style={[styles.overview, { color: colors.mutedForeground }]}>{show.overview}</Text>
            </View>
          ) : null}
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
  showTitle: { fontSize: 20, fontWeight: "800" as const, lineHeight: 26 },
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
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  statusText: { fontSize: 11, fontWeight: "600" as const },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginBottom: 8 },
  overview: { fontSize: 14, lineHeight: 22 },
});
