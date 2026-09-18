import { LayoutTemplate, Wand2, Download } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: LayoutTemplate,
    title: "Escolha o tipo de documento",
    desc: "Selecione o modelo desejado (académico, profissional ou administrativo). Cada tipo possui o seu próprio formato pré-configurado.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Preencha ou cole os dados",
    desc: "Insira as informações nos campos ou cole o enunciado do seu trabalho. A nossa IA extrai os tópicos e estrutura os capítulos.",
  },
  {
    number: "03",
    icon: Download,
    title: "Exporte em Word (.docx) ou PDF",
    desc: "Descarregue o documento final devidamente formatado, pronto para entregar ou editar livremente no Microsoft Word.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            Fluxo Simples
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Como funciona em 3 passos
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sem complicações ou processos longos. De uma simples ideia ao documento oficial finalizado.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch relative">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="relative rounded-3xl border border-border/70 bg-card p-7 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-muted-foreground/40">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
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
