import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

// Tipo para los datos del usuario en Firestore
export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  membershipType: 'basic' | 'pro' | 'premium' | 'unlimited';
  membershipExpiry?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  streak: number;
  totalClasses: number;
  level: 'Scaled' | 'Intermedio' | 'RX';
  isActive: boolean;
}

// Colección de usuarios
const usersCollection = collection(db, 'users');

/**
 * Crea un nuevo documento de usuario en Firestore
 */
export async function createUserDocument(
  uid: string,
  email: string,
  displayName: string,
  phone?: string
): Promise<UserDocument> {
  const userRef = doc(db, 'users', uid);
  
  const userData = {
    uid,
    email,
    displayName,
    phone: phone || '',
    photoURL: '',
    membershipType: 'basic' as const,
    streak: 0,
    totalClasses: 0,
    level: 'Scaled' as const,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  // Retornar el documento con timestamps locales para uso inmediato
  return {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

/**
 * Obtiene un usuario por su UID
 */
export async function getUserById(uid: string): Promise<UserDocument | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserDocument;
  }
  
  return null;
}

/**
 * Actualiza los datos de un usuario
 */
export async function updateUser(
  uid: string,
  data: Partial<Omit<UserDocument, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Obtiene usuarios creados en un rango de fechas
 * Útil para estadísticas de nuevos usuarios por mes
 */
export async function getUsersByDateRange(
  startDate: Date,
  endDate: Date
): Promise<UserDocument[]> {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const q = query(
    usersCollection,
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserDocument);
}

/**
 * Obtiene usuarios nuevos del mes actual
 */
export async function getNewUsersThisMonth(): Promise<UserDocument[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return getUsersByDateRange(startOfMonth, endOfMonth);
}

/**
 * Obtiene el conteo de usuarios nuevos por mes del año actual
 */
export async function getMonthlyUserStats(): Promise<{ month: string; count: number }[]> {
  const now = new Date();
  const year = now.getFullYear();
  const stats: { month: string; count: number }[] = [];

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  for (let month = 0; month <= now.getMonth(); month++) {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    
    const users = await getUsersByDateRange(startOfMonth, endOfMonth);
    
    stats.push({
      month: monthNames[month],
      count: users.length,
    });
  }

  return stats;
}

/**
 * Obtiene el total de usuarios activos
 */
export async function getTotalActiveUsers(): Promise<number> {
  const q = query(usersCollection, where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Obtiene usuarios por tipo de membresía
 */
export async function getUsersByMembershipType(
  membershipType: UserDocument['membershipType']
): Promise<UserDocument[]> {
  const q = query(usersCollection, where('membershipType', '==', membershipType));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserDocument);
}

/**
 * Obtiene estadísticas generales de usuarios
 */
export async function getUserStats(): Promise<{
  total: number;
  newThisMonth: number;
  byMembership: { type: string; count: number }[];
}> {
  const [totalActive, newUsers] = await Promise.all([
    getTotalActiveUsers(),
    getNewUsersThisMonth(),
  ]);

  // Obtener conteo por tipo de membresía
  const membershipTypes: UserDocument['membershipType'][] = ['basic', 'pro', 'premium', 'unlimited'];
  const byMembership = await Promise.all(
    membershipTypes.map(async (type) => ({
      type,
      count: (await getUsersByMembershipType(type)).length,
    }))
  );

  return {
    total: totalActive,
    newThisMonth: newUsers.length,
    byMembership,
  };
}
