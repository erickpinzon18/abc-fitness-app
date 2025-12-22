import { ConfirmModal, ModalType } from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import {
  devAddStreak,
  devResetStreak,
  devSetStreak,
  devSimulateCheckIn,
  devSimulateWOD,
} from "@/lib/devService";
import { auth } from "@/lib/firebase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  Camera,
  ChevronRight,
  History,
  Lock,
  LogOut,
  Shield,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootNavigation = NativeStackNavigationProp<any>;

interface SettingsRowProps {
  icon: any;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  hasArrow?: boolean;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingsRow({
  icon: Icon,
  iconBgColor = "#f3f4f6",
  title,
  subtitle,
  hasArrow = false,
  hasToggle = false,
  toggleValue = false,
  onToggle,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasToggle}
      style={styles.settingsRow}
      activeOpacity={hasToggle ? 1 : 0.7}
    >
      <View style={styles.settingsRowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon
            size={18}
            color={iconBgColor === "#fef2f2" ? "#dc2626" : "#4b5563"}
          />
        </View>
        <View>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {hasArrow && <ChevronRight size={18} color="#9ca3af" />}
      {hasToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: "#e5e7eb", true: "#dc2626" }}
          thumbColor="#ffffff"
          ios_backgroundColor="#e5e7eb"
        />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { user, userData, signOut, refreshUserData } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Password modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordModalType, setPasswordModalType] = useState<ModalType>("info");
  const [passwordModalTitle, setPasswordModalTitle] = useState("");
  const [passwordModalMessage, setPasswordModalMessage] = useState("");
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      setPasswordModalType("error");
      setPasswordModalTitle("Error");
      setPasswordModalMessage("No se pudo obtener tu correo electrónico");
      setPasswordModalVisible(true);
      return;
    }

    // Show confirmation modal
    setPasswordModalType("confirm");
    setPasswordModalTitle("Cambiar Contraseña");
    setPasswordModalMessage(
      `Se enviará un correo a ${user.email} para restablecer tu contraseña.`
    );
    setPasswordModalVisible(true);
  };

  const handleConfirmPasswordReset = async () => {
    if (!user?.email) return;

    setPasswordModalLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordModalVisible(false);

      // Show success after a small delay
      setTimeout(() => {
        setPasswordModalType("success");
        setPasswordModalTitle("Correo Enviado ✉️");
        setPasswordModalMessage(
          "Revisa tu bandeja de entrada o carpeta de spam. Haz clic en el enlace del correo para cambiar tu contraseña."
        );
        setPasswordModalVisible(true);
      }, 300);
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      setPasswordModalType("error");
      setPasswordModalTitle("Error");
      setPasswordModalMessage(
        "No se pudo enviar el correo. Intenta de nuevo más tarde."
      );
    } finally {
      setPasswordModalLoading(false);
    }
  };

  const getMembershipLabel = (type?: string) => {
    switch (type) {
      case "pro":
        return "Miembro Pro";
      case "premium":
        return "Miembro Premium";
      case "unlimited":
        return "Plan Ilimitado";
      default:
        return "Miembro Básico";
    }
  };

  const getMembershipPlan = (type?: string) => {
    switch (type) {
      case "pro":
        return "Plan Pro";
      case "premium":
        return "Plan Premium";
      case "unlimited":
        return "Plan Ilimitado";
      default:
        return "Plan Básico";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData?.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {userData?.displayName?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {userData?.displayName || "Usuario"}
          </Text>
          <View style={styles.membershipBadge}>
            <Text style={styles.membershipBadgeText}>
              {getMembershipLabel(userData?.membershipType)}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData?.streak || 0}</Text>
            <Text style={styles.statLabel}>Racha 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData?.totalClasses || 0}</Text>
            <Text style={styles.statLabel}>Clases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData?.level || "Scaled"}</Text>
            <Text style={styles.statLabel}>Nivel</Text>
          </View>
        </View>

        {/* Membership Card */}
        <View style={styles.membershipCard}>
          <View>
            <Text style={styles.membershipLabel}>MEMBRESÍA ACTUAL</Text>
            <Text style={styles.membershipPlan}>
              {getMembershipPlan(userData?.membershipType)}
            </Text>
            <Text style={styles.membershipRenew}>Renueva: 15 Oct 2025</Text>
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate("Planes" as never)}
          >
            <Text style={styles.manageButtonText}>Ver Planes</Text>
          </TouchableOpacity>
        </View>

        {/* Mi Cuenta Section */}
        <Text style={styles.sectionTitle}>MI CUENTA</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={User}
            title="Datos Personales"
            hasArrow
            onPress={() => navigation.navigate("DatosPersonales" as never)}
          />
          {/* <SettingsRow
            icon={CreditCard}
            title="Métodos de Pago"
            hasArrow
            onPress={() => console.log("Métodos de Pago")}
          /> */}
          <SettingsRow
            icon={History}
            title="Historial de Asistencias"
            hasArrow
            onPress={() => navigation.navigate("Historial" as never)}
          />
        </View>

        {/* Preferencias Section */}
        {/* <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={Bell}
            iconBgColor="#fef2f2"
            title="Notificaciones Push"
            subtitle="Recordatorios de clase"
            hasToggle
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          <SettingsRow
            icon={Moon}
            title="Modo Oscuro"
            hasToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
        </View> */}

        {/* Seguridad Section */}
        <Text style={styles.sectionTitle}>SEGURIDAD</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={Lock}
            title="Cambiar Contraseña"
            hasArrow
            onPress={handleChangePassword}
          />
          <SettingsRow
            icon={Shield}
            title="Privacidad"
            hasArrow
            onPress={() => console.log("Privacidad")}
          />
        </View>

        {/* Dev Tools - Solo en desarrollo */}
        {__DEV__ && (
          <>
            <Text style={styles.devSectionTitle}>🛠️ DEV TOOLS</Text>
            <View style={styles.devCard}>
              <Text style={styles.devNote}>
                Solo visible en modo desarrollo
              </Text>

              {/* Racha Controls */}
              <View style={styles.devButtonRow}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!user) return;
                    await devAddStreak(user.uid, 1);
                    refreshUserData();
                  }}
                  style={[styles.devButton, { backgroundColor: "#22c55e" }]}
                >
                  <Text style={styles.devButtonText}>+1 Racha 🔥</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (!user) return;
                    await devSetStreak(user.uid, 5);
                    refreshUserData();
                  }}
                  style={[styles.devButton, { backgroundColor: "#eab308" }]}
                >
                  <Text style={styles.devButtonText}>=5 Racha</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (!user) return;
                    await devResetStreak(user.uid);
                    refreshUserData();
                  }}
                  style={[styles.devButton, { backgroundColor: "#ef4444" }]}
                >
                  <Text style={styles.devButtonText}>Reset 💔</Text>
                </TouchableOpacity>
              </View>

              {/* Points Controls */}
              <View style={styles.devButtonRow}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!user) return;
                    await devSimulateCheckIn(
                      user.uid,
                      userData?.displayName || "User"
                    );
                  }}
                  style={[styles.devButton, { backgroundColor: "#3b82f6" }]}
                >
                  <Text style={styles.devButtonText}>+Check-in ✅</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (!user) return;
                    await devSimulateWOD(
                      user.uid,
                      userData?.displayName || "User"
                    );
                  }}
                  style={[styles.devButton, { backgroundColor: "#a855f7" }]}
                >
                  <Text style={styles.devButtonText}>+WOD 🏋️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </ScrollView>

      {/* Password Reset Modal */}
      <ConfirmModal
        visible={passwordModalVisible}
        type={passwordModalType}
        title={passwordModalTitle}
        message={passwordModalMessage}
        loading={passwordModalLoading}
        confirmText={passwordModalType === "confirm" ? "Enviar" : "Entendido"}
        cancelText="Cancelar"
        onConfirm={
          passwordModalType === "confirm"
            ? handleConfirmPasswordReset
            : undefined
        }
        onCancel={() => setPasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 12,
  },
  membershipBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  membershipBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  membershipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  membershipLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
  membershipPlan: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  membershipRenew: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  manageButton: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  settingsSubtitle: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  devSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  devCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  devNote: {
    fontSize: 11,
    color: "#c2410c",
    marginBottom: 12,
  },
  devButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  devButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  devButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#dc2626",
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
  },
});
