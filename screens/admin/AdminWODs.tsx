import { createWOD, WODInput } from "@/lib/adminService";
import { getWODHoy, WOD } from "@/lib/classService";
import { Plus, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminWODs() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wod, setWod] = useState<WOD | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WODInput>({
    titulo: "",
    modalidad: "AMRAP",
    timeCap: 20,
    ejercicios: [{ nombre: "", cantidad: "", peso: "" }],
    notas: "",
    fecha: new Date(),
  });

  const loadWOD = useCallback(async () => {
    try {
      const data = await getWODHoy();
      setWod(data);
    } catch (error) {
      console.error("Error cargando WOD:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWOD();
  }, [loadWOD]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWOD();
  }, [loadWOD]);

  const addEjercicio = () => {
    setFormData({
      ...formData,
      ejercicios: [
        ...formData.ejercicios,
        { nombre: "", cantidad: "", peso: "" },
      ],
    });
  };

  const updateEjercicio = (
    index: number,
    field: "nombre" | "cantidad" | "peso",
    value: string
  ) => {
    const newEjercicios = [...formData.ejercicios];
    newEjercicios[index][field] = value;
    setFormData({ ...formData, ejercicios: newEjercicios });
  };

  const removeEjercicio = (index: number) => {
    if (formData.ejercicios.length > 1) {
      const newEjercicios = formData.ejercicios.filter((_, i) => i !== index);
      setFormData({ ...formData, ejercicios: newEjercicios });
    }
  };

  const handleCreate = async () => {
    if (!formData.titulo || formData.ejercicios.length === 0) {
      Alert.alert("Error", "Por favor completa los campos requeridos");
      return;
    }

    // Filtrar ejercicios vacíos
    const ejerciciosValidos = formData.ejercicios.filter((e) =>
      e.nombre.trim()
    );
    if (ejerciciosValidos.length === 0) {
      Alert.alert("Error", "Agrega al menos un ejercicio");
      return;
    }

    setSaving(true);
    try {
      const result = await createWOD({
        ...formData,
        ejercicios: ejerciciosValidos,
        fecha: selectedDate,
      });

      if (result.success) {
        setModalVisible(false);
        resetForm();
        loadWOD();
        Alert.alert("Éxito", "WOD creado correctamente");
      } else {
        Alert.alert("Error", result.error || "No se pudo crear el WOD");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al crear el WOD");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      modalidad: "AMRAP",
      timeCap: 20,
      ejercicios: [{ nombre: "", cantidad: "", peso: "" }],
      notas: "",
      fecha: new Date(),
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const modalidades = [
    "AMRAP",
    "For Time",
    "EMOM",
    "Tabata",
    "Strength",
    "Chipper",
  ];

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
        <Text style={styles.headerTitle}>Gestión de WODs</Text>
        <Text style={styles.headerSubtitle}>{formatDate(new Date())}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {wod ? (
          <View style={styles.wodCard}>
            <View style={styles.wodHeader}>
              <Text style={styles.wodTitle}>{wod.titulo}</Text>
              <View style={styles.wodBadge}>
                <Text style={styles.wodBadgeText}>{wod.modalidad}</Text>
              </View>
            </View>

            {wod.timeCap && (
              <Text style={styles.wodTimeCap}>
                ⏱️ Time Cap: {wod.timeCap} min
              </Text>
            )}

            <View style={styles.ejerciciosList}>
              {wod.ejercicios.map((ej, idx) => (
                <View key={idx} style={styles.ejercicioItem}>
                  <Text style={styles.ejercicioText}>
                    {ej.cantidad} {ej.nombre}
                    {ej.peso ? ` (${ej.peso})` : ""}
                  </Text>
                </View>
              ))}
            </View>

            {wod.notas && (
              <View style={styles.notasContainer}>
                <Text style={styles.notasLabel}>Notas:</Text>
                <Text style={styles.notasText}>{wod.notas}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay WOD para hoy</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para agregar el WOD del día
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Modalidades Disponibles</Text>
          <Text style={styles.infoText}>
            AMRAP, For Time, EMOM, Tabata, Strength, Chipper
          </Text>
        </View>
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
              <Text style={styles.modalTitle}>Nuevo WOD</Text>
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
                placeholder="Ej: WOD del día, Benchmark Fran"
              />

              <Text style={styles.inputLabel}>Modalidad</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.modalidadesScroll}
              >
                {modalidades.map((mod) => (
                  <TouchableOpacity
                    key={mod}
                    style={[
                      styles.modalidadChip,
                      formData.modalidad === mod && styles.modalidadChipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, modalidad: mod })}
                  >
                    <Text
                      style={[
                        styles.modalidadChipText,
                        formData.modalidad === mod &&
                          styles.modalidadChipTextActive,
                      ]}
                    >
                      {mod}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Time Cap (minutos)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.timeCap || "")}
                onChangeText={(t) =>
                  setFormData({ ...formData, timeCap: Number(t) || undefined })
                }
                keyboardType="number-pad"
                placeholder="20"
              />

              <Text style={styles.inputLabel}>Ejercicios *</Text>
              {formData.ejercicios.map((ej, idx) => (
                <View key={idx} style={styles.ejercicioForm}>
                  <View style={styles.ejercicioInputs}>
                    <TextInput
                      style={[styles.input, styles.cantidadInput]}
                      value={ej.cantidad}
                      onChangeText={(t) => updateEjercicio(idx, "cantidad", t)}
                      placeholder="21"
                    />
                    <TextInput
                      style={[styles.input, styles.nombreInput]}
                      value={ej.nombre}
                      onChangeText={(t) => updateEjercicio(idx, "nombre", t)}
                      placeholder="Thrusters"
                    />
                    <TextInput
                      style={[styles.input, styles.pesoInput]}
                      value={ej.peso}
                      onChangeText={(t) => updateEjercicio(idx, "peso", t)}
                      placeholder="95#"
                    />
                  </View>
                  {formData.ejercicios.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeEjButton}
                      onPress={() => removeEjercicio(idx)}
                    >
                      <Trash2 size={18} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addEjButton}
                onPress={addEjercicio}
              >
                <Plus size={18} color="#dc2626" />
                <Text style={styles.addEjButtonText}>Agregar ejercicio</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notas}
                onChangeText={(t) => setFormData({ ...formData, notas: t })}
                placeholder="Instrucciones adicionales..."
                multiline
                numberOfLines={3}
              />
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
                  <Text style={styles.saveButtonText}>Guardar</Text>
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
    textTransform: "capitalize",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  wodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  wodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  wodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  wodBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  wodBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d97706",
  },
  wodTimeCap: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  ejerciciosList: {
    gap: 8,
  },
  ejercicioItem: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ejercicioText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  notasContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
  },
  notasLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  notasText: {
    fontSize: 14,
    color: "#1e40af",
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
  infoCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#16a34a",
    lineHeight: 20,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalidadesScroll: {
    marginTop: 8,
  },
  modalidadChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  modalidadChipActive: {
    backgroundColor: "#fef2f2",
  },
  modalidadChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalidadChipTextActive: {
    color: "#dc2626",
  },
  ejercicioForm: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  ejercicioInputs: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  cantidadInput: {
    width: 60,
    flex: 0,
  },
  nombreInput: {
    flex: 1,
  },
  pesoInput: {
    width: 70,
    flex: 0,
  },
  removeEjButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  addEjButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addEjButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
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
