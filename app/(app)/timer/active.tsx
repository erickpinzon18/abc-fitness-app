import { router, useLocalSearchParams } from 'expo-router';
import { Pause, Play, RotateCcw, Settings2, SkipForward, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIMER_CONFIGS: { [key: string]: { name: string; workTime: number; restTime: number; rounds: number } } = {
  clock: { name: 'CLOCK', workTime: 0, restTime: 0, rounds: 1 },
  tabata: { name: 'TABATA', workTime: 20, restTime: 10, rounds: 8 },
  amrap: { name: 'AMRAP', workTime: 1200, restTime: 0, rounds: 1 }, // 20 min
  emom: { name: 'EMOM', workTime: 60, restTime: 0, rounds: 10 },
  fortime: { name: 'FOR TIME', workTime: 900, restTime: 0, rounds: 1 }, // 15 min cap
};

export default function ActiveTimerScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const config = TIMER_CONFIGS[type || 'tabata'] || TIMER_CONFIGS.tabata;

  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const [timeLeft, setTimeLeft] = useState(config.workTime);
  const [totalTime, setTotalTime] = useState(0);

  // For stopwatch mode (clock)
  const isStopwatch = type === 'clock';

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (isStopwatch) {
          // Stopwatch counts up
          setTotalTime((prev) => prev + 1);
        } else {
          // Timer counts down
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Time's up for this phase
              if (phase === 'work' && config.restTime > 0) {
                setPhase('rest');
                return config.restTime;
              } else {
                // Move to next round
                if (currentRound < config.rounds) {
                  setCurrentRound((r) => r + 1);
                  setPhase('work');
                  return config.workTime;
                } else {
                  // Workout complete
                  setIsRunning(false);
                  return 0;
                }
              }
            }
            return prev - 1;
          });
          setTotalTime((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, phase, currentRound, config, isStopwatch]);

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setPhase('work');
    setTimeLeft(config.workTime);
    setTotalTime(0);
  };

  const handleSkip = () => {
    if (phase === 'work' && config.restTime > 0) {
      setPhase('rest');
      setTimeLeft(config.restTime);
    } else if (currentRound < config.rounds) {
      setCurrentRound((r) => r + 1);
      setPhase('work');
      setTimeLeft(config.workTime);
    }
  };

  const getNextPhaseText = () => {
    if (phase === 'work' && config.restTime > 0) {
      return `Rest (${config.restTime}s)`;
    } else if (currentRound < config.rounds) {
      return `Round ${currentRound + 1}`;
    }
    return 'Fin del WOD';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="px-6 pt-4 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full bg-gray-100"
        >
          <X size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="font-montserrat-bold text-gray-500 tracking-widest text-sm">
          {config.name}
        </Text>
        <TouchableOpacity className="p-2 -mr-2 rounded-full">
          <Settings2 size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Main Timer Area */}
      <View className="flex-1 items-center justify-center relative">
        {/* Progress Circle Background */}
        <View className="absolute w-72 h-72 rounded-full border-[12px] border-gray-100" />

        {/* Timer Content */}
        <View className="items-center z-10">
          {!isStopwatch && (
            <View
              className={`px-3 py-1 rounded-full mb-4 ${
                phase === 'work' ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              <Text
                className={`text-sm font-montserrat-bold uppercase tracking-wide ${
                  phase === 'work' ? 'text-avc-red' : 'text-green-600'
                }`}
              >
                {phase === 'work' ? 'Work' : 'Rest'}
              </Text>
            </View>
          )}

          <Text
            className="text-[80px] font-roboto-mono-bold text-gray-900 leading-none tracking-tighter"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatTime(isStopwatch ? totalTime : timeLeft)}
          </Text>

          {!isStopwatch && (
            <View className="mt-4 flex-row items-center justify-center gap-8">
              <View className="items-center">
                <Text className="text-xs font-montserrat-bold uppercase tracking-wider text-gray-400 mb-1">
                  Round
                </Text>
                <Text className="text-2xl font-roboto-mono-bold text-gray-800">
                  {currentRound}
                  <Text className="text-sm text-gray-400">/{config.rounds}</Text>
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs font-montserrat-bold uppercase tracking-wider text-gray-400 mb-1">
                  Total
                </Text>
                <Text className="text-2xl font-roboto-mono-bold text-gray-800">
                  {formatTime(totalTime)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="px-8 pb-12">
        {/* Next Phase Info */}
        {!isStopwatch && (
          <View className="bg-gray-50 rounded-xl p-4 mb-8 flex-row items-center justify-between border border-gray-100">
            <Text className="text-xs text-gray-500 font-montserrat-bold uppercase">Siguiente</Text>
            <Text className="text-sm font-montserrat-bold text-gray-900">{getNextPhaseText()}</Text>
          </View>
        )}

        {/* Control Buttons */}
        <View className="flex-row items-center justify-center gap-6">
          <TouchableOpacity
            onPress={handleReset}
            className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <RotateCcw size={28} color="#4b5563" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsRunning(!isRunning)}
            className="w-24 h-24 rounded-full bg-avc-red items-center justify-center shadow-xl"
            style={{
              shadowColor: '#dc2626',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
            activeOpacity={0.8}
          >
            {isRunning ? (
              <Pause size={40} color="#ffffff" fill="#ffffff" />
            ) : (
              <Play size={40} color="#ffffff" fill="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <SkipForward size={28} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
