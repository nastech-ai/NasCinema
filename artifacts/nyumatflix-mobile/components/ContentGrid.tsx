import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { fetchContentRow, TMDB_IMG, MEDIA_TITLE, type MediaItem } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLS = 3;
const CARD_GAP = 4;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * (NUM_COLS + 1)) / NUM_COLS;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface ContentGridProps {
  rowId: string;
  mediaType?: "movie" | "tv";
  enrich?: boolean;
  count?: number;
  header?: React.ReactNode;
  paddingBottom?: number;
}

function GridCard({ item, colors }: { item: MediaItem; colors: ReturnType<typeof useColors> }) {
  const imageUri = TMDB_IMG(item.poster_path);
  const title = MEDIA_TITLE(item);

  const handlePress = () => {
    const type = item.media_type;
    if (type === "tv") router.push(`/tv/${item.id}`);
    else router.push(`/movie/${item.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}
      testID={`grid-card-${item.id}`}
    >
      <View style={[styles.imageBox, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius: colors.radius }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
            <Ionicons name="film-outline" size={24} color={colors.mutedForeground} />
          </View>
        )}
        {item.vote_average && item.vote_average > 0 && (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={9} color="#FFD700" />
            <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

function SkeletonCard({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.card}>
      <View style={[styles.imageBox, { backgroundColor: colors.muted, borderRadius: colors.radius, opacity: 0.5 }]} />
      <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "80%" }]} />
      <View style={[styles.skeletonLine, { backgroundColor: colors.muted, width: "50%" }]} />
    </View>
  );
}

export function ContentGrid({
  rowId,
  mediaType,
  enrich = false,
  count = 40,
  header,
  paddingBottom = 90,
}: ContentGridProps) {
  const colors = useColors();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchContentRow(rowId, count, enrich);
      setItems(data.map((item) => ({ ...item, media_type: mediaType || item.media_type })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rowId, count, enrich, mediaType]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <FlatList
        data={Array.from({ length: 12 })}
        keyExtractor={(_, i) => `sk-${i}`}
        numColumns={NUM_COLS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.list, { paddingBottom }]}
        ListHeaderComponent={header ? () => <>{header}</> : undefined}
        renderItem={() => <SkeletonCard colors={colors} />}
        scrollEnabled={false}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.id}-${item.media_type}`}
      numColumns={NUM_COLS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.list, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header ? () => <>{header}</> : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={colors.primary}
        />
      }
      renderItem={({ item }) => <GridCard item={item} colors={colors} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: CARD_GAP,
    paddingTop: CARD_GAP,
  },
  row: {
    marginBottom: CARD_GAP,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
  },
  imageBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingPill: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600" as const,
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 15,
    paddingHorizontal: 1,
  },
  skeletonLine: {
    height: 9,
    borderRadius: 4,
    marginTop: 4,
    marginLeft: 1,
  },
});
