import { ReactNode } from "react";
import Header from "@/components/header"; // Asegúrate de que el alias y el nombre coincidan (por ejemplo, "header" en minúsculas si así está el archivo)

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
