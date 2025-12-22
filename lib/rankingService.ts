import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface RankedUser {
  rank: number;
  uid: string;
  displayName: string;
  photoURL?: string;
  level: "Scaled" | "Intermedio" | "RX";
  points: number;
  checkIns: number;
  wods: number;
  streak: number;
}

export interface UserRankingData {
  rank: number;
  points: number;
  checkIns: number;
  wods: number;
  pointsToNextRank: number;
  totalUsers: number;
}

/**
 * Obtiene el primer y último día del mes actual
 */
function getMonthBounds(): { startString: string; endString: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startString = firstDay.toISOString().split("T")[0];
  const endString = lastDay.toISOString().split("T")[0];

  return { startString, endString };
}

/**
 * Cuenta los check-ins del mes para un usuario
 */
async function getMonthlyCheckIns(userId: string): Promise<number> {
  const { startString, endString } = getMonthBounds();

  const reservationsRef = collection(db, "users", userId, "reservations");
  const q = query(
    reservationsRef,
    where("fechaString", ">=", startString),
    where("fechaString", "<=", endString),
    where("status", "==", "checked-in")
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Cuenta los WODs registrados del mes para un usuario
 */
async function getMonthlyWODs(userId: string): Promise<number> {
  const { startString, endString } = getMonthBounds();

  // Obtener todos los WODs del mes
  const wodsRef = collection(db, "wods");
  const wodsQuery = query(
    wodsRef,
    where("fecha", ">=", new Date(startString)),
    where("fecha", "<=", new Date(endString + "T23:59:59"))
  );

  try {
    const wodsSnapshot = await getDocs(wodsQuery);
    let wodCount = 0;

    // Para cada WOD, verificar si el usuario tiene resultado
    for (const wodDoc of wodsSnapshot.docs) {
      const resultsRef = collection(db, "wods", wodDoc.id, "results");
      const resultQuery = query(resultsRef, where("userId", "==", userId));
      const resultSnapshot = await getDocs(resultQuery);

      if (!resultSnapshot.empty) {
        wodCount++;
      }
    }

    return wodCount;
  } catch (error) {
    console.log("Error getting WODs, trying alternative method");
    return 0;
  }
}

/**
 * Calcula los puntos totales del usuario
 * - Check-in: 1 punto
 * - WOD: 2 puntos
 * - Bonus por racha 5+: 5 puntos
 * - Bonus por racha 10+: 10 puntos adicionales
 */
function calculatePoints(
  checkIns: number,
  wods: number,
  streak: number
): number {
  let points = 0;

  // Puntos base
  points += checkIns * 1; // 1 punto por check-in
  points += wods * 2; // 2 puntos por WOD

  // Bonus por racha
  if (streak >= 10) {
    points += 15; // 5 + 10 bonus
  } else if (streak >= 5) {
    points += 5;
  }

  return points;
}

/**
 * Obtiene el ranking mensual de todos los usuarios
 */
export async function getMonthlyRanking(): Promise<RankedUser[]> {
  try {
    // Obtener todos los usuarios activos
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("isActive", "==", true));
    const usersSnapshot = await getDocs(usersQuery);

    const usersWithPoints: RankedUser[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Obtener estadísticas del mes
      const [checkIns, wods] = await Promise.all([
        getMonthlyCheckIns(userDoc.id),
        getMonthlyWODs(userDoc.id),
      ]);

      const streak = userData.streak || 0;
      const points = calculatePoints(checkIns, wods, streak);

      // Solo incluir usuarios con actividad
      if (points > 0 || checkIns > 0) {
        usersWithPoints.push({
          rank: 0, // Se calculará después
          uid: userDoc.id,
          displayName: userData.displayName || "Usuario",
          photoURL: userData.photoURL,
          level: userData.level || "Scaled",
          points,
          checkIns,
          wods,
          streak,
        });
      }
    }

    // Ordenar por puntos (descendente)
    usersWithPoints.sort((a, b) => b.points - a.points);

    // Asignar ranks
    usersWithPoints.forEach((user, index) => {
      user.rank = index + 1;
    });

    return usersWithPoints;
  } catch (error) {
    console.error("Error getting monthly ranking:", error);
    return [];
  }
}

/**
 * Obtiene los datos de ranking del usuario actual
 */
export async function getUserRankingData(
  userId: string
): Promise<UserRankingData | null> {
  try {
    const ranking = await getMonthlyRanking();
    const userIndex = ranking.findIndex((u) => u.uid === userId);

    if (userIndex === -1) {
      // Usuario no tiene actividad este mes
      const [checkIns, wods] = await Promise.all([
        getMonthlyCheckIns(userId),
        getMonthlyWODs(userId),
      ]);

      return {
        rank: ranking.length + 1,
        points: calculatePoints(checkIns, wods, 0),
        checkIns,
        wods,
        pointsToNextRank:
          ranking.length > 0 ? ranking[ranking.length - 1].points + 1 : 1,
        totalUsers: ranking.length + 1,
      };
    }

    const user = ranking[userIndex];
    const nextUser = ranking[userIndex - 1]; // El siguiente en el ranking (arriba)

    return {
      rank: user.rank,
      points: user.points,
      checkIns: user.checkIns,
      wods: user.wods,
      pointsToNextRank: nextUser ? nextUser.points - user.points + 1 : 0,
      totalUsers: ranking.length,
    };
  } catch (error) {
    console.error("Error getting user ranking data:", error);
    return null;
  }
}

/**
 * Obtiene el Top 3 para el podio
 */
export async function getTopThree(): Promise<RankedUser[]> {
  const ranking = await getMonthlyRanking();
  return ranking.slice(0, 3);
}

/**
 * Obtiene el ranking del 4to lugar en adelante
 */
export async function getRankingList(): Promise<RankedUser[]> {
  const ranking = await getMonthlyRanking();
  return ranking.slice(3);
}
