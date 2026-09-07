import type { APIRoute } from "astro";
import { createAstroSupabase } from "@/lib/supabase";
import { buildSearchIndex } from "@/lib/ux/search";

export const GET: APIRoute = async (context) => {
  const supabase = createAstroSupabase(context);

  const [playersRes, matchesRes, fieldsRes] = await Promise.all([
    supabase
      .from("view_player_stats_all_time")
      .select("player_id, nickname, matches_played")
      .eq("is_guest", false)
      .order("nickname"),
    supabase
      .from("matches")
      .select("id, date, result, fields(name)")
      .order("date", { ascending: false })
      .limit(50),
    supabase
      .from("fields")
      .select("id, name, city")
      .order("name"),
  ]);

  if (playersRes.error || matchesRes.error || fieldsRes.error) {
    const error =
      playersRes.error?.message ||
      matchesRes.error?.message ||
      fieldsRes.error?.message ||
      "Internal server error";

    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const searchIndex = buildSearchIndex(
    (playersRes.data || []).map((p: any) => ({
      id: p.player_id,
      nickname: p.nickname,
      matches_played: p.matches_played,
    })),
    (matchesRes.data || []).map((m: any) => ({
      id: m.id,
      date: m.date,
      result: m.result,
      field: Array.isArray(m.fields) ? m.fields[0]?.name : m.fields?.name,
    })),
    (fieldsRes.data || []) as any,
  );

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
    },
  });
};
