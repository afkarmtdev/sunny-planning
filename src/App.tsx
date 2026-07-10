import { useEffect, useState } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { TabLayout } from "./components/TabLayout";
import { Splash } from "./screens/Splash";
import { useApp } from "./store/useApp";
import { Home } from "./screens/Home";
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

// A data router (createBrowserRouter) is required so screens can call
// useBlocker to guard unsaved edits against every kind of navigation.
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/j/:code" element={<AcceptInvite />} />
      <Route element={<RequireAuth />}>
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
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
      // sat in Recently deleted past the 30-day window.
      useApp.getState().purgeDeletedExpenses();
      finish();
    });
    // Hard ceiling so a wedged font load or (later) offline fetch never hangs.
    const ceiling = window.setTimeout(finish, SPLASH_MAX_MS);
    return () => window.clearTimeout(ceiling);
  }, []);

  if (!ready) return <Splash />;
  return <RouterProvider router={router} />;
}

export default function App() {
  return <Boot />;
}
