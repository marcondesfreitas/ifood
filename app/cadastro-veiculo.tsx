import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEntregador } from '@/state/EntregadorContext';
import { cores, espacos, familia, fontes, raios } from '@/theme';

/**
 * CADASTRO DO VEÍCULO — modelo e placa.
 *
 * Mesmo princípio da tela de Contato: o contexto guarda UM `cadastro`, e
 * `entregador.modelo` / `entregador.placa` derivam dele. Por isso salvar aqui
 * atualiza de uma vez a Forma de entrega e o Documentos, sem nenhum código de
 * sincronização — não existe uma segunda cópia para sincronizar.
 */
export default function TelaCadastroVeiculo() {
  const router = useRouter();
  const { cadastro, salvarCadastro } = useEntregador();

  const [modelo, setModelo] = useState(cadastro.modelo);
  const [placa, setPlaca] = useState(cadastro.placa);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function salvar() {
    if (!modelo.trim()) {
      setErro('Informe o modelo do veículo.');
      return;
    }
    if (placa.replace(/[^A-Z0-9]/g, '').length !== 7) {
      setErro('A placa precisa ter 7 caracteres — ABC1D23 ou ABC1234.');
      return;
    }
    setErro(null);
    // Preserva o tipo: esta tela edita modelo e placa, quem troca moto por
    // bicicleta é a tela de Forma de entrega.
    salvarCadastro({ ...cadastro, modelo: modelo.trim().toUpperCase(), placa });
    setSalvo(true);
    setTimeout(() => router.back(), 700);
  }

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Cadastro do veículo</Text>
        <View style={estilos.voltar} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={estilos.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={estilos.explicacao}>
            Estes dados aparecem na sua forma de entrega e nos documentos. Mantenha a placa
            igual à do documento do veículo.
          </Text>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>Modelo do veículo</Text>
            <TextInput
              style={estilos.input}
              placeholder="HONDA BIZ 125"
              placeholderTextColor={cores.textoTerciario}
              value={modelo}
              onChangeText={setModelo}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.rotulo}>Placa</Text>
            <TextInput
              style={estilos.input}
              placeholder="ABC1D23"
              placeholderTextColor={cores.textoTerciario}
              value={placa}
              onChangeText={(v) => setPlaca(mascaraPlaca(v))}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
            />
            <Text style={estilos.ajuda}>
              Aceita o padrão antigo (ABC1234) e o Mercosul (ABC1D23).
            </Text>
          </View>

          {erro && (
            <View style={estilos.erro}>
              <Ionicons name="alert-circle" size={16} color={cores.vermelho} />
              <Text style={estilos.aviso}>{erro}</Text>
            </View>
          )}

          {salvo && !erro && (
            <View style={estilos.ok}>
              <Ionicons name="checkmark-circle" size={16} color={cores.verde} />
              <Text style={estilos.aviso}>Cadastro atualizado.</Text>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={estilos.rodape}>
          <Pressable
            onPress={salvar}
            style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
          >
            <Text style={estilos.botaoTexto}>Salvar cadastro</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * Placa brasileira: 7 caracteres, sempre maiúsculos. Os dois padrões em uso
 * (ABC1234 e ABC1D23) só diferem na 5ª posição, então basta limitar o conjunto
 * de caracteres e o comprimento — não vale a pena travar o formato e impedir
 * alguém de digitar uma placa válida.
 */
function mascaraPlaca(v: string) {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
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
  barraTitulo: { ...fontes.barra, color: cores.texto },
  corpo: { flex: 1 },
  conteudo: { padding: espacos.lg, gap: espacos.xl, paddingBottom: espacos.xxl },
  explicacao: {
    ...fontes.legenda,
    color: cores.textoSecundario,
    lineHeight: 20,
    marginBottom: -espacos.sm,
  },
  campo: { gap: espacos.sm },
  rotulo: { ...fontes.legenda, color: cores.textoSecundario },
  input: {
    fontFamily: familia.regular,
    fontSize: 15,
    color: cores.texto,
    paddingBottom: espacos.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
  },
  ajuda: { ...fontes.legenda, fontSize: 12, color: cores.textoTerciario },
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.vermelhoClaro,
    borderRadius: raios.sm,
    padding: espacos.md,
  },
  ok: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.verdeClaro,
    borderRadius: raios.sm,
    padding: espacos.md,
  },
  aviso: { flex: 1, ...fontes.legenda, color: cores.texto },
  rodape: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.fundo,
    paddingHorizontal: espacos.lg,
    paddingTop: espacos.md,
  },
  botao: {
    height: 52,
    borderRadius: raios.sm,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacos.md,
  },
  botaoTexto: { fontFamily: familia.bold, fontSize: 15, color: '#FFF' },
  pressionado: { opacity: 0.85 },
});
