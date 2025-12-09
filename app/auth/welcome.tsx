import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { ArrowRight, CheckCircle, Dumbbell, Flame, Trophy } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { userData } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Obtener primer nombre
  const firstName = userData?.displayName?.split(' ')[0] || 'Atleta';

  useEffect(() => {
    // Animación de entrada
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Icono de éxito animado */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-8"
        >
          <View className="w-28 h-28 bg-green-100 rounded-full items-center justify-center border-4 border-green-500">
            <CheckCircle size={56} color="#22c55e" />
          </View>
        </Animated.View>

        {/* Mensaje de bienvenida */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="items-center"
        >
          <Text className="text-3xl font-montserrat-bold text-gray-900 text-center mb-2">
            ¡Bienvenido, {firstName}! 🎉
          </Text>
          
          <Text className="text-lg text-gray-500 font-montserrat text-center mb-8 px-4">
            Tu cuenta ha sido verificada exitosamente
          </Text>
        </Animated.View>

        {/* Tarjeta de bienvenida */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="w-full bg-gradient-to-br bg-red-50 border border-red-100 rounded-3xl p-6 mb-8"
        >
          <Text className="text-center text-lg font-montserrat-bold text-gray-800 mb-4">
            Ahora eres parte de la familia AVC 💪
          </Text>
          
          {/* Features */}
          <View className="space-y-3">
            <View className="flex-row items-center bg-white rounded-xl p-3">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <Dumbbell size={20} color="#dc2626" />
              </View>
              <Text className="text-sm font-montserrat-medium text-gray-700 flex-1">
                Reserva tus clases favoritas
              </Text>
            </View>
            
            <View className="flex-row items-center bg-white rounded-xl p-3 mt-3">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Flame size={20} color="#f97316" />
              </View>
              <Text className="text-sm font-montserrat-medium text-gray-700 flex-1">
                Mantén tu racha de entrenamientos
              </Text>
            </View>
            
            <View className="flex-row items-center bg-white rounded-xl p-3 mt-3">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Trophy size={20} color="#eab308" />
              </View>
              <Text className="text-sm font-montserrat-medium text-gray-700 flex-1">
                Compite en el ranking mensual
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Botón continuar */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            width: '100%',
          }}
        >
          <Button
            title="¡Empezar a entrenar!"
            onPress={handleContinue}
            icon={ArrowRight}
          />
        </Animated.View>

        {/* Mensaje motivacional */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="pt-6"
        >
          <Text className="text-sm text-gray-400 font-montserrat-medium text-center italic">
            "El único mal entrenamiento es el que no hiciste"
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
