// src/pages/api/auth/signout.ts
import type { APIRoute } from "astro";
import { createAstroSupabase } from "@/lib/supabase";

export const POST: APIRoute = async (context) => {
  // 1. Conectamos con Supabase usando las cookies actuales
  const supabase = createAstroSupabase(context);

  // 2. Cerramos la sesión (esto borra la cookie del navegador)
  await supabase.auth.signOut();

  // 3. Redirigimos al usuario a la página de login
  return context.redirect("/login");
};
