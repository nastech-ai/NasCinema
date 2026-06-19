import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchContent, type MediaItem } from "@/lib/api";
import { HeroSection } from "@/components/HeroSection";
import { ContentGrid } from "@/components/ContentGrid";

const CATEGORIES = [
  { id: "popular-movies", label: "Popular" },
  { id: "top-rated-movies", label: "Top Rated" },
  { id: "action-movies", label: "Action" },
  { id: "drama-movies", label: "Drama" },
  { id: "comedy-movies", label: "Comedy" },
  { id: "thriller-movies", label: "Thriller" },
  { id: "horror-movies", label: "Horror" },
  { id: "scifi-fantasy-movies", label: "Sci-Fi" },
  { id: "a24-films", label: "A24" },
  { id: "nolan-films", label: "Nolan" },
];

export default function MoviesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    fetchContent("popular-movies", "movie", 1)
      .then((items) => setHeroItems(items.slice(0, 5)))
      .catch(console.error)
      .finally(() => setHeroLoading(false));
  }, []);

  const current = CATEGORIES[selectedCat];

  const header = (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{ height: topPad + 8 }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Movies</Text>
      </View>
      <HeroSection items={heroItems} loading={heroLoading} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCat(i)}
            style={[
              styles.filterChip,
              {
                backgroundColor: i === selectedCat ? colors.primary : colors.muted,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: i === selectedCat ? "#fff" : colors.mutedForeground },
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContentGrid
        key={current.id}
        rowId={current.id}
        mediaType="movie"
        enrich
        count={40}
        header={header}
        paddingBottom={Platform.OS === "web" ? 84 : 90}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" as const },
  filterBar: { paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6 },
  filterLabel: { fontSize: 13, fontWeight: "600" as const },
});
