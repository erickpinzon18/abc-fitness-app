import {
  ClaseInput,
  Coach,
  createClase,
  deleteClase,
  getAllCoaches,
} from "@/lib/adminService";
import { Clase, getClasesPorFecha } from "@/lib/classService";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

// Tipos de clase disponibles
const TIPOS_CLASE = [
  "CrossFit",
  "Funcional",
  "Indoor Cycling",
  "Flexibilidad",
  "Zumba",
  "HIIT",
  "Strength",
];

// Niveles disponibles
const NIVELES = [
  "Todos los niveles",
  "Principiante",
  "Intermedio",
  "Avanzado",
  "RX",
];

export default function AdminClases() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clases, setClases] = useState<Clase[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  // Form state
  const [formData, setFormData] = useState<ClaseInput>({
    clase: "",
    instructor: "",
    fecha: new Date(),
    horaInicio: "",
    horaFin: "",
    duracion: 60,
    capacidadMaxima: 20,
    nivel: "Todos los niveles",
  });

  const loadClases = useCallback(async () => {
    try {
      const data = await getClasesPorFecha(selectedDate);
      setClases(data);
    } catch (error) {
      console.error("Error cargando clases:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadClases();
    // Cargar coaches
    getAllCoaches().then(setCoaches);
  }, [loadClases]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClases();
  }, [loadClases]);

  // Calcular duración automáticamente
  const calcularDuracion = (horaInicio: string, horaFin: string): number => {
    if (!horaInicio || !horaFin) return 60;
    const [hI, mI] = horaInicio.split(":").map(Number);
    const [hF, mF] = horaFin.split(":").map(Number);
    if (isNaN(hI) || isNaN(mI) || isNaN(hF) || isNaN(mF)) return 60;
    const minutos = hF * 60 + mF - (hI * 60 + mI);
    return minutos > 0 ? minutos : 60;
  };

  const handleHoraFinChange = (horaFin: string) => {
    const duracion = calcularDuracion(formData.horaInicio, horaFin);
    setFormData({ ...formData, horaFin, duracion });
  };

  const handleCreate = async () => {
    if (
      !formData.clase ||
      !formData.instructor ||
      !formData.horaInicio ||
      !formData.horaFin
    ) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      const result = await createClase({
        ...formData,
        fecha: selectedDate,
      });

      if (result.success) {
        setModalVisible(false);
        resetForm();
        loadClases();
        Alert.alert("Éxito", "Clase creada correctamente");
      } else {
        Alert.alert("Error", result.error || "No se pudo crear la clase");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al crear la clase");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert("Eliminar Clase", `¿Estás seguro de eliminar "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const result = await deleteClase(id);
          if (result.success) {
            loadClases();
          } else {
            Alert.alert("Error", result.error || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      clase: "",
      instructor: "",
      fecha: new Date(),
      horaInicio: "",
      horaFin: "",
      duracion: 60,
      capacidadMaxima: 20,
      nivel: "Todos los niveles",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Navegación de días
  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
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
        <Text style={styles.headerTitle}>Gestión de Clases</Text>
        <Text style={styles.headerSubtitle}>
          {clases.length} clases programadas
        </Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={goToPrevDay}>
          <Text style={styles.dateButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.dateCenterContainer}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={goToNextDay}>
          <Text style={styles.dateButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {clases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CalendarDays size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No hay clases para este día</Text>
            <Text style={styles.emptySubtext}>
              Toca el botón + para agregar una clase
            </Text>
          </View>
        ) : (
          clases.map((clase) => (
            <View key={clase.id} style={styles.claseCard}>
              <View style={styles.claseTimeBar} />
              <View style={styles.claseInfo}>
                <View style={styles.claseTopRow}>
                  <View style={styles.horaBadge}>
                    <Clock size={12} color="#dc2626" />
                    <Text style={styles.claseHora}>
                      {clase.horaInicio} - {clase.horaFin}
                    </Text>
                  </View>
                  <View style={styles.nivelBadge}>
                    <Text style={styles.nivelText}>{clase.nivel}</Text>
                  </View>
                </View>
                <Text style={styles.claseNombre}>{clase.clase}</Text>
                <Text style={styles.claseInstructor}>
                  👤 {clase.instructor}
                </Text>
                <View style={styles.claseMeta}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.claseMetaText}>
                    {clase.reservacionesCount || 0}/{clase.capacidadMaxima}{" "}
                    reservados
                  </Text>
                  <Text style={styles.claseMetaDot}>•</Text>
                  <Text style={styles.claseMetaText}>{clase.duracion} min</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(clase.id, clase.clase)}
              >
                <Trash2 size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))
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
              <Text style={styles.modalTitle}>Nueva Clase</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalForm}
              showsVerticalScrollIndicator={false}
            >
              {/* Fecha de la clase */}
              <View style={styles.fechaPreview}>
                <CalendarDays size={18} color="#dc2626" />
                <Text style={styles.fechaPreviewText}>
                  Clase para: {formatDateShort(selectedDate)}
                </Text>
              </View>

              {/* Tipo de Clase */}
              <Text style={styles.inputLabel}>Tipo de Clase *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {TIPOS_CLASE.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      formData.clase === tipo && styles.chipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, clase: tipo })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.clase === tipo && styles.chipTextActive,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Input manual si no está en la lista */}
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={
                  TIPOS_CLASE.includes(formData.clase) ? "" : formData.clase
                }
                onChangeText={(t) => setFormData({ ...formData, clase: t })}
                placeholder="O escribe otro tipo..."
              />

              {/* Instructor */}
              <Text style={styles.inputLabel}>Instructor *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {coaches.map((coach) => (
                  <TouchableOpacity
                    key={coach.id}
                    style={[
                      styles.chip,
                      formData.instructor === coach.name && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, instructor: coach.name })
                    }
                  >
                    {coach.image ? (
                      <Image
                        source={{ uri: coach.image }}
                        style={styles.coachAvatar}
                      />
                    ) : null}
                    <Text
                      style={[
                        styles.chipText,
                        formData.instructor === coach.name &&
                          styles.chipTextActive,
                      ]}
                    >
                      {coach.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {coaches.length === 0 && (
                <TextInput
                  style={styles.input}
                  value={formData.instructor}
                  onChangeText={(t) =>
                    setFormData({ ...formData, instructor: t })
                  }
                  placeholder="Nombre del instructor"
                />
              )}

              {/* Horario */}
              <Text style={styles.inputLabel}>Horario *</Text>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Inicio</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.horaInicio}
                    onChangeText={(t) =>
                      setFormData({ ...formData, horaInicio: t })
                    }
                    placeholder="07:00"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Fin</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.horaFin}
                    onChangeText={handleHoraFinChange}
                    placeholder="08:00"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={styles.durationPreview}>
                  <Text style={styles.durationValue}>{formData.duracion}</Text>
                  <Text style={styles.durationLabel}>min</Text>
                </View>
              </View>

              {/* Capacidad */}
              <Text style={styles.inputLabel}>Capacidad Máxima</Text>
              <View style={styles.capacidadRow}>
                <TouchableOpacity
                  style={styles.capacidadButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      capacidadMaxima: Math.max(
                        1,
                        formData.capacidadMaxima - 1
                      ),
                    })
                  }
                >
                  <Text style={styles.capacidadButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.capacidadDisplay}>
                  <Text style={styles.capacidadValue}>
                    {formData.capacidadMaxima}
                  </Text>
                  <Text style={styles.capacidadLabel}>personas</Text>
                </View>
                <TouchableOpacity
                  style={styles.capacidadButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      capacidadMaxima: formData.capacidadMaxima + 1,
                    })
                  }
                >
                  <Text style={styles.capacidadButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Nivel */}
              <Text style={styles.inputLabel}>Nivel</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {NIVELES.map((nivel) => (
                  <TouchableOpacity
                    key={nivel}
                    style={[
                      styles.chip,
                      formData.nivel === nivel && styles.chipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, nivel })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.nivel === nivel && styles.chipTextActive,
                      ]}
                    >
                      {nivel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                  <Text style={styles.saveButtonText}>Crear Clase</Text>
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
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
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
  claseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  claseInfo: {
    flex: 1,
  },
  claseHora: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  claseNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  claseInstructor: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  claseMeta: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  claseMetaText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  // Nuevos estilos
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  dateCenterContainer: {
    flex: 1,
    alignItems: "center",
  },
  claseTimeBar: {
    width: 4,
    height: "100%",
    backgroundColor: "#dc2626",
    borderRadius: 2,
    marginRight: 12,
  },
  claseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  horaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nivelBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nivelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  claseMetaDot: {
    fontSize: 12,
    color: "#9ca3af",
  },
  fechaPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  fechaPreviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  chipsScroll: {
    marginTop: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#fef2f2",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  chipTextActive: {
    color: "#dc2626",
  },
  coachAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  smallLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  durationPreview: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  durationLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  capacidadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 8,
  },
  capacidadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  capacidadButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
  },
  capacidadDisplay: {
    alignItems: "center",
  },
  capacidadValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  capacidadLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
});
