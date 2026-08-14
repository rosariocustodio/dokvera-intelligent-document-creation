import { useMemo, useState, useEffect } from "react";
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
import { creditsQuery, documentQuery } from "@/lib/queries";
import { z } from "zod";
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
  validateSearch: (search) => z.object({
    draftId: z.string().optional(),
    category: z.string().optional(),
  }).parse(search),
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

const CATEGORIES = [
  { id: "academic", label: "Académico" },
  { id: "school", label: "Escolar" },
  { id: "pro", label: "Profissional" },
  { id: "letters", label: "Cartas e Ofícios" },
  { id: "personal", label: "Pessoal" },
];

const ACADEMIC_IDS = ["academic", "academic_report", "tcc", "academic_summary", "scientific_article", "research_project", "reading_sheet"];
const SCHOOL_IDS = ["school", "school_research", "school_summary"];
const PRO_IDS = ["cv", "cover_letter", "proposal"];
const LETTERS_IDS = ["request", "formal_req", "formal_letter", "official_letter", "declaration"];
const PERSONAL_IDS = ["personal_letter", "simple_cv"];

function getDocumentCategory(id: string): string {
  if (ACADEMIC_IDS.includes(id)) return "academic";
  if (SCHOOL_IDS.includes(id)) return "school";
  if (PRO_IDS.includes(id)) return "pro";
  if (LETTERS_IDS.includes(id)) return "letters";
  if (PERSONAL_IDS.includes(id)) return "personal";
  return "academic";
}

function NewDocument() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { draftId, category: urlCategory } = Route.useSearch();
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "academic");
  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const credits = balance ?? 0;

  const { data: draftDoc } = useQuery({
    ...documentQuery(draftId || ""),
    enabled: Boolean(draftId),
  });

  const [selected, setSelected] = useState<DocumentTypeDef | null>(null);
  const [selectedPageRange, setSelectedPageRange] = useState<PageRangeOption>((PAGE_RANGES[0] as PageRangeOption));
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [cvTemplate, setCvTemplate] = useState<string>("classic");
  const [cvLayout, setCvLayout] = useState<string>("one_column");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (draftDoc) {
      setTitle(draftDoc.title || "");
      setSubject(draftDoc.subject || "");
      
      const matchedSpec = DOCUMENT_TYPES.find(t => t.id === draftDoc.doc_type);
      if (matchedSpec) {
        setSelected(matchedSpec);
      }
      
      const draftMetadata = draftDoc.metadata || {};
      const pageRangeId = draftMetadata["page_range"] as string | undefined;
      const studentsCount = draftMetadata["students_count"] as number | string | undefined;

      if (pageRangeId) {
        const matchedRange = PAGE_RANGES.find(r => r.id === pageRangeId);
        if (matchedRange) {
          setSelectedPageRange(matchedRange as PageRangeOption);
        }
      }
      if (studentsCount) {
        setNumberOfStudents(Number(studentsCount));
      }

      const draftOptions = draftDoc.options || {};
      if (draftOptions["template"]) setCvTemplate(draftOptions["template"] as string);
      if (draftOptions["layout"]) setCvLayout(draftOptions["layout"] as string);
    }
  }, [draftDoc]);

  const isAcademicOrSchool =
    selected?.id === "academic" ||
    selected?.id === "academic_report" ||
    selected?.id === "tcc" ||
    selected?.id === "scientific_article" ||
    selected?.id === "research_project" ||
    selected?.id === "school" ||
    selected?.id === "school_research";

  const effectiveCost = useMemo(() => {
    if (!selected) return 0;
    const base = isAcademicOrSchool ? selectedPageRange.cost : selected.cost;
    return isAcademicOrSchool ? calculateTotalDocumentCost(base, numberOfStudents) : base;
  }, [selected, selectedPageRange, numberOfStudents, isAcademicOrSchool]);

  const check = useMemo(
    () => checkAffordability(credits, effectiveCost),
    [credits, effectiveCost],
  );

  // Auto-save debounced effect
  useEffect(() => {
    if (!title.trim() || !selected) {
      setAutoSaveStatus("idle");
      return;
    }
    
    setAutoSaveStatus("saving");
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        if (draftId) {
          const { error } = await supabase
            .from("documents")
            .update({
              title: title.trim(),
              subject: subject.trim() || null,
              estimated_cost: effectiveCost,
              options: selected?.id === "cv" ? { template: cvTemplate, layout: cvLayout } : {},
              metadata: {
                estimated_cost: effectiveCost,
                page_range: isAcademicOrSchool ? selectedPageRange.id : null,
                students_count: isAcademicOrSchool ? numberOfStudents : 1,
              },
            })
            .eq("id", draftId);
          
          if (error) {
            setAutoSaveStatus("error");
          } else {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["document", draftId] });
            setAutoSaveStatus("saved");
          }
        } else {
          const { data, error } = await supabase
            .from("documents")
            .insert({
              user_id: userId,
              title: title.trim(),
              doc_type: selected.id,
              subject: subject.trim() || null,
              status: "draft",
              estimated_cost: effectiveCost,
              options: selected.id === "cv" ? { template: cvTemplate, layout: cvLayout } : {},
              metadata: {
                estimated_cost: effectiveCost,
                page_range: isAcademicOrSchool ? selectedPageRange.id : null,
                students_count: isAcademicOrSchool ? numberOfStudents : 1,
              },
            })
            .select("id")
            .single();
          
          if (error) {
            setAutoSaveStatus("error");
          } else if (data) {
            navigate({
              to: "/documents/new",
              search: { draftId: data.id },
              replace: true,
            });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            setAutoSaveStatus("saved");
          }
        }
      } catch (err) {
        console.error("Erro no salvamento automático:", err);
        setAutoSaveStatus("error");
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(delayDebounceFn);
  }, [title, subject, cvTemplate, cvLayout, selected, selectedPageRange, numberOfStudents, draftId]);

  const create = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Nenhum tipo selecionado");
      if (!title.trim()) throw new Error("Por favor, insira o título do documento.");
      if (!check.affordable) throw new Error("Créditos insuficientes para esta operação.");

      if (draftId) {
        const { error } = await supabase
          .from("documents")
          .update({
            title: title.trim(),
            subject: subject.trim() || null,
            estimated_cost: effectiveCost,
            metadata: {
              estimated_cost: effectiveCost,
              page_range: isAcademicOrSchool ? selectedPageRange.id : null,
              students_count: isAcademicOrSchool ? numberOfStudents : 1,
            },
          })
          .eq("id", draftId);

        if (error) throw error;
        return { id: draftId };
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert({
            user_id: userId,
            title: title.trim(),
            doc_type: selected.id,
            subject: subject.trim() || null,
            status: "draft",
            estimated_cost: effectiveCost,
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
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (draftId) {
        queryClient.invalidateQueries({ queryKey: ["document", draftId] });
      }
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast.success(draftId ? "Rascunho atualizado com sucesso!" : "Documento gerado e guardado com sucesso!");
      setSelected(null);
      setTitle("");
      setSubject("");
      setNumberOfStudents(1);
      navigate({ to: draftId ? `/documents/${draftId}` : "/documents" });
    },
    onError: (e: Error) => {
      toast.error(draftId ? "Erro ao atualizar rascunho" : "Erro ao criar documento", { description: e.message });
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

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-muted/60 rounded-2xl max-w-2xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 min-w-[110px] sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeCategory === cat.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_TYPES.filter((t) => getDocumentCategory(t.id) === activeCategory).map((type) => {
          const affordable = credits >= type.cost;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSelected(type);
                setSelectedPageRange((PAGE_RANGES[0] as PageRangeOption));
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
                    {type.id === "academic" || type.id === "tcc" || type.id === "academic_report" ? "A partir de 5" : type.cost} cr
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
            {/* Secções dinâmicas para Currículo (CV) */}
            {selected?.id === "cv" && (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estilo do Currículo (Design)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "classic", label: "Clássico", desc: "Design formal, uma coluna" },
                      { id: "modern", label: "Moderno", desc: "Moderno, azul e cinza" },
                      { id: "minimal", label: "Minimalista", desc: "Limpo, amplo espaçamento" },
                      { id: "bold", label: "Destaque (Bold)", desc: "Cabeçalho com cor forte" }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setCvTemplate(tpl.id)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          cvTemplate === tpl.id
                            ? "border-primary bg-primary/5 font-medium shadow-sm"
                            : "border-border/70 bg-card hover:border-border"
                        }`}
                      >
                        <span className="text-sm font-semibold">{tpl.label}</span>
                        <span className="text-[11px] text-muted-foreground">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Layout de Colunas
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "one_column", label: "Uma Coluna (ATS)", desc: "Excelente compatibilidade" },
                      { id: "two_columns", label: "Duas Colunas", desc: "Mais compacto e visual" }
                    ].map((lyt) => (
                      <button
                        key={lyt.id}
                        type="button"
                        onClick={() => setCvLayout(lyt.id)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          cvLayout === lyt.id
                            ? "border-primary bg-primary/5 font-medium shadow-sm"
                            : "border-border/70 bg-card hover:border-border"
                        }`}
                      >
                        <span className="text-sm font-semibold">{lyt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{lyt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

          <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border/50 items-center justify-between">
            <div className="flex items-center gap-1.5 min-h-5">
              {autoSaveStatus === "saving" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin text-primary" /> A gravar rascunho...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Check className="size-3.5" /> Rascunho gravado automaticamente
                </span>
              )}
              {autoSaveStatus === "error" && (
                <span className="text-xs text-destructive">Erro ao gravar rascunho</span>
              )}
            </div>
            <div className="flex gap-2">
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
                  {draftId ? "Concluir Rascunho" : "Gerar Documento"}
                </Button>
              ) : (
                <Button asChild className="rounded-xl h-11 px-6">
                  <Link to="/credits">
                    <Coins className="mr-2 size-4" />
                    Adquirir Créditos
                  </Link>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
