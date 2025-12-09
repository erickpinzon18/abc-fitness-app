import { ConfirmModal } from '@/components/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { getWODHoy, WOD } from '@/lib/classService';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Check,
    Clock,
    Dumbbell,
    Flame,
    Trophy
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ResultType = 'time' | 'rounds' | 'reps' | 'weight';

interface ResultInput {
  minutes?: string;
  seconds?: string;
  rounds?: string;
  reps?: string;
  weight?: string;
}

export default function RegistrarWODScreen() {
  const { user } = useAuth();
  const [wod, setWod] = useState<WOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resultType, setResultType] = useState<ResultType>('time');
  const [result, setResult] = useState<ResultInput>({});
  const [notes, setNotes] = useState('');
  const [rxLevel, setRxLevel] = useState<'rx' | 'scaled' | 'rx+'>('rx');
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  // Cargar WOD del día
  const cargarWOD = useCallback(async () => {
    try {
      const wodHoy = await getWODHoy();
      setWod(wodHoy);
      
      // Determinar tipo de resultado basado en modalidad
      if (wodHoy) {
        const modalidad = wodHoy.modalidad.toLowerCase();
        if (modalidad.includes('amrap')) {
          setResultType('rounds');
        } else if (modalidad.includes('emom') || modalidad.includes('time')) {
          setResultType('time');
        }
      }
    } catch (error) {
      console.error('Error cargando WOD:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarWOD();
  }, [cargarWOD]);

  // Formatear resultado para mostrar
  const getFormattedResult = (): string => {
    switch (resultType) {
      case 'time':
        const mins = result.minutes || '0';
        const secs = result.seconds || '00';
        return `${mins}:${secs.padStart(2, '0')}`;
      case 'rounds':
        return `${result.rounds || 0} rounds${result.reps ? ` + ${result.reps} reps` : ''}`;
      case 'reps':
        return `${result.reps || 0} reps`;
      case 'weight':
        return `${result.weight || 0} lbs`;
      default:
        return '';
    }
  };

  // Guardar resultado
  const handleSave = async () => {
    if (!wod || !user?.uid) return;
    
    setSaving(true);
    
    try {
      // TODO: Guardar en Firebase
      // await guardarResultadoWOD(wod.id, user.uid, {
      //   resultType,
      //   result,
      //   rxLevel,
      //   notes,
      // });
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModalType('success');
      setModalMessage(`¡Resultado registrado!\n${getFormattedResult()} (${rxLevel.toUpperCase()})`);
      setModalVisible(true);
    } catch (error) {
      setModalType('error');
      setModalMessage('No se pudo guardar el resultado');
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="text-white font-montserrat-medium mt-4">Cargando WOD...</Text>
      </SafeAreaView>
    );
  }

  if (!wod) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-montserrat-bold text-white ml-2">Registrar WOD</Text>
        </View>
        
        <View className="flex-1 items-center justify-center px-8">
          <Dumbbell size={64} color="#4b5563" />
          <Text className="text-xl font-montserrat-bold text-white mt-4 text-center">
            No hay WOD programado
          </Text>
          <Text className="text-gray-400 font-montserrat text-center mt-2">
            No hay un WOD programado para hoy. Vuelve más tarde o contacta a tu coach.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-avc-red px-8 py-4 rounded-xl"
          >
            <Text className="text-white font-montserrat-bold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-xl font-montserrat-bold text-white ml-2">Registrar WOD</Text>
          </View>
          <View className="bg-avc-red/20 px-3 py-1 rounded-full">
            <Text className="text-avc-red font-montserrat-bold text-xs">HOY</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* WOD Info Card */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-6">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <View className="bg-white/10 px-2 py-1 rounded self-start mb-2">
                  <Text className="text-xs font-montserrat-bold text-white">
                    {wod.modalidad.toUpperCase()}{wod.timeCap ? ` ${wod.timeCap}'` : ''}
                  </Text>
                </View>
                <Text className="text-2xl font-montserrat-bold text-white">"{wod.titulo}"</Text>
              </View>
              <Dumbbell size={28} color="#6b7280" />
            </View>

            {/* Ejercicios */}
            <View className="space-y-2">
              {wod.ejercicios.map((ejercicio, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <View className="w-6 h-6 rounded-full bg-avc-red items-center justify-center">
                    <Text className="text-[10px] font-montserrat-bold text-white">{index + 1}</Text>
                  </View>
                  <Text className="text-gray-300 text-sm font-montserrat">
                    {ejercicio.cantidad} {ejercicio.nombre}
                  </Text>
                </View>
              ))}
            </View>

            {wod.notas && (
              <View className="mt-3 bg-white/5 rounded-lg p-3">
                <Text className="text-xs text-gray-400 font-montserrat">{wod.notas}</Text>
              </View>
            )}
          </View>

          {/* Nivel RX */}
          <Text className="text-white font-montserrat-bold text-lg mb-3">Nivel</Text>
          <View className="flex-row gap-3 mb-6">
            {(['scaled', 'rx', 'rx+'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setRxLevel(level)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  rxLevel === level ? 'bg-avc-red' : 'bg-gray-800'
                }`}
              >
                <Text className={`font-montserrat-bold ${
                  rxLevel === level ? 'text-white' : 'text-gray-400'
                }`}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tipo de Resultado */}
          <Text className="text-white font-montserrat-bold text-lg mb-3">Tu Resultado</Text>
          <View className="flex-row gap-2 mb-4">
            {[
              { type: 'time' as ResultType, label: 'Tiempo', icon: Clock },
              { type: 'rounds' as ResultType, label: 'Rounds', icon: Trophy },
              { type: 'reps' as ResultType, label: 'Reps', icon: Flame },
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                onPress={() => setResultType(item.type)}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                  resultType === item.type ? 'bg-gray-700 border border-avc-red' : 'bg-gray-800'
                }`}
              >
                <item.icon size={16} color={resultType === item.type ? '#dc2626' : '#9ca3af'} />
                <Text className={`font-montserrat-semibold text-xs ${
                  resultType === item.type ? 'text-white' : 'text-gray-400'
                }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input de Resultado */}
          <View className="bg-gray-800 rounded-2xl p-5 mb-6">
            {resultType === 'time' && (
              <View className="flex-row items-center justify-center gap-4">
                <View className="items-center">
                  <TextInput
                    value={result.minutes}
                    onChangeText={(text) => setResult({ ...result, minutes: text.replace(/[^0-9]/g, '') })}
                    placeholder="00"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="text-5xl font-montserrat-bold text-white text-center w-24"
                  />
                  <Text className="text-gray-500 font-montserrat text-xs mt-1">MIN</Text>
                </View>
                <Text className="text-4xl font-montserrat-bold text-gray-500">:</Text>
                <View className="items-center">
                  <TextInput
                    value={result.seconds}
                    onChangeText={(text) => setResult({ ...result, seconds: text.replace(/[^0-9]/g, '').slice(0, 2) })}
                    placeholder="00"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="text-5xl font-montserrat-bold text-white text-center w-24"
                  />
                  <Text className="text-gray-500 font-montserrat text-xs mt-1">SEG</Text>
                </View>
              </View>
            )}

            {resultType === 'rounds' && (
              <View className="flex-row items-center justify-center gap-6">
                <View className="items-center">
                  <TextInput
                    value={result.rounds}
                    onChangeText={(text) => setResult({ ...result, rounds: text.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={3}
                    className="text-5xl font-montserrat-bold text-white text-center w-24"
                  />
                  <Text className="text-gray-500 font-montserrat text-xs mt-1">ROUNDS</Text>
                </View>
                <Text className="text-2xl font-montserrat-bold text-gray-500">+</Text>
                <View className="items-center">
                  <TextInput
                    value={result.reps}
                    onChangeText={(text) => setResult({ ...result, reps: text.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    keyboardType="number-pad"
                    maxLength={3}
                    className="text-4xl font-montserrat-bold text-white text-center w-20"
                  />
                  <Text className="text-gray-500 font-montserrat text-xs mt-1">REPS</Text>
                </View>
              </View>
            )}

            {resultType === 'reps' && (
              <View className="items-center">
                <TextInput
                  value={result.reps}
                  onChangeText={(text) => setResult({ ...result, reps: text.replace(/[^0-9]/g, '') })}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  maxLength={4}
                  className="text-6xl font-montserrat-bold text-white text-center w-40"
                />
                <Text className="text-gray-500 font-montserrat text-xs mt-1">TOTAL REPS</Text>
              </View>
            )}
          </View>

          {/* Notas */}
          <Text className="text-white font-montserrat-bold text-lg mb-3">Notas (opcional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="¿Cómo te sentiste? ¿Modificaste algo?"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={3}
            className="bg-gray-800 rounded-2xl p-4 text-white font-montserrat text-sm mb-8"
            style={{ textAlignVertical: 'top', minHeight: 100 }}
          />
        </ScrollView>

        {/* Botón Guardar */}
        <View className="px-5 pb-8 pt-4 bg-gray-900">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`bg-avc-red py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              saving ? 'opacity-70' : ''
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Check size={20} color="#ffffff" />
                <Text className="text-white font-montserrat-bold text-lg">Guardar Resultado</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal */}
      <ConfirmModal
        visible={modalVisible}
        type={modalType}
        title={modalType === 'success' ? '¡Excelente! 🏆' : 'Error'}
        message={modalMessage}
        onCancel={handleModalClose}
      />
    </SafeAreaView>
  );
}
