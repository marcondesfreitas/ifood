import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { Rota } from '@/data/rotas';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';
import { moeda } from '@/utils/formato';

type Props = {
  rota: Rota;
  segundos: number;
  onAceitar: () => void;
  onRejeitar: () => void;
};

/**
 * BOTTOM SHEET DA OFERTA DE ROTA.
 *
 * A animação de entrada usa `useNativeDriver: true` porque só mexe em
 * `translateY` e `opacity` — as duas únicas coisas que a thread nativa sabe
 * interpolar sozinha. Isso mantém o deslize a 60fps mesmo com o JavaScript
 * ocupado descontando o cronômetro.
 *
 * O cronômetro NÃO vive aqui: quem desconta os segundos é o
 * EntregadorContext. Este componente só desenha o que recebe.
 */
export default function OfertaSheet({ rota, segundos, onAceitar, onRejeitar }: Props) {
  const insets = useSafeAreaInsets();
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrada]);

  function aceitar() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAceitar();
  }

  function rejeitar() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRejeitar();
  }

  return (
    <Animated.View
      style={[
        estilos.sheet,
        { paddingBottom: Math.max(insets.bottom, espacos.lg) },
        {
          opacity: entrada,
          transform: [
            { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) },
          ],
        },
      ]}
    >
      <View style={estilos.puxador} />

      <View style={estilos.pontos}>
        <Ponto rotulo="Coleta 1" bairro={rota.bairroColeta} />
        <Ponto rotulo="Entrega 1" bairro={rota.bairroEntrega} />
      </View>

      <View style={estilos.enderecos}>
        <View style={estilos.linhaEndereco}>
          <Text style={estilos.rotuloEndereco}>Coleta 1 • Restaurante</Text>
          <Text style={estilos.rotuloEndereco}>Entrega 1</Text>
        </View>
        <View style={estilos.linhaEndereco}>
          <Text style={estilos.valorEndereco}>{rota.restaurante}</Text>
          <Text style={estilos.valorEndereco}>{rota.enderecoEntrega}</Text>
        </View>
      </View>

      <View style={estilos.caixaValor}>
        <Text style={estilos.valor}>{moeda(rota.valor)}</Text>
      </View>

      <View style={estilos.especificacoes}>
        <Especificacao rotulo={`Rota para ${rota.veiculo}`} valor={rota.veiculo} />
        <Especificacao rotulo="Distância total" valor={rota.distancia} />
        <Especificacao rotulo="Tempo aproximado de rota" valor={rota.tempo} />
        <Especificacao rotulo="Possibilidade de devolução" valor={rota.devolucao ? 'Sim' : 'Não'} />
      </View>

      <View style={estilos.botoes}>
        <Pressable
          onPress={rejeitar}
          style={({ pressed }) => [estilos.rejeitar, pressed && estilos.pressionado]}
        >
          <Text style={estilos.textoRejeitar}>Rejeitar</Text>
        </Pressable>
        <Pressable
          onPress={aceitar}
          style={({ pressed }) => [estilos.aceitar, pressed && estilos.pressionado]}
        >
          <Text style={estilos.textoAceitar}>Aceitar</Text>
          <View style={estilos.contador}>
            <Text style={estilos.contadorTexto}>{segundos}</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function Ponto({ rotulo, bairro }: { rotulo: string; bairro: string }) {
  return (
    <View style={estilos.cartaoPonto}>
      <Ionicons name="location-outline" size={17} color={cores.vinho} />
      <View style={estilos.pontoTextos}>
        <Text style={estilos.pontoRotulo}>{rotulo}</Text>
        <Text style={estilos.pontoBairro}>{bairro}</Text>
      </View>
    </View>
  );
}

function Especificacao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.especificacao}>
      <Text style={estilos.especRotulo}>{rotulo}</Text>
      <Text style={estilos.especValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raios.xl,
    borderTopRightRadius: raios.xl,
    paddingHorizontal: espacos.lg,
    paddingTop: espacos.md,
    gap: espacos.lg,
    ...sombra(3),
  },
  puxador: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: raios.circulo,
    backgroundColor: '#D9D9D9',
  },
  pontos: { flexDirection: 'row', gap: espacos.md },
  cartaoPonto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md,
  },
  pontoTextos: { flex: 1 },
  pontoRotulo: { fontFamily: familia.regular, fontSize: 11, color: cores.textoSecundario },
  pontoBairro: { fontFamily: familia.semi, fontSize: 14, color: cores.texto },
  enderecos: { gap: 2 },
  linhaEndereco: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotuloEndereco: { fontFamily: familia.regular, fontSize: 11, color: cores.textoSecundario },
  valorEndereco: { fontFamily: familia.bold, fontSize: 15, color: cores.texto },
  caixaValor: {
    backgroundColor: '#F4F4F4',
    borderRadius: raios.md,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.lg,
  },
  valor: { ...fontes.dinheiro, color: cores.texto },
  especificacoes: { gap: espacos.md + 2 },
  especificacao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  especRotulo: { ...fontes.legenda, color: cores.textoSecundario },
  especValor: { fontFamily: familia.bold, fontSize: 13, color: cores.texto },
  botoes: { flexDirection: 'row', gap: espacos.md },
  rejeitar: {
    flex: 1,
    height: 52,
    borderRadius: raios.sm,
    borderWidth: 1.5,
    borderColor: cores.vinho,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoRejeitar: { fontFamily: familia.bold, fontSize: 15, color: cores.vinho },
  aceitar: {
    flex: 1.6,
    height: 52,
    borderRadius: raios.sm,
    backgroundColor: cores.verde,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
  },
  textoAceitar: { fontFamily: familia.bold, fontSize: 15, color: '#FFF' },
  contador: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 5,
    borderRadius: raios.circulo,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: { fontFamily: familia.bold, fontSize: 12, color: '#FFF' },
  pressionado: { opacity: 0.85 },
});
