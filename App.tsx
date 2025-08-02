import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import ActionsScreen from './src/screens/ActionsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GameScreen from './src/screens/GameScreen';

// Store
import { useFutebolStore } from './src/stores/futebolStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const { appState } = useFutebolStore();

  if (appState === 'playing') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#2d5016" />
        <GameScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Início') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Times') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Ações') {
                iconName = focused ? 'flash' : 'flash-outline';
              } else if (route.name === 'Histórico') {
                iconName = focused ? 'time' : 'time-outline';
              } else {
                iconName = 'home-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2d5016',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#2d5016',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Início" 
            component={HomeScreen}
            options={{ title: '⚽ FutebolStats' }}
          />
          <Tab.Screen 
            name="Times" 
            component={TeamsScreen}
            options={{ title: 'Gerenciar Times' }}
          />
          <Tab.Screen 
            name="Ações" 
            component={ActionsScreen}
            options={{ title: 'Ações do Jogo' }}
          />
          <Tab.Screen 
            name="Histórico" 
            component={HistoryScreen}
            options={{ title: 'Histórico de Jogos' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}