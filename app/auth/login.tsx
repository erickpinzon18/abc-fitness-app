import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const { signIn, resetPassword, loading, error, clearError, user, isEmailVerified } = useAuth();

  // Redirigir según el estado de autenticación y verificación
  useEffect(() => {
    if (user) {
      if (isEmailVerified) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/auth/verify-email');
      }
    }
  }, [user, isEmailVerified]);

  // Manejar error del contexto de auth
  useEffect(() => {
    if (error) {
      setGeneralError(error);
      clearError();
    }
  }, [error]);

  // Limpiar errores cuando el usuario escribe
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
    setGeneralError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    setGeneralError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email.trim(), password);
      // La redirección se maneja en el useEffect basado en el estado del usuario
    } catch (err) {
      // El error se maneja en el useEffect
    }
  };

  const handleForgotPassword = async () => {
    setResetSuccess('');
    
    if (!email.trim()) {
      setEmailError('Ingresa tu correo electrónico para recuperar tu contraseña');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return;
    }

    try {
      await resetPassword(email.trim());
      setResetSuccess('Se ha enviado un enlace de recuperación a tu correo');
      setGeneralError('');
    } catch (err) {
      // El error se maneja en el useEffect
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Logo Area */}
            <View className="items-center justify-center mb-10">
              <Image
                source={require('@/assets/images/avc-logo-light.png')}
                className="w-40 h-40 mb-4"
                resizeMode="contain"
              />
              <Text className="text-3xl font-montserrat-bold text-gray-900 mb-1">
                AVC Fitness
              </Text>
              <Text className="text-gray-500 text-sm font-montserrat-medium">
                Tu entrenamiento, tu estilo de vida
              </Text>
            </View>

            {/* Error General */}
            {generalError ? (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center">
                <AlertCircle size={18} color="#dc2626" />
                <Text className="text-sm text-red-600 font-montserrat-medium ml-2 flex-1">
                  {generalError}
                </Text>
              </View>
            ) : null}

            {/* Success Message */}
            {resetSuccess ? (
              <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Text className="text-sm text-green-600 font-montserrat-medium text-center">
                  {resetSuccess}
                </Text>
              </View>
            ) : null}

            {/* Form */}
            <View className="space-y-5 w-full">
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

              <View>
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={handlePasswordChange}
                  className='mt-4'
                  icon={Lock}
                  secureTextEntry
                  error={passwordError}
                />
                <TouchableOpacity onPress={handleForgotPassword} className="self-end mt-4">
                  <Text className="text-xs font-montserrat-semibold text-avc-red">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="pt-4">
                <Button
                  title="Iniciar Sesión"
                  onPress={handleLogin}
                  icon={ArrowRight}
                  loading={loading}
                />
              </View>
            </View>

            {/* Footer */}
            <View className="pt-8 pb-4 items-center">
              <Text className="text-sm text-gray-500 font-montserrat">
                ¿No tienes una cuenta?{' '}
                <Text
                  className="font-montserrat-bold text-avc-red"
                  onPress={() => router.push('/auth/register')}
                >
                  Regístrate aquí
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
