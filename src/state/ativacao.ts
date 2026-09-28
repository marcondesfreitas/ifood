import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ATIVAÇÃO POR TOKEN.
 *
 * A tela de ativação promete, em texto: "o app abrirá diretamente na próxima
 * vez que você entrar". Isso só é verdade se a ativação sobreviver ao
 * fechamento — por isso ela é gravada aqui, e não guardada em memória.
 *
 * Guardamos o token junto com a data. O token não é validado contra nada (é um
 * protótipo), mas registrar o que foi digitado e quando permite, mais tarde,
 * implementar a validade de 7 dias que a tela menciona.
 */

const CHAVE = '@ifood-entregadores:ativacao';

export type Ativacao = {
  token: string;
  /** ISO 8601, para uma futura checagem de validade. */
  ativadoEm: string;
};

export async function lerAtivacao(): Promise<Ativacao | null> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    return typeof dados?.token === 'string' ? dados : null;
  } catch {
    return null;
  }
}

export async function ativar(token: string): Promise<void> {
  try {
    const dados: Ativacao = { token, ativadoEm: new Date().toISOString() };
    await AsyncStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Se a gravação falhar, o app segue funcionando nesta sessão — só vai
    // pedir o token de novo na próxima abertura.
  }
}

/** Não é usado pelo app hoje; existe para testar o fluxo do zero. */
export async function desativar(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE);
  } catch {
    // silencioso
  }
}
