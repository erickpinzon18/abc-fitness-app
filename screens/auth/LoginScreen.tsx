import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlertCircle,
  ArrowRight,
  Dumbbell,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthNavigation = NativeStackNavigationProp<any>;

export default function LoginScreen() {
  const navigation = useNavigation<AuthNavigation>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const {
    signIn,
    resetPassword,
    loading,
    error,
    clearError,
    user,
    isEmailVerified,
  } = useAuth();

  // (Auto-navegación removida - el usuario siempre verá el login)
  // Redirigir según el estado de autenticación y verificación
  useEffect(() => {
    if (user) {
      if (isEmailVerified) {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        navigation.navigate("VerifyEmail");
      }
    }
  }, [user, isEmailVerified, navigation]);

  // Manejar error del contexto de auth
  useEffect(() => {
    if (error) {
      setGeneralError(error);
      clearError();
    }
  }, [error, clearError]);

  // Limpiar errores cuando el usuario escribe
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError("");
    setGeneralError("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError("");
    setGeneralError("");
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingresa un correo electrónico válido");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es requerida");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email.trim(), password);
      // Navegar a Main después de login exitoso
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (err) {
      // El error se maneja en el useEffect de error
    }
  };

  const handleForgotPassword = async () => {
    setResetSuccess("");

    if (!email.trim()) {
      setEmailError(
        "Ingresa tu correo electrónico para recuperar tu contraseña"
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingresa un correo electrónico válido");
      return;
    }

    try {
      await resetPassword(email.trim());
      setResetSuccess("Se ha enviado un enlace de recuperación a tu correo");
      setGeneralError("");
    } catch (err) {
      // El error se maneja en el useEffect
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Spacer top para centrar verticalmente */}
          <View style={styles.flex1} />

          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={styles.logoContainer}>
              <Dumbbell size={56} color="#dc2626" />
            </View>
            <Text style={styles.title}>AVC Fitness</Text>
            <Text style={styles.subtitle}>
              Tu entrenamiento, tu estilo de vida
            </Text>
          </View>

          {/* Error General */}
          {generalError ? (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color="#dc2626" />
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {resetSuccess ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{resetSuccess}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={handleEmailChange}
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={handlePasswordChange}
                icon={Lock}
                secureTextEntry
                error={passwordError}
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                icon={ArrowRight}
                loading={loading}
              />
            </View>
          </View>

          {/* Footer - siempre al final */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿No tienes una cuenta?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate("Register")}
              >
                Regístrate aquí
              </Text>
            </Text>
          </View>

          {/* Spacer bottom */}
          <View style={styles.flex1} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 112,
    height: 112,
    backgroundColor: "#fef2f2",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 30,
    fontFamily: "Montserrat-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "#6b7280",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "#dc2626",
    marginLeft: 8,
    flex: 1,
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "#16a34a",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  passwordContainer: {
    marginTop: 20,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
    color: "#dc2626",
  },
  buttonContainer: {
    marginTop: 24,
  },
  footer: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Montserrat",
    color: "#6b7280",
  },
  footerLink: {
    fontFamily: "Montserrat-Bold",
    color: "#dc2626",
  },
});
