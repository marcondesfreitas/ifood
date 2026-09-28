import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BannerPromo from '@/components/BannerPromo';
import BarraEntregador from '@/components/BarraEntregador';
import MapaFundo from '@/components/MapaFundo';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, raios, sombra } from '@/theme';
import { moeda } from '@/utils/formato';

/**
 * INÍCIO — a tela do mapa.
 *
 * Tudo aqui flutua SOBRE o mapa: o mapa é o fundo absoluto e os controles são
 * camadas por cima, na ordem em que aparecem no JSX. Quem vem por último fica
 * mais perto do usuário — por isso o sheet da oferta é o último de todos.
 */
export default function TelaInicio() {
  const router = useRouter();
  const { disponivel, alternarDisponibilidade, rotaAtiva, finalizarRota } = useEntregador();

  return (
    <View style={estilos.tela}>
      <MapaFundo />

      <SafeAreaView edges={['top']} style={estilos.topo} pointerEvents="box-none">
        <BarraEntregador
          disponivel={disponivel}
          onAlternar={alternarDisponibilidade}
          onAbrirPerfil={() => router.push('/perfil')}
        />

        <Pressable style={estilos.pontosApoio}>
          <Ionicons name="heart" size={17} color="#141414" />
          <Text style={estilos.pontosApoioTexto}>Pontos de apoio</Text>
        </Pressable>
      </SafeAreaView>

      {/* Camada de baixo: recentralizar + banner. `box-none` deixa o toque
          passar para o mapa nas áreas vazias. */}
      <View style={estilos.rodape} pointerEvents="box-none">
        <Pressable style={estilos.recentralizar}>
          <Ionicons name="locate" size={23} color={cores.vinho} />
        </Pressable>

        {rotaAtiva ? (
          <Pressable onPress={finalizarRota} style={estilos.rotaAtiva}>
            <View style={estilos.rotaTextos}>
              <Text style={estilos.rotaRotulo}>Rota em andamento · {rotaAtiva.restaurante}</Text>
              <Text style={estilos.rotaValor}>{moeda(rotaAtiva.valor)}</Text>
            </View>
            <View style={estilos.rotaBotao}>
              <Text style={estilos.rotaBotaoTexto}>Finalizar</Text>
            </View>
          </Pressable>
        ) : (
          <BannerPromo />
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { paddingHorizontal: espacos.md, gap: espacos.md },
  pontosApoio: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.superficie,
    borderRadius: raios.circulo,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
    ...sombra(2),
  },
  pontosApoioTexto: { fontFamily: familia.bold, fontSize: 14, color: cores.texto },
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: espacos.md,
    gap: espacos.md,
  },
  recentralizar: {
    alignSelf: 'flex-end',
    width: 46,
    height: 46,
    borderRadius: raios.circulo,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra(2),
  },
  rotaAtiva: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.preto,
    borderRadius: raios.md,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
  },
  rotaTextos: { gap: 2 },
  rotaRotulo: { fontFamily: familia.medio, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  rotaValor: { fontFamily: familia.black, fontSize: 20, color: '#FFF', letterSpacing: -0.5 },
  rotaBotao: {
    backgroundColor: cores.verde,
    borderRadius: raios.sm,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
  },
  rotaBotaoTexto: { fontFamily: familia.bold, fontSize: 14, color: '#FFF' },
});
