import { FileCheck, Sparkles, FileText } from "lucide-react";

const BENEFITS = [
  {
    icon: FileCheck,
    title: "Formatação Estruturada Automática",
    desc: "Aplique normas de formatação (ABNT, APA ou tom executivo) sem precisar ajustar margens, fontes ou espaçamentos manualmente.",
  },
  {
    icon: Sparkles,
    title: "Sem Começar do Zero",
    desc: "Transforme enunciados, tópicos ou rascunhos soltos em capítulos coerentes e bem estruturados através da nossa IA.",
  },
  {
    icon: FileText,
    title: "Exportação Fiel em Word e PDF",
    desc: "Descarregue ficheiros editáveis em formato Microsoft Word (.docx) ou PDF pronto para impressão e envio oficial.",
  },
];

export function KeyBenefits() {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-card/40 border-y border-border/50">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            Vantagens do Dokvera
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Os 3 principais benefícios
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Concebido para poupar tempo e garantir qualidade em todos os seus documentos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
