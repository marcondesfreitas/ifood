import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnelProgresso from '@/components/AnelProgresso';
import Avatar from '@/components/Avatar';
import LinhaLista from '@/components/LinhaLista';
import ModalFoto from '@/components/ModalFoto';
import { useEntregador } from '@/state/EntregadorContext';
import { mesEAno } from '@/utils/datas';
import { useFotoPerfil } from '@/state/FotoPerfilContext';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

/**
 * PERFIL — abre POR CIMA das abas.
 *
 * Repare que este arquivo está em `app/`, e não em `app/(tabs)/`: por isso ele
 * entra na pilha principal e cobre a barra de abas, exatamente como no app de
 * referência. Onde o arquivo mora define como a tela navega.
 */
export default function TelaPerfil() {
  const router = useRouter();
  const { entregador, rotasFinalizadas } = useEntregador();
  const { erro } = useFotoPerfil();
  const [editandoFoto, setEditandoFoto] = useState(false);

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.marca}>iFood para entregadores</Text>
        <View style={estilos.voltar} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.tituloTela}>Perfil</Text>

        <View style={estilos.identidade}>
          <View style={estilos.identidadeTextos}>
            <Text style={estilos.nome}>{entregador.nome}</Text>
            <View style={estilos.selos}>
              <View style={estilos.seloPrincipal}>
                <Text style={estilos.seloPrincipalTexto}>{entregador.modalidade}</Text>
              </View>
              <View style={estilos.seloSecundario}>
                <Text style={estilos.seloSecundarioTexto}>{entregador.plano}</Text>
              </View>
            </View>
            <Text style={estilos.veiculo}>Veículo: {entregador.veiculo}</Text>
          </View>
          <Pressable
            onPress={() => setEditandoFoto(true)}
            style={({ pressed }) => [estilos.foto, pressed && estilos.fotoPressionada]}
          >
            <Avatar tamanho={76} formato="quadrado" />
            {/* Selo de câmera: sem ele, ninguém descobre que a foto é tocável. */}
            <View style={estilos.seloCamera}>
              <Ionicons name="camera" size={13} color="#FFF" />
            </View>
          </Pressable>
        </View>

        {erro && (
          <View style={estilos.erro}>
            <Ionicons name="alert-circle" size={16} color={cores.vermelho} />
            <Text style={estilos.erroTexto}>{erro}</Text>
          </View>
        )}

        <View style={estilos.evolucao}>
          <Text style={estilos.tituloEvolucao}>Minha evolução</Text>
          <Text style={estilos.periodo}>Dados de {mesEAno()}</Text>
        </View>

        <AnelProgresso percentual={entregador.taxaFinalizacao} rotulo="Taxa de finalização" />

        <View style={estilos.dica}>
          <Ionicons name="information-circle-outline" size={18} color={cores.textoSecundario} />
          <Text style={estilos.dicaTexto}>
            {rotasFinalizadas === 0
              ? 'Ter um bom histórico de rotas finalizadas vai te ajudar a receber mais pedidos.'
              : `Você finalizou ${rotasFinalizadas} ${rotasFinalizadas === 1 ? 'rota' : 'rotas'}. Continue assim para receber mais pedidos.`}
          </Text>
        </View>

        <View style={estilos.lista}>
          <LinhaLista icone="document-text-outline" titulo="Dados de cadastro" />
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
        </View>
      </ScrollView>

      <ModalFoto visivel={editandoFoto} aoFechar={() => setEditandoFoto(false)} />
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
  marca: {
    fontFamily: familia.black,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: cores.vinho,
  },
  conteudo: { padding: espacos.lg, gap: espacos.lg, paddingBottom: espacos.xxl },
  tituloTela: { fontFamily: familia.black, fontSize: 24, color: cores.vinho, letterSpacing: -0.5 },
  identidade: { flexDirection: 'row', alignItems: 'flex-start', gap: espacos.lg },
  identidadeTextos: { flex: 1, gap: espacos.sm },
  nome: { ...fontes.titulo, color: cores.texto },
  selos: { flexDirection: 'row', gap: espacos.sm },
  seloPrincipal: {
    backgroundColor: cores.vinho,
    borderRadius: raios.circulo,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.xs + 1,
  },
  seloPrincipalTexto: { fontFamily: familia.bold, fontSize: 12, color: '#FFF' },
  seloSecundario: {
    backgroundColor: '#E8E8E8',
    borderRadius: raios.circulo,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.xs + 1,
  },
  seloSecundarioTexto: { fontFamily: familia.bold, fontSize: 12, color: cores.textoSecundario },
  veiculo: { ...fontes.legenda, color: cores.textoSecundario },
  foto: { width: 76, height: 76 },
  fotoPressionada: { opacity: 0.8 },
  seloCamera: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.fundo,
  },
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.vermelhoClaro,
    borderRadius: raios.sm,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md,
  },
  erroTexto: { flex: 1, ...fontes.legenda, color: cores.texto },
  evolucao: { gap: 2 },
  tituloEvolucao: { fontFamily: familia.bold, fontSize: 19, color: cores.vinho },
  periodo: { ...fontes.legenda, color: cores.textoSecundario },
  dica: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
    backgroundColor: '#EAEAEA',
    borderRadius: raios.md,
    padding: espacos.lg,
  },
  dicaTexto: { flex: 1, ...fontes.legenda, color: cores.textoSecundario, lineHeight: 19 },
  lista: { gap: espacos.sm },
});
