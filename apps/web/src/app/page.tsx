"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import Header from "@/components/header";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [eventDetails, setEventDetails] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (selectedDate) {
      fetchEventDetails(selectedDate);
    } else {
      setEventDetails(null);
      setShowForm(false);
    }
  }, [selectedDate]);

  if (status === "loading") return <div className="text-center">Cargando sesión...</div>;
  if (!session) return null;

  const fetchEventDetails = async (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const response = await fetch(`/api/events?date=${formattedDate}`);
      const result = await response.json();
      if (response.ok && result.data) {
        setEventDetails(result.data);
        setShowForm(false);
      } else {
        setEventDetails(null);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setEventDetails(null);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedDate) return;

    const eventData = {
      userId: session.user.id,
      title: `Cita para ${data.name}`,
      description: `Motivo: ${data.reason}. Contacto: ${data.email}`,
      date: selectedDate.toISOString(),
    };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al crear el evento");

      addToast({
        title: "Evento Creado",
        description: `Tu cita ha sido agendada para el ${format(selectedDate, "PPP")}.`,
      });

      reset();
      setShowForm(false);
      fetchEventDetails(selectedDate);
    } catch (error: any) {
      console.error("Error creating event:", error);
      addToast({
        title: "Error",
        description: error.message || "Error al crear el evento",
        variant: "destructive",
      });
    }
  };

  return (
    <ToastProvider>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background text-foreground p-6">
        <div className="w-full max-w-2xl p-4 border rounded-lg shadow-md bg-card">
          <h2 className="text-lg font-semibold mb-2">Selecciona una fecha:</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            className="rounded-md border"
          />
          {selectedDate && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Fecha seleccionada: <strong>{format(selectedDate, "PPP")}</strong>
            </p>
          )}

          {eventDetails ? (
            <div className="mt-4 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Detalles del Evento</h3>
              <p><strong>Título:</strong> {eventDetails.title}</p>
              <p><strong>Motivo:</strong> {eventDetails.description}</p>
              <p><strong>Usuario:</strong> {eventDetails.user?.name}</p>
            </div>
          ) : selectedDate ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full max-w-2xl mt-4">Crear Evento</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Crear Nuevo Evento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Completa el formulario para agendar un evento en esta fecha.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input {...register("name")} id="name" placeholder="Tu nombre" />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input {...register("email")} id="email" type="email" placeholder="correo@example.com" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
                  </div>
                  <div>
                    <Label htmlFor="reason">Motivo de la cita</Label>
                    <Input {...register("reason")} id="reason" placeholder="Ej. Consulta médica" />
                    {errors.reason && <p className="text-red-500 text-sm">{errors.reason.message?.toString()}</p>}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button type="submit">Confirmar Cita</Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </main>
    </ToastProvider>
  );
}
