# iFood para Entregadores — réplica de estudo

Reprodução da interface do app **iFood para Entregadores** em
**React Native + Expo (SDK 57)** com TypeScript e Expo Router.

Projeto acadêmico de programação móvel. As telas foram remontadas quadro a
quadro a partir de uma gravação de tela do app original, para estudar na prática
layout, navegação, estado global, animações, persistência e formulários.

> **Sobre a marca.** iFood é marca registrada de terceiros. Este projeto não tem
> vínculo com a empresa e não é distribuído — existe para fins de estudo de
> engenharia de interface. Quatro imagens foram incluídas a pedido, para a
> apresentação: o logotipo na splash (`assets/ifood-logo.png`), a peça
> publicitária do banner (`assets/banner-ifood.jpg`), o mascote
> (`assets/mascote.png`) e o marcador do entregador no mapa
> (`assets/entregador.png`) — os dois últimos **não são arquivos originais**, e
> sim recriações geradas por IA. O alerta sonoro de nova rota
> (`assets/som/nova-rota.mp3`) foi extraído da própria gravação. Nenhum dado
> pessoal que aparece na gravação — nome, rosto ou placa — foi reproduzido:
> tudo é fictício.

---

## 1. Como rodar (faça isso agora)

Abra o terminal **dentro desta pasta** e rode, na ordem:

```bash
npm install
```

```bash
npx expo install expo-router expo-constants expo-linking expo-status-bar expo-splash-screen expo-font expo-haptics expo-image-picker expo-file-system expo-linear-gradient expo-audio react-native-safe-area-context react-native-screens react-native-svg @expo/vector-icons @expo-google-fonts/inter @react-native-async-storage/async-storage
```

> Por que `npx expo install` e não `npm install`? Porque o `expo install` escolhe
> automaticamente a versão de cada biblioteca compatível com o seu SDK. Instalar
> pelo npm puro é a causa nº 1 de app que não abre.

```bash
npx expo start
```

Um QR Code aparece no terminal. Instale o app **Expo Go** no seu Android e escaneie.

**Tudo neste projeto roda no Expo Go**, inclusive o mapa — veja abaixo por quê.

### O mapa

É um mapa **real**: recorte do Centro de Fortaleza, na Praça José de Alencar
(−3,7270 / −38,5305), que é onde o entregador aparece na gravação. Os tiles são
baixados uma vez e empacotados em `assets/mapa/`.

O basemap é o **World Street Map da Esri**, dessaturado para cinza claro. A
escolha não foi arbitrária — quatro fontes foram testadas:

| Fonte | Por que não |
|---|---|
| OpenStreetMap padrão | desenha igrejas, bancos, mercados e números de casa direto no raster; não dá para apagar depois |
| CARTO Positron | passou a exigir chave de API — o tile volta com marca d'água |
| Esri Light Gray Canvas | limpo, mas o dado para no zoom 16 aqui; ampliar até o zoom do vídeo borra tudo |
| **Esri World Street Map** | **tem zoom 17 nesta região, não desenha POI nem número de casa, e traz nome de rua** |

O pipeline está em [scripts/mapa.sh](scripts/mapa.sh), então dá para trocar a
região, o zoom ou o tom sem adivinhação:

```bash
bash scripts/mapa.sh
```

> Atenção ao mexer no script: a Esri usa `/tile/{z}/{Y}/{X}`, com a linha antes
> da coluna — o inverso do OSM. Trocar os dois devolve um tile de outro lugar.

**Dá para arrastar (um dedo) e girar (dois dedos).** Os gestos usam
`PanResponder`, que é nativo do React Native — nenhuma dependência nova. A
rotação acontece em torno do entregador, e o marcador leva uma rotação inversa
para continuar de pé, como o Google Maps faz na navegação. O deslocamento é
travado nas bordas da grade, então não abre buraco em ângulo nenhum.

A posição é **fixa em Fortaleza** e o app **não pede permissão de localização**
— não há uma linha sequer de código de GPS no projeto. Arrastar e girar mexem só
na câmera. Isso é proposital: numa apresentação, um mapa que sempre abre vale
mais que um que depende de permissão, de sinal e de módulo nativo.

O que ele ainda não faz é zoom: a escala é fixa em ~1,04 m/px, calibrada
comparando lado a lado com a captura de referência — contando quantas ruas
paralelas cabem na largura da tela. Vale saber que ampliar mais **piora** a
semelhança: os nomes das ruas vêm desenhados no próprio tile, então quanto
maior a ampliação, menos nomes cabem na tela e mais o mapa vira contorno de
prédio sem referência nenhuma. Para zoom de verdade seria preciso baixar tiles de vários níveis, ou
trocar o corpo de [MapaFundo.tsx](src/components/MapaFundo.tsx) por um
`<MapView>` do `react-native-maps` e gerar um development build.

O marcador do entregador é uma ilustração vista de cima, dimensionada a partir
do tamanho medido na gravação (~31×49 px numa tela de 384).

> Os tiles são © Esri, HERE, Garmin e © OpenStreetMap contributors. O crédito
> aparece no canto do mapa, como as licenças exigem. O uso dos basemaps da Esri
> sem chave é adequado a um protótipo acadêmico; um app publicado de verdade
> precisaria de uma conta ArcGIS.

### O alerta de nova rota

O som são **três bipes de 0,72s**, extraídos da gravação de referência com
`ffmpeg` e normalizados de −24 para −8 dBFS (o original estava baixo demais
para uma sala). Ele toca quando uma oferta chega, junto com a vibração.

Dois detalhes que valem para a apresentação:

- `playsInSilentMode` está ligado. Sem isso o alerta não toca com o aparelho no
  silencioso — que é exatamente como o telefone costuma estar na hora de
  apresentar.
- O player leva um `seekTo(0)` antes de cada toque. Sem ele só a **primeira**
  oferta faz som: o player fica parado no fim da faixa e `play()` não reinicia.

### Os ícones das abas

As artes chegaram como JPEG de fundo chapado — três em preto, uma com o xadrez
de transparência já achatado na imagem. Usadas assim virariam quadrados pretos
na barra, e não dariam para colorir.

[scripts/icones-abas.js](scripts/icones-abas.js) converte cada uma numa
**máscara**: glifo branco sólido sobre transparência. No app, `tintColor` pinta
a máscara de cinza ou vermelho conforme o estado — um arquivo por aba serve aos
dois, em vez de dois arquivos por aba.

```bash
node scripts/icones-abas.js inicio=arte1.jpg extrato=arte2.jpg ajuda=arte3.jpg mais=arte4.jpg
```

Dois problemas que o script resolve sozinho:

- **O limiar é detectado, não fixado.** Ele compara o canto (que é sempre fundo)
  com o tom mais distante, e por isso funciona tanto para glifo claro sobre
  preto quanto para glifo escuro sobre xadrez claro.
- **Respingos.** O ringing do JPEG em volta do xadrez fazia centenas de pontos
  cruzarem o limiar, e o ícone do Início saía salpicado. Subir o limiar comeria
  o traço. A separação certa é por **tamanho**: o script rotula os componentes
  conectados e descarta tudo abaixo de 2% do maior — o desenho é uma peça só, o
  respingo são manchas de poucos pixels.

### Plano B para a apresentação: rodar no navegador

Se o celular ou o Wi-Fi falharem na hora, o app também abre no navegador:

```bash
npx expo start --web
```

Use isso só como reserva — no navegador as sombras e as fontes ficam um pouco
diferentes do Android, e o feedback tátil não existe.

### Speed Insights (só na web)

A versão publicada na Vercel reporta as Core Web Vitals (LCP, CLS, INP) para a
aba **Speed Insights** do projeto. Quem faz isso é `src/components/Metricas`,
montado no layout raiz.

São dois arquivos de propósito, e o Metro escolhe um pela plataforma do build:

| Arquivo | Build | O que faz |
| --- | --- | --- |
| `Metricas.web.tsx` | web | monta o `<SpeedInsights />` da Vercel |
| `Metricas.tsx` | Android e iOS | devolve `null` |

Assim o pacote `@vercel/speed-insights` **não entra** no bundle nativo — o que
é o certo, porque ele mede o carregamento de uma página de navegador, e no app
instalado não existe página para medir.

A entrada importada é `@vercel/speed-insights/react`, não a `/next`: a `/next`
depende do `next/navigation`, que não existe aqui. Este projeto é Expo Router
sobre react-native-web.

Os números só aparecem a partir do site publicado; em `localhost` o script
carrega mas nada chega ao painel.

---

## 2. Estrutura de pastas

```
app/                    → rotas (cada arquivo = uma tela)
  _layout.tsx           → layout raiz: providers globais + fonte + pilha
  index.tsx             → rota "/" — splash e "Validando sessão…"
  ativar.tsx            → "/ativar" — token de ativação
  perfil.tsx            → "/perfil"     ─┐
  repasse.tsx           → "/repasse"     │ abrem POR CIMA das abas
  documentos.tsx        → "/documentos"  │
  veiculo.tsx           → "/veiculo"     │
  contato.tsx           → "/contato"     │
  cadastro-veiculo.tsx  → "/cadastro-veiculo"  │
  vantagens.tsx         → "/vantagens"         │
  forma-entrega.tsx     → "/forma-entrega"    ─┘
  (tabs)/
    _layout.tsx         → barra de abas inferior
    index.tsx           → "/" das abas — mapa e disponibilidade
    extrato.tsx         → "/extrato"
    ajuda.tsx           → "/ajuda"
    mais.tsx            → "/mais"

src/
  theme/index.ts        → design tokens: cores, espaços, tipografia, sombras
  components/           → componentes reutilizáveis
  state/                → estado global (Context API) e persistência
  data/                 → dados simulados (rotas)
  utils/                → funções puras de formatação e datas
```

**Regra de ouro do Expo Router:** o que está em `app/` é rota. O que está em
`src/` é código de apoio. Nunca coloque um componente auxiliar dentro de `app/`,
senão ele vira uma tela sem querer.

E repare em **onde** o arquivo mora: `perfil.tsx` está em `app/`, não em
`app/(tabs)/`. É só por isso que ele cobre a barra de abas ao abrir, igual ao
app original. Localização do arquivo = comportamento de navegação.

---

## 3. Telas reproduzidas

| Tela | Arquivo | O que tem |
|---|---|---|
| Splash + validação | `app/index.tsx` | vermelho da marca, decide entre ativação e mapa |
| Ativação por token | `app/ativar.tsx` | token fixo `MOTORISTA7`, botão pílula, aviso creme |
| Início | `app/(tabs)/index.tsx` | mapa, pílula Disponível/Indisponível, banner |
| Oferta de rota | `src/components/OfertaSheet.tsx` | bottom sheet animado, contagem de 60s |
| Extrato | `app/(tabs)/extrato.tsx` | seletor de semana, cartão preto, estado vazio |
| Ajuda | `app/(tabs)/ajuda.tsx` | busca que filtra em tempo real, atalhos |
| Mais | `app/(tabs)/mais.tsx` | seções colapsáveis com `LayoutAnimation` |
| Perfil | `app/perfil.tsx` | anel de progresso em SVG, selos, foto editável |
| Dados de repasse | `app/repasse.tsx` | formulário de linha, `KeyboardAvoidingView` |
| Documentos | `app/documentos.tsx` | dados do veículo e da CNH |
| Forma de entrega | `app/veiculo.tsx` | veículo ativo, cartão selecionado |
| Contato de emergência | `app/contato.tsx` | nome, CPF, e-mail e telefone com máscara |
| Cadastro do veículo | `app/cadastro-veiculo.tsx` | modelo e placa, com validação de 7 caracteres |
| Vantagens | `app/vantagens.tsx` | cartão com gradiente, destaques e listas de benefícios |
| Trocar veículo | `app/forma-entrega.tsx` | escolha entre moto e bicicleta, sem botão de salvar |

O app **não tem tela de login** — assim como o original, ele abre na splash e
cai direto no mapa.

### Fluxo para demonstrar na apresentação

1. Abra o app: splash → "Validando sessão…" → **Ativar aplicativo**. O token é
   **`MOTORISTA7`** (aceita minúsculas); qualquer outro é recusado. Da segunda
   abertura em diante o app vai direto ao mapa, como o aviso amarelo promete.

   > O token está no código (`TOKEN_VALIDO` em [app/ativar.tsx](app/ativar.tsx))
   > porque não há servidor. Num app real ele seria emitido e conferido pelo
   > backend: segredo guardado no cliente não protege nada, já que o bundle é
   > legível por quem o baixa. Vale dizer isso na banca — a limitação é o
   > conteúdo, não o defeito.
2. Toque na pílula cinza **Indisponível** → vira **Disponível** (verde) e a barra
   de busca fica verde: *"Estamos procurando rotas pra você"*.
3. Em ~4 segundos sobe o **sheet da oferta**, com contagem regressiva de 60s —
   e toca o alerta de três bipes, junto com a vibração.
4. **Rejeitar** mostra o aviso *"Rota rejeitada."* e outra oferta vem.
5. **Aceitar** → a rota entra em andamento no rodapé. Toque em **Finalizar**.
6. Vá em **Extrato**: os ganhos e o contador de rotas finalizadas subiram.
7. Toque no avatar do topo → **Perfil**: a taxa de finalização saiu de 0%.

### O que sobrevive a fechar o app

Quatro coisas ficam salvas no aparelho e voltam na próxima abertura:

| Dado | Onde | Arquivo |
|---|---|---|
| Foto de perfil | arquivo no *document directory* (celular) / data URI (web) | [fotoPerfil.ts](src/state/fotoPerfil.ts) |
| Ativação do app | `AsyncStorage` — token e data | [ativacao.ts](src/state/ativacao.ts) |
| Nome, CPF, e-mail, telefone | `AsyncStorage`, em JSON sob uma chave | [cadastroLocal.ts](src/state/cadastroLocal.ts) |
| Tipo, modelo e placa do veículo | idem | idem |

O resto — ganhos, rotas finalizadas, disponibilidade — é de propósito volátil:
são o estado da jornada de trabalho, não cadastro.

Um detalhe que parece bobo e não é: o efeito que grava só liga **depois** que a
leitura inicial termina (`jaCarregou` em
[EntregadorContext.tsx](src/state/EntregadorContext.tsx)). Sem essa trava, o
primeiro render gravaria os valores padrão por cima do que estava salvo, e o
dado sumiria exatamente ao reabrir o app — o cenário que a persistência deveria
resolver.

### Um dado, uma fonte

Duas telas de edição mostram o mesmo princípio, e vale apontar isso na banca:

- **Contato de emergência** guarda o nome — e o Perfil o exibe. Não há cópia:
  `entregador.nome` deriva do contato.
- **Cadastro do veículo** guarda modelo e placa — e *Forma de entrega* e
  *Documentos* exibem os dois.

Salvar numa tela atualiza as outras **sem uma linha de código de sincronização**,
porque não existe um segundo lugar guardando o mesmo dado. Duas cópias do mesmo
valor é exatamente como telas passam a discordar entre si.

---

## 3.1 Foto de perfil

Toque na foto em **Perfil** (ou no avatar do topo, que abre o Perfil) para
escolher da galeria, tirar com a câmera ou remover.

A regra é: **a foto sobrevive a fechar o app e só some se o usuário mandar
remover.** Nem o logout apaga.

O detalhe que faz isso funcionar está em
[src/state/fotoPerfil.ts](src/state/fotoPerfil.ts). O erro comum seria guardar a
URI que o seletor devolve — ela aponta para a pasta de **cache**, que o Android
limpa quando o armazenamento aperta. A foto sumiria sozinha depois de alguns
dias. Então:

| Plataforma | Onde a imagem fica |
|---|---|
| Android / iOS | copiada para o *document directory* — a pasta que o sistema preserva. O próprio arquivo é a persistência: existe = tem foto |
| Web | data URI no `AsyncStorage`, que no navegador é o `localStorage` |

Dois detalhes que valem comentário na apresentação:

- **Cache-busting.** No celular o caminho do arquivo é sempre o mesmo, então
  trocar a foto não muda a URI — e o `<Image>` continuaria mostrando a antiga.
  Por isso a URI ganha um `?v=<timestamp>` a cada gravação.
- **Um componente, duas telas.** [Avatar.tsx](src/components/Avatar.tsx) lê
  direto do contexto, então a barra do topo e o Perfil nunca ficam com imagens
  diferentes.

As permissões de câmera e galeria estão declaradas em `app.json`, em português.

---

## 4. Conceitos que dá para mostrar no código

| Conceito | Onde ver |
|---|---|
| Design tokens / design system | `src/theme/index.ts` |
| Roteamento por arquivos | `app/_layout.tsx`, `app/(tabs)/_layout.tsx` |
| Estado global com Context | `src/state/EntregadorContext.tsx` |
| Timers com limpeza (`clearInterval`) | `src/state/EntregadorContext.tsx` |
| Animação nativa (translate + opacity) | `src/components/OfertaSheet.tsx` |
| `LayoutAnimation` (expandir/colapsar) | `app/(tabs)/mais.tsx` |
| Gráfico em SVG (`strokeDasharray`) | `src/components/AnelProgresso.tsx` |
| Camadas sobre mapa e `pointerEvents` | `app/(tabs)/index.tsx` |
| Overlay global acima da pilha | `src/components/CamadaOferta.tsx` |
| Datas calculadas, não escritas | `src/utils/datas.ts` |
| Máscara + `tintColor` (um arquivo, dois estados) | `app/(tabs)/_layout.tsx` |
| Formulário controlado + teclado | `app/repasse.tsx` |
| Persistência em disco + permissões | `src/state/fotoPerfil.ts` |
| Modal próprio como folha de opções | `src/components/ModalFoto.tsx` |
| Alerta sonoro em evento | `src/state/EntregadorContext.tsx` |
| Feedback tátil (vibração) | `src/components/BarraEntregador.tsx` |
| Sombra multiplataforma | `sombra()` em `src/theme/index.ts` |

---

## 5. Diferenças conscientes em relação ao app original

| Item | Aqui | Por quê |
|---|---|---|
| Logotipo e mascote | ícone e tipografia | são arte da marca, não reproduzida |
| Fonte | **Inter** (Google Fonts) | a do app original (SulSans) é proprietária; Inter é o equivalente livre mais próximo |
| Mapa | tiles reais do OpenStreetMap, posição fixa | `react-native-maps` é módulo nativo e exigiria development build |
| Banner do rodapé | peça publicitária real (`assets/banner-ifood.jpg`) | fornecida para o projeto |
| Ícones das abas | artes próprias (`assets/abas/`) | fornecidas para o projeto; substituíram os Ionicons |
| Nome, foto e placa | fictícios | os do vídeo são de uma pessoa real |
| Backend | nenhum | dados simulados no aparelho; nada trafega pela rede |

### Sobre as cores

Os hex do `theme` vêm da paleta real da marca, **não** de amostragem do vídeo.
A gravação passou por compressão, que desloca o matiz: o vermelho da splash
amostra `#A90A2C` num app que usa `#EA1D2C`. O vídeo foi usado para decidir
*onde* cada cor entra — que é o que a compressão não altera. O app trabalha com
dois vermelhos distintos, e essa diferença é real:

- `vermelho` `#EA1D2C` — botões, banner, aba ativa, splash
- `vinho` `#A6123F` — títulos de tela, eyebrows em caixa alta, selo "Nuvem"

---

## 6. Próximas etapas

- **Mapa real** — `expo-location` (permissões + posição em tempo real) e
  `react-native-maps` (marcadores, polyline da rota). Exige development build
  com `npx expo run:android`.
- **Som e notificação** — `expo-audio` no momento em que a oferta chega.
