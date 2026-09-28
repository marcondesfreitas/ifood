import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { ROTAS, SEGUNDOS_OFERTA, type Rota } from '@/data/rotas';
import {
  carregarCadastro,
  salvarCadastroLocal,
  type CadastroVeiculo,
  type Contato,
  type TipoVeiculo,
} from '@/state/cadastroLocal';

export type { CadastroVeiculo, Contato, TipoVeiculo };

type Entregador = {
  nome: string;
  veiculo: TipoVeiculo;
  modalidade: 'Nuvem' | 'Praça';
  plano: 'Flex' | 'Fixo';
  taxaFinalizacao: number;
  /** Modelo e placa aparecem em Documentos e em Forma de entrega. */
  modelo: string;
  placa: string;
};

type Estado = {
  entregador: Entregador;

  cadastro: CadastroVeiculo;
  /**
   * Salva o cadastro do veículo. Como no contato, `entregador.modelo` e
   * `entregador.placa` DERIVAM daqui — assim Documentos e Forma de entrega
   * leem o mesmo dado e nunca discordam entre si.
   *
   * O nome é `cadastro`, e não `veiculo`, porque `entregador.veiculo` já
   * existe e significa outra coisa (o tipo: Moto ou Bicicleta).
   */
  salvarCadastro: (novo: CadastroVeiculo) => void;

  contato: Contato;
  /**
   * Salva o contato. O `nome` daqui é a MESMA fonte do nome que aparece no
   * Perfil — por isso `entregador.nome` é derivado deste valor, e não uma
   * segunda cópia. Duas cópias do mesmo dado é como as telas passam a
   * discordar entre si.
   */
  salvarContato: (novo: Contato) => void;

  /** O toggle "Disponível / Indisponível" do topo da Home. */
  disponivel: boolean;
  alternarDisponibilidade: () => void;

  /** Oferta na tela agora (bottom sheet aberto), ou null. */
  oferta: Rota | null;
  /** Segundos restantes no botão "Aceitar". */
  segundos: number;
  aceitar: () => void;
  rejeitar: () => void;

  /** Rota aceita e em andamento. */
  rotaAtiva: Rota | null;
  finalizarRota: () => void;

  /** Mensagem curta no topo ("Rota rejeitada."), some sozinha. */
  aviso: string | null;

  // Números do Extrato
  ganhos: number;
  minutosEmRota: number;
  rotasFinalizadas: number;

  sair: () => void;
};

const INICIAL = { ganhos: 0, minutosEmRota: 0, rotasFinalizadas: 0 };

/** Dados de exemplo — fictícios de propósito, como o resto do cadastro. */
const CADASTRO_INICIAL: CadastroVeiculo = {
  tipo: 'Moto',
  modelo: 'HONDA BIZ 125',
  placa: 'ABC1D23',
};

const CONTATO_INICIAL: Contato = {
  nome: 'Lucas Ferreira',
  cpf: '',
  email: '',
  telefone: '',
};

/**
 * ESTADO GLOBAL com Context API.
 *
 * Aqui mora o "servidor falso": enquanto o entregador está disponível, um
 * temporizador sorteia uma oferta de rota; quando a oferta está na tela, outro
 * temporizador desconta os 60 segundos do botão Aceitar.
 *
 * Tela nenhuma guarda esse estado — todas leem daqui com `useEntregador()`.
 * Para apps maiores existem Zustand, Redux ou Jotai, mas todos resolvem
 * exatamente este mesmo problema.
 */
const EntregadorContext = createContext<Estado | null>(null);

export function EntregadorProvider({ children }: { children: ReactNode }) {
  const [disponivel, setDisponivel] = useState(false);
  const [oferta, setOferta] = useState<Rota | null>(null);
  const [segundos, setSegundos] = useState(SEGUNDOS_OFERTA);
  const [rotaAtiva, setRotaAtiva] = useState<Rota | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [contato, setContato] = useState<Contato>(CONTATO_INICIAL);
  const [cadastro, setCadastro] = useState<CadastroVeiculo>(CADASTRO_INICIAL);
  const [ganhos, setGanhos] = useState(INICIAL.ganhos);
  const [minutosEmRota, setMinutosEmRota] = useState(INICIAL.minutosEmRota);
  const [rotasFinalizadas, setRotasFinalizadas] = useState(INICIAL.rotasFinalizadas);

  // Contador de ofertas geradas: serve de id único e de índice na lista.
  const proxima = useRef(0);

  /**
   * ALERTA DE NOVA ROTA
   *
   * O som são três bipes de ~0,7s, extraídos da gravação de referência
   * (`assets/som/nova-rota.mp3`).
   *
   * `playsInSilentMode` é o detalhe que importa numa apresentação: sem ele, o
   * alerta não toca se o aparelho estiver no silencioso — e quem apresenta
   * costuma justamente silenciar o telefone antes de subir no palco.
   */
  const alerta = useAudioPlayer(require('../../assets/som/nova-rota.mp3'));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
      () => {
        // Falhar aqui só significa tocar mais baixo ou não tocar no silencioso;
        // não é motivo para derrubar o app.
      }
    );
  }, []);

  const avisarNovaRota = useCallback(() => {
    // Vibração junto com o som: é o que um app de entrega faz, e cobre o caso
    // de o volume estar zerado.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      // Sem o seek, a segunda oferta em diante não toca — o player fica parado
      // no fim da faixa.
      alerta.seekTo(0);
      alerta.play();
    } catch {
      // som é acessório: se falhar, a oferta aparece do mesmo jeito
    }
  }, [alerta]);

  /**
   * PERSISTÊNCIA DO CADASTRO
   *
   * Lê o que estiver salvo UMA vez, na abertura. `jaCarregou` existe para o
   * efeito de gravação não disparar antes disso — sem essa trava, o primeiro
   * render gravaria os valores padrão POR CIMA do que o usuário tinha salvo,
   * e o dado sumiria justamente ao reabrir o app.
   */
  const jaCarregou = useRef(false);

  useEffect(() => {
    let ativo = true;
    carregarCadastro()
      .then((salvo) => {
        if (!ativo || !salvo) return;
        if (salvo.contato) setContato(salvo.contato);
        if (salvo.veiculo) setCadastro(salvo.veiculo);
      })
      .finally(() => {
        if (ativo) jaCarregou.current = true;
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!jaCarregou.current) return;
    salvarCadastroLocal({ contato, veiculo: cadastro });
  }, [contato, cadastro]);

  /**
   * Enquanto disponível, sem oferta na tela e sem rota ativa, sorteia uma nova
   * oferta a cada ~4s. A função de limpeza derruba o timer quando qualquer uma
   * dessas condições muda — timer sem clearTimeout é vazamento de memória.
   */
  useEffect(() => {
    if (!disponivel || oferta || rotaAtiva) return;

    const t = setTimeout(() => {
      const base = ROTAS[proxima.current % ROTAS.length];
      proxima.current += 1;
      setOferta({ ...base, id: 'rota' + proxima.current });
      setSegundos(SEGUNDOS_OFERTA);
      avisarNovaRota();
    }, 4000);

    return () => clearTimeout(t);
  }, [disponivel, oferta, rotaAtiva, avisarNovaRota]);

  /** Contagem regressiva do botão Aceitar. Zerou, a oferta expira sozinha. */
  useEffect(() => {
    if (!oferta) return;

    const timer = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          setOferta(null);
          setAviso('Tempo esgotado. A rota foi oferecida a outro entregador.');
          return SEGUNDOS_OFERTA;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [oferta]);

  /** Todo aviso do topo some depois de 3 segundos. */
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const alternarDisponibilidade = useCallback(() => {
    setDisponivel((d) => {
      if (d) {
        // Ficou indisponível: some qualquer oferta na tela.
        setOferta(null);
      }
      return !d;
    });
  }, []);

  const rejeitar = useCallback(() => {
    setOferta(null);
    setSegundos(SEGUNDOS_OFERTA);
    setAviso('Rota rejeitada.');
  }, []);

  const aceitar = useCallback(() => {
    if (!oferta) return;
    setRotaAtiva(oferta);
    setOferta(null);
    setSegundos(SEGUNDOS_OFERTA);
    setAviso('Rota aceita! Siga para a coleta.');
  }, [oferta]);

  const finalizarRota = useCallback(() => {
    if (!rotaAtiva) return;
    setGanhos((g) => g + rotaAtiva.valor);
    setRotasFinalizadas((n) => n + 1);
    setMinutosEmRota((m) => m + parseInt(rotaAtiva.tempo, 10));
    setRotaAtiva(null);
    setAviso('Rota finalizada. Valor creditado no extrato.');
  }, [rotaAtiva]);

  const sair = useCallback(() => {
    setDisponivel(false);
    setOferta(null);
    setRotaAtiva(null);
    setAviso(null);
    setGanhos(INICIAL.ganhos);
    setMinutosEmRota(INICIAL.minutosEmRota);
    setRotasFinalizadas(INICIAL.rotasFinalizadas);
    proxima.current = 0;
  }, []);

  const salvarContato = useCallback((novo: Contato) => setContato(novo), []);
  const salvarCadastro = useCallback((novo: CadastroVeiculo) => setCadastro(novo), []);

  const valor = useMemo<Estado>(
    () => ({
      entregador: {
        // Dados de exemplo, fictícios de propósito: o vídeo mostra o nome, a
        // placa e o rosto de uma pessoa real, e nada disso é reproduzido.
        //
        // O nome vem do contato — editar lá muda aqui, porque não existe uma
        // segunda cópia do dado. Campo vazio cai no inicial, para o Perfil
        // nunca ficar sem nome.
        nome: contato.nome.trim() || CONTATO_INICIAL.nome,
        // Vem do cadastro: trocar em Forma de entrega muda aqui.
        veiculo: cadastro.tipo,
        modalidade: 'Nuvem',
        plano: 'Flex',
        taxaFinalizacao: rotasFinalizadas > 0 ? 100 : 0,
        modelo: cadastro.modelo.trim() || CADASTRO_INICIAL.modelo,
        placa: cadastro.placa.trim() || CADASTRO_INICIAL.placa,
      },
      disponivel,
      alternarDisponibilidade,
      oferta,
      segundos,
      aceitar,
      rejeitar,
      rotaAtiva,
      finalizarRota,
      aviso,
      ganhos,
      minutosEmRota,
      rotasFinalizadas,
      contato,
      salvarContato,
      cadastro,
      salvarCadastro,
      sair,
    }),
    [
      disponivel,
      alternarDisponibilidade,
      oferta,
      segundos,
      aceitar,
      rejeitar,
      rotaAtiva,
      finalizarRota,
      aviso,
      ganhos,
      minutosEmRota,
      rotasFinalizadas,
      contato,
      salvarContato,
      cadastro,
      salvarCadastro,
      sair,
    ]
  );

  return <EntregadorContext.Provider value={valor}>{children}</EntregadorContext.Provider>;
}

export function useEntregador() {
  const ctx = useContext(EntregadorContext);
  if (!ctx) {
    throw new Error('useEntregador precisa estar dentro de <EntregadorProvider>');
  }
  return ctx;
}
