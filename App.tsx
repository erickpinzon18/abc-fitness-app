import { AuthProvider, useAuth } from "@/context/AuthContext";
import ActionsModal from "@/screens/ActionsModal";
import AdminClases from "@/screens/admin/AdminClases";
import AdminConfig from "@/screens/admin/AdminConfig";
import AdminDashboard from "@/screens/admin/AdminDashboard";
import AdminNoticias from "@/screens/admin/AdminNoticias";
import AdminWODs from "@/screens/admin/AdminWODs";
import LoginScreen from "@/screens/auth/LoginScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import VerifyEmailScreen from "@/screens/auth/VerifyEmailScreen";
import WelcomeScreen from "@/screens/auth/WelcomeScreen";
import BookingScreen from "@/screens/booking/BookingScreen";
import HomeScreen from "@/screens/home/HomeScreen";
import PlanesScreen from "@/screens/planes/PlanesScreen";
import DatosPersonalesScreen from "@/screens/profile/DatosPersonalesScreen";
import HistorialScreen from "@/screens/profile/HistorialScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import RankingScreen from "@/screens/ranking/RankingScreen";
import ActiveTimerScreen from "@/screens/timer/ActiveTimerScreen";
import TimerScreen from "@/screens/timer/TimerScreen";
import WODScreen from "@/screens/wod/WODScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Dumbbell,
  Home,
  Newspaper,
  Settings,
  Trophy,
  User,
} from "lucide-react-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "./global.css";

SplashScreen.preventAutoHideAsync();

// Type definitions
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  Welcome: undefined;
};

type MainTabsParamList = {
  Home: undefined;
  Booking: undefined;
  Ranking: undefined;
  Profile: undefined;
};

type AdminTabsParamList = {
  Dashboard: undefined;
  Clases: undefined;
  WODs: undefined;
  Noticias: undefined;
  Config: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: { admin: any };
  Timer: undefined;
  ActiveTimer: { type: string };
  WOD: undefined;
  ActionsModal: undefined;
  Planes: undefined;
  DatosPersonales: undefined;
  Historial: undefined;
};

// Create navigators
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
const AdminTab = createBottomTabNavigator<AdminTabsParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth Stack Component
function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
      <AuthStackNav.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
    </AuthStackNav.Navigator>
  );
}

// Main Tabs Component
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#dc2626",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontFamily: "Montserrat-SemiBold",
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarLabel: "Reservar",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          tabBarLabel: "Ranking",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Admin Tabs Component
function AdminTabs({ route, navigation }: any) {
  const { admin } = route.params;
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#dc2626",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontFamily: "Montserrat-SemiBold",
          fontSize: 10,
        },
      }}
    >
      <AdminTab.Screen
        name="Dashboard"
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      >
        {() => <AdminDashboard admin={admin} onLogout={handleLogout} />}
      </AdminTab.Screen>
      <AdminTab.Screen
        name="Clases"
        component={AdminClases}
        options={{
          tabBarLabel: "Clases",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="WODs"
        component={AdminWODs}
        options={{
          tabBarLabel: "WODs",
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Noticias"
        component={AdminNoticias}
        options={{
          tabBarLabel: "Noticias",
          tabBarIcon: ({ color, size }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Config"
        options={{
          tabBarLabel: "Config",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      >
        {() => <AdminConfig admin={admin} onLogout={handleLogout} />}
      </AdminTab.Screen>
    </AdminTab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Auth" component={AuthStack} />
      <RootStack.Screen name="Main" component={MainTabs} />
      <RootStack.Screen name="Admin" component={AdminTabs} />
      <RootStack.Screen
        name="Timer"
        component={TimerScreen}
        options={{ animation: "slide_from_right" }}
      />
      <RootStack.Screen
        name="ActiveTimer"
        component={ActiveTimerScreen}
        options={{ animation: "slide_from_right" }}
      />
      <RootStack.Screen
        name="WOD"
        component={WODScreen}
        options={{ animation: "slide_from_right" }}
      />
      <RootStack.Screen
        name="ActionsModal"
        component={ActionsModal}
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <RootStack.Screen
        name="Planes"
        component={PlanesScreen}
        options={{ animation: "slide_from_right" }}
      />
      <RootStack.Screen
        name="DatosPersonales"
        component={DatosPersonalesScreen}
        options={{ animation: "slide_from_right" }}
      />
      <RootStack.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ animation: "slide_from_right" }}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    Montserrat: require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
    RobotoMono: require("./assets/fonts/RobotoMono-Regular.ttf"),
    "RobotoMono-Bold": require("./assets/fonts/RobotoMono-Bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
