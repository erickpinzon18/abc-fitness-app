import { ConfirmModal, ModalType } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import {
  cancelarReservacion,
  Clase,
  getClasesPorFecha,
  getProximaClaseUsuario,
  getWODHoy,
  hacerCheckIn,
  UserReservation,
  WOD,
} from "@/lib/classService";
import {
  getDiasEntrenamientoMes,
  verificarRachaAlIniciar,
} from "@/lib/streakService";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Timestamp } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MainTabsParamList = {
  Home: undefined;
  Booking: undefined;
  Ranking: undefined;
  Profile: undefined;
};

type Props = BottomTabScreenProps<MainTabsParamList, "Home">;

// Tipo para el estado de la clase
type ClassTimeStatus = {
  status: "upcoming" | "soon" | "live" | "ended";
  label: string;
  timeLeft?: string;
  canCheckIn: boolean;
  color: string;
  bgColor: string;
};

// Helper para obtener el saludo según la hora
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

// Helper para calcular el estado temporal de la clase
const getClassTimeStatus = (
  fecha: Date,
  horaInicio: string,
  horaFin: string
): ClassTimeStatus => {
  const ahora = new Date();

  // Crear fecha/hora de inicio y fin de la clase
  const [horaIni, minIni] = horaInicio.split(":").map(Number);
  const [horaEnd, minEnd] = horaFin.split(":").map(Number);

  const inicioClase = new Date(fecha);
  inicioClase.setHours(horaIni, minIni, 0, 0);

  const finClase = new Date(fecha);
  finClase.setHours(horaEnd, minEnd, 0, 0);

  const diffMs = inicioClase.getTime() - ahora.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  // Ya terminó la clase
  if (ahora > finClase) {
    return {
      status: "ended",
      label: "¡Asististe! 🎉",
      canCheckIn: false,
      color: "#16a34a",
      bgColor: "#dcfce7",
    };
  }

  // La clase está en curso
  if (ahora >= inicioClase && ahora <= finClase) {
    const minsRestantes = Math.floor(
      (finClase.getTime() - ahora.getTime()) / (1000 * 60)
    );
    return {
      status: "live",
      label: "🔴 EN VIVO",
      timeLeft: `${minsRestantes} min restantes`,
      canCheckIn: true,
      color: "#dc2626",
      bgColor: "#fee2e2",
    };
  }

  // Falta poco (menos de 30 minutos)
  if (diffMins > 0 && diffMins <= 30) {
    return {
      status: "soon",
      label: "¡Ya casi!",
      timeLeft: `en ${diffMins} min`,
      canCheckIn: true,
      color: "#d97706",
      bgColor: "#fef3c7",
    };
  }

  // Falta varias horas
  return {
    status: "upcoming",
    label: "Próximamente",
    timeLeft:
      diffHours > 0
        ? `en ${diffHours}h ${diffMins % 60}m`
        : `en ${diffMins} min`,
    canCheckIn: false,
    color: "#6b7280",
    bgColor: "#f3f4f6",
  };
};

export default function DashboardScreen({ navigation }: Props) {
  const { userData, user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proximaClase, setProximaClase] = useState<
    (UserReservation & { id: string }) | null
  >(null);
  const [clasesMañana, setClasesMañana] = useState<Clase[]>([]);
  const [diasEntrenamiento, setDiasEntrenamiento] = useState(0);
  const [streak, setStreak] = useState(userData?.streak || 0);
  const [streakAnimating, setStreakAnimating] = useState(false);
  const [wodHoy, setWodHoy] = useState<WOD | null>(null);
  const [timeStatus, setTimeStatus] = useState<ClassTimeStatus | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("checkin");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const firstName = userData?.displayName?.split(" ")[0] || "Atleta";

  console.log("🏠 HomeScreen rendered - test version with more UI");

  const cargarProximaClase = useCallback(async () => {
    if (!user) return;
    try {
      const clase = await getProximaClaseUsuario(user.uid);
      setProximaClase(clase);
    } catch (error) {
      console.error("Error cargando próxima clase:", error);
    }
  }, [user]);

  const cargarClasesMañana = useCallback(async () => {
    try {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      mañana.setHours(0, 0, 0, 0);
      const clases = await getClasesPorFecha(mañana);
      setClasesMañana(clases);
    } catch (error) {
      console.error("Error cargando clases de mañana:", error);
    }
  }, []);

  const cargarWOD = useCallback(async () => {
    try {
      const wod = await getWODHoy();
      setWodHoy(wod);
    } catch (error) {
      console.error("Error cargando WOD:", error);
    }
  }, []);

  const verificarRacha = useCallback(async () => {
    if (!user) return;
    try {
      const dias = await getDiasEntrenamientoMes(user.uid);
      setDiasEntrenamiento(dias);

      const resultado = await verificarRachaAlIniciar(user.uid);
      setStreak(resultado.currentStreak);
    } catch (error) {
      console.error("Error verificando racha:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        cargarProximaClase(),
        cargarClasesMañana(),
        cargarWOD(),
        verificarRacha(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [cargarProximaClase, cargarClasesMañana, cargarWOD, verificarRacha]);

  // Actualizar estado del tiempo cada 30 segundos
  useEffect(() => {
    if (!proximaClase) {
      setTimeStatus(null);
      return;
    }

    const updateTimeStatus = () => {
      const fechaClase =
        proximaClase.fecha instanceof Timestamp
          ? proximaClase.fecha.toDate()
          : proximaClase.fecha;
      const status = getClassTimeStatus(
        fechaClase,
        proximaClase.horaInicio,
        proximaClase.horaFin
      );
      setTimeStatus(status);
    };

    updateTimeStatus();
    const interval = setInterval(updateTimeStatus, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [proximaClase]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      cargarProximaClase(),
      cargarClasesMañana(),
      cargarWOD(),
      verificarRacha(),
    ]);
    setRefreshing(false);
  }, [cargarProximaClase, cargarClasesMañana, cargarWOD, verificarRacha]);

  const goToBooking = () => {
    navigation.navigate("Booking");
  };

  const goToProfile = () => {
    navigation.navigate("Profile");
  };

  // Modal handlers
  const showCheckInModal = () => {
    setModalType("checkin");
    setModalTitle("¡Ya llegué! 🏋️");
    setModalMessage("Confirma tu asistencia para registrar tu entrenamiento");
    setModalVisible(true);
  };

  const showCancelModal = () => {
    setModalType("cancel");
    setModalTitle("Cancelar Reservación");
    setModalMessage("Esta acción no se puede deshacer");
    setModalVisible(true);
  };

  const handleModalConfirm = async () => {
    if (!proximaClase || !user?.uid) return;

    try {
      if (modalType === "checkin") {
        const result = await hacerCheckIn(proximaClase.claseId, user.uid);
        if (result.success) {
          setModalVisible(false);
          setModalType("success");
          setModalTitle("¡Listo! 💪");
          setModalMessage(result.streakMessage || "¡Check-in realizado!");
          setModalVisible(true);

          if (result.newStreak !== undefined) {
            setStreak(result.newStreak);
            setStreakAnimating(true);
          }

          await cargarProximaClase();
          await refreshUserData();
        } else {
          setModalVisible(false);
          setModalType("error");
          setModalTitle("Error");
          setModalMessage(result.error || "No se pudo hacer check-in");
          setModalVisible(true);
        }
      } else if (modalType === "cancel") {
        const result = await cancelarReservacion(
          proximaClase.claseId,
          user.uid
        );
        if (result.success) {
          setModalVisible(false);
          setModalType("success");
          setModalTitle("Cancelado");
          setModalMessage("Tu reservación ha sido cancelada");
          setModalVisible(true);
          await cargarProximaClase();
        } else {
          setModalVisible(false);
          setModalType("error");
          setModalTitle("Error");
          setModalMessage(result.error || "No se pudo cancelar");
          setModalVisible(true);
        }
      }
    } catch (error) {
      setModalVisible(false);
      setModalType("error");
      setModalTitle("Error");
      setModalMessage("Ocurrió un error. Intenta de nuevo.");
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#dc2626"
            colors={["#dc2626"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{firstName} 🔥</Text>
          </View>
          <TouchableOpacity onPress={goToProfile}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=11" }}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Este Mes</Text>
            <Text style={styles.statValue}>
              {diasEntrenamiento} <Text style={styles.statUnit}>días</Text>
            </Text>
          </View>
          <View style={[styles.statCard, styles.streakCard]}>
            <Text style={styles.streakValue}>{streak}</Text>
            <Text style={styles.streakLabel}>🔥 Racha</Text>
          </View>
        </View>

        {/* Next Class */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tu Próxima Clase</Text>
            {proximaClase && (
              <View
                style={[styles.statusBadge, { backgroundColor: "#dcfce7" }]}
              >
                <Text style={[styles.statusBadgeText, { color: "#16a34a" }]}>
                  {proximaClase.status === "checked-in"
                    ? "Check-in ✓"
                    : "Confirmada"}
                </Text>
              </View>
            )}
          </View>
          {proximaClase ? (
            <View style={styles.classCard}>
              {/* Time status badge */}
              {timeStatus && (
                <View
                  style={[
                    styles.timeBadge,
                    { backgroundColor: timeStatus.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.timeBadgeText, { color: timeStatus.color }]}
                  >
                    {timeStatus.status === "ended" ||
                    timeStatus.status === "live"
                      ? timeStatus.label
                      : timeStatus.timeLeft}
                  </Text>
                </View>
              )}

              <Text style={styles.className}>{proximaClase.claseNombre}</Text>
              <Text style={styles.classTime}>
                {proximaClase.horaInicio} - {proximaClase.horaFin}
              </Text>
              <Text style={styles.classInstructor}>
                {proximaClase.instructor}
              </Text>

              {/* Buttons */}
              <View style={styles.classButtons}>
                {proximaClase.status === "checked-in" ? (
                  <View style={styles.checkedInBadge}>
                    <Text style={styles.checkedInText}>✓ Ya estás aquí</Text>
                  </View>
                ) : timeStatus?.canCheckIn ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.checkInButton,
                        timeStatus.status === "live" && {
                          backgroundColor: "#16a34a",
                        },
                      ]}
                      onPress={showCheckInModal}
                    >
                      <Text style={styles.checkInButtonText}>
                        {timeStatus.status === "live"
                          ? "¡Ya llegué!"
                          : "Ya estoy aquí"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={showCancelModal}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.waitingButton}>
                      <Text style={styles.waitingButtonText}>
                        {timeStatus?.timeLeft
                          ? `Check-in ${timeStatus.timeLeft}`
                          : "Esperando..."}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={showCancelModal}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Sin clases reservadas</Text>
              <TouchableOpacity style={styles.bookButton} onPress={goToBooking}>
                <Text style={styles.bookButtonText}>Reservar Clase</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tomorrow's Classes */}
        {clasesMañana.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clases de Mañana</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {clasesMañana.map((clase) => (
                <TouchableOpacity
                  key={clase.id}
                  style={styles.quickBookCard}
                  onPress={() => {
                    setModalType("reserve");
                    setModalTitle("Reservar Clase");
                    setModalMessage(
                      `¿Reservar ${clase.clase} a las ${clase.horaInicio}?`
                    );
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.quickBookTime}>{clase.horaInicio}</Text>
                  <Text style={styles.quickBookName}>{clase.clase}</Text>
                  <Text style={styles.quickBookInstructor}>
                    {clase.instructor}
                  </Text>
                  <View style={styles.quickBookSpots}>
                    <Text style={styles.quickBookSpotsText}>
                      {(clase.capacidadMaxima || 20) -
                        (clase.reservacionesCount || 0)}{" "}
                      lugares
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* WOD Preview */}
        {wodHoy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WOD de Hoy</Text>
            <View style={styles.wodCard}>
              <Text style={styles.wodName}>{wodHoy.titulo}</Text>
              <Text style={styles.wodType}>{wodHoy.modalidad}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onConfirm={
          modalType === "success" || modalType === "error"
            ? () => setModalVisible(false)
            : handleModalConfirm
        }
        onCancel={() => setModalVisible(false)}
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
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#6b7280",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: "#22c55e",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statUnit: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "normal",
  },
  streakCard: {
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#dc2626",
  },
  streakLabel: {
    fontSize: 12,
    color: "#dc2626",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  classCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  classTime: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  classInstructor: {
    fontSize: 14,
    color: "#9ca3af",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  wodCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  wodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  wodType: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  classButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  checkedInBadge: {
    flex: 1,
    backgroundColor: "#dcfce7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkedInText: {
    color: "#16a34a",
    fontWeight: "bold",
  },
  checkInButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkInButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  waitingButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  waitingButtonText: {
    color: "#6b7280",
    fontWeight: "500",
    fontSize: 14,
  },
  horizontalScroll: {
    paddingVertical: 4,
    gap: 12,
    flexDirection: "row",
  },
  quickBookCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    width: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickBookTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  quickBookName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  quickBookInstructor: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  quickBookSpots: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  quickBookSpotsText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },
});
