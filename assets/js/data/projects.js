/**
 * Projects shown in #projetos. Each project appears ONLY in the subsection of its `stack`.
 * How to add one: see README.md → "Como adicionar um novo projeto".
 *
 * Only `id`, `title` and `stack` are required. Everything else is optional and each section of
 * the case-study modal (numbers, features, architecture, mobile screens, videos, code, challenges)
 * appears only when its field is filled; `agendaflow` below is the complete reference.
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
 * @property {'python'|'sql'|'typescript'|'javascript'|'java'|'cobol'|'html'|'css'} [language]  grammar when it differs from the stack
 * @property {string} [caption]   one sentence: what this excerpt shows
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
 * @property {string} [docs]                              technical document to download, e.g. 'assets/docs/<id>-documentacao-tecnica.docx'
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
    id: 'flowpay',
    title: 'FlowPay',
    subtitle: 'API de cobranças recorrentes',
    stack: 'java',
    type: 'backend',
    summary:
      'API REST em Spring Boot para gerenciar o ciclo de vida de cobranças recorrentes, com máquina de estados explícita, idempotência, retry com backoff exponencial e tratamento de erros RFC 7807.',
    description: [
      'O FlowPay cria cobranças, acompanha o seu ciclo de vida e notifica outros sistemas por webhook sempre que o status muda. Uma cobrança nasce PENDENTE e só pode ir para PAGA, VENCIDA ou CANCELADA, estados finais dos quais nenhuma transição sai. A regra fica declarada em um único enum e qualquer movimento fora dela é recusado com um erro padronizado.',
      'A criação aceita o header Idempotency-Key para que um retry de rede não gere cobranças duplicadas, o webhook de saída é reenviado com backoff exponencial e todos os erros seguem a RFC 7807. O schema evolui só por migrations do Flyway, a documentação da API é gerada do código com springdoc-openapi e os testes de integração sobem um PostgreSQL real com Testcontainers.',
      'O projeto faz parte de um ecossistema simulado de sistemas financeiros: o FlowPay é a camada moderna em Java e um sistema legado em COBOL (FLOWCNAB) consumiria as cobranças pendentes para gerar a remessa bancária. Essa integração está documentada como extensão futura, fora da v1.',
    ],
    tags: [
      'Java 21',
      'Spring Boot 3.3',
      'PostgreSQL',
      'Flyway',
      'Docker',
      'JUnit',
      'Testcontainers',
      'OpenAPI/Swagger',
    ],
    stats: [
      { value: '6', label: 'endpoints REST documentados no Swagger' },
      { value: '4', label: 'estados na máquina de estados da cobrança' },
      { value: '3', label: 'migrations versionadas com Flyway' },
      { value: '9/9', label: 'testes unitários da máquina de estados passando' },
    ],
    highlights: [
      'Máquina de estados com transições explícitas (PENDENTE → PAGA / VENCIDA / CANCELADA).',
      'Idempotência via header Idempotency-Key com hash SHA-256 do corpo.',
      'Webhook de saída com retry (backoff exponencial 1s, 2s, 4s, 8s...).',
      'Erros padronizados RFC 7807 (Problem Details).',
      'Migrations versionadas com Flyway desde o primeiro commit.',
      'Testes unitários + integração com Testcontainers (Postgres real).',
    ],
    architecture: [
      {
        title: 'Domínio',
        description:
          'Cobranca e StatusCobranca, a máquina de estados, com as exceções de domínio. Nenhuma dependência do Spring: as regras de transição são testadas sem framework e sem banco.',
      },
      {
        title: 'Aplicação',
        description:
          'Casos de uso em CobrancaService e IdempotencyService, que orquestram o domínio e a infraestrutura dentro das transações.',
      },
      {
        title: 'Infraestrutura',
        description:
          'API REST com controllers, GlobalExceptionHandler e ProblemDetail; persistência com Spring Data JPA; cliente de webhook com RestTemplate. Acesso protegido por token fixo no header X-API-Key.',
      },
      {
        title: 'Dados e ambiente',
        description:
          'PostgreSQL 16 via Docker Compose, schema versionado pelo Flyway (cobrança, chaves de idempotência e auditoria de webhooks) e build com Maven.',
      },
    ],
    challenges: [
      {
        challenge: 'Evitar cobranças duplicadas quando o cliente repete a requisição após uma falha de rede.',
        solution:
          'A chave de idempotência é gravada com o hash SHA-256 do corpo e a resposta dada. Mesma chave e mesmo corpo devolvem a resposta original; mesma chave com outro corpo retorna 409 Conflict, em vez de assumir uma repetição legítima.',
      },
      {
        challenge: 'Não notificar sistemas externos sobre uma mudança de status que acabou revertida.',
        solution:
          'O webhook é registrado como TransactionSynchronization e só dispara em afterCommit. Cada tentativa fica na tabela webhook_notificacao; depois do limite configurado, a notificação é marcada como falha permanente para inspeção.',
      },
      {
        challenge: 'JSON malformado retornava 500 em vez de 400, descoberto nos testes manuais pelo Swagger.',
        solution:
          'Um handler dedicado para HttpMessageNotReadableException no GlobalExceptionHandler passou a responder 400 no mesmo formato RFC 7807 do restante da API.',
      },
      {
        challenge: 'Testcontainers não encontrava o Docker no Windows com Docker Desktop 4.60+ sobre WSL2.',
        solution:
          'O diagnóstico isolou a incompatibilidade de negociação de API entre o docker-java e o Docker Desktop. A limitação e os contornos testados ficaram documentados no README e o fluxo completo foi validado de ponta a ponta pelo Swagger.',
      },
    ],
    codeSnippet: `
public enum StatusCobranca {

    PENDENTE {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.of(PAGA, VENCIDA, CANCELADA);
        }
    },
    PAGA {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.noneOf(StatusCobranca.class);
        }
    },
`,
    fileName: 'StatusCobranca.java',
    codeSamples: [
      {
        fileName: 'src/main/java/com/flowpay/domain/StatusCobranca.java',
        caption:
          'A máquina de estados em um único lugar: cada estado declara para onde pode ir.',
        code: `
/**
 * Estados possíveis de uma cobrança e as transições permitidas entre eles.
 *
 * Regra de negócio central do sistema:
 *   PENDENTE -> PAGA
 *   PENDENTE -> VENCIDA
 *   PENDENTE -> CANCELADA
 *   (PAGA, VENCIDA e CANCELADA são estados finais - nenhuma transição sai deles)
 */
public enum StatusCobranca {

    PENDENTE {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.of(PAGA, VENCIDA, CANCELADA);
        }
    },
    PAGA {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.noneOf(StatusCobranca.class);
        }
    },
    VENCIDA {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.noneOf(StatusCobranca.class);
        }
    },
    CANCELADA {
        @Override
        public Set<StatusCobranca> transicoesPermitidas() {
            return EnumSet.noneOf(StatusCobranca.class);
        }
    };

    public abstract Set<StatusCobranca> transicoesPermitidas();

    public boolean podeTransicionarPara(StatusCobranca novoStatus) {
        return transicoesPermitidas().contains(novoStatus);
    }
}
`,
      },
      {
        fileName: 'src/main/java/com/flowpay/application/IdempotencyService.java',
        caption:
          'Mesma chave e mesmo corpo devolvem a resposta já dada; mesma chave com outro corpo é conflito.',
        code: `
public <T> T executar(String chave, Object corpoRequisicao, Class<T> tipoResposta, Supplier<T> operacao) {
    String hash = calcularHash(corpoRequisicao);
    Optional<IdempotencyRecord> existente = repository.findByChave(chave);

    if (existente.isPresent()) {
        IdempotencyRecord record = existente.get();
        if (!record.getHashRequisicao().equals(hash)) {
            throw new IdempotencyKeyConflictException(chave);
        }
        return desserializar(record, tipoResposta);
    }

    T resultado = operacao.get();
    salvar(chave, hash, resultado);
    return resultado;
}

private String calcularHash(Object corpo) {
    try {
        String json = objectMapper.writeValueAsString(corpo);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(json.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hashBytes);
    } catch (Exception e) {
        throw new IllegalStateException("Falha ao calcular hash da requisição", e);
    }
}
`,
      },
      {
        fileName: 'src/main/java/com/flowpay/infrastructure/webhook/WebhookSender.java',
        caption:
          'Falhou o envio? Nova tentativa agendada com backoff exponencial até o limite configurado.',
        code: `
} catch (RestClientException e) {
    log.warn("Falha ao enviar webhook para a cobrança {} (tentativa {}/{}): {}",
            notificacao.getCobrancaId(), notificacao.getTentativas(),
            properties.getMaxTentativas(), e.getMessage());

    if (notificacao.getTentativas() >= properties.getMaxTentativas()) {
        notificacao.marcarComoFalhaPermanente();
        repository.save(notificacao);
        log.error("Webhook para a cobrança {} marcado como FALHA PERMANENTE após {} tentativas",
                notificacao.getCobrancaId(), notificacao.getTentativas());
        return;
    }

    long delaySegundos = (long) (properties.getDelayBaseSegundos()
            * Math.pow(2, notificacao.getTentativas() - 1));
    scheduler.schedule(() -> tentarEnviar(notificacaoId, payloadJson), delaySegundos, TimeUnit.SECONDS);
}
`,
      },
      {
        fileName: 'src/main/java/com/flowpay/application/CobrancaService.java',
        caption:
          'O webhook só é disparado depois do commit, para não anunciar uma mudança que foi revertida.',
        code: `
private void agendarNotificacaoAposCommit(Cobranca cobranca, StatusCobranca statusAnterior) {
    WebhookPayload payload = new WebhookPayload(
            cobranca.getId(),
            cobranca.getClienteId(),
            cobranca.getValor(),
            statusAnterior,
            cobranca.getStatus(),
            Instant.now()
    );

    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                webhookSender.notificar(payload);
            }
        });
    } else {
        webhookSender.notificar(payload);
    }
}
`,
      },
      {
        fileName: 'src/main/java/com/flowpay/infrastructure/web/GlobalExceptionHandler.java',
        caption: 'Erros da API no formato RFC 7807 com o ProblemDetail nativo do Spring 6.',
        code: `
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String BASE_URI = "https://flowpay.dev/problems/";

    @ExceptionHandler(TransicaoInvalidaException.class)
    public ProblemDetail handleTransicaoInvalida(TransicaoInvalidaException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setType(URI.create(BASE_URI + "transicao-invalida"));
        problem.setTitle("Transição de status inválida");
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleJsonMalformado(HttpMessageNotReadableException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "O corpo da requisição não é um JSON válido");
        problem.setType(URI.create(BASE_URI + "json-malformado"));
        problem.setTitle("Requisição malformada");
        return problem;
    }
`,
      },
    ],
    repo: 'https://github.com/ZeHoschett/flowpay',
    demo: '',
    docs: 'assets/docs/flowpay-documentacao-tecnica.docx',
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
          'FieldType, CopybookField e CopybookSchema: a árvore de campos com tipo, offset, tamanho, casas decimais, sinal, OCCURS e REDEFINES.',
      },
      {
        title: 'Parser',
        description:
          'CopybookParser junta as linhas em sentenças COBOL e extrai nível, nome, PIC, USAGE, OCCURS e REDEFINES por expressões regulares; PicParser traduz cada PIC + USAGE em tipo e tamanho em bytes.',
      },
      {
        title: 'Codec',
        description:
          'PackedDecimalCodec para o COMP-3, CopybookDecoder (bytes → JSON com Jackson) e CopybookEncoder (JSON → bytes), com charset ISO-8859-1 por padrão.',
      },
      {
        title: 'CLI e build',
        description:
          'CopyBridgeCli com decode, encode e inspect; build com Maven e JAR único gerado pelo maven-shade-plugin.',
      },
    ],
    challenges: [
      {
        challenge: 'Garantir que o caminho de volta, JSON → arquivo, reproduza exatamente o arquivo original.',
        solution:
          'O roundtrip virou o critério de pronto: os testes montam registros byte a byte, decodificam, recodificam e comparam os arrays com assertArrayEquals. Cobrem texto, COMP-3 positivo e negativo e vários registros no mesmo arquivo.',
      },
      {
        challenge: 'Calcular o tamanho real de um campo COMP-3 a partir do PIC.',
        solution:
          'Cada byte guarda dois dígitos e o último guarda um dígito e o sinal, então o tamanho é ceil((dígitos + 1) / 2): PIC S9(13)V99 ocupa 8 bytes. O encoder recusa valores que excedem a capacidade do campo em vez de truncá-los em silêncio.',
      },
      {
        challenge: 'Aceitar copybooks escritos em formato fixo de 80 colunas e em formato livre.',
        solution:
          'Uma heurística detecta o formato fixo (linhas com mais de 72 colunas ou números de sequência nas colunas 1 a 6) e, nesse caso, descarta as áreas de sequência e identificação e trata o * da coluna 7 como comentário.',
      },
    ],
    codeSnippet: `
public static BigDecimal decode(byte[] data, int offset, int length, int decimalPlaces) {
    StringBuilder digits = new StringBuilder();

    for (int i = 0; i < length; i++) {
        int b = data[offset + i] & 0xFF;
        int highNibble = (b >> 4) & 0x0F;
        int lowNibble = b & 0x0F;
`,
    fileName: 'PackedDecimalCodec.java',
    codeSamples: [
      {
        fileName: 'src/main/java/com/copybridge/codec/PackedDecimalCodec.java',
        caption:
          'Decodificação do COMP-3: dois dígitos por byte, o sinal no último nibble e a vírgula implícita pelo V do PIC.',
        code: `
public static BigDecimal decode(byte[] data, int offset, int length, int decimalPlaces) {
    if (length <= 0) {
        throw new IllegalArgumentException("COMP-3 length must be > 0, got " + length);
    }

    StringBuilder digits = new StringBuilder();

    for (int i = 0; i < length; i++) {
        int b = data[offset + i] & 0xFF;
        int highNibble = (b >> 4) & 0x0F;
        int lowNibble = b & 0x0F;

        if (i < length - 1) {
            // Bytes intermediários: dois dígitos
            validateDigit(highNibble, offset + i, "high");
            validateDigit(lowNibble, offset + i, "low");
            digits.append(highNibble);
            digits.append(lowNibble);
        } else {
            // Último byte: dígito + sinal
            validateDigit(highNibble, offset + i, "high");
            digits.append(highNibble);
        }
    }

    // Extrair sinal do último byte
    int lastByte = data[offset + length - 1] & 0xFF;
    int signNibble = lastByte & 0x0F;
    boolean negative = (signNibble == SIGN_NEGATIVE);

    // Construir BigDecimal com casas decimais implícitas
    BigInteger unscaled = new BigInteger(digits.toString());
    if (negative) {
        unscaled = unscaled.negate();
    }

    return new BigDecimal(unscaled, decimalPlaces);
}
`,
      },
      {
        fileName: 'src/main/java/com/copybridge/parser/PicParser.java',
        caption: 'O mesmo PIC ocupa tamanhos diferentes conforme o USAGE: texto, packed decimal ou binário.',
        code: `
if (isAlpha) {
    type = FieldType.ALPHANUMERIC;
    sizeInBytes = integerDigits;
} else if (normalizedUsage.equals("COMP3") || normalizedUsage.equals("PACKED") || normalizedUsage.equals("PACKEDDECIMAL")) {
    type = FieldType.PACKED_DECIMAL;
    // Packed decimal: ceil((totalDigits + 1) / 2)
    sizeInBytes = (totalDigits + 1 + 1) / 2;  // +1 para o sinal nibble
} else if (normalizedUsage.equals("COMP") || normalizedUsage.equals("BINARY") || normalizedUsage.equals("COMP4")) {
    type = FieldType.BINARY;
    if (totalDigits <= 4) {
        sizeInBytes = 2;
    } else if (totalDigits <= 9) {
        sizeInBytes = 4;
    } else {
        sizeInBytes = 8;
    }
} else {
    // DISPLAY (default)
    type = FieldType.NUMERIC_DISPLAY;
    sizeInBytes = totalDigits;
}
`,
      },
      {
        fileName: 'src/test/java/com/copybridge/codec/RoundtripTest.java',
        caption: 'O critério de pronto: arquivo → JSON → arquivo com bytes idênticos, incluindo um campo COMP-3.',
        code: `
@Test
@DisplayName("Roundtrip: registro com COMP-3")
void roundtripComp3() {
    String copybook = """
           01  REG.
               05  BANCO        PIC 9(03).
               05  VALOR        PIC S9(05)V99 COMP-3.
               05  DESCRICAO    PIC X(10).
           """;

    CopybookSchema schema = parser.parse(copybook, "COMP3");
    // 3 + 4 (ceil((7+1)/2)) + 10 = 17
    assertEquals(17, schema.getRecordLength());

    // Montar registro: banco=341, valor=123.45, descricao=PAGAMENTO
    byte[] original = new byte[17];
    // ...

    // Decode
    CopybookDecoder decoder = new CopybookDecoder();
    ObjectNode json = decoder.decodeRecord(original, schema);

    assertEquals("341", json.get("REG").get("BANCO").asText());
    assertEquals(0, new BigDecimal("123.45").compareTo(
            new BigDecimal(json.get("REG").get("VALOR").asText())));
    assertEquals("PAGAMENTO", json.get("REG").get("DESCRICAO").asText());

    // Encode de volta
    CopybookEncoder encoder = new CopybookEncoder();
    byte[] reencoded = encoder.encodeRecord(json, schema);

    assertArrayEquals(original, reencoded,
            "Roundtrip com COMP-3 falhou: bytes diferem");
}
`,
      },
      {
        fileName: 'src/main/resources/copybooks/CNAB240-DETALHE.cpy',
        language: 'cobol',
        caption: 'O copybook de exemplo: registro de detalhe CNAB 240 (segmento P) com valores em COMP-3.',
        code: `
      *================================================================*
      * CNAB 240 - Registro Detalhe - Segmento P (Pagamento)
      * Copybook de exemplo para o CopyBridge
      *================================================================*
       01  REG-DETALHE-SEGP.
           05  SEGP-BANCO                PIC 9(03).
           05  SEGP-LOTE                 PIC 9(04).
           05  SEGP-TIPO-REGISTRO        PIC 9(01).
           05  SEGP-NUM-SEQ              PIC 9(05).
           05  SEGP-SEGMENTO             PIC X(01).
           05  FILLER                    PIC X(01).
           05  SEGP-COD-MOVIMENTO        PIC 9(02).
           05  SEGP-AGENCIA              PIC 9(04).
      * ...
           05  SEGP-DT-VENCIMENTO        PIC 9(08).
           05  SEGP-VL-TITULO            PIC S9(13)V99 COMP-3.
           05  SEGP-AG-COBRANCA          PIC 9(05).
      * ...
           05  SEGP-JUROS-MORA-VALOR     PIC S9(13)V99 COMP-3.
           05  SEGP-DESCONTO-COD         PIC 9(01).
           05  SEGP-DESCONTO-DATA        PIC 9(08).
           05  SEGP-DESCONTO-VALOR       PIC S9(13)V99 COMP-3.
           05  SEGP-IOF                  PIC S9(13)V99 COMP-3.
           05  SEGP-ABATIMENTO           PIC S9(13)V99 COMP-3.
`,
      },
    ],
    repo: 'https://github.com/ZeHoschett/CopyBridge',
    demo: '',
    year: 2026,
  },
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
_LOCK_ID = 987654321


def atualizar_status_agendamentos():
    db = SessionLocal()
    adquiriu_lock = False

    try:
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
    id: 'funil-gh',
    title: 'Funil de Leads',
    subtitle: 'Consultoria Team GH',
    stack: 'python',
    type: 'web',
    summary:
      'Quiz de diagnóstico que capta leads para uma consultoria de treino: front-end mobile-first em JavaScript puro, API em FastAPI e dados no Supabase, publicado no Render.',
    description: [
      'O funil conduz o visitante por 12 etapas (escala de satisfação, objetivo, rotina, disponibilidade, investimento, uma tela de apresentação da consultoria, nome, WhatsApp, e-mail e consentimento LGPD) e envia as respostas para a API. As perguntas ficam em um único arquivo de dados e a interface é montada a partir dele, então o roteiro muda sem tocar na lógica.',
      'O back-end em FastAPI valida o corpo com Pydantic, normaliza o WhatsApp para o formato internacional, grava no Supabase (PostgreSQL) e trata o número repetido como sucesso, sem duplicar o lead. Uma página protegida por HTTP Basic lista os leads dos últimos sete dias com um botão que abre a conversa no WhatsApp já com a mensagem pronta.',
    ],
    tags: ['Python', 'FastAPI', 'Pydantic', 'Supabase', 'PostgreSQL', 'JavaScript', 'HTML5', 'CSS3', 'Render'],
    stats: [
      { value: '12', label: 'etapas no quiz, montadas a partir de um arquivo de dados' },
      { value: '7', label: 'tipos de etapa: escala, múltipla escolha, texto, telefone, e-mail, informativa e consentimento' },
      { value: '3', label: 'rotas na API: página do quiz, cadastro do lead e painel semanal' },
      { value: '1', label: 'lead por WhatsApp, garantido por índice único no banco' },
    ],
    highlights: [
      'Quiz em etapas com barra de progresso, botão de voltar e respostas preservadas no navegador.',
      'Máscara de telefone brasileiro e validação de e-mail e de campos obrigatórios em cada etapa.',
      'Honeypot anti-spam: um campo invisível que só robôs preenchem descarta o envio.',
      'API em FastAPI com Pydantic (extra="forbid") e WhatsApp normalizado para o formato 55 + DDD + número.',
      'Lead duplicado não gera erro para o visitante nem registro repetido no banco.',
      'Painel dos leads dos últimos 7 dias com HTTP Basic, comparação de credenciais em tempo constante e HTML escapado.',
      'Botão "Chamar no Zap" que abre o WhatsApp com a mensagem de primeiro contato já escrita.',
      'Deploy no Render descrito em render.yaml, com as credenciais apenas em variáveis de ambiente.',
    ],
    architecture: [
      {
        title: 'Front-end',
        description:
          'HTML, CSS e JavaScript puros, sem framework. questions.js descreve as perguntas; app.js monta cada etapa, valida, guarda as respostas e envia um JSON para a API.',
      },
      {
        title: 'API',
        description:
          'FastAPI servindo o próprio front-end como arquivos estáticos. POST /api/leads valida com Pydantic e grava; GET /leads-semanais exige HTTP Basic e devolve a tabela dos leads da semana.',
      },
      {
        title: 'Dados',
        description:
          'Supabase (PostgreSQL) com a tabela leads: respostas em jsonb, índice único no WhatsApp, índice por data de criação e row level security ativada.',
      },
      {
        title: 'Deploy',
        description:
          'Web service no Render com Python 3.11 e Uvicorn; URL, chave do Supabase e credenciais do painel configuradas como variáveis de ambiente, nunca no repositório.',
      },
    ],
    challenges: [
      {
        challenge: 'Não cadastrar o mesmo lead duas vezes quando a pessoa refaz o quiz.',
        solution:
          'O WhatsApp é normalizado antes de gravar e tem índice único no banco. Quando o Supabase recusa a inserção por chave duplicada (código 23505), a API responde sucesso com duplicate: true. O visitante vê a tela de confirmação e a base continua limpa.',
      },
      {
        challenge: 'Proteger o painel de leads sem montar um sistema de login.',
        solution:
          'HTTP Basic com usuário e senha em variáveis de ambiente e comparação por secrets.compare_digest. A aplicação nem sobe se as credenciais não estiverem configuradas, e todo dado do lead passa por html.escape antes de entrar na página.',
      },
      {
        challenge: 'Permitir que o roteiro de perguntas mude sem reescrever a interface.',
        solution:
          'Cada pergunta é um objeto com tipo, textos e opções em questions.js; app.js renderiza pelo tipo. Reordenar, incluir ou remover perguntas é editar um array.',
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
    codeSamples: [
      {
        fileName: 'main.py',
        caption:
          'Cadastro do lead com WhatsApp normalizado e duplicidade tratada como sucesso; o painel semanal exige HTTP Basic com comparação em tempo constante.',
        code: `
class LeadSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=200)
    whatsapp: str = Field(min_length=10, max_length=30)
    respostas: dict[str, Any]


def clean_phone(value: str) -> str:
    digits = "".join(character for character in value if character.isdigit())

    if digits.startswith("55") and len(digits) in (12, 13):
        return digits

    if len(digits) in (10, 11):
        return f"55{digits}"

    return digits


def is_duplicate_error(error: Exception) -> bool:
    return "23505" in str(error) or "duplicate key" in str(error).lower()


@app.post("/api/leads")
def create_lead(lead: LeadSchema) -> dict[str, Any]:
    phone = clean_phone(lead.whatsapp)

    if len(phone) not in (12, 13):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="WhatsApp inválido. Informe DDD e número com 10 ou 11 dígitos.",
        )

    payload = {
        "nome": lead.nome.strip(),
        "whatsapp": phone,
        "respostas": lead.respostas,
    }

    try:
        result = supabase.table("leads").insert(payload).execute()
    except Exception as error:
        if is_duplicate_error(error):
            return {"success": True, "duplicate": True}

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível salvar o lead.",
        ) from error


# ...


def authenticate(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    valid_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    valid_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)

    if not valid_username or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas.",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username


@app.get("/leads-semanais", response_class=HTMLResponse)
def weekly_leads(_: str = Depends(authenticate)) -> HTMLResponse:
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    try:
        result = (
            supabase.table("leads")
            .select("id,nome,whatsapp,respostas,created_at")
            .gte("created_at", cutoff.isoformat())
            .order("created_at", desc=True)
            .execute()
        )
`,
      },
      {
        fileName: 'supabase_schema.sql',
        language: 'sql',
        caption: 'A tabela de leads: respostas em jsonb e um índice único que impede WhatsApp repetido.',
        code: `
create extension if not exists pgcrypto;

create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    whatsapp text not null,
    respostas jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create unique index if not exists leads_whatsapp_unique_idx
    on public.leads (whatsapp);

create index if not exists leads_created_at_idx
    on public.leads (created_at desc);

alter table public.leads enable row level security;
`,
      },
      {
        fileName: 'js/app.js',
        language: 'javascript',
        caption: 'Envio no front-end: o honeypot barra robôs e uma falha de rede não apaga as respostas.',
        code: `
async function submit() {
  if (state.submitting) return;

  if (els.hpField.value.trim() !== "") {
    showThanks();
    return;
  }

  state.submitting = true;
  els.btnNext.disabled = true;
  els.btnNext.textContent = "Enviando...";
  clearAlert();

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });

    if (!response.ok) throw new Error("HTTP " + response.status);
    showThanks();
  } catch (error) {
    state.submitting = false;
    els.btnNext.disabled = false;
    els.btnNext.textContent = "Tentar novamente \\u2192";
    showAlert("Não conseguimos enviar suas respostas agora. Verifique sua internet e tente novamente — nada foi perdido.");
    console.error("Falha ao enviar lead:", error);
  }
}
`,
      },
    ],
    year: 2026,
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
      'Toda empresa que cobra clientes em volume roda um batch como este: empacota as cobranças pendentes em um arquivo que o banco entende (a remessa) e, no dia seguinte, lê a resposta do banco (o retorno) para saber quem pagou. O FLOWCNAB faz esse ciclo com três programas COBOL encadeados (GERAREM, SIMBANCO e PROCRET), e um JCL de exemplo mostra como o job seria agendado em um z/OS.',
      'A remessa segue a hierarquia FEBRABAN: header de arquivo, header de lote, segmentos P e Q por título, trailer de lote e trailer de arquivo, cada linha com exatamente 240 posições. Antes de virar título, cada cobrança passa por uma crítica: nosso número inválido ou duplicado, valor zerado, vencimento inválido e campo numérico do pagador com texto são descartados com aviso. Em COBOL, mover texto para um campo PIC 9 não dá erro, grava zeros, e o problema só apareceria no banco.',
      'O PROCRET casa cada retorno pelo nosso número, marca o título como pago, pago com atraso ou rejeitado com o motivo, e emite um relatório que confere sozinho a identidade enviados = pagos + com atraso + rejeitados + pendentes. É a peça de mainframe do ecossistema FlowPay → FLOWCNAB → CopyBridge, mas funciona de forma independente. Roda em GnuCOBOL 3.3, sem mainframe.',
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
          'GERAREM (remessa/GERAREM.cbl) critica as cobranças e grava a remessa; SIMBANCO (simulador/SIMBANCO.cbl) faz o papel do banco; PROCRET (retorno/PROCRET.cbl) processa o retorno, regrava os status e emite a conciliação.',
      },
      {
        title: 'Copybooks',
        description:
          'Um copybook por registro CNAB 240 (headers, segmentos P, Q, T e U, trailers), os registros internos de cobrança pendente e de status, e FLOWCNAB-CONST com as constantes de nível 78 compartilhadas pelos três programas.',
      },
      {
        title: 'Arquivos',
        description:
          'Persistência em arquivos sequenciais de largura fixa (LINE SEQUENTIAL). Um schema PostgreSQL com exemplo de acesso por EXEC SQL (OCESQL) fica documentado em sql/schema.sql como caminho de evolução.',
      },
      {
        title: 'Execução e testes',
        description:
          'run_e2e.sh valida o tamanho dos copybooks, compila com cobc e roda o fluxo de ponta a ponta, abortando se um passo devolver RETURN-CODE 8 ou mais; test_e2e.sh cobre o caminho feliz e os casos de borda. O JCL mostra o mesmo job em um z/OS.',
      },
    ],
    challenges: [
      {
        challenge: 'Um MOVE de texto para um campo PIC 9 não falha em COBOL: grava zeros e o erro só apareceria no banco.',
        solution:
          'A crítica do GERAREM testa NOT NUMERIC em tudo que vira campo numérico no CNAB (nosso número, valor, CEP, CPF/CNPJ e tipo de inscrição) e descarta o título com um aviso que diz o motivo, terminando com RETURN-CODE 4.',
      },
      {
        challenge: 'Decidir "pago com atraso" comparando datas no formato do banco dá o resultado errado.',
        solution:
          'Como número, 01/10/2026 (01102026) é menor que 20/09/2026 (20092026). Os arquivos internos usam AAAAMMDD, em que a ordem numérica é a cronológica, e a conversão de e para DDMMAAAA acontece em exatamente dois parágrafos, um em cada programa.',
      },
      {
        challenge: 'Um relatório de conciliação que exibe números que não somam passa despercebido.',
        solution:
          'O PROCRET calcula enviados = pagos + com atraso + rejeitados + pendentes e imprime a conferência; retorno órfão, ocorrência repetida ou valor divergente marcam a conciliação como divergente e encerram com RETURN-CODE 4.',
      },
      {
        challenge: 'A tabela em memória do PROCRET tem capacidade fixa e estourá-la corromperia a memória.',
        solution:
          'O limite CT-MAX-TITULOS (500) fica em um copybook compartilhado; o GERAREM impõe o mesmo teto na geração e aborta com RETURN-CODE 8 e uma mensagem explicando que a carga deve ser dividida.',
      },
    ],
    codeSnippet: `
       000-PRINCIPAL.
           PERFORM 100-INICIALIZAR
           PERFORM 200-ABRIR-ARQUIVOS
           PERFORM 300-GERAR-HEADERS
           PERFORM 400-LER-COBRANCAS
           PERFORM UNTIL FIM-COBRANCAS
               PERFORM 450-CRITICAR-COBRANCA
               IF REGISTRO-VALIDO
                   PERFORM 500-GERAR-DETALHE
               END-IF
               PERFORM 400-LER-COBRANCAS
           END-PERFORM
`,
    fileName: 'GERAREM.CBL',
    codeSamples: [
      {
        fileName: 'remessa/GERAREM.cbl',
        caption: 'A crítica da entrada: nada que vire PIC 9 no CNAB entra sem ser numérico.',
        code: `
       450-CRITICAR-COBRANCA.
           MOVE "S" TO WS-REGISTRO-VALIDO
      * ...
           IF CP-NOSSO-NUMERO NOT NUMERIC
              OR CP-NOSSO-NUMERO = 0
               DISPLAY "GERAREM: AVISO - titulo descartado, nosso "
                   "numero invalido ou zerado: [" CP-NOSSO-NUMERO "]"
               MOVE "N" TO WS-REGISTRO-VALIDO
           END-IF

      * ---- valor do titulo ----
           IF REGISTRO-VALIDO
               IF CP-VALOR-TITULO NOT NUMERIC
                  OR CP-VALOR-TITULO = 0
                   DISPLAY "GERAREM: AVISO - titulo descartado, "
                       "valor invalido ou zerado. Nosso numero: "
                       CP-NOSSO-NUMERO
                   MOVE "N" TO WS-REGISTRO-VALIDO
               END-IF
           END-IF
      * ...
      * ---- campos numericos do pagador (alimentam o segmento Q) ----
      * Um MOVE de campo nao numerico para PIC 9 nao falha: o
      * GnuCOBOL grava zeros e a remessa sai com o CEP ou o CNPJ do
      * pagador zerado, sem aviso nenhum.
           IF REGISTRO-VALIDO
               IF CP-CEP-PAGADOR NOT NUMERIC
                  OR CP-CPF-CNPJ-PAGADOR NOT NUMERIC
                  OR CP-TIPO-INSCRICAO-PAG NOT NUMERIC
                   DISPLAY "GERAREM: AVISO - titulo descartado, "
                       "dados do pagador com campo numerico "
                       "invalido. Nosso numero: " CP-NOSSO-NUMERO
                   MOVE "N" TO WS-REGISTRO-VALIDO
               END-IF
           END-IF

      * ---- nosso numero duplicado ----
           IF REGISTRO-VALIDO
               PERFORM 460-VERIFICAR-DUPLICIDADE
               IF WS-NN-DUPLICADO = "S"
                   DISPLAY "GERAREM: AVISO - titulo descartado, "
                       "nosso numero duplicado na mesma remessa: "
                       CP-NOSSO-NUMERO
                   MOVE "N" TO WS-REGISTRO-VALIDO
               END-IF
           END-IF
`,
      },
      {
        fileName: 'retorno/PROCRET.cbl',
        caption:
          'Cada ocorrência do banco vira pago, pago com atraso ou rejeitado (com a data já em AAAAMMDD), e a conciliação confere a própria soma.',
        code: `
           EVALUATE WS-T-COD-OCORRENCIA
               WHEN CT-OCOR-LIQUIDACAO
                   PERFORM 560-CONVERTER-DATA-OCORRENCIA
                   MOVE WS-U-VALOR-PAGO  TO WT-VALOR-PAGO(IDX-T)
                   MOVE WS-OCOR-AAAAMMDD TO WT-DATA-OCORRENCIA(IDX-T)
                   IF WS-OCOR-AAAAMMDD > WT-VENCIMENTO(IDX-T)
                       MOVE "PAGO COM ATRASO" TO WT-STATUS(IDX-T)
                       ADD 1 TO WS-QTDE-PAGOS-ATRASO
                   ELSE
                       MOVE "PAGO"            TO WT-STATUS(IDX-T)
                       ADD 1 TO WS-QTDE-PAGOS
                   END-IF
                   ADD WS-U-VALOR-PAGO TO WS-VALOR-CONCILIADO
                   IF WS-U-VALOR-PAGO NOT = WT-VALOR-TITULO(IDX-T)
                       DISPLAY "PROCRET: AVISO - valor pago diverge "
                           "do valor do titulo. Nosso numero: "
                           WT-NOSSO-NUMERO(IDX-T)
                       ADD 1 TO WS-QTDE-DIVERGENTES
                       MOVE "N" TO WS-CONCILIACAO-OK
                   END-IF
               WHEN CT-OCOR-ENTRADA-REJEITADA
                   MOVE "REJEITADO"     TO WT-STATUS(IDX-T)
                   MOVE 0               TO WT-VALOR-PAGO(IDX-T)
                   IF WS-T-ERROS >= 1 AND WS-T-ERROS <= CT-QTDE-MOTIVOS
                       MOVE WS-DESCR-MOTIVO(WS-T-ERROS)
                           TO WT-MOTIVO-REJEICAO(IDX-T)
                   ELSE
                       MOVE WS-DESCR-MOTIVO-DEFAULT
                           TO WT-MOTIVO-REJEICAO(IDX-T)
                   END-IF
                   ADD 1 TO WS-QTDE-REJEITADOS
               WHEN OTHER
                   DISPLAY "PROCRET: AVISO - ocorrencia nao tratada ("
                       WS-T-COD-OCORRENCIA ") para o nosso numero "
                       WT-NOSSO-NUMERO(IDX-T) ". Titulo segue "
                       "PENDENTE."
           END-EVALUATE.

      *=================================================================
      * A data vem do segmento U em DDMMAAAA. Comparar DDMMAAAA como
      * numero e errado (01/10/2026 = 01102026 < 20/09/2026 =
      * 20092026); convertemos para AAAAMMDD, onde a ordem numerica e
      * a ordem cronologica.
      *=================================================================
       560-CONVERTER-DATA-OCORRENCIA.
           MOVE WS-U-DATA-OCORRENCIA TO WS-OCOR-DDMMAAAA
           MOVE WS-OCOR-D-DD   TO WS-OCOR-DD
           MOVE WS-OCOR-D-MM   TO WS-OCOR-MM
           MOVE WS-OCOR-D-AAAA TO WS-OCOR-AAAA.
      * ...
      *=================================================================
      * A identidade que o projeto promete:
      *   enviados = pagos + pagos com atraso + rejeitados + pendentes
      * Se nao fechar, algo se perdeu no caminho e o relatorio precisa
      * dizer isso em vez de exibir numeros que nao somam.
      *=================================================================
       650-VALIDAR-CONCILIACAO.
           COMPUTE WS-QTDE-SOMA-STATUS =
               WS-QTDE-PAGOS + WS-QTDE-PAGOS-ATRASO
               + WS-QTDE-REJEITADOS + WS-QTDE-PENDENTES

           IF WS-QTDE-SOMA-STATUS NOT = WS-QTDE-ENVIADOS
               MOVE "N" TO WS-CONCILIACAO-OK
           END-IF.
`,
      },
      {
        fileName: 'copybooks/CNAB240-DET-P.cpy',
        caption: 'O segmento P do layout do Itaú: a posição de cada campo definida no copybook.',
        code: `
      *****************************************************************
      * COPYBOOK: CNAB240-DET-P
      * Registro Detalhe - Segmento P (Remessa, obrigatorio) - Itau (341)
      * Fonte: cobranca_cnab240.pdf, pag. 9
      * Tamanho fixo: 240 posicoes
      *****************************************************************
       01  WS-DET-P.
           05 DP-CODIGO-BANCO           PIC 9(03).
           05 DP-CODIGO-LOTE            PIC 9(04).
           05 DP-TIPO-REGISTRO          PIC 9(01).
           05 DP-NUM-REGISTRO           PIC 9(05).
           05 DP-SEGMENTO               PIC X(01).
           05 DP-BRANCO-1               PIC X(01).
           05 DP-COD-OCORRENCIA         PIC 9(02).
           05 DP-ZERO-1                 PIC 9(01).
           05 DP-AGENCIA                PIC 9(04).
           05 DP-BRANCO-2               PIC X(01).
           05 DP-ZEROS-1                PIC 9(07).
           05 DP-CONTA                  PIC 9(05).
           05 DP-BRANCO-3               PIC X(01).
           05 DP-DAC-AG-CONTA           PIC 9(01).
           05 DP-NUM-CARTEIRA           PIC 9(03).
           05 DP-NOSSO-NUMERO           PIC 9(08).
           05 DP-DAC-NOSSO-NUMERO       PIC 9(01).
      * ...
           05 DP-VENCIMENTO             PIC 9(08).
           05 DP-VALOR-TITULO           PIC 9(13)V9(02).
`,
      },
      {
        fileName: 'copybooks/FLOWCNAB-CONST.cpy',
        caption: 'Constantes de nível 78: nenhum programa carrega o código do banco ou o CNPJ escrito à mão.',
        code: `
      * ---- Banco / layout CNAB 240 (Itau 341) ----
       78  CT-CODIGO-BANCO              VALUE 341.
       78  CT-NOME-BANCO                VALUE "BANCO ITAU SA".
       78  CT-LAYOUT-ARQUIVO            VALUE 40.
       78  CT-LAYOUT-LOTE               VALUE 30.
       78  CT-NUM-CARTEIRA              VALUE 109.
      * ...
      * ---- Codigos de ocorrencia usados no projeto ----
       78  CT-OCOR-ENTRADA-TITULO       VALUE 01.
       78  CT-OCOR-ENTRADA-REJEITADA    VALUE 03.
       78  CT-OCOR-LIQUIDACAO           VALUE 06.
      * ...
      * ---- Limites operacionais ----
      * Capacidade da tabela em memoria do PROCRET e do controle de
      * nosso-numero duplicado do GERAREM. Os dois DEVEM usar o mesmo
      * valor, senao o GERAREM aceita remessas que o PROCRET nao
      * consegue conciliar.
       78  CT-MAX-TITULOS               VALUE 500.
`,
      },
    ],
    repo: 'https://github.com/ZeHoschett/flowcnab',
    demo: '',
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
    codeSnippet: `
002200 PROCEDURE DIVISION.
002300     DISPLAY "DIGITE O VALOR DA CONTA ATUAL:"
002400     ACCEPT VALOR-ATUAL
002500     DISPLAY "DIGITE O VALOR DO SAQUE A SER REALIZADO:"
002600     ACCEPT VALOR-SAQUE
002700     IF VALOR-SAQUE > VALOR-ATUAL
002800         MOVE "SALDO INSUFICIENTE" TO VERIFICACAO-DO-SALDO
002900         MOVE VALOR-ATUAL TO VALOR-FINAL
003000     ELSE
003100         COMPUTE VALOR-FINAL = VALOR-ATUAL - VALOR-SAQUE
003200         IF VALOR-FINAL < 100.00
003300             COMPUTE VALOR-FINAL = VALOR-FINAL - TAXA-MANUTENCAO
003400         END-IF
003500         MOVE "SAQUE REALIZADO" TO VERIFICACAO-DO-SALDO
003600     END-IF
`,
    fileName: 'ValidacaoDeSaldo.cob',
    codeSamples: [
      {
        fileName: 'ValidacaoDeSaldo.cob',
        caption: 'O programa completo, como foi compilado e executado.',
        code: `
000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID. VALIDA001.
000300 AUTHOR. JOSE HOSCHETT.
000400 DATE-WRITTEN. 03/09/2026.
000500 INSTALLATION. KRONUMTECH.
000600* CALCULO DE VALIDACAO DE SALDO E SAQUE DE CONTA CORRENTE.
000700
000800 ENVIRONMENT DIVISION.
000900 CONFIGURATION SECTION.
001000 SOURCE-COMPUTER. PC.
001100 OBJECT-COMPUTER. PC.
001200
001300 DATA DIVISION.
001400 WORKING-STORAGE SECTION.
001500
001600 77 VALOR-ATUAL           PIC 9(7)V99 VALUE ZERO.
001700 77 VALOR-SAQUE           PIC 9(7)V99 VALUE ZERO.
001800 77 TAXA-MANUTENCAO       PIC 9(7)V99 VALUE 5.00.
001900 77 VALOR-FINAL           PIC 9(7)V99 VALUE ZERO.
002000 77 VERIFICACAO-DO-SALDO  PIC X(40) VALUE SPACES.
002100
002200 PROCEDURE DIVISION.
002300     DISPLAY "DIGITE O VALOR DA CONTA ATUAL:"
002400     ACCEPT VALOR-ATUAL
002500     DISPLAY "DIGITE O VALOR DO SAQUE A SER REALIZADO:"
002600     ACCEPT VALOR-SAQUE
002700     IF VALOR-SAQUE > VALOR-ATUAL
002800         MOVE "SALDO INSUFICIENTE" TO VERIFICACAO-DO-SALDO
002900         MOVE VALOR-ATUAL TO VALOR-FINAL
003000     ELSE
003100         COMPUTE VALOR-FINAL = VALOR-ATUAL - VALOR-SAQUE
003200         IF VALOR-FINAL < 100.00
003300             COMPUTE VALOR-FINAL = VALOR-FINAL - TAXA-MANUTENCAO
003400         END-IF
003500         MOVE "SAQUE REALIZADO" TO VERIFICACAO-DO-SALDO
003600     END-IF
003700     DISPLAY VERIFICACAO-DO-SALDO
003800     DISPLAY "O SALDO FINAL DA CONTA E: " VALOR-FINAL
003900     STOP RUN.
`,
      },
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
    codeSnippet: `
002100 PROCEDURE DIVISION.
002200     DISPLAY "DIGITE O VALOR DO VEICULO: "
002300     ACCEPT VALOR-VEICULO
002400     DISPLAY "DIGITE A IDADE DO CONDUTOR: "
002500     ACCEPT IDADE-CONDUTOR
002600     IF IDADE-CONDUTOR < 25
002700         MOVE "JOVEM" TO SITUACAO
002800         MOVE 5 TO PORCENTAGEM
002900     ELSE
003000         MOVE "EXPERIENTE" TO SITUACAO
003100         MOVE 3 TO PORCENTAGEM
003200     END-IF
003300     COMPUTE VALOR-DO-SEGURO =
003400         VALOR-VEICULO * PORCENTAGEM / 100
003500     DISPLAY "PERFIL: " SITUACAO
003600     DISPLAY "VALOR DO SEGURO: " VALOR-DO-SEGURO
003700     STOP RUN.
`,
    fileName: 'SEGURADORA.cob',
    codeSamples: [
      {
        fileName: 'SEGURADORA.cob',
        caption: 'O programa completo, como foi compilado e executado.',
        code: `
000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID.    SEGURO01.
000300 AUTHOR.        JOSE HOSCHETT.
000400 DATE-WRITTEN.  23/08/2026.
000500 INSTALLATION.  KRONUMTCH.
000600* CALCULAR PRECOS DE SEGUROS.
000700
000800 ENVIRONMENT DIVISION.
000900 CONFIGURATION SECTION.
001000 SOURCE-COMPUTER. PC.
001100 OBJECT-COMPUTER. PC.
001200
001300 DATA DIVISION.
001400 WORKING-STORAGE SECTION.
001500 77 VALOR-VEICULO    PIC 9(7)V99  VALUE ZEROS.
001600 77 IDADE-CONDUTOR   PIC 9(3)     VALUE ZEROS.
001700 77 PORCENTAGEM      PIC 9(3)V99  VALUE ZEROS.
001800 77 VALOR-DO-SEGURO  PIC 9(7)V99  VALUE ZEROS.
001900 77 SITUACAO         PIC X(30)    VALUE SPACES.
002000
002100 PROCEDURE DIVISION.
002200     DISPLAY "DIGITE O VALOR DO VEICULO: "
002300     ACCEPT VALOR-VEICULO
002400     DISPLAY "DIGITE A IDADE DO CONDUTOR: "
002500     ACCEPT IDADE-CONDUTOR
002600     IF IDADE-CONDUTOR < 25
002700         MOVE "JOVEM" TO SITUACAO
002800         MOVE 5 TO PORCENTAGEM
002900     ELSE
003000         MOVE "EXPERIENTE" TO SITUACAO
003100         MOVE 3 TO PORCENTAGEM
003200     END-IF
003300     COMPUTE VALOR-DO-SEGURO =
003400         VALOR-VEICULO * PORCENTAGEM / 100
003500     DISPLAY "PERFIL: " SITUACAO
003600     DISPLAY "VALOR DO SEGURO: " VALOR-DO-SEGURO
003700     STOP RUN.
`,
      },
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
    codeSnippet: `
002100 PROCEDURE DIVISION.
002200     DISPLAY "VALOR ATUAL DA CONTA: "
002300     ACCEPT VALOR-ATUAL.
002400     DISPLAY "DIGITE O VALOR DEPOSITADO: "
002500     ACCEPT VALOR-DEPOSITO.
002600     DISPLAY "DIGITE O VALOR DO SAQUE: "
002700     ACCEPT VALOR-SAQUE.
002800     COMPUTE VALOR-FINAL-DA-CONTA =
002900         VALOR-ATUAL + VALOR-DEPOSITO - VALOR-SAQUE.
003000     IF VALOR-FINAL-DA-CONTA < ZEROS
003100         MOVE "NEGATIVO" TO VERIFICACAO-DA-CONTA
003200     ELSE
003300         MOVE "POSITIVO" TO VERIFICACAO-DA-CONTA
003400     END-IF.
003500     DISPLAY "SUA CONTA ESTA: " VERIFICACAO-DA-CONTA.
003600     DISPLAY "SALDO FINAL: " VALOR-FINAL-DA-CONTA.
003700     STOP RUN.
`,
    fileName: 'SAQUE.cob',
    codeSamples: [
      {
        fileName: 'SAQUE.cob',
        caption: 'O programa completo, como foi compilado e executado.',
        code: `
000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID.    SALDO-NA-CONTA.
000300 AUTHOR.        JOSE HOSCHETT.
000400 DATE-WRITTEN.  23/08/2026.
000500 INSTALLATION.  KRONUMTECH.
000600*CALCULAR SALDO DA CONTA CORRENTE.
000700
000800 ENVIRONMENT DIVISION.
000900 CONFIGURATION SECTION.
001000 SOURCE-COMPUTER. PC.
001100 OBJECT-COMPUTER. PC.
001200
001300 DATA DIVISION.
001400 WORKING-STORAGE SECTION.
001500   77 VALOR-ATUAL          PIC 9(7)V99 VALUE ZEROS.
001600   77 VALOR-DEPOSITO       PIC 9(7)V99 VALUE ZEROS.
001700   77 VALOR-SAQUE          PIC 9(7)V99 VALUE ZEROS.
001800   77 VALOR-FINAL-DA-CONTA PIC S9(7)V99 VALUE ZEROS.
001900   77 VERIFICACAO-DA-CONTA PIC X(30)   VALUE SPACES.
002000
002100 PROCEDURE DIVISION.
002200     DISPLAY "VALOR ATUAL DA CONTA: "
002300     ACCEPT VALOR-ATUAL.
002400     DISPLAY "DIGITE O VALOR DEPOSITADO: "
002500     ACCEPT VALOR-DEPOSITO.
002600     DISPLAY "DIGITE O VALOR DO SAQUE: "
002700     ACCEPT VALOR-SAQUE.
002800     COMPUTE VALOR-FINAL-DA-CONTA =
002900         VALOR-ATUAL + VALOR-DEPOSITO - VALOR-SAQUE.
003000     IF VALOR-FINAL-DA-CONTA < ZEROS
003100         MOVE "NEGATIVO" TO VERIFICACAO-DA-CONTA
003200     ELSE
003300         MOVE "POSITIVO" TO VERIFICACAO-DA-CONTA
003400     END-IF.
003500     DISPLAY "SUA CONTA ESTA: " VERIFICACAO-DA-CONTA.
003600     DISPLAY "SALDO FINAL: " VALOR-FINAL-DA-CONTA.
003700     STOP RUN.
`,
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
    codeSnippet: `
002100 PROCEDURE DIVISION.
002200 DISPLAY "DIGITE O VALOR DO EMPRESTIMO: "
002300 ACCEPT VALOR-EMPRESTIMO
002400 DISPLAY "DIGITE A TAXA DE JUROS (EM %): "
002500 ACCEPT TAXA-DE-JUROS
002600 DISPLAY "DIGITE O NUMERO DE PARCELAS: "
002700 ACCEPT NUMERO-DE-PARCELAS
002800 IF TAXA-DE-JUROS < 5
002900 MOVE "TAXA BAIXA" TO SITUACAO
003000 ELSE
003100 MOVE "TAXA ALTA" TO SITUACAO
003200 END-IF
003300 COMPUTE VALOR-PARCELA-MENSAL =
003400 VALOR-EMPRESTIMO * (1 + TAXA-DE-JUROS / 100) / NUMERO-DE-PARCELAS
003500 DISPLAY "SITUACAO: " SITUACAO
003600 DISPLAY "VALOR DA PARCELA MENSAL: " VALOR-PARCELA-MENSAL
003700 STOP RUN.
`,
    fileName: 'EMPRESTIMO.cob',
    codeSamples: [
      {
        fileName: 'EMPRESTIMO.cob',
        caption: 'O programa completo, como foi compilado e executado.',
        code: `
000100 IDENTIFICATION DIVISION. 
000200 PROGRAM-ID. EMPRESTIMO01.
000300 AUTHOR. JOSÉ HOSCHETT.
000400 DATE-WRITTEN. 28/08/2026.
000500 INSTALLATION. KRONUMTECH.
000600* CALCULAR VALOR DO EMPRESTIMO.
000700
000800 ENVIRONMENT DIVISION.
000900 CONFIGURATION SECTION.
001000 SOURCE-COMPUTER. PC.
001100 OBJECT-COMPUTER. PC.
001200
001300 DATA DIVISION.
001400 WORKING-STORAGE SECTION.
001500 77 VALOR-EMPRESTIMO PIC 9(7)V99 VALUE ZEROS.
001600 77 TAXA-DE-JUROS PIC 9(3)V99 VALUE ZEROS.
001700 77 VALOR-PARCELA-MENSAL PIC 9(7)V99 VALUE ZEROS.
001800 77 NUMERO-DE-PARCELAS PIC 9(3) VALUE ZEROS.
001900 77 SITUACAO PIC X(30) VALUE SPACES.
002000
002100 PROCEDURE DIVISION.
002200 DISPLAY "DIGITE O VALOR DO EMPRESTIMO: "
002300 ACCEPT VALOR-EMPRESTIMO
002400 DISPLAY "DIGITE A TAXA DE JUROS (EM %): "
002500 ACCEPT TAXA-DE-JUROS
002600 DISPLAY "DIGITE O NUMERO DE PARCELAS: "
002700 ACCEPT NUMERO-DE-PARCELAS
002800 IF TAXA-DE-JUROS < 5
002900 MOVE "TAXA BAIXA" TO SITUACAO
003000 ELSE
003100 MOVE "TAXA ALTA" TO SITUACAO
003200 END-IF
003300 COMPUTE VALOR-PARCELA-MENSAL =
003400 VALOR-EMPRESTIMO * (1 + TAXA-DE-JUROS / 100) / NUMERO-DE-PARCELAS
003500 DISPLAY "SITUACAO: " SITUACAO
003600 DISPLAY "VALOR DA PARCELA MENSAL: " VALOR-PARCELA-MENSAL
003700 STOP RUN.
`,
      },
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
      'Parágrafo nomeado (INICIO) na PROCEDURE DIVISION.',
    ],
    codeSnippet: `
001300 INICIO.
001400     DISPLAY " CALCULADORA DE JUROS SIMPLES " .
001500     DISPLAY "-------------------------------" .
001600     DISPLAY "DIGITE O VALOR INICIAL:".
001700     ACCEPT VALOR-INICIAL
001800     DISPLAY " DIGITE A TAXA DE JUROS EM (%):".
001900     ACCEPT TAXA-DE-JUROS.
002000     DISPLAY " DIGITE O TEMPO EM MESES:".
002100     ACCEPT TEMPO.
002200*    JUROS SIMPLES: J = C x i x t, COM A TAXA MENSAL EM %.
002300     COMPUTE JUROS-SIMPLES =
002400         VALOR-INICIAL * TAXA-DE-JUROS / 100 * TEMPO.
002500     COMPUTE VALOR-FINAL = VALOR-INICIAL + JUROS-SIMPLES.
002600     DISPLAY "JUROS: " JUROS-SIMPLES.
002700     DISPLAY "VALOR FINAL: " VALOR-FINAL.
002800     STOP RUN.
`,
    fileName: 'CALCULADORA-DE-JUROS-SIMPLES.cob',
    codeSamples: [
      {
        fileName: 'CALCULADORA-DE-JUROS-SIMPLES.cob',
        caption: 'O programa completo, como foi compilado e executado.',
        code: `
000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID. CALCULADORA-DE-JUROS-SIMPLES.
000300 ENVIRONMENT DIVISION.
000400 DATA DIVISION.
000500 WORKING-STORAGE SECTION.
000600 77 VALOR-INICIAL PIC 9(5)V99 VALUE ZEROS.
000700 77 TAXA-DE-JUROS PIC 9(3)V99 VALUE ZEROS.
000800 77 TEMPO PIC 9(3)V99 VALUE ZEROS. 
000900 77 JUROS-SIMPLES PIC 9(5)V99 VALUE ZEROS.
001000 77 VALOR-FINAL PIC 9(5)V99 VALUE ZEROS.
001100 77 SAIR PIC X VALUE 'N'.
001200 PROCEDURE DIVISION.
001300 INICIO.
001400     DISPLAY " CALCULADORA DE JUROS SIMPLES " .
001500     DISPLAY "-------------------------------" .
001600     DISPLAY "DIGITE O VALOR INICIAL:".
001700     ACCEPT VALOR-INICIAL
001800     DISPLAY " DIGITE A TAXA DE JUROS EM (%):".
001900     ACCEPT TAXA-DE-JUROS.
002000     DISPLAY " DIGITE O TEMPO EM MESES:".
002100     ACCEPT TEMPO.
002200*    JUROS SIMPLES: J = C x i x t, COM A TAXA MENSAL EM %.
002300     COMPUTE JUROS-SIMPLES =
002400         VALOR-INICIAL * TAXA-DE-JUROS / 100 * TEMPO.
002500     COMPUTE VALOR-FINAL = VALOR-INICIAL + JUROS-SIMPLES.
002600     DISPLAY "JUROS: " JUROS-SIMPLES.
002700     DISPLAY "VALOR FINAL: " VALOR-FINAL.
002800     STOP RUN.
`,
      },
    ],
    year: 2026,
  },
  {
    id: 'portfolio',
    title: 'Portfólio Pessoal',
    stack: 'web',
    type: 'web',
    summary:
      'Este site: página única responsiva e interativa, feita com HTML, CSS e JavaScript puros, sem frameworks.',
    description:
      'Arte de fundo com identidade por stack (rede hexagonal em Canvas para Java, letreiro de neon para Python, terminal CRT para COBOL e grade interativa para Web), foco em acessibilidade (WCAG 2.1 AA), performance e código modular com ES Modules.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Acessibilidade'],
    images: [], // TODO(jose): print do site publicado
    codeSamples: [
      {
        fileName: 'index.html',
        language: 'html',
        caption:
          'O esqueleto semântico da página: um <h1> no hero, uma <section> por assunto e os pontos onde o JavaScript injeta o conteúdo.',
        code: `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>José Hoschett | Desenvolvedor COBOL · Java</title>
    <!-- SEO, Open Graph e JSON-LD ficam estáticos: buscadores não executam JavaScript -->
    <link rel="stylesheet" href="assets/css/reset.css">
    <!-- ... um arquivo por camada: tokens, base, layout, components, sections ... -->
    <script type="module" src="assets/js/main.js"></script>
  </head>

  <body>
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

    <header class="site-header" data-header>
      <!-- logo, navegação e CTAs; abaixo de 1280px vira menu sobreposto -->
    </header>

    <main id="conteudo" tabindex="-1">
      <section class="hero" id="inicio" aria-labelledby="hero-title">
        <img class="hero__art" src="assets/img/hero-keycap.webp" alt="" aria-hidden="true">
        <h1 class="hero__title" id="hero-title" data-hero-title>...</h1>
      </section>

      <section class="section about" id="sobre" aria-labelledby="about-title">...</section>
      <section class="section stack" id="stack" aria-labelledby="stack-title">...</section>

      <section class="projects" id="projetos" aria-labelledby="projects-title">
        <!-- uma subseção por stack, cada uma com a sua arte de fundo -->
        <section class="project-stack" id="projetos-java" data-stack="java">
          <ul class="project-grid" data-projects="java"></ul>
        </section>
        <!-- ... python, cobol, web ... -->
      </section>

      <section class="section education" id="formacao" aria-labelledby="education-title">
        <ol class="timeline" data-education></ol>
      </section>

      <section class="section certificates" id="certificados" aria-labelledby="certificates-title">
        <ul class="cert-grid" data-certificates></ul>
      </section>

      <section class="section contact" id="contato" aria-labelledby="contact-title">...</section>
    </main>

    <footer class="site-footer">...</footer>
  </body>
</html>
`,
      },
      {
        fileName: 'assets/css/reset.css',
        language: 'css',
        caption:
          'A ordem das camadas é declarada uma única vez: quem vem depois vence, sem depender de especificidade nem de !important.',
        code: `
/* Cascade layer order, declared once, in the first stylesheet loaded. */
@layer reset, tokens, base, layout, components, sections, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

/* tokens.css: o único lugar com valores crus */
@layer tokens {
  :root {
    --color-bg: #07070a;
    --color-accent: #7c5cff;
    --space-5: 1.5rem;
    --radius-lg: 1rem;
  }
}

/* sections/certificates.css: as regras só consomem tokens */
@layer sections {
  .cert-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--cert-min), 1fr));
    gap: var(--space-5);
  }
}
`,
      },
    ],
    repo: 'https://github.com/ZeHoschett/Portf-lio.on-',
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
      'Catálogo com filtro por categoria e por novidades direto na URL (?categoria=blazer, ?filtro=novo).',
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
          'Next.js App Router: / (hero, coleção da semana, manifesto, benefícios, depoimentos e CTA), /produtos (catálogo) e /produto/[slug], em que o Server Component resolve o produto e os metadados e o Client Component cuida da interação.',
      },
      {
        title: 'Componentes',
        description:
          'Layout (Navbar, Footer, botão de WhatsApp), produto (card, galeria, filtros, provador virtual) e sacola (CartDrawer), reutilizados entre a página inicial e o catálogo.',
      },
      {
        title: 'Estado',
        description:
          'Zustand com duas stores: cartStore (itens, total, abrir e fechar, checkout) e uiStore (menu aberto), compartilhada entre a Navbar e o botão de WhatsApp.',
      },
      {
        title: 'Dados e estilo',
        description:
          'Produtos tipados em data/products.ts e dados da marca (WhatsApp, redes, SEO, frete) em lib/config.ts. Tokens de cor, raio e movimento definidos com @theme no Tailwind CSS v4.',
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
    codeSamples: [
      {
        fileName: 'src/components/product/VirtualTryOn.tsx',
        language: 'typescript',
        caption: 'O provador virtual: o menor tamanho que comporta todas as medidas e o tipo de caimento.',
        code: `
/* ── Algoritmo de recomendação ───────────────────────────────────────────
   Para cada medida informada, encontra os tamanhos que a comportam.
   Retorna o menor tamanho que atende TODAS as medidas informadas.
   Em caso de dúvida, sobe um tamanho (usa max do range como corte).
──────────────────────────────────────────────────────────────────────────── */
function calcIdealSize(
  busto: number | null,
  cintura: number | null,
  quadril: number | null,
  availableSizes: ProductSize[]
): { size: ProductSize; fit: "perfeito" | "folgado" | "justo" } | null {
  if (!busto && !cintura && !quadril) return null;

  const candidates = ALL_SIZES.filter((s) => {
    const r = measureRanges[s];
    if (busto   && busto   > r.busto[1])   return false;
    if (cintura && cintura > r.cintura[1]) return false;
    if (quadril && quadril > r.quadril[1]) return false;
    return true;
  });

  /* Dentre os candidatos que cabem, pega o menor disponível no produto */
  const available = candidates.filter((s) => availableSizes.includes(s));
  if (available.length === 0) return null;

  const best = available[0];
  const r = measureRanges[best];

  /* Classifica o ajuste */
  const measures = [
    busto   ? { val: busto,   range: r.busto }   : null,
    cintura ? { val: cintura, range: r.cintura } : null,
    quadril ? { val: quadril, range: r.quadril } : null,
  ].filter(Boolean) as { val: number; range: [number, number] }[];

  const fits = measures.map(({ val, range }) => {
    if (val >= range[0] && val <= range[1]) return "perfeito";
    if (val < range[0]) return "folgado";
    return "justo";
  });

  const fit = fits.includes("justo") ? "justo" : fits.includes("folgado") ? "folgado" : "perfeito";
  return { size: best, fit };
}
`,
      },
      {
        fileName: 'src/store/cartStore.ts',
        language: 'typescript',
        caption: 'A sacola em Zustand e a comanda que segue para o WhatsApp.',
        code: `
/* Formata a comanda completa para o WhatsApp */
function buildOrderText(items: CartItem[]): string {
  const lines = items.map((item) => {
    const name = item.product.name;
    const color = item.color.name;
    const size = item.size;
    const qty = item.quantity;
    const price = formatPrice(item.product.price * qty);
    return \`• \${name} — \${color} · Tam. \${size} · \${qty} un. · \${price}\`;
  });

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  lines.push(\`\\nTotal: \${formatPrice(total)}\`);
  return lines.join("\\n");
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  items: [],
  isOpen: false,
  // ...
  addItem: (product, color, size, quantity = 1) => {
    const id = itemId(product.id, color.slug, size);
    const existing = get().items.find((i) => i.id === id);

    if (existing) {
      /* Incrementa quantidade se já existe a combinação */
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + quantity } : i
        ),
      }));
    } else {
      set((s) => ({
        items: [...s.items, { id, product, color, size, quantity }],
      }));
    }

    /* Abre o drawer automaticamente ao adicionar */
    set({ isOpen: true });
  },
  // ...
  checkout: () => {
    const { items } = get();
    if (items.length === 0) return;
    const orderText = buildOrderText(items);
    const url = buildWhatsAppUrl(orderText);
    window.open(url, "_blank");
  },
}));
`,
      },
      {
        fileName: 'src/app/produtos/CatalogContent.tsx',
        language: 'typescript',
        caption: 'Os filtros do catálogo vivem na URL, então um link já abre a vitrine filtrada.',
        code: `
export function CatalogContent() {
  const searchParams = useSearchParams();

  const categoria = searchParams.get("categoria") as ProductCategory | "todos" | null;
  const filtro = searchParams.get("filtro");

  const filtered = products.filter((p) => {
    if (categoria && categoria !== "todos" && p.category !== categoria) return false;
    if (filtro === "novo" && !p.isNew) return false;
    return true;
  });

  /* Label do filtro ativo para o heading */
  const headingLabel =
    filtro === "novo"
      ? "Novidades"
      : categoria && categoria !== "todos"
      ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
      : "Coleção Completa";
`,
      },
    ],
    repo: '', // TODO(jose): o projeto ainda não tem repositório no GitHub
    demo: '', // TODO(jose): link quando o deploy na Vercel estiver no ar
    year: 2026,
  },
];
