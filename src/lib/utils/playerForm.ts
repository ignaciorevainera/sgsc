import {
  formDataToPlayerInput,
  playerSchema,
} from "../schemas/adminSchemas";

export type PreferredFoot = "right" | "left" | "both" | null;

export interface PlayerFormData {
  nickname: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  preferred_foot: PreferredFoot;
  is_guest: boolean;
}

export const parsePlayerFormData = (formData: FormData): PlayerFormData => {
  const result = playerSchema.safeParse(formDataToPlayerInput(formData));
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first?.message || "Datos de jugador inválidos.");
  }
  return {
    nickname: result.data.nickname,
    first_name: result.data.first_name ?? null,
    last_name: result.data.last_name ?? null,
    birth_date: result.data.birth_date ?? null,
    preferred_foot: result.data.preferred_foot ?? null,
    is_guest: result.data.is_guest,
  };
};
