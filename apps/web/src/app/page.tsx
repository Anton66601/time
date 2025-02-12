"use client"; // Aseguramos que sea un Client Component

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { ThemeToggle } from "@/components/theme-toggle";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastProvider } from "@/components/ui/toaster"; // Asegúrate de que se exporta correctamente

// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Ingrese un correo válido"),
  reason: z.string().min(3, "El motivo de la cita es obligatorio"),
});

export default function Home() {
  const { addToast } = useToast(); // Corregimos `toast` por `addToast`
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

  // Manejador de envío del formulario
  const onSubmit = (data: any) => {
    if (!selectedDate) {
      addToast({
        title: "Error",
        description: "Por favor, selecciona una fecha antes de enviar el formulario.",
        variant: "destructive",
      });
      return;
    }

    addToast({
      title: "Cita Agendada",
      description: `Tu cita con ${data.name} ha sido agendada para el ${format(selectedDate, "PPP")}.`,
    });

    // Reiniciar formulario y ocultar
    reset();
    setShowForm(false);
  };

  return (
    <ToastProvider> {/* Envuelve toda la app con el ToastProvider */}
      <main className="flex min-h-screen items-center justify-center flex-col gap-6 bg-background text-foreground p-6">
        {/* Encabezado con el botón de cambio de tema */}
        <div className="flex justify-between items-center w-full max-w-2xl">
          <h1 className="text-2xl font-bold">Modo Oscuro con ShadCN</h1>
          <ThemeToggle />
        </div>

        {/* Alerta de información */}
        <Alert className="max-w-2xl">
          <Info className="h-5 w-5" />
          <AlertTitle>¡Bienvenido a ShadCN!</AlertTitle>
          <AlertDescription>
            Aquí puedes encontrar componentes accesibles y personalizables para tu aplicación en Next.js.
          </AlertDescription>
        </Alert>

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
        )}

        {/* Sección de Accordion */}
        <div className="w-full max-w-2xl">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Qué es ShadCN?</AccordionTrigger>
              <AccordionContent>
                ShadCN es una colección de componentes accesibles y altamente personalizables para React y Next.js.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Por qué usarlo?</AccordionTrigger>
              <AccordionContent>
                Ofrece integración con Tailwind CSS, accesibilidad y flexibilidad para crear interfaces modernas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Cómo instalar componentes?</AccordionTrigger>
              <AccordionContent>
                Usa el comando <code>npx shadcn add [componente]</code> para instalar nuevos componentes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </ToastProvider>
  );
}
