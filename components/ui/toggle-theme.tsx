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
            "size-9 theme-toggle hover:bg-accent hover:text-accent-foreground",
            className
          )}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
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