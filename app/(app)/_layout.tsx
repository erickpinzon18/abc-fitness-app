import { useColorScheme } from '@/components/useColorScheme';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="timer" 
        options={{ presentation: 'fullScreenModal' }} 
      />
      <Stack.Screen 
        name="actions-modal" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="wod" 
        options={{ presentation: 'fullScreenModal' }} 
      />
    </Stack>
  );
}
