import { Admin, getAdminStats } from "@/lib/adminService";
import { useNavigation } from "@react-navigation/native";
import {
  CalendarDays,
  Dumbbell,
  LogOut,
  Newspaper,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

export default function AdminDashboard({
  admin,
  onLogout,
}: AdminDashboardProps) {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    checkInsHoy: 0,
    clasesHoy: 0,
    noticiasActivas: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  const getRoleBadge = () => {
    if (admin.role === "admin") {
      return { text: "Administrador", color: "#dc2626", bg: "#fef2f2" };
    }
    return { text: "Coach", color: "#2563eb", bg: "#dbeafe" };
  };

  const roleBadge = getRoleBadge();

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
        <View>
          <Text style={styles.greeting}>Panel de Administración</Text>
          <View style={styles.userRow}>
            <Text style={styles.userName}>{admin.fullName}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
              <Text style={[styles.roleText, { color: roleBadge.color }]}>
                {roleBadge.text}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LogOut size={22} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#dc2626"
          />
        }
      >
        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
              <Users size={24} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>{stats.totalUsuarios}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
              <CalendarDays size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{stats.clasesHoy}</Text>
            <Text style={styles.statLabel}>Clases Hoy</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
              <Dumbbell size={24} color="#d97706" />
            </View>
            <Text style={styles.statValue}>{stats.checkInsHoy}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#fef2f2" }]}>
              <Newspaper size={24} color="#dc2626" />
            </View>
            <Text style={styles.statValue}>{stats.noticiasActivas}</Text>
            <Text style={styles.statLabel}>Noticias</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.jumpTo("Clases")}
          >
            <CalendarDays size={28} color="#2563eb" />
            <Text style={styles.actionTitle}>Nueva Clase</Text>
            <Text style={styles.actionSubtitle}>Agregar al calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.jumpTo("WODs")}
          >
            <Dumbbell size={28} color="#d97706" />
            <Text style={styles.actionTitle}>Nuevo WOD</Text>
            <Text style={styles.actionSubtitle}>Programar entrenamiento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.jumpTo("Noticias")}
          >
            <Newspaper size={28} color="#dc2626" />
            <Text style={styles.actionTitle}>Nueva Noticia</Text>
            <Text style={styles.actionSubtitle}>Publicar anuncio</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            Usa las pestañas de abajo para gestionar Clases, WODs y Noticias.
            Los cambios se reflejan inmediatamente en la app de usuarios.
          </Text>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  greeting: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef2f2",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    position: "absolute",
    right: 20,
  },
  infoCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
  },
});
