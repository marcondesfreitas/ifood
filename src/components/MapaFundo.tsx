import { useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { familia } from '@/theme';

/**
 * MAPA — recorte real do Centro de Fortaleza, arrastável e rotacionável.
 *
 * Os tiles são do "World Street Map" da Esri, baixados uma vez e empacotados
 * em `assets/mapa/`. O porquê deste basemap (e dos três que foram descartados)
 * está em `scripts/mapa.sh`. Em resumo: é o único keyless que tem zoom 17
 * nesta região e não desenha igrejas, bancos nem números de casa.
 *
 * A localização é FIXA em Fortaleza: o app não consulta o GPS em momento
 * nenhum, e não pede permissão de localização. Arrastar e girar mexem só na
 * câmera — o mapa continua sendo o mesmo pedaço de cidade.
 *
 * Também não usa `react-native-maps`, que é módulo nativo e exigiria
 * development build; assim o mapa abre no Expo Go e na versão web.
 *
 * COMO A CÂMERA FUNCIONA
 * Três camadas encaixadas:
 *   1. `mapa`     — recorta tudo (overflow hidden).
 *   2. `camera`   — uma View de tamanho zero ancorada na posição do marcador.
 *                   A rotação é aplicada AQUI, então o mapa gira em torno do
 *                   entregador, e não do canto da tela.
 *   3. `grade`    — os tiles, deslocados para a coordenada alvo cair na
 *                   origem da câmera. O arrasto move esta camada.
 *
 * O marcador vive dentro da câmera (acompanha o mapa ao arrastar) mas leva uma
 * rotação inversa, para continuar de pé quando o mapa gira — é o que o Google
 * Maps faz na navegação.
 */

const TILES = [
  [
    require('../../assets/mapa/t_51505_66891.png'),
    require('../../assets/mapa/t_51506_66891.png'),
    require('../../assets/mapa/t_51507_66891.png'),
    require('../../assets/mapa/t_51508_66891.png'),
    require('../../assets/mapa/t_51509_66891.png'),
    require('../../assets/mapa/t_51510_66891.png'),
  ],
  [
    require('../../assets/mapa/t_51505_66892.png'),
    require('../../assets/mapa/t_51506_66892.png'),
    require('../../assets/mapa/t_51507_66892.png'),
    require('../../assets/mapa/t_51508_66892.png'),
    require('../../assets/mapa/t_51509_66892.png'),
    require('../../assets/mapa/t_51510_66892.png'),
  ],
  [
    require('../../assets/mapa/t_51505_66893.png'),
    require('../../assets/mapa/t_51506_66893.png'),
    require('../../assets/mapa/t_51507_66893.png'),
    require('../../assets/mapa/t_51508_66893.png'),
    require('../../assets/mapa/t_51509_66893.png'),
    require('../../assets/mapa/t_51510_66893.png'),
  ],
  [
    require('../../assets/mapa/t_51505_66894.png'),
    require('../../assets/mapa/t_51506_66894.png'),
    require('../../assets/mapa/t_51507_66894.png'),
    require('../../assets/mapa/t_51508_66894.png'),
    require('../../assets/mapa/t_51509_66894.png'),
    require('../../assets/mapa/t_51510_66894.png'),
  ],
  [
    require('../../assets/mapa/t_51505_66895.png'),
    require('../../assets/mapa/t_51506_66895.png'),
    require('../../assets/mapa/t_51507_66895.png'),
    require('../../assets/mapa/t_51508_66895.png'),
    require('../../assets/mapa/t_51509_66895.png'),
    require('../../assets/mapa/t_51510_66895.png'),
  ],
  [
    require('../../assets/mapa/t_51505_66896.png'),
    require('../../assets/mapa/t_51506_66896.png'),
    require('../../assets/mapa/t_51507_66896.png'),
    require('../../assets/mapa/t_51508_66896.png'),
    require('../../assets/mapa/t_51509_66896.png'),
    require('../../assets/mapa/t_51510_66896.png'),
  ],
];

/** Tile do canto superior esquerdo da grade. */
const TILE_BASE = { x: 51505, y: 66891 };
/**
 * Posição fracionária de -3.7270, -38.5305 em tiles de zoom 17 — a Praça
 * José de Alencar, no Centro. É onde o entregador está na gravação.
 */
const ALVO = { x: 51507.473, y: 66893.917 };

const TILE = 256;
/**
 * ZOOM
 *
 * No zoom 17, nesta latitude, cada pixel do tile vale 1,191 m; dividido por
 * este fator, dá a escala na tela.
 *
 * O valor saiu de comparar lado a lado com a captura de referência, no mesmo
 * centro e na mesma escala de renderização, contando quantas ruas paralelas
 * cabem na largura. Em 1.8 cabiam ~3 e o mapa mostrava quase só contorno de
 * prédio, sem nome de rua nenhum — parecia vazio, apesar de estar MAIS
 * ampliado que a referência. Em 1.15 cabem ~5, como na foto, e os nomes das
 * ruas aparecem.
 *
 * A contrapartida é que os rótulos vêm do próprio tile: ampliar mais afasta os
 * nomes até sumirem da tela. Mexer aqui é trocar ampliação por informação.
 */
const ESCALA = 1.15;
const LADO = TILE * ESCALA;
const GRADE = TILES.length * LADO;

/** Altura relativa em que o entregador aparece — 42% da tela, como no vídeo. */
const ALTURA_MARCADOR = 0.42;

/**
 * Marcador: medido na gravação, a moto ocupa ~31x49 px numa tela de 384. O
 * arquivo tem margem transparente (arte visível 767x1412 de 1024x1536), então
 * a caixa precisa ser maior que a arte para o desenho sair no tamanho medido.
 */
const MARCADOR_LARGURA = 0.101;
const MARCADOR_RAZAO = 1024 / 1536;

const limita = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Ângulo entre os dois primeiros dedos, em radianos. */
function anguloDosDedos(toques: { pageX: number; pageY: number }[]) {
  return Math.atan2(toques[1].pageY - toques[0].pageY, toques[1].pageX - toques[0].pageX);
}

export default function MapaFundo() {
  const { width, height } = useWindowDimensions();

  const alvoNaGrade = {
    x: (ALVO.x - TILE_BASE.x) * LADO,
    y: (ALVO.y - TILE_BASE.y) * LADO,
  };

  /**
   * Raio que a grade precisa cobrir em volta da origem da câmera para não
   * abrir buraco em NENHUM ângulo de rotação: a distância até o canto de tela
   * mais afastado. Usar o raio (e não a largura) é o que torna o limite válido
   * para o mapa girado.
   */
  const origemY = height * ALTURA_MARCADOR;
  const raio = Math.max(
    Math.hypot(width / 2, origemY),
    Math.hypot(width / 2, height - origemY)
  );

  const limitesX = { min: alvoNaGrade.x + raio - GRADE, max: alvoNaGrade.x - raio };
  const limitesY = { min: alvoNaGrade.y + raio - GRADE, max: alvoNaGrade.y - raio };

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const giro = useRef(new Animated.Value(0)).current;

  // Valores correntes fora do state: mexer neles não re-renderiza, o que
  // mantém o arrasto fluido.
  const atual = useRef({
    panX: 0,
    panY: 0,
    giro: 0,
    iniPanX: 0,
    iniPanY: 0,
    iniGiro: 0,
    iniAngulo: 0,
    doisDedos: false,
  });

  // Os limites dependem do tamanho da tela, que pode mudar (rotação do
  // aparelho). O responder lê deste ref para nunca usar valor velho.
  const limites = useRef({ x: limitesX, y: limitesY });
  limites.current = { x: limitesX, y: limitesY };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const a = atual.current;
        a.iniPanX = a.panX;
        a.iniPanY = a.panY;
        a.iniGiro = a.giro;
        const toques = e.nativeEvent.touches;
        a.doisDedos = toques.length >= 2;
        if (a.doisDedos) a.iniAngulo = anguloDosDedos(toques as never);
      },
      onPanResponderMove: (e, gesto) => {
        const a = atual.current;
        const toques = e.nativeEvent.touches;

        if (toques.length >= 2) {
          // Entrou o segundo dedo agora: reancora, senão o mapa salta.
          if (!a.doisDedos) {
            a.doisDedos = true;
            a.iniGiro = a.giro;
            a.iniAngulo = anguloDosDedos(toques as never);
            return;
          }
          a.giro = a.iniGiro + (anguloDosDedos(toques as never) - a.iniAngulo);
          giro.setValue(a.giro);
          return;
        }

        // Voltou a um dedo: reancora o arrasto no ponto atual.
        if (a.doisDedos) {
          a.doisDedos = false;
          a.iniPanX = a.panX;
          a.iniPanY = a.panY;
          return;
        }

        /**
         * O dedo se move em coordenadas de TELA, mas a grade vive dentro da
         * câmera girada. Sem rodar o vetor pelo ângulo inverso, arrastar para
         * a direita com o mapa girado levaria o mapa para o lado errado.
         */
        const cos = Math.cos(a.giro);
        const sen = Math.sin(a.giro);
        const dx = gesto.dx * cos + gesto.dy * sen;
        const dy = -gesto.dx * sen + gesto.dy * cos;

        a.panX = limita(a.iniPanX + dx, limites.current.x.min, limites.current.x.max);
        a.panY = limita(a.iniPanY + dy, limites.current.y.min, limites.current.y.max);
        pan.setValue({ x: a.panX, y: a.panY });
      },
    })
  ).current;

  // Animated.Value guarda radianos; o transform quer string em graus.
  const emGraus = (v: Animated.Value, sinal: 1 | -1) =>
    v.interpolate({
      inputRange: [-Math.PI, Math.PI],
      outputRange: [sinal * -180 + 'deg', sinal * 180 + 'deg'],
      extrapolate: 'extend',
    });

  const marcadorL = width * MARCADOR_LARGURA;
  const marcadorA = marcadorL / MARCADOR_RAZAO;

  return (
    <View style={estilos.mapa} {...responder.panHandlers}>
      <Animated.View
        style={[
          estilos.camera,
          { left: width / 2, top: origemY, transform: [{ rotate: emGraus(giro, 1) }] },
        ]}
      >
        <Animated.View
          style={[
            estilos.grade,
            {
              left: -alvoNaGrade.x,
              top: -alvoNaGrade.y,
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
        >
          {TILES.map((linha, i) => (
            <View key={i} style={estilos.linha}>
              {linha.map((tile, j) => (
                <Image key={j} source={tile} style={estilos.tile} />
              ))}
            </View>
          ))}
        </Animated.View>

        {/* Acompanha o arrasto, mas gira ao contrário para ficar de pé. */}
        <Animated.Image
          source={require('../../assets/entregador.png')}
          resizeMode="contain"
          style={{
            position: 'absolute',
            left: -marcadorL / 2,
            top: -marcadorA / 2,
            width: marcadorL,
            height: marcadorA,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate: emGraus(giro, -1) },
            ],
          }}
        />
      </Animated.View>

      {/* A licença da Esri exige o crédito visível. */}
      <Text style={estilos.credito}>© Esri</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  mapa: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Mesmo tom das quadras: se um tile demorar a decodificar, o buraco não
    // aparece como um retângulo de outra cor. O valor sai da curva de
    // `scripts/mapa.sh` aplicada ao cinza da quadra (232), com o mesmo viés
    // frio — em cinza neutro o buraco denunciava a diferença.
    backgroundColor: '#E8E6EA',
    overflow: 'hidden',
  },
  camera: { position: 'absolute', width: 0, height: 0 },
  grade: { position: 'absolute', width: GRADE, height: GRADE },
  linha: { flexDirection: 'row' },
  tile: { width: LADO, height: LADO },
  credito: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    fontFamily: familia.medio,
    fontSize: 9,
    color: 'rgba(0,0,0,0.45)',
  },
});
