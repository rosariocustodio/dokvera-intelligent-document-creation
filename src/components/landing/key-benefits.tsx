import { FileCheck, Sparkles, FileText } from "lucide-react";
import { useLanguage } from "@/lib/landing-i18n";

export function KeyBenefits() {
  const { t } = useLanguage();

  const BENEFITS = [
    {
      icon: FileCheck,
      title: t.benefits.b1Title,
      desc: t.benefits.b1Desc,
    },
    {
      icon: Sparkles,
      title: t.benefits.b2Title,
      desc: t.benefits.b2Desc,
    },
    {
      icon: FileText,
      title: t.benefits.b3Title,
      desc: t.benefits.b3Desc,
    },
  ];

  return (
    <section id="beneficios" className="py-16 md:py-24 bg-card/40 border-y border-border/50">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            {t.benefits.tagline}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t.benefits.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.benefits.subtitle}
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
