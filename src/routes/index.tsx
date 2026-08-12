import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileStack,
  FolderTree,
  Layers,
  ListOrdered,
  Quote,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import {
  CREDIT_PACKS,
  CREDIT_PRICE_MZN,
  DOCUMENT_TYPES,
  creditsToMzn,
  formatMzn,
  packPriceMzn,
  packTotalCredits,
} from "@/lib/dokvera";

const title = "Dokvera — Cria e organiza documentos académicos e profissionais";
const description =
  "O Dokvera ajuda-te a criar, organizar e preparar documentos académicos e profissionais com tecnologia de IA. Créditos simples: 1 crédito = 55 MT.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Landing,
});

const benefits = [
  {
    icon: FolderTree,
    title: "Organização real",
    text: "Cada documento fica guardado, versionável e pesquisável — não é só texto solto num chat.",
  },
  {
    icon: ListOrdered,
    title: "Estrutura académica",
    text: "Capa, índice, objectivos gerais e específicos e referências preparados pela plataforma.",
  },
  {
    icon: Wand2,
    title: "IA como assistente",
    text: "A IA acelera a escrita; a estrutura, os cálculos e o formato ficam a cargo do Dokvera.",
  },
  {
    icon: ShieldCheck,
    title: "Privado por definição",
    text: "Os teus documentos são só teus. Cada conta acede exclusivamente aos seus dados.",
  },
  {
    icon: Layers,
    title: "Créditos transparentes",
    text: "Vês o custo antes de avançar. Sem surpresas, sem subscrições obrigatórias.",
  },
  {
    icon: FileStack,
    title: "Pronto a entregar",
    text: "Arquitectura preparada para exportação em DOCX e PDF com formatação correcta.",
  },
];

const steps = [
  {
    n: "01",
    title: "Escolhe o tipo de documento",
    text: "Trabalho académico, relatório, CV, resumo, requerimento e mais.",
  },
  {
    n: "02",
    title: "Descreve o teu contexto",
    text: "Tema, disciplina, instituição e requisitos. O Dokvera monta a estrutura.",
  },
  {
    n: "03",
    title: "Confirma os créditos",
    text: "O sistema mostra o custo exacto e o teu saldo antes de continuar.",
  },
  {
    n: "04",
    title: "Organiza e finaliza",
    text: "Revês, guardas no teu espaço e preparas a versão final para entrega.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#beneficios" className="transition-colors hover:text-foreground">
              Benefícios
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Como funciona
            </a>
            <a href="#documentos" className="transition-colors hover:text-foreground">
              Documentos
            </a>
            <a href="#precos" className="transition-colors hover:text-foreground">
              Créditos
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden rounded-xl sm:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/auth">Começar agora</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
        <div className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="animate-fade-in mb-6 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="mr-1.5 size-3.5 text-primary" />
              Documentos com IA, organizados como devem ser
            </Badge>
            <h1 className="animate-fade-up font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              <span className="text-gradient-brand">Dokvera</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              O Dokvera ajuda-te a <strong className="font-semibold text-foreground">criar</strong>,{" "}
              <strong className="font-semibold text-foreground">organizar</strong> e{" "}
              <strong className="font-semibold text-foreground">preparar</strong> documentos
              académicos e profissionais com tecnologia de IA — do trabalho da universidade ao
              relatório da empresa.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 w-full rounded-xl px-7 text-sm font-semibold sm:w-auto">
                <Link to="/auth">
                  Começar Agora
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <GoogleSignInButton className="w-full sm:w-auto" />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              1 crédito = {formatMzn(CREDIT_PRICE_MZN)} · 10 créditos de boas-vindas na primeira
              conta
            </p>
          </div>

          <div className="animate-fade-up glass shadow-elevated mx-auto mt-16 max-w-4xl rounded-3xl p-2">
            <div className="rounded-[1.25rem] bg-surface p-5 md:p-7">
              <div className="flex items-center gap-2 pb-5">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-muted-foreground">dokvera.app/dashboard</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="gradient-brand shadow-glow rounded-2xl p-5 text-brand-foreground">
                  <p className="text-xs font-medium opacity-80">Saldo de créditos</p>
                  <p className="mt-2 font-display text-3xl font-bold">32</p>
                  <p className="mt-1 text-xs opacity-85">
                    = {formatMzn(creditsToMzn(32))}
                  </p>
                </div>
                {[
                  { t: "Monografia — Gestão", s: "Concluído", d: "Trabalho Académico" },
                  { t: "Relatório de Estágio", s: "Rascunho", d: "Relatório" },
                ].map((doc) => (
                  <div key={doc.t} className="rounded-2xl border border-border/70 bg-card p-5">
                    <p className="text-sm font-semibold">{doc.t}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{doc.d}</p>
                    <Badge variant="secondary" className="mt-4 rounded-full text-[11px]">
                      {doc.s}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Benefícios</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Não é um gerador de texto. É a tua plataforma de documentos.
          </h2>
          <p className="mt-4 text-muted-foreground">
            O Dokvera trata do que os geradores comuns ignoram: estrutura, formatação, organização e
            histórico de tudo o que produzes.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="shadow-soft group rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="scroll-mt-20 border-y border-border/60 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Como funciona</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Quatro passos, do zero ao documento pronto
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="glass shadow-soft rounded-2xl p-6">
                <span className="text-gradient-brand font-display text-3xl font-extrabold">
                  {s.n}
                </span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document types */}
      <section id="documentos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Tipos de documentos</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Para a escola, a universidade e o trabalho
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada tipo tem um custo fixo em créditos, calculado pelo sistema e visível antes de
            avançares.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENT_TYPES.map((t) => (
            <div
              key={t.id}
              className="shadow-soft flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold">{t.label}</h3>
                  <Badge variant="secondary" className="shrink-0 rounded-full text-[11px]">
                    {t.cost} cr
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                ≈ {formatMzn(creditsToMzn(t.cost))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="scroll-mt-20 border-y border-border/60 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Créditos</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Pagas o que usas — 1 crédito = {formatMzn(CREDIT_PRICE_MZN)}
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sem mensalidades. Compras créditos, usas quando precisas e vês sempre o equivalente em
              meticais.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {CREDIT_PACKS.map((p) => (
              <div
                key={p.id}
                className={
                  p.highlight
                    ? "shadow-elevated relative rounded-3xl border-2 border-primary/60 bg-card p-7"
                    : "shadow-soft rounded-3xl border border-border/70 bg-card p-7"
                }
              >
                {p.highlight ? (
                  <Badge className="absolute -top-3 left-7 rounded-full">Mais popular</Badge>
                ) : null}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-4 font-display text-4xl font-extrabold">
                  {formatMzn(packPriceMzn(p))}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {packTotalCredits(p)} créditos
                  {(p.bonus ?? 0) > 0 ? ` (${p.credits} + ${(p.bonus ?? 0)} bónus)` : ""}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={p.highlight ? "default" : "outline"}
                  className="mt-7 h-11 w-full rounded-xl"
                >
                  <Link to="/auth">Escolher {p.name}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Todos os cálculos de créditos e valores são feitos pelo sistema Dokvera.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl px-7 py-14 text-center text-brand-foreground">
          <Quote className="absolute -top-2 left-6 size-24 opacity-10" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Começa hoje o teu próximo documento
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm opacity-90 md:text-base">
            Cria a tua conta em segundos com o Google e recebe 10 créditos para experimentar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GoogleSignInButton
              label="Login / Cadastro com Google"
              variant="secondary"
              className="w-full sm:w-auto"
            />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-brand-foreground/40 bg-transparent px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-foreground/10 sm:w-auto"
            >
              <Link to="/auth">
                <BookOpen className="mr-1.5 size-4" />
                Criar conta com email
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 sm:flex-row">
          <Logo showParent />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dokvera. Uma plataforma <strong className="font-semibold">Dokvera by Ruqzora</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
