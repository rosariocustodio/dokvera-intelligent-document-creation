import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://niqvmzkbpgskdbiricra.supabase.co";
const SUPABASE_KEY = "sb_publishable_ntAmIGpqgdPRda418iugiA_xx3Bibbs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("--- Diagnóstico do Banco Supabase ---");
  
  // 1. Perfis existentes
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("id, full_name, email");
  console.log("Profiles:", profiles, "Error:", pErr);

  // 2. Roles
  const { data: roles, error: rErr } = await supabase.from("user_roles").select("*");
  console.log("User Roles:", roles, "Error:", rErr);

  // 3. Credit Orders
  const { data: orders, error: oErr } = await supabase.from("credit_orders").select("*");
  console.log("Credit Orders:", orders, "Error:", oErr);

  // 4. Credits balance
  const { data: credits, error: cErr } = await supabase.from("credits").select("*");
  console.log("Credits:", credits, "Error:", cErr);

  // 5. Credit transactions
  const { data: txs, error: tErr } = await supabase.from("credit_transactions").select("*");
  console.log("Transactions:", txs, "Error:", tErr);
}

main().catch(console.error);
