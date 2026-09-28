import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFotoPerfil } from '@/state/FotoPerfilContext';
import { cores, raios } from '@/theme';

type Props = {
  tamanho: number;
  /** Avatar redondo (barra do topo) ou quadrado arredondado (perfil). */
  formato?: 'circulo' | 'quadrado';
};

/**
 * AVATAR — mostra a foto do usuário, ou um ícone quando não há foto.
 *
 * Um componente só, lendo direto do contexto: assim a barra do topo e a tela
 * de Perfil nunca ficam com imagens diferentes. Trocou num lugar, mudou nos
 * dois, sem ninguém precisar passar prop.
 */
export default function Avatar({ tamanho, formato = 'circulo' }: Props) {
  const { foto } = useFotoPerfil();

  const molde = {
    width: tamanho,
    height: tamanho,
    borderRadius: formato === 'circulo' ? raios.circulo : raios.sm,
  };

  if (foto) {
    return <Image source={{ uri: foto }} style={[estilos.base, molde]} resizeMode="cover" />;
  }

  return (
    <View style={[estilos.base, estilos.vazio, molde]}>
      <Ionicons name="person" size={tamanho * 0.46} color={cores.textoTerciario} />
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { backgroundColor: '#E4E4E4' },
  vazio: { alignItems: 'center', justifyContent: 'center' },
});
