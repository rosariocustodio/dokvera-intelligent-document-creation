/**
 * Declarative specification of every document type Dokvera can produce.
 *
 * The whole "criar documento" experience (picker, dynamic form, pricing,
 * export outline) is driven by this file. Adding a new document type means
 * adding one entry here — no UI changes required.
 *
 * IMPORTANT: pricing values here are the single source of truth used by
 * `src/lib/pricing.ts`. Costs are ALWAYS computed in code, never by AI.
 */

export type DocCategoryId = "academico" | "profissional" | "formal" | "outro";

export type DocCategory = {
  id: DocCategoryId;
  label: string;
  description: string;
};

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: "academico",
    label: "Académico & Escolar",
    description: "Trabalhos, relatórios e resumos para escola e universidade.",
  },
  {
    id: "profissional",
    label: "Profissional",
    description: "CV, cartas de apresentação e documentos de trabalho.",
  },
  {
    id: "formal",
    label: "Formal & Administrativo",
    description: "Requerimentos, declarações e cartas oficiais.",
  },
  {
    id: "outro",
    label: "Outro",
    description: "Descreve o documento que precisas e nós estruturamos.",
  },
];

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "students"
  | "list";

export type FieldDef = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** Only show this field when another field/toggle has a truthy value. */
  showWhen?: string;
};

export type FieldGroup = {
  id: string;
  label: string;
  description?: string;
  fields: FieldDef[];
};

/** A part of the document the user can include or leave out. */
export type StructureOption = {
  id: string;
  label: string;
  description?: string;
  /** Selected by default. */
  default: boolean;
  /** Cannot be turned off (core of the document). */
  required?: boolean;
  /** Extra credits when included. */
  extraCredits?: number;
};

export type PageTier = {
  id: string;
  label: string;
  minPages: number;
  maxPages: number;
  credits: number;
};

export type TemplateOption = {
  id: string;
  label: string;
  description: string;
  /** Visual hint used by the template preview card. */
  accent: "classic" | "modern" | "minimal" | "bold";
};

export type DocSpec = {
  id: string;
  label: string;
  description: string;
  category: DocCategoryId;
  icon: string;
  keywords: string[];
  /** Base cost in credits when no page tier applies. */
  baseCredits: number;
  pageTiers?: PageTier[];
  /** Up to 4 students included; 5–7 add credits per extra student. */
  students?: { max: number; includedFree: number; extraPerStudent: number };
  groups: FieldGroup[];
  structure?: StructureOption[];
  templates?: TemplateOption[];
  layouts?: TemplateOption[];
  /** Placeholder for the "Como gostaria que o documento fosse?" field. */
  instructionsPlaceholder: string;
};

const ACADEMIC_PAGE_TIERS: PageTier[] = [
  { id: "5-9", label: "5–9 páginas", minPages: 5, maxPages: 9, credits: 3 },
  { id: "10-15", label: "10–15 páginas", minPages: 10, maxPages: 15, credits: 5 },
  { id: "16-20", label: "16–20 páginas", minPages: 16, maxPages: 20, credits: 7 },
  { id: "21-30", label: "21–30 páginas", minPages: 21, maxPages: 30, credits: 10 },
];

const ACADEMIC_STRUCTURE: StructureOption[] = [
  { id: "cover", label: "Capa", description: "Instituição, tema, autores e data.", default: true },
  { id: "back_cover", label: "Contracapa", description: "Página com docente e local.", default: true },
  { id: "index", label: "Índice automático", description: "Gerado a partir das secções incluídas.", default: true },
  { id: "introduction", label: "Introdução", default: true },
  { id: "general_objective", label: "Objectivo geral", default: true },
  { id: "specific_objectives", label: "Objectivos específicos", default: true },
  { id: "methodology", label: "Metodologia", default: false, extraCredits: 0.5 },
  { id: "development", label: "Desenvolvimento", default: true, required: true },
  { id: "case_study", label: "Estudo de caso", default: false, extraCredits: 0.75 },
  { id: "conclusion", label: "Conclusão", default: true },
  { id: "recommendations", label: "Recomendações", default: false, extraCredits: 0.5 },
  { id: "references", label: "Referências bibliográficas", default: true },
  { id: "annexes", label: "Anexos", default: false, extraCredits: 0.5 },
];

const ACADEMIC_GROUPS: FieldGroup[] = [
  {
    id: "identificacao",
    label: "Identificação do trabalho",
    fields: [
      { id: "theme", label: "Tema do trabalho", type: "text", required: true, placeholder: "Ex.: Impacto da digitalização na banca em Moçambique" },
      { id: "subject", label: "Disciplina / cadeira", type: "text", placeholder: "Ex.: Gestão de Sistemas de Informação" },
      { id: "institution", label: "Instituição", type: "text", placeholder: "Ex.: Universidade Eduardo Mondlane" },
      { id: "course", label: "Curso", type: "text", placeholder: "Ex.: Licenciatura em Informática" },
      { id: "class_year", label: "Ano / turma", type: "text", placeholder: "Ex.: 3.º ano, turma B" },
      { id: "teacher", label: "Docente", type: "text", placeholder: "Nome do(a) docente" },
      { id: "city", label: "Local", type: "text", placeholder: "Ex.: Maputo" },
      { id: "delivery_date", label: "Data de entrega", type: "date" },
    ],
  },
  {
    id: "autores",
    label: "Estudante(s)",
    description: "Até 4 estudantes sem custo adicional.",
    fields: [{ id: "students", label: "Estudantes", type: "students", required: true }],
  },
  {
    id: "formatacao",
    label: "Formatação e conteúdo",
    fields: [
      {
        id: "citation_style",
        label: "Norma de citação",
        type: "select",
        options: [
          { value: "apa", label: "APA" },
          { value: "abnt", label: "ABNT" },
          { value: "iso690", label: "ISO 690" },
          { value: "none", label: "Sem norma específica" },
        ],
      },
      {
        id: "language_level",
        label: "Nível de linguagem",
        type: "select",
        options: [
          { value: "basico", label: "Básico / escolar" },
          { value: "academico", label: "Académico" },
          { value: "tecnico", label: "Técnico avançado" },
        ],
      },
      { id: "topics", label: "Pontos que devem ser abordados", type: "list", help: "Um por linha — usado para montar o desenvolvimento." },
    ],
  },
];

export const DOC_SPECS: DocSpec[] = [
  {
    id: "academic",
    label: "Trabalho Académico",
    description: "Monografias e trabalhos universitários com estrutura formal completa.",
    category: "academico",
    icon: "GraduationCap",
    keywords: ["monografia", "universidade", "faculdade", "tcc", "pesquisa", "trabalho"],
    baseCredits: 5,
    pageTiers: ACADEMIC_PAGE_TIERS,
    students: { max: 7, includedFree: 4, extraPerStudent: 0.39 },
    groups: ACADEMIC_GROUPS,
    structure: ACADEMIC_STRUCTURE,
    instructionsPlaceholder:
      "Ex.: quero linguagem formal, exemplos moçambicanos, foco em dados recentes e citações APA no corpo do texto.",
  },
  {
    id: "school",
    label: "Trabalho Escolar",
    description: "Trabalhos do ensino básico e secundário, simples e bem organizados.",
    category: "academico",
    icon: "BookOpen",
    keywords: ["escola", "secundário", "básico", "turma", "professor"],
    baseCredits: 4,
    pageTiers: ACADEMIC_PAGE_TIERS,
    students: { max: 7, includedFree: 4, extraPerStudent: 0.39 },
    groups: ACADEMIC_GROUPS,
    structure: ACADEMIC_STRUCTURE.filter((s) => s.id !== "case_study"),
    instructionsPlaceholder:
      "Ex.: linguagem simples para 10.ª classe, com exemplos do dia-a-dia e frases curtas.",
  },
  {
    id: "report",
    label: "Relatório",
    description: "Relatórios de estágio, actividade ou projecto.",
    category: "academico",
    icon: "ClipboardList",
    keywords: ["estágio", "actividade", "projecto", "relatorio", "empresa"],
    baseCredits: 6,
    pageTiers: [
      { id: "5-9", label: "5–9 páginas", minPages: 5, maxPages: 9, credits: 4 },
      { id: "10-15", label: "10–15 páginas", minPages: 10, maxPages: 15, credits: 6 },
      { id: "16-25", label: "16–25 páginas", minPages: 16, maxPages: 25, credits: 9 },
    ],
    students: { max: 7, includedFree: 4, extraPerStudent: 0.39 },
    groups: [
      {
        id: "identificacao",
        label: "Identificação",
        fields: [
          { id: "theme", label: "Assunto do relatório", type: "text", required: true, placeholder: "Ex.: Relatório de estágio curricular" },
          {
            id: "report_type",
            label: "Tipo de relatório",
            type: "select",
            options: [
              { value: "internship", label: "Estágio" },
              { value: "activity", label: "Actividade" },
              { value: "project", label: "Projecto" },
              { value: "visit", label: "Visita de estudo" },
              { value: "technical", label: "Técnico" },
            ],
          },
          { id: "organization", label: "Organização / empresa", type: "text", placeholder: "Onde decorreu" },
          { id: "supervisor", label: "Supervisor / tutor", type: "text" },
          { id: "institution", label: "Instituição de ensino", type: "text" },
          { id: "period", label: "Período", type: "text", placeholder: "Ex.: Janeiro a Março de 2026" },
          { id: "city", label: "Local", type: "text" },
          { id: "delivery_date", label: "Data de entrega", type: "date" },
        ],
      },
      {
        id: "autores",
        label: "Autor(es)",
        description: "Até 4 autores sem custo adicional.",
        fields: [{ id: "students", label: "Autores", type: "students", required: true }],
      },
      {
        id: "conteudo",
        label: "Conteúdo",
        fields: [
          { id: "activities", label: "Actividades realizadas", type: "list", help: "Uma por linha." },
          { id: "results", label: "Resultados / aprendizagens", type: "textarea" },
        ],
      },
    ],
    structure: [
      { id: "cover", label: "Capa", default: true },
      { id: "index", label: "Índice automático", default: true },
      { id: "introduction", label: "Introdução", default: true },
      { id: "objectives", label: "Objectivos", default: true },
      { id: "activities", label: "Actividades desenvolvidas", default: true, required: true },
      { id: "analysis", label: "Análise crítica", default: true },
      { id: "conclusion", label: "Conclusão", default: true },
      { id: "references", label: "Referências", default: false },
      { id: "annexes", label: "Anexos", default: false, extraCredits: 0.5 },
    ],
    instructionsPlaceholder:
      "Ex.: destacar competências adquiridas, tom profissional e ligação com a área do curso.",
  },
  {
    id: "summary",
    label: "Resumo / Síntese",
    description: "Resumos de textos, livros, artigos ou aulas.",
    category: "academico",
    icon: "AlignLeft",
    keywords: ["resumo", "sintese", "livro", "artigo", "aula", "ficha de leitura"],
    baseCredits: 2,
    pageTiers: [
      { id: "1-2", label: "1–2 páginas", minPages: 1, maxPages: 2, credits: 2 },
      { id: "3-5", label: "3–5 páginas", minPages: 3, maxPages: 5, credits: 3 },
      { id: "6-10", label: "6–10 páginas", minPages: 6, maxPages: 10, credits: 4 },
    ],
    groups: [
      {
        id: "fonte",
        label: "Fonte a resumir",
        fields: [
          { id: "theme", label: "Título do conteúdo", type: "text", required: true, placeholder: "Ex.: O Alquimista — Paulo Coelho" },
          { id: "author", label: "Autor da obra", type: "text" },
          {
            id: "summary_style",
            label: "Estilo do resumo",
            type: "select",
            options: [
              { value: "narrative", label: "Texto corrido" },
              { value: "bullets", label: "Pontos-chave" },
              { value: "mixed", label: "Misto" },
            ],
          },
          { id: "source_text", label: "Texto ou tópicos de origem", type: "textarea", help: "Cola aqui o conteúdo ou os tópicos principais." },
        ],
      },
    ],
    structure: [
      { id: "context", label: "Contextualização", default: true },
      { id: "summary", label: "Resumo do conteúdo", default: true, required: true },
      { id: "key_ideas", label: "Ideias-chave", default: true },
      { id: "critical_note", label: "Apreciação crítica", default: false, extraCredits: 0.5 },
      { id: "references", label: "Referência da obra", default: true },
    ],
    instructionsPlaceholder: "Ex.: resumo objectivo, sem opiniões, adequado para apresentação oral.",
  },
  {
    id: "cv",
    label: "Currículo (CV)",
    description: "CV profissional pronto a enviar, com modelo e layout à escolha.",
    category: "profissional",
    icon: "IdCard",
    keywords: ["cv", "curriculo", "curriculum", "emprego", "candidatura"],
    baseCredits: 3,
    templates: [
      { id: "classic", label: "Clássico", description: "Uma coluna, sóbrio, ideal para banca e função pública.", accent: "classic" },
      { id: "modern", label: "Moderno", description: "Duas colunas com barra lateral de contactos e competências.", accent: "modern" },
      { id: "minimal", label: "Minimalista", description: "Muito espaço branco, tipografia limpa.", accent: "minimal" },
      { id: "bold", label: "Destaque", description: "Cabeçalho forte, bom para áreas criativas e vendas.", accent: "bold" },
    ],
    layouts: [
      { id: "one_column", label: "Uma coluna", description: "Leitura linear, compatível com sistemas ATS.", accent: "classic" },
      { id: "two_columns", label: "Duas colunas", description: "Mais informação por página.", accent: "modern" },
    ],
    groups: [
      {
        id: "pessoal",
        label: "Dados pessoais",
        fields: [
          { id: "full_name", label: "Nome completo", type: "text", required: true },
          { id: "headline", label: "Cargo / área pretendida", type: "text", placeholder: "Ex.: Técnico de Contabilidade" },
          { id: "email", label: "Email", type: "text" },
          { id: "phone", label: "Telefone", type: "text", placeholder: "+258 8x xxx xxxx" },
          { id: "address", label: "Cidade / província", type: "text", placeholder: "Ex.: Maputo, Moçambique" },
          { id: "birth_date", label: "Data de nascimento", type: "date" },
          { id: "nationality", label: "Nacionalidade", type: "text" },
          { id: "linkedin", label: "LinkedIn / portefólio", type: "text" },
        ],
      },
      {
        id: "conteudo",
        label: "Percurso",
        fields: [
          { id: "profile", label: "Perfil profissional", type: "textarea", help: "2 a 4 linhas sobre ti." },
          { id: "experience", label: "Experiência profissional", type: "list", help: "Uma por linha: cargo — empresa — período." },
          { id: "education", label: "Formação académica", type: "list", help: "Uma por linha: curso — instituição — ano." },
          { id: "skills", label: "Competências", type: "list", help: "Uma por linha." },
          { id: "languages", label: "Idiomas", type: "list", help: "Ex.: Português — nativo." },
          { id: "certifications", label: "Certificações / cursos", type: "list" },
          { id: "references_list", label: "Referências", type: "list", help: "Nome — cargo — contacto.", showWhen: "references" },
        ],
      },
    ],
    structure: [
      { id: "profile", label: "Perfil profissional", default: true },
      { id: "experience", label: "Experiência profissional", default: true, required: true },
      { id: "education", label: "Formação académica", default: true },
      { id: "skills", label: "Competências", default: true },
      { id: "languages", label: "Idiomas", default: true },
      { id: "certifications", label: "Certificações e cursos", default: false },
      { id: "projects", label: "Projectos / portefólio", default: false, extraCredits: 0.25 },
      { id: "volunteering", label: "Voluntariado", default: false },
      { id: "references", label: "Referências", default: false },
      { id: "photo", label: "Espaço para fotografia", default: false },
      { id: "cover_letter", label: "Carta de apresentação anexa", description: "Adiciona uma carta personalizada.", default: false, extraCredits: 1 },
    ],
    instructionsPlaceholder:
      "Ex.: quero destacar experiência em atendimento ao cliente, CV de uma página, tom directo.",
  },
  {
    id: "cover_letter",
    label: "Carta de Apresentação",
    description: "Carta de candidatura ajustada à vaga e à empresa.",
    category: "profissional",
    icon: "Mail",
    keywords: ["carta", "candidatura", "vaga", "emprego", "motivação"],
    baseCredits: 2,
    groups: [
      {
        id: "candidatura",
        label: "Candidatura",
        fields: [
          { id: "full_name", label: "O teu nome", type: "text", required: true },
          { id: "position", label: "Vaga a que te candidatas", type: "text", required: true },
          { id: "company", label: "Empresa / instituição", type: "text" },
          { id: "recipient", label: "Destinatário", type: "text", placeholder: "Ex.: Departamento de Recursos Humanos" },
          { id: "contact", label: "Os teus contactos", type: "text", placeholder: "Email e telefone" },
          { id: "city", label: "Local", type: "text" },
          { id: "letter_date", label: "Data", type: "date" },
          { id: "highlights", label: "Pontos fortes a destacar", type: "list" },
        ],
      },
    ],
    structure: [
      { id: "greeting", label: "Saudação formal", default: true },
      { id: "intro", label: "Apresentação e motivo", default: true, required: true },
      { id: "value", label: "Competências e mais-valia", default: true },
      { id: "closing", label: "Fecho e disponibilidade", default: true },
      { id: "signature", label: "Assinatura", default: true },
    ],
    instructionsPlaceholder: "Ex.: tom confiante mas humilde, no máximo uma página.",
  },
  {
    id: "request",
    label: "Requerimento",
    description: "Requerimentos formais com a linguagem administrativa correcta.",
    category: "formal",
    icon: "FileSignature",
    keywords: ["requerimento", "pedido", "oficio", "administração", "formal"],
    baseCredits: 2,
    groups: [
      {
        id: "pedido",
        label: "Dados do requerimento",
        fields: [
          { id: "full_name", label: "Nome do requerente", type: "text", required: true },
          { id: "id_document", label: "Documento de identificação", type: "text", placeholder: "BI / DIRE n.º" },
          { id: "recipient", label: "Dirigido a", type: "text", required: true, placeholder: "Ex.: Ex.mo Senhor Director da Faculdade..." },
          { id: "purpose", label: "O que pretendes requerer", type: "textarea", required: true, placeholder: "Ex.: emissão de certificado de frequência" },
          { id: "justification", label: "Justificação", type: "textarea" },
          { id: "contact", label: "Contacto", type: "text" },
          { id: "city", label: "Local", type: "text" },
          { id: "letter_date", label: "Data", type: "date" },
        ],
      },
    ],
    structure: [
      { id: "heading", label: "Cabeçalho / destinatário", default: true, required: true },
      { id: "body", label: "Corpo do pedido", default: true, required: true },
      { id: "legal_basis", label: "Fundamentação legal", default: false, extraCredits: 0.5 },
      { id: "closing", label: "Fórmula de encerramento", default: true },
      { id: "attachments", label: "Lista de anexos", default: false },
    ],
    instructionsPlaceholder: "Ex.: linguagem muito formal, uma página, com espaço para assinatura e data.",
  },
  {
    id: "declaration",
    label: "Declaração",
    description: "Declarações, autorizações e termos de responsabilidade.",
    category: "formal",
    icon: "ScrollText",
    keywords: ["declaração", "autorização", "termo", "responsabilidade"],
    baseCredits: 2,
    groups: [
      {
        id: "declaracao",
        label: "Dados da declaração",
        fields: [
          { id: "declarant", label: "Quem declara", type: "text", required: true },
          { id: "id_document", label: "Documento de identificação", type: "text" },
          {
            id: "declaration_type",
            label: "Tipo",
            type: "select",
            options: [
              { value: "generic", label: "Declaração simples" },
              { value: "authorization", label: "Autorização" },
              { value: "responsibility", label: "Termo de responsabilidade" },
              { value: "residence", label: "Declaração de residência" },
            ],
          },
          { id: "purpose", label: "Conteúdo a declarar", type: "textarea", required: true },
          { id: "beneficiary", label: "Sobre quem / para quem", type: "text" },
          { id: "city", label: "Local", type: "text" },
          { id: "letter_date", label: "Data", type: "date" },
        ],
      },
    ],
    structure: [
      { id: "identification", label: "Identificação do declarante", default: true, required: true },
      { id: "body", label: "Texto da declaração", default: true, required: true },
      { id: "purpose_note", label: "Finalidade da declaração", default: true },
      { id: "signature", label: "Assinatura e data", default: true },
      { id: "witnesses", label: "Testemunhas", default: false },
    ],
    instructionsPlaceholder: "Ex.: usar linguagem jurídica simples e deixar campos para reconhecimento notarial.",
  },
  {
    id: "letter",
    label: "Carta Formal / Ofício",
    description: "Comunicação oficial entre pessoas, empresas e instituições.",
    category: "formal",
    icon: "Send",
    keywords: ["carta", "ofício", "comunicação", "empresa", "instituição"],
    baseCredits: 2,
    groups: [
      {
        id: "carta",
        label: "Dados da carta",
        fields: [
          { id: "sender", label: "Remetente", type: "text", required: true },
          { id: "recipient", label: "Destinatário", type: "text", required: true },
          { id: "reference", label: "Assunto", type: "text", required: true },
          { id: "purpose", label: "Mensagem principal", type: "textarea", required: true },
          {
            id: "tone",
            label: "Tom",
            type: "select",
            options: [
              { value: "formal", label: "Formal" },
              { value: "institutional", label: "Institucional" },
              { value: "commercial", label: "Comercial" },
              { value: "complaint", label: "Reclamação" },
            ],
          },
          { id: "city", label: "Local", type: "text" },
          { id: "letter_date", label: "Data", type: "date" },
        ],
      },
    ],
    structure: [
      { id: "header", label: "Cabeçalho", default: true },
      { id: "subject", label: "Linha de assunto", default: true },
      { id: "body", label: "Corpo da carta", default: true, required: true },
      { id: "closing", label: "Fecho e assinatura", default: true },
      { id: "attachments", label: "Anexos", default: false },
    ],
    instructionsPlaceholder: "Ex.: firme mas cordial, referir prazo de resposta de 5 dias úteis.",
  },
  {
    id: "other",
    label: "Outro Documento",
    description: "Descreve o que precisas e nós organizamos a estrutura.",
    category: "outro",
    icon: "FilePlus2",
    keywords: ["outro", "personalizado", "livre"],
    baseCredits: 3,
    pageTiers: [
      { id: "1-3", label: "1–3 páginas", minPages: 1, maxPages: 3, credits: 3 },
      { id: "4-10", label: "4–10 páginas", minPages: 4, maxPages: 10, credits: 5 },
      { id: "11-20", label: "11–20 páginas", minPages: 11, maxPages: 20, credits: 8 },
    ],
    groups: [
      {
        id: "livre",
        label: "O teu documento",
        fields: [
          { id: "theme", label: "Título / assunto", type: "text", required: true },
          { id: "audience", label: "Para quem é o documento", type: "text", placeholder: "Ex.: direcção da empresa" },
          { id: "purpose", label: "Objectivo do documento", type: "textarea", required: true },
          { id: "topics", label: "Secções que queres incluir", type: "list", help: "Uma por linha." },
        ],
      },
    ],
    structure: [
      { id: "cover", label: "Capa", default: false },
      { id: "index", label: "Índice automático", default: false },
      { id: "introduction", label: "Introdução", default: true },
      { id: "body", label: "Corpo do documento", default: true, required: true },
      { id: "conclusion", label: "Conclusão", default: true },
      { id: "references", label: "Referências", default: false },
      { id: "annexes", label: "Anexos", default: false, extraCredits: 0.5 },
    ],
    instructionsPlaceholder: "Descreve com detalhe como queres o documento: estrutura, tom, extensão e o que evitar.",
  },
];

export function getSpec(id: string): DocSpec | undefined {
  return DOC_SPECS.find((s) => s.id === id);
}

export function specLabel(id: string): string {
  return getSpec(id)?.label ?? "Documento";
}

export function specsByCategory(category: DocCategoryId): DocSpec[] {
  return DOC_SPECS.filter((s) => s.category === category);
}

export function searchSpecs(term: string, category: DocCategoryId | "all"): DocSpec[] {
  const q = term.trim().toLowerCase();
  return DOC_SPECS.filter((spec) => {
    if (category !== "all" && spec.category !== category) return false;
    if (!q) return true;
    return (
      spec.label.toLowerCase().includes(q) ||
      spec.description.toLowerCase().includes(q) ||
      spec.keywords.some((k) => k.includes(q))
    );
  });
}
