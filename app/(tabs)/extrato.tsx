import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';
import { faixaDaSemana } from '@/utils/datas';
import { moeda } from '@/utils/formato';

/**
 * EXTRATO — os números da semana.
 *
 * Tudo aqui é derivado do estado global: enquanto nenhuma rota for finalizada,
 * a tela fica legitimamente zerada, com o estado vazio no lugar da lista.
 * Estado vazio não é "tela quebrada" — é um estado de primeira classe, e
 * merece o mesmo cuidado de design que a tela cheia.
 */
export default function TelaExtrato() {
  const { ganhos, minutosEmRota, rotasFinalizadas } = useEntregador();

  const horas = minutosEmRota === 0 ? '0h' : `${Math.floor(minutosEmRota / 60)}h${String(minutosEmRota % 60).padStart(2, '0')}`;

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} />
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.sobrancelha}>Ganhos</Text>
          <Text style={estilos.titulo}>Extrato</Text>
        </View>

        <View style={estilos.semana}>
          <Pressable style={estilos.seta}>
            <Ionicons name="chevron-back" size={18} color={cores.textoSecundario} />
          </Pressable>
          <View style={estilos.semanaTextos}>
            <Text style={estilos.semanaRotulo}>Esta semana</Text>
            <Text style={estilos.semanaValor}>{faixaDaSemana()}</Text>
          </View>
          <Pressable style={estilos.seta}>
            <Ionicons name="chevron-forward" size={18} color={cores.textoSecundario} />
          </Pressable>
        </View>

        <View style={estilos.cartaoPreto}>
          <View style={estilos.linhaPreto}>
            <Text style={estilos.rotuloPreto}>Seus ganhos</Text>
            <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.85)" />
          </View>
          <Text style={estilos.ganhos}>{moeda(ganhos)}</Text>
          <Text style={estilos.legendaPreto}>Acompanhe aqui o resumo dos seus ganhos.</Text>
        </View>

        <View style={estilos.grade}>
          <Metrica icone="time-outline" rotulo="Tempo em rota" valor={horas} />
          <Metrica icone="navigate-outline" rotulo="Rotas finalizadas" valor={String(rotasFinalizadas)} />
        </View>

        <View style={estilos.linhaSecao}>
          <Text style={estilos.tituloSecao}>Lançamentos</Text>
          <Pressable>
            <Text style={estilos.link}>Ver repasses</Text>
          </Pressable>
        </View>

        {rotasFinalizadas === 0 ? (
          <View style={estilos.vazio}>
            <View style={estilos.vazioIcone}>
              <Ionicons name="receipt-outline" size={26} color={cores.vinho} />
            </View>
            <Text style={estilos.vazioTitulo}>Nenhum lançamento por enquanto</Text>
            <Text style={estilos.vazioTexto}>
              Quando uma rota for finalizada, os valores aparecerão aqui.
            </Text>
          </View>
        ) : (
          <View style={estilos.lancamento}>
            <View style={estilos.lancamentoIcone}>
              <Ionicons name="bag-handle-outline" size={18} color={cores.vinho} />
            </View>
            <View style={estilos.lancamentoTextos}>
              <Text style={estilos.lancamentoTitulo}>
                {rotasFinalizadas} {rotasFinalizadas === 1 ? 'rota finalizada' : 'rotas finalizadas'}
              </Text>
              <Text style={estilos.lancamentoLegenda}>Crédito na conta em até 2 dias úteis</Text>
            </View>
            <Text style={estilos.lancamentoValor}>{moeda(ganhos)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Metrica({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={estilos.metrica}>
      <Ionicons name={icone} size={20} color={cores.vinho} />
      <Text style={estilos.metricaRotulo}>{rotulo}</Text>
      <Text style={estilos.metricaValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacos.lg, gap: espacos.lg, paddingBottom: espacos.xxl },
  cabecalho: { gap: 2 },
  sobrancelha: { ...fontes.sobrancelha, color: cores.vinho },
  titulo: { ...fontes.display, color: cores.texto },
  semana: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacos.md,
    ...sombra(1),
  },
  seta: { width: 32, alignItems: 'center' },
  semanaTextos: { flex: 1, alignItems: 'center' },
  semanaRotulo: { fontFamily: familia.regular, fontSize: 11, color: cores.textoTerciario },
  semanaValor: { fontFamily: familia.bold, fontSize: 15, color: cores.texto },
  cartaoPreto: {
    backgroundColor: cores.pretoCartao,
    borderRadius: raios.lg,
    padding: espacos.xl,
    gap: espacos.xs,
  },
  linhaPreto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotuloPreto: { fontFamily: familia.semi, fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  ganhos: { fontFamily: familia.black, fontSize: 40, color: '#FFF', letterSpacing: -1.4 },
  legendaPreto: { fontFamily: familia.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  grade: { flexDirection: 'row', gap: espacos.md },
  metrica: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacos.lg,
    gap: espacos.sm,
    ...sombra(1),
  },
  metricaRotulo: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
  metricaValor: { fontFamily: familia.black, fontSize: 24, color: cores.texto, letterSpacing: -0.6 },
  linhaSecao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tituloSecao: { ...fontes.secao, color: cores.texto },
  link: { fontFamily: familia.bold, fontSize: 13, color: cores.vinho },
  vazio: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    paddingVertical: espacos.xxl,
    paddingHorizontal: espacos.xl,
    alignItems: 'center',
    gap: espacos.md,
    ...sombra(1),
  },
  vazioIcone: {
    width: 56,
    height: 56,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelhoClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazioTitulo: { fontFamily: familia.semi, fontSize: 15, color: cores.texto },
  vazioTexto: {
    ...fontes.legenda,
    fontSize: 12,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  lancamento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacos.lg,
    ...sombra(1),
  },
  lancamentoIcone: {
    width: 38,
    height: 38,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelhoClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lancamentoTextos: { flex: 1 },
  lancamentoTitulo: { fontFamily: familia.semi, fontSize: 14, color: cores.texto },
  lancamentoLegenda: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
  lancamentoValor: { fontFamily: familia.bold, fontSize: 15, color: cores.verde },
});
