import React, { useState } from "react";
import * as Icons from "lucide-react";
import {
  ArrowLeft,
  Check,
  Coins,
  Loader2,
  Sparkles,
  Zap,
  AlertTriangle,
  X,
  User,
  Camera,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { type DocSpec, type FieldDef } from "@/lib/document-specs";
import { type AffordabilityResult, type CostBreakdown } from "@/lib/pricing";
import { creditsToCurrency, formatCurrency } from "@/lib/dokvera";
import { MagicFill } from "@/components/studio/MagicFill";
import { type CategoryPreset } from "@/lib/category-presets";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SimpleDocumentFormProps {
  spec: DocSpec;
  fields: Record<string, unknown>;
  setField: (id: string, value: unknown) => void;
  setFields: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  structure: string[];
  toggleStructure: (id: string) => void;
  instructions: string;
  setInstructions: (val: string) => void;
  cost: CostBreakdown | null;
  credits: number;
  check: AffordabilityResult;
  missingRequired: string[];
  saving: "idle" | "saving" | "saved" | "error";
  isGenerating: boolean;
  onGenerate: () => void;
  onApplyMagicFields: (extracted: Record<string, unknown>, instructions?: string) => void;
  availablePresets: CategoryPreset[];
  onApplyPreset: (preset: CategoryPreset) => void;
  onSelectAnotherSpec: () => void;
  country?: string | null;
}

export function SimpleDocumentForm({
  spec,
  fields,
  setField,
  setFields,
  structure,
  toggleStructure,
  instructions,
  setInstructions,
  cost,
  credits,
  check,
  missingRequired,
  saving,
  isGenerating,
  onGenerate,
  onApplyMagicFields,
  availablePresets,
  onApplyPreset,
  onSelectAnotherSpec,
  country,
}: SimpleDocumentFormProps) {
  // Paid structure options only (options with extraCredits > 0)
  const paidStructureOptions = (spec.structure ?? []).filter(
    (s) => (s.extraCredits ?? 0) > 0
  );

  const renderField = (field: FieldDef) => {
    const value = fields[field.id];
    const wide =
      field.type === "textarea" ||
      field.type === "list" ||
      field.type === "students" ||
      field.type === "photo";

    return (
      <div key={field.id} className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
        <Label htmlFor={field.id} className="text-[13px] font-semibold text-foreground/90 tracking-tight">
          {field.label}
          {field.required && <span className="ml-1 text-destructive font-bold">*</span>}
        </Label>

        {field.type === "photo" ? (
          <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 transition-colors hover:border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {value ? (
                <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-primary shadow-xs shrink-0 bg-muted">
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
                <div className="size-20 rounded-2xl bg-muted/50 border-2 border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground shrink-0">
                  <User className="size-7 opacity-40" />
                  <span className="text-[10px] text-muted-foreground/80 mt-1 font-medium">Sem foto</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-semibold shadow-2xs hover:bg-muted/50 transition-colors gap-2">
                  <Camera className="size-4 text-primary" />
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
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  Formatos aceites: JPG ou PNG (máx. 4MB).
                </p>
              </div>
            </div>
          </div>
        ) : field.type === "textarea" ? (
          <Textarea
            id={field.id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setField(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="text-xs rounded-xl bg-background/90 border-border/70 focus-visible:ring-primary/30 font-medium placeholder:text-muted-foreground/60 transition-all"
          />
        ) : field.type === "list" ? (
          <Textarea
            id={field.id}
            value={Array.isArray(value) ? value.join("\n") : typeof value === "string" ? value : ""}
            onChange={(e) => setField(field.id, e.target.value.split("\n"))}
            placeholder={field.placeholder ?? "Introduza cada item por linha"}
            rows={3}
            className="text-xs rounded-xl bg-background/90 border-border/70 focus-visible:ring-primary/30 font-medium placeholder:text-muted-foreground/60 transition-all"
          />
        ) : field.type === "select" ? (
          <select
            id={field.id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setField(field.id, e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background/90 px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30 transition-all"
          >
            <option value="">Selecione uma opção...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-1.5">
            <Input
              id={field.id}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
              onChange={(e) => setField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="text-xs h-10 rounded-xl bg-background/90 border-border/70 focus-visible:ring-primary/30 font-medium placeholder:text-muted-foreground/60 transition-all"
            />
          </div>
        )}

        {field.help && <p className="text-[11px] text-muted-foreground/80 leading-normal">{field.help}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Top Header & Summary Card */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAnotherSpec}
              className="h-9 px-3 text-xs font-semibold rounded-xl gap-1.5 shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </Button>

            <div>
              <h1 className="text-base sm:text-lg font-bold font-display text-foreground">
                {spec.label}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">{spec.description}</p>
            </div>
          </div>

          {/* Cost and Balance Summary Top Badge */}
          <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-2xl border border-border/60 self-start md:self-auto">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Coins className="size-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Custo: {cost?.totalCredits ?? spec.baseCredits} créditos</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({formatCurrency(creditsToCurrency(cost?.totalCredits ?? spec.baseCredits, country), country)})
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>O teu saldo: {credits} créditos</span>
                {saving === "saving" && <span className="text-[10px] text-primary animate-pulse">• A guardar rascunho...</span>}
                {saving === "saved" && <span className="text-[10px] text-muted-foreground">• Rascunho guardado</span>}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MagicFill AI Extractor */}
      <MagicFill spec={spec} onApplyFields={onApplyMagicFields} />

      {/* Single-Page Form Groups */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs space-y-5">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <FileSignature className="size-4 text-primary" />
            Formulário do Documento
          </h2>
          <span className="text-[11px] text-muted-foreground font-medium">Página única</span>
        </div>

        {spec.groups.map((group) => (
          <div key={group.id} className="space-y-3 pt-1">
            <div className="border-b border-border/40 pb-1.5">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                {group.label}
              </h3>
              {group.description && (
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">{group.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {group.fields.map(renderField)}
            </div>
          </div>
        ))}

        {/* Paid Structure Options (Only shown if paid options with extraCredits > 0 exist) */}
        {paidStructureOptions.length > 0 && (
          <div className="space-y-3 pt-3.5 border-t border-border/60">
            <div className="border-b border-border/40 pb-1.5">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Opções Adicionais
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paidStructureOptions.map((item) => {
                const checked = structure.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-all",
                      checked
                        ? "border-primary bg-primary/5 shadow-2xs"
                        : "border-border/80 bg-background hover:bg-muted/30"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleStructure(item.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.extraCredits && item.extraCredits > 0 && (
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            +{item.extraCredits} cr
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Special Instructions (Only rendered for 'letter' which passes through AI generation) */}
        {spec.id === "letter" && (
          <div className="space-y-2 pt-3.5 border-t border-border/60">
            <Label htmlFor="simple_instructions" className="text-xs font-semibold text-foreground flex items-center gap-2">
              <span>Instruções para a IA (Opcional)</span>
              <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20">
                <Sparkles className="size-2.5 mr-1" /> IA
              </Badge>
            </Label>
            <Textarea
              id="simple_instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex.: tom firme mas cordial, referir prazo de resposta de 5 dias úteis e focar em termos contratuais..."
              rows={2}
              className="text-xs rounded-xl bg-background/90 border-border/70 focus-visible:ring-primary/30 font-medium placeholder:text-muted-foreground/60 transition-all min-h-16"
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl p-3 sm:p-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Coins className="size-4 sm:size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Total: {cost?.totalCredits ?? spec.baseCredits} Créditos</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({formatCurrency(creditsToCurrency(cost?.totalCredits ?? spec.baseCredits, country), country)})
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Saldo disponível: {credits} créditos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!check.affordable && (
              <div className="text-xs text-destructive font-semibold flex items-center gap-1.5 bg-destructive/10 px-3 py-1.5 sm:py-2 rounded-xl border border-destructive/20">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Faltam {check.missingCredits} créditos</span>
              </div>
            )}

            <Button
              type="button"
              size="lg"
              onClick={onGenerate}
              disabled={isGenerating || !check.affordable || missingRequired.length > 0}
              className="flex-1 sm:flex-initial h-11 sm:h-12 rounded-xl sm:rounded-2xl px-6 sm:px-8 font-bold text-xs gap-2 shadow-glow cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Gerar Documento Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
