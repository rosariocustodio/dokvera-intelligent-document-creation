import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DocumentRow = {
  id: string;
  title: string;
  doc_type: string;
  status: string;
  subject: string | null;
  content: string | null;
  instructions: string | null;
  error_message: string | null;
  options: Record<string, unknown>;
  metadata: Record<string, unknown>;
  estimated_cost: number;
  credits_spent: number;
  created_at: string;
  updated_at: string;
};

const DOC_COLUMNS =
  "id, title, doc_type, status, subject, content, instructions, error_message, options, metadata, estimated_cost, credits_spent, created_at, updated_at";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  institution: string | null;
  onboarded_at: string | null;
  country: string;
};

export type CreditTransactionRow = {
  id: string;
  kind: string;
  credits: number;
  amount_mzn: number;
  description: string | null;
  document_id: string | null;
  created_at: string;
};

export type DocumentEventRow = {
  id: string;
  document_id: string;
  event: string;
  detail: Record<string, unknown>;
  created_at: string;
};

export type CreditOrderRow = {
  id: string;
  kind: string;
  pack_id: string | null;
  credits: number;
  amount_mzn: number;
  status: string;
  created_at: string;
};

export const creditsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["credits", userId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return Number(data?.balance ?? 0);
    },
  });

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, phone, institution, onboarded_at, country")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as ProfileRow | null) ?? null;
    },
  });

export const documentsQuery = (userId: string, limit?: number) =>
  queryOptions({
    queryKey: ["documents", userId, limit ?? "all"],
    queryFn: async (): Promise<DocumentRow[]> => {
      let q = supabase
        .from("documents")
        .select(DOC_COLUMNS)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as DocumentRow[];
    },
  });

export const documentQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["document", documentId],
    queryFn: async (): Promise<DocumentRow | null> => {
      const { data, error } = await supabase
        .from("documents")
        .select(DOC_COLUMNS)
        .eq("id", documentId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as DocumentRow | null) ?? null;
    },
  });

export const documentEventsQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["document-events", documentId],
    queryFn: async (): Promise<DocumentEventRow[]> => {
      const { data, error } = await supabase
        .from("document_events")
        .select("id, document_id, event, detail, created_at")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DocumentEventRow[];
    },
  });

export const creditTransactionsQuery = (userId: string, limit = 50) =>
  queryOptions({
    queryKey: ["credit-transactions", userId, limit],
    queryFn: async (): Promise<CreditTransactionRow[]> => {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("id, kind, credits, amount_mzn, description, document_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        credits: Number(row.credits),
        amount_mzn: Number(row.amount_mzn),
      })) as CreditTransactionRow[];
    },
  });

export const creditOrdersQuery = (userId: string) =>
  queryOptions({
    queryKey: ["credit-orders", userId],
    queryFn: async (): Promise<CreditOrderRow[]> => {
      const { data, error } = await supabase
        .from("credit_orders")
        .select("id, kind, pack_id, credits, amount_mzn, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        credits: Number(row.credits),
        amount_mzn: Number(row.amount_mzn),
      })) as CreditOrderRow[];
    },
  });

export type AdminCreditOrderRow = {
  id: string;
  user_id: string;
  kind: string;
  pack_id: string | null;
  credits: number;
  amount_mzn: number;
  status: string;
  payer_note: string | null;
  provider: string | null;
  provider_reference: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  country: string;
  phone: string | null;
  created_at: string;
  balance: number;
};

export type AdminDocumentRow = {
  id: string;
  user_id: string;
  title: string;
  doc_type: string;
  status: string;
  credits_spent: number;
  created_at: string;
  updated_at: string;
};

export const isAdminQuery = (userId?: string | null, email?: string | null) =>
  queryOptions({
    queryKey: ["is-admin", userId, email],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;
      const normalizedEmail = email?.toLowerCase().trim();
      if (normalizedEmail === "rosariocustodio006@gmail.com") return true;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        // Fallback for safety in dev
        return normalizedEmail === "rosariocustodio006@gmail.com";
      }
      return Boolean(data);
    },
  });

export const adminCreditOrdersQuery = (statusFilter?: string | null) =>
  queryOptions({
    queryKey: ["admin-credit-orders", statusFilter ?? "all"],
    queryFn: async (): Promise<AdminCreditOrderRow[]> => {
      let query = supabase
        .from("credit_orders")
        .select(`
          id, user_id, kind, pack_id, credits, amount_mzn, status,
          payer_note, provider, provider_reference, reviewed_by, reviewed_at,
          created_at, updated_at
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch corresponding user profiles
      const userIds = Array.from(new Set((data ?? []).map((o) => o.user_id)));
      let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map((p) => [p.id, { full_name: p.full_name, email: p.email }])
          );
        }
      }

      return (data ?? []).map((row) => ({
        ...row,
        credits: Number(row.credits),
        amount_mzn: Number(row.amount_mzn),
        profile: profileMap[row.user_id] ?? null,
      })) as AdminCreditOrderRow[];
    },
  });

export const adminUsersQuery = () =>
  queryOptions({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, country, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (profileErr) throw profileErr;

      const userIds = (profiles ?? []).map((p) => p.id);
      let creditMap: Record<string, number> = {};

      if (userIds.length > 0) {
        const { data: credits } = await supabase
          .from("credits")
          .select("user_id, balance")
          .in("user_id", userIds);

        if (credits) {
          creditMap = Object.fromEntries(credits.map((c) => [c.user_id, Number(c.balance)]));
        }
      }

      return (profiles ?? []).map((p) => ({
        ...p,
        balance: creditMap[p.id] ?? 0,
      }));
    },
  });

export const adminDocumentsQuery = () =>
  queryOptions({
    queryKey: ["admin-documents"],
    queryFn: async (): Promise<AdminDocumentRow[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, user_id, title, doc_type, status, credits_spent, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as AdminDocumentRow[];
    },
  });

export const adminStatsQuery = () =>
  queryOptions({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [ordersRes, profilesRes, docsRes] = await Promise.all([
        supabase.from("credit_orders").select("id, status, amount_mzn, credits"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id, status, credits_spent"),
      ]);

      const orders = ordersRes.data ?? [];
      const totalRevenue = orders
        .filter((o) => o.status === "paid")
        .reduce((sum, o) => sum + Number(o.amount_mzn || 0), 0);
      const totalCreditsSold = orders
        .filter((o) => o.status === "paid")
        .reduce((sum, o) => sum + Number(o.credits || 0), 0);
      const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

      const docs = docsRes.data ?? [];
      const totalDocuments = docs.length;
      const totalCreditsConsumed = docs.reduce((sum, d) => sum + Number(d.credits_spent || 0), 0);
      const totalUsers = profilesRes.count ?? 0;

      return {
        totalRevenue,
        totalCreditsSold,
        pendingOrdersCount,
        totalUsers,
        totalDocuments,
        totalCreditsConsumed,
      };
    },
  });