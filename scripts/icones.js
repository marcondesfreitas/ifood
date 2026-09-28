#!/usr/bin/env node
/**
 * Gera todas as variantes do ícone do app a partir de UM arquivo de origem.
 *
 *   node scripts/icones.js assets/_capacete.png
 *
 * POR QUE UM SCRIPT
 * Um ícone de app não é um arquivo, são seis: o iOS não aceita transparência,
 * o Android quer a arte dentro da zona segura de um ícone adaptativo, e o
 * atalho na tela inicial pelo navegador precisa de 192, 512, maskable e
 * apple-touch. Fazer isso à mão erra fácil — e já errou: numa primeira versão
 * os cantos arredondados viraram PRETO ao remover o canal alfa, porque `pad`
 * preenche as bordas mas não os cantos. Aqui a arte é sempre composta sobre um
 * fundo sólido, nunca "achatada".
 *
 * O TRUQUE DA NITIDEZ
 * A arte de origem costuma ser pequena (a atual tem 297px) e precisa virar
 * 1024. Ampliar borra as curvas. Como o desenho é chapado — duas cores e nada
 * mais —, depois de ampliar cada pixel é reencaixado na cor mais próxima entre
 * as duas dominantes. As bordas voltam a ficar duras, como se a arte fosse
 * vetorial.
 *
 * Requer ffmpeg no PATH.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ASSETS = path.join(RAIZ, 'assets');
const PUBLICO = path.join(RAIZ, 'public');

const origem = process.argv[2];
if (!origem || !fs.existsSync(origem)) {
  console.error('uso: node scripts/icones.js <arquivo-de-origem>');
  process.exit(1);
}

const ff = (args, opts = {}) =>
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { maxBuffer: 1 << 29, ...opts });

/** Lê um PNG/JPG como RGB cru. */
function lerRGB(arquivo) {
  return ff(['-i', arquivo, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function dimensoes(arquivo) {
  const saida = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0', arquivo,
  ]).toString().trim();
  const [w, h] = saida.split(',').map(Number);
  return { w, h };
}

/** As duas cores mais frequentes da imagem. */
function coresDominantes(raw, w, h) {
  const cont = new Map();
  for (let i = 0; i < w * h; i++) {
    const k = `${raw[i * 3]},${raw[i * 3 + 1]},${raw[i * 3 + 2]}`;
    cont.set(k, (cont.get(k) || 0) + 1);
  }
  return [...cont.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k.split(',').map(Number));
}

/** Reencaixa cada pixel na cor dominante mais próxima. */
function endurecer(raw, paleta) {
  const saida = Buffer.alloc(raw.length);
  for (let i = 0; i < raw.length; i += 3) {
    let melhor = paleta[0];
    let menor = Infinity;
    for (const c of paleta) {
      const d =
        (raw[i] - c[0]) ** 2 + (raw[i + 1] - c[1]) ** 2 + (raw[i + 2] - c[2]) ** 2;
      if (d < menor) {
        menor = d;
        melhor = c;
      }
    }
    saida[i] = melhor[0];
    saida[i + 1] = melhor[1];
    saida[i + 2] = melhor[2];
  }
  return saida;
}

const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

function principal() {
  const { w, h } = dimensoes(origem);
  console.log(`origem: ${w}x${h}`);

  // 1) amplia para 1024 e endurece as bordas
  const tmp = path.join(ASSETS, '_tmp1024.png');
  ff(['-i', origem, '-vf', 'scale=1024:1024:flags=lanczos', tmp]);

  const raw = lerRGB(tmp);
  const paleta = coresDominantes(raw, 1024, 1024);
  console.log(`cores dominantes: ${paleta.map(hex).join('  ')}`);

  const duro = endurecer(raw, paleta);
  const cru = path.join(ASSETS, '_tmp1024.raw');
  fs.writeFileSync(cru, duro);

  const iconePrincipal = path.join(ASSETS, 'icone.png');
  ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1024x1024', '-i', cru,
      '-pix_fmt', 'rgb24', iconePrincipal]);

  // A cor de fundo é a dominante — a que ocupa mais área.
  const fundo = hex(paleta[0]).replace('#', '0x');

  // 2) ícone adaptativo do Android: arte a 80% sobre transparente
  ff(['-i', iconePrincipal,
      '-vf', 'scale=819:819:flags=lanczos,pad=1024:1024:102:102:color=0x00000000',
      '-pix_fmt', 'rgba', path.join(ASSETS, 'icone-adaptativo.png')]);

  // 3) favicon e tamanhos do PWA
  fs.mkdirSync(PUBLICO, { recursive: true });
  const escalar = (destino, tamanho) =>
    ff(['-i', iconePrincipal, '-vf', `scale=${tamanho}:${tamanho}:flags=lanczos`, destino]);

  escalar(path.join(ASSETS, 'favicon.png'), 196);
  escalar(path.join(PUBLICO, 'icone-192.png'), 192);
  escalar(path.join(PUBLICO, 'icone-512.png'), 512);
  escalar(path.join(PUBLICO, 'apple-touch-icon.png'), 180);

  // 4) maskable: o Android recorta as bordas, então a arte entra a 70%
  //    sobre o fundo sólido — nunca sobre transparente.
  ff(['-f', 'lavfi', '-i', `color=c=${fundo}:s=512x512`,
      '-i', iconePrincipal,
      '-filter_complex', '[1]scale=358:358:flags=lanczos[a];[0][a]overlay=77:77',
      '-frames:v', '1', '-pix_fmt', 'rgb24',
      path.join(PUBLICO, 'icone-maskable.png')]);

  fs.unlinkSync(tmp);
  fs.unlinkSync(cru);

  console.log('gerados:');
  console.log('  assets/icone.png            1024  (iOS/Android, sem alfa)');
  console.log('  assets/icone-adaptativo.png 1024  (Android adaptativo)');
  console.log('  assets/favicon.png           196');
  console.log('  public/icone-192.png         192');
  console.log('  public/icone-512.png         512');
  console.log('  public/icone-maskable.png    512');
  console.log('  public/apple-touch-icon.png  180');
  console.log(`\nfundo do ícone: ${hex(paleta[0])} — use este valor em`);
  console.log('app.json (android.adaptiveIcon.backgroundColor e web.themeColor)');
}

principal();
