export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined") return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function writeImageToClipboardWithPromise(
  blobPromise: Promise<Blob>,
): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined") return Promise.resolve(false);
    const item = new ClipboardItem({ "image/png": blobPromise });
    return navigator.clipboard
      .write([item])
      .then(() => true)
      .catch(() => false);
  } catch {
    return Promise.resolve(false);
  }
}

export async function pngWithPadding(
  src: Blob,
  backgroundColor: string,
  paddingPx: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(src);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width + paddingPx * 2;
  canvas.height = bitmap.height + paddingPx * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-unavailable");
  ctx.fillStyle = backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, paddingPx, paddingPx);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode-failed"))), "image/png"),
  );
}
