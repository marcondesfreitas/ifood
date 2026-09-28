import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ativar } from '@/state/ativacao';
import { familia, raios } from '@/theme';

/**
 * ATIVAÇÃO POR TOKEN — entra logo depois da splash.
 *
 * Só um token libera o app — veja `TOKEN_VALIDO` logo abaixo. Qualquer outra
 * coisa é recusada na própria tela, sem sair dela.
 *
 * A tela promete, no aviso amarelo, que o app abre direto na próxima vez —
 * então a ativação é gravada no aparelho (`src/state/ativacao.ts`), e a splash
 * consulta esse valor para decidir se manda para cá ou direto para o mapa.
 *
 * As cores aqui não saem do design system do resto do app: esta tela veio de
 * uma referência própria, com um vermelho mais vivo e um aviso em creme que
 * não existem em nenhuma outra tela. Ficam locais de propósito, para não
 * poluir os tokens globais com valores de uso único.
 */

/**
 * O token que libera o app.
 *
 * Fica no código porque não há servidor: é um protótipo acadêmico, e qualquer
 * validação aqui é combinada de antemão. Num app real o token seria emitido e
 * conferido pelo backend — guardar segredo no cliente não protege nada, já que
 * o bundle é legível por quem o baixa.
 *
 * A comparação é feita em maiúsculas: o campo já converte o que o usuário
 * digita, então "motorista7" também entra.
 */
const TOKEN_VALIDO = 'MOTORISTA7';

const VERMELHO = '#F5001E';
const TEXTO = '#1A1A1F';
const CINZA = '#5A5A66';

export default function TelaAtivar() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ativando, setAtivando] = useState(false);

  async function confirmar() {
    const digitado = token.trim().toUpperCase();

    if (!digitado) {
      setErro('Digite o token para continuar.');
      return;
    }

    if (digitado !== TOKEN_VALIDO) {
      // Erro tem vibração própria: quem não está olhando a tela percebe.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setErro('Token inválido. Confira e tente novamente.');
      return;
    }

    setErro(null);
    setAtivando(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await ativar(digitado);
    router.replace('/(tabs)');
  }

  return (
    <View style={estilos.tela}>
      <SafeAreaView style={estilos.area}>
        <KeyboardAvoidingView
          style={estilos.area}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={estilos.conteudo}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={estilos.logo}>
              <Image
                source={require('../assets/ifood-logo.png')}
                style={estilos.marca}
                resizeMode="contain"
              />
            </View>

            <Text style={estilos.titulo}>Ativar aplicativo</Text>

            <Text style={estilos.explicacao}>
              Digite o <Text style={estilos.forte}>token de ativação</Text> para começar a usar
              o <Text style={estilos.forte}>iFood</Text>. Cada token é de uso único e válido por
              7 dias.
            </Text>

            <View style={estilos.bloco}>
              <Text style={estilos.rotulo}>Token de ativação</Text>
              <TextInput
                style={[estilos.campo, erro && estilos.campoErro]}
                placeholder="EX: IFOOD12345"
                placeholderTextColor="#B4B4BC"
                value={token}
                onChangeText={(v) => {
                  setToken(v.toUpperCase());
                  if (erro) setErro(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={confirmar}
                returnKeyType="go"
              />
              {erro && <Text style={estilos.mensagemErro}>{erro}</Text>}
            </View>

            <Pressable
              onPress={confirmar}
              disabled={ativando}
              style={({ pressed }) => [
                estilos.botao,
                pressed && estilos.botaoPressionado,
                ativando && estilos.botaoInativo,
              ]}
            >
              <Text style={estilos.botaoTexto}>
                {ativando ? 'Ativando…' : 'Ativar agora'}
              </Text>
            </Pressable>

            <View style={estilos.aviso}>
              <View style={estilos.avisoIcone}>
                <Ionicons name="information" size={14} color="#FFF" />
              </View>
              <Text style={estilos.avisoTexto}>
                Após a ativação, o app abrirá diretamente na próxima vez que você entrar. Sem
                necessidade de novo token.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FFFFFF' },
  area: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: raios.circulo,
    backgroundColor: VERMELHO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  marca: { width: 76, height: 41 },
  titulo: {
    fontFamily: familia.black,
    fontSize: 28,
    color: TEXTO,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  explicacao: {
    fontFamily: familia.regular,
    fontSize: 16,
    lineHeight: 24,
    color: CINZA,
    textAlign: 'center',
    marginBottom: 36,
  },
  forte: { fontFamily: familia.bold, color: TEXTO },
  bloco: { width: '100%', gap: 10 },
  rotulo: {
    fontFamily: familia.bold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#3C3C46',
  },
  campo: {
    height: 62,
    borderRadius: 14,
    backgroundColor: '#F6F6F7',
    borderWidth: 1,
    borderColor: '#E9E9EC',
    paddingHorizontal: 18,
    fontFamily: familia.medio,
    fontSize: 19,
    color: TEXTO,
  },
  campoErro: { borderColor: VERMELHO },
  mensagemErro: { fontFamily: familia.medio, fontSize: 13, color: VERMELHO },
  botao: {
    width: '100%',
    height: 64,
    borderRadius: raios.circulo,
    backgroundColor: VERMELHO,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    // O brilho vermelho embaixo do botão é o detalhe que mais identifica esta
    // tela; sem ele o botão fica achatado contra o branco.
    shadowColor: VERMELHO,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  botaoPressionado: { opacity: 0.9 },
  botaoInativo: { opacity: 0.7 },
  botaoTexto: { fontFamily: familia.bold, fontSize: 19, color: '#FFFFFF' },
  aviso: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FDF4D8',
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  avisoIcone: {
    width: 24,
    height: 24,
    borderRadius: raios.circulo,
    backgroundColor: '#F0A500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoTexto: {
    flex: 1,
    fontFamily: familia.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4030',
  },
});
