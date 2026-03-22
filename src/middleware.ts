import { defineMiddleware } from "astro:middleware";
import { createAstroSupabase } from "@/lib/supabase";

const PROTECTED_PREFIXES = ["/admin"];
const CSRF_PROTECTED_PREFIXES = ["/admin", "/api/auth/signout"];

const isSameOrigin = (request: Request, currentOrigin: string): boolean => {
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

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const supabase = createAstroSupabase(context);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );

  if (isProtectedRoute && !session) {
    return context.redirect("/login");
  }

  if (
    context.request.method === "POST" &&
    CSRF_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))
  ) {
    if (!isSameOrigin(context.request, context.url.origin)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  return next();
});
