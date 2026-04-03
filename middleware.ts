import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "portfolio_token";

/**
 * Verify an HS256 JWT using the Web Crypto API (Edge-compatible, no extra deps).
 * Returns true only if the signature is valid AND the token is not expired.
 */
async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // base64url → base64 → Uint8Array
    const b64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const signatureBytes = Uint8Array.from(atob(b64 + pad), (c) =>
      c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return false;

    // Check expiry
    const payloadJson = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(payloadJson);
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get(TOKEN_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  // Forward the real pathname so the server layout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // If already authenticated, bounce away from the login page
  if (isLoginPage) {
    if (token && secret && (await verifyJWT(token, secret))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // All other /admin/* routes require a valid token
  if (!token || !secret || !(await verifyJWT(token, secret))) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear an invalid/expired cookie so the browser doesn't keep sending it
    if (token) response.cookies.delete(TOKEN_NAME);
    return response;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/admin/:path*",
};
