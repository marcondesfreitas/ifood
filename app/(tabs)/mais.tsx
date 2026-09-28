import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LinhaLista from '@/components/LinhaLista';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes } from '@/theme';

// LayoutAnimation precisa ser habilitado manualmente no Android da arquitetura antiga.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * MAIS — o menu de acessos rápidos.
 *
 * ANIMAÇÃO — `LayoutAnimation`.
 * Diferente do `Animated` (onde você controla cada valor), aqui você só avisa:
 * "a próxima mudança de layout deve ser animada". O React Native calcula as
 * posições antes e depois e interpola sozinho. É a forma mais barata de animar
 * uma lista que expande ou colapsa.
 */
export default function TelaMais() {
  const router = useRouter();
  const { sair } = useEntregador();
  const [fechadas, setFechadas] = useState<string[]>([]);

  function alternarSecao(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFechadas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : atual.concat(id)
    );
  }

  function sairDaConta() {
    sair();
    router.replace('/');
  }

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Mais</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>Acessos rápidos</Text>
          <Text style={estilos.legenda}>Use atalhos pra acessar as ferramentas do app</Text>
        </View>

        <Secao
          id="entregas"
          titulo="Pras suas entregas"
          legenda="Acompanhe seu desempenho e turbine suas entregas"
          fechada={fechadas.includes('entregas')}
          onAlternar={alternarSecao}
        >
          <LinhaLista icone="trending-up" corIcone={cores.roxo} titulo="Score" />
          <LinhaLista
            icone="bicycle"
            corIcone={cores.azul}
            titulo="Forma de entrega"
            onPress={() => router.push('/veiculo')}
          />
          <LinhaLista
            icone="exit-outline"
            corIcone={cores.vermelho}
            titulo="Saída da Conta"
            onPress={sairDaConta}
          />
        </Secao>

        <Secao
          id="aproveitar"
          titulo="Pra você aproveitar"
          legenda="Confira o que o iFood oferece pra você"
          fechada={fechadas.includes('aproveitar')}
          onAlternar={alternarSecao}
        >
          <LinhaLista
            icone="gift"
            corIcone={cores.vermelho}
            titulo="Vantagens"
            onPress={() => router.push('/vantagens')}
          />
          <LinhaLista icone="bicycle" corIcone={cores.verde} titulo="iFood Pedal" />
        </Secao>

        <Secao
          id="dados"
          titulo="Pra atualizar dados"
          legenda="Veja seus dados atuais e atualize se precisar"
          fechada={fechadas.includes('dados')}
          onAlternar={alternarSecao}
        >
          <LinhaLista
            icone="person-outline"
            titulo="Dados de cadastro"
            onPress={() => router.push('/perfil')}
          />
          <LinhaLista
            icone="call-outline"
            titulo="Contato de emergência"
            onPress={() => router.push('/contato')}
          />
          <LinhaLista
            icone="cash-outline"
            titulo="Repasses"
            onPress={() => router.push('/repasse')}
          />
          <LinhaLista
            icone="document-text-outline"
            titulo="Documentos"
            onPress={() => router.push('/documentos')}
          />
          <LinhaLista
            icone="car-outline"
            titulo="Dados do veículo"
            onPress={() => router.push('/veiculo')}
          />
        </Secao>
      </ScrollView>
    </View>
  );
}

function Secao({
  id,
  titulo,
  legenda,
  fechada,
  onAlternar,
  children,
}: {
  id: string;
  titulo: string;
  legenda: string;
  fechada: boolean;
  onAlternar: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <View style={estilos.secao}>
      <Pressable onPress={() => onAlternar(id)} style={estilos.secaoTopo}>
        <View style={estilos.secaoTextos}>
          <Text style={estilos.secaoTitulo}>{titulo}</Text>
          <Text style={estilos.secaoLegenda}>{legenda}</Text>
        </View>
        <Ionicons
          name={fechada ? 'chevron-down' : 'chevron-up'}
          size={18}
          color={cores.textoSecundario}
        />
      </Pressable>
      {!fechada && <View style={estilos.secaoItens}>{children}</View>}
    </View>
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
  conteudo: { padding: espacos.lg, gap: espacos.xl, paddingBottom: espacos.xxl },
  cabecalho: { gap: 2 },
  titulo: { ...fontes.display, color: cores.texto },
  legenda: { ...fontes.legenda, color: cores.textoSecundario },
  secao: { gap: espacos.md },
  secaoTopo: { flexDirection: 'row', alignItems: 'center', gap: espacos.md },
  secaoTextos: { flex: 1, gap: 1 },
  secaoTitulo: { ...fontes.secao, color: cores.texto },
  secaoLegenda: { ...fontes.legenda, fontSize: 12, color: cores.textoSecundario },
  secaoItens: { gap: espacos.sm },
});
