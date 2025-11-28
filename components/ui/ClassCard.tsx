import { Clock, User, X } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ClassCardProps {
  time: string;
  period: 'AM' | 'PM';
  title: string;
  coach: string;
  duration: string;
  spotsAvailable: number;
  totalSpots: number;
  status: 'available' | 'few-spots' | 'full' | 'reserved';
  onReserve?: () => void;
  onCancel?: () => void;
  onWaitlist?: () => void;
}

export default function ClassCard({
  time,
  period,
  title,
  coach,
  duration,
  spotsAvailable,
  totalSpots,
  status,
  onReserve,
  onCancel,
  onWaitlist,
}: ClassCardProps) {
  const progressPercent = ((totalSpots - spotsAvailable) / totalSpots) * 100;

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return (
          <View className="bg-green-50 px-2 py-1 rounded-md">
            <Text className="text-xs font-montserrat-bold text-green-600">Disponible</Text>
          </View>
        );
      case 'few-spots':
        return (
          <View className="bg-orange-50 px-2 py-1 rounded-md">
            <Text className="text-xs font-montserrat-bold text-orange-600">¡Últimos lugares!</Text>
          </View>
        );
      case 'full':
        return (
          <View className="bg-gray-100 px-2 py-1 rounded-md">
            <Text className="text-xs font-montserrat-bold text-gray-500">Lleno</Text>
          </View>
        );
      case 'reserved':
        return (
          <View className="bg-green-100 px-2 py-1 rounded-md">
            <Text className="text-xs font-montserrat-bold text-green-700">Reservada</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'available':
      case 'few-spots':
        return (
          <TouchableOpacity
            onPress={onReserve}
            className="w-full py-2.5 bg-avc-red rounded-xl items-center justify-center mt-1"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-montserrat-bold">Reservar</Text>
          </TouchableOpacity>
        );
      case 'full':
        return (
          <TouchableOpacity
            onPress={onWaitlist}
            className="w-full py-2.5 bg-gray-100 rounded-xl items-center justify-center mt-1"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600 text-sm font-montserrat-bold">Lista de espera</Text>
          </TouchableOpacity>
        );
      case 'reserved':
        return (
          <TouchableOpacity
            onPress={onCancel}
            className="w-full py-2.5 bg-white border border-red-100 rounded-xl items-center justify-center flex-row gap-2 mt-1"
            activeOpacity={0.8}
          >
            <X size={16} color="#dc2626" />
            <Text className="text-avc-red text-sm font-montserrat-bold">Cancelar</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-row gap-3">
          {/* Time */}
          <View className="items-center justify-center border-r border-gray-100 pr-3 min-w-[60px]">
            <Text className="text-lg font-montserrat-bold text-gray-900">{time}</Text>
            <Text className="text-xs font-montserrat-medium text-gray-400 uppercase">{period}</Text>
          </View>
          {/* Info */}
          <View>
            <Text className="text-lg font-montserrat-bold text-gray-900">{title}</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <User size={12} color="#6b7280" />
              <Text className="text-xs text-gray-500 font-montserrat">{coach}</Text>
            </View>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Clock size={12} color="#6b7280" />
              <Text className="text-xs text-gray-500 font-montserrat">{duration}</Text>
            </View>
          </View>
        </View>
        {getStatusBadge()}
      </View>

      {/* Progress Bar */}
      <View className="mt-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-400 font-montserrat-medium">Cupo</Text>
          <Text className="text-xs text-gray-900 font-montserrat-bold">
            {totalSpots - spotsAvailable}/{totalSpots}
          </Text>
        </View>
        <View className="w-full bg-gray-100 rounded-full h-1.5">
          <View
            className={`h-1.5 rounded-full ${status === 'full' ? 'bg-gray-400' : 'bg-avc-red'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      {getActionButton()}
    </View>
  );
}
