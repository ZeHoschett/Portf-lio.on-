# Portfólio — José Hoschett

Portfólio pessoal de **José Hoschett — Desenvolvedor COBOL · Java**. Página única, dark, responsiva e
interativa, com uma identidade visual própria para cada stack (Java, Python, COBOL e Web).

- **Stack do site:** HTML5, CSS3 (cascade layers, custom properties) e JavaScript moderno (ES Modules).
- **Zero frameworks, zero dependências, sem etapa de build.** É só publicar os arquivos.

> Status: todas as seções implementadas. Falta preencher os dados pessoais — veja
> [TODOs pendentes](#todos-pendentes-josé) no fim deste arquivo.

---

## O que está pronto

Todas as seções estão implementadas. O conteúdo vem de dois lugares: **texto fixo** no `index.html`
e **dados** nos arquivos de `assets/js/data/`.

| Seção | Conteúdo vem de | Observação |
| --- | --- | --- |
| Início (hero) | `config.js` | nome, cargo, frase, foto e botão do WhatsApp; fundo preto com a arte do keycap |
| Sobre | `config.js` → `bio` | com a bio vazia, aparece o texto padrão do HTML |
| Stack | `index.html` | marquee infinito + 5 grupos com logos, sem porcentagens; o quinto reúne as ferramentas |
| Projetos | `data/projects.js` | 4 subseções (Java, Python, COBOL, Web), cada uma com sua animação |
| Formação | `data/education.js` | timeline vertical |
| Certificados | `data/certificates.js` | grade com imagem, descrição curta e ampliação em lightbox |
| Contato | `config.js` | e-mail com botão copiar, LinkedIn, GitHub e WhatsApp |

**Links vazios nunca aparecem.** Se `github`, `whatsapp.number`, `repo` ou `demo` estiverem em
branco, o botão correspondente não é criado — nada de link quebrado para o recrutador.

### Como o topo se comporta

O header é fixo e leva três atalhos: **Ver projetos · Fale comigo · WhatsApp**.

- **A partir de 1280px:** logo à esquerda, os 7 links centralizados e os botões à direita, tudo em
  uma linha. O do WhatsApp é só ícone, para a barra não estourar.
- **Abaixo de 1280px:** aparece o menu hambúrguer, e os dois primeiros botões ficam dentro dele,
  abaixo dos links — são os mesmos elementos, não uma cópia. O do WhatsApp sai da barra, porque
  nessa largura ele já aparece no hero e no botão flutuante.

O corte é 1280px, e não 1024px, porque os links mais os botões não cabem numa tela de 1024px sem
criar rolagem horizontal.

### A arte do Início

O hero tem fundo **preto puro** (`--hero-bg`) e uma única arte estática: o keycap de vidro
`assets/img/hero-keycap.webp`, posicionado acima do nome e longe da foto. Ele é decorativo
(`alt=""`, `aria-hidden`) e é composto com `mix-blend-mode: screen`, então a chapa preta da
fotografia some no fundo da seção — o mesmo truque do neon do Python.

Tamanho, posição e opacidade saem dos tokens `--hero-art-*` em `assets/css/tokens.css`
(um valor para celular, um para telas médias e um para desktop). Para trocar a arte, basta
substituir o `.webp` e ajustar `width`/`height` no `index.html`.

> Antes havia aqui um canvas animado (o "orb"). Ele foi removido: o Início agora é estático.

### A identidade visual de cada stack

Cada subseção de projetos tem arte de fundo própria, feita para lembrar a tecnologia:

| Subseção | Arte de fundo |
| --- | --- |
| **Java** | rede hexagonal de nós, com pulsos âmbar viajando pelas arestas |
| **Python** | o logo da linguagem como um letreiro de neon aceso, composto em `screen` sobre o fundo escuro da seção |
| **COBOL** | a seção inteira vira um monitor CRT (scanlines, vinheta, flicker, verde fósforo), com o programa sendo digitado e uma cabeça de T. rex rugindo ao fundo, queimada no fósforo |
| **Web** | grade de pontos que reage ao cursor; sem mouse, uma onda percorre a grade sozinha |

Java e Web em Canvas 2D; Python e COBOL em CSS, sobre duas imagens leves (37 KB e 74 KB). As animações **pausam sozinhas** quando saem da tela
ou quando a aba perde o foco, e com "reduzir movimento" ativo no sistema todas exibem um quadro
estático — nada fica piscando para quem tem sensibilidade a movimento.

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
    animations/            animações de canvas por seção
    utils/                 helpers (DOM seguro, motion, canvas…)
  img/  placeholders/ · projects/ · certificates/ · hero-keycap.webp · trex-head.webp · python-neon.webp · og-image.png
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
| `photo` | caminho da foto, ex.: `assets/img/jose.webp` | exibe o placeholder |
| `github` | URL do seu GitHub | o link não aparece |
| `whatsapp.number` | só dígitos com DDI+DDD, ex.: `5511999999999` | os botões de WhatsApp não aparecem |
| `whatsapp.message` | mensagem que já vem escrita | — |
| `siteUrl` | URL final publicada | — |

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
  title: 'API de Pagamentos',
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
    { fileName: 'db/consulta.sql', language: 'sql', code: `...` }, // language: python | sql | typescript | javascript | java | cobol
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

O projeto aparece **somente** na seção da sua `stack`. Seções sem projetos exibem um estado vazio.

## Como adicionar formação

Em `assets/js/data/education.js`, substitua o placeholder por itens reais (o mais recente primeiro):

```js
{ id: 'ads', institution: 'Nome da instituição', course: 'Análise e Desenvolvimento de Sistemas',
  degree: 'Tecnólogo', period: '2023 — 2025', status: 'completed', description: '' },
```

`status`: `'completed'` (concluído) ou `'in-progress'` (em andamento).

## Como adicionar certificado

Coloque a imagem em `assets/img/certificates/` e adicione em `assets/js/data/certificates.js`:

```js
{ id: 'java-se', name: 'Nome do certificado', issuer: 'Emissor', date: '2025-03',
  description: 'Uma frase curta sobre o curso (carga horária, temas).',
  image: { src: 'assets/img/certificates/java-se.webp', alt: 'Certificado ...', width: 1400, height: 1000 },
  credentialUrl: 'https://...' },
```

`description` aparece no card e se repete no lightbox; sem ela, o card mostra só nome, emissor e
data. `date` e `credentialUrl` são opcionais — o que o certificado não traz, não se inventa.

**Do PDF para a imagem:** os certificados costumam vir em PDF. Para gerar o `.webp` da primeira
página (recortando as margens brancas da impressão):

```bash
python -m pip install pymupdf
python -c "import pymupdf; p=pymupdf.open('cert.pdf')[0]; p.get_pixmap(matrix=pymupdf.Matrix(1400/p.rect.width, 1400/p.rect.width)).save('cert.png')"
```

Depois converta o `.png` em `.webp` (qualidade ~82) e anote `width`/`height` reais no dado.

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
- [ ] Lighthouse mobile (F12 → Lighthouse) nas 4 categorias

---

## Publicar

Todos os caminhos são relativos, então o site funciona na raiz de um domínio ou em subpasta.

### GitHub Pages

1. Crie um repositório no GitHub (ex.: `portfolio`) e envie o código:
   ```bash
   git remote add origin https://github.com/<usuario>/portfolio.git
   git push -u origin main
   ```
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)` → **Save**.
4. Em ~1 minuto o site estará em `https://<usuario>.github.io/portfolio/`.
5. Atualize `siteUrl` no `config.js`, o `canonical`, `og:url` e as URLs absolutas de `og:image` no
   `index.html`.

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
| Logos de tecnologias e ferramentas | `assets/icons/sprite.svg` | [Simple Icons](https://simpleicons.org), CC0 |
| Cabeça de T. rex (máscara alfa) | `assets/img/trex-head.webp` | arte fornecida por José para este portfólio |
| Letreiro de neon do logo Python | `assets/img/python-neon.webp` | arte fornecida por José para este portfólio |
| Keycap de vidro do Início | `assets/img/hero-keycap.webp` | arte fornecida por José para este portfólio |

Os ícones de COBOL, CICS, DB2, z/OS e SQL são desenhos originais deste projeto: essas tecnologias
não têm logo de marca que possa ser usado.

---

## TODOs pendentes (José)

Procure por `TODO(jose)` no projeto para ver todas as marcações no código.

### Já preenchido

- [x] **GitHub** — `config.js → github`, e também no `sameAs` do JSON-LD
- [x] **WhatsApp** — `config.js → whatsapp.number` (o número nunca aparece como texto)
- [x] **Formação** — `data/education.js`
- [x] **Foto** — `config.js → photo` (`assets/img/jose-hoschett.webp`, 800×1000), no hero e no Sobre

### Falta preencher

| Pendência | Onde | O que precisa | Como está hoje |
| --- | --- | --- | --- |
| **Bio** | `config.js → bio` | 2 a 4 frases sobre você | texto genérico do `index.html` |
| **Projetos** | `data/projects.js` | projetos reais + prints em `assets/img/projects/<id>/` e vídeos em `assets/video/projects/<id>/` | AgendaFlow (Python) completo; o próprio portfólio sem print nem links; Java e COBOL exibem estado vazio |
| **Frase de apoio** | `config.js → tagline` | revisar o texto atual | "Desenvolvedor COBOL para ambientes Mainframe e aplicações Java Backend." |
| **og-image** | `assets/img/og-image.png` | opcional: arte final com a foto | arte genérica, gerada do SVG |
| **URL final** | `config.js → siteUrl`, `index.html`, `robots.txt` | só existe depois de publicar | `canonical` e `og:url` comentados, `og:image` relativa |

### Ordem sugerida

1. **Bio e foto.** É o que o recrutador vê primeiro, e a foto aparece em dois lugares.
2. **Publicar no GitHub Pages**, mesmo com pendências. Rende a URL para `siteUrl` e Open Graph, e
   permite preencher `repo` e `demo` do próprio portfólio em `data/projects.js`.
3. **Projetos reais e certificados**, conforme forem ficando prontos.
