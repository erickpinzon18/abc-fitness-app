import { Bell, Plus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickBookCardProps {
  time: string;
  title: string;
  spotsAvailable: number;
  isFull: boolean;
  onPress: () => void;
}

export default function QuickBookCard({
  time,
  title,
  spotsAvailable,
  isFull,
  onPress,
}: QuickBookCardProps) {
  return (
    <View className="min-w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-transparent flex flex-col gap-2">
      <Text className="text-xs font-montserrat-bold text-gray-400">{time}</Text>
      <Text className="font-montserrat-bold text-gray-900">{title}</Text>
      <View className="mt-auto pt-2 flex-row justify-between items-center">
        {isFull ? (
          <View className="bg-gray-100 px-1.5 py-0.5 rounded">
            <Text className="text-[10px] font-montserrat text-gray-500">Lleno</Text>
          </View>
        ) : (
          <View className="bg-red-50 px-1.5 py-0.5 rounded">
            <Text className="text-[10px] font-montserrat text-avc-red">{spotsAvailable} libres</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onPress}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isFull ? 'bg-gray-200' : 'bg-gray-900'
          }`}
          disabled={isFull}
        >
          {isFull ? (
            <Bell size={16} color="#9ca3af" />
          ) : (
            <Plus size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
