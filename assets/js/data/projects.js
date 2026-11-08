/**
 * Projects shown in #projetos. Each project lives in the tab of its `stack`; `alsoIn` adds a
 * recommendation card (not a second project) to other tabs.
 * How to add one: see README.md → "Como adicionar um novo projeto".
 *
 * The portfolio only presents the projects: no source code, no repository links, no technical
 * documents and no security or internal details (limits, routes, table, class or file names).
 * Texts describe what the system does, the technologies and the challenges in plain language.
 *
 * Only `id`, `title` and `stack` are required. Everything else is optional and each section of
 * the case-study modal (numbers, features, architecture, mobile screens, videos, challenges)
 * appears only when its field is filled; `kroma` below is the complete reference.
 *
 * @typedef {Object} ProjectImage
 * @property {string} src     relative path, e.g. 'assets/img/projects/<id>/desktop-01.webp'
 * @property {string} alt     describe what the screenshot shows
 * @property {number} width   intrinsic width in px (prevents layout shift)
 * @property {number} height  intrinsic height in px
 *
 * @typedef {Object} ProjectVideo
 * @property {string} src       relative path to an H.264 .mp4, e.g. 'assets/video/projects/<id>/demo.mp4'
 * @property {string} title     short caption, also the accessible name of the player
 * @property {string} [poster]  still frame shown before playing (recommended: the video only loads on play)
 * @property {number} width     intrinsic width in px
 * @property {number} height    intrinsic height in px
 *
 * @typedef {Object} Project
 * @property {string} id                                  unique slug
 * @property {string} title                               project name only (shown large)
 * @property {string} [subtitle]                          what it is, one line under the name (no dash in the title)
 * @property {'java'|'python'|'cobol'|'web'} stack        subsection where it appears
 * @property {'mobile'|'backend'|'mainframe'|'web'|'fullstack'} type  mockup: phone | terminal | terminal | browser | browser + phone
 * @property {string} summary                             short description (card, 2 to 3 lines)
 * @property {string|string[]} [description]              long description (modal), one string per paragraph
 * @property {string[]} tags                              e.g. ['Java 17', 'Spring Boot', 'PostgreSQL']
 * @property {ProjectImage[]} [images]                    desktop/main screenshots (card cover + modal carousel)
 * @property {ProjectImage[]} [mobileImages]              phone screenshots: 'fullstack' card cover + "Versão mobile"
 * @property {{value: string, label: string}[]} [stats]   key numbers, measured in the project (also the terminal screen without screenshots)
 * @property {string[]} [highlights]                      "Funcionalidades" list
 * @property {{title: string, description: string}[]} [architecture]  one item per layer
 * @property {ProjectVideo[]} [videos]                    "Demonstração em vídeo" (played inside a phone)
 * @property {{challenge: string, solution: string}[]} [challenges]  shown in the modal
 * @property {string} [demo]                              live demo URL (hidden when empty)
 * @property {number} [year]
 * @property {boolean} [featured]                         spans 2 columns on larger screens
 * @property {ProjectRecommendation[]} [alsoIn]           also recommended in other stacks' tabs (not counted there)
 *
 * @typedef {Object} ProjectRecommendation
 * @property {'java'|'python'|'cobol'|'web'} stack        tab where the recommendation card appears
 * @property {string} note                                why it matters for that stack (one or two sentences)
 * @property {string[]} [tags]                            tags for that stack (default: the project's tags)
 */

/** @type {ReadonlyArray<Project['stack']>} */
export const STACKS = ['java', 'python', 'cobol', 'web'];

const KROMA_IMG = 'assets/img/projects/kroma';
const KROMA_VIDEO = 'assets/video/projects/kroma';
const PORTFOLIO_IMG = 'assets/img/projects/portfolio';

/** @type {Project[]} */
export const projects = [
  {
    id: 'flowpay',
    title: 'FlowPay',
    subtitle: 'API de cobranças recorrentes',
    stack: 'java',
    type: 'backend',
    summary:
      'API REST em Spring Boot para gerenciar o ciclo de vida de cobranças recorrentes, com máquina de estados explícita, idempotência, retry com backoff exponencial e tratamento de erros RFC 7807.',
    description: [
      'O FlowPay cria cobranças, acompanha o seu ciclo de vida e notifica outros sistemas por webhook sempre que o status muda. Uma cobrança nasce PENDENTE e só pode ir para PAGA, VENCIDA ou CANCELADA, estados finais dos quais nenhuma transição sai. A regra fica declarada em um único lugar e qualquer movimento fora dela é recusado com um erro padronizado.',
      'A criação de cobranças é idempotente, para que um retry de rede não gere cobranças duplicadas, o webhook de saída é reenviado com backoff exponencial e todos os erros seguem a RFC 7807. O banco evolui só por migrations do Flyway, a documentação da API é gerada do código com springdoc-openapi e os testes de integração sobem um PostgreSQL real com Testcontainers.',
      'O projeto faz parte de um ecossistema simulado de sistemas financeiros: o FlowPay é a camada moderna em Java e um sistema legado em COBOL (FLOWCNAB) consumiria as cobranças pendentes para gerar a remessa bancária. Essa integração está documentada como extensão futura, fora da v1.',
    ],
    tags: ['Java 21', 'Spring Boot 3.3', 'PostgreSQL', 'Flyway', 'Docker', 'JUnit', 'Testcontainers', 'OpenAPI/Swagger'],
    stats: [
      { value: '6', label: 'endpoints REST documentados no Swagger' },
      { value: '4', label: 'estados na máquina de estados da cobrança' },
      { value: '3', label: 'migrations versionadas com Flyway' },
      { value: '9/9', label: 'testes unitários da máquina de estados passando' },
    ],
    highlights: [
      'Máquina de estados com transições explícitas (PENDENTE → PAGA / VENCIDA / CANCELADA).',
      'Idempotência na criação: uma requisição repetida não gera cobrança duplicada.',
      'Webhook de saída com retry (backoff exponencial 1s, 2s, 4s, 8s...).',
      'Erros padronizados RFC 7807 (Problem Details).',
      'Migrations versionadas com Flyway desde o primeiro commit.',
      'Testes unitários + integração com Testcontainers (Postgres real).',
    ],
    architecture: [
      {
        title: 'Domínio',
        description:
          'A cobrança e a sua máquina de estados, sem nenhuma dependência do Spring: as regras de transição são testadas sem framework e sem banco.',
      },
      {
        title: 'Aplicação',
        description: 'Casos de uso que orquestram o domínio e a infraestrutura dentro das transações.',
      },
      {
        title: 'Infraestrutura',
        description:
          'API REST com tratamento de erros centralizado no padrão RFC 7807, persistência com Spring Data JPA e cliente de webhook.',
      },
      {
        title: 'Dados e ambiente',
        description: 'PostgreSQL 16 via Docker Compose, banco versionado pelo Flyway e build com Maven.',
      },
    ],
    challenges: [
      {
        challenge: 'Evitar cobranças duplicadas quando o cliente repete a requisição após uma falha de rede.',
        solution:
          'Cada pedido de criação fica registrado com a resposta dada. A mesma requisição repetida recebe a resposta original, e um pedido diferente com a mesma identificação é recusado como conflito, em vez de ser tratado como repetição.',
      },
      {
        challenge: 'Não notificar sistemas externos sobre uma mudança de status que acabou revertida.',
        solution:
          'O webhook só dispara depois que a transação é confirmada no banco. Cada tentativa fica registrada e, depois do limite de tentativas, a notificação é marcada como falha permanente para inspeção.',
      },
      {
        challenge: 'JSON malformado retornava 500 em vez de 400, descoberto nos testes manuais pelo Swagger.',
        solution:
          'Um tratamento dedicado para corpo inválido passou a responder 400 no mesmo formato RFC 7807 do restante da API.',
      },
      {
        challenge: 'Testcontainers não encontrava o Docker no Windows com Docker Desktop 4.60+ sobre WSL2.',
        solution:
          'O diagnóstico isolou uma incompatibilidade entre a biblioteca de testes e o Docker Desktop. A limitação e os contornos testados ficaram documentados e o fluxo completo foi validado de ponta a ponta pelo Swagger.',
      },
    ],
    year: 2026,
    featured: true,
  },
  {
    id: 'copybridge',
    title: 'CopyBridge',
    subtitle: 'Ponte entre arquivos COBOL e JSON',
    stack: 'java',
    type: 'backend',
    summary:
      'Biblioteca e CLI em Java que lê copybooks COBOL e converte arquivos posicionais em JSON e de volta, com COMP-3 e fidelidade byte a byte no roundtrip.',
    description: [
      'O CopyBridge responde a uma pergunta clássica da modernização de legado: como um sistema Java consome dados que só o COBOL sabe interpretar? Em vez de reescrever a lógica, ele traduz. Um parser lê o copybook, monta a árvore de campos com offset e tamanho de cada um, e os codecs usam esse schema para converter registros de tamanho fixo em JSON e JSON de volta em registros.',
      'O coração do projeto é o COMP-3 (packed decimal): dois dígitos por byte, sinal no último nibble e casas decimais implícitas pela cláusula V do PIC. O critério de pronto é o roundtrip: arquivo → JSON → arquivo tem de produzir bytes idênticos ao original, inclusive para valores negativos e registros múltiplos.',
      'É a terceira peça de um ecossistema simulado de sistemas financeiros, ao lado do FlowPay (Java) e do FLOWCNAB (COBOL): o copybook de exemplo é um registro de detalhe CNAB 240, segmento P.',
    ],
    tags: ['Java 17', 'Maven', 'Jackson', 'JUnit 5', 'COBOL', 'COMP-3', 'CNAB 240'],
    stats: [
      { value: '52', label: 'testes JUnit passando (parser, COMP-3 e roundtrip)' },
      { value: '3', label: 'comandos na CLI: decode, encode e inspect' },
      { value: '4', label: 'representações: PIC X, PIC 9, COMP-3 e COMP/BINARY' },
      { value: '202', label: 'bytes no registro CNAB 240 de exemplo, campo a campo' },
    ],
    highlights: [
      'Parser de copybook: níveis de 01 a 49 e 77, campos de grupo, PIC X, PIC 9, PIC S9, V99, OCCURS e REDEFINES.',
      'Decode: arquivo posicional + copybook → JSON, um objeto por registro.',
      'Encode: JSON + copybook → arquivo posicional com bytes idênticos ao original.',
      'COMP-3 (packed decimal) com sinal (C, D, F) e casas decimais implícitas.',
      'COMP/BINARY big-endian em 2, 4 ou 8 bytes, com extensão de sinal.',
      'Copybooks em formato fixo (colunas 7 a 72, com números de sequência) ou livre, detectado automaticamente.',
      'CLI com os comandos decode, encode e inspect, empacotada em um único JAR.',
    ],
    architecture: [
      {
        title: 'Modelo',
        description:
          'A árvore de campos do copybook, com tipo, offset, tamanho, casas decimais, sinal, OCCURS e REDEFINES.',
      },
      {
        title: 'Parser',
        description:
          'Junta as linhas em sentenças COBOL e extrai nível, nome, PIC, USAGE, OCCURS e REDEFINES; cada PIC + USAGE vira um tipo e um tamanho em bytes.',
      },
      {
        title: 'Codec',
        description:
          'Conversão do COMP-3, leitura de bytes para JSON com Jackson e escrita de JSON para bytes, com charset ISO-8859-1 por padrão.',
      },
      {
        title: 'CLI e build',
        description: 'CLI com decode, encode e inspect; build com Maven e um único JAR executável.',
      },
    ],
    challenges: [
      {
        challenge: 'Garantir que o caminho de volta, JSON → arquivo, reproduza exatamente o arquivo original.',
        solution:
          'O roundtrip virou o critério de pronto: os testes montam registros byte a byte, decodificam, recodificam e comparam os bytes um a um. Cobrem texto, COMP-3 positivo e negativo e vários registros no mesmo arquivo.',
      },
      {
        challenge: 'Calcular o tamanho real de um campo COMP-3 a partir do PIC.',
        solution:
          'Cada byte guarda dois dígitos e o último guarda um dígito e o sinal, então o tamanho é ceil((dígitos + 1) / 2): PIC S9(13)V99 ocupa 8 bytes. A escrita recusa valores que excedem a capacidade do campo em vez de truncá-los em silêncio.',
      },
      {
        challenge: 'Aceitar copybooks escritos em formato fixo de 80 colunas e em formato livre.',
        solution:
          'Uma heurística detecta o formato fixo (linhas com mais de 72 colunas ou números de sequência nas colunas 1 a 6) e, nesse caso, descarta as áreas de sequência e identificação e trata o * da coluna 7 como comentário.',
      },
    ],
    year: 2026,
  },
  {
    id: 'kroma',
    title: 'Kroma',
    subtitle: 'Agendamento online para negócios de serviços',
    stack: 'python',
    type: 'fullstack',
    summary:
      'SaaS multi-tenant de agendamento online: o dono cria a conta sozinho e ganha portal do cliente, painel administrativo com CRM e financeiro e portal do profissional. O cliente cancela ou troca o horário pelo próprio celular, sem senha.',
    description: [
      'O Kroma dá a cada estabelecimento de serviços o seu próprio portal de agendamento. O dono cria a conta sozinho em cinco telas curtas, passa por uma configuração guiada com serviços prontos para o seu segmento e recebe o link e o QR code para divulgar. O cliente escolhe serviços, profissional, data e horário, recebe sugestões de produtos, deixa um comentário para o profissional e confirma pelo celular. Depois, o aviso "Seu horário" aparece no topo da página do estabelecimento naquele celular, com os botões Cancelar e Trocar horário, sem login e sem digitar nada.',
      'A equipe administra agenda, profissionais, serviços, produtos, financeiro e CRM. Quando precisa mudar um horário, o painel abre o WhatsApp do cliente com a mensagem pronta e mantém o aviso "Aguardando resposta" na agenda até o horário ser atualizado. Cada profissional acompanha a sua agenda, o seu desempenho e o seu próprio link de agendamento, e o dono escolhe o tema do portal (Escuro, Claro, Automático ou Salmão).',
      'O back-end é uma API em Python com FastAPI e PostgreSQL, com os dados de cada estabelecimento isolados no banco. O Redis guarda o cache e as sessões, e um job em segundo plano atualiza o status dos atendimentos e dá baixa no estoque. O dono pode ligar a verificação em duas etapas e os erros são monitorados sem dados pessoais. A cada push, o GitHub Actions roda os testes do back-end e testes de tela com Playwright, e a publicação só acontece se todos passarem.',
    ],
    tags: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Playwright',
      'GitHub Actions',
      'Docker',
      'Render',
    ],
    stats: [
      { value: '3', label: 'portais: cliente, administrador e profissional' },
      { value: '15', label: 'módulos de API em FastAPI' },
      { value: '1', label: 'área de dados isolada para cada estabelecimento' },
      { value: '25 mil+', label: 'linhas de Python, TypeScript e CSS' },
    ],
    highlights: [
      'Cadastro self-service em cinco telas: e-mail, senha com medidor de força, negócio com o link conferido na hora, dados e aceite dos termos. O dono já sai logado na configuração inicial em três passos.',
      'Agendamento online em seis etapas: serviços, profissional, data, horário, produtos sugeridos e confirmação, com comentário opcional para o profissional e horários livres calculados pelo expediente, dias de funcionamento e datas bloqueadas.',
      'Cancelamento fácil: o aviso "Seu horário" fica no celular do cliente, que cancela ou troca o horário até ele começar. O prazo do estabelecimento só marca o cancelamento como "em cima da hora".',
      'Mudar horário pelo painel: o administrador muda data, horário e profissional, o profissional muda os próprios atendimentos, sempre perguntando antes ao cliente pelo WhatsApp, com o aviso "Aguardando resposta" até a atualização.',
      'Agenda do administrador com busca por nome ou WhatsApp, quem cancelou cada horário e o WhatsApp do cliente aberto com a mensagem pronta ao cancelar.',
      'Dashboard com faturamento líquido, comissões, ocupação, cancelamentos, ranking dos profissionais e receita dos últimos seis meses; relatório financeiro por período, por serviço, produto e profissional.',
      'CRM de retenção que classifica os clientes em Frequente, Regular, Novo (primeira visita) ou Em risco, com filtros, observações e relatório em PDF.',
      'Portal do profissional com agenda da semana, comissão a receber, evolução do faturamento e o próprio link e QR code para divulgar.',
      'Configurações do negócio: vende produtos ou não, formas de pagamento, nome dado aos profissionais, datas bloqueadas, reativar profissional, trocar a própria senha e definir a senha da equipe.',
      'Temas do portal escolhidos pelo dono (Escuro, Claro, Automático e Salmão), telas ajustadas de 320 a 430 px e PWA instalável na tela inicial com o logo do Kroma.',
      'Demonstração sem senha: uma barbearia fictícia recriada todo dia, com entrada como cliente, administrador ou profissional.',
    ],
    architecture: [
      {
        title: 'Front-end',
        description:
          'Next.js 16 (App Router) com React 19, TypeScript e Tailwind CSS, sobre uma biblioteca de componentes própria. Estado com Zustand, gráficos com Recharts, PDF com jsPDF, QR codes e ícones Lucide. Páginas públicas de apresentação, cadastro, demonstração e termos, e um portal próprio para cada estabelecimento.',
      },
      {
        title: 'API',
        description:
          'FastAPI com SQLAlchemy e um módulo por domínio: cadastro, autenticação, verificação em duas etapas, estabelecimentos, agendamentos, serviços, produtos, profissionais, configurações, dashboard, relatórios, CRM e primeiros passos. Validação com mensagens em português, logs estruturados e trilha de auditoria.',
      },
      {
        title: 'Dados',
        description:
          'PostgreSQL com os dados de cada estabelecimento isolados e migrações versionadas, aplicadas automaticamente na subida do servidor. Redis para cache e sessões. O aceite dos termos fica registrado na auditoria (LGPD).',
      },
      {
        title: 'Infraestrutura',
        description:
          'Um único contêiner Docker com o front-end e a API, e jobs em segundo plano com o APScheduler. O GitHub Actions roda os testes do back-end, tipos, lint, build do front-end e testes de tela com Playwright, e a publicação só acontece depois de tudo passar.',
      },
    ],
    challenges: [
      {
        challenge: 'Isolar os dados de cada estabelecimento sem manter um banco por cliente.',
        solution:
          'Cada estabelecimento ganha a sua própria área no banco, criada no cadastro, e cada acesso é conferido contra o estabelecimento da página: quem usa um negócio nunca enxerga os dados de outro.',
      },
      {
        challenge: 'Evoluir as tabelas de todos os estabelecimentos sem parar o site nem mexer em quem já usa.',
        solution:
          'Na subida, o servidor aplica só as mudanças que faltam, um estabelecimento de cada vez: se um falhar, os outros seguem e o erro fica registrado. Toda mudança só acrescenta, então nada muda para quem já usa.',
      },
      {
        challenge: 'Deixar o cliente cancelar ou trocar o horário sem criar conta e sem expor os agendamentos dos outros.',
        solution:
          'O acesso ao horário fica só no celular de quem agendou: o cliente cancela ou troca sem senha e ninguém mais mexe naquele agendamento. Um horário que já começou não pode mais ser alterado.',
      },
      {
        challenge: 'Abrir o cadastro ao público sem deixar estabelecimentos pela metade e sem abrir a porta para robôs.',
        solution:
          'Todo o cadastro acontece numa única operação: qualquer falha desfaz tudo e nenhum estabelecimento fica pela metade. Os formulários públicos têm proteção contra robôs em várias camadas.',
      },
      {
        challenge: 'Impedir que dois clientes reservem o mesmo horário ao mesmo tempo.',
        solution:
          'Pedidos simultâneos para o mesmo profissional e a mesma data são processados um de cada vez, e só o primeiro grava. Antes disso, o pedido é recusado se a data já passou, se o dia está fechado ou se o horário está fora do expediente.',
      },
      {
        challenge: 'Proteger a conta do dono mesmo se a senha vazar, sem depender de SMS nem de e-mail.',
        solution:
          'Verificação em duas etapas com app autenticador, implementada no próprio back-end, com códigos de recuperação para o dono não perder o acesso.',
      },
      {
        challenge: 'Listar os clientes do CRM sem uma consulta extra por cliente (N+1).',
        solution:
          'Uma única consulta calcula as métricas de todos os clientes de uma vez, incluindo o ticket médio e o serviço e o profissional favoritos de cada um.',
      },
      {
        challenge: 'Executar o job de status uma única vez com vários processos do servidor.',
        solution:
          'Só um processo executa o job por vez, e cada estabelecimento é processado separadamente. Concluir os atendimentos e dar baixa no estoque acontecem juntos, na mesma operação.',
      },
    ],
    images: [
      {
        src: `${KROMA_IMG}/desktop-01-demo.webp`,
        alt: 'Entrada da demonstração do Kroma com as opções Agendar como cliente, Painel do administrador e Portal do profissional',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-02-dashboard.webp`,
        alt: 'Dashboard do administrador no tema escuro, com faturamento líquido, ocupação, cancelamentos e profissionais do mês',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-03-agenda.webp`,
        alt: 'Agenda do administrador com busca de cliente, faturamento do dia e atendimentos concluídos e cancelados',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-04-financeiro.webp`,
        alt: 'Relatório financeiro de outubro com faturamento por serviços e produtos, ticket médio e gráfico por dia',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-05-crm.webp`,
        alt: 'CRM com clientes frequentes, regulares, novos e em risco, taxa de retorno e distribuição da base',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-06-dashboard-claro.webp`,
        alt: 'Dashboard do administrador no tema claro',
        width: 2000,
        height: 1125,
      },
      {
        src: `${KROMA_IMG}/desktop-07-desempenho.webp`,
        alt: 'Portal do profissional com o desempenho do mês, comissão a receber e atendimentos por status',
        width: 2000,
        height: 1125,
      },
    ],
    mobileImages: [
      {
        src: `${KROMA_IMG}/mobile-01-demo.webp`,
        alt: 'Entrada da demonstração no celular, com os três perfis para testar sem senha',
        width: 780,
        height: 1688,
      },
      {
        src: `${KROMA_IMG}/mobile-02-agendar.webp`,
        alt: 'Primeira etapa do agendamento no celular, com os serviços e os preços',
        width: 780,
        height: 1688,
      },
      {
        src: `${KROMA_IMG}/mobile-03-seu-horario.webp`,
        alt: 'Aviso Seu horário no portal do estabelecimento, com os botões Cancelar e Trocar horário',
        width: 780,
        height: 1688,
      },
      {
        src: `${KROMA_IMG}/mobile-04-dashboard.webp`,
        alt: 'Dashboard do administrador no celular, com faturamento líquido e ocupação',
        width: 780,
        height: 1688,
      },
      {
        src: `${KROMA_IMG}/mobile-05-crm.webp`,
        alt: 'CRM no celular com clientes frequentes, regulares, novos e em risco',
        width: 780,
        height: 1688,
      },
      {
        src: `${KROMA_IMG}/mobile-06-agenda-profissional.webp`,
        alt: 'Agenda da semana do profissional no celular, com o atendimento do dia',
        width: 780,
        height: 1688,
      },
    ],
    videos: [
      {
        src: `${KROMA_VIDEO}/agendamento-cliente.mp4`,
        poster: `${KROMA_VIDEO}/agendamento-cliente-poster.webp`,
        title: 'Agendamento e cancelamento pelo cliente',
        width: 784,
        height: 1696,
      },
      {
        src: `${KROMA_VIDEO}/painel-admin.mp4`,
        poster: `${KROMA_VIDEO}/painel-admin-poster.webp`,
        title: 'Painel do administrador',
        width: 784,
        height: 1696,
      },
      {
        src: `${KROMA_VIDEO}/portal-profissional.mp4`,
        poster: `${KROMA_VIDEO}/portal-profissional-poster.webp`,
        title: 'Portal do profissional',
        width: 784,
        height: 1696,
      },
    ],
    demo: 'https://agendaflow-xdsq.onrender.com/demo',
    year: 2026,
    featured: true,
  },
  {
    id: 'funil-gh',
    title: 'Funil de Leads',
    subtitle: 'Consultoria Team GH',
    stack: 'python',
    type: 'web',
    summary:
      'Quiz de diagnóstico que capta leads para uma consultoria de treino: front-end mobile-first em JavaScript puro, API em FastAPI e dados no Supabase, publicado no Render.',
    description: [
      'O funil conduz o visitante por 12 etapas (escala de satisfação, objetivo, rotina, disponibilidade, investimento, uma tela de apresentação da consultoria, nome, WhatsApp, e-mail e consentimento LGPD) e envia as respostas para a API. As perguntas ficam em um único arquivo de dados e a interface é montada a partir dele, então o roteiro muda sem tocar na lógica.',
      'O back-end em FastAPI valida as respostas com Pydantic, padroniza o WhatsApp no formato internacional, grava no Supabase (PostgreSQL) e trata o número repetido como sucesso, sem duplicar o lead. A equipe da consultoria acompanha os leads da semana numa página interna, com um botão que abre a conversa no WhatsApp já com a mensagem pronta.',
    ],
    tags: ['Python', 'FastAPI', 'Pydantic', 'Supabase', 'PostgreSQL', 'JavaScript', 'HTML5', 'CSS3', 'Render'],
    stats: [
      { value: '12', label: 'etapas no quiz, montadas a partir de um arquivo de dados' },
      {
        value: '7',
        label: 'tipos de etapa: escala, múltipla escolha, texto, telefone, e-mail, informativa e consentimento',
      },
      { value: '1', label: 'cadastro por WhatsApp, sem leads duplicados' },
    ],
    highlights: [
      'Quiz em etapas com barra de progresso, botão de voltar e respostas preservadas no navegador.',
      'Máscara de telefone brasileiro e validação de e-mail e de campos obrigatórios em cada etapa.',
      'API em FastAPI com validação das respostas pelo Pydantic e WhatsApp padronizado no formato internacional.',
      'Lead duplicado não gera erro para o visitante nem registro repetido no banco.',
      'Página interna com os leads dos últimos 7 dias para a equipe da consultoria.',
      'Botão "Chamar no Zap" que abre o WhatsApp com a mensagem de primeiro contato já escrita.',
    ],
    architecture: [
      {
        title: 'Front-end',
        description:
          'HTML, CSS e JavaScript puros, sem framework. As perguntas ficam num arquivo de dados e a interface monta cada etapa a partir dele, valida, guarda as respostas e as envia para a API.',
      },
      {
        title: 'API',
        description:
          'FastAPI servindo o próprio front-end. Recebe e valida as respostas com Pydantic, grava o lead e alimenta a página interna da equipe.',
      },
      {
        title: 'Dados',
        description: 'Supabase (PostgreSQL), com as respostas de cada lead e um único cadastro por WhatsApp.',
      },
      {
        title: 'Deploy',
        description: 'Web service no Render com Python e Uvicorn.',
      },
    ],
    challenges: [
      {
        challenge: 'Não cadastrar o mesmo lead duas vezes quando a pessoa refaz o quiz.',
        solution:
          'O WhatsApp é padronizado antes de gravar e o banco aceita um único cadastro por número. Quando a pessoa refaz o quiz, a API responde sucesso mesmo assim: o visitante vê a tela de confirmação e a base continua limpa.',
      },
      {
        challenge: 'Permitir que o roteiro de perguntas mude sem reescrever a interface.',
        solution:
          'Cada pergunta é um item com tipo, textos e opções num arquivo de dados, e a interface desenha cada etapa pelo tipo. Reordenar, incluir ou remover perguntas é editar uma lista.',
      },
    ],
    images: [
      {
        src: 'assets/img/projects/funil-gh/desktop-01-satisfacao.webp',
        alt: 'Primeira etapa do quiz: escala de 0 a 5 sobre a satisfação com o próprio corpo, com a barra de progresso em 01 de 12',
        width: 1600,
        height: 1000,
      },
      {
        src: 'assets/img/projects/funil-gh/desktop-02-objetivo.webp',
        alt: 'Etapa de múltipla escolha sobre o principal objetivo com o treinamento personalizado',
        width: 1600,
        height: 1000,
      },
      {
        src: 'assets/img/projects/funil-gh/desktop-03-missao.webp',
        alt: 'Etapa informativa com a missão da consultoria: objetivo definido, planejamento, acompanhamento e qualidade de personal',
        width: 1600,
        height: 1000,
      },
      {
        src: 'assets/img/projects/funil-gh/desktop-04-whatsapp.webp',
        alt: 'Etapa do WhatsApp com o número mascarado e o aviso de que os dados estão seguros',
        width: 1600,
        height: 1000,
      },
      {
        src: 'assets/img/projects/funil-gh/desktop-05-enviado.webp',
        alt: 'Tela final Tudo Certo, confirmando o recebimento das respostas',
        width: 1600,
        height: 1000,
      },
    ],
    mobileImages: [
      {
        src: 'assets/img/projects/funil-gh/mobile-01-satisfacao.webp',
        alt: 'Primeira etapa do quiz no celular, com a escala de satisfação',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/funil-gh/mobile-02-objetivo.webp',
        alt: 'Pergunta sobre o objetivo principal no celular',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/funil-gh/mobile-03-missao.webp',
        alt: 'Etapa com a missão da consultoria no celular',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/funil-gh/mobile-04-whatsapp.webp',
        alt: 'Campo de WhatsApp no celular',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/funil-gh/mobile-05-enviado.webp',
        alt: 'Confirmação de envio no celular',
        width: 393,
        height: 800,
      },
    ],
    year: 2026,
  },
  {
    id: 'cb7-bank',
    title: 'CB7 Bank',
    subtitle: 'Sistema bancário em COBOL com API em Java',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Núcleo bancário de estudo em três frentes sobre o mesmo dado: COBOL batch, COBOL com SQL embutido no PostgreSQL e uma API REST em Java e Spring Boot, todos com as mesmas regras de depósito, saque e transferência.',
    description: [
      'O CB7 Bank simula o núcleo de um banco e mostra o caminho de um sistema COBOL até uma arquitetura integrada. Um programa batch lê clientes, contas e transações em arquivos de largura fixa, como um job noturno, atualiza os saldos e emite um relatório. Dois programas COBOL com SQL embutido fazem a consulta de clientes e o processamento de transações direto no PostgreSQL, e uma API REST em Java 17 e Spring Boot opera as mesmas tabelas.',
      'As regras são as mesmas nas três frentes: o valor precisa ser maior que zero, o saque não passa do saldo e a transferência exige origem e destino existentes e diferentes. Débito e crédito acontecem juntos ou nenhum acontece, e uma operação recusada fica com status NEGADA e o motivo, sem tocar em nenhum saldo. Um JCL de exemplo descreve o mesmo fluxo em três etapas, como seria agendado em um mainframe.',
      'O projeto foi construído em nove fases, do COBOL interativo até a API com testes automatizados, e cada fase virou um commit. É um projeto de estudo: autenticação, autorização e os controles de um serviço financeiro real ficam fora do escopo, e esses limites ficam documentados.',
    ],
    tags: ['COBOL', 'GnuCOBOL', 'SQL embutido', 'JCL', 'PostgreSQL', 'Java 17', 'Spring Boot', 'JUnit'],
    stats: [
      { value: '7', label: 'programas COBOL: interativo, batch, SQL embutido e leitores de arquivo' },
      { value: '6', label: 'endpoints REST na API Spring Boot sobre o mesmo banco' },
      { value: '11', label: 'testes automatizados da API com JUnit, MockMvc e H2' },
      { value: '4', label: 'tabelas PostgreSQL compartilhadas pelo COBOL e pelo Java' },
    ],
    highlights: [
      'Processamento batch de clientes, contas e transações em arquivos sequenciais de largura fixa.',
      'Depósito, saque e transferência com aprovação ou recusa e o motivo de cada recusa.',
      'Saídas do batch: contas atualizadas, transações processadas e relatório com totais e saldos finais.',
      'Consulta de cliente por CPF e processamento de transações em COBOL com SQL embutido, com COMMIT e ROLLBACK.',
      'API REST para consultar cliente, conta e extrato e para depositar, sacar e transferir.',
      'Respostas HTTP por tipo de falha: 400 para corpo inválido, 404 para conta inexistente e 422 para regra de negócio.',
      'JCL de exemplo com três etapas encadeadas: validação, processamento e relatório.',
      'Dez cenários do batch documentados em casos de teste, nove executados com sucesso e um registrado como limitação do layout.',
    ],
    architecture: [
      {
        title: 'COBOL batch',
        description:
          'Um programa batch carrega clientes e contas em memória, processa o arquivo de transações e gera as contas atualizadas, as transações processadas e um relatório. Roda em GnuCOBOL só com arquivos, sem banco.',
      },
      {
        title: 'COBOL com SQL embutido',
        description:
          'Dois programas consultam clientes por CPF e processam transações direto no PostgreSQL, confirmando cada operação só no fim e desfazendo tudo em qualquer falha.',
      },
      {
        title: 'API Java',
        description:
          'API em Spring Boot 3 com controllers, DTOs, um serviço transacional e repositórios JPA. Usa o banco existente sem alterá-lo e trava as contas durante cada operação.',
      },
      {
        title: 'Banco e operação',
        description:
          'Banco PostgreSQL com clientes, contas, cartões e transações, que não aceita saldo negativo. O JCL descreve o job em um z/OS e os testes da API usam um banco em memória.',
      },
    ],
    challenges: [
      {
        challenge: 'Uma transferência pela metade, com o débito feito e o crédito não, faz o dinheiro sumir.',
        solution:
          'No COBOL com SQL, o débito só acontece se houver saldo, o programa confere que exatamente uma conta mudou e só confirma depois do crédito e do registro da transação; qualquer falha desfaz tudo. No batch, os dois novos saldos são calculados antes e gravados só se ambos couberem nos campos.',
      },
      {
        challenge: 'Na API, dois saques ao mesmo tempo podem ler o mesmo saldo e aprovar juntos mais do que existe.',
        solution:
          'As contas ficam travadas durante a transação, e na transferência as duas são travadas sempre na mesma ordem, para que duas transferências opostas não fiquem esperando uma pela outra.',
      },
      {
        challenge: 'Um saldo maior que a capacidade do campo seria truncado sem aviso.',
        solution:
          'No COBOL, a operação é recusada com o motivo quando o resultado não cabe no campo. Na API, o valor máximo acompanha o tamanho do saldo no banco, que também recusa saldo negativo.',
      },
      {
        challenge: 'O valor da transação no arquivo do batch é um campo sem sinal, que não representa valor negativo.',
        solution:
          'O cenário ficou documentado nos casos de teste como limitação do layout, com o caminho para resolver (campo com sinal ou validação da entrada em texto). Na API, valor negativo é recusado e coberto por teste automatizado.',
      },
    ],
    // Lives in COBOL; recommended in the Java tab too, for its Spring Boot API
    alsoIn: [
      {
        stack: 'java',
        note: 'O sistema está na aba COBOL, mas tem uma API REST em Java 17 e Spring Boot sobre o mesmo banco: transações com bloqueio das contas, respostas 400, 404 e 422 e onze testes automatizados.',
        tags: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL', 'JUnit', 'MockMvc'],
      },
    ],
    year: 2026,
    featured: true,
  },
  {
    id: 'flowcnab',
    title: 'FLOWCNAB',
    subtitle: 'Batch de remessa e retorno bancário (CNAB 240)',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Processo batch noturno em COBOL: gera a remessa CNAB 240 de boletos no layout do Itaú, simula a resposta do banco e processa o retorno com um relatório de conciliação.',
    description: [
      'Toda empresa que cobra clientes em volume roda um batch como este: empacota as cobranças pendentes em um arquivo que o banco entende (a remessa) e, no dia seguinte, lê a resposta do banco (o retorno) para saber quem pagou. O FLOWCNAB faz esse ciclo com três programas COBOL encadeados (gerar a remessa, simular o banco e processar o retorno), e um JCL de exemplo mostra como o job seria agendado em um z/OS.',
      'A remessa segue a hierarquia FEBRABAN: header de arquivo, header de lote, segmentos P e Q por título, trailer de lote e trailer de arquivo, cada linha com exatamente 240 posições. Antes de virar título, cada cobrança passa por uma crítica: nosso número inválido ou duplicado, valor zerado, vencimento inválido e campo numérico do pagador com texto são descartados com aviso. Em COBOL, mover texto para um campo PIC 9 não dá erro, grava zeros, e o problema só apareceria no banco.',
      'O processamento do retorno casa cada título pelo nosso número, marca o título como pago, pago com atraso ou rejeitado com o motivo, e emite um relatório que confere sozinho a identidade enviados = pagos + com atraso + rejeitados + pendentes. É a peça de mainframe do ecossistema FlowPay → FLOWCNAB → CopyBridge, mas funciona de forma independente. Roda em GnuCOBOL 3.3, sem mainframe.',
    ],
    tags: ['COBOL', 'GnuCOBOL 3.3', 'CNAB 240', 'JCL', 'Copybooks', 'Batch', 'Python', 'Shell Script'],
    stats: [
      { value: '3', label: 'programas COBOL encadeados: remessa, simulador de banco e retorno' },
      { value: '240', label: 'posições fixas em todas as linhas, validadas a cada execução' },
      { value: '11', label: 'copybooks: registros CNAB 240, arquivos internos e constantes' },
      { value: '36', label: 'verificações de regressão passando, incluindo casos de borda' },
    ],
    highlights: [
      'Geração da remessa CNAB 240 de cobrança por boleto no layout do Itaú (341), com segmentos P e Q.',
      'Crítica de entrada: nosso número inválido ou duplicado, valor zerado, vencimento inválido e dados numéricos do pagador.',
      'Simulador de banco que devolve um retorno plausível: pagos no prazo, pagos com atraso e rejeitados com motivos variados.',
      'Processamento do retorno (segmentos T e U) com atualização de status de cada título.',
      'Relatório de conciliação que confere a própria soma e imprime Conferencia: OK ou DIVERGENTE.',
      'Anomalias do retorno tratadas: par T/U quebrado, retorno órfão, ocorrência repetida e valor pago divergente.',
      'Convenção de batch com RETURN-CODE 0 (ok), 4 (aviso) e 8 (erro fatal), respeitada pelos três programas.',
      'JCL de exemplo com os quatro steps do job noturno e a sugestão de agendamento.',
    ],
    architecture: [
      {
        title: 'Programas',
        description:
          'Três programas encadeados: o primeiro critica as cobranças e grava a remessa, o segundo faz o papel do banco e o terceiro processa o retorno, atualiza os status e emite a conciliação.',
      },
      {
        title: 'Copybooks',
        description:
          'Um copybook por registro CNAB 240 (headers, segmentos P, Q, T e U, trailers), os registros internos de cobrança pendente e de status, e um copybook de constantes compartilhado pelos três programas.',
      },
      {
        title: 'Arquivos',
        description:
          'Persistência em arquivos sequenciais de largura fixa. Um banco PostgreSQL acessado por SQL embutido fica documentado como caminho de evolução.',
      },
      {
        title: 'Execução e testes',
        description:
          'Scripts validam o tamanho dos copybooks, compilam e rodam o fluxo de ponta a ponta, parando se um passo terminar com erro fatal; os testes cobrem o caminho feliz e os casos de borda. O JCL mostra o mesmo job em um z/OS.',
      },
    ],
    challenges: [
      {
        challenge: 'Um MOVE de texto para um campo PIC 9 não falha em COBOL: grava zeros e o erro só apareceria no banco.',
        solution:
          'A crítica da remessa testa NOT NUMERIC em tudo que vira campo numérico no CNAB (nosso número, valor, CEP, CPF/CNPJ e tipo de inscrição) e descarta o título com um aviso que diz o motivo, terminando com RETURN-CODE 4.',
      },
      {
        challenge: 'Decidir "pago com atraso" comparando datas no formato do banco dá o resultado errado.',
        solution:
          'Como número, 01/10/2026 (01102026) é menor que 20/09/2026 (20092026). Os arquivos internos usam AAAAMMDD, em que a ordem numérica é a cronológica, e a conversão de e para DDMMAAAA acontece em exatamente dois pontos, um em cada programa.',
      },
      {
        challenge: 'Um relatório de conciliação que exibe números que não somam passa despercebido.',
        solution:
          'O processamento do retorno calcula enviados = pagos + com atraso + rejeitados + pendentes e imprime a conferência; retorno órfão, ocorrência repetida ou valor divergente marcam a conciliação como divergente e encerram com RETURN-CODE 4.',
      },
      {
        challenge: 'A tabela em memória do processamento do retorno tem capacidade fixa e estourá-la corromperia a memória.',
        solution:
          'O limite de títulos fica num copybook compartilhado; a geração da remessa impõe o mesmo teto e para com RETURN-CODE 8 e uma mensagem explicando que a carga deve ser dividida.',
      },
    ],
    year: 2026,
    featured: true,
  },
  {
    id: 'cobol-validacao-saldo',
    title: 'Validação de Saldo',
    subtitle: 'Saque com checagem de saldo e taxa de manutenção',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Programa COBOL que recusa o saque quando falta saldo e desconta uma taxa de manutenção quando a conta fica abaixo de R$ 100.',
    description: [
      'Recebe o saldo atual e o valor do saque. Se o saque é maior que o saldo, a operação é recusada com a mensagem SALDO INSUFICIENTE e o saldo fica como estava. Caso contrário, o saque é feito e, se o saldo restante ficar abaixo de R$ 100,00, é descontada a taxa de manutenção de R$ 5,00.',
      'Executado no GnuCOBOL: com saldo de 500 e saque de 450, o saldo final é 45,00 (sobram 50 e a taxa é descontada); com saldo de 100 e saque de 300, o programa responde SALDO INSUFICIENTE e mantém os 100,00.',
    ],
    tags: ['COBOL', 'GnuCOBOL'],
    highlights: [
      'Regra de negócio com IF aninhado: saldo insuficiente, saque normal e saque com taxa.',
      'Taxa de manutenção declarada como valor inicial do campo (VALUE 5.00).',
      'Campos monetários com casas decimais implícitas (PIC 9(7)V99).',
    ],
    year: 2026,
  },
  {
    id: 'cobol-seguradora',
    title: 'Seguro de Veículo',
    subtitle: 'Cálculo do seguro pelo perfil do condutor',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Programa COBOL que classifica o condutor pela idade e calcula o valor do seguro como um percentual do valor do veículo.',
    description: [
      'Recebe o valor do veículo e a idade do condutor. Condutores com menos de 25 anos entram no perfil JOVEM, com 5% do valor do veículo; os demais entram no perfil EXPERIENTE, com 3%.',
      'Executado no GnuCOBOL: para um veículo de R$ 80.000, o seguro sai por 4.000,00 para um condutor de 22 anos e por 2.400,00 para um de 40.',
    ],
    tags: ['COBOL', 'GnuCOBOL'],
    highlights: [
      'Classificação do perfil de risco com IF / ELSE.',
      'Percentual definido pela regra e aplicado com COMPUTE.',
      'Programa no formato fixo, com numeração de sequência nas colunas 1 a 6.',
    ],
    year: 2026,
  },
  {
    id: 'cobol-saldo-conta',
    title: 'Saldo da Conta',
    subtitle: 'Depósito, saque e situação da conta corrente',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Programa COBOL que aplica um depósito e um saque ao saldo da conta corrente e informa se a conta ficou positiva ou negativa.',
    description: [
      'Recebe o saldo atual, o valor depositado e o valor do saque, calcula o saldo final e informa se a conta está POSITIVO ou NEGATIVO.',
      'Executado no GnuCOBOL: com saldo de 1.000, depósito de 200 e saque de 300, o saldo final é +900,00; com saldo de 100 e saque de 500, é -400,00 e a conta aparece como NEGATIVO.',
    ],
    tags: ['COBOL', 'GnuCOBOL'],
    highlights: [
      'Saldo final com sinal (PIC S9), capaz de representar conta negativa.',
      'Situação da conta decidida por IF sobre o resultado do COMPUTE.',
    ],
    challenges: [
      {
        challenge: 'Uma conta com saque maior que o saldo aparecia como POSITIVO, com saldo de 400 em vez de -400.',
        solution:
          'O campo do saldo final era PIC 9(7)V99, sem sinal: o COBOL descartava o "-" do resultado e o teste < ZEROS nunca era verdadeiro. Com PIC S9(7)V99 o campo guarda o sinal e a conta negativa passa a ser identificada.',
      },
    ],
    year: 2026,
  },
  {
    id: 'cobol-emprestimo',
    title: 'Simulador de Empréstimo',
    subtitle: 'Parcela mensal e classificação da taxa',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Programa COBOL que calcula a parcela mensal de um empréstimo a partir do valor, da taxa de juros e do número de parcelas, e classifica a taxa.',
    description: [
      'Recebe o valor do empréstimo, a taxa de juros em % e o número de parcelas. Aplica a taxa sobre o valor, divide pelo número de parcelas e classifica a taxa como BAIXA (abaixo de 5%) ou ALTA.',
      'Executado no GnuCOBOL: R$ 10.000 a 3% em 12 parcelas resultam em parcelas de 858,33 com TAXA BAIXA; a 8% em 10 parcelas, 1.080,00 com TAXA ALTA.',
    ],
    tags: ['COBOL', 'GnuCOBOL'],
    highlights: [
      'Cálculo da parcela em uma única expressão COMPUTE.',
      'Classificação da taxa com IF / ELSE.',
      'Cabeçalho completo da IDENTIFICATION DIVISION: autor, data e instalação.',
    ],
    year: 2026,
  },
  {
    id: 'cobol-juros-simples',
    title: 'Calculadora de Juros Simples',
    subtitle: 'Juros e montante a partir de capital, taxa e prazo',
    stack: 'cobol',
    type: 'mainframe',
    summary:
      'Programa COBOL que calcula os juros simples e o valor final a partir do capital, da taxa mensal e do prazo em meses.',
    description: [
      'Recebe o valor inicial, a taxa de juros mensal em % e o tempo em meses, e aplica a fórmula dos juros simples, J = C × i × t, para mostrar os juros e o valor final.',
      'Executado no GnuCOBOL: R$ 1.000 a 2% ao mês por 12 meses geram 240,00 de juros e 1.240,00 no final; R$ 2.500 a 1,5% por 6 meses, 225,00 e 2.725,00.',
    ],
    tags: ['COBOL', 'GnuCOBOL'],
    highlights: [
      'Fórmula de juros simples com COMPUTE e taxa percentual.',
      'Taxa com casas decimais (PIC 9(3)V99), aceitando valores como 1,5%.',
      'Parágrafo nomeado na PROCEDURE DIVISION.',
    ],
    year: 2026,
  },
  {
    id: 'portfolio',
    title: 'Portfólio Pessoal',
    subtitle: 'Este site, em HTML, CSS e JavaScript puros',
    stack: 'web',
    type: 'web',
    summary:
      'Página única feita sem framework nem etapa de build, no sistema de vidro em preto e branco, com estudos de caso, abas acessíveis e certificados num trilho horizontal.',
    description: [
      'Este portfólio é o próprio projeto: uma página única para recrutadores, feita com HTML, CSS e JavaScript puros, sem framework, sem dependência e sem etapa de build. O conteúdo vem de arquivos de dados e é montado no navegador como texto puro, e cada projeto ganha um estudo de caso com números medidos, capturas e vídeos.',
      'O visual segue um sistema de vidro: fundo quase preto, painéis de vidro fosco e uma interface toda em preto e branco, em que a única cor é a luz fora de foco atrás do vidro, com uma tinta por stack.',
      'Acessibilidade e desempenho foram medidos, e não supostos: contraste AA conferido nos pixels reais atrás de cada texto, navegação completa por teclado, movimento reduzido respeitado e no máximo três superfícies com desfoque visíveis ao mesmo tempo. O site é publicado no Render a cada push, com política de segurança de conteúdo.',
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'ES Modules', 'Cascade Layers', 'WCAG 2.1 AA'],
    images: [
      { src: `${PORTFOLIO_IMG}/desktop-01-inicio.webp`, alt: 'Início do portfólio: painel de vidro com o nome, o cargo, os botões e a foto', width: 2000, height: 1250 },
      { src: `${PORTFOLIO_IMG}/desktop-04-certificados.webp`, alt: 'Trilho horizontal de certificados, com o contador e as setas', width: 2000, height: 1250 },
    ],
    mobileImages: [
      { src: `${PORTFOLIO_IMG}/mobile-01-inicio.webp`, alt: 'Início do portfólio no celular', width: 780, height: 1688 },
      { src: `${PORTFOLIO_IMG}/mobile-03-menu.webp`, alt: 'Menu de navegação aberto no celular', width: 780, height: 1688 },
    ],
    stats: [
      { value: '0', label: 'dependências de runtime e nenhuma etapa de build' },
      { value: '100', label: 'em acessibilidade, boas práticas e SEO no Lighthouse mobile' },
    ],
    highlights: [
      'Sistema de vidro com três materiais (vidro, relevo e sólido): interface em preto e branco e cor só na luz de fundo, com uma tinta por stack.',
      'Projetos numa área só, com abas acessíveis que filtram no lugar e mostram quantos projetos cada stack tem.',
      'Estudo de caso de cada projeto num modal com leitura principal, coluna de apoio, carrossel de capturas e vídeos.',
      'Certificados num trilho horizontal com contador e setas, com imagens geradas em alta resolução a partir dos PDFs originais.',
      'Menu no celular com foco preso, Esc para fechar e fundo inerte; anel de foco visível em todos os controles.',
      'Movimento reduzido respeitado: com a preferência ligada, nada anima e nada fica invisível.',
      'Publicado no Render como site estático, com política de segurança de conteúdo e cache por tipo de arquivo.',
    ],
    architecture: [
      {
        title: 'HTML',
        description:
          'HTML semântico com todo o texto fixo do site, um h1 e uma section por assunto. Título, descrição, Open Graph e JSON-LD ficam estáticos, porque buscadores não executam JavaScript.',
      },
      {
        title: 'CSS',
        description:
          'Cascade layers declaradas uma única vez, de reset a utilities; um arquivo de tokens é o único lugar com valores crus e cada seção tem o seu arquivo. As três superfícies são componentes reutilizados no site inteiro.',
      },
      {
        title: 'JavaScript',
        description:
          'Módulos nativos, cada um iniciado isoladamente, de modo que um erro não derruba o resto. Projetos, formação e certificados entram na página como texto puro, nunca como HTML, e todo endereço é conferido antes de virar link.',
      },
      {
        title: 'Publicação',
        description:
          'A publicação copia só os arquivos públicos e define a política de segurança de conteúdo e o cache: CSS e JS revalidados a cada visita, imagens por um dia.',
      },
    ],
    challenges: [
      {
        challenge: 'A luz da área de projetos sumia sem nenhum erro no console.',
        solution:
          'Um valor global dependia de uma informação que só existe dentro de cada área, e o navegador descartava o gradiente inteiro em silêncio. O gradiente passou a ser montado no próprio elemento, e uma verificação automática garante que os tokens globais só dependem de outros tokens globais.',
      },
      {
        challenge: 'Vidro quase transparente sobre a luz mais forte deixava texto pequeno abaixo do contraste AA.',
        solution:
          'O contraste foi medido nos pixels reais atrás de cada texto, com capturas da página com e sem o texto. Uma película escura sob o vidro levou o pior caso acima de 4.5:1, com e sem backdrop-filter.',
      },
      {
        challenge: 'Desfoque em muitas superfícies ao mesmo tempo engasga a rolagem no celular.',
        solution:
          'Teto de três superfícies com backdrop-filter visíveis, conferido rolando a página e contando: os cartões que se repetem são sólidos e os botões sobre vidro não têm desfoque próprio.',
      },
      {
        challenge: 'Com os nomes de arquivo sem hash, quem visitou o site no dia anterior receberia o HTML novo com o CSS e o JS antigos.',
        solution:
          'CSS e JS passaram a ser revalidados a cada visita (uma resposta 304 rápida quando não mudaram), enquanto imagens, vídeos e ícones continuam guardados por um dia.',
      },
    ],
    demo: 'https://jose-hoschett-portfolio.onrender.com',
    year: 2026,
    featured: true,
  },
  {
    id: 'aura-store',
    title: 'AURA',
    subtitle: 'Loja de moda feminina',
    stack: 'web',
    type: 'web',
    summary:
      'Loja virtual de streetwear feminino em Next.js e TypeScript: catálogo com filtros, página de produto, provador virtual que calcula o tamanho ideal e sacola que fecha o pedido pelo WhatsApp.',
    description: [
      'A AURA é uma vitrine de moda com conversão pelo WhatsApp: a cliente navega pela coleção, escolhe cor, tamanho e quantidade, e a sacola monta a comanda do pedido (peça, cor, tamanho, quantidade, valor e total) e abre a conversa com a loja com a mensagem pronta. Uma barra mostra quanto falta para o frete grátis.',
      'Na página do produto, o provador virtual tem duas abas: uma galeria com zoom e troca de cor e tamanho sincronizada com a página, e um comparador de medidas em que a cliente informa busto, cintura e quadril e recebe na hora o tamanho recomendado e o tipo de caimento. A identidade visual, com paleta rosé e movimentos lentos e elegantes, fica em tokens do Tailwind CSS v4, e os produtos e textos da marca ficam em arquivos de dados próprios. As peças e fotos atuais são dados de exemplo, à espera do catálogo real da marca.',
    ],
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Framer Motion', 'Zustand'],
    stats: [
      { value: '3', label: 'páginas: início, catálogo com filtros e produto' },
      { value: '6', label: 'seções na página inicial, do hero ao CTA final' },
      { value: '3', label: 'medidas cruzadas pelo provador para indicar o tamanho' },
      { value: '1', label: 'arquivo de dados para editar todo o catálogo' },
    ],
    highlights: [
      'Catálogo com filtro por categoria e por novidades, guardado no endereço da página.',
      'Página de produto com galeria, seletor de cor, tamanho e quantidade.',
      'Provador virtual com galeria, zoom e comparador de medidas que recomenda o tamanho e o caimento.',
      'Sacola lateral com Zustand: abre ao adicionar, soma itens iguais e mostra o progresso até o frete grátis.',
      'Finalização pelo WhatsApp com a comanda do pedido formatada na mensagem.',
      'Animações lentas com Framer Motion, sem bounce, seguindo a identidade da marca.',
      'Menu mobile animado e botão flutuante de WhatsApp que aparece depois da rolagem na página inicial.',
      'Metadados por produto gerados no servidor (App Router) para SEO e compartilhamento.',
    ],
    architecture: [
      {
        title: 'Páginas',
        description:
          'Next.js App Router: página inicial (hero, coleção da semana, manifesto, benefícios, depoimentos e CTA), catálogo e página de produto, em que o servidor resolve o produto e os metadados e o navegador cuida da interação.',
      },
      {
        title: 'Componentes',
        description:
          'Layout (menu, rodapé e botão de WhatsApp), produto (card, galeria, filtros e provador virtual) e sacola lateral, reutilizados entre a página inicial e o catálogo.',
      },
      {
        title: 'Estado',
        description:
          'Zustand com duas stores: uma para a sacola (itens, total, abrir e fechar, finalização) e outra para a interface (menu aberto).',
      },
      {
        title: 'Dados e estilo',
        description:
          'Produtos tipados e dados da marca (contatos, redes, SEO e frete) em arquivos de dados próprios. Tokens de cor, raio e movimento definidos no Tailwind CSS v4.',
      },
    ],
    challenges: [
      {
        challenge: 'Ajudar a cliente a escolher o tamanho sem provador físico.',
        solution:
          'Cada tamanho guarda a faixa de busto, cintura e quadril em centímetros. O algoritmo descarta os tamanhos em que alguma medida informada passa do limite, escolhe o menor disponível na peça e classifica o caimento como perfeito, folgado ou justo; um botão aplica o tamanho na página.',
      },
      {
        challenge: 'Fechar a venda sem gateway de pagamento.',
        solution:
          'A sacola gera a comanda com cada item, a cor, o tamanho, a quantidade e o total, e abre o WhatsApp da loja com a mensagem codificada na URL. A conversa já começa com o pedido completo.',
      },
      {
        challenge: 'Deixar a loja editável por quem não programa.',
        solution:
          'Produtos, textos institucionais e contatos ficam centralizados em arquivos de dados, com o passo a passo para adicionar, remover ou tirar uma peça do ar documentado no projeto.',
      },
    ],
    images: [
      {
        src: 'assets/img/projects/aura-store/desktop-01-inicio.webp',
        alt: 'Página inicial da AURA com a foto de campanha, o título da coleção e os botões Ver coleção e Nossa história',
        width: 1600,
        height: 938,
      },
      {
        src: 'assets/img/projects/aura-store/desktop-02-novidades.webp',
        alt: 'Catálogo filtrado por novidades, com os filtros de categoria no topo e os cards de produto com selo de novo e desconto',
        width: 1600,
        height: 938,
      },
      {
        src: 'assets/img/projects/aura-store/desktop-03-produto.webp',
        alt: 'Página do Blazer Rosé Oversized com preço, desconto, descrição e seletores de cor, tamanho e quantidade',
        width: 1600,
        height: 938,
      },
      {
        src: 'assets/img/projects/aura-store/desktop-04-sacola.webp',
        alt: 'Sacola lateral aberta com o item, a barra de frete grátis, o total e o botão Finalizar via WhatsApp',
        width: 1600,
        height: 938,
      },
      {
        src: 'assets/img/projects/aura-store/desktop-05-provador.webp',
        alt: 'Provador virtual na aba Encontrar tamanho: medidas de busto, cintura e quadril e o tamanho M recomendado com caimento perfeito',
        width: 1600,
        height: 938,
      },
    ],
    mobileImages: [
      {
        src: 'assets/img/projects/aura-store/mobile-01-inicio.webp',
        alt: 'Página inicial da AURA no celular',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/aura-store/mobile-02-novidades.webp',
        alt: 'Catálogo de novidades no celular, em duas colunas',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/aura-store/mobile-03-sacola.webp',
        alt: 'Sacola no celular com o botão de finalizar pelo WhatsApp',
        width: 393,
        height: 800,
      },
      {
        src: 'assets/img/projects/aura-store/mobile-04-provador.webp',
        alt: 'Provador virtual no celular com o tamanho recomendado',
        width: 393,
        height: 800,
      },
    ],
    demo: '', // TODO(jose): link quando o deploy na Vercel estiver no ar
    year: 2026,
  },
];
