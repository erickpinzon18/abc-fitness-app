import { formatNewsDate, getCategoryColor, News } from "@/lib/newsService";
import { Newspaper } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_MARGIN = 10;

interface NewsCarouselProps {
  news: News[];
  onNewsPress: (news: News) => void;
}

export function NewsCarousel({ news, onNewsPress }: NewsCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(
      contentOffsetX / (CARD_WIDTH + CARD_MARGIN * 2)
    );
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < news.length) {
      setActiveIndex(newIndex);
    }
  };

  if (news.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Newspaper size={20} color="#dc2626" />
        <Text style={styles.title}>Noticias</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {news.map((item, index) => {
          const categoryColors = getCategoryColor(item.categoria);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => onNewsPress(item)}
            >
              <Image
                source={{ uri: item.imagenUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {/* Overlay oscuro en lugar de LinearGradient */}
              <View style={styles.overlay} />

              {/* Badge de categoría */}
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColors.bg },
                ]}
              >
                <Text
                  style={[styles.categoryText, { color: categoryColors.text }]}
                >
                  {item.categoria}
                </Text>
              </View>

              {/* Badge destacado */}
              {item.destacado && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>⭐ Destacado</Text>
                </View>
              )}

              {/* Contenido */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.titulo}
                </Text>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {item.resumen}
                </Text>
                <Text style={styles.cardDate}>
                  {formatNewsDate(item.fechaPublicacion)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Indicadores de paginación */}
      {news.length > 1 && (
        <View style={styles.pagination}>
          {news.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1f2937",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d97706",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
  },
  paginationDotActive: {
    backgroundColor: "#dc2626",
    width: 18,
  },
});
