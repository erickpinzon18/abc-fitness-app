import { Admin } from "@/lib/adminService";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Navigation stacks
import { AdminStack } from "./AdminStack";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";

// Feature screens
import ActionsModal from "@/screens/ActionsModal";
import ActiveTimerScreen from "@/screens/timer/ActiveTimerScreen";
import TimerScreen from "@/screens/timer/TimerScreen";
import WODScreen from "@/screens/wod/WODScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: { admin: Admin };
  Timer: undefined;
  ActiveTimer: { type: string };
  WOD: undefined;
  ActionsModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper para AdminStack que recibe props de route
function AdminWrapper({ route, navigation }: any) {
  const { admin } = route.params;

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
  };

  return <AdminStack admin={admin} onLogout={handleLogout} />;
}

export function RootNavigator() {
  // Siempre empezar en Auth (Login)
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      {/* Auth Flow */}
      <Stack.Screen name="Auth" component={AuthStack} />

      {/* Main App Flow */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* Admin Flow */}
      <Stack.Screen name="Admin" component={AdminWrapper} />

      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ActiveTimer"
        component={ActiveTimerScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="WOD"
        component={WODScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ActionsModal"
        component={ActionsModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  );
}
