import { auth, db } from '@/lib/firebase';
import { createUserDocument, getUserById, UserDocument } from '@/lib/userService';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Tipo para los datos del usuario (exportado para usar en la app)
export type UserData = UserDocument;

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el email está verificado
  const isEmailVerified = user?.emailVerified ?? false;

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && firebaseUser.emailVerified) {
        // Solo obtener datos si el email está verificado
        await fetchUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }
      
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Obtener datos del usuario desde Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const data = await getUserById(uid);
      if (data) {
        setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Refrescar datos del usuario (y recargar estado de verificación)
  const refreshUserData = async () => {
    if (auth.currentUser) {
      try {
        // Recargar el usuario para obtener el estado actualizado de verificación
        await auth.currentUser.reload();
        // Obtener el usuario actualizado
        const refreshedUser = auth.currentUser;
        setUser(refreshedUser);
        
        if (refreshedUser?.emailVerified) {
          await fetchUserData(refreshedUser.uid);
        }
      } catch (err) {
        console.error('Error refreshing user:', err);
      }
    }
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar si el email está verificado
      if (!signedInUser.emailVerified) {
        setError('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        throw new Error('Email no verificado');
      }
      
      // Si el email está verificado, verificar si existe el documento en Firestore
      const existingUser = await getUserById(signedInUser.uid);
      if (!existingUser) {
        // Si no existe el documento (usuario antiguo o error), crear uno básico
        // Esto no debería pasar normalmente
        console.warn('Usuario sin documento en Firestore, creando...');
      }
      
    } catch (err: any) {
      if (err.message !== 'Email no verificado') {
        const errorMessage = getFirebaseErrorMessage(err.code);
        setError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar usuario
  const signUp = async (email: string, password: string, displayName: string, phone?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // 1. Crear usuario en Firebase Auth
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Enviar email de verificación
      await sendEmailVerification(newUser);
      
      // 3. Crear documento en Firestore (con emailVerified = false inicialmente)
      await createUserDocument(
        newUser.uid,
        email,
        displayName,
        phone
      );
      
      // No setear userData aún, esperar a que verifique el email
      // El usuario verá la pantalla de verificación
      
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reenviar email de verificación
  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        setLoading(true);
        await sendEmailVerification(user);
      } catch (err: any) {
        const errorMessage = getFirebaseErrorMessage(err.code);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err: any) {
      setError('Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Actualizar datos del usuario
  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (err: any) {
      setError('Error al actualizar datos');
      throw err;
    }
  };

  // Limpiar errores
  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    initializing,
    error,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
    updateUserData,
    refreshUserData,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Función para traducir errores de Firebase al español
function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/invalid-credential': 'Credenciales inválidas',
  };

  return errorMessages[errorCode] || 'Ocurrió un error. Intenta de nuevo';
}
