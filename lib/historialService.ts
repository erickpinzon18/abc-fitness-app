/**
 * Historial Service - Para obtener historial de asistencias del usuario
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export interface AttendanceRecord {
  id: string;
  claseId: string;
  claseName: string;
  fecha: Date;
  hora: string;
  status: "confirmada" | "checked-in" | "cancelada";
  checkInTime?: Date;
  tipo?: string;
}

export interface AttendanceStats {
  totalClases: number;
  totalCheckIns: number;
  totalCanceladas: number;
  porcentajeAsistencia: number;
  claseMasFrecuente: string;
  mejorMes: string;
  rachaActual: number;
  rachaMaxima: number;
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  count: number;
}

/**
 * Obtiene el historial de asistencias del usuario
 */
export async function getUserAttendanceHistory(
  userId: string,
  limit?: number
): Promise<AttendanceRecord[]> {
  try {
    const reservationsRef = collection(db, "users", userId, "reservations");
    // Ordenar por fecha decreciente
    const q = query(reservationsRef, orderBy("fecha", "desc"));

    const snapshot = await getDocs(q);
    console.log("📋 Reservations found:", snapshot.docs.length);

    const records: AttendanceRecord[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log("📝 Reservation data:", data);

      // Usar el campo claseNombre directamente
      const claseName = data.claseNombre || data.className || "Clase";

      // Parsear fecha
      const fecha = data.fecha?.toDate
        ? data.fecha.toDate()
        : new Date(data.fecha);

      records.push({
        id: docSnap.id,
        claseId: data.claseId || "",
        claseName: claseName,
        fecha: fecha,
        hora: data.horaInicio || formatTime(fecha),
        status: data.status || "confirmada",
        checkInTime: data.checkedInAt?.toDate?.() || data.checkedInAt,
        tipo: data.nivel || data.tipo,
      });
    }

    console.log("📊 Processed records:", records.length);
    return limit ? records.slice(0, limit) : records;
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return [];
  }
}

/**
 * Obtiene estadísticas de asistencia del usuario
 */
export async function getUserAttendanceStats(
  userId: string
): Promise<AttendanceStats> {
  try {
    const records = await getUserAttendanceHistory(userId);

    const checkIns = records.filter((r) => r.status === "checked-in");
    const canceladas = records.filter((r) => r.status === "cancelada");

    // Contar clases por tipo
    const claseCount: Record<string, number> = {};
    checkIns.forEach((r) => {
      claseCount[r.claseName] = (claseCount[r.claseName] || 0) + 1;
    });

    // Encontrar la clase más frecuente
    let claseMasFrecuente = "N/A";
    let maxCount = 0;
    Object.entries(claseCount).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        claseMasFrecuente = name;
      }
    });

    // Contar por mes
    const monthlyCount: Record<string, number> = {};
    checkIns.forEach((r) => {
      const monthKey = `${r.fecha.getFullYear()}-${r.fecha.getMonth() + 1}`;
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    // Encontrar el mejor mes
    let mejorMes = "N/A";
    let maxMonthCount = 0;
    Object.entries(monthlyCount).forEach(([monthKey, count]) => {
      if (count > maxMonthCount) {
        maxMonthCount = count;
        const [year, month] = monthKey.split("-");
        mejorMes = `${getMonthName(parseInt(month))} ${year}`;
      }
    });

    // Obtener racha del usuario
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    return {
      totalClases: records.length,
      totalCheckIns: checkIns.length,
      totalCanceladas: canceladas.length,
      porcentajeAsistencia:
        records.length > 0
          ? Math.round((checkIns.length / records.length) * 100)
          : 0,
      claseMasFrecuente,
      mejorMes,
      rachaActual: userData?.streak || 0,
      rachaMaxima: userData?.longestStreak || userData?.streak || 0,
    };
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return {
      totalClases: 0,
      totalCheckIns: 0,
      totalCanceladas: 0,
      porcentajeAsistencia: 0,
      claseMasFrecuente: "N/A",
      mejorMes: "N/A",
      rachaActual: 0,
      rachaMaxima: 0,
    };
  }
}

/**
 * Obtiene asistencias agrupadas por mes (últimos 6 meses)
 */
export async function getMonthlyAttendance(
  userId: string
): Promise<MonthlyAttendance[]> {
  try {
    const records = await getUserAttendanceHistory(userId);
    const checkIns = records.filter((r) => r.status === "checked-in");

    // Generar últimos 6 meses
    const months: MonthlyAttendance[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      const count = checkIns.filter((r) => {
        const recordMonth = `${r.fecha.getFullYear()}-${
          r.fecha.getMonth() + 1
        }`;
        return recordMonth === monthKey;
      }).length;

      months.push({
        month: getMonthNameShort(date.getMonth() + 1),
        year: date.getFullYear(),
        count,
      });
    }

    return months;
  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    return [];
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month - 1] || "";
}

function getMonthNameShort(month: number): string {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[month - 1] || "";
}
