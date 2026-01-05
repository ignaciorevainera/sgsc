// src/lib/dateUtils.ts

/**
 * Convierte un string "YYYY-MM-DD" a un objeto Date seguro.
 * Le agrega las 12 del mediodía para evitar saltos de día por zona horaria.
 */
export const getSafeDate = (
  dateString: string | null | undefined,
): Date | null => {
  if (!dateString) return null;

  // Al agregar T12:00:00, aseguramos que al restar horas por UTC-3 (Argentina)
  // la fecha siga siendo la misma (ej: pasaría a ser las 09:00 AM del mismo día)
  return new Date(`${dateString}T12:00:00`);
};

/**
 * Formatea una fecha a "DD/MM/YYYY" usando la configuración local
 */
export const formatDate = (
  dateString: string,
  style: "short" | "long" = "short",
): string => {
  const date = getSafeDate(dateString);
  if (!date) return "N/A";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC", // Mantiene el fix de zona horaria
  };

  if (style === "long") {
    // Estilo para MatchCard: "Lun, 11 Abr"
    options.weekday = "short";
    options.day = "numeric";
    options.month = "short";
  } else {
    // Estilo por defecto: "11/04/2026"
    options.day = "2-digit";
    options.month = "2-digit";
    options.year = "numeric";
  }

  return date.toLocaleDateString("es-AR", options);
};

/**
 * Calcula la edad exacta basada en la fecha de nacimiento segura
 */
export const calculateAge = (dateString: string): number => {
  const birthDate = getSafeDate(dateString);
  if (!birthDate) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
