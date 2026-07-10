import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { TabLayout } from "./components/TabLayout";
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

export default function App() {
  return <RouterProvider router={router} />;
}
