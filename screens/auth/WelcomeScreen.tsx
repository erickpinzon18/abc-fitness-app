import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronRight, PartyPopper, Trophy, Zap } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootNavigation = NativeStackNavigationProp<any>;

export default function WelcomeScreen() {
  const navigation = useNavigation<RootNavigation>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinue = () => {
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="items-center"
        >
          {/* Confetti Icon */}
          <View className="w-28 h-28 bg-gradient-to-br from-red-50 to-orange-50 rounded-full items-center justify-center mb-8 border-4 border-white shadow-lg">
            <PartyPopper size={56} color="#dc2626" />
          </View>

          {/* Título */}
          <Text className="text-3xl font-montserrat-bold text-gray-900 text-center mb-3">
            ¡Bienvenido a AVC!
          </Text>

          <Text className="text-lg text-gray-500 font-montserrat text-center mb-8 px-4">
            Tu cuenta ha sido verificada exitosamente. ¡Estás listo para
            empezar!
          </Text>

          {/* Features */}
          <View className="w-full space-y-4 mb-10">
            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
                <Trophy size={20} color="#dc2626" />
              </View>
              <View className="flex-1">
                <Text className="font-montserrat-bold text-gray-900">
                  Reserva tus clases
                </Text>
                <Text className="text-sm text-gray-500 font-montserrat">
                  Programa tus entrenamientos fácilmente
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Zap size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="font-montserrat-bold text-gray-900">
                  Registra tus WODs
                </Text>
                <Text className="text-sm text-gray-500 font-montserrat">
                  Lleva control de tu progreso
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="w-full bg-avc-red py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-montserrat-bold text-lg mr-2">
              ¡Empezar a entrenar!
            </Text>
            <ChevronRight size={24} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
