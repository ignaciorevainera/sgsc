import { defineMiddleware } from "astro:middleware";
import { createAstroSupabase } from "@/lib/supabase";
import { isSameOrigin } from "@/lib/utils/csrf";

const PROTECTED_PREFIXES = ["/admin"];
const CSRF_PROTECTED_PREFIXES = ["/admin", "/api/auth/signout"];

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const supabase = createAstroSupabase(context);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );

  if (isProtectedRoute && !user) {
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
