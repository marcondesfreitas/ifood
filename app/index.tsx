import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { lerAtivacao } from '@/state/ativacao';
import { cores, espacos, familia } from '@/theme';

/**
 * ABERTURA (rota "/").
 *
 * O app de referência não tem tela de login: abre na splash e cai direto no
 * app. Daqui o destino é a ativação por token (primeira vez) ou o mapa.
 *
 * `router.replace` em vez de `router.push`: replace TROCA a tela atual, então o
 * botão voltar do Android não devolve o usuário para a splash.
 */
export default function TelaAbertura() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Ver DIMENSÃO DO MASCOTE, mais abaixo.
  const larguraMascote = width * LARGURA_CAIXA;

  const surgir = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(surgir, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /**
     * A splash fica na tela até a navegação — não há etapa intermediária.
     *
     * O tempo cobre a animação de entrada (500ms) com folga para a marca ser
     * lida. Encurtar demais faz a splash piscar; é tempo de leitura, não
     * espera técnica: a consulta à ativação é instantânea.
     */
    const t = setTimeout(async () => {
      // Quem já ativou vai direto para o mapa e nunca mais vê o token.
      const ativacao = await lerAtivacao();
      router.replace(ativacao ? '/(tabs)' : '/ativar');
    }, 2200);
    return () => clearTimeout(t);
  }, [surgir, router]);

  return (
    <View style={estilos.tela}>
      <Animated.View style={[estilos.miolo, { opacity: surgir }]}>
        <Image
          source={require('../assets/mascote.png')}
          style={[estilos.mascote, { width: larguraMascote, height: larguraMascote / RAZAO_ARQUIVO }]}
          resizeMode="contain"
        />

        <Text style={estilos.linha1}>iFood para</Text>
        <Text style={estilos.linha2}>Entregadores</Text>
      </Animated.View>

      {/*
        Logotipo no rodapé. `resizeMode="contain"` com largura e altura na
        proporção original do arquivo (700x376) — assim ele nunca estica,
        mesmo se alguém mexer só num dos dois valores depois.
      */}
      <Animated.Image
        source={require('../assets/ifood-logo.png')}
        style={[estilos.assinatura, { opacity: surgir }]}
        resizeMode="contain"
      />
    </View>
  );
}

/** Largura do logotipo no rodapé da splash; a altura sai da proporção. */
const LOGO_LARGURA = 120;

/**
 * DIMENSÃO DO MASCOTE
 *
 * Medido na gravação: o mascote ocupa 124x138 px numa tela de 384 — 32,3% da
 * largura. Mas o arquivo aqui tem margem transparente (100px de cada lado num
 * total de 1312), então a arte visível é só 84,8% da caixa. Para a ilustração
 * sair do tamanho medido, a CAIXA precisa ser maior: 0,323 / 0,848 = 38,1%.
 *
 * A altura não bate exatamente com a do vídeo (sai ~121px contra 138px), e não
 * há o que fazer: o desenho do vídeo é mais alto que largo (proporção 0,899) e
 * este é mais largo que alto (1,027 na arte visível). Forçar as duas medidas
 * esticaria a ilustração — melhor casar a largura e manter o desenho intacto.
 */
const LARGURA_CAIXA = 0.381;
const RAZAO_ARQUIVO = 1312 / 1199;
/** Fração da caixa que é margem transparente embaixo (93 de 1199). */
const MARGEM_INFERIOR = 93 / 1199;

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.vinho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miolo: { alignItems: 'center', gap: espacos.xs },
  // A margem transparente da base do arquivo já cria um respiro até o texto,
  // então o espaçamento aqui desconta essa parte para o intervalo ficar igual
  // ao que se vê na gravação.
  mascote: { marginBottom: espacos.xl * (1 - MARGEM_INFERIOR) - 8 },
  linha1: { fontFamily: familia.black, fontSize: 27, color: '#FFF', letterSpacing: -0.5 },
  linha2: { fontFamily: familia.medio, fontSize: 25, color: '#FFF', letterSpacing: -0.3 },
  // Altura derivada da largura na proporção do arquivo (700:376).
  // Não usar `aspectRatio` aqui: no react-native-web ele é ignorado em
  // <Image> e a altura cai para a natural da imagem (376px).
  assinatura: {
    position: 'absolute',
    bottom: 120,
    width: LOGO_LARGURA,
    height: (LOGO_LARGURA * 376) / 700,
  },
});
