import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dumbbell, Timer, X } from "lucide-react-native";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

type RootNavigation = NativeStackNavigationProp<any>;

const actionOptions = [
  {
    id: "timer",
    title: "Timer",
    subtitle: "AMRAP, TABATA, EMOM...",
    icon: Timer,
    iconColor: "#dc2626",
    iconBg: "bg-red-50",
  },
  {
    id: "wod",
    title: "Registrar WOD",
    subtitle: "Guarda tu resultado",
    icon: Dumbbell,
    iconColor: "#16a34a",
    iconBg: "bg-green-50",
  },
];

export default function ActionsModal() {
  const navigation = useNavigation<RootNavigation>();

  const handleAction = (id: string) => {
    navigation.goBack();

    setTimeout(() => {
      if (id === "timer") {
        navigation.navigate("Timer");
      } else if (id === "wod") {
        navigation.navigate("WOD");
      }
    }, 100);
  };

  return (
    <Pressable
      className="flex-1 justify-end"
      onPress={() => navigation.goBack()}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <Pressable onPress={(e) => e.stopPropagation()}>
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-montserrat-bold text-gray-900">
              Acción Rápida
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -mr-2 rounded-full bg-gray-100"
            >
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="gap-3">
            {actionOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleAction(option.id)}
                className="flex-row items-center bg-gray-50 p-4 rounded-2xl"
                activeOpacity={0.7}
              >
                <View
                  className={`w-12 h-12 ${option.iconBg} rounded-full items-center justify-center mr-4`}
                >
                  <option.icon size={24} color={option.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="font-montserrat-bold text-gray-900">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-gray-500 font-montserrat">
                    {option.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Open Gym Button */}
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              console.log("Open Gym");
            }}
            className="mt-4 w-full bg-gray-900 py-4 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-montserrat-bold">
              🏋️ Hacer Open Gym
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}
