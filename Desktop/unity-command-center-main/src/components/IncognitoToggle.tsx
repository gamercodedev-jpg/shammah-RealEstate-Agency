import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function IncognitoToggle() {
  const { incognito, setIncognito } = useTheme();

  return (
    <Button
      variant={incognito ? "secondary" : "ghost"}
      size="icon"
      onClick={() => setIncognito(!incognito)}
      className="relative overflow-hidden"
      aria-pressed={incognito}
    >
      {incognito ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle incognito mode</span>
    </Button>
  );
}

export default IncognitoToggle;
