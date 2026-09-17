import { Layers, Sliders, Download, CheckCircle, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Capabilities() {
  const pillars = [
    {
      icon: Layers,
      title: "Estrutura Inteligente",
      badge: "Arquitetura",
      description:
        "Diferente de assistentes normais de chat que entregam texto corrido e desorganizado, o Dokvera projeta a árvore completa do documento: capa, índice, introdução, capítulos e conclusões.",
      featureList: [
        "Índice hierárquico navegável",
        "Divisão lógica por seções e capítulos",
        "Sem necessidade de prompts complexos",
      ],
    },
    {
      icon: Sliders,
      title: "Normas & Formatação Nativas",
      badge: "Conformidade",
      description:
        "Cada documento é criado segundo as regras de formatação exigidas. Seja para monografias acadêmicas, relatórios de negócios ou currículos executivos.",
      featureList: [
        "Normas visuais e margens padronizadas",
        "Tipografia executiva e acadêmica",
        "Estilo limpo e pronto para apresentação",
      ],
    },
    {
      icon: Download,
      title: "Exportação Fiel (.docx / .pdf)",
      badge: "Download Fiel",
      description:
        "Descarregue ficheiros 100% editáveis no Microsoft Word (.docx) sem quebras de layout ou tabelas desformatadas, ou gere um PDF de alta resolução.",
      featureList: [
        "Ficheiros .docx editáveis no Word",
        "Exportação limpa para PDF",
        "Sem marcas de água no documento",
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-surface/30 border-y border-border/70">
      <div className="mx-auto max-w-6xl px-5">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Wand2 className="size-3 text-primary" />
            <span>Por que escolher o Dokvera?</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl tracking-tight">
            Criado para quem precisa de documentos reais e profissionais
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Três pilares concebidos para eliminar o trabalho manual de escrita e formatação.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 md:p-7 shadow-soft flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {pillar.badge}
                    </Badge>
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <ul className="space-y-2 text-xs">
                    {pillar.featureList.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-foreground/90 font-medium"
                      >
                        <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
