import { Outlet } from "react-router-dom";
import { StickerTabBar } from "./StickerTabBar";

export function TabLayout() {
  return (
    <>
      <Outlet />
      <StickerTabBar />
    </>
  );
}
