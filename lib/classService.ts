import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

// ============================================
// TIPOS
// ============================================

/**
 * Clase programada - Documento en /calendario
 * Esta es la estructura que usarás en tu panel web
 */
export interface Clase {
  id: string;
  clase: string; // "CrossFit", "Flexibilidad", "Funcional"
  instructor: string; // "Coach Carlos"
  fecha: Timestamp; // Timestamp de Firebase (fecha + hora inicio)
  horaInicio: string; // "07:00" formato 24h
  horaFin: string; // "08:00"
  duracion: number; // 60 (minutos)
  capacidadMaxima: number; // 20
  nivel: string; // "Todos los niveles", "Intermedio", "Avanzado"
  createdAt: Timestamp;
  // Calculado en la app (no guardar en Firestore)
  reservacionesCount?: number;
}

/**
 * Reservación - Subcolección en /calendario/{claseId}/reservaciones
 */
export interface Reservacion {
  id: string;
  odIdUsuarioId: string;
  nombreUsuario: string;
  emailUsuario: string;
  status: "confirmada" | "checked-in" | "cancelada" | "no-show";
  createdAt: Timestamp;
  checkedInAt?: Timestamp;
  cancelledAt?: Timestamp;
}

/**
 * Reservación del usuario - Guardada en /users/{userId}/reservations
 * Contiene toda la info necesaria para mostrar sin hacer queries adicionales
 */
export interface UserReservation {
  id: string;
  claseId: string;
  claseNombre: string; // "CrossFit", "Funcional"
  instructor: string;
  fecha: Timestamp; // Fecha y hora de la clase
  fechaString: string; // "2025-12-01" para queries
  horaInicio: string;
  horaFin: string;
  nivel: string;
  status: "confirmada" | "checked-in" | "cancelada" | "no-show";
  createdAt: Timestamp;
  checkedInAt?: Timestamp;
  cancelledAt?: Timestamp;
}

/**
 * WOD - Documento en /calendario con tipo: "wod"
 */
export interface WOD {
  id: string;
  tipo: "wod";
  fecha: Timestamp; // Timestamp de Firebase
  titulo: string; // "Fran", "Murph", "WOD del día"
  modalidad: string; // "For Time", "AMRAP", "EMOM", "Chipper"
  timeCap?: number; // Minutos límite
  ejercicios: EjercicioWOD[];
  notas?: string; // Instrucciones adicionales
  createdAt: Timestamp;
}

export interface EjercicioWOD {
  nombre: string; // "Thrusters", "Pull-ups", "Run"
  cantidad: string; // "21-15-9", "100", "1 Mile"
  peso?: string; // "95 lbs", "43 kg"
}

/**
 * Resultado WOD - Subcolección en /wods/{wodId}/results
 */
export interface ResultadoWOD {
  id: string;
  userId: string;
  nombreUsuario: string;
  tiempo?: string; // "12:45" para For Time
  rondas?: number; // Para AMRAP
  reps?: number; // Reps extra en AMRAP
  peso?: string; // Si modificó peso
  rx: boolean; // true = prescrito, false = scaled
  notas?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Obtiene un rango de fechas para los próximos 7 días
 */
export function getWeekDates(): {
  date: Date;
  dayName: string;
  dayNumber: number;
}[] {
  const dates = [];
  const today = new Date();
  const dayNames = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    dates.push({
      date: date,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
    });
  }

  return dates;
}

/**
 * Convierte hora de 24h a 12h con AM/PM
 */
export function formatTime(time24: string): {
  time: string;
  period: "AM" | "PM";
} {
  const [hours, minutes] = time24?.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return {
    time: `${hours12}:${minutes.toString().padStart(2, "0")}`,
    period,
  };
}

/**
 * Calcula duración en horas desde horaInicio y horaFin
 */
export function calcularDuracion(horaInicio: string, horaFin: string): string {
  const [startH] = horaInicio.split(":").map(Number);
  const [endH] = horaFin.split(":").map(Number);
  const diff = endH - startH;
  return diff > 0 ? `${diff} hr` : "1 hr";
}

// ============================================
// FUNCIONES DE CLASES
// ============================================

/**
 * Obtiene clases por fecha específica
 */
export async function getClasesPorFecha(fecha: Date): Promise<Clase[]> {
  // Crear rango del día
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  // console.log("🔍 Buscando clases para fecha:", {
  //   fechaInput: fecha.toISOString(),
  //   startOfDay: startOfDay.toISOString(),
  //   endOfDay: endOfDay.toISOString(),
  //   startTimestamp: Timestamp.fromDate(startOfDay).toDate().toISOString(),
  //   endTimestamp: Timestamp.fromDate(endOfDay).toDate().toISOString(),
  // });

  const clasesRef = collection(db, "calendario");
  const q = query(
    clasesRef,
    where("fecha", ">=", Timestamp.fromDate(startOfDay)),
    where("fecha", "<=", Timestamp.fromDate(endOfDay)),
    orderBy("fecha", "asc")
  );

  const snapshot = await getDocs(q);

  // console.log("📋 Clases encontradas:", snapshot.size);

  // Obtener conteo de reservaciones para cada clase (excluyendo WODs)
  const clases: Clase[] = await Promise.all(
    snapshot.docs
      .filter((docSnap) => docSnap.data().tipo !== "wod") // Excluir WODs
      .map(async (docSnap) => {
        const data = docSnap.data();
        const reservacionesRef = collection(
          db,
          "calendario",
          docSnap.id,
          "reservaciones"
        );
        const reservacionesQuery = query(
          reservacionesRef,
          where("status", "in", ["confirmada", "checked-in"])
        );
        const reservacionesSnap = await getDocs(reservacionesQuery);

        return {
          id: docSnap.id,
          ...data,
          reservacionesCount: reservacionesSnap.size,
        } as Clase;
      })
  );

  return clases;
}

/**
 * Suscripción en tiempo real a clases por fecha
 */
export function subscribeToClasesPorFecha(
  fecha: Date,
  callback: (clases: Clase[]) => void
): () => void {
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  const clasesRef = collection(db, "calendario");
  const q = query(
    clasesRef,
    where("fecha", ">=", Timestamp.fromDate(startOfDay)),
    where("fecha", "<=", Timestamp.fromDate(endOfDay)),
    orderBy("fecha", "asc")
  );

  return onSnapshot(q, async (snapshot) => {
    const clases: Clase[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const reservacionesRef = collection(
          db,
          "calendario",
          docSnap.id,
          "reservaciones"
        );
        const reservacionesQuery = query(
          reservacionesRef,
          where("status", "in", ["confirmada", "checked-in"])
        );
        const reservacionesSnap = await getDocs(reservacionesQuery);

        return {
          id: docSnap.id,
          ...data,
          reservacionesCount: reservacionesSnap.size,
        } as Clase;
      })
    );
    callback(clases);
  });
}

/**
 * Obtener una clase por ID
 */
export async function getClaseById(claseId: string): Promise<Clase | null> {
  const docRef = doc(db, "calendario", claseId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const reservacionesRef = collection(
    db,
    "calendario",
    claseId,
    "reservaciones"
  );
  const reservacionesQuery = query(
    reservacionesRef,
    where("status", "in", ["confirmada", "checked-in"])
  );
  const reservacionesSnap = await getDocs(reservacionesQuery);

  return {
    id: docSnap.id,
    ...docSnap.data(),
    reservacionesCount: reservacionesSnap.size,
  } as Clase;
}

// ============================================
// FUNCIONES DE RESERVACIONES
// ============================================

/**
 * Obtener reservaciones de una clase
 */
export async function getReservaciones(
  claseId: string
): Promise<Reservacion[]> {
  const reservacionesRef = collection(
    db,
    "calendario",
    claseId,
    "reservaciones"
  );
  const q = query(
    reservacionesRef,
    where("status", "in", ["confirmada", "checked-in"]),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Reservacion[];
}

/**
 * Verificar si usuario ya tiene reservación en una clase
 */
export async function tieneReservacion(
  claseId: string,
  odIdUsuarioId: string
): Promise<Reservacion | null> {
  const reservacionesRef = collection(
    db,
    "calendario",
    claseId,
    "reservaciones"
  );
  const q = query(
    reservacionesRef,
    where("odIdUsuarioId", "==", odIdUsuarioId),
    where("status", "in", ["confirmada", "checked-in"])
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as Reservacion;
}

/**
 * Crear reservación - Guarda en ambos lugares:
 * 1. /clases/{claseId}/reservaciones
 * 2. /users/{userId}/reservations
 */
export async function crearReservacion(
  claseId: string,
  odIdUsuarioId: string,
  nombreUsuario: string,
  emailUsuario: string
): Promise<{ success: boolean; error?: string; reservacionId?: string }> {
  try {
    // Verificar que la clase existe y tiene cupo
    const clase = await getClaseById(claseId);
    if (!clase) {
      return { success: false, error: "La clase no existe" };
    }

    if ((clase.reservacionesCount || 0) >= clase.capacidadMaxima) {
      return { success: false, error: "La clase está llena" };
    }

    // Verificar si ya tiene reservación
    const reservacionExistente = await tieneReservacion(claseId, odIdUsuarioId);
    if (reservacionExistente) {
      return {
        success: false,
        error: "Ya tienes una reservación en esta clase",
      };
    }

    const now = serverTimestamp();
    const fechaString = clase.fecha.toDate().toISOString().split("T")[0];

    // 1. Crear reservación en /calendario/{claseId}/reservaciones
    const reservacionesRef = collection(
      db,
      "calendario",
      claseId,
      "reservaciones"
    );
    const docRef = await addDoc(reservacionesRef, {
      odIdUsuarioId,
      nombreUsuario,
      emailUsuario,
      status: "confirmada",
      createdAt: now,
    });

    // 2. Crear copia en /users/{userId}/reservations con toda la info
    const userReservationsRef = collection(
      db,
      "users",
      odIdUsuarioId,
      "reservations"
    );
    await addDoc(userReservationsRef, {
      claseId,
      reservacionIdEnClase: docRef.id,
      claseNombre: clase.clase,
      instructor: clase.instructor,
      fecha: clase.fecha,
      fechaString,
      horaInicio: clase.horaInicio,
      horaFin: clase.horaFin,
      nivel: clase.nivel,
      status: "confirmada",
      createdAt: now,
    });

    return { success: true, reservacionId: docRef.id };
  } catch (error) {
    console.error("Error al crear reservación:", error);
    return { success: false, error: "Error al crear la reservación" };
  }
}

/**
 * Cancelar reservación - Actualiza en ambos lugares
 */
export async function cancelarReservacion(
  claseId: string,
  odIdUsuarioId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const reservacion = await tieneReservacion(claseId, odIdUsuarioId);
    if (!reservacion) {
      return { success: false, error: "No tienes reservación en esta clase" };
    }

    const now = serverTimestamp();

    // 1. Actualizar en /calendario/{claseId}/reservaciones
    const reservacionRef = doc(
      db,
      "calendario",
      claseId,
      "reservaciones",
      reservacion.id
    );
    await updateDoc(reservacionRef, {
      status: "cancelada",
      cancelledAt: now,
    });

    // 2. Actualizar en /users/{userId}/reservations
    const userReservationsRef = collection(
      db,
      "users",
      odIdUsuarioId,
      "reservations"
    );
    const q = query(
      userReservationsRef,
      where("claseId", "==", claseId),
      where("status", "==", "confirmada")
    );
    const userResSnap = await getDocs(q);

    for (const docSnap of userResSnap.docs) {
      await updateDoc(
        doc(db, "users", odIdUsuarioId, "reservations", docSnap.id),
        {
          status: "cancelada",
          cancelledAt: now,
        }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error al cancelar reservación:", error);
    return { success: false, error: "Error al cancelar la reservación" };
  }
}

import { actualizarRachaConCheckIn } from "./streakService";

/**
 * Check-in de usuario - Actualiza en ambos lugares y la racha
 */
export async function hacerCheckIn(
  claseId: string,
  odIdUsuarioId: string
): Promise<{
  success: boolean;
  error?: string;
  streakMessage?: string;
  newStreak?: number;
}> {
  try {
    const reservacion = await tieneReservacion(claseId, odIdUsuarioId);
    if (!reservacion) {
      return { success: false, error: "No tienes reservación en esta clase" };
    }

    if (reservacion.status === "checked-in") {
      return { success: false, error: "Ya hiciste check-in" };
    }

    const now = serverTimestamp();

    // 1. Actualizar en /calendario/{claseId}/reservaciones
    const reservacionRef = doc(
      db,
      "calendario",
      claseId,
      "reservaciones",
      reservacion.id
    );
    await updateDoc(reservacionRef, {
      status: "checked-in",
      checkedInAt: now,
    });

    // 2. Actualizar en /users/{userId}/reservations
    const userReservationsRef = collection(
      db,
      "users",
      odIdUsuarioId,
      "reservations"
    );
    const q = query(
      userReservationsRef,
      where("claseId", "==", claseId),
      where("status", "==", "confirmada")
    );
    const userResSnap = await getDocs(q);

    for (const docSnap of userResSnap.docs) {
      await updateDoc(
        doc(db, "users", odIdUsuarioId, "reservations", docSnap.id),
        {
          status: "checked-in",
          checkedInAt: now,
        }
      );
    }

    // 3. Actualizar la racha del usuario
    const streakResult = await actualizarRachaConCheckIn(odIdUsuarioId);

    return {
      success: true,
      streakMessage: streakResult.message,
      newStreak: streakResult.newStreak,
    };
  } catch (error) {
    console.error("Error al hacer check-in:", error);
    return { success: false, error: "Error al hacer check-in" };
  }
}

// ============================================
// FUNCIONES PARA OBTENER RESERVACIONES DEL USUARIO
// ============================================

/**
 * Obtener la próxima clase reservada del usuario
 * Busca en /users/{userId}/reservations las clases de hoy en adelante
 */
export async function getProximaClaseUsuario(
  odIdUsuarioId: string
): Promise<UserReservation | null> {
  const ahora = new Date();
  const hoyString = ahora.toISOString().split("T")[0];

  const userReservationsRef = collection(
    db,
    "users",
    odIdUsuarioId,
    "reservations"
  );
  const q = query(
    userReservationsRef,
    where("status", "in", ["confirmada", "checked-in"]),
    where("fechaString", ">=", hoyString),
    orderBy("fechaString", "asc"),
    orderBy("horaInicio", "asc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  // Filtrar para obtener solo clases que no han pasado hoy
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const fechaClase = data.fecha.toDate();

    // Si la clase es de hoy, verificar que no haya pasado
    if (data.fechaString === hoyString) {
      const [horaFin] = data.horaFin.split(":").map(Number);
      if (ahora.getHours() >= horaFin) {
        continue; // Esta clase ya pasó
      }
    }

    return {
      id: docSnap.id,
      ...data,
    } as UserReservation;
  }

  return null;
}

/**
 * Obtener todas las reservaciones futuras del usuario
 */
export async function getReservacionesUsuario(
  odIdUsuarioId: string
): Promise<UserReservation[]> {
  const hoyString = new Date().toISOString().split("T")[0];

  const userReservationsRef = collection(
    db,
    "users",
    odIdUsuarioId,
    "reservations"
  );
  const q = query(
    userReservationsRef,
    where("status", "in", ["confirmada", "checked-in"]),
    where("fechaString", ">=", hoyString),
    orderBy("fechaString", "asc"),
    orderBy("horaInicio", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as UserReservation[];
}

// ============================================
// FUNCIONES DE WODs
// ============================================

/**
 * Obtener WOD del día desde /calendario con tipo: "wod"
 */
export async function getWODHoy(): Promise<WOD | null> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);

  const calendarioRef = collection(db, "calendario");
  const q = query(
    calendarioRef,
    where("tipo", "==", "wod"),
    where("fecha", ">=", Timestamp.fromDate(hoy)),
    where("fecha", "<", Timestamp.fromDate(mañana))
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as WOD;
}

/**
 * Obtener WOD por fecha específica
 */
export async function getWODPorFecha(fecha: Date): Promise<WOD | null> {
  const inicioDia = new Date(fecha);
  inicioDia.setHours(0, 0, 0, 0);

  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  const calendarioRef = collection(db, "calendario");
  const q = query(
    calendarioRef,
    where("tipo", "==", "wod"),
    where("fecha", ">=", Timestamp.fromDate(inicioDia)),
    where("fecha", "<", Timestamp.fromDate(finDia))
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as WOD;
}

/**
 * Obtener resultados de un WOD (subcolección /wods/{wodId}/results)
 */
export async function getResultadosWOD(wodId: string): Promise<ResultadoWOD[]> {
  const resultsRef = collection(db, "wods", wodId, "results");
  const q = query(resultsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as ResultadoWOD[];
}

/**
 * Obtener mi resultado de un WOD
 */
export async function getMiResultadoWOD(
  wodId: string,
  userId: string
): Promise<ResultadoWOD | null> {
  const resultsRef = collection(db, "wods", wodId, "results");
  const q = query(resultsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as ResultadoWOD;
}

/**
 * Registrar resultado de WOD
 */
export async function registrarResultadoWOD(
  wodId: string,
  userId: string,
  nombreUsuario: string,
  resultado: {
    tiempo?: string;
    rondas?: number;
    reps?: number;
    peso?: string;
    rx: boolean;
    notas?: string;
  }
): Promise<{ success: boolean; error?: string; resultadoId?: string }> {
  try {
    // Verificar si ya tiene resultado
    const existente = await getMiResultadoWOD(wodId, userId);

    if (existente) {
      // Actualizar resultado existente
      const resultRef = doc(db, "wods", wodId, "results", existente.id);
      await updateDoc(resultRef, {
        ...resultado,
        updatedAt: serverTimestamp(),
      });
      return { success: true, resultadoId: existente.id };
    }

    // Crear nuevo resultado en subcolección
    const resultsRef = collection(db, "wods", wodId, "results");
    const docRef = await addDoc(resultsRef, {
      userId,
      nombreUsuario,
      ...resultado,
      createdAt: serverTimestamp(),
    });

    return { success: true, resultadoId: docRef.id };
  } catch (error) {
    console.error("Error al registrar resultado:", error);
    return { success: false, error: "Error al registrar el resultado" };
  }
}
