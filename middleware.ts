import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isHome = pathname.startsWith("/home");
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!isHome && !isOnboarding) return NextResponse.next();

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileErr } = await supabase
  .from("profile")
  .select("identity_statement, onboarding_complete")
  .eq("user_id", user.id)
  .maybeSingle();

// Fail closed into onboarding (and avoid infinite weirdness)
if (profileErr) {
  const url = req.nextUrl.clone();
  url.pathname = "/onboarding";
  return NextResponse.redirect(url);
}

  const hasIdentity = Boolean(profile?.identity_statement?.trim());
  const onboardingComplete = Boolean(profile?.onboarding_complete);
  const ready = hasIdentity && onboardingComplete;

  if (isHome && !ready) {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  if (isOnboarding && ready) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/home/:path*", "/onboarding/:path*"],
};
