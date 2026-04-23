/**
 * ConversãoAI Mobile — App.js
 * Navegação principal + Auth flow
 */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

// Stores
import { useAuthStore } from './src/store/auth.store';

// Screens — Auth
import LoginScreen    from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Screens — Main
import HomeScreen      from './src/screens/HomeScreen';
import ChatScreen      from './src/screens/ChatScreen';
import CreativeScreen  from './src/screens/CreativeScreen';
import CopyScreen      from './src/screens/CopyScreen';
import CampaignScreen  from './src/screens/CampaignScreen';
import HistoryScreen   from './src/screens/HistoryScreen';
import ProfileScreen   from './src/screens/ProfileScreen';

// Screens — Detail
import ChatSessionScreen from './src/screens/detail/ChatSessionScreen';
import AnalysisScreen    from './src/screens/detail/AnalysisScreen';
import LandingPageScreen from './src/screens/detail/LandingPageScreen';
import TrafficScreen     from './src/screens/detail/TrafficScreen';
import ValidateScreen    from './src/screens/detail/ValidateScreen';
import SettingsScreen    from './src/screens/detail/SettingsScreen';
import PlansScreen       from './src/screens/detail/PlansScreen';

// Design tokens
import { COLORS, FONTS } from './src/constants/theme';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge:  false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── BOTTOM TAB NAVIGATOR ─────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg2,
          borderTopColor:  COLORS.border,
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      6,
          height:          70,
        },
        tabBarActiveTintColor:   COLORS.accent2,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarLabelStyle: {
          fontSize:   10,
          fontFamily: FONTS.body,
          marginTop:  2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'grid'              : 'grid-outline',
            Chat:     focused ? 'chatbubbles'       : 'chatbubbles-outline',
            Criar:    focused ? 'create'            : 'create-outline',
            Histórico: focused ? 'time'             : 'time-outline',
            Perfil:   focused ? 'person-circle'     : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Chat"       component={ChatScreen} />
      <Tab.Screen name="Criar"      component={CopyScreen} />
      <Tab.Screen name="Histórico"  component={HistoryScreen} />
      <Tab.Screen name="Perfil"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── STACK AUTH ───────────────────────────────────────────────────────────

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── STACK MAIN ───────────────────────────────────────────────────────────

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:      true,
        headerStyle:      { backgroundColor: COLORS.bg2 },
        headerTintColor:  COLORS.text,
        headerTitleStyle: { fontFamily: FONTS.heading, fontSize: 16 },
        headerShadowVisible: false,
        headerBackTitle:  '',
        contentStyle:     { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="MainTabs"    component={MainTabs}         options={{ headerShown: false }} />
      <Stack.Screen name="ChatSession" component={ChatSessionScreen} options={{ title: 'Chat IA' }} />
      <Stack.Screen name="Analysis"    component={AnalysisScreen}    options={{ title: 'Análise Criativo' }} />
      <Stack.Screen name="LandingPage" component={LandingPageScreen} options={{ title: 'Página de Vendas' }} />
      <Stack.Screen name="Traffic"     component={TrafficScreen}     options={{ title: 'Gestor de Tráfego' }} />
      <Stack.Screen name="Validate"    component={ValidateScreen}    options={{ title: 'Validar Ideia' }} />
      <Stack.Screen name="Creative"    component={CreativeScreen}    options={{ title: 'Analisar Criativo' }} />
      <Stack.Screen name="Campaign"    component={CampaignScreen}    options={{ title: 'Criar Campanha' }} />
      <Stack.Screen name="Settings"    component={SettingsScreen}    options={{ title: 'Configurações' }} />
      <Stack.Screen name="Plans"       component={PlansScreen}       options={{ title: 'Planos e Preços' }} />
    </Stack.Navigator>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initialize();  // Restaura sessão do SecureStore
      } catch (e) {
        console.warn('Init error:', e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent2} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <NavigationContainer
          theme={{
            dark:   true,
            colors: {
              primary:      COLORS.accent,
              background:   COLORS.bg,
              card:         COLORS.bg2,
              text:         COLORS.text,
              border:       COLORS.border,
              notification: COLORS.accent2,
            },
          }}
        >
          {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
