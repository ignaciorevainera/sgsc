export type PreferredFoot = "right" | "left" | "both" | null;

export interface PlayerFormData {
  nickname: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  preferred_foot: PreferredFoot;
  is_guest: boolean;
}

const normalizeText = (value: FormDataEntryValue | null): string => {
  return value?.toString().trim() || "";
};

export const parsePlayerFormData = (formData: FormData): PlayerFormData => {
  const nickname = normalizeText(formData.get("nickname"));
  const first_name = normalizeText(formData.get("first_name"));
  const last_name = normalizeText(formData.get("last_name"));
  const birth_date = normalizeText(formData.get("birth_date"));
  const preferredFootRaw = normalizeText(formData.get("preferred_foot"));

  const preferred_foot: PreferredFoot =
    preferredFootRaw === "right" ||
    preferredFootRaw === "left" ||
    preferredFootRaw === "both"
      ? preferredFootRaw
      : null;

  return {
    nickname,
    first_name: first_name || null,
    last_name: last_name || null,
    birth_date: birth_date || null,
    preferred_foot,
    is_guest: formData.has("is_guest"),
  };
};
