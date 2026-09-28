/**
 * Datas em português.
 *
 * Tudo aqui é calculado a partir do relógio do aparelho, e não escrito à mão.
 * O motivo é simples: data fixa no código envelhece. O Extrato mostrava
 * "27 jul — 2 ago" e o Perfil "agosto de 2026" porque foi o que apareceu na
 * gravação — e ficaram errados no mês seguinte.
 *
 * Os nomes dos meses estão em arrays próprios em vez de sair do `Intl`. O
 * `toLocaleDateString('pt-BR', { month: 'short' })` devolve "set." (com ponto)
 * em alguns ambientes e "set" em outros, e essa diferença apareceria na tela.
 * Com array, o formato é o mesmo no Android, no iOS e na web.
 */

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** "setembro de 2026" */
export function mesEAno(quando: Date = new Date()): string {
  return `${MESES[quando.getMonth()]} de ${quando.getFullYear()}`;
}

/**
 * Início (segunda) e fim (domingo) da semana que contém a data.
 *
 * `getDay()` devolve 0 para domingo; o `+6 % 7` desloca para uma escala em que
 * segunda é 0, que é a semana usada no app de referência — lá a faixa
 * "27 jul — 2 ago" ia de uma segunda a um domingo.
 */
export function semanaDe(quando: Date = new Date()): { inicio: Date; fim: Date } {
  const diaSegundaZero = (quando.getDay() + 6) % 7;

  const inicio = new Date(quando);
  inicio.setDate(quando.getDate() - diaSegundaZero);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);

  return { inicio, fim };
}

/** "31 ago — 6 set" */
export function faixaDaSemana(quando: Date = new Date()): string {
  const { inicio, fim } = semanaDe(quando);
  const escrever = (d: Date) => `${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
  return `${escrever(inicio)} — ${escrever(fim)}`;
}
