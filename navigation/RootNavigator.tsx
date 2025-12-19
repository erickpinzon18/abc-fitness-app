import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Navigation stacks
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
  Timer: undefined;
  ActiveTimer: { type: string };
  WOD: undefined;
  ActionsModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
