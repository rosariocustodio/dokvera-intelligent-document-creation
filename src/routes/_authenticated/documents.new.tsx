import React, { useMemo, useState, useEffect } from "react";
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
import { creditsQuery, documentQuery, profileQuery } from "@/lib/queries";
import { z } from "zod";
import { getCountryConfig } from "@/lib/countries";
import {
  DOCUMENT_TYPES,
  PAGE_RANGES,
  calculateTotalDocumentCost,
  calculateStudentExtraCost,
  checkAffordability,
  creditsToCurrency,
  formatCurrency,
  type DocumentTypeDef,
  type PageRangeOption,
} from "@/lib/dokvera";
import { getSpec } from "@/lib/document-specs";

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
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const country = profile?.country;
  const credits = balance ?? 0;

  const { data: draftDoc } = useQuery({
    ...documentQuery(draftId || ""),
    enabled: Boolean(draftId),
  });

  const [step, setStep] = useState<number>(1);
  const [selected, setSelected] = useState<DocumentTypeDef | null>(null);
  const [selectedPageRange, setSelectedPageRange] = useState<PageRangeOption>((PAGE_RANGES[0] as PageRangeOption));
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [cvTemplate, setCvTemplate] = useState<string>("classic");
  const [cvLayout, setCvLayout] = useState<string>("one_column");
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [studentInput, setStudentInput] = useState("");

  // Estados exclusivos para o Builder de Trabalho Académico
  const [academicSubStep, setAcademicSubStep] = useState<number>(1);
  const [academicFaculty, setAcademicFaculty] = useState("");
  const [academicCourse, setAcademicCourse] = useState("");
  const [academicDiscipline, setAcademicDiscipline] = useState("");
  const [academicTeacher, setAcademicTeacher] = useState("");
  const [academicDeliveryDate, setAcademicDeliveryDate] = useState("");
  const [academicCity, setAcademicCity] = useState("");

  useEffect(() => {
    if (!academicCity && profile) {
      setAcademicCity(getCountryConfig(country).defaultCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const [academicInstitution, setAcademicInstitution] = useState("");
  const [academicStudentsList, setAcademicStudentsList] = useState<string[]>([]);
  const [academicStructure, setAcademicStructure] = useState<Record<string, boolean>>({
    cover: true,
    titlePage: true, // folha de rosto
    index: true,
    intro: true,
    generalObjective: true,
    specificObjectives: true,
    theoreticalFramework: true,
    methodology: true,
    development: true,
    conclusion: true,
    references: true,
    annexes: false,
  });
  const [academicPages, setAcademicPages] = useState<string>("10-15");
  const [academicFormat, setAcademicFormat] = useState<"apa" | "abnt">("apa");
  const [academicLanguage, setAcademicLanguage] = useState<"basico" | "academico" | "tecnico">("academico");

  const spec = selected ? getSpec(selected.id) : null;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev: Record<string, any>) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Deriva o título do documento a partir do campo mais relevante do próprio
  // tipo (spec.titleFieldId), em vez do antigo ecrã genérico "Tema Central"
  // que era forçado para todos os tipos independentemente de fazer sentido.
  // Os tipos académicos/escolares têm o seu próprio fluxo dedicado e continuam
  // a definir `title` diretamente, por isso ficam de fora aqui.
  useEffect(() => {
    if (!selected || !spec || isAcademicOrSchool) return;
    const sourceFieldId = spec.titleFieldId;
    const rawValue = sourceFieldId ? fieldValues[sourceFieldId] : undefined;
    const derived = typeof rawValue === "string" ? rawValue.trim() : "";
    setTitle(derived || spec.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, spec?.titleFieldId, spec?.titleFieldId ? fieldValues[spec.titleFieldId] : null]);

  const addStudent = (fieldId: string) => {
    if (!studentInput.trim()) return;
    const currentStudents = (fieldValues[fieldId] as string[]) || [];
    const updated = [...currentStudents, studentInput.trim()];
    handleFieldChange(fieldId, updated);
    setStudentInput("");
    setNumberOfStudents(updated.length);
  };

  const removeStudent = (fieldId: string, index: number) => {
    const currentStudents = (fieldValues[fieldId] as string[]) || [];
    const updated = currentStudents.filter((_, i) => i !== index);
    handleFieldChange(fieldId, updated);
    setNumberOfStudents(Math.max(1, updated.length));
  };

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

      const draftOptions = (draftDoc.options || {}) as Record<string, any>;
      if (draftOptions["fields"]) {
        const fields = draftOptions["fields"] as Record<string, any>;
        setFieldValues(fields);
        
        // Carrega estados específicos do Trabalho Académico se aplicável
        if (draftDoc.doc_type === "academic") {
          if (fields["faculty"]) setAcademicFaculty(fields["faculty"]);
          if (fields["course"]) setAcademicCourse(fields["course"]);
          if (fields["subject"]) setAcademicDiscipline(fields["subject"]);
          if (fields["teacher"]) setAcademicTeacher(fields["teacher"]);
          if (fields["delivery_date"]) setAcademicDeliveryDate(fields["delivery_date"]);
          if (fields["city"]) setAcademicCity(fields["city"]);
          if (fields["institution"]) setAcademicInstitution(fields["institution"]);
          if (Array.isArray(fields["students"])) setAcademicStudentsList(fields["students"]);
          if (fields["structure"]) setAcademicStructure(fields["structure"]);
          if (fields["citation_style"]) setAcademicFormat(fields["citation_style"]);
          if (fields["language_level"]) setAcademicLanguage(fields["language_level"]);
          if (fields["page_range"]) setAcademicPages(fields["page_range"]);
        }
      }
      if (draftOptions["template"]) setCvTemplate(draftOptions["template"] as string);
      if (draftOptions["layout"]) setCvLayout(draftOptions["layout"] as string);
    }
  }, [draftDoc]);

  // Função auxiliar para mapear dados académicos
  const getAcademicFields = () => {
    return {
      theme: title,
      faculty: academicFaculty,
      course: academicCourse,
      subject: academicDiscipline,
      teacher: academicTeacher,
      delivery_date: academicDeliveryDate,
      city: academicCity,
      institution: academicInstitution,
      students: academicStudentsList,
      structure: academicStructure,
      citation_style: academicFormat,
      language_level: academicLanguage,
      page_range: academicPages,
    };
  };

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
    if (selected.id === "academic") {
      const baseCost = academicPages === "16-20" ? 28 : 25; // 10-15 páginas custa 25, 16-20 custa 28
      const extraStudentsCount = Math.max(0, academicStudentsList.length - 4);
      const extraStudentsCost = extraStudentsCount * 0.39;
      return Number((baseCost + extraStudentsCost).toFixed(2));
    }
    const base = isAcademicOrSchool ? selectedPageRange.cost : selected.cost;
    return isAcademicOrSchool ? calculateTotalDocumentCost(base, numberOfStudents) : base;
  }, [selected, selectedPageRange, numberOfStudents, isAcademicOrSchool, academicPages, academicStudentsList]);

  const check = useMemo(
    () => checkAffordability(credits, effectiveCost, country),
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
        const fieldsToSave = selected.id === "academic" ? getAcademicFields() : fieldValues;
        
        if (draftId) {
          const { error } = await supabase
            .from("documents")
            .update({
              title: title.trim(),
              subject: subject.trim() || null,
              estimated_cost: effectiveCost,
              options: {
                fields: fieldsToSave,
                template: selected?.id === "cv" || selected?.id === "simple_cv" ? cvTemplate : null,
                layout: selected?.id === "cv" || selected?.id === "simple_cv" ? cvLayout : null,
              },
              metadata: {
                estimated_cost: effectiveCost,
                page_range: selected.id === "academic" ? academicPages : (isAcademicOrSchool ? selectedPageRange.id : null),
                students_count: selected.id === "academic" ? Math.max(1, academicStudentsList.length) : (isAcademicOrSchool ? numberOfStudents : 1),
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
              options: {
                fields: fieldsToSave,
                template: selected.id === "cv" || selected.id === "simple_cv" ? cvTemplate : null,
                layout: selected.id === "cv" || selected.id === "simple_cv" ? cvLayout : null,
              },
              metadata: {
                estimated_cost: effectiveCost,
                page_range: selected.id === "academic" ? academicPages : (isAcademicOrSchool ? selectedPageRange.id : null),
                students_count: selected.id === "academic" ? Math.max(1, academicStudentsList.length) : (isAcademicOrSchool ? numberOfStudents : 1),
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
  }, [
    title, 
    subject, 
    cvTemplate, 
    cvLayout, 
    selected, 
    selectedPageRange, 
    numberOfStudents, 
    draftId,
    academicFaculty,
    academicCourse,
    academicDiscipline,
    academicTeacher,
    academicDeliveryDate,
    academicCity,
    academicInstitution,
    academicStudentsList,
    academicStructure,
    academicPages,
    academicFormat,
    academicLanguage
  ]);

  const create = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Nenhum tipo selecionado");
      if (!title.trim()) throw new Error("Por favor, insira o título do documento.");
      if (!check.affordable) throw new Error("Créditos insuficientes para esta operação.");

      let documentId = draftId;
      const fieldsToSave = selected.id === "academic" ? getAcademicFields() : fieldValues;

      if (draftId) {
        const { error } = await supabase
          .from("documents")
          .update({
            title: title.trim(),
            subject: subject.trim() || null,
            estimated_cost: effectiveCost,
            options: {
              fields: fieldsToSave,
              template: selected?.id === "cv" || selected?.id === "simple_cv" ? cvTemplate : null,
              layout: selected?.id === "cv" || selected?.id === "simple_cv" ? cvLayout : null,
            },
            metadata: {
              estimated_cost: effectiveCost,
              page_range: selected.id === "academic" ? academicPages : (isAcademicOrSchool ? selectedPageRange.id : null),
              students_count: selected.id === "academic" ? Math.max(1, academicStudentsList.length) : (isAcademicOrSchool ? numberOfStudents : 1),
            },
          })
          .eq("id", draftId);

        if (error) throw error;
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
            options: {
              fields: fieldsToSave,
              template: selected.id === "cv" || selected.id === "simple_cv" ? cvTemplate : null,
              layout: selected.id === "cv" || selected.id === "simple_cv" ? cvLayout : null,
            },
            metadata: {
              estimated_cost: effectiveCost,
              page_range: selected.id === "academic" ? academicPages : (isAcademicOrSchool ? selectedPageRange.id : null),
              students_count: selected.id === "academic" ? Math.max(1, academicStudentsList.length) : (isAcademicOrSchool ? numberOfStudents : 1),
            },
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data) {
          documentId = data.id;
        }
      }

      if (!documentId) {
        throw new Error("Não foi possível determinar o ID do documento.");
      }

      // Aciona a geração real do conteúdo do documento (IA para acadêmicos/escolares, Código local para os restantes)
      const { generateDocumentContent } = await import("@/lib/documents.functions");
      await generateDocumentContent({ data: { documentId } });

      return { id: documentId };
    },
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (draftId) {
        queryClient.invalidateQueries({ queryKey: ["document", draftId] });
      }
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast.success("Documento gerado com sucesso!");
      setSelected(null);
      setTitle("");
      setSubject("");
      setNumberOfStudents(1);
      setAcademicSubStep(1);
      navigate({ to: `/documents/${data.id}` });
    },
    onError: (e: Error) => {
      toast.error("Erro ao gerar o documento", { description: e.message });
    },
  });

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Criar novo documento"
        subtitle="Siga o assistente estruturado para criar o seu documento inteligente de forma simples."
        action={
          <Badge variant="secondary" className="h-9 gap-2 rounded-full px-4 text-sm font-semibold shadow-sm">
            <Coins className="size-4 text-primary" />
            {credits} créditos · {formatCurrency(creditsToCurrency(credits, country), country)}
          </Badge>
        }
      />

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-6">
        <div 
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${(step === 1 ? 1 : 2) / 2 * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1 mb-8">
        <span className={step >= 1 ? "text-primary font-semibold" : ""}>1. Tipo de Documento</span>
        <span className={step >= 3 ? "text-primary font-semibold" : ""}>2. Detalhes do Documento</span>
      </div>

      {/* STEP 1: Seleção do Tipo de Documento */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Passo 1: Escolha o Tipo de Documento</h2>
            <p className="text-sm text-muted-foreground">Selecione uma categoria para filtrar as opções disponíveis.</p>
          </div>

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
              const isSelected = selected?.id === type.id;
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
                  className={`shadow-soft group flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-primary/50"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
                      }`}>
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
                    <span className="text-muted-foreground font-medium">{formatCurrency(creditsToCurrency(type.cost, country), country)}</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      {isSelected ? "Selecionado" : "Selecionar"} <Sparkles className="size-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="rounded-xl h-11 px-6 font-semibold"
              disabled={!selected}
              onClick={() => {
                setStep(3);
                if (isAcademicOrSchool) setAcademicSubStep(1);
              }}
            >
              Avançar <Icons.ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Campos de preenchimento dinâmicos por Tipo de Documento */}
      {step === 3 && (
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Informações e Detalhes Específicos */}
          <div className="space-y-6 bg-card border border-border/70 rounded-2xl p-6 shadow-soft">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Passo 3: Preencha os detalhes do seu {selected?.label}
              </h2>
              <p className="text-sm text-muted-foreground">Cada tipo de documento possui campos específicos para garantir que a estrutura final seja perfeita.</p>
            </div>

            <div className="space-y-6 pt-4">
              {spec?.groups.map((group) => (
                <div key={group.id} className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-5">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{group.label}</h3>
                    {group.description && <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.fields.map((field) => {
                      const value = fieldValues[field.id] ?? "";
                      const isRequired = field.required;

                      return (
                        <div key={field.id} className={`space-y-1.5 ${field.type === "textarea" || field.type === "students" || field.type === "list" ? "sm:col-span-2" : ""}`}>
                          <Label htmlFor={field.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {field.label} {isRequired && <span className="text-destructive">*</span>}
                          </Label>

                          {field.type === "text" && (
                            <Input
                              id={field.id}
                              value={value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="h-11 rounded-xl"
                              required={isRequired}
                            />
                          )}

                          {field.type === "number" && (
                            <Input
                              id={field.id}
                              type="number"
                              min={field.min}
                              max={field.max}
                              value={value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, parseInt(e.target.value) || "")}
                              placeholder={field.placeholder}
                              className="h-11 rounded-xl"
                              required={isRequired}
                            />
                          )}

                          {field.type === "date" && (
                            <Input
                              id={field.id}
                              type="date"
                              value={value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, e.target.value)}
                              className="h-11 rounded-xl"
                              required={isRequired}
                            />
                          )}

                          {field.type === "textarea" && (
                            <Textarea
                              id={field.id}
                              value={value}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="min-h-24 rounded-xl"
                              required={isRequired}
                            />
                          )}

                          {field.type === "select" && (
                            <div className="relative">
                              <select
                                id={field.id}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange(field.id, e.target.value)}
                                className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required={isRequired}
                              >
                                <option value="">Selecione uma opção...</option>
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {field.type === "list" && (
                            <div className="space-y-1">
                              <Textarea
                                id={field.id}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field.id, e.target.value)}
                                placeholder={field.placeholder || "Insira um item por linha..."}
                                className="min-h-24 rounded-xl"
                                required={isRequired}
                              />
                              <p className="text-[11px] text-muted-foreground">{field.help || "Insira um item por linha para o desenvolvimento."}</p>
                            </div>
                          )}

                          {field.type === "students" && (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  value={studentInput}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentInput(e.target.value)}
                                  placeholder="Nome do participante"
                                  className="h-11 rounded-xl"
                                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addStudent(field.id);
                                    }
                                  }}
                                />
                                <Button type="button" onClick={() => addStudent(field.id)} className="h-11 rounded-xl px-4">
                                  Adicionar
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(value) && value.map((std, idx) => (
                                  <Badge key={idx} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-1.5 text-sm rounded-lg">
                                    {std}
                                    <button
                                      type="button"
                                      onClick={() => removeStudent(field.id, idx)}
                                      className="size-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {field.help && field.type !== "list" && (
                            <p className="text-[11px] text-muted-foreground mt-1">{field.help}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Opções de Template e Layout se definidos */}
              {spec?.templates && (
                <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-5">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Estilo e Design do Documento</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Selecione o estilo visual que prefere para o seu documento.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {spec.templates.map((tpl) => (
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
                        <span className="text-[11px] text-muted-foreground">{tpl.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extensão de Páginas se aplicável (Trabalhos Académicos) */}
              {isAcademicOrSchool && (
                <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-5">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Extensão do documento (Páginas)</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Selecione o tamanho que deseja que o seu documento tenha.</p>
                  </div>
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
                        <span className="text-xs text-muted-foreground">{range.cost} créditos ({formatCurrency(creditsToCurrency(range.cost, country), country)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Caixa de Texto Livre Opcional para IA */}
              <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-5">
                <Label htmlFor="doc-subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Instruções Adicionais para IA (Opcional)
                </Label>
                <Textarea
                  id="doc-subject"
                  value={subject}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSubject(e.target.value)}
                  placeholder={spec?.instructionsPlaceholder || "Descreva como quer o documento..."}
                  className="min-h-24 rounded-xl"
                />
              </div>

              {/* Painel de Resumo Financeiro */}
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo total estimado</span>
                  <span className="font-bold text-primary text-base">
                    {effectiveCost} créditos · {formatCurrency(creditsToCurrency(effectiveCost, country), country)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Saldo atual na conta</span>
                  <span className="font-semibold">
                    {check.balance} créditos · {formatCurrency(creditsToCurrency(check.balance, country), country)}
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
                      Faltam {check.missing} créditos ({formatCurrency(check.missingInMzn, country)}).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
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
                <Button variant="ghost" className="rounded-xl h-11 px-5" onClick={() => setStep(1)}>
                  <Icons.ArrowLeft className="mr-2 size-4" /> Voltar
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
