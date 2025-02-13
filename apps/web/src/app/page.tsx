// apps/web/src/app/page.tsx
"use client"; // Aseguramos que sea un Client Component

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ToastProvider } from "@/components/ui/toaster";

// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Ingrese un correo válido"),
  reason: z.string().min(3, "El motivo de la cita es obligatorio"),
});

export default function Home() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  // Configuración de react-hook-form con validaciones
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Manejador de envío del formulario que envía la petición a la API
  const onSubmit = async (data: any) => {
    if (!selectedDate) {
      addToast({
        title: "Error",
        description: "Por favor, selecciona una fecha antes de enviar el formulario.",
        variant: "destructive",
      });
      return;
    }

    // Validamos que el usuario esté autenticado y que tengamos su ID
    if (!session?.user?.id) {
      addToast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    // Construimos el objeto que enviaremos a la API
    const eventData = {
      userId: session.user.id,
      title: `Cita para ${data.name}`,
      description: `Motivo: ${data.reason}. Contacto: ${data.email}`,
      date: selectedDate.toISOString(),
    };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al crear el evento");
      }

      addToast({
        title: "Evento Creado",
        description: `Tu cita ha sido agendada para el ${format(selectedDate, "PPP")}.`,
      });

      // Reiniciar formulario y ocultar
      reset();
      setShowForm(false);
      setSelectedDate(undefined);
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Error al crear el evento",
        variant: "destructive",
      });
    }
  };

  return (
    <ToastProvider>
      <main className="flex min-h-screen items-center justify-center flex-col gap-6 bg-background text-foreground p-6">
        {/* Encabezado con el botón de cambio de tema */}
        <div className="flex justify-between items-center w-full max-w-2xl">
          <h1 className="text-2xl font-bold">Modo Oscuro con ShadCN</h1>
          <ThemeToggle />
        </div>

        {/* Sección de Calendar */}
        <div className="w-full max-w-2xl p-4 border rounded-lg shadow-md bg-card">
          <h2 className="text-lg font-semibold mb-2">Selecciona una fecha:</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setShowForm(true);
            }}
            className="rounded-md border"
          />
          {selectedDate && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Fecha seleccionada: <strong>{format(selectedDate, "PPP")}</strong>
            </p>
          )}
        </div>

        {/* Formulario que se muestra al seleccionar una fecha */}
        {showForm && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full max-w-2xl mt-4">Agendar Cita</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Agendar Cita</AlertDialogTitle>
                <AlertDialogDescription>
                  Completa el formulario para agendar tu cita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input {...register("name")} id="name" placeholder="Tu nombre" />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="correo@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reason">Motivo de la cita</Label>
                  <Input
                    {...register("reason")}
                    id="reason"
                    placeholder="Ej. Consulta médica"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm">{errors.reason.message?.toString()}</p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button type="submit">Confirmar Cita</Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </ToastProvider>
  );
}
