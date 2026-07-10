import { useEffect, useState } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { RequireOnboarded } from "./components/RequireOnboarded";
import { TabLayout } from "./components/TabLayout";
import { Splash } from "./screens/Splash";
import { useApp } from "./store/useApp";
import { Home } from "./screens/Home";
import { Onboarding } from "./screens/Onboarding";
import { Settings } from "./screens/Settings";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { PlanList } from "./screens/PlanList";
import { ItineraryBuilder } from "./screens/ItineraryBuilder";
import { DayOf } from "./screens/DayOf";
import { Costs } from "./screens/Costs";
import { Album } from "./screens/Album";
import { Ratings } from "./screens/Ratings";
import { ExportPicker } from "./screens/ExportPicker";
import { Login } from "./screens/Login";
import { Invite } from "./screens/Invite";
import { AcceptInvite } from "./screens/AcceptInvite";
import { PrintView } from "./print/PrintView";
import { OfflineBanner } from "./components/OfflineBanner";
import { AppErrorBoundary, RouteError } from "./components/ErrorBoundary";

// A data router (createBrowserRouter) is required so screens can call
// useBlocker to guard unsaved edits against every kind of navigation.
// The pathless root route carries the errorElement so a render error in any
// screen falls through to the themed ErrorScreen instead of a blank page.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<RouteError />}>
      <Route path="/login" element={<Login />} />
      <Route path="/j/:code" element={<AcceptInvite />} />
      <Route element={<RequireAuth />}>
        <Route path="/welcome" element={<Onboarding />} />
        <Route element={<RequireOnboarded />}>
          <Route element={<TabLayout />}>
            <Route index element={<Home />} />
            <Route path="plan" element={<PlanList />} />
            <Route path="plan/:id" element={<ItineraryBuilder />} />
            <Route path="today" element={<DayOf />} />
            <Route path="costs" element={<Costs />} />
            <Route path="album" element={<Album />} />
            <Route path="ratings" element={<Ratings />} />
          </Route>
          <Route path="plan/:id/export" element={<ExportPicker />} />
          <Route path="invite" element={<Invite />} />
          <Route path="print/:id" element={<PrintView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

// How long the splash is guaranteed to show, and the ceiling it never exceeds.
// The real auth-aware routing and timeout-to-Login behavior land with Supabase
// in Milestone 4; for now Boot just waits for store hydration and fonts, then
// reveals the router (RequireAuth still decides Home vs Login).
const SPLASH_MIN_MS = 900;
const SPLASH_MAX_MS = 5000;

function Boot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - start));
      window.setTimeout(() => setReady(true), wait);
    };

    const hydrated = useApp.persist.hasHydrated()
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          const unsub = useApp.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
        });
    const fonts = document.fonts?.ready ?? Promise.resolve();

    void Promise.all([hydrated, fonts]).then(() => {
      // Once the persisted store is in memory, hard-purge expenses that have
      // sat in Recently deleted past the 30-day window, and drop in the
      // suggested birthday date if we are inside its lead-up window.
      useApp.getState().purgeDeletedExpenses();
      useApp.getState().ensureBirthdaySuggestion();
      // Fire the OS "date today" reminder if the user opted in and one is due.
      useApp.getState().notifyTodayIfDue();
      finish();
    });
    // Hard ceiling so a wedged font load or (later) offline fetch never hangs.
    const ceiling = window.setTimeout(finish, SPLASH_MAX_MS);

    // Re-check the "date today" reminder whenever the app is brought back to the
    // foreground, so it can fire on wake, not just cold start.
    const onVisible = () => {
      if (document.visibilityState === "visible") useApp.getState().notifyTodayIfDue();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(ceiling);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!ready) return <Splash />;
  return (
    <>
      <RouterProvider router={router} />
      <OfflineBanner />
      <UpdatePrompt />
    </>
  );
}

export default function App() {
  // Outermost net: catches render errors thrown outside the router (Boot,
  // Splash) that the router's errorElement never sees.
  return (
    <AppErrorBoundary>
      <Boot />
    </AppErrorBoundary>
  );
}
