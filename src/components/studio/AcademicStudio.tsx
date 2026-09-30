import React, { useState } from "react";
import {
  Wand2,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Eye,
  EyeOff,
  BookOpen,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type DocSpec } from "@/lib/document-specs";
import { formatCurrency, creditsToCurrency } from "@/lib/dokvera";
import { cn } from "@/lib/utils";

export interface AcademicStudioProps {
  spec: DocSpec;
  fields: Record<string, unknown>;
  setField: (id: string, value: unknown) => void;
  setFields: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  structure: string[];
  toggleStructure: (id: string) => void;
  pageTierId?: string;
  setPageTierId: (id: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  cost: any;
  credits: number;
  check: any;
  missingRequired: string[];
  saving: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onApplyPreset: (preset: any) => void;
  availablePresets: any[];
  onSelectAnotherSpec: () => void;
  country?: string | null;
}

export function AcademicStudio({
  spec,
  fields,
  setField,
  setFields,
  structure,
  toggleStructure,
  pageTierId,
  setPageTierId,
  instructions,
  setInstructions,
  cost,
  credits,
  check,
  missingRequired,
  saving,
  isGenerating,
  onGenerate,
  onApplyPreset,
  availablePresets,
  onSelectAnotherSpec,
  country = "MZ",
}: AcademicStudioProps) {
  // Stepper state for Academic Studio (1 to 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // IA Prompting state for Step 1
  const [iaPrompt, setIaPrompt] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Helper string safe reader
  const asString = (val: unknown): string => (val == null ? "" : String(val));

  // Heuristic IA Extractor for Step 1
  const handleIaExtraction = () => {
    if (!iaPrompt.trim()) {
      toast.error("Introduza uma breve descricao do trabalho.");
      return;
    }
    setIsExtracting(true);
    setTimeout(() => {
      const text = iaPrompt;
      const extracted: Record<string, unknown> = {};

      const themeMatch = text.match(/(?:tema|assunto|titulo|sobre)[:\s]+([^\n\.]+)/i);
      if (themeMatch && themeMatch[1]) extracted["theme"] = themeMatch[1].trim();
      else if (!fields["theme"]) extracted["theme"] = text.slice(0, 120);

      const instMatch = text.match(/(?:universidade|faculdade|escola|instituicao)[:\s]+([^\n\.]+)/i);
      if (instMatch && instMatch[1]) extracted["institution"] = instMatch[1].trim();

      const teacherMatch = text.match(/(?:docente|professor|orientador)[:\s]+([^\n\.]+)/i);
      if (teacherMatch && teacherMatch[1]) extracted["teacher"] = teacherMatch[1].trim();

      const courseMatch = text.match(/(?:curso|licenciatura|mestrado)[:\s]+([^\n\.]+)/i);
      if (courseMatch && courseMatch[1]) extracted["course"] = courseMatch[1].trim();

      setFields((prev) => ({ ...prev, ...extracted }));
      setInstructions((prev) => (prev ? `${prev}\nContexto: ${text}` : `Contexto: ${text}`));
      setIsExtracting(false);
      toast.success("Metadados extraidos pela Inteligencia Artificial com sucesso!");
    }, 700);
  };

  const stepsInfo = [
    { num: 1, title: "1. Ingestao & Dados", icon: Wand2 },
    { num: 2, title: "2. Arvore Estrutural", icon: Layers },
    { num: 3, title: "3. Direcao Editorial", icon: FileText },
    { num: 4, title: "4. Estacao de Emissao", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar for Academic Studio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSelectAnotherSpec}
            className="h-9 rounded-xl px-3 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 size-4" /> Voltar aos tipos
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 text-[11px] font-mono font-semibold">
            Modo Estudio Academico
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {saving === "saving" && (
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" /> a guardar rascunho...
            </span>
          )}
          {saving === "saved" && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="size-3" /> rascunho guardado
            </span>
          )}
        </div>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="rounded-2xl border border-border/60 bg-card p-1.5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {stepsInfo.map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2.5 px-2 text-xs transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : isDone
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <s.icon className="size-3.5 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Body (Split Screen Desktop) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Interactive Wizard Step (7/12) */}
        <div className="space-y-6 lg:col-span-7">
          {/* ==================================================================== */}
          {/* ETAPA 1: INGESTAO IA & METADADOS INICIAIS                            */}
          {/* ==================================================================== */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Central IA Prompt Bar */}
              <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wand2 className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Extracao Magica por IA</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Descreva o trabalho num so texto para a IA preencher a instituicao, tema e docente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    value={iaPrompt}
                    onChange={(e) => setIaPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleIaExtraction();
                      }
                    }}
                    placeholder="Ex.: Monografia de Gestao de Empresas na UEM sobre Banca Digital para o Prof. Doutor Silva"
                    className="h-10 rounded-xl text-xs flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleIaExtraction}
                    disabled={isExtracting || !iaPrompt.trim()}
                    className="h-10 rounded-xl px-4 text-xs font-bold gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isExtracting ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    Extrair
                  </Button>
                </div>
              </div>

              {/* Quick Presets section */}
              {availablePresets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Zap className="size-3 text-primary" /> Atalhos de Modelos Academicos:
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availablePresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onApplyPreset(preset)}
                        className="rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/40 cursor-pointer"
                      >
                        <span className="block text-xs font-semibold text-foreground">{preset.label}</span>
                        <span className="block text-[11px] text-muted-foreground line-clamp-1">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Identification Fields */}
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-bold text-foreground">Identificacao do Trabalho</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Verifique os campos extraidos ou preencha manualmente.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="theme" className="text-xs font-semibold">
                      Tema Central / Titulo do Trabalho <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="theme"
                      value={asString(fields["theme"])}
                      onChange={(e) => setField("theme", e.target.value)}
                      placeholder="Ex.: O Impacto da Digitalizacao no Setor Bancario em Mocambique"
                      className="h-10 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-semibold">
                      Disciplina / Cadeira
                    </Label>
                    <Input
                      id="subject"
                      value={asString(fields["subject"])}
                      onChange={(e) => setField("subject", e.target.value)}
                      placeholder="Ex.: Gestao de Sistemas de Informacao"
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="institution" className="text-xs font-semibold">
                      Instituicao de Ensino
                    </Label>
                    <Input
                      id="institution"
                      value={asString(fields["institution"])}
                      onChange={(e) => setField("institution", e.target.value)}
                      placeholder="Ex.: Universidade Eduardo Mondlane (UEM)"
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="course" className="text-xs font-semibold">
                      Curso
                    </Label>
                    <Input
                      id="course"
                      value={asString(fields["course"])}
                      onChange={(e) => setField("course", e.target.value)}
                      placeholder="Ex.: Licenciatura em Informatica"
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="teacher" className="text-xs font-semibold">
                      Docente / Supervisor
                    </Label>
                    <Input
                      id="teacher"
                      value={asString(fields["teacher"])}
                      onChange={(e) => setField("teacher", e.target.value)}
                      placeholder="Ex.: Prof. Doutor Manuel Silva"
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (!asString(fields["theme"]).trim()) {
                      toast.error("Preencha o Tema Central para avancar.");
                      return;
                    }
                    setStep(2);
                  }}
                  className="h-10 rounded-xl px-5 text-xs font-bold gap-2 cursor-pointer"
                >
                  Proximo: Arvore Estrutural <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* ETAPA 2: ARVORE ESTRUTURAL & NORMAS                                  */}
          {/* ==================================================================== */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Page Extension Tier Selector */}
              {spec.pageTiers && spec.pageTiers.length > 0 && (
                <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="border-b border-border/40 pb-2">
                    <h3 className="text-xs font-bold text-foreground">Extensao do Documento (Paginas)</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Escolha a dimensao desejada para o trabalho.
                    </p>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {spec.pageTiers.map((tier) => {
                      const isSelected = pageTierId === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setPageTierId(tier.id)}
                          className={cn(
                            "rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/5 font-bold shadow-xs"
                              : "border-border/60 hover:border-border bg-card"
                          )}
                        >
                          <span className="block text-xs text-foreground">{tier.label}</span>
                          <span className="text-[11px] font-semibold text-primary">
                            {tier.credits} cr · {formatCurrency(creditsToCurrency(tier.credits, country), country)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tree View Outline Structure Checklist */}
              {spec.structure && spec.structure.length > 0 && (
                <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="border-b border-border/40 pb-2.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="size-4 text-primary" />
                        Arvore Estrutural do Indice
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Ative ou desative seccoes do trabalho academico.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {structure.length} seccoes ativas
                    </Badge>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {spec.structure.map((item, idx) => {
                      const isChecked = structure.includes(item.id) || Boolean(item.required);
                      return (
                        <div
                          key={item.id}
                          onClick={() => !item.required && toggleStructure(item.id)}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all cursor-pointer selection:bg-none",
                            isChecked
                              ? "border-primary/40 bg-primary/5 text-foreground font-semibold"
                              : "border-border/40 bg-card/60 text-muted-foreground hover:border-border"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] text-muted-foreground font-bold">{idx + 1}.</span>
                            <span>{item.label}</span>
                            {item.required && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">obrigatorio</Badge>
                            )}
                            {item.extraCredits ? (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{item.extraCredits} cr</Badge>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            {isChecked ? (
                              <Eye className="size-3.5 text-primary" />
                            ) : (
                              <EyeOff className="size-3.5 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Citation Standards */}
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-3">
                <div className="border-b border-border/40 pb-2">
                  <h3 className="text-xs font-bold text-foreground">Norma de Citacao Bibliografica</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Selecione o padrao de formatacao das referencias.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "apa", label: "Norma APA (7.ª Edicao)" },
                    { value: "abnt", label: "Norma ABNT" },
                    { value: "iso690", label: "Norma ISO 690" },
                    { value: "none", label: "Sem norma especifica" },
                  ].map((norm) => {
                    const isSelected = (fields["citation_style"] || "apa") === norm.value;
                    return (
                      <button
                        key={norm.value}
                        type="button"
                        onClick={() => setField("citation_style", norm.value)}
                        className={cn(
                          "h-9 rounded-xl px-4 text-xs font-semibold border transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {norm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10 rounded-xl px-4 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Anterior
                </Button>

                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-10 rounded-xl px-5 text-xs font-bold gap-2 cursor-pointer"
                >
                  Proximo: Direcao Editorial <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* ETAPA 3: DIRECAO EDITORIAL & CONTEUDO BRUTO                          */}
          {/* ==================================================================== */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-bold text-foreground">Pontos a Abordar no Desenvolvimento</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Escreva os subtopicos ou apontamentos chave (um por linha) que a IA deve desenvolver.
                  </p>
                </div>

                <Textarea
                  value={
                    Array.isArray(fields["topics"])
                      ? (fields["topics"] as string[]).join("\n")
                      : asString(fields["topics"])
                  }
                  onChange={(e) => setField("topics", e.target.value.split("\n"))}
                  placeholder={"Ex.:\n- Conceito e evolucao da banca digital\n- Principais desafios de ciberseguranca em Mocambique\n- Estudo de caso dos servicos de mobile money"}
                  className="min-h-32 text-xs rounded-xl font-mono leading-relaxed"
                />
              </div>

              {/* Special Editorial Instructions */}
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-2.5">
                  <h3 className="text-xs font-bold text-foreground">Instrucoes Especiais para a IA</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Explicite o tom, o nivel de rigor ou orientacoes especificas do docente.
                  </p>
                </div>

                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ex.: Usar linguagem cientifica rigorosa, incluir dados estatisticos recentes e citar autores moçambicanos no corpo do texto."
                  className="min-h-24 text-xs rounded-xl leading-relaxed"
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-10 rounded-xl px-4 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Anterior
                </Button>

                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="h-10 rounded-xl px-5 text-xs font-bold gap-2 cursor-pointer"
                >
                  Proximo: Estacao de Emissao <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* ETAPA 4: ESTACAO DE EMISSAO & DISPARO                                */}
          {/* ==================================================================== */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive Summary Card */}
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="size-4 text-primary" />
                    Resumo do Trabajo Academico
                  </h3>
                  <Badge variant="outline" className="text-[10px]">Pronto a Gerar</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground font-medium">Tema:</span>
                    <span className="font-bold text-foreground text-right max-w-xs truncate">{asString(fields["theme"]) || "Nao especificado"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground font-medium">Instituicao:</span>
                    <span className="font-semibold text-foreground">{asString(fields["institution"]) || "Nao especificada"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground font-medium">Norma:</span>
                    <span className="font-semibold text-foreground uppercase">{asString(fields["citation_style"] || "apa")}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">Seccoes Ativas:</span>
                    <span className="font-semibold text-foreground">{structure.length} seccoes</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Credit Status */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">Custo do Documento</span>
                  <p className="text-sm font-extrabold text-foreground">
                    {cost?.totalCredits ?? spec.baseCredits} creditos · {formatCurrency(creditsToCurrency(cost?.totalCredits ?? spec.baseCredits, country), country)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground">O teu saldo:</span>
                  <p className="text-xs font-bold text-foreground">{credits} cr</p>
                </div>
              </div>

              {/* Validation Warning */}
              {missingRequired.length > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
                  Preencha os campos obrigatorios: {missingRequired.join(", ")}.
                </div>
              )}

              {/* Final Generation Trigger Button */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-11 rounded-xl px-4 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Anterior
                </Button>

                <Button
                  type="button"
                  disabled={isGenerating || missingRequired.length > 0 || !check?.affordable}
                  onClick={onGenerate}
                  size="lg"
                  className="h-12 rounded-xl px-8 text-xs font-bold gap-2.5 shadow-glow cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Gerar Trabalho Academico Agora
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Skeleton Preview (5/12) Desktop Sticky */}
        <div className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary" /> Pre-visualizacao A4
              </span>
              <Badge variant="outline" className="text-[9px] font-mono">Live Outline</Badge>
            </div>

            {/* Skeleton Sheet Preview */}
            <div className="relative mx-auto w-full aspect-[1/1.41] bg-background border border-border/50 rounded-xl p-5 shadow-inner flex flex-col justify-between text-[10px] font-mono text-muted-foreground overflow-hidden">
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center border-b border-border/40 pb-3 space-y-1">
                  <p className="font-bold text-foreground text-[11px]">{asString(fields["institution"]) || "[Nome da Instituicao]"}</p>
                  <p className="text-[9px] text-muted-foreground">{asString(fields["course"]) || "[Curso]"}</p>
                </div>

                {/* Title */}
                <div className="py-4 text-center space-y-1">
                  <p className="font-extrabold text-foreground text-xs">{asString(fields["theme"]) || "[Tema Central do Trabalho]"}</p>
                  <p className="text-[9px]">{asString(fields["subject"])}</p>
                </div>

                {/* Simulated Outline Tree */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <p className="font-bold text-foreground text-[10px]">INDICE PREVISTO:</p>
                  <ul className="space-y-1 text-[9px] pl-2">
                    {structure.slice(0, 6).map((stId) => {
                      const stObj = spec.structure?.find((s) => s.id === stId);
                      return (
                        <li key={stId} className="flex justify-between border-b border-dashed border-border/30 pb-0.5">
                          <span>• {stObj?.label || stId}</span>
                          <span className="opacity-50">pág. ...</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Footer Skeleton */}
              <div className="border-t border-border/40 pt-2 flex justify-between text-[8px] text-muted-foreground">
                <span>Docente: {asString(fields["teacher"]) || "N/A"}</span>
                <span>Dokvera Academic Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
