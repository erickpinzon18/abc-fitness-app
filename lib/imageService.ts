/**
 * Image Service - Para subir fotos de perfil a Firebase Storage
 * Ruta: /usersPhotos/{userId}/photo
 */

import { storage } from "@/lib/firebase";
import { updateUser } from "@/lib/userService";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * Solicitar permisos de cámara
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

/**
 * Solicitar permisos de galería
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

/**
 * Abrir selector de imagen de la galería
 */
export async function pickImageFromGallery(): Promise<string | null> {
  const permission = await requestMediaLibraryPermission();
  if (!permission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Tomar foto con la cámara
 */
export async function takePhoto(): Promise<string | null> {
  const permission = await requestCameraPermission();
  if (!permission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Convertir URI a Blob para subir a Firebase
 */
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

/**
 * Subir foto de perfil a Firebase Storage
 * @param userId - ID del usuario
 * @param imageUri - URI local de la imagen
 * @returns URL pública de la imagen
 */
export async function uploadProfilePhoto(
  userId: string,
  imageUri: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Crear referencia en Storage: /usersPhotos/{userId}/photo.jpg
    const timestamp = Date.now();
    const storageRef = ref(
      storage,
      `usersPhotos/${userId}/photo_${timestamp}.jpg`
    );

    // Convertir URI a blob
    const blob = await uriToBlob(imageUri);

    // Subir a Storage
    await uploadBytes(storageRef, blob);

    // Obtener URL pública
    const downloadURL = await getDownloadURL(storageRef);

    // Actualizar documento del usuario con la nueva URL
    await updateUser(userId, {
      photoURL: downloadURL,
    });

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return { success: false, error: "Error al subir la foto" };
  }
}

/**
 * Mostrar opciones de selección de imagen
 */
export interface ImagePickerOption {
  label: string;
  action: () => Promise<string | null>;
}

export function getImagePickerOptions(): ImagePickerOption[] {
  return [
    {
      label: "Tomar foto",
      action: takePhoto,
    },
    {
      label: "Elegir de galería",
      action: pickImageFromGallery,
    },
  ];
}
