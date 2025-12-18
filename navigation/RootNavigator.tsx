import { useAuth } from "@/context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

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
  const { user, initializing, isEmailVerified } = useAuth();

  return (
    <NavigationContainer>
      {initializing ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user || !isEmailVerified ? (
            // Auth flow
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : (
            // Main app flow
            <>
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
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
