"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-background">
      <h2 className="font-bold text-xl">Dashboard</h2>
      <ThemeToggle />
    </header>
  );
}
