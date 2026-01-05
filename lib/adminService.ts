import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

// ============================================
// TIPOS
// ============================================

export type AdminRole = "admin" | "coach";

export interface AdminPermissions {
  clases: boolean;
  horarios: boolean;
  eventos: boolean;
  blog: boolean;
  noticias: boolean;
  coaches: boolean;
  configuracion: boolean;
  beneficios: boolean;
  testimonios: boolean;
  contacto: boolean;
  redes: boolean;
}

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: AdminPermissions;
  createdAt: Timestamp;
}

// Estructura para crear/editar clases
export interface ClaseInput {
  clase: string;
  instructor: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  duracion: number;
  capacidadMaxima: number;
  nivel: string;
}

// Estructura para crear/editar WODs
export interface WODInput {
  titulo: string;
  modalidad: string;
  timeCap?: number;
  ejercicios: {
    nombre: string;
    cantidad: string;
    peso?: string;
  }[];
  notas?: string;
  fecha: Date;
}

// Estructura para crear/editar noticias
export interface NewsInput {
  titulo: string;
  resumen: string;
  contenido: string;
  imagenUrl: string;
  categoria: string;
  fechaPublicacion: Date;
  fechaVencimiento: Date;
  activo: boolean;
  destacado: boolean;
}

// Estructura de coach
export interface Coach {
  id: string;
  name: string;
  email: string;
  specialty: string;
  image?: string;
}

// ============================================
// FUNCIONES DE ADMIN
// ============================================

/**
 * Verificar si un email corresponde a un admin o coach
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("email", "==", email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Admin;
  } catch (error) {
    console.error("Error verificando admin:", error);
    return null;
  }
}

/**
 * Verificar si el admin tiene un permiso específico
 */
export function hasPermission(
  admin: Admin,
  permission: keyof AdminPermissions
): boolean {
  return admin.permissions?.[permission] === true;
}

// ============================================
// CRUD CLASES
// ============================================

/**
 * Crear una nueva clase en el calendario
 */
export async function createClase(
  data: ClaseInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const calendarioRef = collection(db, "calendario");

    const docRef = await addDoc(calendarioRef, {
      clase: data.clase,
      instructor: data.instructor,
      fecha: Timestamp.fromDate(data.fecha),
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      duracion: data.duracion,
      capacidadMaxima: data.capacidadMaxima,
      nivel: data.nivel,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creando clase:", error);
    return { success: false, error: "Error al crear la clase" };
  }
}

/**
 * Actualizar una clase existente
 */
export async function updateClase(
  id: string,
  data: Partial<ClaseInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const claseRef = doc(db, "calendario", id);

    const updateData: any = { ...data };
    if (data.fecha) {
      updateData.fecha = Timestamp.fromDate(data.fecha);
    }
    updateData.updatedAt = serverTimestamp();

    await updateDoc(claseRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando clase:", error);
    return { success: false, error: "Error al actualizar la clase" };
  }
}

/**
 * Eliminar una clase
 */
export async function deleteClase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "calendario", id));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando clase:", error);
    return { success: false, error: "Error al eliminar la clase" };
  }
}

// ============================================
// CRUD WODs
// ============================================

/**
 * Crear un nuevo WOD
 */
export async function createWOD(
  data: WODInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const calendarioRef = collection(db, "calendario");

    const docRef = await addDoc(calendarioRef, {
      tipo: "wod",
      titulo: data.titulo,
      modalidad: data.modalidad,
      timeCap: data.timeCap || null,
      ejercicios: data.ejercicios,
      notas: data.notas || "",
      fecha: Timestamp.fromDate(data.fecha),
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creando WOD:", error);
    return { success: false, error: "Error al crear el WOD" };
  }
}

/**
 * Actualizar un WOD existente
 */
export async function updateWOD(
  id: string,
  data: Partial<WODInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const wodRef = doc(db, "calendario", id);

    const updateData: any = { ...data };
    if (data.fecha) {
      updateData.fecha = Timestamp.fromDate(data.fecha);
    }
    updateData.updatedAt = serverTimestamp();

    await updateDoc(wodRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando WOD:", error);
    return { success: false, error: "Error al actualizar el WOD" };
  }
}

/**
 * Eliminar un WOD
 */
export async function deleteWOD(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "calendario", id));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando WOD:", error);
    return { success: false, error: "Error al eliminar el WOD" };
  }
}

// ============================================
// CRUD NOTICIAS
// ============================================

/**
 * Crear una nueva noticia
 */
export async function createNews(
  data: NewsInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const newsRef = collection(db, "news");

    const docRef = await addDoc(newsRef, {
      titulo: data.titulo,
      resumen: data.resumen,
      contenido: data.contenido,
      imagenUrl: data.imagenUrl,
      categoria: data.categoria,
      fechaPublicacion: Timestamp.fromDate(data.fechaPublicacion),
      fechaVencimiento: Timestamp.fromDate(data.fechaVencimiento),
      activo: data.activo,
      destacado: data.destacado,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creando noticia:", error);
    return { success: false, error: "Error al crear la noticia" };
  }
}

/**
 * Actualizar una noticia existente
 */
export async function updateNews(
  id: string,
  data: Partial<NewsInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const newsRef = doc(db, "news", id);

    const updateData: any = { ...data };
    if (data.fechaPublicacion) {
      updateData.fechaPublicacion = Timestamp.fromDate(data.fechaPublicacion);
    }
    if (data.fechaVencimiento) {
      updateData.fechaVencimiento = Timestamp.fromDate(data.fechaVencimiento);
    }
    updateData.updatedAt = serverTimestamp();

    await updateDoc(newsRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando noticia:", error);
    return { success: false, error: "Error al actualizar la noticia" };
  }
}

/**
 * Eliminar una noticia
 */
export async function deleteNews(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "news", id));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando noticia:", error);
    return { success: false, error: "Error al eliminar la noticia" };
  }
}

/**
 * Obtener todas las noticias (para admin)
 */
export async function getAllNews(): Promise<
  (NewsInput & { id: string; createdAt: Timestamp })[]
> {
  try {
    const newsRef = collection(db, "news");
    const snapshot = await getDocs(newsRef);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        titulo: data.titulo,
        resumen: data.resumen,
        contenido: data.contenido,
        imagenUrl: data.imagenUrl,
        categoria: data.categoria,
        fechaPublicacion:
          data.fechaPublicacion instanceof Timestamp
            ? data.fechaPublicacion.toDate()
            : new Date(data.fechaPublicacion),
        fechaVencimiento:
          data.fechaVencimiento instanceof Timestamp
            ? data.fechaVencimiento.toDate()
            : new Date(data.fechaVencimiento),
        activo: data.activo,
        destacado: data.destacado,
        createdAt: data.createdAt,
      };
    }) as any;
  } catch (error) {
    console.error("Error obteniendo noticias:", error);
    return [];
  }
}

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Obtener estadísticas básicas para el dashboard de admin
 */
export async function getAdminStats(): Promise<{
  totalUsuarios: number;
  checkInsHoy: number;
  clasesHoy: number;
  noticiasActivas: number;
}> {
  try {
    // Contar usuarios
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsuarios = usersSnap.size;

    // Contar check-ins de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Clases de hoy
    const clasesRef = collection(db, "calendario");
    const clasesQuery = query(
      clasesRef,
      where("fecha", ">=", Timestamp.fromDate(hoy)),
      where("fecha", "<", Timestamp.fromDate(manana))
    );
    const clasesSnap = await getDocs(clasesQuery);
    // Filtrar solo clases (no WODs)
    const clasesHoy = clasesSnap.docs.filter(
      (d) => d.data().tipo !== "wod"
    ).length;

    // Noticias activas
    const newsRef = collection(db, "news");
    const newsQuery = query(newsRef, where("activo", "==", true));
    const newsSnap = await getDocs(newsQuery);
    const noticiasActivas = newsSnap.size;

    return {
      totalUsuarios,
      checkInsHoy: 0, // TODO: Implementar conteo de check-ins
      clasesHoy,
      noticiasActivas,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      totalUsuarios: 0,
      checkInsHoy: 0,
      clasesHoy: 0,
      noticiasActivas: 0,
    };
  }
}

// ============================================
// COACHES
// ============================================

/**
 * Obtener todos los coaches
 */
export async function getAllCoaches(): Promise<Coach[]> {
  try {
    const coachesRef = collection(db, "coaches");
    const snapshot = await getDocs(coachesRef);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        image: data.image,
      };
    });
  } catch (error) {
    console.error("Error obteniendo coaches:", error);
    return [];
  }
}
