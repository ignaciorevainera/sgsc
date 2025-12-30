import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Esta función crea el cliente dependiendo de si estamos en el servidor o el navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función especial para usar DENTRO de los archivos .astro (Server Side)
export const createAstroSupabase = (context: any) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(
          context.request.headers.get("Cookie") ?? "",
        ).filter(
          (cookie): cookie is { name: string; value: string } =>
            cookie.value !== undefined,
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
        });
      },
    },
  });
};
