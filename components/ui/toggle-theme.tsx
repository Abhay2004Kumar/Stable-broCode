"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoSSR } from "@/components/ui/no-ssr";

function ThemeToggleComponent({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 theme-toggle hover:bg-accent hover:text-accent-foreground hover:glow-cyan transition-all duration-300 rounded-xl hover:neon-border",
            className
          )}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-cyan-400" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in glass-effect rounded-xl border-blue-400/30">
        <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-primary/10 hover:text-cyan-400 transition-all duration-300 rounded-lg">
          <Sun className="mr-2 h-4 w-4 text-cyan-400" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-primary/10 hover:text-blue-400 transition-all duration-300 rounded-lg">
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-primary/10 hover:text-purple-400 transition-all duration-300 rounded-lg">
          <Monitor className="mr-2 h-4 w-4 text-purple-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <NoSSR
      fallback={
        <Button variant="ghost" size="icon" className={cn("size-9", className)}>
          <Sun className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
    >
      <ThemeToggleComponent className={className} />
    </NoSSR>
  );
}

function SimpleThemeToggleComponent({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "size-9 theme-toggle hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Simple toggle version without dropdown (for space-constrained areas)
export function SimpleThemeToggle({ className }: { className?: string }) {
  return (
    <NoSSR
      fallback={
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-9", className)}
          disabled
        >
          <Sun className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
    >
      <SimpleThemeToggleComponent className={className} />
    </NoSSR>
  );
}