import { formatNewsDate, getCategoryColor, News } from "@/lib/newsService";
import { Calendar, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface NewsModalProps {
  visible: boolean;
  news: News | null;
  onClose: () => void;
}

export function NewsModal({ visible, news, onClose }: NewsModalProps) {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(50)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Animación de entrada
  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      backdropOpacity.setValue(0);
      modalTranslateY.setValue(50);
      modalOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 100,
          friction: 15,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      onClose();
    });
  };

  if (!isModalVisible && !visible) return null;
  if (!news) return null;

  const categoryColors = getCategoryColor(news.categoria);

  return (
    <Modal
      visible={isModalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
      </Animated.View>

      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: modalOpacity,
              transform: [{ translateY: modalTranslateY }],
            },
          ]}
        >
          {/* Imagen de cabecera */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: news.imagenUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
            {/* Overlay oscuro */}
            <View style={styles.imageOverlay} />

            {/* Botón cerrar */}
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <X size={20} color="#ffffff" />
            </Pressable>

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
                {news.categoria}
              </Text>
            </View>
          </View>

          {/* Contenido scrollable */}
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Fecha */}
              <View style={styles.dateRow}>
                <Calendar size={14} color="#6b7280" />
                <Text style={styles.dateText}>
                  {formatNewsDate(news.fechaPublicacion)}
                </Text>
              </View>

              {/* Título */}
              <Text style={styles.title}>{news.titulo}</Text>

              {/* Contenido */}
              <Text style={styles.content}>{news.contenido}</Text>
            </ScrollView>
          </View>

          {/* Botón de cerrar */}
          <View style={styles.footer}>
            <Pressable style={styles.closeButtonFull} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  backdropPressable: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 0,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    height: SCREEN_HEIGHT * 0.9,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 15,
  },
  imageContainer: {
    height: 220,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  contentWrapper: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
    lineHeight: 32,
  },
  content: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 26,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  closeButtonFull: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
