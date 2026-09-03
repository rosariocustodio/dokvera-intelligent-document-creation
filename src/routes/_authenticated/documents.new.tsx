import React, { useEffect, useMemo, useState } from "react";
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
import { checkBalance, computeCost, studentsExtra, type DocumentDraftValues } from "@/lib/pricing";

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
      { title: "Criar documento — Dokvera" },
      { name: "description", content: "Escolhe o tipo de documento e preenche apenas os campos que importam." },
      { property: "og:title", content: "Criar documento — Dokvera" },
      { property: "og:description", content: "Assistente de criação de documentos da Dokvera." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewDocument,
});

function TypeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.FileText;
  return <Icon className={className ?? "size-5"} />;
}

/** Default structure ids for a spec (defaults + everything required). */
function defaultStructure(spec: DocSpec): string[] {
  return (spec.structure ?? []).filter((s) => s.default || s.required).map((s) => s.id);
}

function asString(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
}

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

  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [structure, setStructure] = useState<string[]>([]);
  const [pageTierId, setPageTierId] = useState<string | undefined>(undefined);
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [layoutId, setLayoutId] = useState<string | undefined>(undefined);
  const [instructions, setInstructions] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hydratedDraft, setHydratedDraft] = useState(false);

  const spec = specId ? getSpec(specId) ?? null : null;

  /** Apply spec defaults whenever a new type is chosen. */
  useEffect(() => {
    if (!spec) return;
    if (draftId && !hydratedDraft) return;
    setStructure(defaultStructure(spec));
    setPageTierId(spec.pageTiers?.[0]?.id);
    setTemplateId(spec.templates?.[0]?.id);
    setLayoutId(spec.layouts?.[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id]);

  /** Prefill the "Local" field with the country default city. */
  useEffect(() => {
    if (!spec || !profile) return;
    const hasCity = spec.groups.some((g) => g.fields.some((f) => f.id === "city"));
    if (!hasCity) return;
    setFields((prev) => (prev["city"] ? prev : { ...prev, city: getCountryConfig(country).defaultCity }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec?.id, profile]);

  /** Restore an existing draft. */
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
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
    }),
    [fields, structure, pageTierId, templateId, layoutId, instructions, students.length, spec?.students],
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
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
    },
    metadata: {
      pageTierId: pageTierId ?? null,
      studentsCount: students.length || 1,
      costLines: cost?.lines ?? [],
    },
  });

  /** Debounced draft autosave once a type is picked. */
  useEffect(() => {
    if (!spec || !userId) return;
    if (draftId && !hydratedDraft) return;
    setSaving("saving");
    const timer = setTimeout(async () => {
      try {
        if (draftId) {
          const { error } = await supabase.from("documents").update(buildPayload()).eq("id", draftId);
          if (error) throw error;
          queryClient.invalidateQueries({ queryKey: ["document", draftId] });
        } else {
          const { data, error } = await supabase
            .from("documents")
            .insert({ user_id: userId, status: "draft", ...buildPayload() })
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
  }, [spec?.id, fields, structure, pageTierId, templateId, layoutId, instructions, draftId, hydratedDraft, userId]);

  const generate = useMutation({
    mutationFn: async () => {
      if (!spec) throw new Error("Escolhe primeiro o tipo de documento.");
      if (missingRequired.length > 0) {
        throw new Error(`Preenche os campos obrigatórios: ${missingRequired.join(", ")}.`);
      }
      if (!check.affordable) throw new Error("Créditos insuficientes para gerar este documento.");

      let documentId = draftId;
      if (documentId) {
        const { error } = await supabase.from("documents").update(buildPayload()).eq("id", documentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert({ user_id: userId, status: "draft", ...buildPayload() })
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
    // Deduplicate labels so the picker stays readable.
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

  const renderField = (field: FieldDef) => {
    const value = fields[field.id];
    const wide = field.type === "textarea" || field.type === "list" || field.type === "students";

    return (
      <div key={field.id} className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        {field.type === "students" ? (
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
                placeholder="Nome completo"
                className="h-11 rounded-xl"
              />
              <Button type="button" variant="secondary" className="h-11 rounded-xl px-4" onClick={addStudent}>
                Adicionar
              </Button>
            </div>
            {students.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {students.map((name, index) => (
                  <Badge key={`${name}-${index}`} variant="secondary" className="gap-1.5 rounded-lg py-1.5 pl-3 pr-1.5">
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
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {spec.students.includedFree} incluídos · cada pessoa extra custa {spec.students.extraPerStudent} cr
                (máx. {spec.students.max}).
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
            className="min-h-28 rounded-xl"
          />
        ) : field.type === "select" ? (
          <select
            id={field.id}
            value={asString(value)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField(field.id, e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecionar…</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id={field.id}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            min={field.min}
            max={field.max}
            value={asString(value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="h-11 rounded-xl"
          />
        )}

        {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={spec ? spec.label : "Criar novo documento"}
        subtitle={
          spec
            ? "Preenche apenas o que este tipo de documento precisa. O custo é calculado ao lado."
            : "Escolhe o tipo de documento — cada tipo tem o seu próprio formulário."
        }
        action={
          <Badge variant="secondary" className="h-9 gap-2 rounded-full px-4 text-sm font-semibold">
            <Coins className="size-4 text-primary" />
            {credits} cr · {formatCurrency(creditsToCurrency(credits, country), country)}
          </Badge>
        }
      />

      {!spec && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)}
              placeholder="Pesquisar: CV, requerimento, monografia…"
              className="h-11 rounded-xl pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-muted/60 p-1">
            {[{ id: "all", label: "Todos" }, ...DOC_CATEGORIES].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat.id
                    ? "bg-background text-foreground shadow-sm"
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
                  <h3 className="mt-4 font-semibold">{item.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="font-medium text-muted-foreground">
                      desde {base.totalCredits} cr · {formatCurrency(creditsToCurrency(base.totalCredits, country), country)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      Escolher <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum tipo encontrado para “{term}”.
            </p>
          )}
        </div>
      )}

      {spec && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Button
              variant="ghost"
              className="h-9 w-fit rounded-xl px-3"
              onClick={() => {
                setSpecId(null);
                setFields({});
              }}
            >
              <ArrowLeft className="mr-2 size-4" /> Mudar tipo de documento
            </Button>

            {spec.groups.map((group) => (
              <section key={group.id} className="rounded-2xl border border-border/70 bg-card p-6">
                <h2 className="text-base font-semibold">{group.label}</h2>
                {group.description && <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>}
                <div className="mt-5 grid gap-5 sm:grid-cols-2">{group.fields.map(renderField)}</div>
              </section>
            ))}

            {spec.pageTiers && spec.pageTiers.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-6">
                <h2 className="text-base font-semibold">Extensão do documento</h2>
                <p className="mt-1 text-sm text-muted-foreground">O número de páginas define o preço base.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {spec.pageTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setPageTierId(tier.id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        pageTierId === tier.id ? "border-primary bg-primary/5" : "border-border/70 hover:border-border"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{tier.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {tier.credits} cr · {formatCurrency(creditsToCurrency(tier.credits, country), country)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(spec.templates || spec.layouts) && (
              <section className="rounded-2xl border border-border/70 bg-card p-6 space-y-6">
                {spec.templates && (
                  <div>
                    <h2 className="text-base font-semibold">Modelo</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {spec.templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setTemplateId(tpl.id)}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            templateId === tpl.id ? "border-primary bg-primary/5" : "border-border/70 hover:border-border"
                          }`}
                        >
                          <span className="block text-sm font-semibold">{tpl.label}</span>
                          <span className="text-xs text-muted-foreground">{tpl.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {spec.layouts && (
                  <div>
                    <h2 className="text-base font-semibold">Layout</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {spec.layouts.map((lay) => (
                        <button
                          key={lay.id}
                          type="button"
                          onClick={() => setLayoutId(lay.id)}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            layoutId === lay.id ? "border-primary bg-primary/5" : "border-border/70 hover:border-border"
                          }`}
                        >
                          <span className="block text-sm font-semibold">{lay.label}</span>
                          <span className="text-xs text-muted-foreground">{lay.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {spec.structure && spec.structure.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-6">
                <h2 className="text-base font-semibold">O que incluir no documento</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seleciona exactamente as partes que queres. As obrigatórias não podem ser removidas.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {spec.structure.map((option) => {
                    const checked = structure.includes(option.id) || Boolean(option.required);
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                          checked ? "border-primary/60 bg-primary/5" : "border-border/70 hover:border-border"
                        } ${option.required ? "cursor-default opacity-90" : ""}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={Boolean(option.required)}
                          onCheckedChange={() => !option.required && toggleStructure(option.id)}
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            {option.label}
                            {option.required && <Badge variant="secondary" className="text-[10px]">obrigatório</Badge>}
                            {option.extraCredits ? (
                              <Badge variant="outline" className="text-[10px]">+{option.extraCredits} cr</Badge>
                            ) : null}
                          </span>
                          {option.description && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-border/70 bg-card p-6">
              <Label htmlFor="instructions" className="text-base font-semibold">
                Como gostaria que o documento fosse?
              </Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                placeholder={spec.instructionsPlaceholder}
                className="mt-3 min-h-28 rounded-xl"
              />
            </section>
          </div>

          {/* Resumo lateral */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="text-base font-semibold">Resumo do custo</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {cost?.lines.map((line) => (
                  <li key={line.id} className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="whitespace-nowrap font-medium">{line.credits} cr</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-right">
                  <span className="block font-semibold text-primary">{cost?.totalCredits ?? 0} créditos</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatCurrency(creditsToCurrency(cost?.totalCredits ?? 0, country), country)}
                  </span>
                </span>
              </div>

              {spec.students && students.length > spec.students.includedFree && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {studentsExtra(spec, students.length).extraStudents} pessoa(s) além das incluídas.
                </p>
              )}

              <div className="mt-4 rounded-xl bg-muted/40 p-3 text-sm">
                {check.affordable ? (
                  <p className="flex items-center gap-2 text-success">
                    <Check className="size-4 shrink-0" /> Saldo suficiente ({check.balance} cr).
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    Faltam {check.missingCredits} cr ({formatCurrency(check.missingMzn, country)}).
                  </p>
                )}
              </div>

              {missingRequired.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Falta preencher: {missingRequired.join(", ")}.
                </p>
              )}

              {check.affordable ? (
                <Button
                  className="mt-4 h-11 w-full rounded-xl font-semibold"
                  disabled={generate.isPending || missingRequired.length > 0}
                  onClick={() => generate.mutate()}
                >
                  {generate.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 size-4" />
                  )}
                  Gerar documento
                </Button>
              ) : (
                <Button asChild className="mt-4 h-11 w-full rounded-xl font-semibold">
                  <Link to="/credits">
                    <Coins className="mr-2 size-4" /> Comprar créditos
                  </Link>
                </Button>
              )}

              <p className="mt-3 min-h-4 text-center text-xs text-muted-foreground">
                {saving === "saving" && "A gravar rascunho…"}
                {saving === "saved" && "Rascunho gravado"}
                {saving === "error" && "Erro ao gravar rascunho"}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Título do documento</p>
              <p className="mt-1 break-words">{title || "—"}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
