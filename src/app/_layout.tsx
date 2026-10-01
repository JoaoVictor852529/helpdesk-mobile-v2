import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cores } from '@/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Chamados' }} />
        <Stack.Screen name="novo" options={{ title: 'Novo chamado', presentation: 'modal' }} />
        <Stack.Screen name="chamado/[id]" options={{ title: 'Detalhes do chamado' }} />
      </Stack>
    </>
  );
}
