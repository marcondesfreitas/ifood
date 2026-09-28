#!/bin/bash
# Gera os tiles do mapa em assets/mapa/.
#
# Rode só para mudar região, zoom ou tom — os arquivos estão versionados e o
# app não baixa nada em tempo de execução.
#
#   bash scripts/mapa.sh
#
# POR QUE ESTE BASEMAP
# Foram testados quatro. O que serve é o "World Street Map" da Esri:
#   - OpenStreetMap padrão: desenha igrejas, bancos, mercados e numeros de casa
#     direto no raster. Nao da para apagar depois.
#   - CARTO Positron: passou a exigir chave de API (volta com marca d'agua).
#   - Esri Light Gray Canvas: limpo, mas o dado para no zoom 16 nesta regiao —
#     ampliar para o zoom do video deixa tudo borrado.
#   - Esri World Street Map: tem zoom 17 aqui, nao desenha POI nem numero de
#     casa, e traz nome de rua. Dessaturado, fica igual ao mapa da gravacao.
#
# Atencao a ordem da URL: a Esri usa /tile/{z}/{Y}/{X}, com a LINHA antes da
# coluna — o inverso do OSM. Trocar os dois devolve um tile de outro lugar.
#
# Para mudar a regiao, ache o tile central da coordenada:
#
#   node -e "const lat=-3.7270,lon=-38.5305,z=17,n=2**z; \
#     const r=lat*Math.PI/180; \
#     console.log((lon+180)/360*n, (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n)"
#
# e ajuste X_INI/Y_INI (a grade cobre LADO x LADO tiles a partir dai).
# Depois atualize TILE_BASE, ALVO e GRADE em src/components/MapaFundo.tsx.

set -e

ZOOM=17
# Centro em -3.7270, -38.5305 — Praca Jose de Alencar, Centro de Fortaleza,
# que e onde o entregador aparece na gravacao.
# Alvo fracionario: x=51507.473  y=66893.917
X_INI=51505
Y_INI=66891
LADO=6
DESTINO="$(dirname "$0")/../assets/mapa"

BASE="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile"

# COMO O TOM E CALIBRADO
#
# O alvo e a captura de tela de referencia. Medindo a area de mapa dela por
# faixa de luminancia: 12% em 208-223 (plantas dos predios), 69% em 224-239
# (as quadras) e 10% em 240-255 (as ruas). Ou seja: a foto e cinza com as ruas
# CLARAS por cima, nao uma folha branca.
#
# O filtro antigo (hue=s=0,eq=brightness=0.14:contrast=0.74) fazia o inverso:
# jogava 72% da area para 240-255 e lavava tudo, entao rua e quadra ficavam do
# mesmo tom e o mapa nao lia como mapa.
#
# Na tile crua da Esri as ruas sao o UNICO elemento neutro — tudo o mais e
# creme. Entao a SATURACAO separa rua de terreno melhor que o brilho:
#
#   saturacao <= 10  -> rua: vira branco (teto em 250)
#   luminancia >= 175 -> terreno: 232 na quadra, escurecendo 0,25 por nivel
#                        abaixo de 246 (e o que desenha a planta dos predios)
#   luminancia < 175  -> texto e traco: passa intacto, senao o nome da rua some
#
# O corte em 175 cai num vale do histograma da Esri (<1% da area), entao quase
# nenhum pixel pousa na emenda entre os dois trechos da curva.
#
# Resultado medido: 17%/73%/9% nas mesmas faixas — contra 12%/69%/10% da foto.
# O comando de conferencia esta no fim deste arquivo. Mexer nos numeros sem
# medir de novo e chute.
LUM="(r(X,Y)+g(X,Y)+b(X,Y))/3"
SAT="(max(max(r(X,Y),g(X,Y)),b(X,Y))-min(min(r(X,Y),g(X,Y)),b(X,Y)))"
TOM="if(lte($SAT,10),min(250,$LUM),if(gte($LUM,175),232-(246-$LUM)*0.25,$LUM))"

# A COR
#
# A foto nao e cinza neutro. Medindo o desvio medio de cada canal em relacao
# ao cinza, na area clara do mapa: R -0,07  G -2,08  B +2,15 — um cinza frio,
# puxado para o lavanda. E o desvio CRESCE conforme o pixel escurece: na quadra
# (lum 236) o azul sobe 2,3; na avenida (lum 195) sobe 5,7.
#
# Mas a foto tambem nao e colorida: 78% da area clara dela e neutra dentro de
# +-6, e so 0,6% tem cor de verdade (os pinos laranja de lugares, que este
# basemap nao desenha). Por isso o ajuste e um vies de poucos niveis, nao uma
# paleta — exagerar aqui afasta da foto em vez de aproximar.
#
# Os coeficientes sairam de duas rodadas: primeiro o ajuste sobre os dois
# pontos medidos, depois uma correcao para o desvio MEDIO da tile inteira bater
# com o da foto. O resultado: R -0,22  G -2,08  B +2,30 (foto: -0,07 / -2,08 /
# +2,15).
#
# Uma diferenca que fica e nao se corrige: na foto o vies varia de pixel a
# pixel (78% dela cai dentro de +-6 de saturacao, 22% acima), enquanto aqui ele
# e uniforme e 99% fica dentro de +-6. Essa variacao e ruido de croma do JPEG
# da captura; imita-la seria adicionar sujeira de proposito.
ESCURO="max(0,240-($TOM))"
VERM="($TOM)-($ESCURO)*0.03"
VERD="($TOM)-2.1"
AZUL="($TOM)+1.5+($ESCURO)*0.06"
FILTRO="format=rgb24,geq=r='$VERM':g='$VERD':b='$AZUL'"

AGENTE="EntregadoresAcademico/1.0 (projeto academico)"

rm -f "$DESTINO"/t_*.png
mkdir -p "$DESTINO"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

total=0
for (( y=Y_INI; y<Y_INI+LADO; y++ )); do
  for (( x=X_INI; x<X_INI+LADO; x++ )); do
    arquivo="t_${x}_${y}.png"
    curl -sf -A "$AGENTE" "${BASE}/${ZOOM}/${y}/${x}" -o "$TMP/cor.png"
    # Um passe so, gravando em RGB. Antes havia um segundo passe com
    # -pix_fmt gray: economizava espaco, mas apagava o vies frio medido na
    # foto, entao o mapa saia cinza-neutro e nao batia com a referencia.
    ffmpeg -v error -y -i "$TMP/cor.png" -vf "$FILTRO" "$DESTINO/$arquivo"
    total=$((total+1))
    sleep 0.15
  done
done

echo "pronto — $total tiles em $DESTINO"
echo "basemap © Esri, HERE, Garmin e colaboradores"
echo
echo "conferir o tom (quadra deve dar ~#E8E8E8):"
echo "  node -e \"const{execFileSync}=require('child_process');const raw=execFileSync('ffmpeg',['-v','error','-i','assets/mapa/t_${X_INI}_${Y_INI}.png','-f','rawvideo','-pix_fmt','gray','-'],{maxBuffer:1<<28});let s=0,n=0;for(let y=60;y<90;y++)for(let x=60;x<90;x++){s+=raw[y*256+x];n++;}console.log('#'+Math.round(s/n).toString(16).toUpperCase().repeat(3))\""
