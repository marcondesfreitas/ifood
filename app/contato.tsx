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
 * CONTATO DE EMERGÊNCIA.
 *
 * O nome digitado aqui é o MESMO que aparece no Perfil — não há duas cópias do
 * dado. O contexto guarda um único `contato`, e `entregador.nome` é derivado
 * dele. É por isso que salvar aqui atualiza o Perfil na hora, sem nenhum código
 * de sincronização: não existe nada para sincronizar.
 *
 * As máscaras de CPF e telefone são deliberadamente simples — formatam o que o
 * usuário digita, sem validar se o CPF é válido de verdade. Validação de CPF
 * tem dígito verificador e não cabe num protótipo de interface.
 */
export default function TelaContato() {
  const router = useRouter();
  const { contato, salvarContato } = useEntregador();

  const [nome, setNome] = useState(contato.nome);
  const [cpf, setCpf] = useState(contato.cpf);
  const [email, setEmail] = useState(contato.email);
  const [telefone, setTelefone] = useState(contato.telefone);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function salvar() {
    if (!nome.trim()) {
      setErro('O nome completo é obrigatório — é ele que aparece no seu perfil.');
      return;
    }
    setErro(null);
    salvarContato({ nome: nome.trim(), cpf, email: email.trim(), telefone });
    setSalvo(true);
    // Volta para a tela anterior depois de um instante, para dar tempo de ver
    // a confirmação.
    setTimeout(() => router.back(), 700);
  }

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']} style={estilos.barra}>
        <Pressable onPress={() => router.back()} style={estilos.voltar}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={estilos.barraTitulo}>Contato de emergência</Text>
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
            Estes dados são usados para te identificar e para avisar alguém em caso de
            acidente durante uma rota.
          </Text>

          <Campo
            rotulo="Nome completo"
            placeholder="Digite seu nome completo"
            valor={nome}
            aoMudar={setNome}
          />
          <Campo
            rotulo="CPF"
            placeholder="000.000.000-00"
            valor={cpf}
            aoMudar={(v) => setCpf(mascaraCpf(v))}
            teclado="number-pad"
          />
          <Campo
            rotulo="E-mail"
            placeholder="voce@email.com"
            valor={email}
            aoMudar={setEmail}
            teclado="email-address"
          />
          <Campo
            rotulo="Número de telefone"
            placeholder="(85) 90000-0000"
            valor={telefone}
            aoMudar={(v) => setTelefone(mascaraTelefone(v))}
            teclado="phone-pad"
          />

          {erro && (
            <View style={estilos.erro}>
              <Ionicons name="alert-circle" size={16} color={cores.vermelho} />
              <Text style={estilos.erroTexto}>{erro}</Text>
            </View>
          )}

          {salvo && !erro && (
            <View style={estilos.ok}>
              <Ionicons name="checkmark-circle" size={16} color={cores.verde} />
              <Text style={estilos.okTexto}>Dados salvos.</Text>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={estilos.rodape}>
          <Pressable
            onPress={salvar}
            style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
          >
            <Text style={estilos.botaoTexto}>Salvar dados</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** 12345678901 -> 123.456.789-01 */
function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** 85990001234 -> (85) 99000-1234 */
function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
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
  teclado?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
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
        autoCapitalize={teclado === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
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
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.vermelhoClaro,
    borderRadius: raios.sm,
    padding: espacos.md,
  },
  erroTexto: { flex: 1, ...fontes.legenda, color: cores.texto },
  ok: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    backgroundColor: cores.verdeClaro,
    borderRadius: raios.sm,
    padding: espacos.md,
  },
  okTexto: { flex: 1, ...fontes.legenda, color: cores.texto },
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
