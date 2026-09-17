import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://niqvmzkbpgskdbiricra.supabase.co";
const SUPABASE_KEY = "sb_publishable_ntAmIGpqgdPRda418iugiA_xx3Bibbs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const email = "rosariocustodio006@gmail.com";
  const password = "R@sitinh0";

  console.log(`Testando login para ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log("Resultado login:", {
    user: data?.user?.id,
    session: Boolean(data?.session),
    error: error?.message,
  });
}

main().catch(console.error);
