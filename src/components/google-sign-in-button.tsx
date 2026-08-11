import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.5c-.1 1.1-.8 2.7-2.3 3.8l3.5 2.7c2.1-1.9 3.8-4.8 3.8-8.5Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.7-2.9l-3.5-2.7c-1 .7-2.3 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-4.9l-4 3.1C3.2 21.3 7.3 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7A7.3 7.3 0 0 1 4.9 12c0-.9.2-1.9.4-2.7l-4-3.1A12 12 0 0 0 0 12c0 1.9.5 3.7 1.3 5.3l4-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.4-3.3C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.3 6.6l4 3.1C6.2 6.9 8.9 4.7 12 4.7Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  label = "Entrar com o Google",
  className,
  variant = "outline",
}: {
  label?: string;
  className?: string;
  variant?: "outline" | "secondary" | "default";
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signIn() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google. Tenta novamente.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Ocorreu um erro ao iniciar sessão.");
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={signIn}
      disabled={loading}
      className={cn("h-12 gap-2.5 rounded-xl px-6 text-sm font-semibold", className)}
    >
      {loading ? <Loader2 className="size-4.5 animate-spin" /> : <GoogleMark />}
      {label}
    </Button>
  );
}
