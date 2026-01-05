import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

// ============================================
// TIPOS
// ============================================

/**
 * Noticia - Documento en /news
 */
export interface News {
  id: string; // ID del documento de Firebase
  titulo: string;
  contenido: string;
  resumen: string;
  imagenUrl: string;
  categoria: "Horarios" | "Promociones" | "Eventos" | "General";
  fechaPublicacion: Timestamp;
  fechaVencimiento: Timestamp;
  activo: boolean;
  destacado: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// FUNCIONES DE NOTICIAS
// ============================================

/**
 * Obtiene todas las noticias activas que no han vencido
 * Ordenadas por destacado (primero) y luego por fecha de publicación (más recientes primero)
 */
export async function getActiveNews(): Promise<News[]> {
  const ahora = new Date();

  console.log("📰 getActiveNews - Iniciando consulta...");
  console.log("📰 Fecha actual:", ahora.toISOString());

  try {
    const newsRef = collection(db, "news");

    // Query simple solo por activo (las fechas están como strings, no Timestamps)
    const q = query(newsRef, where("activo", "==", true));

    const snapshot = await getDocs(q);
    console.log("📰 Docs activos encontrados:", snapshot.size);

    // Mapear y filtrar manualmente por fecha de vencimiento
    const allNews = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convertir fechas de string a Date si es necesario
        fechaVencimiento:
          data.fechaVencimiento instanceof Timestamp
            ? data.fechaVencimiento
            : Timestamp.fromDate(new Date(data.fechaVencimiento)),
        fechaPublicacion:
          data.fechaPublicacion instanceof Timestamp
            ? data.fechaPublicacion
            : Timestamp.fromDate(new Date(data.fechaPublicacion)),
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt
            : Timestamp.fromDate(
                new Date(data.createdAt || data.fechaPublicacion)
              ),
      } as News;
    });

    // Filtrar por fecha de vencimiento
    const news = allNews.filter((n) => {
      const fechaVenc = n.fechaVencimiento.toDate();
      const isValid = fechaVenc >= ahora;
      console.log(
        `📰 ${n.titulo}: vence ${fechaVenc.toISOString()} - válido: ${isValid}`
      );
      return isValid;
    });

    // Ordenar: destacados primero, luego por fecha de publicación
    news.sort((a, b) => {
      if (a.destacado !== b.destacado) {
        return b.destacado ? 1 : -1;
      }
      return (
        b.fechaPublicacion.toDate().getTime() -
        a.fechaPublicacion.toDate().getTime()
      );
    });

    console.log("📰 Noticias válidas retornadas:", news.length);
    return news;
  } catch (error) {
    console.error("📰 ERROR en getActiveNews:", error);
    throw error;
  }
}

/**
 * Suscripción en tiempo real a las noticias activas
 */
export function subscribeToNews(callback: (news: News[]) => void): () => void {
  const ahora = Timestamp.now();

  const newsRef = collection(db, "news");
  const q = query(
    newsRef,
    where("activo", "==", true),
    where("fechaVencimiento", ">=", ahora),
    orderBy("fechaVencimiento", "asc"),
    orderBy("destacado", "desc"),
    orderBy("fechaPublicacion", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as News[];
    callback(news);
  });
}

/**
 * Formatea la fecha de publicación para mostrar
 */
export function formatNewsDate(fecha: Timestamp): string {
  const date = fecha.toDate();
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("es-MX", options);
}

/**
 * Obtiene el color de la categoría para badges
 */
export function getCategoryColor(categoria: string): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    Horarios: { bg: "#dbeafe", text: "#1d4ed8" },
    Promociones: { bg: "#dcfce7", text: "#16a34a" },
    Eventos: { bg: "#fef3c7", text: "#d97706" },
    General: { bg: "#f3f4f6", text: "#4b5563" },
  };
  return colors[categoria] || colors.General;
}
