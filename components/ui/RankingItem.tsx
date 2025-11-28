import React from 'react';
import { Image, Text, View } from 'react-native';

interface RankingItemProps {
  rank: number;
  name: string;
  level: string;
  points: number;
  avatarUrl?: string;
  initials?: string;
  isCurrentUser?: boolean;
}

export default function RankingItem({
  rank,
  name,
  level,
  points,
  avatarUrl,
  initials,
  isCurrentUser = false,
}: RankingItemProps) {
  return (
    <View
      className={`flex-row items-center p-3 rounded-2xl ${
        isCurrentUser ? 'bg-gray-900' : 'bg-white'
      } shadow-sm`}
    >
      <Text
        className={`font-montserrat-bold w-8 text-center ${
          isCurrentUser ? 'text-white/80' : 'text-gray-400'
        }`}
      >
        {rank}
      </Text>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className={`w-10 h-10 rounded-full mr-3 ${
            isCurrentUser ? 'border-2 border-avc-red' : ''
          }`}
        />
      ) : (
        <View
          className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
            isCurrentUser ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`font-montserrat-bold text-xs ${
              isCurrentUser ? 'text-white' : 'text-gray-500'
            }`}
          >
            {initials}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text
          className={`font-montserrat-bold text-sm ${
            isCurrentUser ? 'text-white' : 'text-gray-900'
          }`}
        >
          {name}
        </Text>
        <Text className="text-xs text-gray-400 font-montserrat">Nivel: {level}</Text>
      </View>
      <View className="text-right items-end">
        <Text
          className={`font-montserrat-bold ${isCurrentUser ? 'text-white text-lg' : 'text-gray-900'}`}
        >
          {points}
        </Text>
        <Text className="text-[10px] text-gray-400 font-montserrat">Pts</Text>
      </View>
    </View>
  );
}
