import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes, raios } from '@/theme';

/**
 * DOCUMENTOS — situação do veículo e da CNH.
 *
 * Tela de leitura pura: rótulo pequeno em cima, valor grande embaixo, sem
 * caixa nenhuma em volta. O peso da informação vem só da tipografia — é o que
 * deixa a tela leve mesmo sendo uma lista de dados burocráticos.
 */
export default function TelaDocumentos() {
  const router = useRouter();
  const { entregador } = useEntregador();

  const ehMoto = entregador.veiculo === 'Moto';

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Documentos</Text>
        <View style={estilos.voltar} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Dado rotulo="Veículo" valor={ehMoto ? 'MOTOCICLETA' : 'BICICLETA'} />
        {/*
          Bicicleta não tem placa nem exige CNH — mostrar "APROVADA" aqui seria
          simplesmente falso.
        */}
        <Dado
          rotulo="Placa do veículo"
          valor={ehMoto ? entregador.placa : 'Não se aplica'}
        />
        <Dado
          rotulo="Foto da CNH"
          valor={ehMoto ? 'APROVADA' : 'Não exigida'}
          cor={ehMoto ? cores.verde : undefined}
        />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={estilos.rodape}>
        <Pressable
          onPress={() => router.push('/veiculo')}
          style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
        >
          <Text style={estilos.botaoTexto}>Abrir dados do veículo</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Dado({ rotulo, valor, cor }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <View style={estilos.dado}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={[estilos.valor, cor ? { color: cor, fontFamily: familia.bold } : null]}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.superficie,
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.md,
  },
  voltar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  barraTitulo: { ...fontes.barra, color: cores.texto },
  conteudo: { padding: espacos.lg, gap: espacos.xl, paddingTop: espacos.xl },
  dado: { gap: espacos.xs + 1 },
  rotulo: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
  valor: { fontFamily: familia.regular, fontSize: 19, color: cores.texto },
  rodape: { paddingHorizontal: espacos.lg, paddingTop: espacos.md },
  botao: {
    height: 52,
    borderRadius: raios.sm,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacos.md,
  },
  botaoTexto: { fontFamily: familia.bold, fontSize: 15, color: '#FFF' },
  pressionado: { opacity: 0.85 },
});
