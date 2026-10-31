import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const pathname = request.nextUrl.pathname;

  // Fora do login: webhooks externos (Anota AI, Meta, Google) e o agendamento do Vercel,
  // que se autentica com CRON_SECRET dentro da própria rota.
  // Todo o resto — inclusive as rotas /api que leem dados — exige usuário autenticado.
  // /r/<código> é o link do relatório semanal que o cliente abre sem login (código aleatório de 64 caracteres).
  if (pathname.startsWith("/api/webhooks") || pathname === "/api/cron/sync" || pathname.startsWith("/r/")) {
    return NextResponse.next();
  }

  const isPlaceholderUrl =
    !supabaseUrl ||
    supabaseUrl.includes("your-project-id") ||
    supabaseUrl.includes("placeholder") ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes("your-anon-key") ||
    supabaseAnonKey.includes("placeholder");

  if (isPlaceholderUrl) {
    return NextResponse.next();
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLoginPage = pathname === "/login";

    if (!user && !isLoginPage) {
      // Rotas de API respondem 401 em vez de redirecionar para a página de login.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Faça login para acessar este recurso." }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    // Se não for possível validar a sessão (ex.: Supabase fora do ar ou pausado),
    // o acesso é negado — nunca liberado sem login.
    console.error("[Alien OS] Falha ao validar sessão:", err);
    if (pathname === "/login") return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Não foi possível validar sua sessão. O Supabase pode estar indisponível." },
        { status: 503 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

