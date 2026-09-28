import AsyncStorage from '@react-native-async-storage/async-storage';

/** Dados editáveis na tela de Contato de emergência. */
export type Contato = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

/** Formas de entrega que o app aceita. */
export type TipoVeiculo = 'Moto' | 'Bicicleta';

/** Dados editáveis nas telas de veículo. */
export type CadastroVeiculo = {
  tipo: TipoVeiculo;
  modelo: string;
  placa: string;
};

export type DadosSalvos = {
  contato: Contato;
  veiculo: CadastroVeiculo;
};

/**
 * PERSISTÊNCIA DO CADASTRO.
 *
 * Diferente da foto de perfil, aqui não há ramificação por plataforma: são
 * poucos campos de texto, e o `AsyncStorage` serve tanto no celular quanto na
 * web (onde ele é o `localStorage` do navegador). A foto precisa de tratamento
 * especial porque é um arquivo grande — texto não.
 *
 * Guardamos tudo sob UMA chave, em JSON. Uma chave por campo pareceria mais
 * organizado, mas obrigaria a ler cinco vezes na abertura e abriria espaço
 * para o app carregar metade dos dados se uma das leituras falhasse.
 */

const CHAVE = '@ifood-entregadores:cadastro';

/** Devolve o que estiver salvo, ou null na primeira execução. */
export async function carregarCadastro(): Promise<Partial<DadosSalvos> | null> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    // JSON de versão antiga (ou corrompido) não pode derrubar o app: só
    // devolvemos o que reconhecemos.
    /**
     * Dado gravado antes de existir a escolha de veículo não tem `tipo`.
     * Sem este `?? 'Moto'`, quem já usava o app abriria a tela com o campo
     * vazio depois de atualizar.
     */
    const veiculo = dados?.veiculo
      ? { tipo: 'Moto' as TipoVeiculo, ...dados.veiculo }
      : undefined;

    return { contato: dados?.contato ?? undefined, veiculo };
  } catch {
    return null;
  }
}

export async function salvarCadastroLocal(dados: DadosSalvos): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Falha ao gravar não deve quebrar a navegação: o usuário continua com os
    // dados corretos na tela, só não sobrevivem ao fechamento.
  }
}

/** Usado só se algum dia o app precisar limpar o cadastro de propósito. */
export async function limparCadastro(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE);
  } catch {
    // silencioso pelo mesmo motivo acima
  }
}
