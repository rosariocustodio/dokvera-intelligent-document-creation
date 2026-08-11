import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo escuro"}
      className="rounded-xl text-muted-foreground hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
