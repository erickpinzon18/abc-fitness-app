import { Admin } from "@/lib/adminService";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Newspaper,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

// Admin Screens
import AdminClases from "@/screens/admin/AdminClases";
import AdminDashboard from "@/screens/admin/AdminDashboard";
import AdminNoticias from "@/screens/admin/AdminNoticias";
import AdminWODs from "@/screens/admin/AdminWODs";

export type AdminTabsParamList = {
  Dashboard: undefined;
  Clases: undefined;
  WODs: undefined;
  Noticias: undefined;
};

const Tab = createBottomTabNavigator<AdminTabsParamList>();

interface AdminStackProps {
  admin: Admin;
  onLogout: () => void;
}

export function AdminStack({ admin, onLogout }: AdminStackProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#dc2626",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      >
        {() => <AdminDashboard admin={admin} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Clases"
        component={AdminClases}
        options={{
          tabBarLabel: "Clases",
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="WODs"
        component={AdminWODs}
        options={{
          tabBarLabel: "WODs",
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Noticias"
        component={AdminNoticias}
        options={{
          tabBarLabel: "Noticias",
          tabBarIcon: ({ color, size }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    height: Platform.OS === "ios" ? 88 : 70,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
