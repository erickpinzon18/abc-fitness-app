import { ClasePlan, getClasesPlan } from "@/lib/planesService";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Gift, Sparkles, Users, Zap } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

export default function PlanesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [planes, setPlanes] = useState<ClasePlan[]>([]);

  const loadPlanes = useCallback(async () => {
    try {
      const data = await getClasesPlan();
      setPlanes(data);
    } catch (error) {
      console.error("Error loading planes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlanes();
  }, [loadPlanes]);

  const getDefaultImage = (name: string) => {
    const colors: Record<string, string> = {
      CrossFit: "dc2626",
      Funcional: "1a1a1a",
      Halterofilia: "f59e0b",
      Zumba: "ec4899",
      "Indoor Cycling": "3b82f6",
      Flexibilidad: "8b5cf6",
      "Funcional Kids": "22c55e",
      "Salsa y Cumbia": "ef4444",
      "Eventos Especiales": "6b7280",
    };
    const color = colors[name] || "dc2626";
    return `https://placehold.co/600x400/${color}/white?text=${encodeURIComponent(
      name
    )}&font=montserrat`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuestros Planes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Sparkles size={24} color="#dc2626" />
          <Text style={styles.introText}>
            Descubre todas las clases disponibles en AVC Fitness
          </Text>
        </View>

        {/* Plans Grid */}
        {planes.map((plan) => {
          // Color mapping for fallback headers
          const colorMap: Record<string, string> = {
            CrossFit: "#dc2626",
            Funcional: "#1f2937",
            Halterofilia: "#f59e0b",
            Zumba: "#ec4899",
            "Indoor Cycling": "#3b82f6",
            Flexibilidad: "#8b5cf6",
            "Funcional Kids": "#22c55e",
            "Salsa y Cumbia": "#ef4444",
            "Eventos Especiales": "#6b7280",
          };
          const bgColor = colorMap[plan.name] || "#dc2626";
          const hasImage = plan.image && !plan.image.includes("placehold.co");

          return (
            <View key={plan.id} style={styles.card}>
              {/* Image or Fallback Header */}
              {hasImage ? (
                <Image
                  source={{ uri: plan.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.cardImageFallback,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <Text style={styles.cardImageFallbackText}>{plan.name}</Text>
                </View>
              )}

              {/* Promo Badge */}
              {plan.promo && (
                <View style={styles.promoBadge}>
                  <Gift size={12} color="#ffffff" />
                  <Text style={styles.promoText}>{plan.promo}</Text>
                </View>
              )}

              {/* Free Trial Badge */}
              {plan.freeTrial && (
                <View style={styles.trialBadge}>
                  <Text style={styles.trialText}>PRUEBA GRATIS</Text>
                </View>
              )}

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{plan.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {plan.description}
                </Text>

                {/* Benefits */}
                <View style={styles.benefitsRow}>
                  <Zap size={14} color="#f59e0b" />
                  <Text style={styles.benefitsText}>{plan.benefits}</Text>
                </View>

                {/* Target */}
                <View style={styles.targetRow}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.targetText}>{plan.target}</Text>
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Precio:</Text>
                  <Text style={styles.priceValue}>{plan.price}</Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Más Información</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {planes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay planes disponibles</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  introText: {
    flex: 1,
    fontSize: 14,
    color: "#991b1b",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },
  cardImageFallback: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageFallbackText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  promoBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  promoText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  trialBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trialText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cardContent: {
    padding: 20,
  },
  cardName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  benefitsText: {
    flex: 1,
    fontSize: 13,
    color: "#b45309",
    fontWeight: "500",
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 8,
  },
  targetText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
  },
  priceContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  ctaButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});
