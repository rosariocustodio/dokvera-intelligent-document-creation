/**
 * Category Presets & Formal Protocol Formulas for Dokvera.
 *
 * Provides 1-click intelligent presets per category and official formal salutation pills.
 */

export type CategoryPreset = {
  id: string;
  label: string;
  description: string;
  icon?: string;
  category: "academico" | "profissional" | "administrativo" | "negocios" | "comunicacao" | "personalizado";
  defaults: {
    pageTierId?: string;
    citation_style?: string;
    templateId?: string;
    structure?: string[];
    sampleTheme?: string;
    instructions?: string;
  };
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  // ACADÉMICO
  {
    id: "monografia_licenciatura",
    category: "academico",
    label: "Monografia de Licenciatura",
    description: "Estrutura completa de fim de curso com normas APA 7 e capa oficial.",
    defaults: {
      pageTierId: "16-21",
      citation_style: "apa",
      templateId: "classic",
      structure: ["cover", "back_cover", "index", "introduction", "general_objective", "specific_objectives", "methodology", "development", "conclusion", "references"],
      sampleTheme: "Impacto da Transformação Digital na Eficiência Organizacional",
      instructions: "Incluir enquadramento teórico rigoroso e análise de dados.",
    },
  },
  {
    id: "relatorio_estagio",
    category: "academico",
    label: "Relatório de Estágio",
    description: "Apresentação formal de atividades de estágio curricular ou profissional.",
    defaults: {
      pageTierId: "6-11",
      citation_style: "iso690",
      templateId: "modern",
      structure: ["cover", "back_cover", "index", "introduction", "development", "conclusion", "references"],
      sampleTheme: "Relatório de Estágio Curricular na Área de Gestão de Projetos",
      instructions: "Detalhar atividades desempenhadas, desafios e aprendizagens.",
    },
  },
  {
    id: "trabalho_trimestral",
    category: "academico",
    label: "Trabalho Trimestral / Avaliação",
    description: "Trabalho rápido para cadeiras universitárias de 5 a 10 páginas.",
    defaults: {
      pageTierId: "1-5",
      citation_style: "apa",
      templateId: "minimal",
      structure: ["cover", "index", "introduction", "development", "conclusion", "references"],
      sampleTheme: "Análise Crítica dos Sistemas de Informação Empresariais",
    },
  },

  // PROFISSIONAL
  {
    id: "cv_executivo",
    category: "profissional",
    label: "CV Executivo / Tech",
    description: "Currículo moderno de alto impacto adaptado a seleções exigentes.",
    defaults: {
      templateId: "modern",
      instructions: "Destacar conquistas mensuráveis e competências técnicas de relevância.",
    },
  },
  {
    id: "carta_apresentacao",
    category: "profissional",
    label: "Carta de Apresentação Profissional",
    description: "Carta formal de candidatura a vagas ou propostas de consultoria.",
    defaults: {
      templateId: "minimal",
      instructions: "Manter tom confiante, respeitoso e orientado a resultados.",
    },
  },

  // ADMINISTRATIVO
  {
    id: "requerimento_bolsa",
    category: "administrativo",
    label: "Requerimento de Bolsa / Isenção",
    description: "Pedido formal de apoio financeiro ou isenção de propinas.",
    defaults: {
      instructions: "Fundamentar a necessidade com base no bom rendimento escolar e situação socioeconómica.",
    },
  },
  {
    id: "declaracao_oficial",
    category: "administrativo",
    label: "Declaração de Matrícula / Serviço",
    description: "Documento comprovativo formal com fórmulas institucionais.",
    defaults: {
      instructions: "Garantir linguagem jurídica e administrativa clara.",
    },
  },

  // NEGÓCIOS
  {
    id: "proposta_comercial_b2b",
    category: "negocios",
    label: "Proposta Comercial B2B",
    description: "Proposta corporativa com apresentação de serviços, prazos e orçamento.",
    defaults: {
      templateId: "bold",
      instructions: "Incluir proposta de valor clara, tabela de entregáveis e condições de pagamento.",
    },
  },
  {
    id: "plano_negocio",
    category: "negocios",
    label: "Plano de Negócio / Startup",
    description: "Estruturação executiva de modelo de negócio, mercado e finanças.",
    defaults: {
      templateId: "modern",
      instructions: "Incluir análise SWOT, público-alvo e estimativa de rentabilidade.",
    },
  },
];

export const FORMAL_SALUTATIONS = [
  { label: "Exmo. Senhor Director", value: "Exmo. Senhor Director da Faculdade / Instituição" },
  { label: "Ilmo. Senhor Decano", value: "Ilmo. Senhor Decano de Faculdade" },
  { label: "Exmo. Presidente do Conselho", value: "Exmo. Senhor Presidente do Conselho de Administração" },
  { label: "À Direcção dos Recursos Humanos", value: "À Direcção dos Recursos Humanos" },
  { label: "Ao Exmo. Chefe do Departamento", value: "Ao Exmo. Senhor Chefe do Departamento" },
];
