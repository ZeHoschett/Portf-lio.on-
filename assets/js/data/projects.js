/**
 * Projects shown in #projetos. Each project appears ONLY in the subsection of its `stack`.
 * How to add one: see README.md → "Como adicionar um novo projeto".
 *
 * Only `id`, `title` and `stack` are required. Everything else is optional and each section of
 * the case-study modal (numbers, features, architecture, mobile screens, videos, code, challenges)
 * appears only when its field is filled — `agendaflow` below is the complete reference.
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
 * @typedef {Object} CodeSample
 * @property {string} fileName    path shown in the window bar; the tab shows its last segment
 * @property {string} code        real excerpt of the project (never invented)
 * @property {'python'|'sql'|'typescript'|'javascript'|'java'|'cobol'} [language]  grammar when it differs from the stack
 * @property {string} [caption]   one sentence: what this excerpt shows
 *
 * @typedef {Object} Project
 * @property {string} id                                  unique slug
 * @property {string} title
 * @property {'java'|'python'|'cobol'|'web'} stack        subsection where it appears
 * @property {'mobile'|'backend'|'mainframe'|'web'|'fullstack'} type  mockup: phone | terminal | terminal | browser | browser + phone
 * @property {string} summary                             short description (card, 2–3 lines)
 * @property {string|string[]} [description]              long description (modal), one string per paragraph
 * @property {string[]} tags                              e.g. ['Java 17', 'Spring Boot', 'PostgreSQL']
 * @property {ProjectImage[]} [images]                    desktop/main screenshots (card cover + modal carousel)
 * @property {ProjectImage[]} [mobileImages]              phone screenshots: 'fullstack' card cover + "Versão mobile"
 * @property {{value: string, label: string}[]} [stats]   key numbers, measured in the project
 * @property {string[]} [highlights]                      "Funcionalidades" list
 * @property {{title: string, description: string}[]} [architecture]  one item per layer
 * @property {CodeSample[]} [codeSamples]                 "Código em destaque" (tabs when more than one)
 * @property {ProjectVideo[]} [videos]                    "Demonstração em vídeo" (played inside a phone)
 * @property {string} [codeSnippet]                       optional code for terminal mockups
 * @property {string} [fileName]                          terminal title (default: id + extension)
 * @property {{challenge: string, solution: string}[]} [challenges]  shown in the modal
 * @property {string} [repo]                              repository URL (hidden when empty)
 * @property {string} [demo]                              live demo URL (hidden when empty)
 * @property {number} [year]
 * @property {boolean} [featured]                         spans 2 columns on larger screens
 */

/** @type {ReadonlyArray<Project['stack']>} */
export const STACKS = ['java', 'python', 'cobol', 'web'];

const AGENDAFLOW_IMG = 'assets/img/projects/agendaflow';
const AGENDAFLOW_VIDEO = 'assets/video/projects/agendaflow';

/** @type {Project[]} */
export const projects = [
  {
    id: 'agendaflow',
    title: 'AgendaFlow',
    stack: 'python',
    type: 'fullstack',
    summary:
      'SaaS multi-tenant de agendamento online para barbearias, salões e clínicas: portal do cliente, painel administrativo com CRM e financeiro e portal do profissional.',
    description: [
      'O AgendaFlow dá a cada estabelecimento de serviços o seu próprio portal de agendamento. O cliente escolhe serviços, profissional, data e horário, recebe sugestões de produtos e confirma pelo celular. A equipe administra agenda, profissionais, serviços, produtos, financeiro e CRM em um painel próprio, e cada profissional acompanha a sua agenda e o seu desempenho.',
      'O back-end é uma API em Python com FastAPI e PostgreSQL, em que cada estabelecimento recebe um schema isolado no banco, criado automaticamente no cadastro. O Redis guarda o cache de estabelecimentos e o controle de sessões, e um job em segundo plano atualiza o status dos atendimentos e dá baixa no estoque dos produtos vendidos. O front-end em Next.js e TypeScript é mobile-first, instalável como PWA e tem tema claro e escuro.',
    ],
    tags: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Docker',
    ],
    stats: [
      { value: '3', label: 'portais: cliente, administrador e profissional' },
      { value: '12', label: 'módulos de API em FastAPI' },
      { value: '1 schema', label: 'PostgreSQL isolado por estabelecimento' },
      { value: '19 mil+', label: 'linhas de Python, TypeScript e CSS' },
    ],
    highlights: [
      'Agendamento online em etapas: serviços, profissional, data, horário, produtos sugeridos e confirmação.',
      'Horários livres calculados pelo expediente, dias de funcionamento e datas bloqueadas, com sugestão de outro profissional quando o horário está ocupado.',
      'Dashboard do administrador com faturamento líquido, comissões, ocupação, cancelamentos e gráfico de receita.',
      'CRM de retenção que classifica os clientes em Frequente, Regular ou Em risco e exporta relatório em PDF.',
      'Relatório financeiro por período, com totais por serviço, produto e profissional.',
      'Portal do profissional com agenda do dia, comissão a receber e evolução do faturamento.',
      'Onboarding obrigatório no primeiro acesso do administrador para configurar o estabelecimento.',
      'PWA instalável na tela inicial, mobile-first, com tema claro e escuro.',
    ],
    architecture: [
      {
        title: 'Front-end',
        description:
          'Next.js (App Router) com React, TypeScript e Tailwind CSS. Sessão com Zustand, formulários com React Hook Form e Zod, gráficos com Recharts e PDF com jsPDF. Rotas dinâmicas por estabelecimento: /[slug], /[slug]/admin e /[slug]/profissional.',
      },
      {
        title: 'API',
        description:
          'FastAPI com SQLAlchemy e um router por domínio: autenticação, estabelecimentos, agendamentos, serviços, produtos, profissionais, dashboard, relatórios e CRM. Limite de tentativas no login com slowapi, logs em JSON com ID de correlação por requisição e trilha de auditoria.',
      },
      {
        title: 'Dados',
        description:
          'PostgreSQL com um schema por estabelecimento (tenant_<slug>) e índices nas consultas de agenda; Alembic para as migrações do schema público. Redis para cache de estabelecimentos (5 min), blacklist de access tokens e whitelist de refresh tokens.',
      },
      {
        title: 'Infraestrutura',
        description:
          'Docker Compose com Nginx como proxy reverso na frente da API e do front-end, Redis em contêiner e APScheduler para os jobs em segundo plano.',
      },
    ],
    challenges: [
      {
        challenge: 'Isolar os dados de cada estabelecimento sem manter um banco por cliente.',
        solution:
          'Cada estabelecimento ganha um schema PostgreSQL próprio, criado com todas as tabelas no cadastro. O token carrega o slug do estabelecimento e uma dependência do FastAPI o compara com o slug da URL, bloqueando o acesso cruzado mesmo com um token válido.',
      },
      {
        challenge: 'Listar os clientes do CRM sem uma consulta extra por cliente (N+1).',
        solution:
          'Uma única consulta com CTEs agrega as métricas de cada cliente e usa DISTINCT ON com COUNT(*) OVER (PARTITION BY …) para encontrar o serviço e o profissional favoritos.',
      },
      {
        challenge: 'Manter a sessão segura sem expor tokens ao JavaScript.',
        solution:
          'Access e refresh tokens em cookies HttpOnly, refresh rotativo com whitelist no Redis e blacklist por JTI no logout. No front-end, um interceptor do Axios coloca em fila as requisições que recebem 401 enquanto um único refresh acontece.',
      },
      {
        challenge: 'Executar o job de status uma única vez com vários workers do Uvicorn.',
        solution:
          'O job usa pg_try_advisory_lock: só o worker que obtém o lock executa a rodada e os demais a ignoram. Um UPDATE com CTE conclui os atendimentos e dá baixa no estoque na mesma instrução.',
      },
    ],
    images: [
      {
        src: `${AGENDAFLOW_IMG}/desktop-01-dashboard.webp`,
        alt: 'Dashboard do administrador com faturamento líquido do mês, comissões, ocupação, agendamentos do dia e cancelamentos',
        width: 1600,
        height: 750,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-02-crm.webp`,
        alt: 'CRM com total de clientes, grupos Frequentes, Regulares e Em risco, alerta de clientes em risco e distribuição da base',
        width: 1600,
        height: 742,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-03-financeiro.webp`,
        alt: 'Relatório financeiro com faturamento por serviços e produtos, ticket médio, gráfico de faturamento diário e totais por serviço',
        width: 1600,
        height: 748,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-04-desempenho.webp`,
        alt: 'Portal do profissional com faturamento do mês, atendimentos, performance, comissão a receber e evolução do faturamento',
        width: 1600,
        height: 747,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-05-portal-cliente.webp`,
        alt: 'Portal público da barbearia de teste com o botão Agendar agora, horário de funcionamento e endereço',
        width: 1600,
        height: 748,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-06-resumo.webp`,
        alt: 'Última etapa do agendamento: resumo com serviço, produtos, profissional, data, horário e total, e campos de nome e WhatsApp',
        width: 1600,
        height: 753,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-07-confirmado.webp`,
        alt: 'Agendamento confirmado com os detalhes do atendimento, atalhos para o mapa e o WhatsApp e formas de pagamento aceitas',
        width: 1600,
        height: 747,
      },
      {
        src: `${AGENDAFLOW_IMG}/desktop-08-login.webp`,
        alt: 'Login em etapas com a escolha entre acesso de administrador e de profissional',
        width: 1600,
        height: 737,
      },
    ],
    mobileImages: [
      {
        src: `${AGENDAFLOW_IMG}/mobile-04-dashboard.webp`,
        alt: 'Dashboard do administrador no celular',
        width: 393,
        height: 780,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-05-menu-admin.webp`,
        alt: 'Menu lateral do painel do administrador no celular',
        width: 393,
        height: 803,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-06-crm.webp`,
        alt: 'CRM no celular com os cartões de métricas e o alerta de clientes em risco',
        width: 393,
        height: 784,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-07-financeiro.webp`,
        alt: 'Relatório financeiro no celular',
        width: 393,
        height: 802,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-08-desempenho.webp`,
        alt: 'Desempenho do profissional no celular',
        width: 393,
        height: 799,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-09-menu-profissional.webp`,
        alt: 'Menu do portal do profissional no celular',
        width: 393,
        height: 805,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-01-portal-cliente.webp`,
        alt: 'Portal público de agendamento no celular',
        width: 393,
        height: 796,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-02-resumo.webp`,
        alt: 'Resumo do agendamento no celular, com o total e os dados do cliente',
        width: 393,
        height: 799,
      },
      {
        src: `${AGENDAFLOW_IMG}/mobile-03-login.webp`,
        alt: 'Login no celular com a escolha do perfil de acesso',
        width: 393,
        height: 792,
      },
    ],
    videos: [
      {
        src: `${AGENDAFLOW_VIDEO}/agendamento-cliente.mp4`,
        poster: `${AGENDAFLOW_VIDEO}/agendamento-cliente-poster.webp`,
        title: 'Agendamento pelo cliente',
        width: 392,
        height: 848,
      },
      {
        src: `${AGENDAFLOW_VIDEO}/painel-admin.mp4`,
        poster: `${AGENDAFLOW_VIDEO}/painel-admin-poster.webp`,
        title: 'Painel do administrador',
        width: 392,
        height: 848,
      },
      {
        src: `${AGENDAFLOW_VIDEO}/portal-profissional.mp4`,
        poster: `${AGENDAFLOW_VIDEO}/portal-profissional-poster.webp`,
        title: 'Portal do profissional',
        width: 392,
        height: 848,
      },
    ],
    codeSamples: [
      {
        fileName: 'backend/app/core/security.py',
        caption:
          'Autorização por papel que também impede um usuário de acessar outro estabelecimento.',
        code: `
def requer_role(roles: list):
    """
    Dependência que valida a role do usuário E que o tenant do JWT
    corresponde ao tenant_slug da URL (evita acesso cross-tenant).
    Uso: Depends(requer_role(["admin"]))
    """
    def verificar(request: Request, usuario: dict = Depends(get_usuario_atual)):
        if usuario.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar esse recurso",
            )
        # Impede que admin do tenant A acesse rotas do tenant B
        slug_na_url = request.path_params.get("tenant_slug")
        if slug_na_url and usuario.get("tenant") != slug_na_url:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado a este estabelecimento",
            )
        return usuario
    return verificar
`,
      },
      {
        fileName: 'backend/app/middleware/crm_router.py',
        language: 'sql',
        caption:
          'Lista do CRM em uma única consulta: métricas e favoritos de cada cliente sem N+1.',
        code: `
-- Uma única query com CTE resolve serviço/profissional favoritos sem N+1
WITH base AS (
    SELECT
        a.client_phone,
        MAX(a.client_name)                                                    AS client_name,
        COUNT(a.id)                                                           AS total_agendamentos,
        COUNT(CASE WHEN a.scheduled_date >= :noventa_dias_atras THEN 1 END)   AS agendamentos_90_dias,
        MAX(a.scheduled_date)                                                 AS ultimo_agendamento,
        ROUND(AVG(s.price)::numeric, 2)                                       AS ticket_medio
    FROM "{schema}".appointments a
    JOIN "{schema}".services s ON s.id = a.service_id
    WHERE a.status != 'cancelled'
    GROUP BY a.client_phone
),
servico_fav AS (
    SELECT DISTINCT ON (a.client_phone)
        a.client_phone,
        s.name AS servico_favorito
    FROM "{schema}".appointments a
    JOIN "{schema}".services s ON s.id = a.service_id
    WHERE a.status != 'cancelled'
    ORDER BY a.client_phone, COUNT(*) OVER (PARTITION BY a.client_phone, s.name) DESC
),
prof_fav AS (
    SELECT DISTINCT ON (a.client_phone)
        a.client_phone,
        u.full_name AS profissional_favorito
    FROM "{schema}".appointments a
    JOIN "{schema}".users u ON u.id = a.professional_id
    WHERE a.status != 'cancelled'
    ORDER BY a.client_phone, COUNT(*) OVER (PARTITION BY a.client_phone, u.id) DESC
)
SELECT b.*, sf.servico_favorito, pf.profissional_favorito
FROM base b
LEFT JOIN servico_fav sf ON sf.client_phone = b.client_phone
LEFT JOIN prof_fav    pf ON pf.client_phone = b.client_phone
ORDER BY b.ultimo_agendamento DESC
`,
      },
      {
        fileName: 'backend/app/scheduler.py',
        caption:
          'Job em segundo plano que roda uma única vez mesmo com vários workers e dá baixa no estoque.',
        code: `
# ID inteiro fixo para pg_advisory_lock — identifica exclusivamente este job no cluster
_LOCK_ID = 987654321


def atualizar_status_agendamentos():
    db = SessionLocal()
    adquiriu_lock = False

    try:
        # Tenta adquirir o advisory lock — não bloqueia, retorna false imediatamente
        # se outro worker já está executando este job
        adquiriu_lock = db.execute(
            text("SELECT pg_try_advisory_lock(:lock_id)"),
            {"lock_id": _LOCK_ID},
        ).scalar()

        if not adquiriu_lock:
            logger.info("scheduler_skip", extra={"reason": "outro worker segura o lock"})
            return

        for tenant in tenants:
            schema = tenant["schema_name"]

            # in_progress → completed + débito de estoque
            # CTE captura os IDs concluídos e debita 1 unidade por produto vinculado
            db.execute(text(f"""
                WITH concluidos AS (
                    UPDATE "{schema}".appointments
                    SET status = 'completed'
                    WHERE status = 'in_progress'
                    AND scheduled_date = :data
                    AND scheduled_time <= CAST(:hora AS TIME) - INTERVAL '1 hour'
                    RETURNING id
                )
                UPDATE "{schema}".products
                SET stock = stock - 1
                WHERE id IN (
                    SELECT product_id
                    FROM "{schema}".appointment_products
                    WHERE appointment_id IN (SELECT id FROM concluidos)
                )
                AND stock > 0
            """), {"data": data_atual, "hora": hora_atual})

        db.commit()
`,
      },
      {
        fileName: 'frontend/lib/api.ts',
        language: 'typescript',
        caption:
          'Renovação de sessão no front-end: um único refresh atende várias requisições simultâneas.',
        code: `
// Controle para evitar múltiplas tentativas de refresh simultâneas
let refreshEmAndamento = false;
let filaAguardandoRefresh: Array<(token: boolean) => void> = [];

function aguardarRefresh(): Promise<boolean> {
  return new Promise((resolve) => {
    filaAguardandoRefresh.push(resolve);
  });
}

function resolverFila(sucesso: boolean) {
  filaAguardandoRefresh.forEach((fn) => fn(sucesso));
  filaAguardandoRefresh = [];
}

// 401 em rota protegida — tenta renovar o access token via refresh token
if (is401 && !config?._refreshRetry && config) {
  // Se já há um refresh em andamento, aguarda ele terminar antes de tentar novamente
  if (refreshEmAndamento) {
    const sucesso = await aguardarRefresh();
    if (sucesso) {
      config._refreshRetry = true;
      return api(config);
    }
    return Promise.reject(error);
  }

  refreshEmAndamento = true;
  config._refreshRetry = true;

  try {
    await api.post("/auth/refresh");
    resolverFila(true);
    return api(config);
  } catch {
    // Refresh falhou — limpa sessão e redireciona para login
    resolverFila(false);
    // ...
    return Promise.reject(error);
  } finally {
    refreshEmAndamento = false;
  }
}
`,
      },
    ],
    repo: 'https://github.com/ZeHoschett/AgendaFlow',
    demo: '', // TODO(jose): link quando o deploy estiver no ar
    year: 2026,
    featured: true,
  },
  {
    id: 'portfolio',
    title: 'Portfólio Pessoal',
    stack: 'web',
    type: 'web',
    summary:
      'Este site: página única responsiva e interativa, feita com HTML, CSS e JavaScript puros, sem frameworks.',
    description:
      'Animações em Canvas com identidade por stack (rede hexagonal para Java, serpentes entrelaçadas para Python, terminal CRT para COBOL e grade interativa para Web), foco em acessibilidade (WCAG 2.1 AA), performance e código modular com ES Modules.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Acessibilidade'],
    images: [], // TODO(jose): print do site publicado
    repo: '', // TODO(jose): link do repositório
    demo: '', // TODO(jose): link publicado
    year: 2026,
    featured: true,
  },
];
