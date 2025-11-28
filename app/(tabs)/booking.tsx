import { ClassCard } from '@/components/ui';
import { CalendarDays } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos de ejemplo
const calendarDays = [
  { id: '1', day: 'LUN', date: 23 },
  { id: '2', day: 'MAR', date: 24 },
  { id: '3', day: 'MIE', date: 25 },
  { id: '4', day: 'JUE', date: 26 },
  { id: '5', day: 'VIE', date: 27 },
  { id: '6', day: 'SAB', date: 28 },
  { id: '7', day: 'DOM', date: 29 },
];

const filterOptions = ['Todo', 'CrossFit', 'Funcional', 'Cycling', 'Zumba', 'Yoga'];

const classesData = [
  {
    id: '1',
    time: '6:00',
    period: 'AM' as const,
    title: 'CrossFit',
    coach: 'Juan Pérez',
    duration: '60 min',
    spotsAvailable: 8,
    totalSpots: 20,
    status: 'available' as const,
  },
  {
    id: '2',
    time: '7:00',
    period: 'AM' as const,
    title: 'Entrenamiento Funcional',
    coach: 'Pedro Gomez',
    duration: '45 min',
    spotsAvailable: 3,
    totalSpots: 15,
    status: 'few-spots' as const,
  },
  {
    id: '3',
    time: '8:00',
    period: 'AM' as const,
    title: 'CrossFit',
    coach: 'María López',
    duration: '60 min',
    spotsAvailable: 0,
    totalSpots: 20,
    status: 'full' as const,
  },
  {
    id: '4',
    time: '5:00',
    period: 'PM' as const,
    title: 'CrossFit WOD',
    coach: 'Juan Pérez',
    duration: '60 min',
    spotsAvailable: 12,
    totalSpots: 20,
    status: 'reserved' as const,
  },
  {
    id: '5',
    time: '6:00',
    period: 'PM' as const,
    title: 'Yoga',
    coach: 'Ana Torres',
    duration: '50 min',
    spotsAvailable: 10,
    totalSpots: 15,
    status: 'available' as const,
  },
];

export default function BookingScreen() {
  const [selectedDay, setSelectedDay] = useState('2');
  const [selectedFilter, setSelectedFilter] = useState('Todo');

  return (
    <SafeAreaView className="flex-1 bg-avc-gray" edges={['top']}>
      {/* Header + Calendar (Sticky) */}
      <View className="bg-avc-gray pb-2 shadow-sm">
        {/* Title */}
        <View className="px-5 pt-2 pb-4 flex-row justify-between items-center">
          <Text className="text-2xl font-montserrat-bold text-gray-900">Reservar Clase</Text>
          <TouchableOpacity className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
            <CalendarDays size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Calendar */}
        <FlatList
          data={calendarDays}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDay(item.id)}
              className={`w-[50px] h-[70px] rounded-2xl items-center justify-center ${
                selectedDay === item.id
                  ? 'bg-avc-red shadow-lg'
                  : 'bg-white border border-gray-100'
              }`}
              style={
                selectedDay === item.id
                  ? { shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }
                  : {}
              }
            >
              <Text
                className={`text-xs font-montserrat-semibold ${
                  selectedDay === item.id ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.day}
              </Text>
              <Text
                className={`text-lg font-montserrat-bold ${
                  selectedDay === item.id ? 'text-white' : 'text-gray-900'
                }`}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full border ${
                selectedFilter === filter
                  ? 'bg-gray-900 border-gray-900'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-montserrat-semibold ${
                  selectedFilter === filter ? 'text-white' : 'text-gray-600'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Classes List */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
      >
        {classesData.map((classItem) => (
          <ClassCard
            key={classItem.id}
            time={classItem.time}
            period={classItem.period}
            title={classItem.title}
            coach={classItem.coach}
            duration={classItem.duration}
            spotsAvailable={classItem.spotsAvailable}
            totalSpots={classItem.totalSpots}
            status={classItem.status}
            onReserve={() => console.log('Reservar', classItem.title)}
            onCancel={() => console.log('Cancelar', classItem.title)}
            onWaitlist={() => console.log('Lista de espera', classItem.title)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
