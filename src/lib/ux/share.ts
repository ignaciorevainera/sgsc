export function buildShareUrl(
  type: "whatsapp" | "twitter" | "copy",
  url: string,
  text: string,
): string {
  if (type === "whatsapp") {
    return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  }
  if (type === "twitter") {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
