import { Outlet } from "react-router-dom";
import { StickerTabBar } from "./StickerTabBar";
import { PullToRefresh } from "./PullToRefresh";

export function TabLayout() {
  return (
    <>
      <PullToRefresh>
        <Outlet />
      </PullToRefresh>
      <StickerTabBar />
    </>
  );
}
