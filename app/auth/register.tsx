import { Button, Input } from '@/components/ui';
import { router } from 'expo-router';
import { ChevronLeft, Lock, Mail, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    // Simular registro
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1500);
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

            <View className="mb-8">
              <Text className="text-gray-500 text-base font-montserrat leading-relaxed">
                Únete a la comunidad{' '}
                <Text className="font-montserrat-bold text-avc-red">AVC</Text> y empieza a
                transformar tu vida hoy mismo.
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-5 w-full">
              <Input
                label="Nombre Completo"
                placeholder="Juan Pérez"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Input
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Teléfono"
                placeholder="427 123 4567"
                value={phone}
                onChangeText={setPhone}
                icon={Phone}
                keyboardType="phone-pad"
              />

              <Input
                label="Contraseña"
                placeholder="Crear contraseña"
                value={password}
                onChangeText={setPassword}
                icon={Lock}
                secureTextEntry
              />

              <Input
                label="Confirmar Contraseña"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={Lock}
                secureTextEntry
              />

              {/* Terms Checkbox */}
              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                className="flex-row items-start pt-2 px-1"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                    acceptTerms ? 'bg-avc-red border-avc-red' : 'border-gray-300 bg-gray-50'
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

              <View className="pt-6">
                <Button
                  title="Crear Cuenta"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={!acceptTerms}
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
