/**
 * MÉTRICAS DE DESEMPENHO (versão nativa) — não faz nada.
 *
 * O Speed Insights da Vercel mede o carregamento de uma PÁGINA: ele lê as Core
 * Web Vitals do navegador (LCP, CLS, INP) e manda para a Vercel. No app
 * instalado não existe navegador nem página, então não há o que medir.
 *
 * O arquivo irmão `Metricas.web.tsx` traz a versão que reporta de verdade. O
 * Metro escolhe um dos dois pela plataforma do build, então o pacote
 * `@vercel/speed-insights` nunca entra no bundle do Android e do iOS.
 */
export default function Metricas() {
  return null;
}
