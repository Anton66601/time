"use client";

import { createContext, useContext, useState } from "react";
import { Toast, ToastTitle, ToastDescription, ToastProvider, ToastViewport } from "@/components/ui/toast";

type ToastData = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  addToast: (toast: ToastData) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: ToastData) => {
    setToasts((prevToasts) => [...prevToasts, toast]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastProvider>
        {toasts.map((toast, index) => (
          <Toast key={index} variant={toast.variant}>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
