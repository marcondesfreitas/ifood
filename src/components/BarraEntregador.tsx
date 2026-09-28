import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/components/Avatar';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

type Props = {
  disponivel: boolean;
  onAlternar: () => void;
  onAbrirPerfil: () => void;
};

/**
 * Cartão flutuante do topo da Home: avatar, pílula de disponibilidade e sino.
 *
 * A pílula é o controle mais importante do app inteiro — é ela que liga e
 * desliga o recebimento de rotas. Por isso ela muda de cor, de ícone E de texto
 * ao mesmo tempo: três sinais redundantes para uma ação que não pode ser
 * ambígua. Indisponível é cinza-escuro com um "x"; disponível é verde com o
 * ícone de navegação.
 */
export default function BarraEntregador({ disponivel, onAlternar, onAbrirPerfil }: Props) {
  function alternar() {
    Haptics.notificationAsync(
      disponivel
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    onAlternar();
  }

  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Pressable onPress={onAbrirPerfil}>
          <Avatar tamanho={42} />
        </Pressable>

        <Pressable
          onPress={alternar}
          style={({ pressed }) => [
            estilos.pilula,
            { backgroundColor: disponivel ? cores.verde : '#4F5356' },
            pressed && estilos.pressionado,
          ]}
        >
          <Ionicons
            name={disponivel ? 'navigate' : 'close'}
            size={16}
            color="#FFF"
            style={estilos.pilulaIcone}
          />
          <Text style={estilos.pilulaTexto}>{disponivel ? 'Disponível' : 'Indisponível'}</Text>
        </Pressable>

        <Pressable style={estilos.sino}>
          <Ionicons name="notifications" size={22} color={cores.vinho} />
          {/* Pontinho de notificação não lida, como no vídeo. */}
          <View style={estilos.pontoSino} />
        </Pressable>
      </View>

      <View style={[estilos.busca, disponivel && estilos.buscaAtiva]}>
        <Ionicons name="search" size={17} color={disponivel ? cores.verde : '#8A8A8A'} />
        <Text style={[estilos.buscaTexto, disponivel && estilos.buscaTextoAtivo]}>
          {disponivel
            ? 'Estamos procurando rotas pra você'
            : 'Fique disponível para receber rotas'}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    padding: espacos.sm + 2,
    gap: espacos.sm + 2,
    ...sombra(2),
  },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.xl,
    paddingVertical: espacos.md,
    borderRadius: raios.circulo,
  },
  pilulaIcone: { marginTop: -1 },
  pilulaTexto: { fontFamily: familia.bold, fontSize: 15, color: '#FFF' },
  sino: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  pontoSino: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: raios.circulo,
    backgroundColor: cores.vermelho,
    borderWidth: 1.5,
    borderColor: cores.superficie,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm + 2,
    backgroundColor: '#F4F4F4',
    borderRadius: raios.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.md + 1,
  },
  buscaAtiva: { backgroundColor: cores.verdeClaro },
  buscaTexto: { ...fontes.corpo, color: '#6E6E6E' },
  buscaTextoAtivo: { fontFamily: familia.semi, color: cores.verde },
  pressionado: { opacity: 0.85 },
});
