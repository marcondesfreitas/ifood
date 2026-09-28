/**
 * Formatação de valores.
 *
 * Uma função só, num arquivo só. Parece exagero — mas `moeda()` aparece em
 * quatro telas, e o dia em que o app virar bilíngue você muda um lugar.
 */
export const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** 32 -> "00:32" — usado no timer regressivo das ofertas. */
export const relogio = (segundos: number) =>
  '00:' + String(Math.max(0, segundos)).padStart(2, '0');
