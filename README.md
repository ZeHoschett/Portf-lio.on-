# Portfólio — José Hoschett

Portfólio pessoal de **José Hoschett — Desenvolvedor COBOL · Java**. Página única, dark, responsiva e
interativa, com uma animação própria para cada stack (Java, Python, COBOL e Web).

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
| Início (hero) | `config.js` | nome, cargo, frase, foto e botão do WhatsApp |
| Sobre | `config.js` → `bio` | com a bio vazia, aparece o texto padrão do HTML |
| Stack | `index.html` | marquee infinito + 4 grupos, sem porcentagens |
| Projetos | `data/projects.js` | 4 subseções (Java, Python, COBOL, Web), cada uma com sua animação |
| Formação | `data/education.js` | timeline vertical |
| Certificados | `data/certificates.js` | grade, com ampliação em lightbox |
| Currículo | `config.js` → `resumeUrl` | sem PDF, mostra "disponível em breve" |
| Contato | `config.js` | e-mail com botão copiar, LinkedIn, GitHub e WhatsApp |

**Links vazios nunca aparecem.** Se `github`, `whatsapp.number`, `repo` ou `demo` estiverem em
branco, o botão correspondente não é criado — nada de link quebrado para o recrutador.

### Como o topo se comporta

O header é fixo e leva três botões: **Ver projetos · Currículo · Fale comigo**.

- **A partir de 1280px:** logo à esquerda, os 8 links centralizados e os três botões à direita,
  tudo em uma linha.
- **Abaixo de 1280px:** aparece o menu hambúrguer, e os mesmos três botões ficam dentro dele,
  abaixo dos links. São os mesmos elementos, não uma cópia.

O corte é 1280px, e não 1024px, porque 8 links mais 3 botões não cabem numa tela de 1024px sem
criar rolagem horizontal.

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
  img/  placeholders/ · projects/ · certificates/ · og-image.png (+ og-image.svg, fonte)
  icons/ sprite.svg · favicon.svg
  docs/  curriculo-jose-hoschett.pdf (a adicionar)
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
| `resumeUrl` | caminho do PDF | mostra "Currículo disponível em breve" |
| `siteUrl` | URL final publicada | — |

**Foto:** use um retrato vertical 4:5 (ex.: 800×1000), de preferência em `.webp`, em `assets/img/`.

> O título, a descrição e as tags de compartilhamento (Open Graph) ficam no `<head>` do
> `index.html`, porque buscadores e redes sociais não executam JavaScript. Ao mudar nome, cargo ou
> links, atualize também esse bloco (procure por `TODO(jose)`).

---

## Como adicionar um novo projeto

1. Crie a pasta `assets/img/projects/<id-do-projeto>/` e coloque os prints
   (`.webp` recomendado; anote largura e altura de cada imagem).
2. Abra `assets/js/data/projects.js`, copie um objeto existente e cole no array `projects`.
3. Preencha os campos:

```js
{
  id: 'api-pagamentos',               // único, sem espaços
  title: 'API de Pagamentos',
  stack: 'java',                      // java | python | cobol | web → define a seção
  type: 'backend',                    // mobile (celular) | backend | mainframe (terminal) | web (navegador)
  summary: 'Descrição curta para o card (2–3 linhas).',
  description: 'Descrição longa exibida no modal.',
  tags: ['Java 17', 'Spring Boot', 'PostgreSQL'],
  images: [
    { src: 'assets/img/projects/api-pagamentos/01.webp', alt: 'Tela de ...', width: 1600, height: 1000 },
  ],
  codeSnippet: '',                    // opcional: código exibido no mockup de terminal
  fileName: '',                       // opcional: nome na barra do terminal (padrão: id + extensão)
  challenges: [                       // opcional: exibido no modal
    { challenge: 'O problema enfrentado', solution: 'Como foi resolvido' },
  ],
  repo: 'https://github.com/...',     // vazio = botão não aparece
  demo: '',                           // vazio = botão não aparece
  year: 2026,
  featured: false,                    // true = ocupa 2 colunas
},
```

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
  image: { src: 'assets/img/certificates/java-se.webp', alt: 'Certificado ...', width: 1400, height: 1000 },
  credentialUrl: 'https://...' },
```

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

## TODOs pendentes (José)

Procure por `TODO(jose)` no projeto para ver todos.

- [ ] Bio (`config.js → bio`)
- [ ] Foto (`config.js → photo`)
- [x] URL do GitHub (`config.js → github` e JSON-LD no `index.html`)
- [x] Número do WhatsApp (`config.js → whatsapp.number`)
- [ ] Revisar a frase de apoio (`config.js → tagline`)
- [ ] PDF do currículo em `assets/docs/` + `config.js → resumeUrl`
- [ ] Projetos (`data/projects.js`) e prints/links do próprio portfólio
- [ ] Formação (`data/education.js`)
- [ ] Certificados (`data/certificates.js`)
- [ ] og-image final (opcional, com foto)
- [ ] URL final: `siteUrl`, `canonical`, `og:url`, `og:image` absoluta, `robots.txt`
