import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/admin/session";

/**
 * Gate and de-index `/admin`.
 *
 * This is the file Next 16 calls `proxy.ts`; `middleware.ts` is the
 * deprecated name for the same convention, renamed upstream to make the
 * network boundary explicit (`node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/proxy.md`). The runtime is Node, which
 * is what lets the HMAC verification below run here at all.
 *
 * Two jobs:
 *
 * 1. Anything under `/admin` except the login page needs a valid session
 *    cookie, or it redirects to the login page carrying a `next` parameter.
 * 2. Every `/admin` response — login page included — carries
 *    `X-Robots-Tag: noindex, nofollow`, so the panel cannot be indexed even
 *    if a URL leaks.
 *
 * Note the matcher covers Server Function POSTs to `/admin/*` too, since
 * those are requests to the page's own route. That is a backstop, not the
 * guarantee: every action re-checks the session through `requireOperator()`,
 * per the Data Security guidance in the proxy docs.
 */

const NOINDEX = "noindex, nofollow, noarchive, nosnippet";

function noindex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", NOINDEX);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin/login") {
    return noindex(NextResponse.next());
  }

  // Without a password configured there is nothing to authenticate against.
  // Let the request through so `/admin` can render its setup screen, which is
  // the only useful thing it could show.
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    return noindex(NextResponse.next());
  }

  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value, password);
  if (session) {
    return noindex(NextResponse.next());
  }

  // An API caller wants a status code, not a login page.
  if (pathname.startsWith("/api/admin")) {
    return noindex(
      NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", `${pathname}${search}`);
  }

  const redirect = noindex(NextResponse.redirect(loginUrl));
  // Clear a cookie that failed verification so the browser stops sending it.
  if (request.cookies.has(SESSION_COOKIE)) {
    redirect.cookies.delete(SESSION_COOKIE);
  }
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
