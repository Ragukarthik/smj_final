import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFD700',
          borderTopColor: '#8B0000',
        },
        tabBarActiveTintColor: '#8B0000',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="log-in" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}