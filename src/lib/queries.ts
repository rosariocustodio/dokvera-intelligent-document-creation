import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DocumentRow = {
  id: string;
  title: string;
  doc_type: string;
  status: string;
  subject: string | null;
  credits_spent: number;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
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
      return data?.balance ?? 0;
    },
  });

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const documentsQuery = (userId: string, limit?: number) =>
  queryOptions({
    queryKey: ["documents", userId, limit ?? "all"],
    queryFn: async (): Promise<DocumentRow[]> => {
      let q = supabase
        .from("documents")
        .select("id, title, doc_type, status, subject, credits_spent, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DocumentRow[];
    },
  });
