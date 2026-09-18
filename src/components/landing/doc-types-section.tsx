import { GraduationCap, Briefcase, FileSignature, Building2, FileCode2 } from "lucide-react";

const TYPES = [
  {
    icon: GraduationCap,
    title: "Académicos",
    desc: "Monografias, relatórios de estágio e trabalhos científicos com capa e índice.",
  },
  {
    icon: Briefcase,
    title: "Profissionais",
    desc: "Currículos visuais, perfis LinkedIn e cartas de apresentação.",
  },
  {
    icon: FileSignature,
    title: "Administrativos",
    desc: "Requerimentos formais, declarações e ofícios institucionais.",
  },
  {
    icon: Building2,
    title: "Negócios",
    desc: "Propostas comerciais, planos de negócio e sínteses executivas.",
  },
  {
    icon: FileCode2,
    title: "Personalizados",
    desc: "Documentos sob medida com estrutura definida pelo utilizador.",
  },
];

export function DocTypesSection() {
  return (
    <section className="py-12 border-y border-border/50 bg-card/40">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Um único estúdio para todos os seus documentos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            O Dokvera adapta a estrutura, as normas e o tom ao tipo exacto de ficheiro que necessita.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="rounded-2xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-xs flex flex-col justify-between"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-foreground">{t.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
