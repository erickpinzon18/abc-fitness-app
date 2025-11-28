import { QuickBookCard } from '@/components/ui';
import { router } from 'expo-router';
import {
    Clock,
    Dumbbell,
    Flame,
    Plus,
    User,
    X
} from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos de ejemplo
const quickBookSlots = [
  { id: '1', time: '6:00 AM', title: 'CrossFit', spotsAvailable: 3, isFull: false },
  { id: '2', time: '7:00 AM', title: 'Funcional', spotsAvailable: 10, isFull: false },
  { id: '3', time: '8:00 AM', title: 'CrossFit', spotsAvailable: 0, isFull: true },
  { id: '4', time: '9:00 AM', title: 'Yoga', spotsAvailable: 5, isFull: false },
];

const wodExercises = [
  { id: 1, name: '400m Run' },
  { id: 2, name: '15 Pull-Ups' },
  { id: 3, name: '30 Push-Ups' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-avc-gray" edges={['top']}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text className="text-gray-500 text-sm font-montserrat-medium">Buenos días,</Text>
            <Text className="text-2xl font-montserrat-bold text-gray-900">
              Alex Fit <Text>🔥</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View className="relative">
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          {/* Card 1: Clases */}
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 font-montserrat-semibold uppercase tracking-wide">
                Este Mes
              </Text>
              <Text className="text-2xl font-montserrat-bold text-gray-900">
                12 <Text className="text-xs text-gray-400 font-montserrat">/ 20</Text>
              </Text>
            </View>
            <View className="w-[60px] h-[60px] rounded-full border-4 border-gray-100 items-center justify-center"
              style={{ borderLeftColor: '#dc2626', borderTopColor: '#dc2626', borderBottomColor: '#dc2626', transform: [{ rotate: '-45deg' }] }}
            >
              <Text className="font-montserrat-bold text-sm text-gray-900" style={{ transform: [{ rotate: '45deg' }] }}>60%</Text>
            </View>
          </View>

          {/* Card 2: Racha */}
          <View className="w-1/3 bg-red-50 rounded-2xl p-4 shadow-sm items-center justify-center border border-red-100">
            <Flame size={24} color="#dc2626" fill="#dc2626" />
            <Text className="text-lg font-montserrat-bold text-gray-900 mt-1">5 Días</Text>
            <Text className="text-[10px] text-avc-red font-montserrat-bold uppercase">Racha</Text>
          </View>
        </View>

        {/* Next Class */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-lg font-montserrat-bold text-gray-900">Tu Próxima Clase</Text>
            <View className="bg-green-100 px-2 py-1 rounded-md">
              <Text className="text-xs font-montserrat-semibold text-green-700">Confirmada</Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
            {/* Decorative blob */}
            <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full" />

            <View className="flex-row justify-between items-start relative z-10">
              <View className="flex-row gap-4">
                <View className="bg-gray-100 rounded-2xl w-16 h-16 items-center justify-center">
                  <Text className="text-xs font-montserrat-bold uppercase text-gray-800">Hoy</Text>
                  <Text className="text-xl font-montserrat-bold text-gray-800">18</Text>
                </View>
                <View>
                  <Text className="text-xl font-montserrat-bold text-gray-900">CrossFit WOD</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Clock size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm font-montserrat">5:00 PM - 6:00 PM</Text>
                  </View>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <User size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm font-montserrat">Coach Juan Pérez</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-5 pt-4 border-t border-gray-100 flex-row gap-3 relative z-10">
              <TouchableOpacity 
                className="flex-1 bg-avc-red py-3 rounded-xl items-center shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-white font-montserrat-bold text-sm">Hacer Check-in</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-12 h-12 items-center justify-center border border-gray-200 rounded-xl"
                activeOpacity={0.8}
              >
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* WOD del Día */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-montserrat-bold text-gray-900">WOD de Hoy</Text>
            <TouchableOpacity>
              <Text className="text-sm font-montserrat-bold text-avc-red">Ver Detalle</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-gray-900 rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <View className="relative z-10">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <View className="bg-white/20 px-2 py-1 rounded self-start mb-2">
                    <Text className="text-xs font-montserrat-bold text-white">AMRAP 20'</Text>
                  </View>
                  <Text className="text-2xl font-montserrat-bold text-white">"The Murph Prep"</Text>
                </View>
                <Dumbbell size={32} color="#6b7280" />
              </View>

              <View className="space-y-2">
                {wodExercises.map((exercise) => (
                  <View key={exercise.id} className="flex-row items-center gap-3">
                    <View className="w-6 h-6 rounded-full bg-avc-red items-center justify-center">
                      <Text className="text-[10px] font-montserrat-bold text-white">{exercise.id}</Text>
                    </View>
                    <Text className="text-gray-300 text-sm font-montserrat">{exercise.name}</Text>
                  </View>
                ))}
                <Text className="pl-9 text-xs text-gray-500 font-montserrat">+ 2 more exercises...</Text>
              </View>

              <View className="mt-4 pt-4 border-t border-gray-700 flex-row justify-between items-center">
                <Text className="text-xs text-gray-400 font-montserrat">Log Result</Text>
                <TouchableOpacity className="w-8 h-8 bg-white rounded-full items-center justify-center">
                  <Plus size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Book */}
        <View className="mb-6">
          <Text className="text-lg font-montserrat-bold text-gray-900 mb-3">Reservar para Mañana</Text>
          <FlatList
            data={quickBookSlots}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 16, paddingRight: 20 }}
            renderItem={({ item }) => (
              <QuickBookCard
                time={item.time}
                title={item.title}
                spotsAvailable={item.spotsAvailable}
                isFull={item.isFull}
                onPress={() => console.log('Reservar', item.title)}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
