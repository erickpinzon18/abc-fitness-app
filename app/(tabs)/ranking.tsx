import { RankingItem } from '@/components/ui';
import { ChevronDown, Crown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['Asistencia', 'WOD Scores', 'PRs'];

const podiumData = [
  { place: 2, name: 'Sofia', points: 24, avatar: 'https://i.pravatar.cc/150?img=32' },
  { place: 1, name: 'Carlos', points: 28, avatar: 'https://i.pravatar.cc/150?img=12' },
  { place: 3, name: 'Miguel', points: 22, avatar: 'https://i.pravatar.cc/150?img=59' },
];

const rankingList = [
  { rank: 4, name: 'Lucía Fernández', level: 'Intermedio', points: 20, avatarUrl: 'https://i.pravatar.cc/150?img=5' },
  { rank: 5, name: 'Roberto M.', level: 'RX', points: 19, avatarUrl: 'https://i.pravatar.cc/150?img=8' },
  { rank: 6, name: 'Andrea L.', level: 'Scaled', points: 18, avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { rank: 7, name: 'Jose Manuel', level: 'Scaled', points: 15, initials: 'JM' },
  { rank: 8, name: 'Laura G.', level: 'Intermedio', points: 14, avatarUrl: 'https://i.pravatar.cc/150?img=9' },
  { rank: 9, name: 'Diego H.', level: 'RX', points: 13, avatarUrl: 'https://i.pravatar.cc/150?img=7' },
];

export default function RankingScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Asistencia');

  const getPodiumBorderColor = (place: number) => {
    switch (place) {
      case 1:
        return '#FCD34D'; // Gold
      case 2:
        return '#E5E7EB'; // Silver
      case 3:
        return '#FDBA74'; // Bronze
      default:
        return '#ffffff';
    }
  };

  const getPodiumHeight = (place: number) => {
    switch (place) {
      case 1:
        return 140;
      case 2:
        return 100;
      case 3:
        return 80;
      default:
        return 80;
    }
  };

  const getBadgeColor = (place: number) => {
    switch (place) {
      case 1:
        return '#F59E0B'; // Gold
      case 2:
        return '#9CA3AF'; // Silver
      case 3:
        return '#D97706'; // Bronze
      default:
        return '#9CA3AF';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-avc-gray" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-montserrat-bold text-gray-900">Ranking</Text>
          <TouchableOpacity className="flex-row items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <Text className="text-xs font-montserrat-bold text-gray-700">Mensual</Text>
            <ChevronDown size={14} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Category Selector */}
        <View className="flex-row p-1 bg-gray-200 rounded-xl mb-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`flex-1 py-2 rounded-lg ${
                selectedCategory === category ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-xs font-montserrat-bold text-center ${
                  selectedCategory === category ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Podium */}
        <View className="flex-row items-end justify-center gap-3 mt-5 mb-8 px-5">
          {podiumData.map((user) => (
            <View key={user.place} className="items-center relative">
              {/* Crown for 1st place */}
              {user.place === 1 && (
                <Crown size={24} color="#F59E0B" className="absolute -top-8" style={{ marginBottom: 8 }} />
              )}
              
              {/* Avatar */}
              <Image
                source={{ uri: user.avatar }}
                className={`rounded-full border-[3px] mb-[-10px] z-10 ${
                  user.place === 1 ? 'w-20 h-20' : 'w-[60px] h-[60px]'
                }`}
                style={{ borderColor: getPodiumBorderColor(user.place) }}
              />
              
              {/* Rank Badge */}
              <View
                className="absolute z-20 w-6 h-6 rounded-full items-center justify-center border-2 border-white"
                style={{
                  backgroundColor: getBadgeColor(user.place),
                  bottom: user.place === 1 ? 130 : user.place === 2 ? 90 : 70,
                }}
              >
                <Text className="text-xs font-montserrat-bold text-white">{user.place}</Text>
              </View>

              {/* Podium Block */}
              <View
                className={`rounded-t-xl items-center pt-4 ${
                  user.place === 1 ? 'w-[100px] bg-yellow-50' : 'w-20 bg-gradient-to-b from-white to-gray-50'
                }`}
                style={{
                  height: getPodiumHeight(user.place),
                  backgroundColor: user.place === 1 ? '#FEF3C7' : '#f9fafb',
                }}
              >
                <Text className="font-montserrat-bold text-gray-900 text-sm">{user.name}</Text>
                {user.place === 1 ? (
                  <View className="bg-yellow-100 px-2 py-0.5 rounded-full mt-1">
                    <Text className="text-xs font-montserrat-bold text-yellow-600">{user.points} clases</Text>
                  </View>
                ) : (
                  <Text className="text-xs text-gray-500 font-montserrat-medium">{user.points} clases</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Ranking List */}
        <View className="px-5 space-y-3">
          {rankingList.map((user) => (
            <RankingItem
              key={user.rank}
              rank={user.rank}
              name={user.name}
              level={user.level}
              points={user.points}
              avatarUrl={user.avatarUrl}
              initials={user.initials}
            />
          ))}
        </View>
      </ScrollView>

      {/* My Position - Floating Footer */}
      <View className="absolute bottom-24 left-5 right-5 bg-gray-900 rounded-2xl p-4 flex-row items-center justify-between shadow-xl">
        <View className="flex-row items-center gap-3">
          <Text className="font-montserrat-bold text-white/80 w-6 text-center">12</Text>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            className="w-10 h-10 rounded-full border-2 border-avc-red"
          />
          <View>
            <Text className="font-montserrat-bold text-white text-sm">Tú (Alex)</Text>
            <Text className="text-[10px] text-gray-400 font-montserrat">¡Estás a 3 pts del Top 10!</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-montserrat-bold text-white text-lg">12</Text>
          <Text className="text-[10px] text-gray-400 font-montserrat -mt-1">Pts</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
