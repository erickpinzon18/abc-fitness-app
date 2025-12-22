/**
 * Dev Tools Service - SOLO PARA DESARROLLO
 * Funciones para probar animaciones de racha y puntos
 */

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

/**
 * Incrementa la racha del usuario en X días
 */
export async function devAddStreak(
  userId: string,
  days: number = 1
): Promise<{ success: boolean; newStreak: number; message: string }> {
  try {
    // Actualizar stats/streak
    const streakRef = doc(db, "users", userId, "stats", "streak");
    const streakSnap = await getDoc(streakRef);

    const currentStreak = streakSnap.exists()
      ? streakSnap.data().currentStreak || 0
      : 0;
    const longestStreak = streakSnap.exists()
      ? streakSnap.data().longestStreak || 0
      : 0;

    const newStreak = currentStreak + days;
    const newLongest = Math.max(longestStreak, newStreak);

    await setDoc(
      streakRef,
      {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCheckInDate: new Date().toISOString().split("T")[0],
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    // Actualizar documento principal
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      streak: newStreak,
    });

    return {
      success: true,
      newStreak,
      message: `🔥 +${days} días de racha! Ahora tienes ${newStreak}`,
    };
  } catch (error) {
    console.error("Error adding streak:", error);
    return { success: false, newStreak: 0, message: "Error al agregar racha" };
  }
}

/**
 * Reinicia la racha a 0
 */
export async function devResetStreak(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const streakRef = doc(db, "users", userId, "stats", "streak");
    await setDoc(
      streakRef,
      {
        currentStreak: 0,
        lastCheckInDate: "",
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      streak: 0,
    });

    return { success: true, message: "💔 Racha reiniciada a 0" };
  } catch (error) {
    console.error("Error resetting streak:", error);
    return { success: false, message: "Error al reiniciar racha" };
  }
}

/**
 * Simula un check-in para hoy (agrega puntos)
 */
export async function devSimulateCheckIn(
  userId: string,
  userName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();
    const fechaString = now.toISOString().split("T")[0];

    // Agregar reservación con status checked-in
    const reservationsRef = collection(db, "users", userId, "reservations");
    await addDoc(reservationsRef, {
      claseId: `dev-test-${Date.now()}`,
      claseNombre: "Clase de Prueba (DEV)",
      instructor: "Coach Dev",
      fecha: Timestamp.now(),
      fechaString,
      horaInicio: now.toTimeString().slice(0, 5),
      horaFin: new Date(now.getTime() + 3600000).toTimeString().slice(0, 5),
      nivel: "RX",
      status: "checked-in",
      checkedInAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return { success: true, message: "✅ Check-in simulado (+1 punto)" };
  } catch (error) {
    console.error("Error simulating check-in:", error);
    return { success: false, message: "Error al simular check-in" };
  }
}

/**
 * Simula un WOD completado para hoy
 */
export async function devSimulateWOD(
  userId: string,
  userName: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Crear un WOD de prueba si no existe
    const wodId = `dev-wod-${new Date().toISOString().split("T")[0]}`;
    const wodRef = doc(db, "wods", wodId);

    await setDoc(
      wodRef,
      {
        tipo: "wod",
        titulo: "WOD Dev Test",
        modalidad: "For Time",
        timeCap: 20,
        ejercicios: [{ nombre: "Test Exercise", cantidad: "10" }],
        fecha: Timestamp.now(),
        createdAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Agregar resultado del usuario
    const resultsRef = collection(db, "wods", wodId, "results");
    await addDoc(resultsRef, {
      userId,
      nombreUsuario: userName,
      tiempo: "10:00",
      rx: true,
      createdAt: Timestamp.now(),
    });

    return { success: true, message: "🏋️ WOD simulado (+2 puntos)" };
  } catch (error) {
    console.error("Error simulating WOD:", error);
    return { success: false, message: "Error al simular WOD" };
  }
}

/**
 * Establece la racha a un valor específico
 */
export async function devSetStreak(
  userId: string,
  streak: number
): Promise<{ success: boolean; message: string }> {
  try {
    const streakRef = doc(db, "users", userId, "stats", "streak");
    const streakSnap = await getDoc(streakRef);
    const longestStreak = streakSnap.exists()
      ? Math.max(streakSnap.data().longestStreak || 0, streak)
      : streak;

    await setDoc(
      streakRef,
      {
        currentStreak: streak,
        longestStreak,
        lastCheckInDate: new Date().toISOString().split("T")[0],
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      streak,
    });

    return { success: true, message: `🔥 Racha establecida a ${streak} días` };
  } catch (error) {
    console.error("Error setting streak:", error);
    return { success: false, message: "Error al establecer racha" };
  }
}
