import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * MÉTRICAS DE DESEMPENHO (versão web).
 *
 * Coleta as Core Web Vitals e envia para a Vercel, que mostra o resultado na
 * aba Speed Insights do projeto. Só reporta a partir do site publicado — em
 * `localhost` o script carrega mas os números não chegam ao painel.
 *
 * O ponto de entrada é `/react`, NÃO `/next`: o `/next` depende dos hooks de
 * roteamento do Next.js (`next/navigation`), que não existem aqui. Este app é
 * Expo Router sobre react-native-web, então a entrada correta é a de React puro.
 *
 * Ver `Metricas.tsx` para a versão nativa, que é vazia de propósito.
 */
export default function Metricas() {
  return <SpeedInsights />;
}
