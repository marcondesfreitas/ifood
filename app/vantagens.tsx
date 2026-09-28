import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

/**
 * VANTAGENS — os benefícios oferecidos ao entregador.
 *
 * A tela é uma vitrine: um cartão promocional no topo, dois destaques lado a
 * lado e duas listas temáticas. As cores dos ícones NÃO vêm do design system
 * — cada benefício tem seu próprio par (tom pastel de fundo + tom forte no
 * glifo), medido na gravação. São valores de uso único; jogá-los nos tokens
 * globais só poluiria o tema.
 */

type Item = {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  fundo: string;
  cor: string;
};

const DIA_A_DIA: Item[] = [
  {
    icone: 'phone-portrait-outline',
    titulo: 'Plano de celular',
    descricao: 'Pacotes de dados com preços especiais',
    fundo: '#F8ECDF',
    cor: '#E07B39',
  },
  {
    icone: 'shield-checkmark-outline',
    titulo: 'Seguro moto',
    descricao: 'Proteção para sua moto com condições exclusivas',
    fundo: '#FBF0DC',
    cor: '#C79A2E',
  },
  {
    icone: 'location-outline',
    titulo: 'Pontos de apoio',
    descricao: 'Espaços para descansar e recarregar as baterias',
    fundo: '#E5F2FE',
    cor: '#3B7DD8',
  },
  {
    icone: 'bicycle-outline',
    titulo: 'iFood Pedal',
    descricao: 'Descontos no aluguel de bicicletas',
    fundo: '#E1FBE8',
    cor: '#2FA35C',
  },
];

const SAUDE: Item[] = [
  {
    icone: 'heart-circle-outline',
    titulo: 'Seguro pessoal',
    descricao: 'Coberturas para você e sua família',
    fundo: '#FCE2F3',
    cor: '#D4479A',
  },
  {
    icone: 'heart-outline',
    titulo: 'Assistência saúde',
    descricao: 'Consultas, exames e desconto em medicamentos',
    fundo: '#FBDFEF',
    cor: '#D4479A',
  },
  {
    icone: 'school-outline',
    titulo: 'Educação',
    descricao: 'Cursos e oportunidades para continuar aprendendo',
    fundo: '#F5DEFD',
    cor: '#9B48D0',
  },
];

export default function TelaVantagens() {
  const router = useRouter();

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Vantagens</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>Encontre aqui vantagens pra você</Text>
          <Text style={estilos.subtitulo}>Aproveite as opções disponíveis.</Text>
        </View>

        {/* Cartão promocional: gradiente da esquerda (mais fechado) para a
            direita (mais rosado), como na gravação. */}
        <LinearGradient
          colors={['#C9134F', '#E05C86']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={estilos.promo}
        >
          <View style={estilos.promoTextos}>
            <Text style={estilos.promoSobrancelha}>Delivery de vantagens</Text>
            <Text style={estilos.promoTitulo}>Benefícios exclusivos{'\n'}pra quem entrega</Text>
            <Pressable
              style={({ pressed }) => [estilos.promoBotao, pressed && estilos.pressionado]}
            >
              <Text style={estilos.promoBotaoTexto}>Quero aproveitar</Text>
            </Pressable>
          </View>

          {/* Carta inclinada com a marca — o mesmo enfeite da peça original. */}
          <View style={estilos.promoArte}>
            <Image source={require('../assets/icone.png')} style={estilos.promoMarca} />
          </View>
        </LinearGradient>

        <View style={estilos.tituloSecaoLinha}>
          <Ionicons name="flame" size={17} color="#E0447A" />
          <Text style={estilos.tituloSecao}>Em alta</Text>
        </View>

        <View style={estilos.destaques}>
          <Destaque
            etiqueta="Exclusivo"
            corEtiqueta="#8B3FD8"
            fundo="#EBE1F6"
            icone="storefront-outline"
            corIcone="#7B35C9"
            titulo="Loja do entregador"
            descricao="Bags, jaquetas e itens para o dia a dia"
          />
          <Destaque
            etiqueta="Novidade"
            corEtiqueta="#1F9E5A"
            fundo="#DFF5E9"
            icone="construct-outline"
            corIcone="#1F9E5A"
            titulo="Manutenção"
            descricao="Economia em óleo, pneus e serviços"
          />
        </View>

        <Text style={estilos.tituloSecao}>Dia a dia</Text>
        <View style={estilos.lista}>
          {DIA_A_DIA.map((i) => (
            <Linha key={i.titulo} {...i} />
          ))}
        </View>

        <Text style={estilos.tituloSecao}>Saúde e desenvolvimento</Text>
        <View style={estilos.lista}>
          {SAUDE.map((i) => (
            <Linha key={i.titulo} {...i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Destaque({
  etiqueta,
  corEtiqueta,
  fundo,
  icone,
  corIcone,
  titulo,
  descricao,
}: {
  etiqueta: string;
  corEtiqueta: string;
  fundo: string;
  icone: keyof typeof Ionicons.glyphMap;
  corIcone: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Pressable style={({ pressed }) => [estilos.destaque, pressed && estilos.pressionado]}>
      <Text style={[estilos.etiqueta, { color: corEtiqueta }]}>{etiqueta}</Text>
      <View style={[estilos.destaqueArte, { backgroundColor: fundo }]}>
        <Ionicons name={icone} size={32} color={corIcone} />
      </View>
      <Text style={estilos.destaqueTitulo}>{titulo}</Text>
      <Text style={estilos.destaqueDescricao}>{descricao}</Text>
    </Pressable>
  );
}

function Linha({ icone, titulo, descricao, fundo, cor }: Item) {
  return (
    <Pressable style={({ pressed }) => [estilos.linha, pressed && estilos.linhaPressionada]}>
      <View style={[estilos.linhaIcone, { backgroundColor: fundo }]}>
        <Ionicons name={icone} size={18} color={cor} />
      </View>
      <View style={estilos.linhaTextos}>
        <Text style={estilos.linhaTitulo}>{titulo}</Text>
        <Text style={estilos.linhaDescricao}>{descricao}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={cores.textoTerciario} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.md,
    gap: espacos.sm,
  },
  voltar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  barraTitulo: { fontFamily: familia.bold, fontSize: 15, color: cores.texto },
  conteudo: { padding: espacos.lg, gap: espacos.lg, paddingBottom: espacos.xxl },
  cabecalho: { gap: 2 },
  titulo: { fontFamily: familia.black, fontSize: 19, color: cores.texto, letterSpacing: -0.3 },
  subtitulo: { ...fontes.legenda, color: cores.textoSecundario },

  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: raios.lg,
    padding: espacos.lg,
    overflow: 'hidden',
  },
  promoTextos: { flex: 1, gap: espacos.sm },
  promoSobrancelha: {
    fontFamily: familia.bold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  promoTitulo: { fontFamily: familia.black, fontSize: 17, color: '#FFF', lineHeight: 22 },
  promoBotao: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: raios.circulo,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.sm + 1,
    marginTop: espacos.xs,
  },
  promoBotaoTexto: { fontFamily: familia.bold, fontSize: 13, color: '#A50E42' },
  promoArte: {
    width: 76,
    height: 76,
    borderRadius: raios.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  promoMarca: { width: 46, height: 46, borderRadius: 10 },

  tituloSecaoLinha: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  tituloSecao: { ...fontes.secao, color: cores.texto },

  destaques: { flexDirection: 'row', gap: espacos.md },
  destaque: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.sm,
    ...sombra(1),
  },
  etiqueta: { fontFamily: familia.bold, fontSize: 11 },
  destaqueArte: {
    height: 74,
    borderRadius: raios.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destaqueTitulo: { fontFamily: familia.bold, fontSize: 14, color: cores.texto },
  destaqueDescricao: {
    fontFamily: familia.regular,
    fontSize: 11,
    lineHeight: 15,
    color: cores.textoSecundario,
  },

  lista: { gap: espacos.sm, marginTop: -espacos.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacos.md + 2,
    ...sombra(1),
  },
  linhaPressionada: { backgroundColor: '#FAFAFA' },
  linhaIcone: {
    width: 34,
    height: 34,
    borderRadius: raios.circulo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaTextos: { flex: 1, gap: 1 },
  linhaTitulo: { fontFamily: familia.bold, fontSize: 14, color: cores.texto },
  linhaDescricao: { fontFamily: familia.regular, fontSize: 11, color: cores.textoSecundario },

  pressionado: { opacity: 0.85 },
});
