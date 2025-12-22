import { ConfirmModal } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { getWODHoy, registrarResultadoWOD, WOD } from "@/lib/classService";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeft,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Trophy,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootNavigation = NativeStackNavigationProp<any>;
type ResultType = "time" | "rounds" | "reps";

interface ResultInput {
  minutes?: string;
  seconds?: string;
  rounds?: string;
  reps?: string;
  weight?: string;
}

export default function WODScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { user, userData } = useAuth();
  const [wod, setWod] = useState<WOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resultType, setResultType] = useState<ResultType>("time");
  const [result, setResult] = useState<ResultInput>({});
  const [notes, setNotes] = useState("");
  const [rxLevel, setRxLevel] = useState<"rx" | "scaled" | "rx+">("rx");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Cargar WOD del día
  const cargarWOD = useCallback(async () => {
    try {
      const wodHoy = await getWODHoy();
      setWod(wodHoy);

      // Determinar tipo de resultado basado en modalidad
      if (wodHoy) {
        const modalidad = wodHoy.modalidad.toLowerCase();
        if (modalidad.includes("amrap")) {
          setResultType("rounds");
        } else if (modalidad.includes("emom") || modalidad.includes("time")) {
          setResultType("time");
        }
      }
    } catch (error) {
      console.error("Error cargando WOD:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarWOD();
  }, [cargarWOD]);

  // Formatear resultado para mostrar
  const getFormattedResult = (): string => {
    switch (resultType) {
      case "time":
        const mins = result.minutes || "0";
        const secs = result.seconds || "00";
        return `${mins}:${secs.padStart(2, "0")}`;
      case "rounds":
        return `${result.rounds || 0} rounds${
          result.reps ? ` + ${result.reps} reps` : ""
        }`;
      case "reps":
        return `${result.reps || 0} reps`;
      default:
        return "";
    }
  };

  // Guardar resultado
  const handleSave = async () => {
    if (!wod || !user) return;

    setSaving(true);
    try {
      const resultData = {
        tiempo: resultType === "time" ? getFormattedResult() : undefined,
        rondas:
          resultType === "rounds" ? parseInt(result.rounds || "0") : undefined,
        reps: result.reps ? parseInt(result.reps) : undefined,
        peso: rxLevel === "rx+" ? result.weight : undefined,
        rx: rxLevel === "rx" || rxLevel === "rx+",
        notas: notes || undefined,
      };

      const response = await registrarResultadoWOD(
        wod.id,
        user.uid,
        userData?.displayName || "Atleta",
        resultData
      );

      if (response.success) {
        setModalType("success");
        setModalMessage("¡Tu resultado ha sido guardado! 💪");
      } else {
        setModalType("error");
        setModalMessage(response.error || "Error al guardar");
      }
    } catch (error) {
      setModalType("error");
      setModalMessage("Error al guardar el resultado");
    } finally {
      setSaving(false);
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === "success") {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Cargando WOD...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wod) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WOD de Hoy</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Dumbbell size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No hay WOD programado</Text>
          <Text style={styles.emptySubtitle}>
            No hay un WOD programado para hoy. Vuelve más tarde o contacta a tu
            coach.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonLarge}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WOD de Hoy</Text>
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>HOY</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* WOD Info Card */}
          <View style={styles.wodCard}>
            <View style={styles.wodHeader}>
              <View style={styles.modalidadBadge}>
                <Text style={styles.modalidadText}>
                  {wod.modalidad.toUpperCase()}
                  {wod.timeCap ? ` • ${wod.timeCap} MIN` : ""}
                </Text>
              </View>
              <Dumbbell size={28} color="#dc2626" />
            </View>

            <Text style={styles.wodTitle}>"{wod.titulo}"</Text>

            {/* Ejercicios */}
            <View style={styles.ejerciciosList}>
              {wod.ejercicios.map((ejercicio, index) => (
                <View key={index} style={styles.ejercicioItem}>
                  <View style={styles.ejercicioNumber}>
                    <Text style={styles.ejercicioNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.ejercicioText}>
                    {ejercicio.cantidad} {ejercicio.nombre}
                  </Text>
                </View>
              ))}
            </View>

            {wod.notas && (
              <View style={styles.notasCard}>
                <Text style={styles.notasText}>{wod.notas}</Text>
              </View>
            )}
          </View>

          {/* Nivel RX */}
          <Text style={styles.sectionTitle}>Nivel</Text>
          <View style={styles.rxRow}>
            {(["scaled", "rx", "rx+"] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setRxLevel(level)}
                style={[
                  styles.rxButton,
                  rxLevel === level && styles.rxButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.rxButtonText,
                    rxLevel === level && styles.rxButtonTextActive,
                  ]}
                >
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tipo de Resultado */}
          <Text style={styles.sectionTitle}>Tu Resultado</Text>
          <View style={styles.resultTypeRow}>
            {[
              { type: "time" as ResultType, label: "Tiempo", Icon: Clock },
              { type: "rounds" as ResultType, label: "Rounds", Icon: Trophy },
              { type: "reps" as ResultType, label: "Reps", Icon: Flame },
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                onPress={() => setResultType(item.type)}
                style={[
                  styles.resultTypeButton,
                  resultType === item.type && styles.resultTypeButtonActive,
                ]}
              >
                <item.Icon
                  size={18}
                  color={resultType === item.type ? "#dc2626" : "#9ca3af"}
                />
                <Text
                  style={[
                    styles.resultTypeText,
                    resultType === item.type && styles.resultTypeTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input de Resultado */}
          <View style={styles.inputCard}>
            {resultType === "time" && (
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={result.minutes}
                    onChangeText={(text) =>
                      setResult({ ...result, minutes: text })
                    }
                  />
                  <Text style={styles.timeLabel}>min</Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={result.seconds}
                    onChangeText={(text) =>
                      setResult({ ...result, seconds: text })
                    }
                  />
                  <Text style={styles.timeLabel}>seg</Text>
                </View>
              </View>
            )}

            {resultType === "rounds" && (
              <View style={styles.roundsInputRow}>
                <View style={styles.roundsInputGroup}>
                  <TextInput
                    style={styles.roundsInput}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={result.rounds}
                    onChangeText={(text) =>
                      setResult({ ...result, rounds: text })
                    }
                  />
                  <Text style={styles.roundsLabel}>rounds</Text>
                </View>
                <Text style={styles.plusSign}>+</Text>
                <View style={styles.roundsInputGroup}>
                  <TextInput
                    style={styles.repsInput}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={result.reps}
                    onChangeText={(text) =>
                      setResult({ ...result, reps: text })
                    }
                  />
                  <Text style={styles.roundsLabel}>reps</Text>
                </View>
              </View>
            )}

            {resultType === "reps" && (
              <View style={styles.repsOnlyRow}>
                <TextInput
                  style={styles.repsOnlyInput}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={result.reps}
                  onChangeText={(text) => setResult({ ...result, reps: text })}
                />
                <Text style={styles.repsOnlyLabel}>reps totales</Text>
              </View>
            )}

            {/* Preview del resultado */}
            <View style={styles.previewRow}>
              <Check size={18} color="#16a34a" />
              <Text style={styles.previewText}>{getFormattedResult()}</Text>
            </View>
          </View>

          {/* Notas */}
          <Text style={styles.sectionTitle}>Notas (opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Añade notas sobre tu WOD..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Botón Guardar */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Check size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Guardar Resultado</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={modalVisible}
        type={modalType}
        title={modalType === "success" ? "¡Guardado!" : "Error"}
        message={modalMessage}
        onConfirm={handleModalClose}
        onCancel={handleModalClose}
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
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
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  todayBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  backButtonLarge: {
    marginTop: 32,
    backgroundColor: "#dc2626",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  wodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  wodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  modalidadBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalidadText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  wodTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  ejerciciosList: {
    gap: 12,
  },
  ejercicioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ejercicioNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  ejercicioNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  ejercicioText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  notasCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  notasText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  rxRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  rxButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  rxButtonActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  rxButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6b7280",
  },
  rxButtonTextActive: {
    color: "#ffffff",
  },
  resultTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  resultTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  resultTypeButtonActive: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  resultTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  resultTypeTextActive: {
    color: "#dc2626",
  },
  inputCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeInput: {
    width: 80,
    height: 70,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  timeLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  timeSeparator: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  roundsInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  roundsInputGroup: {
    alignItems: "center",
  },
  roundsInput: {
    width: 80,
    height: 70,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  repsInput: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  roundsLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  plusSign: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#9ca3af",
    marginBottom: 20,
  },
  repsOnlyRow: {
    alignItems: "center",
  },
  repsOnlyInput: {
    width: 120,
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    fontSize: 40,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  repsOnlyLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  previewText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  notesInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#dc2626",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
