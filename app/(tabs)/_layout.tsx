import { Image, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, familia, raios } from '@/theme';

type Aba = { nome: string; titulo: string; icone: number };

/**
 * Os ícones são máscaras: PNG com o desenho em branco sólido sobre
 * transparência (geradas por `scripts/icones-abas.js`). A cor vem do
 * `tintColor` em tempo de render — um arquivo por aba serve aos dois estados,
 * em vez de um arquivo cinza e outro vermelho para cada uma.
 */
const ABAS: Aba[] = [
  { nome: 'index', titulo: 'Início', icone: require('../../assets/abas/inicio.png') },
  { nome: 'extrato', titulo: 'Extrato', icone: require('../../assets/abas/extrato.png') },
  { nome: 'ajuda', titulo: 'Ajuda', icone: require('../../assets/abas/ajuda.png') },
  { nome: 'mais', titulo: 'Mais', icone: require('../../assets/abas/mais.png') },
];

/**
 * NAVEGAÇÃO POR ABAS.
 *
 * A pasta `(tabs)` está entre parênteses: isso é um "grupo de rotas" do Expo
 * Router. O nome da pasta NÃO aparece na URL — serve só para organizar e
 * aplicar este layout a todas as telas de dentro.
 *
 * Dois detalhes vieram do vídeo e não existem prontos no React Navigation:
 * 1. a barrinha vermelha ACIMA do ícone ativo — desenhada junto com o ícone;
 * 2. o rótulo ativo em negrito. `tabBarLabelStyle` é um estilo só, igual para
 *    os dois estados, então o rótulo é renderizado à mão para poder trocar o
 *    peso da fonte conforme `focused`.
 */
/**
 * Altura da barra sem contar a faixa de gestos do sistema.
 *
 * 70 = 10 de topo + 48 de conteúdo (ícone de 24 + rótulo) + 12 de respiro.
 * Ao mexer no respiro, mexa aqui também: senão a área útil encolhe e o rótulo
 * fica espremido contra o ícone.
 */
const ALTURA_BARRA = 70;
/** Respiro entre o rótulo e a borda inferior, quando não há faixa de gestos. */
const RESPIRO = 12;

export default function LayoutAbas() {
  const insets = useSafeAreaInsets();

  /**
   * A faixa de gestos precisa ser SOMADA à barra, não dividida com ela.
   *
   * Com altura fixa e `paddingBottom` fixo, o conteúdo encostava no indicador
   * inferior do aparelho — os ícones ficavam colados na beira. Na web o inset
   * é zero, então o problema só aparecia no celular.
   *
   * Somando o inset à altura E ao padding, os ícones sobem exatamente a altura
   * da faixa, e a barra continua com a mesma área útil em qualquer aparelho.
   */
  const alturaTotal = ALTURA_BARRA + insets.bottom;
  const respiroInferior = RESPIRO + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.vermelho,
        tabBarInactiveTintColor: cores.abaInativa,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
          height: alturaTotal,
          paddingBottom: respiroInferior,
          paddingTop: 10,
        },
      }}
    >
      {ABAS.map((aba) => (
        <Tabs.Screen
          key={aba.nome}
          name={aba.nome}
          options={{
            title: aba.titulo,
            tabBarIcon: ({ color, focused }) => (
              <View style={estilos.icone}>
                {focused && <View style={estilos.indicador} />}
                <Image source={aba.icone} style={[estilos.desenho, { tintColor: color }]} />
              </View>
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text style={[estilos.rotulo, { color }, focused && estilos.rotuloAtivo]}>
                {aba.titulo}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  icone: { alignItems: 'center', justifyContent: 'center' },
  desenho: { width: 24, height: 24, resizeMode: 'contain' },
  indicador: {
    position: 'absolute',
    // Sobe até encostar na borda superior da barra (paddingTop 10 + a borda).
    top: -11,
    width: 28,
    height: 3,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelho,
  },
  rotulo: { fontFamily: familia.medio, fontSize: 12 },
  rotuloAtivo: { fontFamily: familia.bold },
});
