import { Button, Input } from '@/components/ui';
import { router } from 'expo-router';
import { ArrowRight, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // Navegar directamente a tabs
    router.replace('/(tabs)');
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

            {/* Form */}
            <View className="space-y-5 w-full">
              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View>
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  icon={Lock}
                  secureTextEntry
                />
                <TouchableOpacity className="self-end mt-2">
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
