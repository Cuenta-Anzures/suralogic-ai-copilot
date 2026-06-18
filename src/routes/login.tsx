import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/auth/LoginScreen";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Flux Ops AI Copilot" },
      { name: "description", content: "Acceso seguro para usuarios autorizados de Flux Ops." },
    ],
  }),
  component: LoginScreen,
});