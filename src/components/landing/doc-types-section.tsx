import { GraduationCap, Briefcase, FileSignature, Building2, FileCode2 } from "lucide-react";
import { useLanguage } from "@/lib/landing-i18n";

export function DocTypesSection() {
  const { t } = useLanguage();

  const TYPES = [
    { icon: GraduationCap, title: t.docTypes.academic, desc: t.docTypes.academicDesc },
    { icon: Briefcase, title: t.docTypes.professional, desc: t.docTypes.professionalDesc },
    { icon: FileSignature, title: t.docTypes.administrative, desc: t.docTypes.administrativeDesc },
    { icon: Building2, title: t.docTypes.business, desc: t.docTypes.businessDesc },
    { icon: FileCode2, title: t.docTypes.custom, desc: t.docTypes.customDesc },
  ];

  return (
    <section className="py-12 border-y border-border/50 bg-card/40">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {t.docTypes.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t.docTypes.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TYPES.map((tItem) => {
            const Icon = tItem.icon;
            return (
              <div
                key={tItem.title}
                className="rounded-2xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-xs flex flex-col justify-between"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-foreground">{tItem.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tItem.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
