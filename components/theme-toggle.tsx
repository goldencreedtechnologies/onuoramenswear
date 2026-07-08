"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/components/theme-provider";
import { cn } from "@/lib/cn";

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor }
] as const;

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  return (
    <div className="flex rounded-full border border-gold/25 bg-panel-muted/60 p-1" aria-label="Theme setting">
      {modes.map((item) => (
        <button
          key={item.value}
          className={cn(
            "gold-focus inline-flex h-8 w-8 items-center justify-center rounded-full text-copy-muted transition hover:text-gold",
            mode === item.value && "bg-gold text-obsidian shadow-sm hover:text-obsidian"
          )}
          type="button"
          onClick={() => setMode(item.value)}
          aria-label={`Use ${item.label} mode`}
          title={`${item.label} mode`}
        >
          <item.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
