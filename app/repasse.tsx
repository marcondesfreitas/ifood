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
import { cores, espacos, familia, fontes } from '@/theme';

/**
 * DADOS DE REPASSE — formulário de conta bancária.
 *
 * O campo aqui NÃO é uma caixa: é uma linha com rótulo em cima e um traço
 * embaixo. Esse padrão ocupa menos altura e deixa o formulário respirar — vale
 * quando são muitos campos curtos, como neste caso.
 *
 * `KeyboardAvoidingView` empurra o conteúdo quando o teclado sobe. Sem ele, o
 * campo que você está digitando fica escondido atrás do teclado no iOS.
 */
export default function TelaRepasse() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Dados de repasse</Text>
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
          <Campo
            rotulo="Nome"
            placeholder="Digite seu nome completo"
            valor={nome}
            aoMudar={setNome}
          />
          <Campo
            rotulo="CPF"
            placeholder="000.000.000-00"
            valor={cpf}
            aoMudar={setCpf}
            teclado="number-pad"
          />
          <Campo
            rotulo="Banco"
            placeholder="Digite o nome do banco"
            valor={banco}
            aoMudar={setBanco}
          />

          <View style={estilos.dupla}>
            <View style={estilos.metade}>
              <Campo
                rotulo="Agência"
                placeholder="0000"
                valor={agencia}
                aoMudar={setAgencia}
                teclado="number-pad"
              />
            </View>
            <View style={estilos.metade}>
              <Text style={estilos.rotulo}>Tipo de conta</Text>
              <Pressable style={estilos.seletor}>
                <Text style={estilos.seletorTexto}>Corrente</Text>
                <Ionicons name="caret-down" size={12} color={cores.textoSecundario} />
              </Pressable>
            </View>
          </View>

          <Campo
            rotulo="Conta"
            placeholder="Digite o número da conta"
            valor={conta}
            aoMudar={setConta}
            teclado="number-pad"
          />
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={estilos.rodape}>
          <Pressable style={({ pressed }) => [estilos.acao, pressed && estilos.pressionado]}>
            <Text style={estilos.acaoTexto}>Alterar dados</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Campo({
  rotulo,
  placeholder,
  valor,
  aoMudar,
  teclado = 'default',
}: {
  rotulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (v: string) => void;
  teclado?: 'default' | 'number-pad';
}) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={estilos.input}
        placeholder={placeholder}
        placeholderTextColor={cores.textoTerciario}
        value={valor}
        onChangeText={aoMudar}
        keyboardType={teclado}
      />
    </View>
  );
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
  barraTitulo: {
    fontFamily: familia.black,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: cores.texto,
  },
  corpo: { flex: 1 },
  conteudo: { padding: espacos.lg, gap: espacos.xl, paddingBottom: espacos.xxl },
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
  dupla: { flexDirection: 'row', gap: espacos.xl },
  metade: { flex: 1, gap: espacos.sm },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: espacos.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
  },
  seletorTexto: { fontFamily: familia.regular, fontSize: 15, color: cores.texto },
  rodape: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  acao: { paddingVertical: espacos.lg, alignItems: 'center' },
  acaoTexto: { fontFamily: familia.bold, fontSize: 15, color: cores.vinho },
  pressionado: { opacity: 0.6 },
});
