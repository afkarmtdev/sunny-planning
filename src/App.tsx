import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { TabLayout } from "./components/TabLayout";
import { Home } from "./screens/Home";
import { PlanIndex } from "./screens/PlanIndex";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/j/:code" element={<AcceptInvite />} />
        <Route element={<RequireAuth />}>
          <Route element={<TabLayout />}>
            <Route index element={<Home />} />
            <Route path="plan" element={<PlanIndex />} />
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
      </Routes>
    </BrowserRouter>
  );
}
