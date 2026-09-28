import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LinhaLista from '@/components/LinhaLista';
import { cores, espacos, familia, fontes, raios, sombra } from '@/theme';

const ATALHOS = [
  {
    icone: 'headset-outline' as const,
    titulo: 'Falar com o suporte',
    subtitulo: 'Central de atendimento',
  },
  {
    icone: 'shield-checkmark-outline' as const,
    titulo: 'Segurança',
    subtitulo: 'Dicas para rodar com tranquilidade',
  },
  {
    icone: 'document-text-outline' as const,
    titulo: 'Dúvidas frequentes',
    subtitulo: 'Respostas rápidas sobre o aplicativo',
  },
  {
    icone: 'phone-portrait-outline' as const,
    titulo: 'Problemas no aplicativo',
    subtitulo: 'Resolva falhas e travamentos',
  },
];

/**
 * AJUDA — busca e atalhos de suporte.
 *
 * A busca filtra a lista em memória. Como o `TextInput` é controlado (o valor
 * vem do state e o onChangeText devolve para o state), a filtragem acontece a
 * cada tecla sem nenhum "buscar" extra.
 */
export default function TelaAjuda() {
  const [busca, setBusca] = useState('');

  const filtrados = ATALHOS.filter((a) =>
    (a.titulo + ' ' + a.subtitulo).toLowerCase().includes(busca.trim().toLowerCase())
  );

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} />
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.cabecalho}>
          <Text style={estilos.sobrancelha}>Suporte</Text>
          <Text style={estilos.titulo}>Como podemos ajudar?</Text>
        </View>

        <View style={estilos.busca}>
          <Ionicons name="search" size={18} color={cores.textoTerciario} />
          <TextInput
            style={estilos.buscaInput}
            placeholder="Buscar uma dúvida"
            placeholderTextColor={cores.textoTerciario}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <View style={estilos.central}>
          <View style={estilos.centralIcone}>
            <Ionicons name="help" size={22} color="#FFF" />
          </View>
          <View style={estilos.centralTextos}>
            <Text style={estilos.centralTitulo}>Central de ajuda</Text>
            <Text style={estilos.centralLegenda}>
              Encontre respostas rápidas e opções de atendimento.
            </Text>
          </View>
        </View>

        <Text style={estilos.tituloSecao}>Atalhos</Text>

        <View style={estilos.lista}>
          {filtrados.map((a) => (
            <LinhaLista
              key={a.titulo}
              icone={a.icone}
              titulo={a.titulo}
              subtitulo={a.subtitulo}
            />
          ))}
          {filtrados.length === 0 && (
            <Text style={estilos.semResultado}>Nenhum atalho encontrado para “{busca}”.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacos.lg, gap: espacos.lg, paddingBottom: espacos.xxl },
  cabecalho: { gap: 2 },
  sobrancelha: { ...fontes.sobrancelha, color: cores.vinho },
  titulo: { ...fontes.display, color: cores.texto },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm + 2,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    paddingHorizontal: espacos.lg,
    height: 52,
    ...sombra(1),
  },
  buscaInput: { flex: 1, fontFamily: familia.regular, fontSize: 15, color: cores.texto },
  central: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.pretoCartao,
    borderRadius: raios.md,
    padding: espacos.lg,
  },
  centralIcone: {
    width: 40,
    height: 40,
    borderRadius: raios.sm,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralTextos: { flex: 1, gap: 2 },
  centralTitulo: { fontFamily: familia.bold, fontSize: 15, color: '#FFF' },
  centralLegenda: { fontFamily: familia.regular, fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  tituloSecao: { ...fontes.secao, color: cores.texto },
  lista: { gap: espacos.sm, marginTop: -espacos.sm },
  semResultado: {
    ...fontes.legenda,
    color: cores.textoSecundario,
    textAlign: 'center',
    paddingVertical: espacos.xl,
  },
});
