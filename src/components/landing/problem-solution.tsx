import { AlertTriangle, CheckCircle2, Clock, FileWarning, Layers, Sparkles } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3.5 py-1 text-xs font-semibold text-destructive mb-3">
            <AlertTriangle className="size-3 text-destructive" />
            <span>O Custo Oculto da Criação Tradicional</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Criar documentos importantes não devia ser um pesadelo manual
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seja na universidade, no ambiente corporativo ou na administração pública, o processo
            tradicional consome dias em tarefas repetitivas que a tecnologia já superou.
          </p>
        </div>

        {/* 3 Friction Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Friction 1 */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:border-destructive/30 transition-all">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-5 font-mono text-lg font-bold">
                01
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2.5">
                O Bloqueio da Folha em Branco
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Começar do zero é a etapa mais lenta e desgastante. Sem uma estrutura inicial clara,
                horas preciosas são perdidas a tentar descobrir quais tópicos, introdução e
                metodologia devem compor o documento.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-semibold text-destructive flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Média de 3 a 5 horas perdidas no rascunho inicial</span>
            </div>
          </div>

          {/* Friction 2 */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:border-destructive/30 transition-all">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-5 font-mono text-lg font-bold">
                02
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2.5">
                A Desordem Lógica e Estrutural
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Organizar pensamentos dispersos em capítulos coerentes, com argumentação sólida e
                transições formais consistentes, é extremamente difícil sem uma visão arquitetural
                antecipada do documento.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-semibold text-destructive flex items-center gap-1.5">
              <FileWarning className="size-3.5" />
              <span>Risco de rejeição por falta de coerência formal</span>
            </div>
          </div>

          {/* Friction 3 */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft flex flex-col justify-between relative overflow-hidden group hover:border-destructive/30 transition-all">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-5 font-mono text-lg font-bold">
                03
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2.5">
                O Pesadelo da Formatação
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Lutar com editores de texto tradicionais por causa de margens, recuos de parágrafo,
                tabelas desconfiguradas, numeração de páginas e sumários que quebram gera frustração
                e retrabalho constante.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-semibold text-destructive flex items-center gap-1.5">
              <Layers className="size-3.5" />
              <span>Horas gastas em alinhamento de texto e margens</span>
            </div>
          </div>
        </div>

        {/* The Dokvera Answer Banner */}
        <div className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-8 md:p-10 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                <Sparkles className="size-4" />
                <span>A Abordagem Dokvera</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Do objetivo ao documento final com clareza e estrutura.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Você define a intenção ou necessidade, e a nossa inteligência artificial projeta a
                arquitetura documental perfeita, redige com profundidade e entrega tudo formatado
                nos padrões exigidos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl bg-background px-4 py-3 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Zero Bloqueio Inicial</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-background px-4 py-3 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Formatação Pronta</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
