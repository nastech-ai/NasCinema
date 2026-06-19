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
  { id: "popular-movies", label: "Popular", type: "movie" as const },
  { id: "top-rated-movies", label: "Top Rated", type: "movie" as const },
  { id: "scifi-fantasy-movies", label: "Sci-Fi", type: "movie" as const },
  { id: "popular-tvshows", label: "TV Shows", type: "tv" as const },
  { id: "binge-worthy-series", label: "Binge-Worthy", type: "tv" as const },
  { id: "a24-films", label: "A24", type: "movie" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 90;

  useEffect(() => {
    fetchContent("top-rated-movies", "movie", 1)
      .then((items) => setHeroItems(items.slice(0, 5)))
      .catch(console.error)
      .finally(() => setHeroLoading(false));
  }, []);

  const current = CATEGORIES[selectedCat];

  const header = (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{ height: topPad }} />
      <View style={styles.logoRow}>
        <Text style={[styles.logo, { color: colors.primary }]}>NyumatFlix</Text>
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
        mediaType={current.type}
        enrich
        count={40}
        header={header}
        paddingBottom={bottomPad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 4,
  },
  logo: {
    fontSize: 22,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  filterBar: {
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
