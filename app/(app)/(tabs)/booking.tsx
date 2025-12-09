import { ConfirmModal } from '@/components/ConfirmModal';
import { ClassCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  calcularDuracion,
  cancelarReservacion,
  Clase,
  crearReservacion,
  formatTime,
  getClasesPorFecha,
  tieneReservacion,
} from '@/lib/classService';
import { CalendarDays } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const filterOptions = ['Todo', 'CrossFit', 'Funcional', 'Flexibilidad', 'Cycling', 'Zumba'];

// Componente del botón de día - completamente separado
function DayButton({ 
  dayName, 
  dayNumber, 
  isToday, 
  isSelected, 
  onPress 
}: { 
  dayName: string; 
  dayNumber: number; 
  isToday: boolean;
  isSelected: boolean; 
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 50,
        height: 70,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected ? '#dc2626' : '#ffffff',
        borderWidth: isSelected ? 0 : 1,
        borderColor: '#f3f4f6',
        shadowColor: isSelected ? '#dc2626' : 'transparent',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isSelected ? 0.3 : 0,
        shadowRadius: 8,
        elevation: isSelected ? 4 : 0,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontFamily: 'Montserrat_600SemiBold',
          color: isSelected ? '#ffffff' : '#9ca3af',
        }}
      >
        {dayName}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontFamily: 'Montserrat_700Bold',
          color: isSelected ? '#ffffff' : '#111827',
        }}
      >
        {dayNumber}
      </Text>
      {isToday && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            marginTop: 2,
            backgroundColor: isSelected ? '#ffffff' : '#dc2626',
          }}
        />
      )}
    </Pressable>
  );
}

// Generar días de la semana (fuera del componente)
function getWeekDaysData() {
  const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  let todayIdx = 0;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) todayIdx = i;
    
    days.push({
      key: `day-${i}`,
      dayName: DAY_NAMES[date.getDay()],
      dayNumber: date.getDate(),
      date: date,
      isToday,
    });
  }
  
  return { days, todayIdx };
}

export default function BookingScreen() {
  const { user, userData } = useAuth();
  
  // Estado simple
  const [initialized, setInitialized] = useState(false);
  const [days, setDays] = useState<Array<{
    key: string;
    dayName: string;
    dayNumber: number;
    date: Date;
    isToday: boolean;
  }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('Todo');
  const [clases, setClases] = useState<Clase[]>([]);
  const [reservedClasses, setReservedClasses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Estado del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'reserve' | 'cancel' | 'success' | 'error'>('reserve');
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Inicializar días una sola vez
  useEffect(() => {
    const { days: weekDays, todayIdx } = getWeekDaysData();
    setDays(weekDays);
    setSelectedIndex(todayIdx);
    setInitialized(true);
  }, []);

  // Cargar clases
  useEffect(() => {
    if (!initialized || !user || days.length === 0) return;
    
    const selectedDay = days[selectedIndex];
    if (!selectedDay) return;

    let cancelled = false;
    
    async function loadClases() {
      setLoading(true);
      try {
        const data = await getClasesPorFecha(selectedDay.date);
        if (cancelled) return;
        
        setClases(data);
        
        const reserved = new Set<string>();
        for (const c of data) {
          const res = await tieneReservacion(c.id, user!.uid);
          if (res) reserved.add(c.id);
        }
        if (cancelled) return;
        setReservedClasses(reserved);
      } catch (e) {
        console.error('Error cargando clases:', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    
    loadClases();
    return () => { cancelled = true; };
  }, [initialized, selectedIndex, user]);

  // Función simple para cambiar día
  function selectDay(index: number) {
    if (index !== selectedIndex) {
      setSelectedIndex(index);
    }
  }

  // Recargar datos
  async function reloadClases() {
    if (!user || days.length === 0) return;
    const selectedDay = days[selectedIndex];
    if (!selectedDay) return;
    
    try {
      const data = await getClasesPorFecha(selectedDay.date);
      setClases(data);
      
      const reserved = new Set<string>();
      for (const c of data) {
        const res = await tieneReservacion(c.id, user!.uid);
        if (res) reserved.add(c.id);
      }
      setReservedClasses(reserved);
    } catch (e) {
      console.error('Error:', e);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    reloadClases().finally(() => setRefreshing(false));
  }

  function getStatus(clase: Clase): 'available' | 'few-spots' | 'full' | 'reserved' {
    if (reservedClasses.has(clase.id)) return 'reserved';
    const ocupados = clase.reservacionesCount || 0;
    if (ocupados >= clase.capacidadMaxima) return 'full';
    if (clase.capacidadMaxima - ocupados <= 3) return 'few-spots';
    return 'available';
  }

  // Mostrar modal de reservación
  function showReserveModal(clase: Clase) {
    setSelectedClase(clase);
    setModalType('reserve');
    setModalVisible(true);
  }

  // Mostrar modal de cancelación
  function showCancelModal(clase: Clase) {
    setSelectedClase(clase);
    setModalType('cancel');
    setModalVisible(true);
  }

  // Cerrar modal
  function closeModal() {
    setModalVisible(false);
    setSelectedClase(null);
    setModalLoading(false);
  }

  // Confirmar acción del modal
  async function handleModalConfirm() {
    if (!selectedClase || !user) return;
    
    setModalLoading(true);
    
    try {
      if (modalType === 'reserve') {
        const result = await crearReservacion(
          selectedClase.id,
          user.uid,
          userData?.displayName || 'Usuario',
          userData?.email || user.email || ''
        );
        
        if (result.success) {
          setModalType('success');
          await reloadClases();
        } else {
          setModalType('error');
        }
      } else if (modalType === 'cancel') {
        const result = await cancelarReservacion(selectedClase.id, user.uid);
        
        if (result.success) {
          closeModal();
          await reloadClases();
        } else {
          setModalType('error');
        }
      }
    } catch (e) {
      console.error('Error:', e);
      setModalType('error');
    } finally {
      setModalLoading(false);
    }
  }

  const filteredClases = selectedFilter === 'Todo'
    ? clases
    : clases.filter(c => c.clase.toLowerCase() === selectedFilter.toLowerCase());

  // Loading inicial
  if (!initialized) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator size="large" color="#dc2626" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }} edges={['top']}>
      {/* Header */}
      <View style={{ backgroundColor: '#f9fafb', paddingBottom: 8 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontFamily: 'Montserrat_700Bold', color: '#111827' }}>
            Reservar Clase
          </Text>
          <Pressable style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 999, borderWidth: 1, borderColor: '#f3f4f6' }}>
            <CalendarDays size={20} color="#374151" />
          </Pressable>
        </View>

        {/* Calendario horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {days.map((day, index) => (
            <DayButton
              key={day.key}
              dayName={day.dayName}
              dayNumber={day.dayNumber}
              isToday={day.isToday}
              isSelected={selectedIndex === index}
              onPress={() => selectDay(index)}
            />
          ))}
        </ScrollView>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {filterOptions.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                backgroundColor: selectedFilter === filter ? '#111827' : '#ffffff',
                borderColor: selectedFilter === filter ? '#111827' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Montserrat_600SemiBold',
                  color: selectedFilter === filter ? '#ffffff' : '#4b5563',
                }}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Lista de clases */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#dc2626"
            />
          }
        >
          {filteredClases.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <Text style={{ color: '#9ca3af', fontFamily: 'Montserrat_500Medium', textAlign: 'center' }}>
                No hay clases programadas para este día
              </Text>
            </View>
          ) : (
            filteredClases.map((clase) => {
              const { time, period } = formatTime(clase.horaInicio);
              const status = getStatus(clase);
              const spotsAvailable = clase.capacidadMaxima - (clase.reservacionesCount || 0);

              return (
                <ClassCard
                  key={clase.id}
                  time={time}
                  period={period}
                  title={clase.clase}
                  coach={clase.instructor}
                  duration={calcularDuracion(clase.horaInicio, clase.horaFin)}
                  spotsAvailable={spotsAvailable}
                  totalSpots={clase.capacidadMaxima}
                  status={status}
                  loading={actionLoading === clase.id}
                  onReserve={() => showReserveModal(clase)}
                  onCancel={() => showCancelModal(clase)}
                  onWaitlist={() => {}}
                />
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        visible={modalVisible}
        type={modalType}
        clase={selectedClase ? {
          nombre: selectedClase.clase,
          horaInicio: selectedClase.horaInicio,
          horaFin: selectedClase.horaFin,
          instructor: selectedClase.instructor,
        } : null}
        loading={modalLoading}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />
    </SafeAreaView>
  );
}
