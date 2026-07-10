import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../store/useApp";

/**
 * Sends a brand-new user through first-time setup before they can reach the
 * app. Existing users are marked onboarded in the v6 migration, so only a fresh
 * install (or a reset) lands on /welcome. Runs after Boot has hydrated the
 * store, so `onboarded` already reflects the persisted value here.
 */
export function RequireOnboarded() {
  const onboarded = useApp((s) => s.profile.onboarded);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  return <Outlet />;
}
