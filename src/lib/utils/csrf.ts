export const isSameOrigin = (
  request: Request,
  currentOrigin: string,
): boolean => {
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    return originHeader === currentOrigin;
  }

  const refererHeader = request.headers.get("referer");
  if (!refererHeader) {
    return false;
  }

  try {
    return new URL(refererHeader).origin === currentOrigin;
  } catch {
    return false;
  }
};
