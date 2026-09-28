import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

/**
 * FORMA DE ENTREGA — qual veículo está ativo.
 *
 * O cabeçalho aqui é diferente do resto do app: o botão voltar é um círculo
 * branco com sombra, e ao lado dele vem um "eyebrow" em caixa alta com o
 * título grande embaixo. Vale reparar que o app de referência usa três padrões
 * de cabeçalho distintos conforme a profundidade da tela — barra simples nas
 * abas, título centralizado em caixa alta nas telas de dado, e este aqui.
 */
export default function TelaVeiculo() {
  const router = useRouter();
  const { entregador } = useEntregador();

  const ehMoto = entregador.veiculo === 'Moto';

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']}>
        <View style={estilos.cabecalho}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [estilos.voltar, pressed && estilos.pressionado]}
          >
            <Ionicons name="arrow-back" size={21} color={cores.texto} />
          </Pressable>
          <View>
            <Text style={estilos.sobrancelha}>Forma de entrega</Text>
            <Text style={estilos.titulo}>Veículo ativo</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.subtitulo}>{entregador.veiculo}</Text>
        <Text style={estilos.explicacao}>
          Esta é a sua forma de entrega ativa no momento. Toque em "Forma atual" para trocar
          entre moto e bicicleta.
        </Text>

        {/* Cartão selecionado: borda rosada e um selo de confirmação à direita. */}
        <View style={estilos.cartaoAtivo}>
          <View style={estilos.ilustracao}>
            <Ionicons
              name={ehMoto ? 'bicycle' : 'bicycle-outline'}
              size={26}
              color={cores.vermelho}
            />
          </View>
          <View style={estilos.textos}>
            <Text style={estilos.nomeVeiculo}>{entregador.veiculo}</Text>
            <Text style={estilos.detalhe}>
              {ehMoto
                ? 'Entrega com moto, placa e CNH vinculadas.'
                : 'Entrega com bicicleta, sem placa nem CNH.'}
            </Text>
          </View>
          <View style={estilos.selo}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        </View>

        {/* Segunda opção: é por aqui que se troca moto por bicicleta. */}
        <Linha
          icone="swap-horizontal"
          rotulo="Forma atual"
          valor={entregador.veiculo}
          fundoIcone={cores.vermelho}
          corIcone="#FFF"
          onPress={() => router.push('/forma-entrega')}
        />
        {/* Único ponto de edição do modelo e da placa. */}
        <Linha
          icone="bicycle"
          rotulo="Cadastro"
          valor={
            ehMoto ? `${entregador.modelo} • ${entregador.placa}` : 'Não exigido para bicicleta'
          }
          fundoIcone="#F7C9CF"
          corIcone={cores.vermelho}
          onPress={() => router.push('/cadastro-veiculo')}
        />
      </ScrollView>
    </View>
  );
}

/**
 * Linha de dado. Com `onPress` ela vira botão e ganha o chevron — sem ele,
 * ninguém descobre que dá para tocar.
 */
function Linha({
  icone,
  rotulo,
  valor,
  fundoIcone,
  corIcone,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
  fundoIcone: string;
  corIcone: string;
  onPress?: () => void;
}) {
  const conteudo = (
    <>
      <View style={[estilos.caixaIcone, { backgroundColor: fundoIcone }]}>
        <Ionicons name={icone} size={18} color={corIcone} />
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.rotulo}>{rotulo}</Text>
        <Text style={estilos.valor}>{valor}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={17} color={cores.textoTerciario} />}
    </>
  );

  if (!onPress) return <View style={estilos.cartao}>{conteudo}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.cartaoPressionado]}
    >
      {conteudo}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    paddingHorizontal: espacos.lg,
    paddingBottom: espacos.lg,
  },
  voltar: {
    width: 40,
    height: 40,
    borderRadius: raios.circulo,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra(1),
  },
  sobrancelha: { ...fontes.sobrancelha, fontSize: 10, color: cores.textoSecundario },
  titulo: { ...fontes.display, color: cores.texto },
  conteudo: { paddingHorizontal: espacos.lg, paddingBottom: espacos.xxl, gap: espacos.md },
  subtitulo: { fontFamily: familia.bold, fontSize: 17, color: cores.texto },
  explicacao: {
    ...fontes.legenda,
    color: cores.textoSecundario,
    lineHeight: 20,
    marginTop: -espacos.sm,
  },
  cartaoAtivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F3C6CE',
    borderRadius: raios.lg,
    padding: espacos.lg,
  },
  ilustracao: {
    width: 52,
    height: 52,
    borderRadius: raios.md,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selo: {
    width: 22,
    height: 22,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomeVeiculo: { fontFamily: familia.bold, fontSize: 16, color: cores.texto },
  detalhe: { ...fontes.legenda, fontSize: 12, color: cores.textoSecundario },
  cartaoPressionado: { backgroundColor: '#FAFAFA' },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacos.lg,
  },
  caixaIcone: {
    width: 44,
    height: 44,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 1 },
  rotulo: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
  valor: { fontFamily: familia.bold, fontSize: 15, color: cores.texto },
  pressionado: { opacity: 0.7 },
});
