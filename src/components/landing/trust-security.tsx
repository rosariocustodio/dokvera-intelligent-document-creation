import { ShieldCheck, Lock, Cloud, Award, FileCheck } from "lucide-react";

export function TrustSecurity() {
  const trustPoints = [
    {
      icon: Lock,
      title: "Privacidade e Isolamento de Dados",
      description:
        "Os seus documentos e rascunhos são estritamente privados. Utilizamos isolamento no nível de linha (Row-Level Security) na nossa base de dados. Ninguém além de você tem acesso aos seus textos.",
    },
    {
      icon: Award,
      title: "Rigor e Padrões Editoriais",
      description:
        "Cada modelo gerado segue diretrizes formais consagradas (estruturas de monografia, normas executivas e fórmulas protocolares), assegurando total credibilidade perante avaliadores e clientes.",
    },
    {
      icon: Cloud,
      title: "Sincronização Contínua em Nuvem",
      description:
        "Todas as alterações são preservadas automaticamente em tempo real. Aceda aos seus rascunhos, versões e documentos finalizados em qualquer dispositivo, a qualquer momento.",
    },
  ];

  return (
    <section className="py-20 bg-surface/30 border-y border-border/70">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <ShieldCheck className="size-3 text-primary" />
            <span>Confiança e Credibilidade</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Construído com padrões de segurança e rigor
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Garantimos que a sua produção intelectual esteja sempre segura, privada e formatada com
            máxima precisão técnica.
          </p>
        </div>

        {/* 3 Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                    <Icon className="size-5.5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="size-3.5" />
                  <span>100% Conforme e Seguro</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
