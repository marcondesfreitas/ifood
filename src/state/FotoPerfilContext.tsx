import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apagarFoto, carregarFoto, salvarFoto } from '@/state/fotoPerfil';

type Estado = {
  /** URI pronta para o <Image>, ou null quando não há foto. */
  foto: string | null;
  /** Falso enquanto a foto salva ainda está sendo lida do disco. */
  pronto: boolean;
  /** Mensagem de erro para mostrar ao usuário (permissão negada, etc). */
  erro: string | null;
  escolherDaGaleria: () => Promise<void>;
  tirarFoto: () => Promise<void>;
  removerFoto: () => Promise<void>;
};

const ehWeb = Platform.OS === 'web';

/** Opções iguais para câmera e galeria: recorte quadrado, peso controlado. */
const OPCOES: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6,
  // Na web precisamos dos bytes para guardar no localStorage;
  // no celular basta a URI, porque copiamos o arquivo.
  base64: ehWeb,
};

const FotoPerfilContext = createContext<Estado | null>(null);

/**
 * FOTO DE PERFIL — estado + ciclo de vida.
 *
 * A regra de negócio aqui é uma frase: a foto sobrevive a fechar o app e só
 * desaparece se o usuário mandar remover. Tudo neste arquivo existe para
 * garantir isso.
 *
 * Note que NÃO há nenhum "limpar foto" no logout: sair da conta não apaga a
 * imagem. Se isso fosse um app real com várias contas, aí sim a foto deveria
 * ser guardada por usuário — mas aí o certo seria o backend, não o disco.
 */
export function FotoPerfilProvider({ children }: { children: ReactNode }) {
  const [foto, setFoto] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Lê a foto salva UMA vez, quando o app abre.
  useEffect(() => {
    let ativo = true;
    carregarFoto()
      .then((salva) => {
        if (ativo) setFoto(salva ? versionar(salva) : null);
      })
      .catch(() => {
        if (ativo) setFoto(null);
      })
      .finally(() => {
        if (ativo) setPronto(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Qualquer erro some da tela depois de 4 segundos.
  useEffect(() => {
    if (!erro) return;
    const t = setTimeout(() => setErro(null), 4000);
    return () => clearTimeout(t);
  }, [erro]);

  const usarResultado = useCallback(async (resultado: ImagePicker.ImagePickerResult) => {
    if (resultado.canceled) return;
    const imagem = resultado.assets[0];
    if (!imagem) return;

    try {
      const permanente = await salvarFoto(imagem.uri, imagem.base64);
      setFoto(versionar(permanente));
    } catch {
      setErro('Não foi possível salvar a foto. Tente uma imagem menor.');
    }
  }, []);

  const escolherDaGaleria = useCallback(async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setErro('Precisamos da permissão de fotos para trocar sua imagem.');
      return;
    }
    await usarResultado(await ImagePicker.launchImageLibraryAsync(OPCOES));
  }, [usarResultado]);

  const tirarFoto = useCallback(async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      setErro('Precisamos da permissão da câmera para tirar a foto.');
      return;
    }
    await usarResultado(await ImagePicker.launchCameraAsync(OPCOES));
  }, [usarResultado]);

  const removerFoto = useCallback(async () => {
    await apagarFoto();
    setFoto(null);
  }, []);

  const valor = useMemo<Estado>(
    () => ({ foto, pronto, erro, escolherDaGaleria, tirarFoto, removerFoto }),
    [foto, pronto, erro, escolherDaGaleria, tirarFoto, removerFoto]
  );

  return <FotoPerfilContext.Provider value={valor}>{children}</FotoPerfilContext.Provider>;
}

/**
 * No celular o caminho do arquivo é SEMPRE o mesmo, então trocar a foto não
 * muda a URI — e o <Image> continuaria mostrando a imagem antiga, servida do
 * cache. Pendurar um parâmetro que muda a cada gravação força a releitura.
 * Em data URI (web) isso não é necessário: o conteúdo já é a própria URI.
 */
function versionar(uri: string) {
  return uri.startsWith('data:') ? uri : `${uri}?v=${Date.now()}`;
}

export function useFotoPerfil() {
  const ctx = useContext(FotoPerfilContext);
  if (!ctx) {
    throw new Error('useFotoPerfil precisa estar dentro de <FotoPerfilProvider>');
  }
  return ctx;
}
