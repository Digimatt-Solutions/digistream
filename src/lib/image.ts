// Client-side image compression using canvas. Returns a compressed JPEG Blob
// scaled to fit within maxDim and encoded at the given quality.
export async function compressImage(
  file: File,
  opts: { maxDim?: number; quality?: number; mimeType?: string } = {},
): Promise<Blob> {
  const { maxDim = 1600, quality = 0.82, mimeType = "image/jpeg" } = opts;
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(async () => {
    // Fallback for browsers/format edge cases
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    URL.revokeObjectURL(url);
    return img as unknown as ImageBitmap;
  });

  const w = (bitmap as ImageBitmap).width || (bitmap as HTMLImageElement).naturalWidth;
  const h = (bitmap as ImageBitmap).height || (bitmap as HTMLImageElement).naturalHeight;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, cw, ch);
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b ?? file), mimeType, quality),
  );
  return blob;
}
