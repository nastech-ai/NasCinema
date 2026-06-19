import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { fetchSearch, TMDB_IMG, MEDIA_TITLE, type MediaItem } from "@/lib/api";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchSearch(q);
      setResults(data.media || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePress = (item: MediaItem) => {
    const type = item.media_type;
    if (type === "tv") router.push(`/tv/${item.id}`);
    else router.push(`/movie/${item.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Movies, TV shows..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              handleSearch(text);
            }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
            testID="search-input"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !searched ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Discover Content</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Search for movies and TV shows
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Results</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.id}-${item.media_type}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 84 : 90 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUri = TMDB_IMG(item.poster_path);
            const title = MEDIA_TITLE(item);
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.resultCard,
                  { opacity: pressed ? 0.8 : 1, backgroundColor: colors.card, borderRadius: colors.radius },
                ]}
                onPress={() => handlePress(item)}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={[styles.resultImage, { borderTopLeftRadius: colors.radius, borderTopRightRadius: colors.radius }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.resultImagePlaceholder, { backgroundColor: colors.muted }]}>
                    <Ionicons name="film-outline" size={32} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {title}
                  </Text>
                  <View style={styles.resultMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: item.media_type === "tv" ? colors.accent : colors.primary + "22" }]}>
                      <Text style={[styles.typeText, { color: item.media_type === "tv" ? colors.accentForeground : colors.primary }]}>
                        {item.media_type === "tv" ? "TV" : "Film"}
                      </Text>
                    </View>
                    {item.vote_average && item.vote_average > 0 && (
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={11} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resultCard: {
    width: "48.5%",
    overflow: "hidden",
  },
  resultImage: {
    width: "100%",
    height: 200,
  },
  resultImagePlaceholder: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: {
    padding: 8,
    paddingBottom: 10,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 6,
    lineHeight: 18,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
  },
});
