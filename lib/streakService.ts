import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

// ============================================
// TIPOS
// ============================================

export interface StreakData {
  currentStreak: number;        // Racha actual
  longestStreak: number;        // Racha más larga histórica
  lastCheckInDate: string;      // Última fecha de check-in "YYYY-MM-DD"
  lastUpdated: Timestamp;
}

export interface ClassHistory {
  id: string;
  claseId: string;
  claseNombre: string;
  instructor: string;
  fecha: Timestamp;
  fechaString: string;          // "YYYY-MM-DD"
  horaInicio: string;
  horaFin: string;
  status: 'checked-in' | 'no-show' | 'cancelada';
  checkedInAt?: Timestamp;
}

// ============================================
// HELPERS
// ============================================

/**
 * Verifica si una fecha es día hábil (Lunes-Viernes)
 */
export function esDiaHabil(fecha: Date): boolean {
  const dia = fecha.getDay();
  return dia >= 1 && dia <= 5; // 1=Lunes, 5=Viernes
}

/**
 * Obtiene la fecha de ayer
 */
export function getAyer(): Date {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  ayer.setHours(0, 0, 0, 0);
  return ayer;
}

/**
 * Obtiene el último día hábil anterior a hoy
 */
export function getUltimoDiaHabilAnterior(): Date {
  let fecha = new Date();
  fecha.setDate(fecha.getDate() - 1);
  fecha.setHours(0, 0, 0, 0);
  
  // Si es lunes, el último día hábil fue el viernes
  while (!esDiaHabil(fecha)) {
    fecha.setDate(fecha.getDate() - 1);
  }
  
  return fecha;
}

/**
 * Formatea fecha a string YYYY-MM-DD
 */
export function fechaToString(fecha: Date): string {
  return fecha.toISOString().split('T')[0];
}

/**
 * Compara si dos fechas son el mismo día
 */
export function mismoDia(fecha1: Date, fecha2: Date): boolean {
  return (
    fecha1.getFullYear() === fecha2.getFullYear() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getDate() === fecha2.getDate()
  );
}

// ============================================
// FUNCIONES DE RACHA
// ============================================

/**
 * Obtiene los datos de racha del usuario
 */
export async function getStreakData(userId: string): Promise<StreakData | null> {
  const streakRef = doc(db, 'users', userId, 'stats', 'streak');
  const docSnap = await getDoc(streakRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docSnap.data() as StreakData;
}

/**
 * Inicializa los datos de racha para un usuario nuevo
 */
export async function initializeStreak(userId: string): Promise<StreakData> {
  const initialData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: '',
    lastUpdated: Timestamp.now(),
  };
  
  const streakRef = doc(db, 'users', userId, 'stats', 'streak');
  await setDoc(streakRef, initialData);
  
  return initialData;
}

/**
 * Actualiza la racha cuando se hace check-in
 * Retorna los nuevos datos de racha
 */
export async function actualizarRachaConCheckIn(userId: string): Promise<{
  success: boolean;
  newStreak: number;
  message: string;
}> {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyString = fechaToString(hoy);
    
    // Obtener datos actuales de racha
    let streakData = await getStreakData(userId);
    
    if (!streakData) {
      streakData = await initializeStreak(userId);
    }
    
    // Si hoy no es día hábil, no afecta la racha pero registra asistencia
    if (!esDiaHabil(hoy)) {
      return {
        success: true,
        newStreak: streakData.currentStreak,
        message: '¡Entrenamiento de fin de semana! 💪 Tu racha no se afecta',
      };
    }
    
    // Si ya hizo check-in hoy, no hacer nada
    if (streakData.lastCheckInDate === hoyString) {
      return {
        success: true,
        newStreak: streakData.currentStreak,
        message: 'Ya registraste tu asistencia hoy',
      };
    }
    
    const ultimoDiaHabil = getUltimoDiaHabilAnterior();
    const ultimoDiaHabilString = fechaToString(ultimoDiaHabil);
    
    let nuevaRacha: number;
    let mensaje: string;
    
    // Verificar si el último check-in fue el día hábil anterior
    if (streakData.lastCheckInDate === ultimoDiaHabilString) {
      // Continúa la racha
      nuevaRacha = streakData.currentStreak + 1;
      mensaje = `¡Racha de ${nuevaRacha} días! 🔥`;
    } else if (streakData.lastCheckInDate === '') {
      // Primera vez
      nuevaRacha = 1;
      mensaje = '¡Primera asistencia! Comienza tu racha 🎉';
    } else {
      // Se perdió la racha (no vino el último día hábil)
      nuevaRacha = 1;
      mensaje = 'Nueva racha iniciada. ¡A por ella! 💪';
    }
    
    // Actualizar longest streak si es necesario
    const longestStreak = Math.max(streakData.longestStreak, nuevaRacha);
    
    // Guardar en Firestore
    const streakRef = doc(db, 'users', userId, 'stats', 'streak');
    await updateDoc(streakRef, {
      currentStreak: nuevaRacha,
      longestStreak,
      lastCheckInDate: hoyString,
      lastUpdated: Timestamp.now(),
    });
    
    // También actualizar en el documento principal del usuario
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      streak: nuevaRacha,
    });
    
    return {
      success: true,
      newStreak: nuevaRacha,
      message: mensaje,
    };
  } catch (error) {
    console.error('Error actualizando racha:', error);
    return {
      success: false,
      newStreak: 0,
      message: 'Error al actualizar la racha',
    };
  }
}

/**
 * Verifica y actualiza la racha al abrir la app
 * Si el usuario perdió días hábiles sin entrenar, reinicia la racha
 */
export async function verificarRachaAlIniciar(userId: string): Promise<StreakData> {
  try {
    let streakData = await getStreakData(userId);
    
    if (!streakData) {
      return await initializeStreak(userId);
    }
    
    // Si no tiene racha, no hay nada que verificar
    if (streakData.currentStreak === 0 || !streakData.lastCheckInDate) {
      return streakData;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyString = fechaToString(hoy);
    
    // Si el último check-in fue hoy, todo bien
    if (streakData.lastCheckInDate === hoyString) {
      return streakData;
    }
    
    // Verificar si perdió la racha
    const ultimoDiaHabil = getUltimoDiaHabilAnterior();
    const ultimoDiaHabilString = fechaToString(ultimoDiaHabil);
    
    // Si el último check-in fue antes del último día hábil, perdió la racha
    const lastCheckIn = new Date(streakData.lastCheckInDate);
    if (lastCheckIn < ultimoDiaHabil && streakData.lastCheckInDate !== ultimoDiaHabilString) {
      // Perdió la racha
      const streakRef = doc(db, 'users', userId, 'stats', 'streak');
      await updateDoc(streakRef, {
        currentStreak: 0,
        lastUpdated: Timestamp.now(),
      });
      
      // Actualizar documento principal
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        streak: 0,
      });
      
      return {
        ...streakData,
        currentStreak: 0,
      };
    }
    
    return streakData;
  } catch (error) {
    console.error('Error verificando racha:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: '',
      lastUpdated: Timestamp.now(),
    };
  }
}

// ============================================
// FUNCIONES DE HISTORIAL
// ============================================

/**
 * Obtiene el historial de clases del usuario (últimos 30 días)
 */
export async function getHistorialClases(userId: string, limite: number = 30): Promise<ClassHistory[]> {
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - limite);
  const hace30DiasString = fechaToString(hace30Dias);
  
  const reservationsRef = collection(db, 'users', userId, 'reservations');
  const q = query(
    reservationsRef,
    where('fechaString', '>=', hace30DiasString),
    where('status', 'in', ['checked-in', 'no-show']),
    orderBy('fechaString', 'desc'),
    orderBy('horaInicio', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as ClassHistory[];
}

/**
 * Obtiene las clases de esta semana (Lunes a Viernes)
 */
export async function getClasesSemanaActual(userId: string): Promise<ClassHistory[]> {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  
  // Calcular lunes de esta semana
  const lunes = new Date(hoy);
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  lunes.setDate(hoy.getDate() + diffLunes);
  lunes.setHours(0, 0, 0, 0);
  
  // Calcular viernes de esta semana
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  viernes.setHours(23, 59, 59, 999);
  
  const lunesString = fechaToString(lunes);
  const viernesString = fechaToString(viernes);
  
  const reservationsRef = collection(db, 'users', userId, 'reservations');
  const q = query(
    reservationsRef,
    where('fechaString', '>=', lunesString),
    where('fechaString', '<=', viernesString),
    orderBy('fechaString', 'asc'),
    orderBy('horaInicio', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as ClassHistory[];
}

/**
 * Marcar clase como no-show (no asistió)
 * Se puede llamar automáticamente después de que la clase termine
 */
export async function marcarNoShow(
  claseId: string,
  userId: string,
  reservacionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Actualizar en /calendario/{claseId}/reservaciones
    const reservacionRef = doc(db, 'calendario', claseId, 'reservaciones', reservacionId);
    await updateDoc(reservacionRef, {
      status: 'no-show',
    });
    
    // Actualizar en /users/{userId}/reservations
    const userReservationsRef = collection(db, 'users', userId, 'reservations');
    const q = query(
      userReservationsRef,
      where('claseId', '==', claseId),
      where('status', '==', 'confirmada')
    );
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, 'users', userId, 'reservations', docSnap.id), {
        status: 'no-show',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error marcando no-show:', error);
    return { success: false, error: 'Error al marcar como no asistió' };
  }
}

/**
 * Cuenta los días únicos de entrenamiento en el mes actual
 */
export async function getDiasEntrenamientoMes(userId: string): Promise<number> {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const primerDiaMesString = fechaToString(primerDiaMes);
  
  const reservationsRef = collection(db, 'users', userId, 'reservations');
  const q = query(
    reservationsRef,
    where('fechaString', '>=', primerDiaMesString),
    where('status', '==', 'checked-in')
  );
  
  const snapshot = await getDocs(q);
  
  // Contar días únicos
  const diasUnicos = new Set<string>();
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    diasUnicos.add(data.fechaString);
  });
  
  return diasUnicos.size;
}
