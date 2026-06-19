import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { TMDB_IMG, MEDIA_TITLE, type MediaItem } from "@/lib/api";

interface MediaCardProps {
  item: MediaItem;
  onPress?: () => void;
  width?: number;
  height?: number;
  showRating?: boolean;
  rank?: number;
}

export function MediaCard({
  item,
  onPress,
  width = 130,
  height = 195,
  showRating = false,
  rank,
}: MediaCardProps) {
  const colors = useColors();
  const imageUri = TMDB_IMG(item.poster_path);
  const title = MEDIA_TITLE(item);
  const rating = item.vote_average?.toFixed(1);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width, opacity: pressed ? 0.8 : 1 },
      ]}
      testID={`media-card-${item.id}`}
    >
      <View
        style={[
          styles.imageContainer,
          { width, height, backgroundColor: colors.card, borderRadius: colors.radius },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius: colors.radius }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: colors.muted, borderRadius: colors.radius },
            ]}
          >
            <Ionicons name="film-outline" size={36} color={colors.mutedForeground} />
          </View>
        )}
        {rank !== undefined && (
          <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
        {showRating && rating && parseFloat(rating) > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.title, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  imageContainer: {
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
  rankBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  title: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
});
