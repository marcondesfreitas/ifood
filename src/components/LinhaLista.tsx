import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  /** Cor do ícone. O app usa uma cor diferente por natureza do atalho. */
  corIcone?: string;
  titulo: string;
  subtitulo?: string;
  onPress?: () => void;
};

/**
 * A linha branca com ícone, título e chevron.
 *
 * Ela aparece em Ajuda, Mais e Perfil — três telas, um componente. Sem isso,
 * o mesmo bloco de estilo estaria copiado em três arquivos e a primeira
 * mudança de padding já deixaria as telas diferentes entre si.
 */
export default function LinhaLista({
  icone,
  corIcone = cores.vinho,
  titulo,
  subtitulo,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.linha, pressed && estilos.pressionada]}
    >
      <View style={estilos.caixaIcone}>
        <Ionicons name={icone} size={18} color={corIcone} />
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {subtitulo && <Text style={estilos.subtitulo}>{subtitulo}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={17} color={cores.textoTerciario} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.lg,
    ...sombra(1),
  },
  pressionada: { backgroundColor: '#FAFAFA' },
  caixaIcone: { width: 24, alignItems: 'center' },
  textos: { flex: 1, gap: 1 },
  titulo: { fontFamily: familia.semi, fontSize: 15, color: cores.texto },
  subtitulo: { ...fontes.legenda, fontSize: 12, color: cores.textoSecundario },
});
