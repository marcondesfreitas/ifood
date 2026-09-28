import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacos, familia } from '@/theme';

type Props = {
  /** 0 a 100. */
  percentual: number;
  rotulo: string;
};

const TAMANHO = 176;
const ESPESSURA = 13;
const RAIO = (TAMANHO - ESPESSURA) / 2;
const VOLTA = 2 * Math.PI * RAIO;

/**
 * ANEL DE PROGRESSO — "Taxa de finalização".
 *
 * Como funciona: desenhamos DOIS círculos sobrepostos. O de baixo é o trilho
 * cinza. O de cima usa `strokeDasharray` — o contorno vira uma linha tracejada
 * cujo primeiro traço tem exatamente o comprimento do arco que queremos, e o
 * "buraco" cobre o resto da volta. Girar -90° faz o preenchimento começar às
 * 12h em vez das 3h.
 *
 * É a mesma técnica de qualquer gráfico de rosca na web, e evita ter que
 * calcular arcos à mão.
 */
export default function AnelProgresso({ percentual, rotulo }: Props) {
  const p = Math.max(0, Math.min(100, percentual));
  const preenchido = (p / 100) * VOLTA;

  return (
    <View style={estilos.area}>
      <Svg width={TAMANHO} height={TAMANHO} style={StyleSheet.absoluteFill}>
        <Circle
          cx={TAMANHO / 2}
          cy={TAMANHO / 2}
          r={RAIO}
          stroke="#E4E4E4"
          strokeWidth={ESPESSURA}
          fill="none"
        />
        <Circle
          cx={TAMANHO / 2}
          cy={TAMANHO / 2}
          r={RAIO}
          stroke={cores.vinho}
          strokeWidth={ESPESSURA}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${VOLTA - preenchido}`}
          transform={`rotate(-90 ${TAMANHO / 2} ${TAMANHO / 2})`}
        />
      </Svg>

      <View style={estilos.centro}>
        <Text style={estilos.rotulo}>{rotulo}</Text>
        <Text style={estilos.percentual}>{p}%</Text>
        <View style={estilos.detalhes}>
          <Text style={estilos.detalhesTexto}>Ver detalhes</Text>
          <Ionicons name="chevron-down" size={12} color={cores.textoSecundario} />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  area: {
    width: TAMANHO,
    height: TAMANHO,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { alignItems: 'center', gap: 2 },
  rotulo: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
  percentual: { fontFamily: familia.black, fontSize: 34, color: cores.texto, letterSpacing: -1 },
  detalhes: { flexDirection: 'row', alignItems: 'center', gap: espacos.xs, marginTop: 2 },
  detalhesTexto: { fontFamily: familia.regular, fontSize: 12, color: cores.textoSecundario },
});
