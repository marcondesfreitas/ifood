#!/usr/bin/env node
/**
 * Converte artes de ícone em máscaras transparentes para a barra de abas.
 *
 *   node scripts/icones-abas.js inicio=arte1.jpg extrato=arte2.jpg ...
 *
 * POR QUE ISTO EXISTE
 * As artes chegaram como JPEG com fundo chapado — três em preto e uma com o
 * xadrez de transparência já achatado na imagem. Usadas assim, virariam
 * quadrados pretos na barra de abas, e não dariam para colorir.
 *
 * Um ícone de aba precisa de duas cores (cinza inativo, vermelho ativo) a
 * partir do MESMO arquivo. A saída aqui é uma máscara: glifo branco sólido
 * sobre transparência. No app, `tintColor` pinta o branco da cor que o estado
 * pedir — um arquivo, dois estados.
 *
 * O limiar é detectado por imagem, não fixado: o script compara o canto (que é
 * sempre fundo) com o tom mais distante dele. Assim funciona tanto para glifo
 * claro sobre preto quanto para glifo escuro sobre xadrez claro, sem precisar
 * dizer qual é qual.
 *
 * Requer ffmpeg no PATH.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DESTINO = path.join(__dirname, '..', 'assets', 'abas');
/** Lado final. 96px cobre telas 4x para um ícone exibido a ~24pt. */
const LADO = 96;
/** Respiro em volta do glifo, como fração do lado. */
const MARGEM = 0.06;

const ff = (args, opts = {}) =>
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { maxBuffer: 1 << 29, ...opts });

function dimensoes(arquivo) {
  const saida = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0', arquivo,
  ]).toString().trim();
  const [w, h] = saida.split(',').map(Number);
  return { w, h };
}

/**
 * Apaga da máscara tudo que não faz parte do desenho principal.
 *
 * A arte do Início veio com o xadrez de transparência achatado no JPEG, e o
 * ringing da compressão faz vários quadradinhos cruzarem o limiar — o
 * resultado fica salpicado de pontos soltos. Limiar mais alto não resolve sem
 * comer o traço do desenho.
 *
 * A separação certa não é por brilho, é por TAMANHO: o glifo é uma peça grande
 * e conectada, o respingo são milhares de manchas de poucos pixels. A varredura
 * abaixo rotula cada componente (busca em largura, com pilha explícita para não
 * estourar a recursão numa imagem de 1,5 milhão de pixels) e descarta as que
 * não chegam a 2% da maior.
 *
 * @returns quantos pixels foram removidos
 */
function limparRespingos(opaco, w, h) {
  const rotulo = new Int32Array(w * h);
  const tamanhos = [0];
  let atual = 0;

  for (let inicio = 0; inicio < w * h; inicio++) {
    if (!opaco[inicio] || rotulo[inicio]) continue;
    atual++;
    let tamanho = 0;
    const pilha = [inicio];
    rotulo[inicio] = atual;

    while (pilha.length) {
      const p = pilha.pop();
      tamanho++;
      const x = p % w;
      const y = (p - x) / w;
      // 4-vizinhança basta: o desenho é traço contínuo, não pontilhado.
      if (x > 0 && opaco[p - 1] && !rotulo[p - 1]) { rotulo[p - 1] = atual; pilha.push(p - 1); }
      if (x < w - 1 && opaco[p + 1] && !rotulo[p + 1]) { rotulo[p + 1] = atual; pilha.push(p + 1); }
      if (y > 0 && opaco[p - w] && !rotulo[p - w]) { rotulo[p - w] = atual; pilha.push(p - w); }
      if (y < h - 1 && opaco[p + w] && !rotulo[p + w]) { rotulo[p + w] = atual; pilha.push(p + w); }
    }
    tamanhos[atual] = tamanho;
  }

  const maior = Math.max(...tamanhos);
  const minimo = maior * 0.02;

  let removidos = 0;
  for (let i = 0; i < w * h; i++) {
    if (opaco[i] && tamanhos[rotulo[i]] < minimo) {
      opaco[i] = 0;
      removidos++;
    }
  }
  return removidos;
}

function converter(nome, origem) {
  const { w, h } = dimensoes(origem);
  const cinza = ff(['-i', origem, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // O canto é fundo em qualquer uma das artes.
  const fundo = cinza[10 * w + 10];

  // Tom mais frequente que esteja longe do fundo: é o glifo.
  const hist = new Array(256).fill(0);
  for (let i = 0; i < w * h; i++) hist[cinza[i]]++;
  let glifo = fundo;
  let melhor = 0;
  for (let v = 0; v < 256; v++) {
    if (Math.abs(v - fundo) < 25) continue;
    const peso = hist[v] * Math.abs(v - fundo);
    if (peso > melhor) {
      melhor = peso;
      glifo = v;
    }
  }

  const limiar = (fundo + glifo) / 2;
  const glifoEhClaro = glifo > fundo;

  // Máscara + limites do desenho, numa passada só.
  const opaco = new Uint8Array(w * h);
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = cinza[y * w + x];
      const dentro = glifoEhClaro ? v > limiar : v < limiar;
      if (!dentro) continue;
      opaco[y * w + x] = 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error(`${nome}: não achei desenho nenhum na arte`);

  const removidos = limparRespingos(opaco, w, h);

  // Os limites precisam ser recalculados: o respingo estava esticando a caixa
  // muito além do desenho, e o recorte sairia pequeno demais.
  minX = w; maxX = -1; minY = h; maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!opaco[y * w + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  // Recorta num quadrado centrado no desenho, para todos os ícones saírem na
  // mesma escala relativa mesmo vindo de artes com margens diferentes.
  const larg = maxX - minX + 1;
  const alt = maxY - minY + 1;
  const lado = Math.max(larg, alt);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const util = LADO * (1 - 2 * MARGEM);
  const escala = lado / util;

  // Monta o RGBA final amostrando a máscara (vizinho mais próximo já basta:
  // a máscara é binária e o resultado é suavizado no passo seguinte).
  const saida = Buffer.alloc(LADO * LADO * 4);
  for (let y = 0; y < LADO; y++) {
    for (let x = 0; x < LADO; x++) {
      const ox = Math.round(cx + (x - LADO / 2) * escala);
      const oy = Math.round(cy + (y - LADO / 2) * escala);
      const i = (y * LADO + x) * 4;
      const dentro = ox >= 0 && ox < w && oy >= 0 && oy < h && opaco[oy * w + ox];
      // Branco sólido; a cor real vem do tintColor no app.
      saida[i] = 255;
      saida[i + 1] = 255;
      saida[i + 2] = 255;
      saida[i + 3] = dentro ? 255 : 0;
    }
  }

  fs.mkdirSync(DESTINO, { recursive: true });
  const cru = path.join(DESTINO, `_${nome}.raw`);
  fs.writeFileSync(cru, saida);
  ff(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${LADO}x${LADO}`, '-i', cru,
      '-pix_fmt', 'rgba', path.join(DESTINO, `${nome}.png`)]);
  fs.unlinkSync(cru);

  console.log(
    `${nome.padEnd(8)} fundo=${String(fundo).padStart(3)} glifo=${String(glifo).padStart(3)}` +
    `  (${glifoEhClaro ? 'claro sobre escuro' : 'escuro sobre claro'})` +
    `  respingos: ${removidos}  -> ${LADO}x${LADO}`
  );
}

const pares = process.argv.slice(2);
if (!pares.length) {
  console.error('uso: node scripts/icones-abas.js nome=arquivo.jpg [...]');
  process.exit(1);
}
for (const par of pares) {
  const [nome, arquivo] = par.split('=');
  converter(nome, arquivo);
}
