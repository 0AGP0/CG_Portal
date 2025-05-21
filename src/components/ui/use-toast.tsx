import * as React from "react";

// Simplified toast hook
export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function useToast() {
  const toast = (props: ToastProps) => {
    console.log("Toast:", props);
    // Gerçek uygulamada ekranda gösterilir
  };

  return {
    toast,
  };
} 