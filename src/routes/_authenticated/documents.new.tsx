import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { AlertTriangle, Check, Coins, Loader2 } from "lucide-react";
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
  checkAffordability,
  creditsToMzn,
  formatMzn,
  type DocumentTypeDef,
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
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  const check = useMemo(
    () => checkAffordability(credits, selected?.cost ?? 0),
    [credits, selected],
  );

  const create = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Nenhum tipo selecionado");
      // Credit gate is enforced by code, never by AI.
      if (!checkAffordability(credits, selected.cost).affordable) {
        throw new Error("Créditos insuficientes");
      }
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          title: title.trim(),
          doc_type: selected.id,
          subject: subject.trim() || null,
          status: "draft",
          metadata: { estimated_cost: selected.cost },
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento criado como rascunho.");
      setSelected(null);
      setTitle("");
      setSubject("");
      navigate({ to: "/documents" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Criar novo documento"
        subtitle="Escolhe o tipo de documento. O custo em créditos é sempre mostrado antes de avançares."
        action={
          <Badge variant="secondary" className="h-9 gap-2 rounded-full px-4 text-sm">
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
              onClick={() => setSelected(type)}
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
                    {type.cost} cr
                  </Badge>
                </div>
                <h3 className="mt-5 text-base font-semibold">{type.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {type.description}
                </p>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                {formatMzn(creditsToMzn(type.cost))}
                {affordable ? "" : " · créditos insuficientes"}
              </p>
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selected?.label}</DialogTitle>
            <DialogDescription>
              Confirma os detalhes. Os créditos só são debitados na geração final do documento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Custo desta operação</span>
                <span className="font-semibold">
                  {check.cost} créditos · {formatMzn(check.costInMzn)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saldo actual</span>
                <span className="font-semibold">
                  {check.balance} créditos · {formatMzn(creditsToMzn(check.balance))}
                </span>
              </div>
              <div className="mt-3 border-t border-border/70 pt-3">
                {check.affordable ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <Check className="size-4" />
                    Saldo suficiente — podes avançar.
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="size-4" />
                    Faltam {check.missing} créditos ({formatMzn(check.missingInMzn)}).
                  </p>
                )}
              </div>
            </div>

            {check.affordable ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Título do documento</Label>
                  <Input
                    id="doc-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Impacto da digitalização na banca"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-subject">Tema / contexto (opcional)</Label>
                  <Textarea
                    id="doc-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Disciplina, instituição, requisitos ou instruções do professor."
                    className="min-h-24 rounded-xl"
                  />
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            {check.affordable ? (
              <Button
                className="rounded-xl"
                disabled={!title.trim() || create.isPending}
                onClick={() => create.mutate()}
              >
                {create.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
                Continuar
              </Button>
            ) : (
              <Button asChild className="rounded-xl">
                <Link to="/credits">
                  <Coins className="mr-1.5 size-4" />
                  Adquirir créditos
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
