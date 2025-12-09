import { ConfirmModal, ModalType } from '@/components/ConfirmModal';
import { StreakAnimation } from '@/components/StreakAnimation';
import { QuickBookCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  cancelarReservacion,
  Clase,
  crearReservacion,
  formatTime,
  getClasesPorFecha,
  getProximaClaseUsuario,
  getWODHoy,
  hacerCheckIn,
  UserReservation,
  WOD
} from '@/lib/classService';
import { getDiasEntrenamientoMes, verificarRachaAlIniciar } from '@/lib/streakService';
import { router } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import {
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  MapPin,
  Play,
  Plus,
  Timer,
  User,
  X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper para obtener el saludo según la hora
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

// Helper para formatear fecha de la próxima clase
const formatNextClassDate = (fecha: Date | Timestamp): { label: string; day: string } => {
  // Convertir Timestamp a Date si es necesario
  const fechaDate = fecha instanceof Timestamp ? fecha.toDate() : fecha;
  
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  
  // Normalizar las fechas para comparar solo día/mes/año
  const fechaNorm = new Date(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate());
  const hoyNorm = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const mananaNorm = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate());
  
  if (fechaNorm.getTime() === hoyNorm.getTime()) {
    return { label: 'Hoy', day: fechaDate.getDate().toString() };
  } else if (fechaNorm.getTime() === mananaNorm.getTime()) {
    return { label: 'Mañana', day: fechaDate.getDate().toString() };
  } else {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return { label: dias[fechaDate.getDay()], day: fechaDate.getDate().toString() };
  }
};

// Tipo para el estado de la clase
type ClassTimeStatus = {
  status: 'upcoming' | 'soon' | 'live' | 'ended';
  label: string;
  timeLeft?: string;
  canCheckIn: boolean;
  color: string;
  bgColor: string;
};

// Helper para calcular el estado temporal de la clase
const getClassTimeStatus = (fecha: Date | Timestamp, horaInicio: string, horaFin: string): ClassTimeStatus => {
  const fechaDate = fecha instanceof Timestamp ? fecha.toDate() : fecha;
  const ahora = new Date();
  
  // Crear fecha/hora de inicio y fin de la clase
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaEnd, minEnd] = horaFin.split(':').map(Number);
  
  const inicioClase = new Date(fechaDate);
  inicioClase.setHours(horaIni, minIni, 0, 0);
  
  const finClase = new Date(fechaDate);
  finClase.setHours(horaEnd, minEnd, 0, 0);
  
  const diffMs = inicioClase.getTime() - ahora.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Ya terminó la clase
  if (ahora > finClase) {
    return {
      status: 'ended',
      label: '¡Asististe! 🎉',
      canCheckIn: false,
      color: '#16a34a',
      bgColor: '#dcfce7',
    };
  }
  
  // La clase está en curso
  if (ahora >= inicioClase && ahora <= finClase) {
    const minsRestantes = Math.floor((finClase.getTime() - ahora.getTime()) / (1000 * 60));
    return {
      status: 'live',
      label: '🔴 EN VIVO',
      timeLeft: `${minsRestantes} min restantes`,
      canCheckIn: true,
      color: '#dc2626',
      bgColor: '#fee2e2',
    };
  }
  
  // Falta poco (menos de 30 minutos)
  if (diffMins > 0 && diffMins <= 30) {
    return {
      status: 'soon',
      label: '¡Ya casi!',
      timeLeft: `en ${diffMins} min`,
      canCheckIn: true,
      color: '#d97706',
      bgColor: '#fef3c7',
    };
  }
  
  // Falta poco (menos de 2 horas)
  if (diffMins > 30 && diffMins <= 120) {
    return {
      status: 'upcoming',
      label: 'Próximamente',
      timeLeft: `en ${diffHours > 0 ? `${diffHours}h ${diffMins % 60}m` : `${diffMins} min`}`,
      canCheckIn: false,
      color: '#6b7280',
      bgColor: '#f3f4f6',
    };
  }
  
  // Falta más tiempo
  if (diffDays > 0) {
    return {
      status: 'upcoming',
      label: 'Próximamente',
      timeLeft: diffDays === 1 ? 'mañana' : `en ${diffDays} días`,
      canCheckIn: false,
      color: '#6b7280',
      bgColor: '#f3f4f6',
    };
  }
  
  // Falta varias horas
  return {
    status: 'upcoming',
    label: 'Próximamente',
    timeLeft: `en ${diffHours}h ${diffMins % 60}m`,
    canCheckIn: false,
    color: '#6b7280',
    bgColor: '#f3f4f6',
  };
};

export default function DashboardScreen() {
  const { userData, user, refreshUserData, initializing } = useAuth();
  const [proximaClase, setProximaClase] = useState<(UserReservation & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diasEntrenamiento, setDiasEntrenamiento] = useState(0);
  const [streak, setStreak] = useState(userData?.streak || 0);
  const [streakAnimating, setStreakAnimating] = useState(false);
  const [clasesMañana, setClasesMañana] = useState<Clase[]>([]);
  const [loadingMañana, setLoadingMañana] = useState(true);
  const [wodHoy, setWodHoy] = useState<WOD | null>(null);
  
  // Estado del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('checkin');
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estado para reservar clase de mañana
  const [selectedClaseReservar, setSelectedClaseReservar] = useState<Clase | null>(null);
  
  // Estado del tiempo (se actualiza cada minuto)
  const [timeStatus, setTimeStatus] = useState<ClassTimeStatus | null>(null);
  
  // Obtener el primer nombre
  const firstName = userData?.displayName?.split(' ')[0] || 'Atleta';

  // Cargar clases de mañana
  const cargarClasesMañana = useCallback(async () => {
    try {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      mañana.setHours(0, 0, 0, 0);
      
      const clases = await getClasesPorFecha(mañana);
      setClasesMañana(clases);
    } catch (error) {
      console.error('Error cargando clases de mañana:', error);
    } finally {
      setLoadingMañana(false);
    }
  }, []);

  // Cargar WOD del día
  const cargarWOD = useCallback(async () => {
    try {
      const wod = await getWODHoy();
      setWodHoy(wod);
    } catch (error) {
      console.error('Error cargando WOD:', error);
    }
  }, []);

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      // Verificar racha al iniciar (puede resetearla si perdió días)
      const streakData = await verificarRachaAlIniciar(user.uid);
      setStreak(streakData.currentStreak);
      
      // Obtener días de entrenamiento del mes
      const dias = await getDiasEntrenamientoMes(user.uid);
      setDiasEntrenamiento(dias);
      
      // Obtener próxima clase
      const clase = await getProximaClaseUsuario(user.uid);
      setProximaClase(clase);
      
      // Cargar clases de mañana y WOD
      await Promise.all([cargarClasesMañana(), cargarWOD()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, cargarClasesMañana, cargarWOD]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Actualizar streak cuando cambie userData
  useEffect(() => {
    if (userData?.streak !== undefined) {
      setStreak(userData.streak);
    }
  }, [userData?.streak]);

  // Actualizar estado del tiempo cada 30 segundos
  useEffect(() => {
    if (!proximaClase) {
      setTimeStatus(null);
      return;
    }
    
    const updateTimeStatus = () => {
      const status = getClassTimeStatus(proximaClase.fecha, proximaClase.horaInicio, proximaClase.horaFin);
      setTimeStatus(status);
    };
    
    updateTimeStatus();
    const interval = setInterval(updateTimeStatus, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, [proximaClase]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, [cargarDatos]);

  // Mostrar modal de check-in
  const showCheckInModal = () => {
    setModalType('checkin');
    setModalTitle('¡Ya llegué! 🏋️');
    setModalMessage('Confirma tu asistencia para registrar tu entrenamiento');
    setModalVisible(true);
  };

  // Mostrar modal de cancelar
  const showCancelModal = () => {
    setModalType('cancel');
    setModalTitle('Cancelar Reservación');
    setModalMessage('Esta acción no se puede deshacer');
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setModalLoading(false);
  };

  // Confirmar acción del modal
  const handleModalConfirm = async () => {
    if (!proximaClase || !user?.uid) return;
    
    setModalLoading(true);
    
    try {
      if (modalType === 'checkin') {
        const result = await hacerCheckIn(proximaClase.claseId, user.uid);
        if (result.success) {
          closeModal();
          // Actualizar la racha local y activar animación
          if (result.newStreak !== undefined) {
            setStreak(result.newStreak);
            // Activar animación de racha si aumentó
            setStreakAnimating(true);
          }
          // Actualizar días de entrenamiento
          const dias = await getDiasEntrenamientoMes(user.uid);
          setDiasEntrenamiento(dias);
          
          setModalType('success');
          setModalTitle('¡Listo! 💪');
          setModalMessage(result.streakMessage || '¡Check-in realizado! A entrenar duro');
          setModalVisible(true);
          
          // Recargar datos
          const clase = await getProximaClaseUsuario(user.uid);
          setProximaClase(clase);
          
          // Refrescar userData para actualizar streak en todo lado
          if (refreshUserData) {
            refreshUserData();
          }
        } else {
          closeModal();
          setModalType('error');
          setModalTitle('Error');
          setModalMessage(result.error || 'No se pudo hacer check-in');
          setModalVisible(true);
        }
      } else if (modalType === 'cancel') {
        const result = await cancelarReservacion(proximaClase.claseId, user.uid);
        if (result.success) {
          closeModal();
          setModalType('success');
          setModalTitle('Cancelado');
          setModalMessage('Tu reservación ha sido cancelada');
          setModalVisible(true);
          
          // Recargar próxima clase
          const clase = await getProximaClaseUsuario(user.uid);
          setProximaClase(clase);
        } else {
          closeModal();
          setModalType('error');
          setModalTitle('Error');
          setModalMessage(result.error || 'No se pudo cancelar');
          setModalVisible(true);
        }
      }
    } catch (error) {
      closeModal();
      setModalType('error');
      setModalTitle('Error');
      setModalMessage('Ocurrió un error. Intenta de nuevo.');
      setModalVisible(true);
    }
  };

  // Mostrar modal para reservar clase de mañana
  const showReservarModal = (clase: Clase) => {
    setSelectedClaseReservar(clase);
    setModalType('reserve');
    setModalTitle('Reservar Clase');
    setModalMessage('¿Deseas reservar esta clase para mañana?');
    setModalVisible(true);
  };

  // Confirmar reservación de clase de mañana
  const handleReservarConfirm = async () => {
    if (!selectedClaseReservar || !user?.uid || !userData) return;
    
    setModalLoading(true);
    
    try {
      const result = await crearReservacion(
        selectedClaseReservar.id,
        user.uid,
        userData.displayName || 'Usuario',
        user.email || ''
      );
      
      if (result.success) {
        closeModal();
        setModalType('success');
        setModalTitle('¡Reservado! 🎉');
        setModalMessage(`Tu clase de ${selectedClaseReservar.clase} está confirmada para mañana`);
        setModalVisible(true);
        
        // Recargar clases de mañana y próxima clase
        await cargarClasesMañana();
        const clase = await getProximaClaseUsuario(user.uid);
        setProximaClase(clase);
        
        setSelectedClaseReservar(null);
      } else {
        closeModal();
        setModalType('error');
        setModalTitle('Error');
        setModalMessage(result.error || 'No se pudo reservar la clase');
        setModalVisible(true);
      }
    } catch (error) {
      closeModal();
      setModalType('error');
      setModalTitle('Error');
      setModalMessage('Ocurrió un error. Intenta de nuevo.');
      setModalVisible(true);
    }
  };

  // Manejar confirmación del modal según el tipo
  const handleConfirm = () => {
    if (modalType === 'reserve') {
      handleReservarConfirm();
    } else {
      handleModalConfirm();
    }
  };

  // Formatear la fecha de la próxima clase
  const fechaInfo = proximaClase ? formatNextClassDate(proximaClase.fecha) : null;
  
  // Mostrar loading mientras Firebase inicializa o no hay usuario
  if (initializing || !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-avc-gray" edges={['top']}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#dc2626"
            colors={['#dc2626']}
          />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text className="text-gray-500 text-sm font-montserrat-medium">{getGreeting()},</Text>
            <Text className="text-2xl font-montserrat-bold text-gray-900">
              {firstName} <Text>🔥</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
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
          {/* Card 1: Clases este mes */}
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 font-montserrat-semibold uppercase tracking-wide">
                Este Mes
              </Text>
              <Text className="text-2xl font-montserrat-bold text-gray-900">
                {diasEntrenamiento} <Text className="text-xs text-gray-400 font-montserrat">días</Text>
              </Text>
            </View>
            <View className="w-[60px] h-[60px] rounded-full border-4 border-gray-100 items-center justify-center"
              style={{ borderLeftColor: '#dc2626', borderTopColor: '#dc2626', borderBottomColor: diasEntrenamiento >= 10 ? '#dc2626' : '#e5e7eb', transform: [{ rotate: '-45deg' }] }}
            >
              <Text className="font-montserrat-bold text-sm text-gray-900" style={{ transform: [{ rotate: '45deg' }] }}>
                {Math.round((diasEntrenamiento / 20) * 100)}%
              </Text>
            </View>
          </View>

          {/* Card 2: Racha con animación */}
          <View className={`w-1/3 rounded-2xl p-4 shadow-sm items-center justify-center border ${streak > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <StreakAnimation 
              streak={streak} 
              isAnimating={streakAnimating}
              onAnimationComplete={() => setStreakAnimating(false)}
            />
          </View>
        </View>

        {/* Next Class */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-lg font-montserrat-bold text-gray-900">Tu Próxima Clase</Text>
            {proximaClase && (
              <View className="bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-xs font-montserrat-semibold text-green-700">
                  {proximaClase.status === 'confirmada' ? 'Confirmada' : proximaClase.status === 'checked-in' ? 'Check-in ✓' : proximaClase.status}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            // Estado de carga
            <View className="bg-white rounded-3xl p-8 shadow-sm items-center justify-center">
              <ActivityIndicator size="large" color="#dc2626" />
              <Text className="text-gray-500 text-sm font-montserrat mt-3">Cargando...</Text>
            </View>
          ) : proximaClase && fechaInfo ? (
            // Card de próxima clase con datos reales
            <View className="bg-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
              {/* Decorative blob */}
              <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full" />

              {/* Badge de tiempo */}
              {timeStatus && (
                <View 
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 z-20"
                  style={{ backgroundColor: timeStatus.bgColor }}
                >
                  {timeStatus.status === 'live' ? (
                    <Play size={12} color={timeStatus.color} fill={timeStatus.color} />
                  ) : timeStatus.status === 'ended' ? (
                    <CheckCircle size={12} color={timeStatus.color} />
                  ) : (
                    <Timer size={12} color={timeStatus.color} />
                  )}
                  <Text 
                    className="text-xs font-montserrat-bold"
                    style={{ color: timeStatus.color }}
                  >
                    {timeStatus.status === 'ended' || timeStatus.status === 'live' 
                      ? timeStatus.label 
                      : timeStatus.timeLeft}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start relative z-10">
                <View className="flex-row gap-4">
                  <View className="bg-gray-100 rounded-2xl w-16 h-16 items-center justify-center">
                    <Text className="text-xs font-montserrat-bold uppercase text-gray-800">{fechaInfo.label}</Text>
                    <Text className="text-xl font-montserrat-bold text-gray-800">{fechaInfo.day}</Text>
                  </View>
                  <View className="flex-1 pr-20">
                    <Text className="text-xl font-montserrat-bold text-gray-900" numberOfLines={1}>{proximaClase.claseNombre}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Clock size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-sm font-montserrat">{proximaClase.horaInicio} - {proximaClase.horaFin}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <User size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-sm font-montserrat">{proximaClase.instructor}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-5 pt-4 border-t border-gray-100 flex-row gap-3 relative z-10">
                {/* Ya pasó la clase y asistí */}
                {timeStatus?.status === 'ended' && proximaClase.status === 'checked-in' ? (
                  <View className="flex-1 bg-green-100 py-3.5 rounded-xl items-center flex-row justify-center gap-2">
                    <CheckCircle size={18} color="#16a34a" />
                    <Text className="text-green-700 font-montserrat-bold text-sm">¡Asististe! 💪</Text>
                  </View>
                ) : proximaClase.status === 'checked-in' ? (
                  // Ya hizo check-in pero la clase no ha terminado
                  <View className="flex-1 bg-green-100 py-3.5 rounded-xl items-center flex-row justify-center gap-2">
                    <CheckCircle size={18} color="#16a34a" />
                    <Text className="text-green-700 font-montserrat-bold text-sm">¡Ya estás aquí! 🏋️</Text>
                  </View>
                ) : timeStatus?.canCheckIn ? (
                  // Puede hacer check-in (clase próxima o en vivo)
                  <>
                    <TouchableOpacity 
                      className="flex-1 py-3.5 rounded-xl items-center shadow-sm flex-row justify-center gap-2"
                      style={{ 
                        backgroundColor: timeStatus.status === 'live' ? '#16a34a' : '#dc2626' 
                      }}
                      activeOpacity={0.8}
                      onPress={showCheckInModal}
                    >
                      <MapPin size={16} color="#ffffff" />
                      <Text className="text-white font-montserrat-bold text-sm">
                        {timeStatus.status === 'live' ? '¡Ya llegué!' : 'Ya estoy aquí'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="w-12 h-12 items-center justify-center border border-gray-200 rounded-xl"
                      activeOpacity={0.8}
                      onPress={showCancelModal}
                    >
                      <X size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </>
                ) : (
                  // No puede hacer check-in todavía
                  <>
                    <View className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center">
                      <Text className="text-gray-500 font-montserrat-bold text-sm">
                        {timeStatus?.timeLeft ? `Confirmar asistencia ${timeStatus.timeLeft}` : 'Esperando...'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      className="w-12 h-12 items-center justify-center border border-gray-200 rounded-xl"
                      activeOpacity={0.8}
                      onPress={showCancelModal}
                    >
                      <X size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            // Estado vacío - Sin clases reservadas
            <View className="bg-white rounded-3xl p-6 shadow-sm items-center relative overflow-hidden">
              {/* Decorative elements */}
              <View className="absolute top-0 left-0 -mt-8 -ml-8 w-24 h-24 bg-red-50 rounded-full opacity-50" />
              <View className="absolute bottom-0 right-0 -mb-8 -mr-8 w-32 h-32 bg-gray-50 rounded-full" />
              
              <View className="relative z-10 items-center py-4">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Calendar size={36} color="#9ca3af" />
                </View>
                <Text className="text-lg font-montserrat-bold text-gray-900 text-center mb-1">
                  Sin clases reservadas
                </Text>
                <Text className="text-sm text-gray-500 font-montserrat text-center mb-5 px-4">
                  Reserva tu próxima clase y mantén tu racha de entrenamiento 💪
                </Text>
                <TouchableOpacity 
                  className="bg-avc-red py-3.5 px-8 rounded-xl shadow-sm"
                  activeOpacity={0.8}
                  onPress={() => router.push('/booking')}
                >
                  <Text className="text-white font-montserrat-bold text-sm">Reservar Clase</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* WOD del Día */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-montserrat-bold text-gray-900">WOD de Hoy</Text>
            {wodHoy && (
              <TouchableOpacity>
                <Text className="text-sm font-montserrat-bold text-avc-red">Ver Detalle</Text>
              </TouchableOpacity>
            )}
          </View>

          {wodHoy ? (
            <View className="bg-gray-900 rounded-3xl p-6 shadow-lg relative overflow-hidden">
              <View className="relative z-10">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-4">
                    <View className="bg-white/20 px-2 py-1 rounded self-start mb-2">
                      <Text className="text-xs font-montserrat-bold text-white">
                        {wodHoy.modalidad.toUpperCase()}{wodHoy.timeCap ? ` ${wodHoy.timeCap}'` : ''}
                      </Text>
                    </View>
                    <Text className="text-2xl font-montserrat-bold text-white">"{wodHoy.titulo}"</Text>
                  </View>
                  <Dumbbell size={32} color="#6b7280" />
                </View>

                <View className="space-y-2">
                  {wodHoy.ejercicios.slice(0, 4).map((ejercicio, index) => (
                    <View key={index} className="flex-row items-center gap-3">
                      <View className="w-6 h-6 rounded-full bg-avc-red items-center justify-center">
                        <Text className="text-[10px] font-montserrat-bold text-white">{index + 1}</Text>
                      </View>
                      <Text className="text-gray-300 text-sm font-montserrat">
                        {ejercicio.cantidad} {ejercicio.nombre}
                      </Text>
                    </View>
                  ))}
                  {wodHoy.ejercicios.length > 4 && (
                    <Text className="pl-9 text-xs text-gray-500 font-montserrat">
                      + {wodHoy.ejercicios.length - 4} ejercicios más...
                    </Text>
                  )}
                </View>

                {wodHoy.notas && (
                  <View className="mt-3 bg-white/10 rounded-lg p-3">
                    <Text className="text-xs text-gray-400 font-montserrat-medium">{wodHoy.notas}</Text>
                  </View>
                )}

                <View className="mt-4 pt-4 border-t border-gray-700 flex-row justify-between items-center">
                  <Text className="text-xs text-gray-400 font-montserrat">Registrar Resultado</Text>
                  <TouchableOpacity className="w-8 h-8 bg-white rounded-full items-center justify-center">
                    <Plus size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-gray-100 rounded-3xl p-6 items-center justify-center">
              <Dumbbell size={32} color="#9ca3af" />
              <Text className="text-gray-500 font-montserrat-medium mt-2">No hay WOD programado para hoy</Text>
            </View>
          )}
        </View>

        {/* Reservar para Mañana */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-montserrat-bold text-gray-900">Reservar para Mañana</Text>
            {clasesMañana.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/booking')}>
                <Text className="text-sm font-montserrat-bold text-avc-red">Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loadingMañana ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center">
              <ActivityIndicator size="small" color="#dc2626" />
            </View>
          ) : clasesMañana.length > 0 ? (
            <FlatList
              data={clasesMañana}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 16, paddingRight: 20 }}
              renderItem={({ item }) => {
                // Protección por si horaInicio es undefined
                if (!item.horaInicio) return null;
                
                const timeInfo = formatTime(item.horaInicio);
                const spotsAvailable = item.capacidadMaxima - (item.reservacionesCount || 0);
                const isFull = spotsAvailable <= 0;
                
                return (
                  <QuickBookCard
                    time={`${timeInfo.time} ${timeInfo.period}`}
                    title={item.clase}
                    spotsAvailable={spotsAvailable}
                    isFull={isFull}
                    onPress={() => !isFull && showReservarModal(item)}
                  />
                );
              }}
            />
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Calendar size={32} color="#9ca3af" />
              <Text className="text-gray-500 font-montserrat-medium text-sm mt-2 text-center">
                No hay clases programadas para mañana
              </Text>
              <TouchableOpacity 
                className="mt-3"
                onPress={() => router.push('/booking')}
              >
                <Text className="text-avc-red font-montserrat-bold text-sm">Ver calendario completo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmación */}
      <ConfirmModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        loading={modalLoading}
        clase={
          // Si estamos reservando, mostrar la clase de mañana seleccionada
          modalType === 'reserve' && selectedClaseReservar
            ? {
                nombre: selectedClaseReservar.clase,
                horaInicio: selectedClaseReservar.horaInicio,
                horaFin: selectedClaseReservar.horaFin,
                instructor: selectedClaseReservar.instructor,
              }
            : proximaClase
            ? {
                nombre: proximaClase.claseNombre,
                horaInicio: proximaClase.horaInicio,
                horaFin: proximaClase.horaFin,
                instructor: proximaClase.instructor,
              }
            : null
        }
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </SafeAreaView>
  );
}
