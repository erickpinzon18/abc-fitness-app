import {
  createNews,
  deleteNews,
  getAllNews,
  NewsInput,
  updateNews,
} from "@/lib/adminService";
import { Plus, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NoticiaItem extends NewsInput {
  id: string;
}

export default function AdminNoticias() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noticias, setNoticias] = useState<NoticiaItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<NewsInput>({
    titulo: "",
    resumen: "",
    contenido: "",
    imagenUrl: "",
    categoria: "General",
    fechaPublicacion: new Date(),
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    activo: true,
    destacado: false,
  });

  const loadNoticias = useCallback(async () => {
    try {
      const data = await getAllNews();
      setNoticias(data);
    } catch (error) {
      console.error("Error cargando noticias:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNoticias();
  }, [loadNoticias]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNoticias();
  }, [loadNoticias]);

  const handleCreate = async () => {
    if (!formData.titulo || !formData.resumen || !formData.contenido) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      const result = await createNews(formData);

      if (result.success) {
        setModalVisible(false);
        resetForm();
        loadNoticias();
        Alert.alert("Éxito", "Noticia creada correctamente");
      } else {
        Alert.alert("Error", result.error || "No se pudo crear la noticia");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al crear la noticia");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    try {
      const result = await updateNews(id, { activo: !activo });
      if (result.success) {
        loadNoticias();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la noticia");
    }
  };

  const handleDelete = (id: string, titulo: string) => {
    Alert.alert("Eliminar Noticia", `¿Estás seguro de eliminar "${titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const result = await deleteNews(id);
          if (result.success) {
            loadNoticias();
          } else {
            Alert.alert("Error", result.error || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      resumen: "",
      contenido: "",
      imagenUrl: "",
      categoria: "General",
      fechaPublicacion: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      activo: true,
      destacado: false,
    });
  };

  const categorias = ["General", "Horarios", "Promociones", "Eventos"];

  const getCategoriaColor = (cat: string) => {
    switch (cat) {
      case "Horarios":
        return { bg: "#dbeafe", text: "#1d4ed8" };
      case "Promociones":
        return { bg: "#dcfce7", text: "#16a34a" };
      case "Eventos":
        return { bg: "#fef3c7", text: "#d97706" };
      default:
        return { bg: "#f3f4f6", text: "#4b5563" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Noticias</Text>
        <Text style={styles.headerSubtitle}>
          {noticias.filter((n) => n.activo).length} activas de {noticias.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {noticias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay noticias</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para agregar una noticia
            </Text>
          </View>
        ) : (
          noticias.map((noticia) => {
            const catColor = getCategoriaColor(noticia.categoria);
            return (
              <View
                key={noticia.id}
                style={[
                  styles.noticiaCard,
                  !noticia.activo && styles.noticiaCardInactive,
                ]}
              >
                <View style={styles.noticiaHeader}>
                  <View
                    style={[
                      styles.categoriaBadge,
                      { backgroundColor: catColor.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoriaBadgeText,
                        { color: catColor.text },
                      ]}
                    >
                      {noticia.categoria}
                    </Text>
                  </View>
                  {noticia.destacado && (
                    <View style={styles.destacadoBadge}>
                      <Text style={styles.destacadoBadgeText}>
                        ⭐ Destacado
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.noticiaTitulo}>{noticia.titulo}</Text>
                <Text style={styles.noticiaResumen} numberOfLines={2}>
                  {noticia.resumen}
                </Text>

                <View style={styles.noticiaFooter}>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Activo</Text>
                    <Switch
                      value={noticia.activo}
                      onValueChange={() =>
                        handleToggleActivo(noticia.id, noticia.activo)
                      }
                      trackColor={{ false: "#d1d5db", true: "#fecaca" }}
                      thumbColor={noticia.activo ? "#dc2626" : "#9ca3af"}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(noticia.id, noticia.titulo)}
                  >
                    <Trash2 size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal de Crear */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Noticia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.input}
                value={formData.titulo}
                onChangeText={(t) => setFormData({ ...formData, titulo: t })}
                placeholder="Título de la noticia"
              />

              <Text style={styles.inputLabel}>Resumen *</Text>
              <TextInput
                style={styles.input}
                value={formData.resumen}
                onChangeText={(t) => setFormData({ ...formData, resumen: t })}
                placeholder="Resumen corto (max 100 caracteres)"
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Contenido *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.contenido}
                onChangeText={(t) => setFormData({ ...formData, contenido: t })}
                placeholder="Contenido completo de la noticia..."
                multiline
                numberOfLines={5}
              />

              <Text style={styles.inputLabel}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.imagenUrl}
                onChangeText={(t) => setFormData({ ...formData, imagenUrl: t })}
                placeholder="https://..."
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriasScroll}
              >
                {categorias.map((cat) => {
                  const color = getCategoriaColor(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoriaChip,
                        formData.categoria === cat && {
                          backgroundColor: color.bg,
                        },
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, categoria: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.categoriaChipText,
                          formData.categoria === cat && { color: color.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Activo</Text>
                  <Switch
                    value={formData.activo}
                    onValueChange={(v) =>
                      setFormData({ ...formData, activo: v })
                    }
                    trackColor={{ false: "#d1d5db", true: "#fecaca" }}
                    thumbColor={formData.activo ? "#dc2626" : "#9ca3af"}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Destacado</Text>
                  <Switch
                    value={formData.destacado}
                    onValueChange={(v) =>
                      setFormData({ ...formData, destacado: v })
                    }
                    trackColor={{ false: "#d1d5db", true: "#fef3c7" }}
                    thumbColor={formData.destacado ? "#d97706" : "#9ca3af"}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  noticiaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  noticiaCardInactive: {
    opacity: 0.6,
  },
  noticiaHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  categoriaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoriaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  destacadoBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  destacadoBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d97706",
  },
  noticiaTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  noticiaResumen: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  noticiaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoriasScroll: {
    marginTop: 8,
  },
  categoriaChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoriaChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  switchContainer: {
    marginTop: 24,
    gap: 16,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
