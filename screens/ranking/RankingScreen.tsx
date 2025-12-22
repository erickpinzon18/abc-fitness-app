import { useAuth } from "@/context/AuthContext";
import {
  getMonthlyRanking,
  getUserRankingData,
  RankedUser,
  UserRankingData,
} from "@/lib/rankingService";
import { Crown, Trophy } from "lucide-react-native";
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

type Category = "total" | "asistencia" | "wods";

export default function RankingScreen() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [myRanking, setMyRanking] = useState<UserRankingData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("total");

  const loadRanking = useCallback(async () => {
    try {
      const [fullRanking, userRanking] = await Promise.all([
        getMonthlyRanking(),
        user ? getUserRankingData(user.uid) : null,
      ]);

      setRanking(fullRanking);
      setMyRanking(userRanking);
    } catch (error) {
      console.error("Error loading ranking:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRanking();
  }, [loadRanking]);

  // Ordenar según categoría
  const getSortedRanking = () => {
    const sorted = [...ranking];
    switch (selectedCategory) {
      case "asistencia":
        sorted.sort((a, b) => b.checkIns - a.checkIns);
        break;
      case "wods":
        sorted.sort((a, b) => b.wods - a.wods);
        break;
      default:
        sorted.sort((a, b) => b.points - a.points);
    }
    // Re-asignar ranks
    sorted.forEach((u, i) => (u.rank = i + 1));
    return sorted;
  };

  const sortedRanking = getSortedRanking();
  const topThree = sortedRanking.slice(0, 3);
  const restOfRanking = sortedRanking.slice(3);

  // Ordenar podio para mostrar: 2do, 1ro, 3ro
  const podiumOrder = [
    topThree.find((u) => u.rank === 2),
    topThree.find((u) => u.rank === 1),
    topThree.find((u) => u.rank === 3),
  ].filter(Boolean) as RankedUser[];

  const getScoreLabel = (user: RankedUser) => {
    switch (selectedCategory) {
      case "asistencia":
        return `${user.checkIns} clases`;
      case "wods":
        return `${user.wods} WODs`;
      default:
        return `${user.points} pts`;
    }
  };

  const getMotivationalMessage = () => {
    if (!myRanking) return "¡Asiste a tu primera clase!";
    if (myRanking.rank === 1) return "🏆 ¡Eres el campeón!";
    if (myRanking.rank <= 3) return "🔥 ¡Estás en el podio!";
    if (myRanking.rank <= 10)
      return `⚡ ¡Top 10! ${myRanking.pointsToNextRank} pts para subir`;
    return `💪 ¡${myRanking.pointsToNextRank} pts para el Top ${
      myRanking.rank - 1
    }!`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Cargando ranking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Ranking</Text>
          <View style={styles.monthBadge}>
            <Text style={styles.monthBadgeText}>
              {new Date().toLocaleDateString("es-MX", { month: "long" })}
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: "total", label: "Total" },
            { key: "asistencia", label: "Asistencia" },
            { key: "wods", label: "WODs" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedCategory === tab.key && styles.tabActive,
              ]}
              onPress={() => setSelectedCategory(tab.key as Category)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Podium */}
        {podiumOrder.length > 0 && (
          <View style={styles.podiumContainer}>
            {podiumOrder.map((podiumUser, index) => {
              const isFirst = podiumUser.rank === 1;
              const isSecond = podiumUser.rank === 2;
              const isThird = podiumUser.rank === 3;

              return (
                <View
                  key={podiumUser.uid}
                  style={[styles.podiumItem, isFirst && styles.podiumFirst]}
                >
                  {/* Crown for 1st */}
                  {isFirst && (
                    <Crown size={28} color="#F59E0B" style={styles.crown} />
                  )}

                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatarContainer,
                      isFirst && styles.avatarFirst,
                      isSecond && styles.avatarSecond,
                      isThird && styles.avatarThird,
                    ]}
                  >
                    {podiumUser.photoURL ? (
                      <Image
                        source={{ uri: podiumUser.photoURL }}
                        style={[
                          styles.avatar,
                          isFirst && styles.avatarImageFirst,
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          isFirst && styles.avatarImageFirst,
                        ]}
                      >
                        <Text style={styles.avatarInitials}>
                          {podiumUser.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Rank Badge */}
                  <View
                    style={[
                      styles.rankBadge,
                      isFirst && styles.rankBadgeGold,
                      isSecond && styles.rankBadgeSilver,
                      isThird && styles.rankBadgeBronze,
                    ]}
                  >
                    <Text style={styles.rankBadgeText}>{podiumUser.rank}</Text>
                  </View>

                  {/* Podium Block */}
                  <View
                    style={[
                      styles.podiumBlock,
                      isFirst && styles.podiumBlockFirst,
                      isSecond && styles.podiumBlockSecond,
                      isThird && styles.podiumBlockThird,
                    ]}
                  >
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {podiumUser.displayName.split(" ")[0]}
                    </Text>
                    <View
                      style={[
                        styles.podiumScoreBadge,
                        isFirst && styles.podiumScoreBadgeGold,
                      ]}
                    >
                      <Text
                        style={[
                          styles.podiumScoreText,
                          isFirst && styles.podiumScoreTextGold,
                        ]}
                      >
                        {getScoreLabel(podiumUser)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Ranking List */}
        <View style={styles.listContainer}>
          {restOfRanking.map((rankedUser) => (
            <View
              key={rankedUser.uid}
              style={[
                styles.rankingItem,
                rankedUser.uid === user?.uid && styles.rankingItemHighlight,
              ]}
            >
              <Text style={styles.rankNumber}>{rankedUser.rank}</Text>

              {rankedUser.photoURL ? (
                <Image
                  source={{ uri: rankedUser.photoURL }}
                  style={styles.listAvatar}
                />
              ) : (
                <View style={styles.listAvatarPlaceholder}>
                  <Text style={styles.listAvatarInitials}>
                    {rankedUser.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{rankedUser.displayName}</Text>
                <Text style={styles.userLevel}>Nivel: {rankedUser.level}</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>
                  {selectedCategory === "asistencia"
                    ? rankedUser.checkIns
                    : selectedCategory === "wods"
                    ? rankedUser.wods
                    : rankedUser.points}
                </Text>
                <Text style={styles.scoreLabel}>
                  {selectedCategory === "asistencia"
                    ? "clases"
                    : selectedCategory === "wods"
                    ? "WODs"
                    : "pts"}
                </Text>
              </View>
            </View>
          ))}

          {ranking.length === 0 && (
            <View style={styles.emptyContainer}>
              <Trophy size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Sin datos aún</Text>
              <Text style={styles.emptySubtitle}>
                Asiste a clases y registra WODs para aparecer en el ranking
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* My Position Footer */}
      {myRanking && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerRank}>{myRanking.rank}</Text>
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.footerAvatar}
                />
              ) : (
                <View style={styles.footerAvatarPlaceholder}>
                  <Text style={styles.footerAvatarInitials}>
                    {userData?.displayName?.charAt(0).toUpperCase() || "T"}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.footerName}>
                  Tú ({userData?.displayName?.split(" ")[0] || "Usuario"})
                </Text>
                <Text style={styles.footerMotivation}>
                  {getMotivationalMessage()}
                </Text>
              </View>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerPoints}>{myRanking.points}</Text>
              <Text style={styles.footerPointsLabel}>Pts</Text>
            </View>
          </View>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  monthBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
    textTransform: "capitalize",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  podiumItem: {
    alignItems: "center",
  },
  podiumFirst: {
    marginBottom: 0,
  },
  crown: {
    marginBottom: 8,
  },
  avatarContainer: {
    marginBottom: -15,
    zIndex: 10,
  },
  avatarFirst: {
    borderWidth: 4,
    borderColor: "#FCD34D",
    borderRadius: 44,
  },
  avatarSecond: {
    borderWidth: 3,
    borderColor: "#E5E7EB",
    borderRadius: 36,
  },
  avatarThird: {
    borderWidth: 3,
    borderColor: "#FDBA74",
    borderRadius: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarImageFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  rankBadge: {
    position: "absolute",
    bottom: 55,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    zIndex: 20,
  },
  rankBadgeGold: {
    backgroundColor: "#F59E0B",
    bottom: 75,
  },
  rankBadgeSilver: {
    backgroundColor: "#9CA3AF",
  },
  rankBadgeBronze: {
    backgroundColor: "#D97706",
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  podiumBlock: {
    width: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#f9fafb",
  },
  podiumBlockFirst: {
    width: 100,
    height: 140,
    backgroundColor: "#FEF3C7",
  },
  podiumBlockSecond: {
    height: 100,
  },
  podiumBlockThird: {
    height: 80,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  podiumScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  podiumScoreBadgeGold: {
    backgroundColor: "#FEF08A",
  },
  podiumScoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  podiumScoreTextGold: {
    color: "#B45309",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rankingItemHighlight: {
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  rankNumber: {
    width: 24,
    fontSize: 16,
    fontWeight: "bold",
    color: "#6b7280",
    textAlign: "center",
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 12,
  },
  listAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6b7280",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  listAvatarInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
    color: "#6b7280",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: -2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  footer: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  footerRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.7)",
    width: 28,
    textAlign: "center",
  },
  footerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#dc2626",
    marginHorizontal: 12,
  },
  footerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  footerAvatarInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerMotivation: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerPoints: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footerPointsLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: -4,
  },
});
