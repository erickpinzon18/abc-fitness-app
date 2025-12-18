import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ChevronLeft,
  Clock,
  Flame,
  Hourglass,
  Repeat,
  Timer,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootNavigation = NativeStackNavigationProp<any>;

const timerOptions = [
  {
    id: "clock",
    title: "Reloj",
    subtitle: "Stopwatch simple",
    icon: Clock,
    iconBg: "bg-gray-100",
    iconColor: "#374151",
    colSpan: 1,
  },
  {
    id: "tabata",
    title: "Tabata",
    subtitle: "20s ON / 10s OFF",
    icon: Flame,
    iconBg: "bg-red-50",
    iconColor: "#dc2626",
    colSpan: 1,
  },
  {
    id: "amrap",
    title: "AMRAP",
    subtitle: "Cuenta regresiva",
    icon: Repeat,
    iconBg: "bg-blue-50",
    iconColor: "#2563eb",
    colSpan: 1,
  },
  {
    id: "emom",
    title: "EMOM",
    subtitle: "Intervalos x Minuto",
    icon: Timer,
    iconBg: "bg-purple-50",
    iconColor: "#7c3aed",
    colSpan: 1,
  },
  {
    id: "fortime",
    title: "For Time",
    subtitle: "Tiempo límite personalizado",
    icon: Hourglass,
    iconBg: "bg-green-50",
    iconColor: "#16a34a",
    colSpan: 2,
  },
];

export default function TimerScreen() {
  const navigation = useNavigation<RootNavigation>();

  const handleSelectTimer = (type: string) => {
    navigation.navigate("ActiveTimer", { type });
  };

  return (
    <SafeAreaView className="flex-1 bg-avc-gray">
      <ScrollView className="flex-1 p-5">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full"
          >
            <ChevronLeft size={28} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-2xl font-montserrat-bold text-gray-900 ml-2">
            AVC Timer Pro
          </Text>
        </View>

        <Text className="text-gray-500 text-sm font-montserrat mb-6">
          Selecciona el tipo de entrenamiento para hoy. ¡Dalo todo!
        </Text>

        {/* Timer Options Grid */}
        <View className="flex-row flex-wrap gap-4">
          {timerOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelectTimer(option.id)}
              className={`bg-white p-5 rounded-2xl shadow-sm items-center justify-center gap-3 h-40 border-2 border-transparent ${
                option.colSpan === 2 ? "flex-1" : "w-[47%]"
              }`}
              activeOpacity={0.7}
              style={{ minWidth: option.colSpan === 2 ? "100%" : undefined }}
            >
              <View
                className={`w-12 h-12 ${option.iconBg} rounded-full items-center justify-center`}
              >
                <option.icon size={24} color={option.iconColor} />
              </View>
              <View className="items-center">
                <Text className="font-montserrat-bold text-gray-900">
                  {option.title}
                </Text>
                <Text className="text-xs text-gray-400 font-montserrat">
                  {option.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
