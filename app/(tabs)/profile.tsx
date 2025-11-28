import { router } from 'expo-router';
import {
    Bell,
    Camera,
    ChevronRight,
    CreditCard,
    History,
    Lock,
    LogOut,
    Moon,
    Shield,
    User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsRowProps {
  icon: any;
  iconBg?: string;
  title: string;
  subtitle?: string;
  hasArrow?: boolean;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingsRow({
  icon: Icon,
  iconBg = 'bg-gray-100',
  title,
  subtitle,
  hasArrow = false,
  hasToggle = false,
  toggleValue = false,
  onToggle,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasToggle}
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
      activeOpacity={hasToggle ? 1 : 0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className={`${iconBg} p-2 rounded-lg`}>
          <Icon size={18} color={iconBg === 'bg-red-50' ? '#dc2626' : '#4b5563'} />
        </View>
        <View>
          <Text className="text-sm font-montserrat-semibold text-gray-700">{title}</Text>
          {subtitle && (
            <Text className="text-xs text-gray-400 font-montserrat">{subtitle}</Text>
          )}
        </View>
      </View>
      {hasArrow && <ChevronRight size={18} color="#9ca3af" />}
      {hasToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#e5e7eb', true: '#dc2626' }}
          thumbColor="#ffffff"
          ios_backgroundColor="#e5e7eb"
        />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // Simular logout
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-avc-gray" edges={['top']}>
      {/* Profile Header */}
      <View className="px-5 pt-4 pb-6 items-center">
        <View className="relative">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <TouchableOpacity className="absolute bottom-0 right-0 bg-avc-red p-1.5 rounded-full shadow-sm border-2 border-white">
            <Camera size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-montserrat-bold text-gray-900 mt-3">Juan Fit</Text>
        <View className="px-3 py-1 bg-red-100 rounded-full mt-1">
          <Text className="text-xs font-montserrat-bold text-avc-red">Miembro Pro</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Membership Card */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex-row items-center justify-between border-l-4 border-avc-red">
          <View>
            <Text className="text-xs text-gray-400 font-montserrat-semibold uppercase">
              Membresía Actual
            </Text>
            <Text className="text-base font-montserrat-bold text-gray-900">Plan Ilimitado</Text>
            <Text className="text-xs text-gray-500 font-montserrat mt-0.5">
              Renueva: 15 Oct 2025
            </Text>
          </View>
          <TouchableOpacity className="bg-red-50 px-3 py-1.5 rounded-lg">
            <Text className="text-xs font-montserrat-bold text-avc-red">Gestionar</Text>
          </TouchableOpacity>
        </View>

        {/* Mi Cuenta Section */}
        <Text className="text-sm font-montserrat-bold text-gray-400 uppercase mb-3 ml-1">
          Mi Cuenta
        </Text>
        <View className="bg-white rounded-2xl px-5 py-1 shadow-sm mb-6">
          <SettingsRow
            icon={User}
            title="Datos Personales"
            hasArrow
            onPress={() => console.log('Datos Personales')}
          />
          <SettingsRow
            icon={CreditCard}
            title="Métodos de Pago"
            hasArrow
            onPress={() => console.log('Métodos de Pago')}
          />
          <SettingsRow
            icon={History}
            title="Historial de Asistencias"
            hasArrow
            onPress={() => console.log('Historial')}
          />
        </View>

        {/* Preferencias Section */}
        <Text className="text-sm font-montserrat-bold text-gray-400 uppercase mb-3 ml-1">
          Preferencias
        </Text>
        <View className="bg-white rounded-2xl px-5 py-1 shadow-sm mb-6">
          <SettingsRow
            icon={Bell}
            iconBg="bg-red-50"
            title="Notificaciones Push"
            subtitle="Recordatorios de clase"
            hasToggle
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          <SettingsRow
            icon={Moon}
            title="Modo Oscuro"
            hasToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
        </View>

        {/* Seguridad Section */}
        <Text className="text-sm font-montserrat-bold text-gray-400 uppercase mb-3 ml-1">
          Seguridad
        </Text>
        <View className="bg-white rounded-2xl px-5 py-1 shadow-sm mb-8">
          <SettingsRow
            icon={Lock}
            title="Cambiar Contraseña"
            hasArrow
            onPress={() => console.log('Cambiar Contraseña')}
          />
          <SettingsRow
            icon={Shield}
            title="Privacidad"
            hasArrow
            onPress={() => console.log('Privacidad')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full py-3.5 bg-white border border-red-100 rounded-xl shadow-sm flex-row items-center justify-center gap-2 mb-4"
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#dc2626" />
          <Text className="font-montserrat-bold text-avc-red">Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text className="text-center text-xs text-gray-400 font-montserrat mb-4">
          Versión 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
