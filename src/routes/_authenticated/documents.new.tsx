import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { AlertTriangle, Check, Coins, Loader2, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/hooks/use-session";
import { creditsQuery } from "@/lib/queries";
import {
  DOCUMENT_TYPES,
  PAGE_RANGES,
  calculateTotalDocumentCost,
  calculateStudentExtraCost,
  checkAffordability,
  creditsToMzn,
  formatMzn,
  type DocumentTypeDef,
  type PageRangeOption,
} from "@/lib/dokvera";

export const Route = createFileRoute("/_authenticated/documents/new")({
  head: () => ({
    meta: [
      { title: "Criar documento — Dokvera" },
      { name: "description", content: "Escolhe o tipo de documento que queres criar no Dokvera." },
      { property: "og:title", content: "Criar documento — Dokvera" },
      { property: "og:description", content: "Escolhe o tipo de documento a criar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewDocument,
});

function TypeIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.FileText;
  return <Icon className="size-5" />;
}

function NewDocument() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const credits = balance ?? 0;

  const [selected, setSelected] = useState<DocumentTypeDef | null>(null);
  const [selectedPageRange, setSelectedPageRange] = useState<PageRangeOption>(PAGE_RANGES[0]);
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  const isAcademicOrSchool = selected?.id === "academic" || selected?.id === "school";

  const effectiveCost = useMemo(() => {
    if (!selected) return 0;
    const base = isAcademicOrSchool ? selectedPageRange.cost : selected.cost;
    return isAcademicOrSchool ? calculateTotalDocumentCost(base, numberOfStudents) : base;
  }, [selected, selectedPageRange, numberOfStudents, isAcademicOrSchool]);

  const check = useMemo(
    () => checkAffordability(credits, effectiveCost),
    [credits, effectiveCost],
  );

  const create = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Nenhum tipo selecionado");
      if (!title.trim()) throw new Error("Por favor, insira o título do documento.");
      if (!check.affordable) throw new Error("Créditos insuficientes para esta operação.");

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          title: title.trim(),
          doc_type: selected.id,
          subject: subject.trim() || null,
          status: "draft",
          metadata: {
            estimated_cost: effectiveCost,
            page_range: isAcademicOrSchool ? selectedPageRange.id : null,
            students_count: isAcademicOrSchool ? numberOfStudents : 1,
          },
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast.success("Documento gerado e guardado com sucesso!");
      setSelected(null);
      setTitle("");
      setSubject("");
      setNumberOfStudents(1);
      navigate({ to: "/documents" });
    },
    onError: (e: Error) => {
      toast.error("Erro ao criar documento", { description: e.message });
    },
  });

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Criar novo documento"
        subtitle="Escolha o tipo de documento desejado. O custo em créditos é calculado de forma transparente."
        action={
          <Badge variant="secondary" className="h-9 gap-2 rounded-full px-4 text-sm font-semibold shadow-sm">
            <Coins className="size-4 text-primary" />
            {credits} créditos · {formatMzn(creditsToMzn(credits))}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_TYPES.map((type) => {
          const affordable = credits >= type.cost;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSelected(type);
                setSelectedPageRange(PAGE_RANGES[0]);
                setNumberOfStudents(1);
              }}
              className="shadow-soft group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                    <TypeIcon name={type.icon} />
                  </span>
                  <Badge
                    variant={affordable ? "secondary" : "outline"}
                    className="rounded-full text-[11px]"
                  >
                    {type.id === "academic" ? "A partir de 5" : type.cost} cr
                  </Badge>
                </div>
                <h3 className="mt-5 text-base font-semibold">{type.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {type.description}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{formatMzn(creditsToMzn(type.cost))}</span>
                <span className="text-primary font-semibold flex items-center gap-1">
                  Selecionar <Sparkles className="size-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="rounded-3xl sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{selected?.label}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para configurar o seu documento inteligente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Secções dinâmicas para Trabalhos Académicos / Escolares */}
            {isAcademicOrSchool && (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Extensão do documento (Páginas)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAGE_RANGES.map((range) => (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setSelectedPageRange(range)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          selectedPageRange.id === range.id
                            ? "border-primary bg-primary/5 font-medium shadow-sm"
                            : "border-border/70 bg-card hover:border-border"
                        }`}
                      >
                        <span className="text-sm font-semibold">{range.label}</span>
                        <span className="text-xs text-muted-foreground">{range.cost} créditos ({formatMzn(creditsToMzn(range.cost))})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="students-count" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3.5" /> Número de Participantes / Estudantes
                    </Label>
                    <span className="text-xs text-muted-foreground">Até 4 incluídos</span>
                  </div>
                  <Input
                    id="students-count"
                    type="number"
                    min={1}
                    max={20}
                    value={numberOfStudents}
                    onChange={(e) => setNumberOfStudents(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-11 rounded-xl bg-background"
                  />
                  {numberOfStudents > 4 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      +{calculateStudentExtraCost(numberOfStudents).additionalStudents} estudantes além dos 4 incluídos (+{calculateStudentExtraCost(numberOfStudents).extraCost} créditos)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Informações Básicas do Documento (Sempre visíveis no Modal) */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título do documento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doc-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Impacto da digitalização na banca em Moçambique"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tema / contexto (opcional)
                </Label>
                <Textarea
                  id="doc-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Disciplina, instituição, requisitos específicos ou instruções detalhadas."
                  className="min-h-24 rounded-xl"
                />
              </div>
            </div>

            {/* Painel de Resumo Financeiro */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Custo total da operação</span>
                <span className="font-bold text-primary text-base">
                  {effectiveCost} créditos · {formatMzn(creditsToMzn(effectiveCost))}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saldo atual na conta</span>
                <span className="font-semibold">
                  {check.balance} créditos · {formatMzn(creditsToMzn(check.balance))}
                </span>
              </div>
              <div className="mt-3 border-t border-border/70 pt-3">
                {check.affordable ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <Check className="size-4 shrink-0" />
                    Saldo suficiente para processar este documento.
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    Faltam {check.missing} créditos ({formatMzn(check.missingInMzn)}).
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border/50">
            <Button variant="ghost" className="rounded-xl h-11 px-5" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            {check.affordable ? (
              <Button
                className="rounded-xl h-11 px-6 font-semibold shadow-sm"
                disabled={!title.trim() || create.isPending}
                onClick={() => create.mutate()}
              >
                {create.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Gerar Documento
              </Button>
            ) : (
              <Button asChild className="rounded-xl h-11 px-6">
                <Link to="/credits">
                  <Coins className="mr-2 size-4" />
                  Adquirir Créditos
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
