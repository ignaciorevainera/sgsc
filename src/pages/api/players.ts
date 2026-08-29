import type { APIRoute } from "astro";
import { createAstroSupabase } from "@/lib/supabase";

export const GET: APIRoute = async (context) => {
  const supabase = createAstroSupabase(context);

  // Auth check explícito para API (middleware redirige HTML, pero API necesita JSON 401)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, nickname, is_guest")
    .eq("is_active", true)
    .order("is_guest", { ascending: true })
    .order("nickname", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
};
