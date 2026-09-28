import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFotoPerfil } from '@/state/FotoPerfilContext';
import { cores, espacos, familia, raios } from '@/theme';

type Props = {
  visivel: boolean;
  aoFechar: () => void;
};

/**
 * Folha de opções da foto de perfil.
 *
 * Poderia ser um `Alert.alert` com botões — dá menos código. Mas o Alert na web
 * vira uma caixa do navegador, sem nada do visual do app, e a demonstração
 * ficaria feia justamente na tela que estamos mostrando. Um Modal próprio custa
 * algumas linhas e fica igual nas duas plataformas.
 */
export default function ModalFoto({ visivel, aoFechar }: Props) {
  const insets = useSafeAreaInsets();
  const { foto, escolherDaGaleria, tirarFoto, removerFoto } = useFotoPerfil();

  /** Fecha antes de abrir a câmera/galeria: dois modais empilhados travam o iOS. */
  async function executar(acao: () => Promise<void>) {
    aoFechar();
    await acao();
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <Pressable style={estilos.fundo} onPress={aoFechar} />

      <View style={[estilos.folha, { paddingBottom: Math.max(insets.bottom, espacos.lg) }]}>
        <View style={estilos.puxador} />
        <Text style={estilos.titulo}>Foto de perfil</Text>

        <Opcao
          icone="images-outline"
          rotulo="Escolher da galeria"
          onPress={() => executar(escolherDaGaleria)}
        />
        <Opcao
          icone="camera-outline"
          rotulo="Tirar uma foto"
          onPress={() => executar(tirarFoto)}
        />
        {foto && (
          <Opcao
            icone="trash-outline"
            rotulo="Remover foto"
            perigo
            onPress={() => executar(removerFoto)}
          />
        )}

        <Pressable
          onPress={aoFechar}
          style={({ pressed }) => [estilos.cancelar, pressed && estilos.pressionado]}
        >
          <Text style={estilos.cancelarTexto}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function Opcao({
  icone,
  rotulo,
  onPress,
  perigo = false,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  onPress: () => void;
  perigo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.opcao, pressed && estilos.pressionado]}
    >
      <Ionicons name={icone} size={20} color={perigo ? cores.vermelho : cores.texto} />
      <Text style={[estilos.opcaoTexto, perigo && estilos.opcaoPerigo]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.overlay },
  folha: {
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raios.xl,
    borderTopRightRadius: raios.xl,
    paddingHorizontal: espacos.lg,
    paddingTop: espacos.md,
    gap: espacos.xs,
  },
  puxador: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: raios.circulo,
    backgroundColor: '#D9D9D9',
    marginBottom: espacos.md,
  },
  titulo: {
    fontFamily: familia.bold,
    fontSize: 17,
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    paddingVertical: espacos.lg,
  },
  opcaoTexto: { fontFamily: familia.semi, fontSize: 15, color: cores.texto },
  opcaoPerigo: { color: cores.vermelho },
  cancelar: {
    marginTop: espacos.sm,
    paddingVertical: espacos.lg,
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: raios.sm,
  },
  cancelarTexto: { fontFamily: familia.bold, fontSize: 15, color: cores.textoSecundario },
  pressionado: { opacity: 0.6 },
});
