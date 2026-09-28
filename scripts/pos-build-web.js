#!/usr/bin/env node
/**
 * Injeta as tags de PWA no index.html gerado pelo `expo export --platform web`.
 *
 * POR QUE ISTO EXISTE
 * O export web do Expo gera favicon, mas não gera manifest PWA. Sem manifest,
 * "adicionar à tela inicial" no Android usa o favicon (196px) e o título da
 * página; o iOS, que ignora manifest, precisa de `apple-touch-icon`.
 *
 * A via oficial para mexer no HTML é o arquivo `app/+html.tsx`, mas ele só é
 * usado com `web.output: "static"` — e o modo estático não serve aqui: o
 * layout raiz devolve `null` enquanto a fonte carrega, então o HTML sairia
 * vazio de qualquer forma, e ainda geraria um arquivo por rota, complicando as
 * regras do Vercel. Um passo de build é mais simples e mais previsível.
 *
 * Roda depois do export (ver `vercel.json` e o script `build:web`).
 */

const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'dist', 'index.html');

// `theme-color` não entra aqui: o Expo já emite essa meta a partir de
// `expo.web.themeColor` no app.json, e duplicar não ajuda ninguém.
const TAGS = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="IfoodEntregadores" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
`;

function principal() {
  if (!fs.existsSync(ARQUIVO)) {
    console.error('pos-build-web: dist/index.html não existe — rode o export antes.');
    process.exit(1);
  }

  let html = fs.readFileSync(ARQUIVO, 'utf8');

  // Idempotente: rodar duas vezes não duplica as tags.
  if (html.includes('rel="manifest"')) {
    console.log('pos-build-web: tags já presentes, nada a fazer.');
    return;
  }

  if (!html.includes('</head>')) {
    console.error('pos-build-web: não achei </head> no index.html — o formato do export mudou.');
    process.exit(1);
  }

  html = html.replace('</head>', `${TAGS}  </head>`);
  fs.writeFileSync(ARQUIVO, html);
  console.log('pos-build-web: manifest e apple-touch-icon injetados.');
}

principal();
