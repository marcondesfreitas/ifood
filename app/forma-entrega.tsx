import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEntregador, type TipoVeiculo } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

/**
 * ESCOLHA DA FORMA DE ENTREGA — moto ou bicicleta.
 *
 * Esta tela existe para cumprir uma frase que já estava escrita no app: em
 * "Veículo ativo" o texto diz "para trocar entre moto e bicicleta, abra os
 * dados do veículo" — mas até agora não havia onde trocar.
 *
 * A troca é imediata, sem botão de salvar: tocar já escolhe. Um formulário com
 * dois cartões e um botão "confirmar" seria um passo a mais para uma decisão
 * de duas opções.
 */

type Opcao = {
  tipo: TipoVeiculo;
  icone: keyof typeof Ionicons.glyphMap;
  descricao: string;
  /** O que o cadastro exige para essa forma de entrega. */
  exigencias: string;
};

const OPCOES: Opcao[] = [
  {
    tipo: 'Moto',
    icone: 'bicycle',
    descricao: 'Entrega com moto, placa e CNH vinculadas.',
    exigencias: 'Precisa de modelo, placa e CNH aprovada.',
  },
  {
    tipo: 'Bicicleta',
    icone: 'bicycle-outline',
    descricao: 'Entrega com bicicleta, sem placa nem CNH.',
    exigencias: 'Não exige documento de veículo.',
  },
];

export default function TelaFormaEntrega() {
  const router = useRouter();
  const { cadastro, salvarCadastro } = useEntregador();

  function escolher(tipo: TipoVeiculo) {
    if (tipo === cadastro.tipo) return;
    Haptics.selectionAsync().catch(() => {});
    salvarCadastro({ ...cadastro, tipo });
  }

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
            <Text style={estilos.titulo}>Trocar veículo</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.explicacao}>
          Escolha como você vai entregar. A troca vale a partir da próxima rota — a que estiver
          em andamento não muda.
        </Text>

        {OPCOES.map((o) => {
          const ativa = o.tipo === cadastro.tipo;
          return (
            <Pressable
              key={o.tipo}
              onPress={() => escolher(o.tipo)}
              style={({ pressed }) => [
                estilos.cartao,
                ativa && estilos.cartaoAtivo,
                pressed && !ativa && estilos.cartaoPressionado,
              ]}
            >
              <View style={[estilos.ilustracao, ativa && estilos.ilustracaoAtiva]}>
                <Ionicons
                  name={o.icone}
                  size={26}
                  color={ativa ? cores.vermelho : cores.textoSecundario}
                />
              </View>

              <View style={estilos.textos}>
                <Text style={estilos.nome}>{o.tipo}</Text>
                <Text style={estilos.descricao}>{o.descricao}</Text>
                <Text style={estilos.exigencias}>{o.exigencias}</Text>
              </View>

              {/* Selo cheio quando ativa, círculo vazio quando não — o estado
                  precisa ser legível sem depender só da cor da borda. */}
              {ativa ? (
                <View style={estilos.selo}>
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                </View>
              ) : (
                <View style={estilos.seloVazio} />
              )}
            </Pressable>
          );
        })}

        {cadastro.tipo === 'Bicicleta' && (
          <View style={estilos.nota}>
            <Ionicons name="information-circle-outline" size={17} color={cores.textoSecundario} />
            <Text style={estilos.notaTexto}>
              Como bicicleta não exige documento de veículo, modelo e placa ficam guardados e
              voltam a valer se você escolher moto de novo.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  explicacao: {
    ...fontes.legenda,
    color: cores.textoSecundario,
    lineHeight: 20,
    marginBottom: espacos.xs,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.lg,
    padding: espacos.lg,
  },
  cartaoAtivo: { backgroundColor: '#FFFBFB', borderColor: '#F3C6CE' },
  cartaoPressionado: { backgroundColor: '#FAFAFA' },
  ilustracao: {
    width: 52,
    height: 52,
    borderRadius: raios.md,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ilustracaoAtiva: { backgroundColor: '#FDECEE' },
  textos: { flex: 1, gap: 2 },
  nome: { fontFamily: familia.bold, fontSize: 16, color: cores.texto },
  descricao: { ...fontes.legenda, fontSize: 12, color: cores.textoSecundario },
  exigencias: { fontFamily: familia.medio, fontSize: 11, color: cores.textoTerciario },
  selo: {
    width: 22,
    height: 22,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloVazio: {
    width: 22,
    height: 22,
    borderRadius: raios.circulo,
    borderWidth: 1.5,
    borderColor: '#D6D6D6',
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
    backgroundColor: '#EAEAEA',
    borderRadius: raios.md,
    padding: espacos.lg,
  },
  notaTexto: { flex: 1, ...fontes.legenda, fontSize: 12, color: cores.textoSecundario, lineHeight: 18 },
  pressionado: { opacity: 0.7 },
});
