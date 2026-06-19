import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { fetchContentRow, type MediaItem } from "@/lib/api";
import { MediaCard } from "./MediaCard";

interface ContentRowProps {
  rowId: string;
  title: string;
  mediaType?: "movie" | "tv";
  ranked?: boolean;
  enrich?: boolean;
}

export function ContentRow({ rowId, title, mediaType, ranked = false, enrich = false }: ContentRowProps) {
  const colors = useColors();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentRow(rowId, 15, enrich)
      .then((data) => setItems(data.map((item) => ({ ...item, media_type: mediaType || item.media_type }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [rowId]);

  const handlePress = (item: MediaItem) => {
    const type = item.media_type || mediaType;
    if (type === "tv") {
      router.push(`/tv/${item.id}`);
    } else {
      router.push(`/movie/${item.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {loading ? (
        <View style={styles.loadingRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skeleton,
                {
                  backgroundColor: colors.muted,
                  borderRadius: colors.radius,
                },
              ]}
            />
          ))}
        </View>
      ) : items.length === 0 ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {items.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              onPress={() => handlePress(item)}
              showRating
              rank={ranked ? index + 1 : undefined}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingRight: 6,
  },
  loadingRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
  },
  skeleton: {
    width: 130,
    height: 195,
  },
});
