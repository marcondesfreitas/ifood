import { Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { espacos, raios } from '@/theme';

/**
 * Banner promocional do rodapé da Home.
 *
 * A peça já traz tudo — fundo, tipografia e o valor —, então aqui não há texto
 * sobreposto: o componente é só a imagem. Uma versão anterior desenhava
 * "GANHE+ / R$ 5000" por cima, e com esta arte isso duplicaria a mensagem.
 *
 * A ALTURA SAI DA PROPORÇÃO, e não é um número fixo. A arte é 3:1; o slot
 * antigo era ~4,6:1, e recortar a diferença cortava o topo das cabeças e as
 * mãos — medi as faixas que sobrariam de fora e elas têm desenho, não fundo.
 * Calcular a altura a partir da largura real da tela mostra a peça inteira em
 * qualquer aparelho, sem corte e sem distorção.
 */

/** Proporção do arquivo (1600x533). */
const PROPORCAO = 1600 / 533;

export default function BannerPromo() {
  const { width } = useWindowDimensions();

  // O pai (`rodape` da Home) tem padding `espacos.md` dos dois lados.
  const largura = width - espacos.md * 2;

  return (
    <Pressable style={({ pressed }) => [estilos.banner, pressed && estilos.pressionado]}>
      <Image
        source={require('../../assets/banner-ifood.jpg')}
        style={{ width: largura, height: largura / PROPORCAO }}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  banner: { borderRadius: raios.md, overflow: 'hidden' },
  pressionado: { opacity: 0.9 },
});
