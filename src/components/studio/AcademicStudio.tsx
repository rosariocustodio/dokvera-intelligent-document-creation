import React, { useState } from "react";
import {
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Minus,
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
  onSelectAnotherSpec,
  country = "MZ",
}: AcademicStudioProps) {
  // Passos do Estudio: 1. Capa & Identificacao, 2. Paginas & Estrutura, 3. Emissao & IA
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Contador de Paginas: Minimo 8, Maximo 21 (Padrao 8)
  const [pageCount, setPageCount] = useState<number>(8);

  const asString = (val: unknown): string => (val == null ? "" : String(val));

  // Gestao de paginas e mapeamento automatico do PageTier de custo
  const handlePageChange = (delta: number) => {
    const next = Math.max(8, Math.min(21, pageCount + delta));
    setPageCount(next);

    if (next <= 11) setPageTierId("6-11");
    else if (next <= 15) setPageTierId("12-15");
    else setPageTierId("16-21");
  };

  // Validacao estrita: Tema Central e obrigatorio para avancar do Bloco 1
  const canAdvanceFromStep1 = Boolean(asString(fields["theme"]).trim());

  const handleNextStep1 = () => {
    if (!canAdvanceFromStep1) {
      toast.error("Preencha o Tema Central do trabalho para poder avançar.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const stepsInfo = [
    { num: 1, title: "1. Capa & Identificação", icon: FileText },
    { num: 2, title: "2. Páginas & Estrutura", icon: Layers },
    { num: 3, title: "3. Emissão & IA", icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Barra de Navegacao Superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSelectAnotherSpec}
            className="h-9 rounded-xl px-3 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 size-4" /> Mudar tipo de documento
          </Button>
          <div className="h-4 w-px bg-border/60" />
          <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 text-[11px] font-mono font-semibold">
            Trabalho Académico
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

      {/* Indicador de Passos Limpo (3 Blocos Diretos) */}
      <div className="rounded-2xl border border-border/60 bg-card p-1.5 shadow-xs">
        <div className="grid grid-cols-3 gap-1">
          {stepsInfo.map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num >= 2 && !canAdvanceFromStep1) {
                    toast.error("Preencha o Tema Central no Bloco 1 primeiro.");
                    return;
                  }
                  setStep(s.num as 1 | 2 | 3);
                }}
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

      {/* CORPO DO FORMULÁRIO (COLUNA ÚNICA) */}
      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* BLOCO 1: DADOS DA CAPA & IDENTIFICAÇÃO                               */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-foreground">Informações para a Capa & Identificação</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estes dados serão usados para montar a capa oficial e o cabeçalho do documento.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="theme" className="text-xs font-semibold">
                    Tema Central / Título do Trabalho <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Input
                    id="theme"
                    value={asString(fields["theme"])}
                    onChange={(e) => setField("theme", e.target.value)}
                    placeholder="Ex.: O Impacto da Digitalização na Banca em Moçambique"
                    className="h-11 rounded-xl text-xs font-medium"
                  />
                  {!canAdvanceFromStep1 && (
                    <p className="text-[11px] text-destructive font-medium">
                      O Tema Central é obrigatório para poder avançar para o próximo bloco.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="institution" className="text-xs font-semibold">
                      Instituição de Ensino
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
                      Curso / Faculdade
                    </Label>
                    <Input
                      id="course"
                      value={asString(fields["course"])}
                      onChange={(e) => setField("course", e.target.value)}
                      placeholder="Ex.: Licenciatura em Gestão de Empresas"
                      className="h-10 rounded-xl text-xs"
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
                      placeholder="Ex.: Gestão de Sistemas de Informação"
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="teacher" className="text-xs font-semibold">
                      Docente / Professor
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
            </div>

            {/* Navegação do Bloco 1 */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleNextStep1}
                disabled={!canAdvanceFromStep1}
                className="h-11 rounded-xl px-6 text-xs font-bold gap-2 cursor-pointer"
              >
                Avançar para Páginas & Estrutura <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* BLOCO 2: PÁGINAS (+/-) & ESTRUTURA DO TRABALHO                       */}
        {/* ==================================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Seletor Real de Páginas (+ e -) */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-foreground">Número de Páginas do Trabalho</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Defina a extensão do trabalho entre 8 e 21 páginas.
                </p>
              </div>

              <div className="flex items-center justify-between bg-muted/30 border border-border/60 rounded-2xl p-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Extensão Selecionada:</span>
                  <p className="text-2xl font-extrabold text-foreground font-mono mt-0.5">
                    {pageCount} páginas
                  </p>
                  <span className="text-[11px] text-primary font-semibold">
                    Custo estimado: {cost?.totalCredits ?? 21} créditos · {formatCurrency(creditsToCurrency(cost?.totalCredits ?? 21, country), country)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(-1)}
                    disabled={pageCount <= 8}
                    className="size-11 rounded-xl border-border/80 hover:bg-muted cursor-pointer"
                  >
                    <Minus className="size-5" />
                  </Button>

                  <span className="w-8 text-center text-base font-bold font-mono">
                    {pageCount}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={pageCount >= 21}
                    className="size-11 rounded-xl border-border/80 hover:bg-muted cursor-pointer"
                  >
                    <Plus className="size-5" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                * Mínimo permitido: 8 páginas. Máximo permitido: 21 páginas.
              </p>
            </div>

            {/* Norma de Citação */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-3">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-sm font-bold text-foreground">Norma de Citação Bibliográfica</h3>
                <p className="text-xs text-muted-foreground">
                  Selecione o padrão académico de formatação.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { value: "apa", label: "Norma APA" },
                  { value: "abnt", label: "Norma ABNT" },
                  { value: "iso690", label: "Norma ISO 690" },
                  { value: "none", label: "Sem norma específica" },
                ].map((norm) => {
                  const isSelected = (fields["citation_style"] || "apa") === norm.value;
                  return (
                    <button
                      key={norm.value}
                      type="button"
                      onClick={() => setField("citation_style", norm.value)}
                      className={cn(
                        "h-10 rounded-xl px-4 text-xs font-semibold border transition-all cursor-pointer",
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

            {/* Estrutura do Documento */}
            {spec.structure && spec.structure.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Secções do Trabalho</h3>
                    <p className="text-xs text-muted-foreground">
                      Escolha quais partes devem fazer parte da estrutura final.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {structure.length} secções ativas
                  </Badge>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {spec.structure.map((item) => {
                    const isChecked = structure.includes(item.id) || Boolean(item.required);
                    return (
                      <label
                        key={item.id}
                        onClick={() => !item.required && toggleStructure(item.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3 text-xs transition-all cursor-pointer",
                          isChecked
                            ? "border-primary/40 bg-primary/5 font-semibold text-foreground"
                            : "border-border/60 text-muted-foreground hover:border-border"
                        )}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.required ? (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">obrigatório</Badge>
                        ) : (
                          <div className={cn("size-4 rounded-md border flex items-center justify-center", isChecked ? "bg-primary border-primary text-white" : "border-border")}>
                            {isChecked && <Check className="size-3" />}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navegação do Bloco 2 */}
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 rounded-xl px-5 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-4" /> Bloco Anterior
              </Button>

              <Button
                type="button"
                onClick={handleNextStep2}
                className="h-11 rounded-xl px-6 text-xs font-bold gap-2 cursor-pointer"
              >
                Avançar para Emissão & IA <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* BLOCO 3: EMISSÃO FINAL & ORIENTAÇÕES DA IA                           */}
        {/* ==================================================================== */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Campo Opcional de Instruções Específicas do Docente */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Instruções do Docente / Orientações para a IA (Opcional)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Escreva aqui regras específicas que a Inteligência Artificial deve obedecer ao gerar o trabalho.
                </p>
              </div>

              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex.: O docente pediu para focar o estudo no caso do Banco X em Moçambique, citar dados de 2024 e manter tom rigoroso."
                className="min-h-28 text-xs rounded-xl leading-relaxed"
              />
            </div>

            {/* Resumo Final dos Dados */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileCheck2 className="size-4 text-primary" />
                  Resumo do Trabalho Académico
                </h3>
                <Badge variant="outline" className="text-[10px]">Pronto a Gerar</Badge>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Tema Central:</span>
                  <span className="font-bold text-foreground max-w-sm text-right truncate">
                    {asString(fields["theme"]) || "Nao especificado"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Instituição:</span>
                  <span className="font-semibold text-foreground">
                    {asString(fields["institution"]) || "Nao especificada"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Curso / Cadeira:</span>
                  <span className="font-semibold text-foreground">
                    {asString(fields["course"])} {fields["subject"] ? `(${asString(fields["subject"])})` : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Docente:</span>
                  <span className="font-semibold text-foreground">
                    {asString(fields["teacher"]) || "Nao especificado"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Extensão de Páginas:</span>
                  <span className="font-bold text-primary">{pageCount} páginas</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Norma de Citação:</span>
                  <span className="font-bold uppercase text-foreground">{asString(fields["citation_style"] || "apa")}</span>
                </div>
              </div>
            </div>

            {/* Extrato Financeiro & Saldo */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Custo Final</span>
                <p className="text-base font-extrabold text-foreground mt-0.5">
                  {cost?.totalCredits ?? 21} créditos · {formatCurrency(creditsToCurrency(cost?.totalCredits ?? 21, country), country)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-muted-foreground">Seu Saldo:</span>
                <p className="text-xs font-bold text-foreground">{credits} cr</p>
              </div>
            </div>

            {/* Mensagem de Erro de Validação se Houver */}
            {missingRequired.length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
                Por favor preencha os campos obrigatórios: {missingRequired.join(", ")}.
              </div>
            )}

            {/* Disparo Final */}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="h-11 rounded-xl px-5 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-4" /> Bloco Anterior
              </Button>

              <Button
                type="button"
                disabled={isGenerating || !canAdvanceFromStep1 || !check?.affordable}
                onClick={onGenerate}
                size="lg"
                className="h-12 rounded-xl px-8 text-xs font-bold gap-2.5 shadow-glow cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Gerar Trabalho Académico Agora
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
