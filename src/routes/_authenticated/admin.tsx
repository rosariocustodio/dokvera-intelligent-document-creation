import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  Coins,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  CreditCard,
  Phone,
  Sparkles,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import {
  isAdminQuery,
  adminCreditOrdersQuery,
  adminUsersQuery,
  adminDocumentsQuery,
  adminStatsQuery,
  type AdminCreditOrderRow,
} from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatCredits, formatMzn } from "@/lib/dokvera";
import { orderReference, orderStatusMeta, PAYMENT_ACCOUNTS } from "@/lib/payments";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel de Administração — Dokvera" },
      { name: "description", content: "Administração de créditos, ordens de pagamento e utilizadores Dokvera." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("orders");
  const [statusFilter, setStatusFilter] = React.useState<string>("pending");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  // Dialog states for approve/reject
  const [selectedOrder, setSelectedOrder] = React.useState<AdminCreditOrderRow | null>(null);
  const [actionType, setActionType] = React.useState<"approve" | "reject" | null>(null);

  const { data: isAdmin, isLoading: loadingAdminCheck } = useQuery({
    ...isAdminQuery(user?.id, user?.email),
    enabled: Boolean(user?.id),
  });

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    ...adminStatsQuery(),
    enabled: Boolean(isAdmin),
  });

  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    ...adminCreditOrdersQuery(statusFilter === "all" ? null : statusFilter),
    enabled: Boolean(isAdmin),
  });

  const { data: usersList, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    ...adminUsersQuery(),
    enabled: Boolean(isAdmin && activeTab === "users"),
  });

  const { data: documentsList, isLoading: loadingDocs, refetch: refetchDocs } = useQuery({
    ...adminDocumentsQuery(),
    enabled: Boolean(isAdmin && activeTab === "documents"),
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.rpc("approve_credit_order", {
        _order_id: orderId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Pedido aprovado com sucesso! Os créditos foram depositados.");
      queryClient.invalidateQueries({ queryKey: ["admin-credit-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedOrder(null);
      setActionType(null);
    },
    onError: (err: any) => {
      toast.error(`Erro ao aprovar pedido: ${err.message || "Tente novamente."}`);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.rpc("reject_credit_order", {
        _order_id: orderId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pedido rejeitado.");
      queryClient.invalidateQueries({ queryKey: ["admin-credit-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelectedOrder(null);
      setActionType(null);
    },
    onError: (err: any) => {
      toast.error(`Erro ao rejeitar pedido: ${err.message || "Tente novamente."}`);
    },
  });

  function handleRefreshAll() {
    refetchStats();
    refetchOrders();
    if (activeTab === "users") refetchUsers();
    if (activeTab === "documents") refetchDocs();
    toast.success("Dados atualizados.");
  }

  if (loadingAdminCheck) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="font-display text-2xl font-bold">Acesso Restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta área é reservada exclusivamente para a administração do Dokvera (Ruqzora).
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-xl">
            <Link to="/dashboard">Voltar ao Painel Principal</Link>
          </Button>
        </div>
      </div>
    );
  }

  const filteredOrders = (orders ?? []).filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const ref = orderReference(o.id).toLowerCase();
    const email = (o.profile?.email ?? "").toLowerCase();
    const name = (o.profile?.full_name ?? "").toLowerCase();
    const note = (o.payer_note ?? "").toLowerCase();
    const providerRef = (o.provider_reference ?? "").toLowerCase();
    return (
      ref.includes(term) ||
      email.includes(term) ||
      name.includes(term) ||
      note.includes(term) ||
      providerRef.includes(term)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Administração Dokvera"
          subtitle={`Gerência oficial da plataforma Ruqzora • Sessão: ${user?.email}`}
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="rounded-xl gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Atualizar
          </Button>
          <Badge variant="secondary" className="rounded-xl bg-primary/10 text-primary border-primary/20 px-3 py-1 font-mono text-xs">
            <ShieldCheck className="mr-1 size-3.5" /> Super Admin
          </Badge>
        </div>
      </div>

      {/* Cards de Métricas e Resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total */}
        <Card className="rounded-3xl border-border/70 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Receita Aprovada
            </p>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">
            {loadingStats ? <Skeleton className="h-8 w-28" /> : formatMzn(stats?.totalRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats?.totalCreditsSold ?? 0} créditos comercializados
          </p>
        </Card>

        {/* Pedidos Pendentes */}
        <Card className={`rounded-3xl border-border/70 bg-card p-5 shadow-soft ${
          (stats?.pendingOrdersCount ?? 0) > 0 ? "border-amber-500/50 bg-amber-500/5" : ""
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pedidos Pendentes
            </p>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-amber-600">
            {loadingStats ? <Skeleton className="h-8 w-16" /> : stats?.pendingOrdersCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aguardam confirmação M-Pesa / e-Mola
          </p>
        </Card>

        {/* Total Utilizadores */}
        <Card className="rounded-3xl border-border/70 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Utilizadores Registados
            </p>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Users className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">
            {loadingStats ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Contas com perfil ativo</p>
        </Card>

        {/* Documentos Criados */}
        <Card className="rounded-3xl border-border/70 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documentos Gerados
            </p>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <FileText className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">
            {loadingStats ? <Skeleton className="h-8 w-16" /> : stats?.totalDocuments ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats?.totalCreditsConsumed ?? 0} créditos consumidos
          </p>
        </Card>
      </div>

      {/* Abas Principais de Gestão */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-12 w-full justify-start rounded-2xl bg-card border border-border/60 p-1.5 gap-1.5 sm:w-auto">
          <TabsTrigger value="orders" className="rounded-xl px-4 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Coins className="size-3.5" />
            Pedidos de Créditos
            {(stats?.pendingOrdersCount ?? 0) > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {stats?.pendingOrdersCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-4 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="size-3.5" />
            Utilizadores & Saldos
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl px-4 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="size-3.5" />
            Documentos Globais
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PEDIDOS DE CRÉDITO */}
        <TabsContent value="orders" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filtros de Status */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                className="rounded-xl text-xs gap-1.5"
              >
                <Clock className="size-3.5" />
                Pendentes
                {(stats?.pendingOrdersCount ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {stats?.pendingOrdersCount}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "paid" ? "default" : "outline"}
                onClick={() => setStatusFilter("paid")}
                className="rounded-xl text-xs gap-1.5"
              >
                <CheckCircle2 className="size-3.5" />
                Aprovados
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "rejected" ? "default" : "outline"}
                onClick={() => setStatusFilter("rejected")}
                className="rounded-xl text-xs gap-1.5"
              >
                <XCircle className="size-3.5" />
                Rejeitados
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="rounded-xl text-xs"
              >
                Todos
              </Button>
            </div>

            {/* Caixa de Pesquisa */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por email, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Lista / Tabela de Pedidos */}
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
            {loadingOrders ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <Coins className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-3 font-display font-semibold">Nenhum pedido encontrado</p>
                <p className="text-xs text-muted-foreground">
                  {statusFilter === "pending"
                    ? "Não há pedidos pendentes de aprovação no momento."
                    : "Nenhum registo corresponde aos filtros aplicados."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Referência</th>
                      <th className="py-3.5 px-4 font-semibold">Cliente</th>
                      <th className="py-3.5 px-4 font-semibold">Créditos</th>
                      <th className="py-3.5 px-4 font-semibold">Valor</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Nota / Comprovativo</th>
                      <th className="py-3.5 px-4 font-semibold">Data</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredOrders.map((order) => {
                      const meta = orderStatusMeta(order.status);
                      const isPending = order.status === "pending";
                      return (
                        <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                            {orderReference(order.id)}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-foreground">
                              {order.profile?.full_name || "Sem nome"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {order.profile?.email || order.user_id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-primary">
                              +{order.credits} cr
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            {formatMzn(order.amount_mzn)}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant="outline"
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                                order.status === "paid"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                  : order.status === "pending"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                                  : "border-muted-foreground/30 bg-muted text-muted-foreground"
                              }`}
                            >
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px]">
                            {order.payer_note ? (
                              <p className="truncate text-foreground font-mono bg-muted/60 px-2 py-1 rounded-md" title={order.payer_note}>
                                {order.payer_note}
                              </p>
                            ) : (
                              <span className="text-muted-foreground italic">Sem nota</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString("pt-MZ", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 text-[11px] font-semibold text-white"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActionType("approve");
                                  }}
                                >
                                  <CheckCircle2 className="mr-1 size-3.5" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-lg px-2 text-[11px] text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActionType("reject");
                                  }}
                                >
                                  <XCircle className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {order.status === "paid" ? "Creditado" : "Concluído"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 2: UTILIZADORES & SALDOS */}
        <TabsContent value="users" className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
            {loadingUsers ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Nome</th>
                      <th className="py-3.5 px-4 font-semibold">Email</th>
                      <th className="py-3.5 px-4 font-semibold">País</th>
                      <th className="py-3.5 px-4 font-semibold">Saldo Atual</th>
                      <th className="py-3.5 px-4 font-semibold">Data de Registo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {(usersList ?? []).map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {u.full_name || "Sem nome"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                            {u.country || "MZ"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-primary font-display">
                            {u.balance} créditos
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString("pt-MZ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 3: DOCUMENTOS GLOBAIS */}
        <TabsContent value="documents" className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
            {loadingDocs ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Título</th>
                      <th className="py-3.5 px-4 font-semibold">Tipo</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Créditos Gastos</th>
                      <th className="py-3.5 px-4 font-semibold">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {(documentsList ?? []).map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground max-w-xs truncate">
                          {doc.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className="rounded-md text-[10px]">
                            {doc.doc_type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="outline"
                            className={`rounded-md text-[10px] ${
                              doc.status === "ready"
                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                : doc.status === "generating"
                                ? "border-blue-500/30 text-blue-600 bg-blue-500/10"
                                : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold">
                          {doc.credits_spent} cr
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString("pt-MZ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG DE CONFIRMAÇÃO PARA APROVAÇÃO */}
      <Dialog open={actionType === "approve" && Boolean(selectedOrder)} onOpenChange={() => setActionType(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Aprovar Pedido de Créditos
            </DialogTitle>
            <DialogDescription>
              Tem a certeza de que deseja creditar a conta deste utilizador após confirmar o recebimento do valor?
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referência:</span>
                <span className="font-mono font-bold">{orderReference(selectedOrder.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold">{selectedOrder.profile?.full_name || selectedOrder.profile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créditos a depositar:</span>
                <span className="font-bold text-primary">+{selectedOrder.credits} créditos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor pago:</span>
                <span className="font-bold">{formatMzn(selectedOrder.amount_mzn)}</span>
              </div>
              {selectedOrder.payer_note && (
                <div className="border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Nota do pagador:</span>
                  <p className="mt-1 font-mono font-semibold bg-background p-2 rounded-lg border border-border/60">
                    {selectedOrder.payer_note}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActionType(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={approveMutation.isPending}
              onClick={() => {
                if (selectedOrder) {
                  approveMutation.mutate(selectedOrder.id);
                }
              }}
            >
              {approveMutation.isPending ? "A creditar..." : "Confirmar & Depositar Créditos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CONFIRMAÇÃO PARA REJEIÇÃO */}
      <Dialog open={actionType === "reject" && Boolean(selectedOrder)} onOpenChange={() => setActionType(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg text-destructive">
              <XCircle className="size-5" />
              Rejeitar Pedido
            </DialogTitle>
            <DialogDescription>
              O pedido será marcado como rejeitado e nenhum crédito será adicionado.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="rounded-2xl bg-muted/40 p-4 text-xs space-y-2">
              <p>
                Pedido: <strong>{orderReference(selectedOrder.id)}</strong> de{" "}
                <strong>{selectedOrder.profile?.full_name || selectedOrder.profile?.email}</strong>
              </p>
              <p>Valor: {formatMzn(selectedOrder.amount_mzn)} ({selectedOrder.credits} créditos)</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActionType(null)} className="rounded-xl">
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-semibold"
              disabled={rejectMutation.isPending}
              onClick={() => {
                if (selectedOrder) {
                  rejectMutation.mutate(selectedOrder.id);
                }
              }}
            >
              {rejectMutation.isPending ? "A rejeitar..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
