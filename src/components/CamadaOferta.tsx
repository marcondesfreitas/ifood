import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OfertaSheet from '@/components/OfertaSheet';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, raios, sombra } from '@/theme';

/**
 * CAMADA GLOBAL DA OFERTA.
 *
 * Por que isto não mora dentro da tela Início?
 *
 * Porque uma oferta de rota é um evento do APP, não de uma tela. Se o sheet
 * fosse filho da aba Início, ele só existiria enquanto aquela aba estivesse
 * montada — e o entregador que estivesse olhando o Extrato na hora simplesmente
 * perderia a corrida.
 *
 * Montando aqui, no layout raiz e por cima da pilha inteira, a oferta cobre
 * qualquer tela, exatamente como no app de referência.
 *
 * `pointerEvents="box-none"` é o detalhe que faz funcionar: a camada ocupa a
 * tela toda, mas só captura o toque onde existe conteúdo de verdade. Sem isso,
 * um View transparente invisível engoliria todos os cliques do app.
 */
export default function CamadaOferta() {
  const { oferta, segundos, aceitar, rejeitar, aviso } = useEntregador();

  if (!oferta && !aviso) return null;

  return (
    <View style={estilos.camada} pointerEvents="box-none">
      {aviso && (
        <SafeAreaView edges={['top']} style={estilos.areaAviso} pointerEvents="none">
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>{aviso}</Text>
          </View>
        </SafeAreaView>
      )}

      {oferta && (
        <OfertaSheet
          rota={oferta}
          segundos={segundos}
          onAceitar={aceitar}
          onRejeitar={rejeitar}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  camada: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  areaAviso: { paddingHorizontal: espacos.md, alignItems: 'flex-start' },
  aviso: {
    backgroundColor: cores.preto,
    borderRadius: raios.sm,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    ...sombra(2),
  },
  avisoTexto: { fontFamily: familia.semi, fontSize: 13, color: '#FFF' },
});
