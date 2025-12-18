import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CheckCircle, Mail, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthNavigation = NativeStackNavigationProp<any>;

export default function VerifyEmailScreen() {
  const navigation = useNavigation<AuthNavigation>();
  const {
    user,
    isEmailVerified,
    resendVerificationEmail,
    refreshUserData,
    signOut,
    loading,
  } = useAuth();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  // Si ya está verificado, redirigir a pantalla de bienvenida
  useEffect(() => {
    if (isEmailVerified) {
      navigation.navigate("Welcome");
    }
  }, [isEmailVerified, navigation]);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      // Error manejado en el contexto
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    await refreshUserData();
    setChecking(false);
  };

  const handleBackToLogin = async () => {
    await signOut();
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Icono de email */}
        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-8">
          <Mail size={48} color="#dc2626" />
        </View>

        {/* Título */}
        <Text className="text-2xl font-montserrat-bold text-gray-900 text-center mb-3">
          Verifica tu correo electrónico
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-500 font-montserrat text-center mb-2 px-4">
          Hemos enviado un enlace de verificación a:
        </Text>

        <Text className="text-base font-montserrat-bold text-avc-red text-center mb-8">
          {user?.email}
        </Text>

        {/* Instrucciones */}
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 w-full">
          <Text className="text-sm text-amber-800 font-montserrat-semibold text-center mb-2">
            ⚠️ Revisa tu carpeta de SPAM
          </Text>
          <Text className="text-sm text-amber-700 font-montserrat leading-relaxed text-center">
            El correo de verificación suele llegar a la carpeta de spam o correo
            no deseado. Búscalo ahí si no lo ves en tu bandeja de entrada.
          </Text>
        </View>

        {/* Mensaje de éxito al reenviar */}
        {resendSuccess && (
          <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex-row items-center w-full">
            <CheckCircle size={18} color="#16a34a" />
            <Text className="text-sm text-green-600 font-montserrat-medium ml-2 flex-1">
              ¡Correo reenviado! Revisa tu bandeja de entrada.
            </Text>
          </View>
        )}

        {/* Botones */}
        <View className="w-full space-y-4">
          <Button
            title={checking ? "Verificando..." : "Ya verifiqué mi correo"}
            onPress={handleCheckVerification}
            loading={checking}
            icon={RefreshCw}
          />

          <Button
            title="Reenviar correo de verificación"
            onPress={handleResendEmail}
            variant="outline"
            loading={loading}
            className="mt-4"
          />
        </View>

        {/* Volver al login */}
        <View className="pt-8">
          <Text className="text-sm text-gray-500 font-montserrat text-center">
            ¿Correo incorrecto?{" "}
            <Text
              className="font-montserrat-bold text-avc-red"
              onPress={handleBackToLogin}
            >
              Volver al inicio
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
