/**
 * Service para obtener información de clases/planes de membresía
 * Colección: /clases
 */

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface ClasePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  benefits: string;
  target: string;
  image?: string;
  coverImage?: string;
  promo?: string;
  freeTrial?: boolean;
  trialPrice?: string;
  imagePosition?: { x: number; y: number };
  coverImagePosition?: { x: number; y: number };
}

/**
 * Obtiene todas las clases/planes disponibles
 */
export async function getClasesPlan(): Promise<ClasePlan[]> {
  try {
    const clasesRef = collection(db, "clases");
    const snapshot = await getDocs(clasesRef);

    const clases: ClasePlan[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ClasePlan[];

    // Ordenar por nombre
    clases.sort((a, b) => a.name.localeCompare(b.name));

    return clases;
  } catch (error) {
    console.error("Error fetching clases:", error);
    return [];
  }
}
