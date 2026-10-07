# Portfólio de José Hoschett

Portfólio pessoal de **José Hoschett**, Desenvolvedor COBOL · Java. Página única, responsiva, no
**sistema vidro**: fundo quase preto, painéis de vidro fosco e uma interface toda em preto e branco.
A única cor do site é a luz fora de foco atrás do vidro, com uma tinta própria por stack.

- **Stack do site:** HTML5, CSS3 (cascade layers, custom properties) e JavaScript moderno (ES Modules).
- **Zero frameworks, zero dependências, sem etapa de build.** É só publicar os arquivos.

> Status: todas as seções implementadas. Falta preencher os dados pessoais  veja
> [TODOs pendentes](#todos-pendentes-josé) no fim deste arquivo.

---

## O que está pronto

Todas as seções estão implementadas. O conteúdo vem de dois lugares: **texto fixo** no `index.html`
e **dados** nos arquivos de `assets/js/data/`.

| Seção | Conteúdo vem de | Observação |
| --- | --- | --- |
| Início (hero) | `config.js` | painel de vidro: nome, cargo, frase, botões (Ver projetos, Fale comigo, GitHub) e foto |
| Sobre | `config.js` → `bio` | duas colunas: foto e bio com os chips; com a bio vazia, aparece o texto padrão do HTML |
| Stack | `index.html` | letreiro em movimento + 5 grupos em relevo, sem porcentagens; o quinto reúne as ferramentas |
| Projetos | `data/projects.js` | uma área com abas que filtram no lugar (Java · 2, Python · 2…), contagem vinda dos dados |
| Formação | `data/education.js` | linha do tempo vertical |
| Certificados | `data/certificates.js` | trilho horizontal com contador, setas e ampliação em lightbox |
| Contato | `config.js` | painel de vidro com uma linha clicável por canal e botão de copiar o e-mail |

**Links vazios nunca aparecem.** Se `github`, `whatsapp.number`, `repo` ou `demo` estiverem em
branco, o botão correspondente não é criado nada de link quebrado para o recrutador.

### Como o topo se comporta

O header é uma barra de vidro fixa, de borda a borda, com três atalhos: **Ver projetos · Fale comigo ·
GitHub**.

- **A partir de 1024px:** logo à esquerda, os 7 links no centro e os botões à direita, tudo em uma
  linha. O GitHub é só o ícone, num botão circular. A fileira foi medida em 1024px, com a barra de
  rolagem, e cabe com folga.
- **Abaixo de 1024px:** aparece o menu hambúrguer, que abre em vidro sobre a página. Os três botões
  ficam dentro dele, abaixo dos links (são os mesmos elementos, não uma cópia), e o GitHub ganha
  rótulo.

O WhatsApp não fica no topo: ele está no Contato e no botão flutuante, que aparece depois do Início
e some de novo ao chegar no Contato.

### O sistema vidro

Toda a aparência sai dos tokens de `assets/css/tokens.css`. Três materiais, com uma regra fixa:

| Material | Quando | Onde |
| --- | --- | --- |
| **Vidro** (`.surface-glass`) | o elemento se sobrepõe a outro conteúdo | topo, menu, painel do Início, abas de projeto, modal, painel do Contato, botão flutuante, aviso |
| **Relevo** (`.surface-relief`) | o elemento só repousa sobre a página | grupos da Stack, itens da Formação, estados vazios |
| **Sólido** (`.surface-solid`) | o elemento se repete muitas vezes na tela | cartões de projeto e de certificado, mockups, blocos de código |

No máximo **três superfícies com desfoque** ficam visíveis ao mesmo tempo, por desempenho. É por isso
que o cartão de projeto é sólido, e não vidro.

A cor existe só como luz fora de foco (`.page-bloom` e a luz de cada seção), feita de gradientes
radiais, sem imagem de fundo. Na área de projetos, a luz troca junto com a aba: âmbar no Java,
azul no Python, verde no COBOL e violeta na Web. Texto, borda, ícone, botão e estado são sempre
branco sobre preto.

---

## Rodar localmente

ES Modules não funcionam abrindo o `index.html` direto (`file://`). Use um servidor local, com
**uma** destas opções:

| Opção | Comando / passo |
| --- | --- |
| VS Code | Instale a extensão **Live Server** → botão direito no `index.html` → *Open with Live Server* |
| Python | `python -m http.server 5500` → abra <http://localhost:5500> |
| Node | `npx serve .` → abra o endereço exibido |

---

## Estrutura

```
index.html                 esqueleto semântico de todas as seções + SEO/OG/JSON-LD
render.yaml                deploy no Render (site estático, cabeçalhos de segurança e cache)
assets/
  css/
    reset.css              declara a ordem das cascade layers
    tokens.css             design tokens (cores, tipografia, espaços, motion…)
    base.css · layout.css · components.css · animations.css
    sections/*.css         um arquivo por seção
  js/
    main.js                ponto de entrada (type="module")
    config.js              ← SEUS DADOS E LINKS (único lugar para editar)
    data/                  ← projects.js · education.js · certificates.js
    modules/               navegação, projetos, formação, certificados, modal, toast, copiar e-mail…
    utils/                 helpers (DOM seguro, motion, scroll, realce de código…)
  img/  placeholders/ · projects/ · certificates/ · jose-hoschett.webp · og-image.png
  icons/ sprite.svg · favicon.svg
  docs/  documentações técnicas dos projetos (.docx)
```

---

## Como editar seus dados

Tudo fica em **`assets/js/config.js`**:

| Campo | O que é | Se ficar vazio |
| --- | --- | --- |
| `tagline` | frase de apoio do topo | — |
| `bio` | 2–4 frases sobre você | exibe o texto padrão do `index.html` |
| `photo` | caminho da foto, ex.: `assets/img/jose.webp` | mantém a foto definida no `index.html` |
| `github` | URL do seu GitHub | o link não aparece |
| `whatsapp.number` | só dígitos com DDI+DDD, ex.: `5511999999999` | os botões de WhatsApp não aparecem |
| `whatsapp.message` | mensagem que já vem escrita | — |

**Foto:** use um retrato vertical 4:5 (ex.: 800×1000), de preferência em `.webp`, em `assets/img/`.

> O título, a descrição e as tags de compartilhamento (Open Graph) ficam no `<head>` do
> `index.html`, porque buscadores e redes sociais não executam JavaScript. Ao mudar nome, cargo ou
> links, atualize também esse bloco (procure por `TODO(jose)`).

---

## Como adicionar um novo projeto

Todo projeto usa o mesmo padrão de apresentação: um **card** na seção da sua stack e, ao clicar, um
**estudo de caso** no modal. Cada bloco do modal só aparece quando o campo correspondente está
preenchido, então um projeto pequeno e um completo convivem no mesmo layout. O **AgendaFlow** (em
`assets/js/data/projects.js`) é o exemplo completo: copie a estrutura dele.

1. Prepare as mídias:
   - Prints de computador em `assets/img/projects/<id>/desktop-01-<tela>.webp` (1600 px de largura).
   - Prints de celular em `assets/img/projects/<id>/mobile-01-<tela>.webp` (só a tela, sem bordas
     cinzas do DevTools, na largura original).
   - Vídeos em `assets/video/projects/<id>/<nome>.mp4` (H.264, sem áudio, de preferência só a tela
     do celular) com uma capa `<nome>-poster.webp`. Anote largura e altura de cada arquivo.
2. Abra `assets/js/data/projects.js`, copie um objeto existente e cole no array `projects`.
3. Preencha os campos (só `id`, `title` e `stack` são obrigatórios):

```js
{
  id: 'api-pagamentos',               // único, sem espaços
  title: 'Pagamentos',                // só o nome do projeto, em destaque
  subtitle: 'API de cobranças',       // o que ele é, na linha de baixo (nunca "Nome — descrição")
  stack: 'java',                      // java | python | cobol | web → define a seção
  type: 'backend',                    // mobile (celular) | backend | mainframe (terminal) | web (navegador)
                                      // | fullstack (navegador + celular na capa do card;
                                      //   no celular o card mostra só o navegador)
  summary: 'Descrição curta para o card (2–3 linhas).',
  description: ['Primeiro parágrafo do modal.', 'Segundo parágrafo.'], // ou uma única string
  tags: ['Java 17', 'Spring Boot', 'PostgreSQL'],
  stats: [                            // números medidos no projeto (nunca estimados)
    { value: '12', label: 'endpoints REST' },
  ],
  highlights: ['Funcionalidade 1', 'Funcionalidade 2'],      // bloco "Funcionalidades"
  architecture: [                     // bloco "Arquitetura", um item por camada
    { title: 'API', description: 'Como a camada foi construída.' },
  ],
  challenges: [                       // bloco "Desafios e soluções"
    { challenge: 'O problema enfrentado', solution: 'Como foi resolvido' },
  ],
  images: [                           // capa do card + carrossel do modal
    { src: 'assets/img/projects/api-pagamentos/desktop-01-inicio.webp', alt: 'Tela de ...', width: 1600, height: 1000 },
  ],
  mobileImages: [                     // capa do card "fullstack" (≥768px) + bloco "Versão mobile"
    { src: 'assets/img/projects/api-pagamentos/mobile-01-inicio.webp', alt: 'Tela de ... no celular', width: 393, height: 800 },
  ],
  videos: [                           // bloco "Demonstração em vídeo" (cada vídeo dentro de um celular)
    { src: 'assets/video/projects/api-pagamentos/demo.mp4', poster: 'assets/video/projects/api-pagamentos/demo-poster.webp',
      title: 'Fluxo principal', width: 392, height: 848 },
  ],
  codeSamples: [                      // bloco "Código em destaque" (abas quando houver mais de um)
    { fileName: 'src/main/java/.../PagamentoService.java', caption: 'O que o trecho mostra.', code: `...` },
    { fileName: 'db/consulta.sql', language: 'sql', code: `...` }, // language: python | sql | typescript
                                                                   // | javascript | java | cobol | html | css
  ],
  codeSnippet: '',                    // opcional: código exibido no mockup de terminal do card
  fileName: '',                       // opcional: nome na barra do terminal (padrão: id + extensão)
  repo: 'https://github.com/...',     // vazio = botão não aparece
  demo: '',                           // vazio = botão não aparece
  docs: 'assets/docs/api-pagamentos-documentacao-tecnica.docx', // download da documentação (vazio = botão não aparece)
  year: 2026,
  featured: false,                    // true = ocupa 2 colunas
},
```

Os trechos de código devem ser **copiados do projeto real**, nunca escritos para o portfólio.

O projeto aparece **somente** na aba da sua `stack`, e a contagem da aba (`Java · 2`) se atualiza
sozinha. Abas sem projetos exibem um estado vazio.

## Como adicionar formação

Em `assets/js/data/education.js`, substitua o placeholder por itens reais (o mais recente primeiro):

```js
{ id: 'ads', institution: 'Nome da instituição', course: 'Análise e Desenvolvimento de Sistemas',
  degree: 'Tecnólogo', period: '2023 a 2025', status: 'completed', description: '' },
```

`status`: `'completed'` (concluído) ou `'in-progress'` (em andamento).

## Como adicionar certificado

Gere as duas imagens (veja abaixo) em `assets/img/certificates/` e adicione em
`assets/js/data/certificates.js`:

```js
{ id: 'java-se', name: 'Nome do certificado', issuer: 'Emissor', date: '2025-03',
  description: 'Uma frase curta sobre o curso (carga horária, temas).',
  image: { src: 'assets/img/certificates/java-se.webp',        // 2000px, abre no lightbox
           thumb: 'assets/img/certificates/java-se-sm.webp',   // 640px, usada no cartão do trilho
           alt: 'Certificado ...', width: 2000, height: 1350 },
  credentialUrl: 'https://...' },
```

`description` aparece no card e se repete no lightbox; sem ela, o card mostra só nome, emissor e
data. `date` e `credentialUrl` são opcionais: o que o certificado não traz, não se inventa.
`thumb` também é opcional; sem ela, o cartão carrega a imagem grande.

**Do PDF para a imagem:** gere sempre a partir do PDF original, nunca de um `.webp` já
comprimido. O certificado é renderizado em alta resolução, recortado nas margens e salvo em
duas larguras: 2000px (o lightbox aparece com até ~1000px e telas de alta densidade pedem o
dobro) e 640px para o cartão.

```bash
python -m pip install pymupdf pillow
python - <<'EOF'
import io, pymupdf
from PIL import Image, ImageChops
page = pymupdf.open('cert.pdf')[0]
clip = page.rect  # PDF impresso do navegador (Alura): use o retângulo do cartão, ex. pymupdf.Rect(15.5, 28.5, 814.1, 567.7)
zoom = 2600 / clip.width
img = Image.open(io.BytesIO(page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False).tobytes('png'))).convert('RGB')
bg = Image.new('RGB', img.size, (255, 255, 255))  # recorta as margens brancas
box = ImageChops.difference(img, bg).convert('L').point(lambda v: 255 if v > 18 else 0).getbbox()
img = img.crop(box) if box else img
for width, quality, name in ((2000, 86, 'cert.webp'), (640, 82, 'cert-sm.webp')):
    out = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    out.save(name, 'WEBP', quality=quality, method=6)
    print(name, out.size)
EOF
```

Anote no dado o `width`/`height` impressos para `cert.webp`.

## Imagem de compartilhamento (og-image)

`assets/img/og-image.png` (1200×630) é gerada a partir de `assets/img/og-image.svg`. Para
regenerar após editar o SVG (com o site rodando em `localhost:5500`):

```bash
chrome --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=5000 \
  --screenshot=assets/img/og-image.png http://localhost:5500/assets/img/og-image.svg
```

---

## Verificação antes de publicar

Já conferido no código: contraste AA em todos os textos, hierarquia de títulos sem pulos, nenhum
id duplicado, links vazios não renderizados e animações que pausam fora da tela.

Vale conferir no navegador depois de preencher seus dados:

- [ ] Console sem erros (F12 → Console)
- [ ] Larguras 360, 390, 768, 1024, 1280 e 1920px, sem rolagem horizontal
- [ ] Navegação só pelo teclado (Tab, Shift+Tab, Enter, Esc) no menu, nas abas de projetos, nos
      cards, no modal e no carrossel
- [ ] Com "reduzir movimento" ativo no sistema, o site fica estático, completo e bonito
- [ ] Trilho de certificados: arrasta no toque, anda com as setas e recebe foco pelo Tab
- [ ] Lighthouse mobile (F12 → Lighthouse) nas 4 categorias

---

## Restyle: sistema vidro (06/10/2026)

O visual foi refeito em nove etapas, sem mexer em textos nem em dados. O site passou de roxo e
neon para o **sistema vidro**: fundo quase preto, painéis de vidro fosco, interface em preto e
branco e cor só na luz fora de foco, com uma tinta por stack.

### O que mudou

| Área | Antes | Depois |
| --- | --- | --- |
| Topo | menu abaixo de 1280px; WhatsApp na barra | barra de vidro de borda a borda; menu abaixo de 1024px; Ver projetos, Fale comigo e GitHub |
| Início | fundo preto, keycap, nome gigante cruzado pela foto | painel único de vidro; "José" sobre "Hoschett"; foto emoldurada na coluna da direita |
| Sobre | foto com borrão roxo | duas colunas; foto com recorte mais fechado |
| Stack | letreiro branco e cartões com linha colorida | letreiro monocromático e cinco cartões em relevo |
| Projetos | quatro seções empilhadas, cada uma com sua animação | uma área com abas que filtram no lugar e mostram a contagem (`Java · 2`); a luz troca com a aba |
| Cartão de projeto | título clicável, tilt 3D | título, subtítulo, resumo, tags, mockup e rodapé com "Estudo de caso" e ícones de acesso |
| COBOL | monitor CRT verde, digitação e T. rex | painel ISPF e o programa `.CBL` em branco sobre preto |
| Estudo de caso | painel escuro em uma coluna | vidro sobre a página desfocada, leitura principal e coluna de apoio (Tecnologias, Acessos, Versão mobile) |
| Certificados | grade | trilho horizontal com contador, setas e o último cartão cortado na borda |
| Contato | cartões por canal, botão verde do WhatsApp | um painel de vidro com uma linha clicável por canal |
| Botão flutuante | verde da marca | vidro monocromático; some também ao chegar no Contato |
| Fontes | Space Grotesk, Inter, JetBrains Mono, VT323 | Inter Tight, Inter, JetBrains Mono |

Saíram do projeto: as três animações em canvas, a digitação do COBOL, o brilho que seguia o
cursor, o tilt 3D, o carregamento sob demanda da arte do COBOL e as três imagens de arte (keycap,
neon do Python e T. rex). Favicon, og-image e placeholder de projeto foram refeitos em preto e
branco.

### Verificação feita no fim

| Item | Resultado |
| --- | --- |
| Console | sem erros nem avisos, em todas as seções, nas 4 abas e nos 12 estudos de caso |
| Larguras 360, 390, 768, 1024, 1280 e 1920px | nenhuma rolagem horizontal |
| Teclado | 58 paradas de Tab, todas com anel de foco branco de 2px |
| Abas | 4 painéis no HTML; contagens 2, 2, 6 e 2 batem com `data/projects.js` |
| Trilho de certificados | setas andam um cartão; contador de `01 de 14` a `14 de 14`; recebe Tab; último cartão cortado |
| Contato | cada linha abre o destino certo; o botão de copiar não abre o e-mail junto; o número do WhatsApp nunca aparece |
| Desfoque | no máximo 3 superfícies de vidro visíveis em qualquer ponto da página |
| Contraste AA | medido nos pixels reais atrás de cada texto: pior caso 4.65:1, nenhuma falha; sem `backdrop-filter`, pior caso 4.78:1 |
| Movimento reduzido | nada anima e nada fica invisível |
| Degraus no gradiente | sem faixas visíveis (grão também por cima do vidro) |

Lighthouse mobile, mediana de três execuções, antes e depois:

| Categoria / métrica | Antes | Depois |
| --- | ---: | ---: |
| Desempenho | 55 | 66 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 5,4 s | 4,8 s |
| TBT | 516 ms | 250 ms |
| CLS | 0 | 0 |

---

## Publicar

Todos os caminhos são relativos, então o site funciona na raiz de um domínio ou em subpasta.

### Render (configurado)

O `render.yaml` na raiz descreve o site como **Static Site**: sem servidor e sem banco de dados.
O build só copia `index.html`, `robots.txt`, `sitemap.xml` e `assets/` para `dist/`, para não publicar os
documentos do repositório (como este README). Ele também define os cabeçalhos de segurança
(CSP, `nosniff`, `X-Frame-Options`…) e o cache de 1 dia para `assets/`. O Render já entrega os
arquivos com compressão (gzip/brotli) e HTTPS.

1. Envie o código para o GitHub:
   ```bash
   git remote add origin https://github.com/ZeHoschett/Portf-lio.on-.git
   git push -u origin main
   ```
2. <https://dashboard.render.com/select-repo?type=blueprint> (ou **Blueprints → New Blueprint
   Instance** no menu lateral) → escolha o repositório → **Deploy Blueprint**. Não crie como
   *Web Service*: ele exige um comando de servidor que este site não tem, e o deploy falha.
3. O site está no ar em <https://jose-hoschett-portfolio.onrender.com> (o nome sai de `name` no
   `render.yaml`). Cada push na `main` publica de novo.
4. A URL final já está no `canonical`, `og:url`, `og:image`, `twitter:image` e JSON-LD do
   `index.html`, no `robots.txt` e no `sitemap.xml`. Se um dia mudar de domínio, troque nesses
   lugares.

> **Supabase não é necessário.** O portfólio não tem banco de dados nem formulário: todo o
> conteúdo vem de `assets/js/data/` e o contato é por e-mail, LinkedIn e WhatsApp. Supabase só
> entraria se o site passasse a gravar algo (ex.: um formulário de contato).

### GitHub Pages

1. Crie um repositório no GitHub (ex.: `portfolio`) e envie o código:
   ```bash
   git remote add origin https://github.com/<usuario>/portfolio.git
   git push -u origin main
   ```
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)` → **Save**.
4. Em ~1 minuto o site estará em `https://<usuario>.github.io/portfolio/`.
5. Atualize o `canonical`, o `og:url` e as URLs absolutas de `og:image` no `index.html`.

### Vercel

1. <https://vercel.com/new> → importe o repositório.
2. *Framework Preset:* **Other**; sem build command; output directory: `./` → **Deploy**.

### Netlify

1. <https://app.netlify.com/start> → importe o repositório.
2. Build command: vazio; publish directory: `.` → **Deploy**.
   (Ou arraste a pasta do projeto em <https://app.netlify.com/drop>.)

---

## Créditos

Nenhum destes exige atribuição, mas fica o registro de onde vieram:

| Recurso | Onde | Licença |
| --- | --- | --- |
| Logos de tecnologias e ferramentas (inclusive o do GitHub) | `assets/icons/sprite.svg` | [Simple Icons](https://simpleicons.org), CC0 |

Os ícones de COBOL, CICS, DB2, z/OS e SQL são desenhos originais deste projeto: essas tecnologias
não têm logo de marca que possa ser usado.

---

## TODOs pendentes (José)

Procure por `TODO(jose)` no projeto para ver todas as marcações no código.

### Já preenchido

- [x] **GitHub** — `config.js → github`, e também no `sameAs` do JSON-LD
- [x] **WhatsApp** — `config.js → whatsapp.number` (o número nunca aparece como texto)
- [x] **Formação** — `data/education.js`
- [x] **Foto** — `config.js → photo` (`assets/img/jose-hoschett.webp`, 832×1040), no hero e no Sobre
- [x] **URL final** — <https://jose-hoschett-portfolio.onrender.com>: `canonical`, Open Graph, JSON-LD, `robots.txt` e `sitemap.xml`

### Falta preencher

| Pendência | Onde | O que precisa | Como está hoje |
| --- | --- | --- | --- |
| **Bio** | `config.js → bio` | 2 a 4 frases sobre você | texto genérico do `index.html` |
| **Projetos** | `data/projects.js` | links de `repo`/`demo` que faltam (ver `TODO(jose)`) e vídeos em `assets/video/projects/<id>/` | Java: FlowPay e CopyBridge · Python: AgendaFlow e Funil de Leads · COBOL: FLOWCNAB e 5 programas de estudo (validação de saldo, seguro, saldo da conta, empréstimo, juros simples) · Web: portfólio e AURA. Funil só com textos e prints, sem links (de propósito); AURA sem repo nem deploy; portfólio sem print |
| **Frase de apoio** | `config.js → tagline` | revisar o texto atual | "Desenvolvedor COBOL para ambientes Mainframe e aplicações Java Backend." |
| **og-image** | `assets/img/og-image.png` | opcional: arte final com a foto | arte genérica, gerada do SVG |
| **Projeto "Portfólio Pessoal"** | `data/projects.js` | atualizar a descrição para o visual novo | os destaques ainda citam Canvas, neon e terminal CRT; a tag "Canvas API" e os dois trechos de código mostram o visual antigo |
| **Segunda foto** | `index.html` (`TODO(jose)` no Sobre) | uma foto diferente para o Sobre | a mesma foto do Início, num recorte mais fechado |

### Ordem sugerida

1. **Bio e foto.** É o que o recrutador vê primeiro, e a foto aparece em dois lugares.
2. ~~**Publicar no Render**~~ feito em 2026-09-21, com a URL já no Open Graph e o repositório no
   card do próprio portfólio.
3. **Projetos reais e certificados**, conforme forem ficando prontos.
