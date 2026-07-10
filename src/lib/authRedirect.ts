// Magic-link redirect handling.
//
// Supabase returns the auth result in the URL hash. A SUCCESS carries an
// access token (`#access_token=...`), which the Supabase client consumes to
// establish the session. A FAILURE (an expired or already-used link, a denied
// request) comes back as `#error=...&error_code=...&error_description=...` with
// no token, so no session is created and the app would otherwise bounce silently
// to the login form with no explanation.
//
// We capture that error ONCE, synchronously at module load, before React renders
// and the router can navigate the hash away, then strip it from the URL so a
// refresh does not replay it. Login reads it to show a themed message + resend.
// Only error hashes are touched; a token hash is left intact for Supabase.

function friendlyMessage(code: string, description: string): string {
  const text = `${code} ${description}`.toLowerCase();
  if (text.includes("expired")) {
    return "That magic link has expired. Send yourself a fresh one below.";
  }
  if (text.includes("already") || text.includes("used")) {
    return "That magic link was already used. Send yourself a fresh one below.";
  }
  return "That magic link did not work. Send yourself a fresh one below.";
}

function capture(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  if (!params.has("error") && !params.has("error_code")) return null;
  const code = params.get("error_code") ?? params.get("error") ?? "";
  const description = (params.get("error_description") ?? "").replace(/\+/g, " ");
  try {
    // Drop the hash so a reload does not re-surface the error.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch {
    // Ignore: leaving the hash only means a reload re-shows the same message.
  }
  return friendlyMessage(code, description);
}

let magicLinkError = capture();

/** The magic-link error from this page load, if any. Consumed once. */
export function takeMagicLinkError(): string | null {
  const error = magicLinkError;
  magicLinkError = null;
  return error;
}
