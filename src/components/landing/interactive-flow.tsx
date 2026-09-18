import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, FileText, Cpu, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/landing-i18n";

export function InteractiveFlow() {
  const { t } = useLanguage();
  const [promptText, setPromptText] = useState(t.hero.promptPlaceholder);

  return (
    <div className="w-full">
      {/* Main Interactive Studio Mockup Card */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 md:p-8 backdrop-blur-xl shadow-2xl transition-all">
        {/* Studio Window Header Bar */}
        <div className="flex items-center justify-between pb-5 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-destructive/60" />
            <span className="size-3 rounded-full bg-amber-500/60" />
            <span className="size-3 rounded-full bg-emerald-500/60" />
            <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground hidden sm:inline">
              {t.hero.appPreviewHeader}
            </span>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
            Dokvera Studio v2.0
          </Badge>
        </div>

        {/* 3 Steps Pipeline Mockup */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Step 1: Prompt Input */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border/80 bg-background/70 p-5 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  {t.hero.tabPrompt}
                </span>
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold">
                  01
                </span>
              </div>

              <div className="rounded-xl bg-card p-3.5 border border-border/60 text-xs text-foreground leading-relaxed italic shadow-inner">
                "{t.hero.promptPlaceholder}"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Input pronto</span>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Step 2: AI Pipeline */}
          <div className="lg:col-span-3 flex flex-col justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Cpu className="size-3.5" />
                {t.hero.tabStructure}
              </span>
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold">
                02
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl bg-background/90 p-2.5 border border-border/70 shadow-2xs">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-foreground leading-snug">
                  {t.hero.step1}
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/90 p-2.5 border border-border/70 shadow-2xs">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-foreground leading-snug">
                  {t.hero.step2}
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/90 p-2.5 border border-border/70 shadow-2xs">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-foreground leading-snug">
                  {t.hero.step3}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Ready File Output */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FileCheck className="size-3.5 text-emerald-500" />
                  {t.hero.tabOutput}
                </span>
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  03
                </span>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-display text-foreground">
                    Documento_Oficial_Final.docx
                  </span>
                  <Badge variant="secondary" className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {t.hero.readyBadge}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
                  <span className="rounded bg-muted px-1.5 py-0.5">Word .docx</span>
                  <span className="rounded bg-muted px-1.5 py-0.5">PDF</span>
                  <span>• 100% Editável</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Estruturado por Dokvera Engine</span>
              <span className="font-bold text-primary flex items-center gap-1">
                {t.hero.downloadText} <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
