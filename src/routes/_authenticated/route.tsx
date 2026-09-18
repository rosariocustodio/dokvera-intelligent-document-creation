import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    
    // Block access if user is in password recovery flow
    // They must complete password reset before accessing the app
    if (typeof window !== "undefined" && sessionStorage.getItem("inPasswordRecovery") === "true") {
      throw redirect({ to: "/auth" });
    }
    
    return { user: data.user };
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
