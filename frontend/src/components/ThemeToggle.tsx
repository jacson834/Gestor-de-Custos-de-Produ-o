
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/ThemeProvider"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // This ensures the toggle reflects the actual theme, even when 'system' is set.
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-colors ${
          isDark ? "text-muted-foreground" : "text-foreground"
        }`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-colors ${
          isDark ? "text-foreground" : "text-muted-foreground"
        }`}
      />
    </div>
  )
}
