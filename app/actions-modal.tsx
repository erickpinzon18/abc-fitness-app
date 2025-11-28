import { router } from 'expo-router';
import { Camera, Dumbbell, QrCode, Timer, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

const actionOptions = [
  {
    id: 'wod',
    title: 'Registrar WOD',
    icon: Dumbbell,
    color: '#dc2626',
    bgColor: 'bg-red-50',
  },
  {
    id: 'qr',
    title: 'Escanear QR',
    icon: QrCode,
    color: '#2563eb',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'photo',
    title: 'Subir Foto',
    icon: Camera,
    color: '#16a34a',
    bgColor: 'bg-green-50',
  },
  {
    id: 'timer',
    title: 'Timer',
    icon: Timer,
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
  },
];

export default function ActionsModal() {
  const handleAction = (id: string) => {
    router.back();
    
    setTimeout(() => {
      if (id === 'timer') {
        router.push('/timer');
      } else {
        // Para las otras acciones, podrías navegar a otras pantallas
        console.log('Action:', id);
      }
    }, 100);
  };

  return (
    <Pressable 
      className="flex-1 justify-end"
      onPress={() => router.back()}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <Pressable onPress={(e) => e.stopPropagation()}>
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-montserrat-bold text-gray-900">
              Acción Rápida
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -mr-2 rounded-full bg-gray-100"
            >
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {/* Action Grid */}
          <View className="flex-row flex-wrap gap-4">
            {actionOptions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleAction(action.id)}
                className="w-[47%] bg-gray-50 p-4 rounded-2xl items-center gap-3"
                activeOpacity={0.7}
              >
                <View className={`w-12 h-12 ${action.bgColor} rounded-full items-center justify-center`}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text className="font-montserrat-semibold text-gray-900 text-sm">
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Open Gym Button */}
          <TouchableOpacity
            onPress={() => {
              router.back();
              console.log('Open Gym');
            }}
            className="mt-4 w-full bg-gray-900 py-4 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="font-montserrat-bold text-white">
              🏋️ Registrar Open Gym
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}
