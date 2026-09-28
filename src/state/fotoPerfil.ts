import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';

/**
 * ONDE A FOTO DE PERFIL FICA GUARDADA.
 *
 * Este módulo isola UMA decisão: onde os bytes moram. O Context lá em cima só
 * chama `carregar`, `salvar` e `apagar` — não sabe (nem precisa saber) que as
 * duas plataformas resolvem isso de formas completamente diferentes.
 *
 * O erro clássico aqui seria guardar direto a URI que o seletor de imagens
 * devolve. Ela aponta para a pasta de CACHE do app: o Android apaga esse
 * conteúdo quando o armazenamento aperta, e no iOS a URI pode simplesmente
 * deixar de valer. A foto sumiria sozinha depois de alguns dias — que é
 * exatamente o que não pode acontecer aqui.
 *
 * Por isso:
 * - No celular, copiamos o arquivo para o "document directory", a pasta que o
 *   sistema preserva. O próprio arquivo é a persistência: se ele existe, tem
 *   foto; se não existe, não tem. Não precisa de banco nem de chave nenhuma.
 * - Na web não existe sistema de arquivos do app, então guardamos a imagem
 *   como data URI no AsyncStorage (que na web é o localStorage do navegador).
 */

const CHAVE_WEB = '@ifood-entregadores:foto-perfil';
const NOME_ARQUIVO = 'foto-perfil.jpg';

const ehWeb = Platform.OS === 'web';

/** O destino fixo da foto no armazenamento permanente do app. */
function arquivoDaFoto() {
  return new File(Paths.document, NOME_ARQUIVO);
}

/** Devolve a foto salva, ou null se o usuário nunca escolheu (ou removeu). */
export async function carregarFoto(): Promise<string | null> {
  if (ehWeb) {
    return (await AsyncStorage.getItem(CHAVE_WEB)) ?? null;
  }
  const arquivo = arquivoDaFoto();
  return arquivo.exists ? arquivo.uri : null;
}

/**
 * Salva a imagem escolhida em definitivo.
 *
 * @param uriOrigem URI temporária devolvida pelo seletor.
 * @param base64    Conteúdo em base64 — só usado na web.
 * @returns A URI permanente, pronta para o <Image>.
 */
export async function salvarFoto(uriOrigem: string, base64?: string | null): Promise<string> {
  if (ehWeb) {
    if (!base64) throw new Error('Na web a imagem precisa vir com base64.');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    await AsyncStorage.setItem(CHAVE_WEB, dataUri);
    return dataUri;
  }

  const destino = arquivoDaFoto();
  await new File(uriOrigem).copy(destino, { overwrite: true });
  return destino.uri;
}

/** Apaga a foto. Só é chamado quando o usuário pede — nunca automaticamente. */
export async function apagarFoto(): Promise<void> {
  if (ehWeb) {
    await AsyncStorage.removeItem(CHAVE_WEB);
    return;
  }
  const arquivo = arquivoDaFoto();
  if (arquivo.exists) arquivo.delete();
}
