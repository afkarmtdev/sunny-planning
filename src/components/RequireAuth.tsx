import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { resolveSpaceId } from "../lib/space";
import { startSync, stopSync } from "../lib/sync";
import { LoadingOverlay } from "./LoadingOverlay";

type Phase = "checking" | "resolving" | "ready" | "error" | "signedout";

/**
 * With Supabase configured this gates the app behind a session (magic link) and
 * boots coop sync: resolve the user's space, do the initial fetch into the store,
 * and subscribe to partner changes. The subtree stays behind a loading state
 * until that first sync completes, so seeded/stale local data never flashes.
 * Without Supabase the app runs in local demo mode and everything is open.
 */
export function RequireAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>(isSupabaseConfigured ? "checking" : "ready");
  // The user id we have already booted sync for, so repeated auth events (and
  // Supabase's INITIAL_SESSION + SIGNED_IN pair) do not re-resolve or re-sync.
  const bootedFor = useRef<string | null>(null);

  const boot = useCallback(async (s: Session | null) => {
    setSession(s);
    if (!s) {
      stopSync();
      bootedFor.current = null;
      setPhase("signedout");
      return;
    }
    if (bootedFor.current === s.user.id) {
      setPhase("ready");
      return;
    }
    bootedFor.current = s.user.id;
    setPhase("resolving");
    try {
      const spaceId = await resolveSpaceId();
      if (!spaceId) throw new Error("no space");
      await startSync(spaceId);
      setPhase("ready");
    } catch (err) {
      bootedFor.current = null;
      console.error("space sync boot failed", err);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) void boot(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!cancelled) void boot(s);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [boot]);

  if (!isSupabaseConfigured) return <Outlet />;
  if (phase === "signedout") return <Navigate to="/login" replace />;
  if (phase === "error") {
    return (
      <LoadingOverlay
        mode="fullscreen"
        caption="syncing your space..."
        error="Could not load your space. Check your connection and try again."
        onRetry={() => void boot(session)}
        delayMs={0}
      />
    );
  }
  if (phase !== "ready") {
    return <LoadingOverlay mode="fullscreen" caption="syncing your space..." delayMs={0} />;
  }
  return <Outlet />;
}
