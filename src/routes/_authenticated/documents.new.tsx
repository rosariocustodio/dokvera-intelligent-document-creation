import React, { useEffect, useMemo, useState, useDeferredValue } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Loader2,
  Search,
  Sparkles,
  Users,
  X,
  FileText,
  Wand2,
  Layers,
  LayoutTemplate,
  Eye,
  ChevronRight,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentQuery, profileQuery } from "@/lib/queries";
import { getCountryConfig } from "@/lib/countries";
import { creditsToCurrency, formatCurrency } from "@/lib/dokvera";
import {
  DOC_CATEGORIES,
  DOC_SPECS,
  getSpec,
  searchSpecs,
  type DocSpec,
  type FieldDef,
} from "@/lib/document-specs";
import { checkBalance, computeCost, type DocumentDraftValues } from "@/lib/pricing";
import {
  CvTemplateSelector,
  CvLivePreview,
  extractCvDataFromFields,
  type CvAccentColor,
} from "@/components/cv";
import { DocumentSkeletonPreview } from "@/components/studio/DocumentSkeletonPreview";
import { MagicFill } from "@/components/studio/MagicFill";
import { MobilePreviewSheet } from "@/components/studio/MobilePreviewSheet";
import { CATEGORY_PRESETS, FORMAL_SALUTATIONS, type CategoryPreset } from "@/lib/category-presets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/documents/new")({
  validateSearch: (search) =>
    z
      .object({
        draftId: z.string().optional(),
        type: z.string().optional(),
      })
      .parse(search),
  head: () => ({
    meta: [
      { title: "Estúdio de Engenharia Documental — Dokvera" },
      { name: "description", content: "Criador de documentos profissionais com assistente de IA." },
      { property: "og:title", content: "Estúdio de Engenharia Documental — Dokvera" },
      { property: "og:description", content: "Assistente avançado de criação de documentos Dokvera." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewDocument,
});

function TypeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.FileText;
  return <Icon className={className ?? "size-5"} />;
}

function defaultStructure(spec: DocSpec): string[] {
  return (spec.structure ?? []).filter((s) => s.default || s.required).map((s) => s.id);
}

function asString(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
}

// Quick University Presets for Fast 1-Touch Input
const UNIVERSITY_PRESETS = [
  "Universidade Eduardo Mondlane (UEM)",
  "Universidade Pedagógica (UP)",
  "Universidade Católica de Moçambique (UCM)",
  "ISCTEM",
  "ISUTC",
  "Universidade Agostinho Neto (UAN)",
  "Universidade de Lisboa (ULisboa)",
];

function NewDocument() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { draftId, type: typeParam } = Route.useSearch();

  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const { data: draftDoc } = useQuery({ ...documentQuery(draftId || ""), enabled: Boolean(draftId) });

  const country = profile?.country;
  const credits = balance ?? 0;

  const [specId, setSpecId] = useState<string | null>(typeParam ?? null);
  const [category, setCategory] = useState<string>("all");
  const [term, setTerm] = useState("");

  // WIZARD STEPPER STATE (Passo 1 a 4)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [structure, setStructure] = useState<string[]>([]);
  const [pageTierId, setPageTierId] = useState<string | undefined>(undefined);
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [layoutId, setLayoutId] = useState<string | undefined>(undefined);
  const [cvAccent, setCvAccent] = useState<CvAccentColor>("indigo");
  const [instructions, setInstructions] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hydratedDraft, setHydratedDraft] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const spec = specId ? getSpec(specId, country) ?? null : null;

  const cvData = useMemo(() => {
    return extractCvDataFromFields(fields, (fields.full_name as string) || "Seu Nome Completo");
  }, [fields]);

  const deferredCvData = useDeferredValue(cvData);

  /** Apply spec defaults whenever a new type is chosen. */
  useEffect(() => {
    if (!spec) return;
    if (draftId && !hydratedDraft) return;
    setStructure(defaultStructure(spec));
    setPageTierId(spec.pageTiers?.[0]?.id);
    setTemplateId(spec.templates?.[0]?.id);
    setLayoutId(spec.layouts?.[0]?.id);
    setWizardStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id]);

  /** Prefill default city */
  useEffect(() => {
    if (!spec || !profile) return;
    const hasCity = spec.groups.some((g) => g.fields.some((f) => f.id === "city"));
    if (!hasCity) return;
    setFields((prev) => (prev["city"] ? prev : { ...prev, city: getCountryConfig(country).defaultCity }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id, profile]);

  /** Restore existing draft. */
  useEffect(() => {
    if (!draftDoc || hydratedDraft) return;
    const options = (draftDoc.options ?? {}) as Record<string, unknown>;
    setSpecId(draftDoc.doc_type);
    setFields((options["fields"] as Record<string, unknown>) ?? {});
    const savedStructure = options["structure"];
    if (Array.isArray(savedStructure)) setStructure(savedStructure as string[]);
    if (typeof options["pageTierId"] === "string") setPageTierId(options["pageTierId"] as string);
    if (typeof options["templateId"] === "string") setTemplateId(options["templateId"] as string);
    if (typeof options["layoutId"] === "string") setLayoutId(options["layoutId"] as string);
    if (typeof options["cvAccent"] === "string") setCvAccent(options["cvAccent"] as CvAccentColor);
    setInstructions(draftDoc.instructions ?? "");
    setHydratedDraft(true);
  }, [draftDoc, hydratedDraft]);

  const students = useMemo(() => {
    const raw = fields["students"];
    return Array.isArray(raw) ? (raw as unknown[]).map((s) => String(s)).filter(Boolean) : [];
  }, [fields]);

  const values: DocumentDraftValues = useMemo(
    () => ({
      fields,
      structure,
      ...(pageTierId ? { pageTierId } : {}),
      ...(spec?.students ? { studentsCount: Math.max(1, students.length) } : {}),
      ...(templateId ? { templateId } : {}),
      ...(layoutId ? { layoutId } : {}),
      ...(cvAccent ? { cvAccent } : {}),
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
    }),
    [fields, structure, pageTierId, templateId, layoutId, cvAccent, instructions, students.length, spec?.students]
  );

  const cost = useMemo(() => (spec ? computeCost(spec, values) : null), [spec, values]);
  const check = useMemo(() => checkBalance(credits, cost?.totalCredits ?? 0), [credits, cost]);

  const title = useMemo(() => {
    if (!spec) return "";
    const raw = spec.titleFieldId ? asString(fields[spec.titleFieldId]).trim() : "";
    return (raw || spec.label).slice(0, 160);
  }, [spec, fields]);

  const missingRequired = useMemo(() => {
    if (!spec) return [];
    const missing: string[] = [];
    for (const group of spec.groups) {
      for (const field of group.fields) {
        if (!field.required) continue;
        const value = fields[field.id];
        const empty = field.type === "students" ? students.length === 0 : !asString(value).trim();
        if (empty) missing.push(field.label);
      }
    }
    return missing;
  }, [spec, fields, students.length]);

  const availablePresets = useMemo(() => {
    if (!spec) return [];
    return CATEGORY_PRESETS.filter((p) => p.category === spec.category);
  }, [spec]);

  const applyPreset = (preset: CategoryPreset) => {
    if (!spec) return;
    const { defaults } = preset;
    if (defaults.pageTierId) setPageTierId(defaults.pageTierId);
    if (defaults.templateId) setTemplateId(defaults.templateId);
    if (defaults.structure) setStructure(defaults.structure);
    if (defaults.instructions) {
      setInstructions((prev) => (prev ? `${prev}\n${defaults.instructions}` : defaults.instructions!));
    }
    if (defaults.sampleTheme) {
      const titleId = spec.titleFieldId || "theme";
      setField(titleId, defaults.sampleTheme);
    }
    if (defaults.citation_style) {
      setField("citation_style", defaults.citation_style);
    }
    toast.success(`Preset "${preset.label}" aplicado com sucesso!`);
  };

  const buildPayload = () => ({
    title,
    doc_type: spec!.id,
    instructions: instructions.trim() || null,
    estimated_cost: cost?.totalCredits ?? 0,
    options: {
      fields,
      structure,
      ...(pageTierId ? { pageTierId } : {}),
      ...(spec?.students ? { studentsCount: Math.max(1, students.length) } : {}),
      ...(templateId ? { templateId } : {}),
      ...(layoutId ? { layoutId } : {}),
      ...(cvAccent ? { cvAccent } : {}),
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
    },
    metadata: {
      pageTierId: pageTierId ?? null,
      studentsCount: students.length || 1,
      costLines: cost?.lines ?? [],
      templateId: templateId ?? null,
      accentColor: cvAccent,
      cvData: spec?.id === "cv" ? cvData : null,
    },
  });

  /** Debounced draft autosave */
  useEffect(() => {
    if (!spec || !userId) return;
    if (draftId && !hydratedDraft) return;
    setSaving("saving");
    const timer = setTimeout(async () => {
      try {
        if (draftId) {
          const { error } = await supabase.from("documents").update(buildPayload() as never).eq("id", draftId);
          if (error) throw error;
          queryClient.invalidateQueries({ queryKey: ["document", draftId] });
        } else {
          const { data, error } = await supabase
            .from("documents")
            .insert({ user_id: userId, status: "draft", ...buildPayload() } as never)
            .select("id")
            .single();
          if (error) throw error;
          if (data) {
            setHydratedDraft(true);
            navigate({ to: "/documents/new", search: { draftId: data.id }, replace: true });
          }
        }
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        setSaving("saved");
      } catch {
        setSaving("error");
      }
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id, fields, structure, pageTierId, templateId, layoutId, cvAccent, instructions, draftId, hydratedDraft, userId]);

  const generate = useMutation({
    mutationFn: async () => {
      if (!spec) throw new Error("Escolhe primeiro o tipo de documento.");
      if (missingRequired.length > 0) {
        throw new Error(`Preenche os campos obrigatórios: ${missingRequired.join(", ")}.`);
      }
      if (!check.affordable) throw new Error("Créditos insuficientes para gerar este documento.");

      let documentId = draftId;
      if (documentId) {
        const { error } = await supabase.from("documents").update(buildPayload() as never).eq("id", documentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert({ user_id: userId, status: "draft", ...buildPayload() } as never)
          .select("id")
          .single();
        if (error) throw error;
        documentId = data!.id;
      }

      const { generateDocumentContent } = await import("@/lib/documents.functions");
      await generateDocumentContent({ data: { documentId: documentId! } });
      return { id: documentId! };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast.success("Documento gerado com sucesso.");
      navigate({ to: "/documents/$id", params: { id } });
    },
    onError: (error: Error) => {
      toast.error("Não foi possível gerar o documento", { description: error.message });
    },
  });

  const filtered = useMemo(() => {
    const list = term.trim()
      ? searchSpecs(term, category === "all" ? "all" : (category as never))
      : category === "all"
        ? DOC_SPECS
        : DOC_SPECS.filter((s) => s.category === category);
    const seen = new Set<string>();
    return list.filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)));
  }, [term, category]);

  const setField = (id: string, value: unknown) => setFields((prev) => ({ ...prev, [id]: value }));

  const addStudent = () => {
    const name = studentInput.trim();
    if (!name) return;
    const max = spec?.students?.max ?? 7;
    if (students.length >= max) {
      toast.error(`Máximo de ${max} pessoas.`);
      return;
    }
    setField("students", [...students, name]);
    setStudentInput("");
  };

  const toggleStructure = (id: string) => {
    setStructure((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  // Group fields by Step for Wizard Flow
  const step1Fields = useMemo(() => {
    if (!spec) return [];
    const primaryId = spec.titleFieldId || "theme";
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.id === primaryId || f.id === "subject");
  }, [spec]);

  const step2Fields = useMemo(() => {
    if (!spec) return [];
    const primaryId = spec.titleFieldId || "theme";
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.id !== primaryId && f.id !== "subject" && f.type !== "select");
  }, [spec]);

  const step3Fields = useMemo(() => {
    if (!spec) return [];
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.type === "select");
  }, [spec]);

  const renderField = (field: FieldDef) => {
    const value = fields[field.id];
    const wide = field.type === "textarea" || field.type === "list" || field.type === "students" || field.type === "photo";
    const isSalutationTarget = spec && (spec.category === "administrativo" || spec.category === "comunicacao" || field.id === "teacher");

    return (
      <div key={field.id} className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
        <Label htmlFor={field.id} className="text-xs font-semibold text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        {field.type === "photo" ? (
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {value ? (
                <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-primary shadow-sm shrink-0 bg-muted">
                  <img src={String(value)} alt="Fotografia de Perfil" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setField(field.id, "")}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                    title="Remover foto"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                <div className="size-20 rounded-2xl bg-muted/60 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground shrink-0">
                  <Icons.User className="size-8 opacity-50" />
                  <span className="text-[10px] text-muted-foreground/80 mt-1">Sem foto</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold shadow-xs hover:bg-muted transition-colors gap-2">
                  <Icons.Camera className="size-4 text-primary" />
                  <span>{value ? "Substituir fotografia" : "Carregar fotografia de perfil"}</span>
                  <input
                    id={field.id}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 4 * 1024 * 1024) {
                        toast.error("A fotografia deve ter no máximo 4MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        setField(field.id, base64);
                        toast.success("Fotografia carregada com sucesso!");
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {value ? (
                  <button
                    type="button"
                    onClick={() => setField(field.id, "")}
                    className="block text-[11px] text-destructive hover:underline"
                  >
                    Remover fotografia
                  </button>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Formatos JPG, PNG ou WEBP.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : field.type === "students" ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={studentInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStudent();
                  }
                }}
                placeholder="Nome completo do autor"
                className="h-10 rounded-xl text-xs"
              />
              <Button type="button" variant="secondary" className="h-10 rounded-xl px-4 text-xs font-semibold" onClick={addStudent}>
                Adicionar
              </Button>
            </div>
            {students.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {students.map((name, index) => (
                  <Badge key={`${name}-${index}`} variant="secondary" className="gap-1.5 rounded-lg py-1.5 pl-3 pr-1.5 text-xs font-medium">
                    {name}
                    <button
                      type="button"
                      aria-label={`Remover ${name}`}
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20"
                      onClick={() => setField("students", students.filter((_, i) => i !== index))}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {spec?.students && (
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Users className="size-3.5 text-primary" />
                {spec.students.includedFree} incluídos · cada pessoa extra custa {spec.students.extraPerStudent} cr.
              </p>
            )}
          </div>
        ) : field.type === "textarea" || field.type === "list" ? (
          <Textarea
            id={field.id}
            value={asString(value)}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setField(field.id, field.type === "list" ? e.target.value.split("\n") : e.target.value)
            }
            placeholder={field.placeholder ?? (field.type === "list" ? "Um item por linha" : undefined)}
            className="min-h-24 rounded-xl text-xs"
          />
        ) : field.type === "select" ? (
          <div className="space-y-2">
            {/* Clickable Pills instead of plain select for modern feel */}
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const selected = asString(value) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField(field.id, option.value)}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border cursor-pointer",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                        : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Input
              id={field.id}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              min={field.min}
              max={field.max}
              value={asString(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="h-10 rounded-xl text-xs"
            />
            {/* Quick Presets for Institution Field */}
            {field.id === "institution" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground self-center mr-1">Universidades:</span>
                {UNIVERSITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setField("institution", preset)}
                    className="rounded-lg bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {preset.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}

            {/* Formal Salutation Protocol Pills for Recipient / Administrative Fields */}
            {isSalutationTarget && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-primary/80 self-center mr-1 flex items-center gap-1">
                  <Zap className="size-2.5" /> Fórmulas Oficiais:
                </span>
                {FORMAL_SALUTATIONS.map((salutation) => (
                  <button
                    key={salutation.label}
                    type="button"
                    onClick={() => setField(field.id, salutation.value)}
                    className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    {salutation.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title={spec ? `Estúdio: ${spec.label}` : "Estúdio de Engenharia Documental"}
        subtitle={
          spec
            ? "Configura a estrutura, o tom e os conteúdos em 4 passos simples."
            : "Escolhe o tipo de documento para abrir o estúdio de edição."
        }
        action={
          <Badge variant="secondary" className="h-9 gap-2 rounded-full px-4 text-xs font-semibold">
            <Coins className="size-4 text-primary" />
            {credits} cr · {formatCurrency(creditsToCurrency(credits, country), country)}
          </Badge>
        }
      />

      {/* DOCUMENT TYPE PICKER (WHEN NO SPEC SELECTED) */}
      {!spec && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)}
              placeholder="Pesquisar: CV, requerimento, monografia, relatório..."
              className="h-11 rounded-xl pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-muted/60 p-1">
            {[{ id: "all", label: "Todos" }, ...DOC_CATEGORIES].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  category === cat.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const base = computeCost(item, { fields: {}, structure: defaultStructure(item) });
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSpecId(item.id);
                    setFields({});
                    setInstructions("");
                  }}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TypeIcon name={item.icon} />
                  </span>
                  <h3 className="mt-4 font-bold font-display text-foreground">{item.label}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="font-medium text-muted-foreground">
                      desde {base.totalCredits} cr · {formatCurrency(creditsToCurrency(base.totalCredits, country), country)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      Abrir Estúdio <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
              Nenhum tipo encontrado para “{term}”.
            </p>
          )}
        </div>
      )}

      {/* UNIFIED DOCUMENT WIZARD STUDIO (WHEN SPEC IS SELECTED) */}
      {spec && (
        <div className="space-y-6">
          {/* Top Bar for Studio: Navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-3 text-xs font-semibold"
              onClick={() => {
                setSpecId(null);
                setFields({});
              }}
            >
              <ArrowLeft className="mr-2 size-4" /> Mudar tipo de documento
            </Button>

            {/* Mobile A4 Preview Drawer Trigger */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileSheetOpen(true)}
              className="lg:hidden rounded-xl text-xs font-semibold gap-1.5 h-9"
            >
              <Eye className="size-3.5 text-primary" />
              Ver Folha A4
            </Button>
          </div>

          {/* STEP INDICATOR HEADER (PASSO 1 A 4) */}
          <div className="rounded-2xl border border-border/70 bg-card p-2 sm:p-3 shadow-xs">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
              {[
                { step: 1, label: "1. Conceito", icon: Wand2 },
                { step: 2, label: "2. Contexto", icon: FileText },
                { step: 3, label: "3. Estrutura", icon: Layers },
                { step: 4, label: "4. Geração", icon: Sparkles },
              ].map((item) => {
                const isActive = wizardStep === item.step;
                const isDone = wizardStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setWizardStep(item.step as 1 | 2 | 3 | 4)}
                    className={cn(
                      "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl py-2 px-1 text-xs font-bold transition-all cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                        : isDone
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN WIZARD SPLIT-SCREEN LAYOUT */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* LEFT PANEL (7/12): WIZARD STEP CONTENT */}
            <div className="space-y-6 lg:col-span-7">
              {/* PASSO 1: A IDEIA & O CONCEITO */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Super Banner IA */}
                  <MagicFill
                    spec={spec}
                    onApplyFields={(extracted, suggestedInst) => {
                      setFields((prev) => ({ ...prev, ...extracted }));
                      if (suggestedInst) {
                        setInstructions((prev) => (prev ? `${prev}\n${suggestedInst}` : suggestedInst));
                      }
                      setWizardStep(2);
                    }}
                  />

                  {/* FASE 1: PRESETS RÁPIDOS DE 1-CLIQUE */}
                  {availablePresets.length > 0 && (
                    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-soft space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="size-4 text-primary" />
                          <h3 className="text-xs font-bold font-display text-foreground">
                            Presets Rápidos de 1-Clique
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                          Atalhos IA
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {availablePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="group rounded-2xl border border-border/80 bg-background/80 p-3.5 text-left transition-all hover:border-primary hover:bg-primary/5 shadow-xs cursor-pointer"
                          >
                            <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                              {preset.label}
                            </span>
                            <span className="mt-1 block text-[11px] text-muted-foreground leading-relaxed">
                              {preset.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                    <div className="border-b border-border/50 pb-3">
                      <h2 className="text-base font-bold font-display text-foreground">Tema & Ideia Central</h2>
                      <p className="text-xs text-muted-foreground">Define o assunto principal do documento.</p>
                    </div>

                    <div className="space-y-4">
                      {step1Fields.length > 0
                        ? step1Fields.map(renderField)
                        : spec.groups[0]?.fields.slice(0, 2).map(renderField)}
                    </div>
                  </section>
                </div>
              )}

              {/* PASSO 2: CONTEXTO & IDENTIFICAÇÃO */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {spec.id === "cv" && (
                    <CvTemplateSelector
                      selectedTemplate={templateId || "modern"}
                      onSelectTemplate={(t) => setTemplateId(t)}
                      selectedAccent={cvAccent}
                      onSelectAccent={(c) => setCvAccent(c)}
                    />
                  )}

                  <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                    <div className="border-b border-border/50 pb-3">
                      <h2 className="text-base font-bold font-display text-foreground">Identificação & Contexto</h2>
                      <p className="text-xs text-muted-foreground">Instituição, docentes e dados de apresentação.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {step2Fields.length > 0
                        ? step2Fields.map(renderField)
                        : spec.groups.flatMap((g) => g.fields).map(renderField)}
                    </div>
                  </section>
                </div>
              )}

              {/* PASSO 3: ESTRUTURA & NORMAS */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Page Extension Tiers */}
                  {spec.pageTiers && spec.pageTiers.length > 0 && (
                    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                      <div>
                        <h2 className="text-base font-bold font-display text-foreground">Extensão do Documento</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">Escolha o tamanho aproximado em páginas.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {spec.pageTiers.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setPageTierId(tier.id)}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-all cursor-pointer",
                              pageTierId === tier.id ? "border-primary bg-primary/5 shadow-xs font-bold" : "border-border/70 hover:border-border"
                            )}
                          >
                            <span className="block text-xs text-foreground">{tier.label}</span>
                            <span className="text-[11px] font-semibold text-primary">
                              {tier.credits} cr · {formatCurrency(creditsToCurrency(tier.credits, country), country)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Citation Norms */}
                  {step3Fields.length > 0 && (
                    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                      <div className="border-b border-border/50 pb-3">
                        <h2 className="text-base font-bold font-display text-foreground">Normas & Estilos</h2>
                      </div>
                      <div className="space-y-4">{step3Fields.map(renderField)}</div>
                    </section>
                  )}

                  {/* Document Structure Checklist */}
                  {spec.structure && spec.structure.length > 0 && (
                    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                      <div>
                        <h2 className="text-base font-bold font-display text-foreground">Secções do Documento</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Ativa ou desativa elementos para personalizar a estrutura.
                        </p>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {spec.structure.map((option) => {
                          const checked = structure.includes(option.id) || Boolean(option.required);
                          return (
                            <label
                              key={option.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors",
                                checked ? "border-primary/60 bg-primary/5" : "border-border/70 hover:border-border",
                                option.required && "cursor-default opacity-90"
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                disabled={Boolean(option.required)}
                                onCheckedChange={() => !option.required && toggleStructure(option.id)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                                  {option.label}
                                  {option.required && <Badge variant="secondary" className="text-[9px]">obrigatório</Badge>}
                                  {option.extraCredits ? (
                                    <Badge variant="outline" className="text-[9px]">+{option.extraCredits} cr</Badge>
                                  ) : null}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* PASSO 4: SÍNTESE & GERAÇÃO */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-4">
                    <div>
                      <Label htmlFor="instructions" className="text-base font-bold font-display text-foreground">
                        Instruções Especiais para a IA
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Explicite regras formais, tom de voz ou exigências do docente.
                      </p>
                    </div>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                      placeholder={spec.instructionsPlaceholder}
                      className="min-h-32 rounded-xl text-xs"
                    />
                  </section>

                  {/* Summary Block */}
                  <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Resumo da Configuração
                    </h3>
                    <div className="text-xs space-y-1.5">
                      <p><span className="font-semibold text-muted-foreground">Documento:</span> {spec.label}</p>
                      <p><span className="font-semibold text-muted-foreground">Título:</span> {title}</p>
                      {pageTierId && (
                        <p><span className="font-semibold text-muted-foreground">Extension:</span> {spec.pageTiers?.find((t) => t.id === pageTierId)?.label}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL (5/12): STICKY LIVE A4 PREVIEW & PRICING (DESKTOP) */}
            <div className="hidden lg:block space-y-6 lg:col-span-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
              {/* Dynamic Live Preview Panel */}
              {spec.id === "cv" ? (
                <CvLivePreview
                  data={deferredCvData}
                  template={templateId || "modern"}
                  onSelectTemplate={(t) => setTemplateId(t)}
                  accentColor={cvAccent}
                  onSelectAccent={(c) => setCvAccent(c)}
                  country={country}
                />
              ) : (
                <DocumentSkeletonPreview
                  spec={spec}
                  fields={fields}
                  structure={structure}
                  pageTierId={pageTierId}
                  templateId={templateId}
                  instructions={instructions}
                  title={title}
                />
              )}
            </div>
          </div>

          {/* STICKY GLASSMORPHISM BOTTOM ACTION BAR (FIXA NO FUNDO EM DESKTOP E MOBILE) */}
          <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl px-4 py-3 shadow-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              {/* Left: Step Info */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary text-[11px] font-bold px-2.5 py-1 bg-primary/5">
                  Passo {wizardStep} de 4
                </Badge>
                <div className="hidden sm:block text-xs font-semibold text-foreground font-display">
                  {cost?.totalCredits ?? 0} créditos ({formatCurrency(creditsToCurrency(cost?.totalCredits ?? 0, country), country)})
                </div>
              </div>

              {/* Right: Action Buttons with Gold-Standard Proportions */}
              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                    className="h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                    Voltar
                  </Button>
                )}

                {wizardStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setWizardStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                    className="h-10 px-5 rounded-xl font-bold text-xs shadow-glow gap-1.5 cursor-pointer"
                  >
                    Continuar
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={generate.isPending || missingRequired.length > 0 || !check.affordable}
                    onClick={() => generate.mutate()}
                    className="h-11 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-glow gap-2 cursor-pointer"
                  >
                    {generate.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    ✦ Compilar e Gerar Documento
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Sheet Modal Integration */}
          <MobilePreviewSheet
            open={mobileSheetOpen}
            onOpenChange={setMobileSheetOpen}
            spec={spec}
            fields={fields}
            structure={structure}
            pageTierId={pageTierId}
            templateId={templateId}
            cvAccent={cvAccent}
            instructions={instructions}
            title={title}
            country={country}
          />
        </div>
      )}
    </div>
  );
}
