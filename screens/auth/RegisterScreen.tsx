import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlertCircle,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  User,
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

export default function RegisterScreen() {
  const navigation = useNavigation<AuthNavigation>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const { signUp, loading, error, clearError, user, isEmailVerified } =
    useAuth();

  // (Auto-navegación removida - después de registro, ir a VerifyEmail manualmente)

  useEffect(() => {
    if (error) {
      setGeneralError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError("");
    setGeneralError("");
  };

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

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError("");
    setGeneralError("");
  };

  const handleTermsToggle = () => {
    setAcceptTerms(!acceptTerms);
    setTermsError("");
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setGeneralError("");

    if (!name.trim()) {
      setNameError("El nombre es requerido");
      isValid = false;
    }
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
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirma tu contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }
    if (!acceptTerms) {
      setTermsError("Debes aceptar los términos y condiciones");
      isValid = false;
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      await signUp(email.trim(), password, name.trim(), phone.trim());
      // Navegar a VerifyEmail después de registro exitoso
      navigation.navigate("VerifyEmail");
    } catch (err) {
      // El error se maneja en el useEffect de error
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color="#4b5563" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Crear Cuenta</Text>
          </View>

          {/* Spacer para empujar contenido hacia el centro */}
          <View style={styles.topSpacer} />

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Únete a la comunidad <Text style={styles.avcText}>AVC</Text> y
              empieza a transformar tu vida hoy mismo.
            </Text>
          </View>

          {/* Error General */}
          {generalError ? (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color="#dc2626" />
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={name}
              onChangeText={handleNameChange}
              icon={User}
              autoCapitalize="words"
              error={nameError}
            />

            <View style={styles.inputSpacing}>
              <Input
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChangeText={handleEmailChange}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Teléfono (opcional)"
                placeholder="427 123 4567"
                value={phone}
                onChangeText={setPhone}
                icon={Phone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={handlePasswordChange}
                icon={Lock}
                secureTextEntry
                error={passwordError}
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Confirmar Contraseña"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                icon={Lock}
                secureTextEntry
                error={confirmPasswordError}
              />
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              onPress={handleTermsToggle}
              style={styles.termsContainer}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked,
                  termsError && !acceptTerms && styles.checkboxError,
                ]}
              >
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Acepto los <Text style={styles.termsLink}>Términos</Text> y la
                Política de Privacidad.
              </Text>
            </TouchableOpacity>
            {termsError ? (
              <Text style={styles.termsErrorText}>{termsError}</Text>
            ) : null}

            {/* Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Crear Cuenta"
                onPress={handleRegister}
                loading={loading}
              />
            </View>
          </View>

          {/* Spacer inferior para empujar footer */}
          <View style={styles.bottomSpacer} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.goBack()}
              >
                Inicia Sesión
              </Text>
            </Text>
          </View>
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "#111827",
    marginLeft: 8,
  },
  topSpacer: {
    flex: 0.5,
    minHeight: 20,
  },
  bottomSpacer: {
    flex: 1,
    minHeight: 20,
  },
  descriptionContainer: {
    marginBottom: 28,
  },
  description: {
    fontSize: 16,
    fontFamily: "Montserrat",
    color: "#6b7280",
    lineHeight: 24,
  },
  avcText: {
    fontFamily: "Montserrat-Bold",
    color: "#dc2626",
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
  formContainer: {
    width: "100%",
  },
  inputSpacing: {
    marginTop: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  checkboxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "#6b7280",
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: "Montserrat-Bold",
    color: "#dc2626",
  },
  termsErrorText: {
    fontSize: 12,
    fontFamily: "Montserrat",
    color: "#ef4444",
    marginLeft: 32,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 24,
  },
  footer: {
    paddingVertical: 16,
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
