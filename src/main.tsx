import "./layers.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/silkscreen/400.css";
import "@fontsource/gaegu/400.css";
// CJK fallbacks for the zh / zh-pinyin locales; the browser lazy-loads only the
// subset ranges a page actually uses, so Latin-only screens pay almost nothing.
import "@fontsource/zcool-kuaile/400.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/ma-shan-zheng/400.css";
import "./stylex.css";
import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { seedDemoReceipt } from "./data/demoReceipt";

void seedDemoReceipt();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
