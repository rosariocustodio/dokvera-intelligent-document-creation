import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/hooks/use-session";
import { profileQuery } from "@/lib/queries";
import { listCountries, DEFAULT_COUNTRY, type CountryCode } from "@/lib/countries";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Dokvera" },
      { name: "description", content: "Gere o teu perfil e preferências no Dokvera." },
      { property: "og:title", content: "Configurações — Dokvera" },
      { property: "og:description", content: "Perfil e preferências da conta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setCountry((profile.country as CountryCode) ?? DEFAULT_COUNTRY);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), country })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil actualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const displayName = profile?.full_name ?? user?.email ?? "Utilizador";

  return (
    <div className="space-y-8">
      <PageHeader title="Configurações" subtitle="Gere o teu perfil e a aparência da plataforma." />

      <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <div className="max-w-sm flex-1 space-y-2">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="max-w-xs flex-1 space-y-2">
            <Label htmlFor="country">País</Label>
            <Select value={country} onValueChange={(value) => setCountry(value as CountryCode)}>
              <SelectTrigger id="country" className="h-11 rounded-xl">
                <SelectValue placeholder="Escolhe o teu país" />
              </SelectTrigger>
              <SelectContent>
                {listCountries().map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define os preços, a moeda e a terminologia dos documentos oficiais (ex: BI vs Cartão de Cidadão, NUIT vs NIF).
            </p>
          </div>
        </div>
        <Button
          className="mt-5 rounded-xl"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
          Guardar alterações
        </Button>
      </section>

      <section className="shadow-soft flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-6">
        <div>
          <p className="font-semibold">Aparência</p>
          <p className="text-sm text-muted-foreground">Alterna entre modo claro e modo escuro.</p>
        </div>
        <ThemeToggle />
      </section>

      <section className="shadow-soft flex items-center justify-between gap-4 rounded-3xl border border-destructive/30 bg-card p-6">
        <div>
          <p className="font-semibold">Sessão</p>
          <p className="text-sm text-muted-foreground">Terminar sessão neste dispositivo.</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={signOut}>
          <LogOut className="mr-1.5 size-4" />
          Sair
        </Button>
      </section>
    </div>
  );
}
