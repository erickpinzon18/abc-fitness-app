import { useAuth } from '@/context/AuthContext';
import { Tabs, router } from 'expo-router';
import { Calendar, Home, Plus, Trophy, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({ icon: Icon, focused }: { icon: any; focused: boolean }) {
  return <Icon size={24} color={focused ? '#dc2626' : '#9ca3af'} />;
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icons mapping
        const icons: { [key: string]: any } = {
          index: Home,
          booking: Calendar,
          ranking: Trophy,
          profile: User,
        };

        const labels: { [key: string]: string } = {
          index: 'Inicio',
          booking: 'Reservar',
          ranking: 'Ranking',
          profile: 'Perfil',
        };

        const Icon = icons[route.name];

        // Insert the center button after "booking" (index 1)
        if (index === 2) {
          return (
            <React.Fragment key="center-button">
              {/* Center Plus Button */}
              <TouchableOpacity
                onPress={() => router.push('/actions-modal')}
                style={styles.centerButton}
                activeOpacity={0.8}
              >
                <View style={styles.centerButtonInner}>
                  <Plus size={30} color="#ffffff" />
                </View>
              </TouchableOpacity>

              {/* Current Tab */}
              <TouchableOpacity
                onPress={onPress}
                style={styles.tabItem}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <Icon size={24} color={isFocused ? '#dc2626' : '#9ca3af'} />
                <View
                  style={[
                    styles.tabLabel,
                    { backgroundColor: isFocused ? '#dc2626' : 'transparent' },
                  ]}
                />
              </TouchableOpacity>
            </React.Fragment>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Icon size={24} color={isFocused ? '#dc2626' : '#9ca3af'} />
            <View
              style={[
                styles.tabLabel,
                { backgroundColor: isFocused ? '#dc2626' : 'transparent' },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { user, initializing, isEmailVerified } = useAuth();

  // Redirigir usando useEffect para evitar problemas de contexto
  useEffect(() => {
    if (initializing) return;
    
    if (!user) {
      router.replace('/auth/login');
    } else if (!isEmailVerified) {
      router.replace('/auth/verify-email');
    }
  }, [user, initializing, isEmailVerified]);

  // Siempre retornar Tabs para mantener el contexto de navegación
  return (
    <Tabs
      tabBar={(props) => {
        // Ocultar tab bar mientras inicializa o no hay usuario válido
        if (initializing || !user || !isEmailVerified) {
          return (
            <View style={{ height: 0 }} />
          );
        }
        return <CustomTabBar {...props} />;
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="booking" />
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabLabel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  centerButton: {
    marginTop: -30,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
