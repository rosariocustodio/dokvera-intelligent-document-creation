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
import { SimpleDocumentForm } from "@/components/studio/SimpleDocumentForm";
import { CATEGORY_PRESETS, FORMAL_SALUTATIONS, type CategoryPreset } from "@/lib/category-presets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/documents/new")({
  validateSearch: (search) =>
    z
      .object({
        draftId: z.string().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
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
  const { draftId, type: typeParam, category: categoryParam } = Route.useSearch();

  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const { data: draftDoc } = useQuery({ ...documentQuery(draftId || ""), enabled: Boolean(draftId) });

  const country = profile?.country;
  const credits = balance ?? 0;

  const [specId, setSpecId] = useState<string | null>(typeParam ?? null);
  const [category, setCategory] = useState<string>(categoryParam ?? "all");
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
  const isProSpec = spec?.category === "profissional";
  const isCvSpec = spec?.id === "cv" || spec?.id === "simple_cv";
  const isProNonCvSpec = isProSpec && !isCvSpec;
  const totalSteps = isProNonCvSpec ? 3 : 4;

  const step1Fields = useMemo(() => {
    if (!spec) return [];
    if (isProSpec) {
      if (isCvSpec) {
        const contactIds = ["full_name", "headline", "photo_url", "email", "phone", "address", "linkedin"];
        return spec.groups.flatMap((g) => g.fields).filter((f) => contactIds.includes(f.id));
      }
      if (spec.id === "cover_letter") {
        const contactIds = ["full_name", "position", "company", "recipient"];
        return spec.groups.flatMap((g) => g.fields).filter((f) => contactIds.includes(f.id));
      }
      if (spec.id === "reference_letter") {
        const contactIds = ["referee_name", "referee_title", "referee_organization", "relationship", "candidate_name", "target_role", "target_company"];
        return spec.groups.flatMap((g) => g.fields).filter((f) => contactIds.includes(f.id));
      }
      if (spec.id === "linkedin_profile") {
        const contactIds = ["full_name", "headline", "location"];
        return spec.groups.flatMap((g) => g.fields).filter((f) => contactIds.includes(f.id));
      }
    }
    const primaryId = spec.titleFieldId || "theme";
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.id === primaryId || f.id === "subject");
  }, [spec, isProSpec]);

  const step2Fields = useMemo(() => {
    if (!spec || isProSpec) return [];
    const primaryId = spec.titleFieldId || "theme";
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.id !== primaryId && f.id !== "subject" && f.type !== "select");
  }, [spec, isProSpec]);

  const step3Fields = useMemo(() => {
    if (!spec) return [];
    if (isProSpec) {
      const step1Ids = step1Fields.map((f) => f.id);
      const contentFields = spec.groups.flatMap((g) => g.fields).filter((f) => !step1Ids.includes(f.id));
      return contentFields.filter((f) => {
        if (f.id === "profile") return structure.includes("profile");
        if (f.id === "experience") return structure.includes("experience");
        if (f.id === "education") return structure.includes("education");
        if (f.id === "skills") return structure.includes("skills");
        if (f.id === "languages") return structure.includes("languages");
        if (f.id === "certifications") return structure.includes("certifications");
        if (f.id === "references_list") return structure.includes("references");
        if (f.id === "about") return structure.includes("about");
        return true;
      });
    }
    return spec.groups.flatMap((g) => g.fields).filter((f) => f.type === "select");
  }, [spec, isProSpec, step1Fields, structure]);

  const renderField = (field: FieldDef) => {
    const value = fields[field.id];
    const wide = field.type === "textarea" || field.type === "list" || field.type === "students" || field.type === "photo";
    const isSalutationTarget = spec && (spec.category === "administrativo" || spec.category === "comunicacao" || field.id === "teacher");

    return (
      <div key={field.id} className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
        <Label htmlFor={field.id} className="text-xs font-semibold text-foreground tracking-tight">
          {field.label}
          {field.required && <span className="ml-1 text-destructive font-bold">*</span>}
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
                <p className="text-[11px] text-muted-foreground">
                  Formatos JPG, PNG ou WEBP (máx. 4MB).
                </p>
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
              <Button type="button" variant="secondary" className="h-10 rounded-xl px-4 text-xs font-semibold cursor-pointer" onClick={addStudent}>
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
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 cursor-pointer"
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
            placeholder={
              field.placeholder ??
              (field.id === "experience"
                ? "Cargo — Empresa — Período (ex.: Analista de Finanças — Banco X — 2021–2024)"
                : field.id === "education"
                ? "Curso — Instituição — Ano (ex.: Licenciatura em Gestão — UEM — 2020)"
                : field.id === "skills"
                ? "Escreva cada competência numa linha (ex.: Gestão de Projetos, Power BI)"
                : field.id === "languages"
                ? "Português — Nativo\nInglês — Fluente"
                : field.id === "certifications"
                ? "Nome da Certificação — Entidade — Ano"
                : field.id === "about"
                ? "Apresente uma síntese executiva em 1.ª pessoa sobre a sua carreira e objetivos..."
                : field.id === "purpose"
                ? "Descreva aqui os motivos da candidatura, competências relevantes e mais-valias..."
                : field.id === "closing_statement"
                ? "Descreva os pontos fortes do candidato, conquistas e recomendação formal..."
                : undefined)
            }
            className="min-h-24 rounded-xl text-xs leading-relaxed"
          />
        ) : field.type === "select" ? (
          <div className="space-y-2">
            {/* Clickable Pills (32px Micro-Chips) */}
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const selected = asString(value) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField(field.id, option.value)}
                    className={cn(
                      "h-8 rounded-xl px-3.5 text-xs font-semibold transition-all border cursor-pointer",
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
                    className="h-7 rounded-lg bg-muted/60 px-2 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
                    className="h-7 rounded-lg border border-primary/20 bg-primary/5 px-2 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
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
    <div className="space-y-6 pb-28">
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
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
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
                  className="group flex flex-col rounded-3xl border border-border/70 bg-card/80 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <TypeIcon name={item.icon} />
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold py-0.5 px-2 rounded-lg border border-border bg-muted/40 text-muted-foreground"
                    >
                      {item.complexity === "simple" ? "Simples" : item.complexity === "advanced" ? "Avançado" : "Padrão"}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-bold font-display text-foreground text-sm group-hover:text-primary transition-colors">{item.label}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground/90">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                    <span className="font-medium text-muted-foreground">
                      desde {base.totalCredits} cr · {formatCurrency(creditsToCurrency(base.totalCredits, country), country)}
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                      Selecionar <ArrowRight className="size-3.5" />
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

      {/* SIMPLE SINGLE-PAGE FORM LAYOUT FOR COMPLEXITY === 'SIMPLE' */}
      {spec && spec.complexity === "simple" ? (
        <SimpleDocumentForm
          spec={spec}
          fields={fields}
          setField={setField}
          setFields={setFields}
          structure={structure}
          toggleStructure={toggleStructure}
          instructions={instructions}
          setInstructions={setInstructions}
          cost={cost}
          credits={credits}
          check={check}
          missingRequired={missingRequired}
          saving={saving}
          isGenerating={generate.isPending}
          onGenerate={() => generate.mutate()}
          onApplyMagicFields={(extracted, inst) => {
            setFields((prev) => ({ ...prev, ...extracted }));
            if (inst) setInstructions(inst);
          }}
          availablePresets={availablePresets}
          onApplyPreset={applyPreset}
          onSelectAnotherSpec={() => {
            setSpecId(null);
            setFields({});
          }}
          country={country}
        />
      ) : spec ? (
        <div className="space-y-6">
          {/* Top Bar for Studio: Navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-3 text-xs font-semibold cursor-pointer"
              onClick={() => {
                setSpecId(null);
                setFields({});
              }}
            >
              <ArrowLeft className="mr-2 size-4" /> Mudar tipo de documento
            </Button>

          </div>

          {/* STEP INDICATOR HEADER */}
          <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl p-2 sm:p-3 shadow-xs">
            <div className={cn("grid gap-1 sm:gap-2 text-center", totalSteps === 3 ? "grid-cols-3" : "grid-cols-4")}>
              {(isProNonCvSpec
                ? [
                    { step: 1, label: "1. Dados Iniciais", icon: Icons.User },
                    { step: 2, label: "2. Conteúdo Principal", icon: FileText },
                    { step: 3, label: "3. Emissão & Cópia", icon: Sparkles },
                  ]
                : isProSpec
                ? [
                    { step: 1, label: "1. Identificação", icon: Icons.User },
                    { step: 2, label: "2. Estrutura & Design", icon: Icons.LayoutTemplate },
                    { step: 3, label: "3. Percurso", icon: FileText },
                    { step: 4, label: "4. Emissão", icon: Sparkles },
                  ]
                : [
                    { step: 1, label: "1. Conceito", icon: Wand2 },
                    { step: 2, label: "2. Contexto", icon: FileText },
                    { step: 3, label: "3. Estrutura", icon: Layers },
                    { step: 4, label: "4. Geração", icon: Sparkles },
                  ]
              ).map((item) => {
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
              {/* PASSO 1: IDENTIFICAÇÃO & CONTACTOS */}
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

                  {/* PRESETS RÁPIDOS DE 1-CLIQUE */}
                  {availablePresets.length > 0 && (
                    <section className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Zap className="size-3.5 text-primary" />
                          Presets Rápidos
                        </h3>
                        <span className="text-[11px] text-muted-foreground font-mono">Atalhos</span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {availablePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="group rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/50 cursor-pointer"
                          >
                            <span className="block text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                              {preset.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground line-clamp-2">
                              {preset.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                    <div className="border-b border-border/50 pb-3">
                      <h2 className="text-base font-bold font-display text-foreground">
                        {isProSpec ? "Identificação & Contactos Pessoais" : "Tema & Ideia Central"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isProSpec
                          ? "Preencha o seu nome, cargo pretendido, fotografia e dados de contacto."
                          : "Define o assunto principal do documento."}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {step1Fields.length > 0
                        ? step1Fields.map(renderField)
                        : spec.groups[0]?.fields.slice(0, 2).map(renderField)}
                    </div>
                  </section>
                </div>
              )}

              {/* PASSO 2: ESTRUTURA & DESIGN / CONTEÚDO PRINCIPAL */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {isProNonCvSpec ? (
                    <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-6">
                      <div className="border-b border-border/50 pb-3">
                        <h2 className="text-base font-bold font-display text-foreground">
                          {spec.id === "linkedin_profile"
                            ? "Conteúdo do Perfil LinkedIn"
                            : spec.id === "cover_letter"
                            ? "Conteúdo da Carta de Apresentação"
                            : spec.id === "reference_letter"
                            ? "Conteúdo da Carta de Recomendação"
                            : "Conteúdo Principal"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Preencha as informações principais para a compilação do seu documento.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {step3Fields.map(renderField)}
                      </div>

                      {/* Tom de Voz Executivo */}
                      <div className="border-t border-border/50 pt-5 space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-display">
                          <Sparkles className="size-4 text-primary" />
                          Tom de Voz & Estilo Executivo
                        </h3>
                        <div className="grid gap-2.5 sm:grid-cols-3">
                          {[
                            { id: "executive", label: "Liderança Executiva", desc: "Tom maduro, focado em impacto, KPIs e liderança estratégica." },
                            { id: "technical", label: "Especialista Técnico", desc: "Foco em competências técnicas, metodologias e resultados." },
                            { id: "persuasive", label: "Persuasivo & Confiante", desc: "Discurso envolvente, ideal para candidaturas de elevado impacto." },
                          ].map((tone) => {
                            const isSelected = (fields["tone"] || "executive") === tone.id;
                            return (
                              <button
                                key={tone.id}
                                type="button"
                                onClick={() => setField("tone", tone.id)}
                                className={cn(
                                  "rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-xs font-bold ring-1 ring-primary/30"
                                    : "border-border/70 hover:border-border bg-card"
                                )}
                              >
                                <span className="block text-xs font-bold text-foreground">{tone.label}</span>
                                <span className="mt-0.5 block text-[10px] text-muted-foreground leading-relaxed">
                                  {tone.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  ) : isProSpec ? (
                    <>
                      {/* Mobile 35/65 Split View Mini-Canvas Widget */}
                      <div className="lg:hidden rounded-2xl border border-border/70 bg-card p-3 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-3 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold">Preview Mini-Canvas</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMobileSheetOpen(true)}
                          className="h-7 text-[11px] font-semibold text-primary"
                        >
                          Ver PDF Completo
                        </Button>
                      </div>

                      {/* Section 1: Structure Checklist (Secções do Documento) */}
                      {spec.structure && spec.structure.length > 0 && (
                        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                          <div className="border-b border-border/50 pb-3">
                            <h2 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                              <Layers className="size-4.5 text-primary" />
                              Secções a Incluir no Documento
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Escolha as secções que deseja preencher. O formulário no Passo 3 irá adaptar-se às suas escolhas.
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
                                    checked ? "border-primary/60 bg-primary/5 shadow-2xs" : "border-border/70 hover:border-border",
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

                      {/* Section 2: CvTemplateSelector (Visual A4 modelos apenas para CV e CV Simples) */}
                      {(spec.id === "cv" || spec.id === "simple_cv") ? (
                        <CvTemplateSelector
                          selectedTemplate={templateId || "modern"}
                          onSelectTemplate={(t) => setTemplateId(t)}
                          selectedAccent={cvAccent}
                          onSelectAccent={(c) => setCvAccent(c)}
                        />
                      ) : (
                        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                          <div className="border-b border-border/50 pb-3">
                            <h2 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                              <Sparkles className="size-4.5 text-primary" />
                              Tom de Voz & Estilo Executivo
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Selecione o posicionamento estratégico para a escrita da inteligência artificial.
                            </p>
                          </div>
                          <div className="grid gap-2.5 sm:grid-cols-3">
                            {[
                              { id: "executive", label: "Liderança Executiva", desc: "Tom maduro, focado em impacto, KPIs e liderança estratégica." },
                              { id: "technical", label: "Especialista Técnico", desc: "Foco em competências técnicas, metodologias e resultados." },
                              { id: "persuasive", label: "Persuasivo & Confiante", desc: "Discurso envolvente, ideal para candidaturas de elevado impacto." },
                            ].map((tone) => {
                              const isSelected = (fields["tone"] || "executive") === tone.id;
                              return (
                                <button
                                  key={tone.id}
                                  type="button"
                                  onClick={() => setField("tone", tone.id)}
                                  className={cn(
                                    "rounded-2xl border p-4 text-left transition-all cursor-pointer",
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-xs font-bold ring-1 ring-primary/30"
                                      : "border-border/70 hover:border-border bg-card"
                                  )}
                                >
                                  <span className="block text-xs font-bold text-foreground">{tone.label}</span>
                                  <span className="mt-1 block text-[11px] text-muted-foreground leading-relaxed">
                                    {tone.desc}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      )}
                    </>
                  ) : (
                    <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
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
                  )}
                </div>
              )}

              {/* PASSO 3: PERCURSO / EMISSÃO FINAL (SE PRO NON-CV) */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  {isProNonCvSpec ? (
                    <>
                      {/* Executive Instructions Block */}
                      <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                        <div>
                          <Label htmlFor="instructions" className="text-base font-bold font-display text-foreground">
                            Instruções Especiais para a IA
                          </Label>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Explicite regras formais, tom de voz ou diretrizes específicas para o documento.
                          </p>
                        </div>
                        <Textarea
                          id="instructions"
                          value={instructions}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                          placeholder={spec.instructionsPlaceholder}
                          className="min-h-24 rounded-xl text-xs"
                        />
                      </section>

                      {/* Document Specific 1-Click Export Suite */}
                      {spec.id === "linkedin_profile" && (
                        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-7 shadow-soft space-y-4">
                          <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Icons.Linkedin className="size-4 text-primary" />
                                Central de Cópia em 1-Clique para LinkedIn
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Copie dados formatados para colar diretamente nas secções do seu perfil LinkedIn.
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const headline = asString(fields.headline);
                                if (!headline) return toast.error("Preencha a Headline no Passo 1.");
                                navigator.clipboard.writeText(headline);
                                toast.success("Headline copiada!");
                              }}
                              className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                            >
                              <Icons.Copy className="size-3.5 text-primary" />
                              Copiar Headline
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const about = asString(fields.about);
                                if (!about) return toast.error("Preencha a secção Sobre no Passo 2.");
                                navigator.clipboard.writeText(about);
                                toast.success("Resumo (About) copiado!");
                              }}
                              className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                            >
                              <Icons.Copy className="size-3.5 text-primary" />
                              Copiar Resumo (Sobre)
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const exp = asString(fields.experience);
                                if (!exp) return toast.error("Preencha a Experiência no Passo 2.");
                                navigator.clipboard.writeText(exp);
                                toast.success("Experiência copiada!");
                              }}
                              className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                            >
                              <Icons.Copy className="size-3.5 text-primary" />
                              Copiar Experiência
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const all = `HEADLINE:\n${asString(fields.headline)}\n\nSOBRE:\n${asString(fields.about)}\n\nEXPERIÊNCIA:\n${asString(fields.experience)}\n\nSKILLS:\n${asString(fields.skills)}`;
                                navigator.clipboard.writeText(all);
                                toast.success("Perfil completo copiado!");
                              }}
                              className="h-10 rounded-xl justify-start px-3.5 text-xs font-bold gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                            >
                              <Icons.Sparkles className="size-3.5" />
                              Copiar Perfil Completo
                            </Button>
                          </div>
                        </section>
                      )}

                      {(spec.id === "cover_letter" || spec.id === "reference_letter") && (
                        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-7 shadow-soft space-y-4">
                          <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                            <div>
                              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Icons.Mail className="size-4 text-primary" />
                                Emissão da Carta & Envio Rápido
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Exporte em PDF timbrado ou copie o texto para enviar no corpo do seu e-mail.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const text = asString(fields.purpose || fields.closing_statement);
                                if (!text) return toast.error("Preencha o conteúdo da carta no Passo 2.");
                                navigator.clipboard.writeText(text);
                                toast.success("Texto da carta copiado para envio por e-mail!");
                              }}
                              className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                            >
                              <Icons.Copy className="size-3.5 text-primary" />
                              Copiar Texto para E-mail
                            </Button>
                          </div>
                        </section>
                      )}

                      {/* Summary Block */}
                      <div className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                          Resumo da Configuração
                        </h3>
                        <div className="text-xs space-y-1.5">
                          <p><span className="font-semibold text-muted-foreground">Documento:</span> {spec.label}</p>
                          <p><span className="font-semibold text-muted-foreground">Título:</span> {title}</p>
                        </div>
                      </div>
                    </>
                  ) : isProSpec ? (
                    <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                      <div className="border-b border-border/50 pb-3">
                        <h2 className="text-base font-bold font-display text-foreground">
                          Percurso Profissional & Académico
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Preencha as informações para as secções selecionadas no Passo 2.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {step3Fields.length > 0 ? (
                          step3Fields.map(renderField)
                        ) : (
                          <div className="sm:col-span-2 text-center py-6 text-xs text-muted-foreground">
                            Nenhuma secção opcional ativada. Volte ao Passo 2 para ativar secções adicionais.
                          </div>
                        )}
                      </div>
                    </section>
                  ) : (
                    <>
                      {/* Page Extension Tiers */}
                      {spec.pageTiers && spec.pageTiers.length > 0 && (
                        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
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
                        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                          <div className="border-b border-border/50 pb-3">
                            <h2 className="text-base font-bold font-display text-foreground">Normas & Estilos</h2>
                          </div>
                          <div className="space-y-4">{step3Fields.map(renderField)}</div>
                        </section>
                      )}

                      {/* Document Structure Checklist */}
                      {spec.structure && spec.structure.length > 0 && (
                        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
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
                    </>
                  )}
                </div>
              )}

              {/* PASSO 4: SÍNTESE & EMISSÃO PERSONALIZADA */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Executive Instructions Block */}
                  <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-4">
                    <div>
                      <Label htmlFor="instructions" className="text-base font-bold font-display text-foreground">
                        Instruções Especiais para a IA
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Explicite regras formais, tom de voz ou diretrizes específicas para o documento.
                      </p>
                    </div>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                      placeholder={spec.instructionsPlaceholder}
                      className="min-h-28 rounded-xl text-xs"
                    />
                  </section>

                  {/* Document Specific 1-Click Export Suite */}
                  {spec.id === "linkedin_profile" && (
                    <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-7 shadow-soft space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Icons.Linkedin className="size-4 text-primary" />
                            Painel de Cópia em 1-Clique para LinkedIn
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Copie dados formatados para colar diretamente nas secções do seu perfil LinkedIn.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const headline = asString(fields.headline);
                            if (!headline) return toast.error("Preencha a Headline no Passo 1.");
                            navigator.clipboard.writeText(headline);
                            toast.success("Headline copiada para a área de transferência!");
                          }}
                          className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                        >
                          <Icons.Copy className="size-3.5 text-primary" />
                          Copiar Headline
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const about = asString(fields.about);
                            if (!about) return toast.error("Preencha a secção Sobre no Passo 3.");
                            navigator.clipboard.writeText(about);
                            toast.success("Resumo (About) copiado para a área de transferência!");
                          }}
                          className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                        >
                          <Icons.Copy className="size-3.5 text-primary" />
                          Copiar Resumo (Sobre)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const exp = asString(fields.experience);
                            if (!exp) return toast.error("Preencha a Experiência no Passo 3.");
                            navigator.clipboard.writeText(exp);
                            toast.success("Experiência copiada!");
                          }}
                          className="h-10 rounded-xl justify-start px-3.5 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                        >
                          <Icons.Copy className="size-3.5 text-primary" />
                          Copiar Experiência
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const all = `HEADLINE:\n${asString(fields.headline)}\n\nSOBRE:\n${asString(fields.about)}\n\nEXPERIÊNCIA:\n${asString(fields.experience)}\n\nSKILLS:\n${asString(fields.skills)}`;
                            navigator.clipboard.writeText(all);
                            toast.success("Perfil completo copiado!");
                          }}
                          className="h-10 rounded-xl justify-start px-3.5 text-xs font-bold gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                        >
                          <Icons.Sparkles className="size-3.5" />
                          Copiar Perfil Completo
                        </Button>
                      </div>
                    </section>
                  )}

                  {(spec.id === "cover_letter" || spec.id === "reference_letter") && (
                    <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-7 shadow-soft space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Icons.Mail className="size-4 text-primary" />
                            Emissão da Carta & Envio Rápido
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Exporte em PDF timbrado ou copie o texto para enviar no corpo do seu e-mail.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const text = asString(fields.purpose || fields.closing_statement);
                            if (!text) return toast.error("Preencha o conteúdo da carta no Passo 3.");
                            navigator.clipboard.writeText(text);
                            toast.success("Texto da carta copiado para envio por e-mail!");
                          }}
                          className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
                        >
                          <Icons.Copy className="size-3.5 text-primary" />
                          Copiar Texto para E-mail
                        </Button>
                      </div>
                    </section>
                  )}

                  {(spec.id === "cv" || spec.id === "simple_cv") && (
                    <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-7 shadow-soft space-y-3">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                        <Icons.CheckCircle2 className="size-4" />
                        Motor Auto-Fit A4 Ativo
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        O Dokvera ajustará automaticamente respiros, espaçamentos e tamanho tipográfico para garantir que a folha A4 fique perfeitamente equilibrada e sem lacunas feias.
                      </p>
                    </section>
                  )}

                  {/* Summary Block */}
                  <div className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Resumo da Configuração
                    </h3>
                    <div className="text-xs space-y-1.5">
                      <p><span className="font-semibold text-muted-foreground">Documento:</span> {spec.label}</p>
                      <p><span className="font-semibold text-muted-foreground">Título:</span> {title}</p>
                      {pageTierId && (
                        <p><span className="font-semibold text-muted-foreground">Extensão:</span> {spec.pageTiers?.find((t) => t.id === pageTierId)?.label}</p>
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

          {/* STICKY GLASSMORPHISM BOTTOM ACTION BAR (FIXA NO FUNDO EM DESKTOP E MOBILE NA THUMB ZONE) */}
          <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-3 shadow-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              {/* Left: Step Info */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-xl border-primary/30 text-primary text-[11px] font-bold px-2.5 py-1 bg-primary/5 font-mono">
                  Passo {wizardStep} de 4
                </Badge>
                <div className="hidden sm:block text-xs font-semibold text-foreground font-display">
                  {cost?.totalCredits ?? 0} créditos ({formatCurrency(creditsToCurrency(cost?.totalCredits ?? 0, country), country)})
                </div>
              </div>

              {/* Right: Action Buttons with Gold-Standard Ergonomic Proportions */}
              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                    className="h-10 px-3.5 rounded-xl text-xs font-semibold gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                    Voltar
                  </Button>
                )}

<<<<<<< HEAD
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
=======
                {check.affordable ? (
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl font-semibold shadow-glow text-xs sm:text-sm"
                      disabled={generate.isPending || missingRequired.length > 0}
                      onClick={() => generate.mutate()}
                    >
                      {generate.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 size-4" />
                      )}
                      Gerar Documento — {formatCurrency(cost.totalMzn, country)} ({cost.totalCredits} cr)
                    </Button>
                    <p className="text-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Edições e revisões incluídas sem custos extra por 24 horas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl font-semibold text-xs sm:text-sm shadow-md gap-2"
                      onClick={() => {
                        toast.info("Pagamento Direto do Documento", {
                          description: `A solicitar recarga de ${formatCurrency(check.missingMzn, country)} (${check.missingCredits} cr) para gerar este documento.`,
                        });
                        navigate({ to: "/credits" });
                      }}
                    >
                      <Sparkles className="size-4" />
                      Comprar Apenas Este Documento — {formatCurrency(check.missingMzn, country)}
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-2xl font-medium text-xs gap-2">
                      <Link to="/credits">
                        <Coins className="size-3.5 text-primary" />
                        Ver Pacotes com Desconto
                      </Link>
                    </Button>
                  </div>
>>>>>>> 7e33f0c (feat(studio): add pay-per-document pricing, mobile sticky bar, quick edit, and quick credit chips)
                )}
              </div>
            </div>
          </div>

<<<<<<< HEAD
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
=======
          {/* Sticky Bottom Bar for Mobile (Ergonomia & Alta Conversão) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border p-3.5 shadow-2xl flex items-center justify-between gap-3 px-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total a Pagar</p>
              <p className="font-display text-base font-extrabold text-foreground">
                {formatCurrency(cost.totalMzn, country)}
                <span className="text-xs font-normal text-muted-foreground ml-1">({cost.totalCredits} cr)</span>
              </p>
            </div>
            {check.affordable ? (
              <Button
                size="default"
                disabled={generate.isPending || missingRequired.length > 0}
                onClick={() => generate.mutate()}
                className="rounded-xl font-bold shadow-glow text-xs h-11 px-5"
              >
                {generate.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Sparkles className="mr-1.5 size-4" />}
                Gerar Agora
              </Button>
            ) : (
              <Button
                size="default"
                onClick={() => navigate({ to: "/credits" })}
                className="rounded-xl font-bold text-xs h-11 px-4 gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Pagar {formatCurrency(check.missingMzn, country)}
              </Button>
            )}
          </div>
>>>>>>> 7e33f0c (feat(studio): add pay-per-document pricing, mobile sticky bar, quick edit, and quick credit chips)
        </div>
      ) : null}
    </div>
  );
}
