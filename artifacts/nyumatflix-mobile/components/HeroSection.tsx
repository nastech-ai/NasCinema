import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { TMDB_IMG, MEDIA_TITLE, type MediaItem } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 420;

interface HeroSectionProps {
  items: MediaItem[];
  loading?: boolean;
}

export function HeroSection({ items, loading = false }: HeroSectionProps) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % Math.min(items.length, 5);
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, items.length]);

  if (loading) {
    return (
      <View style={[styles.hero, { backgroundColor: colors.muted }]}>
        <View style={[styles.heroPlaceholder, { backgroundColor: colors.card }]} />
      </View>
    );
  }

  if (items.length === 0) return null;

  const displayItems = items.slice(0, 5);

  const handlePress = (item: MediaItem) => {
    const type = item.media_type;
    if (type === "tv") router.push(`/tv/${item.id}`);
    else router.push(`/movie/${item.id}`);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
      >
        {displayItems.map((item) => {
          const imageUri = TMDB_IMG(item.backdrop_path || item.poster_path, "w780");
          const title = MEDIA_TITLE(item);
          return (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item)}
              style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
              )}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.95)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
                {item.vote_average && item.vote_average > 0 && (
                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={13} color="#FFD700" />
                    <Text style={styles.metaText}>{item.vote_average.toFixed(1)}</Text>
                    {item.release_date && (
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {new Date(item.release_date).getFullYear()}
                      </Text>
                    )}
                    {item.first_air_date && (
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                        {new Date(item.first_air_date).getFullYear()}
                      </Text>
                    )}
                  </View>
                )}
                <View style={styles.heroActions}>
                  <Pressable style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.playText}>Watch</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.infoBtn, { borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.1)" }]}
                    onPress={() => handlePress(item)}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#fff" />
                    <Text style={styles.infoText}>Info</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {displayItems.length > 1 && (
        <View style={styles.dots}>
          {displayItems.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? colors.primary : "rgba(255,255,255,0.4)",
                  width: i === activeIndex ? 16 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    flex: 1,
    opacity: 0.3,
  },
  heroContent: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800" as const,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500" as const,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playText: {
    color: "#ffffff",
    fontWeight: "700" as const,
    fontSize: 14,
  },
  infoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    color: "#ffffff",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
