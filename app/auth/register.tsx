import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { AlertCircle, ChevronLeft, Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Estados de errores
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { signUp, loading, error, clearError, user, isEmailVerified } = useAuth();

  // Redirigir según el estado de verificación
  useEffect(() => {
    if (user) {
      if (isEmailVerified) {
        router.replace('/(tabs)');
      } else {
        // Usuario registrado pero no verificado, ir a verificar
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

  // Funciones para limpiar errores al escribir
  const handleNameChange = (text: string) => {
    setName(text);
    setNameError('');
    setGeneralError('');
  };

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

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError('');
    setGeneralError('');
  };

  const handleTermsToggle = () => {
    setAcceptTerms(!acceptTerms);
    setTermsError('');
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Limpiar todos los errores
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    setGeneralError('');

    if (!name.trim()) {
      setNameError('El nombre es requerido');
      isValid = false;
    }

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
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirma tu contraseña');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    }

    if (!acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email.trim(), password, name.trim(), phone.trim());
      // La redirección se maneja en el useEffect basado en el estado del usuario
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
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-2">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2 rounded-full"
              >
                <ChevronLeft size={28} color="#4b5563" />
              </TouchableOpacity>
              <Text className="text-2xl font-montserrat-bold text-gray-900 ml-2">
                Crear Cuenta
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-gray-500 text-base font-montserrat leading-relaxed">
                Únete a la comunidad{' '}
                <Text className="font-montserrat-bold text-avc-red">AVC</Text> y empieza a
                transformar tu vida hoy mismo.
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

            {/* Form */}
            <View className="space-y-5 w-full">
              <Input
                label="Nombre Completo"
                placeholder="Juan Pérez"
                value={name}
                onChangeText={handleNameChange}
                icon={User}
                autoCapitalize="words"
                error={nameError}
              />

              <Input
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                className='mt-4'
                onChangeText={handleEmailChange}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />

              <Input
                label="Teléfono (opcional)"
                placeholder="427 123 4567"
                className='mt-4'
                value={phone}
                onChangeText={setPhone}
                icon={Phone}
                keyboardType="phone-pad"
              />

              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={handlePasswordChange}
                className='mt-4'
                icon={Lock}
                secureTextEntry
                error={passwordError}
              />

              <Input
                label="Confirmar Contraseña"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                className='mt-4'
                icon={Lock}
                secureTextEntry
                error={confirmPasswordError}
              />

              {/* Terms Checkbox */}
              <View>
                <TouchableOpacity
                  onPress={handleTermsToggle}
                  className="flex-row items-start pt-2 px-1 mt-4"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                      acceptTerms 
                        ? 'bg-avc-red border-avc-red' 
                        : termsError 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {acceptTerms && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-sm text-gray-500 font-montserrat-medium flex-1">
                    Acepto los{' '}
                    <Text className="text-avc-red font-montserrat-bold">Términos</Text> y la
                    Política de Privacidad.
                  </Text>
                </TouchableOpacity>
                {termsError ? (
                  <Text className="text-xs text-red-500 ml-8 mt-1 font-montserrat">{termsError}</Text>
                ) : null}
              </View>

              <View className="pt-6">
                <Button
                  title="Crear Cuenta"
                  onPress={handleRegister}
                  loading={loading}
                />
              </View>
            </View>

            {/* Footer */}
            <View className="pt-6 items-center border-t border-gray-100 mt-6">
              <Text className="text-sm text-gray-500 font-montserrat pt-4">
                ¿Ya tienes cuenta?{' '}
                <Text
                  className="font-montserrat-bold text-avc-red"
                  onPress={() => router.back()}
                >
                  Inicia Sesión
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
