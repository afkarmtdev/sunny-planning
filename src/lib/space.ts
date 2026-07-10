// Resolving which space a signed-in user syncs against.
//
// Every user has at least a "space of one". Arriving through an invite link joins
// the inviter's space instead. The AcceptInvite screen stashes the invite code
// here (it cannot join until the user is authenticated); the resolver consumes it
// on the next authenticated boot, then falls back to ensure_solo_space.
//
// Both writes go through security-definer RPCs (see 0003) because a brand-new
// user is not yet a member of anything and so cannot touch the tables directly.

import { supabase } from "./supabase";

const PENDING_INVITE_KEY = "sunny-pending-invite";

/** Remember an invite code to redeem once the user is signed in. */
export function stashPendingInvite(code: string): void {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, code);
  } catch {
    // Storage unavailable; the invite is simply not remembered.
  }
}

function takePendingInvite(): string | null {
  try {
    const code = localStorage.getItem(PENDING_INVITE_KEY);
    if (code) localStorage.removeItem(PENDING_INVITE_KEY);
    return code;
  } catch {
    return null;
  }
}

/**
 * Return the space id this user should sync. Redeems a stashed invite first (join
 * the inviter's space), otherwise ensures a solo space exists. Returns null only
 * if Supabase is unconfigured or the caller is not authenticated.
 */
export async function resolveSpaceId(): Promise<string | null> {
  if (!supabase) return null;

  const code = takePendingInvite();
  if (code) {
    const { data, error } = await supabase.rpc("accept_invite", { p_code: code });
    if (!error && typeof data === "string") return data;
    // A bad or expired code falls through to a solo space rather than blocking.
    if (error) console.error("accept_invite failed", error.message);
  }

  const { data, error } = await supabase.rpc("ensure_solo_space");
  if (error) {
    console.error("ensure_solo_space failed", error.message);
    return null;
  }
  return typeof data === "string" ? data : null;
}
