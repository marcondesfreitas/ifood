import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CamadaOferta from '@/components/CamadaOferta';
import Metricas from '@/components/Metricas';
import {
  useFonts,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { EntregadorProvider } from '@/state/EntregadorContext';
import { FotoPerfilProvider } from '@/state/FotoPerfilContext';

// Segura a splash até a fonte estar pronta: sem isso o app pisca com a fonte
// do sistema antes de trocar para a Inter.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * LAYOUT RAIZ — o "esqueleto" do app.
 *
 * O Expo Router usa roteamento por arquivos: cada arquivo dentro de /app vira
 * uma rota automaticamente. Este `_layout.tsx` envolve TODAS as rotas, então é
 * o lugar certo para providers globais (estado, tema, fontes).
 *
 * <Stack> = navegação em pilha: uma tela empilha sobre a outra e o botão
 * voltar desempilha. As abas são UMA das telas dessa pilha — por isso Perfil e
 * Dados de repasse abrem POR CIMA da barra de abas, como no app de referência.
 */
export default function LayoutRaiz() {
  const [fontesProntas, erroFonte] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    // Some com a splash quando a fonte carregar — ou se ela falhar, para o app
    // nunca ficar preso numa tela branca.
    if (fontesProntas || erroFonte) SplashScreen.hideAsync().catch(() => {});
  }, [fontesProntas, erroFonte]);

  if (!fontesProntas && !erroFonte) return null;

  return (
    <SafeAreaProvider>
      <EntregadorProvider>
        <FotoPerfilProvider>
          <StatusBar style="dark" />
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="ativar" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="perfil" />
              <Stack.Screen name="repasse" />
              <Stack.Screen name="documentos" />
              <Stack.Screen name="veiculo" />
              <Stack.Screen name="contato" />
              <Stack.Screen name="cadastro-veiculo" />
              <Stack.Screen name="vantagens" />
              <Stack.Screen name="forma-entrega" />
            </Stack>
            {/* Fica FORA da pilha: a oferta cobre qualquer tela do app. */}
            <CamadaOferta />
            {/* Speed Insights da Vercel. Não desenha nada; no app instalado
                nem existe — ver src/components/Metricas.tsx. */}
            <Metricas />
          </View>
        </FotoPerfilProvider>
      </EntregadorProvider>
    </SafeAreaProvider>
  );
}
