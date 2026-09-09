import { z } from "zod";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Sanitiza inputs HTML: "" o solo espacios -> null.
 * Preserva resto valores para validación estricta.
 */
export const emptyToNull = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

/** Coerción checkbox HTML ("on"/"true"/"1"/true -> true, resto -> false). */
export const booleanFromCheckbox = z.preprocess((v) => {
  if (v === true || v === "true" || v === "on" || v === "1" || v === 1)
    return true;
  return false;
}, z.boolean());

const optionalText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

const optionalDate = z.preprocess(
  emptyToNull,
  z.string().regex(DATE_RE, "Formato de fecha inválido (YYYY-MM-DD)").nullable().optional(),
);

const optionalUuid = z.preprocess(
  emptyToNull,
  z.uuid("Sede inválida").nullable().optional(),
);

const optionalUrl = z.preprocess(
  emptyToNull,
  z.url("URL de video inválida").nullable().optional(),
);

export const playerSchema = z.object({
  nickname: z
    .string("El apodo es obligatorio")
    .trim()
    .min(2, "El apodo es obligatorio y debe tener al menos 2 caracteres")
    .max(50, "El apodo es obligatorio y no puede superar los 50 caracteres"),
  // Campo genérico pedido en spec (compat); no se persiste directo.
  name: optionalText(100),
  first_name: optionalText(100),
  last_name: optionalText(100),
  birth_date: optionalDate,
  preferred_foot: z.preprocess((v) => {
    if (typeof v !== "string") return v;
    const t = v.trim();
    if (t === "") return null;
    if (t === "right" || t === "left" || t === "both") return t;
    // Sanitiza valores inválidos a null en lugar de fallar (compat legacy).
    return null;
  }, z.enum(["right", "left", "both"], "Pie hábil inválido").nullable().optional()),
  is_guest: booleanFromCheckbox,
});

export type PlayerInput = z.infer<typeof playerSchema>;

const uuidArrayMin1 = (msg: string) =>
  z.array(z.uuid("Jugador inválido")).min(1, msg);

export const matchSchema = z
  .object({
    date: z
      .string("Fecha obligatoria")
      .trim()
      .regex(DATE_RE, "Formato de fecha inválido"),
    field_id: optionalUuid,
    result: z.enum(["light", "dark", "draw"], "Resultado inválido"),
    light_players: uuidArrayMin1("Equipo claro incompleto"),
    dark_players: uuidArrayMin1("Equipo oscuro incompleto"),
    light_score: z.coerce.number("Puntaje inválido").int().min(0).optional(),
    dark_score: z.coerce.number("Puntaje inválido").int().min(0).optional(),
    video_url: optionalUrl,
    notes: z.preprocess(
      emptyToNull,
      z.string().trim().max(500).nullable().optional(),
    ),
  })
  .refine(
    (d) => {
      const light = new Set(d.light_players);
      return !d.dark_players.some((id) => light.has(id));
    },
    { message: "Un jugador no puede estar en ambos equipos", path: ["dark_players"] },
  );

export type MatchInput = z.infer<typeof matchSchema>;

/** Convierte FormData jugador a objeto plano validable. */
export function formDataToPlayerInput(formData: FormData): unknown {
  return {
    nickname: formData.get("nickname"),
    name: formData.get("name"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    birth_date: formData.get("birth_date"),
    preferred_foot: formData.get("preferred_foot"),
    is_guest: formData.get("is_guest"),
  };
}

/** Convierte FormData partido a objeto plano validable. Escanea keys player_*. */
export function formDataToMatchInput(formData: FormData): unknown {
  const light_players: string[] = [];
  const dark_players: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("player_")) continue;
    if (value === "light") light_players.push(key.slice("player_".length));
    else if (value === "dark") dark_players.push(key.slice("player_".length));
  }
  return {
    date: formData.get("date"),
    field_id: formData.get("field_id"),
    result: formData.get("result"),
    light_players,
    dark_players,
    light_score: formData.get("light_score") ?? undefined,
    dark_score: formData.get("dark_score") ?? undefined,
    video_url: formData.get("video_url"),
    notes: formData.get("notes"),
  };
}

/** Errores por campo (primer mensaje) para UI inline. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Errores por campo (todos mensajes) para casos avanzados. */
export function toFieldErrorsList(
  error: z.ZodError,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
