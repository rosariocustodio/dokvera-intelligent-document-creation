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
        .select("id, full_name, email, avatar_url, phone, institution, onboarded_at")
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
