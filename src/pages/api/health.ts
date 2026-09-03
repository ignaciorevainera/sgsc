import type { APIRoute } from "astro";
import { createAstroSupabase } from "@/lib/supabase";

export const GET: APIRoute = async (context) => {
  const supabase = createAstroSupabase(context);
  const startTime = Date.now();

  const { error } = await supabase
    .from("players")
    .select("id")
    .limit(1);

  const latencyMs = Date.now() - startTime;

  if (error) {
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({ status: "healthy", latencyMs }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
};
