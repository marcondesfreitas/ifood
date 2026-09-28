/**
 * DESIGN SYSTEM
 * -------------
 * Tokens conferidos quadro a quadro contra a gravação de tela.
 *
 * Sobre os valores de cor: a gravação passou por compressão, o que desloca o
 * matiz (o vermelho da splash, por exemplo, amostra #A90A2C num vídeo onde o
 * app usa #EA1D2C). Por isso os hex aqui vêm da paleta real da marca, e o vídeo
 * foi usado para decidir ONDE cada cor entra — que é o que a compressão não
 * altera. Amostrar o vídeo daria cores erradas.
 */

export const cores = {
  /** Vermelho vivo: botões, banner, splash, aba ativa. */
  vermelho: '#EA1D2C',
  vermelhoEscuro: '#C4111E',
  vermelhoClaro: '#FEEBEC',
  /** Vinho: títulos de tela, "eyebrows" em caixa alta, selo Nuvem, links. */
  vinho: '#A6123F',

  // Estados
  verde: '#0E8C43',
  verdeClaro: '#E8F6EC',
  amarelo: '#F5A623',
  roxo: '#6B3FA0',
  azul: '#0B72B9',

  // Neutros
  preto: '#1C1C1C',
  pretoCartao: '#141414',
  texto: '#1C1C1C',
  textoSecundario: '#6E6E6E',
  textoTerciario: '#A3A3A3',
  /** Cinza dos ícones/rótulos de aba inativa. */
  abaInativa: '#5F5F5F',
  borda: '#E8E8E8',
  divisor: '#F0F0F0',
  /** Fundo das telas — medido no vídeo, é a cor que a compressão menos altera. */
  fundo: '#F5F4F6',
  superficie: '#FFFFFF',
  /** Caixa de dica cinza-azulada do Perfil. */
  dica: '#E9ECEF',
  overlay: 'rgba(0,0,0,0.45)',
} as const;

export const espacos = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circulo: 999,
} as const;

/**
 * TIPOGRAFIA
 *
 * O app original usa uma fonte proprietária (SulSans), que não pode ser
 * redistribuída num projeto acadêmico. Inter é o equivalente livre mais
 * próximo: mesma pegada geométrica, mesma família de pesos.
 *
 * A ESCALA INTEIRA ESTÁ UM DEGRAU ACIMA do que os nomes sugerem: `regular` é
 * Medium, `bold` é ExtraBold, e assim por diante. Isso engrossa o app todo sem
 * achatar a hierarquia — se cada papel virasse negrito, texto de apoio e título
 * pesariam igual e a leitura perderia o relevo.
 *
 * Os nomes continuam relativos (do mais leve ao mais pesado) de propósito: eles
 * dizem o PAPEL de cada peso, não o número. Para engrossar ou afinar tudo de
 * novo, basta deslocar os cinco valores juntos — nenhuma tela precisa mudar.
 */
export const familia = {
  regular: 'Inter_500Medium',
  medio: 'Inter_600SemiBold',
  semi: 'Inter_700Bold',
  bold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;

export const fontes = {
  /** "Extrato", "Como podemos ajudar?", "Acessos rápidos", "Veículo ativo". */
  display: { fontFamily: familia.black, fontSize: 26, letterSpacing: -0.6 },
  /** "Perfil" e nomes próprios. */
  titulo: { fontFamily: familia.bold, fontSize: 20, letterSpacing: -0.3 },
  secao: { fontFamily: familia.bold, fontSize: 17, letterSpacing: -0.2 },
  /** Eyebrow em caixa alta: GANHOS, SUPORTE, FORMA DE ENTREGA. */
  sobrancelha: {
    fontFamily: familia.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  /** Título das telas empilhadas: DOCUMENTOS, DADOS DE REPASSE. */
  barra: {
    fontFamily: familia.black,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  corpo: { fontFamily: familia.regular, fontSize: 15 },
  corpoForte: { fontFamily: familia.semi, fontSize: 15 },
  legenda: { fontFamily: familia.regular, fontSize: 13 },
  legendaForte: { fontFamily: familia.semi, fontSize: 13 },
  micro: { fontFamily: familia.medio, fontSize: 11 },
  dinheiro: { fontFamily: familia.black, fontSize: 30, letterSpacing: -0.8 },
} as const;

export const sombra = (nivel: 1 | 2 | 3 = 1) => ({
  elevation: nivel * 2,
  shadowColor: '#000',
  shadowOpacity: 0.04 + nivel * 0.03,
  shadowRadius: nivel * 5,
  shadowOffset: { width: 0, height: nivel * 2 },
});

export const tema = { cores, espacos, raios, fontes, familia, sombra };
export default tema;
