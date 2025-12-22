import { useAuth } from "@/context/AuthContext";
import {
  AttendanceRecord,
  AttendanceStats,
  getMonthlyAttendance,
  getUserAttendanceHistory,
  getUserAttendanceStats,
  MonthlyAttendance,
} from "@/lib/historialService";
import { useNavigation } from "@react-navigation/native";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Flame,
  TrendingUp,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HistorialScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  const [filter, setFilter] = useState<"all" | "checked-in" | "cancelada">(
    "all"
  );

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [statsData, recordsData, monthly] = await Promise.all([
        getUserAttendanceStats(user.uid),
        getUserAttendanceHistory(user.uid),
        getMonthlyAttendance(user.uid),
      ]);

      setStats(statsData);
      setRecords(recordsData);
      setMonthlyData(monthly);
    } catch (error) {
      console.error("Error loading historial:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredRecords = records.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
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
        <Text style={styles.headerTitle}>Historial de Asistencias</Text>
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
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
                <Calendar size={20} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{stats.totalClases}</Text>
              <Text style={styles.statLabel}>Total Clases</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
                <CheckCircle size={20} color="#22c55e" />
              </View>
              <Text style={styles.statValue}>{stats.totalCheckIns}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#fef2f2" }]}>
                <TrendingUp size={20} color="#dc2626" />
              </View>
              <Text style={styles.statValue}>
                {stats.porcentajeAsistencia}%
              </Text>
              <Text style={styles.statLabel}>Asistencia</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <Flame size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{stats.rachaActual}</Text>
              <Text style={styles.statLabel}>Racha 🔥</Text>
            </View>
          </View>
        )}

        {/* Monthly Chart */}
        {monthlyData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Asistencias por Mes</Text>
            <View style={styles.chartContainer}>
              {monthlyData.map((month, index) => (
                <View key={index} style={styles.barContainer}>
                  <Text style={styles.barValue}>{month.count}</Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (month.count / maxMonthlyCount) * 100 + 10,
                        backgroundColor:
                          month.count === maxMonthlyCount
                            ? "#dc2626"
                            : "#e5e7eb",
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{month.month}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Highlights */}
        {stats && (
          <View style={styles.highlightsCard}>
            <Text style={styles.highlightsTitle}>Destacados</Text>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Clase más frecuente</Text>
              <Text style={styles.highlightValue}>
                {stats.claseMasFrecuente}
              </Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Mejor mes</Text>
              <Text style={styles.highlightValue}>{stats.mejorMes}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Racha máxima</Text>
              <Text style={styles.highlightValue}>
                {stats.rachaMaxima} días 🔥
              </Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "all" && styles.filterTabTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "checked-in" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("checked-in")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "checked-in" && styles.filterTabTextActive,
              ]}
            >
              Asistí
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "cancelada" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("cancelada")}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "cancelada" && styles.filterTabTextActive,
              ]}
            >
              Canceladas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Records List */}
        <Text style={styles.listTitle}>
          Historial ({filteredRecords.length})
        </Text>

        {filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay registros</Text>
            <Text style={styles.emptySubtext}>Tus clases aparecerán aquí</Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View
                style={[
                  styles.recordStatus,
                  {
                    backgroundColor:
                      record.status === "checked-in"
                        ? "#22c55e"
                        : record.status === "cancelada"
                        ? "#ef4444"
                        : "#9ca3af",
                  },
                ]}
              >
                {record.status === "checked-in" ? (
                  <CheckCircle size={16} color="#ffffff" />
                ) : record.status === "cancelada" ? (
                  <XCircle size={16} color="#ffffff" />
                ) : (
                  <Clock size={16} color="#ffffff" />
                )}
              </View>

              <View style={styles.recordContent}>
                <Text style={styles.recordName}>{record.claseName}</Text>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordDate}>
                    {formatDate(record.fecha)}
                  </Text>
                  <Text style={styles.recordTime}>{record.hora}</Text>
                </View>
              </View>

              <View style={styles.recordBadge}>
                <Text
                  style={[
                    styles.recordBadgeText,
                    {
                      color:
                        record.status === "checked-in"
                          ? "#22c55e"
                          : record.status === "cancelada"
                          ? "#ef4444"
                          : "#9ca3af",
                    },
                  ]}
                >
                  {record.status === "checked-in"
                    ? "Asistí"
                    : record.status === "cancelada"
                    ? "Cancelada"
                    : "Reservada"}
                </Text>
              </View>
            </View>
          ))
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8,
  },
  highlightsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  highlightLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterTabTextActive: {
    color: "#dc2626",
    fontWeight: "600",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recordStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  recordContent: {
    flex: 1,
  },
  recordName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  recordDetails: {
    flexDirection: "row",
    gap: 12,
  },
  recordDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  recordTime: {
    fontSize: 13,
    color: "#9ca3af",
  },
  recordBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  recordBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
