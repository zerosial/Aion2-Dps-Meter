import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { FontApplier } from "@/components/FontApplier";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { injectMockDpsData } from "./utils/mockDpsData";
// injectMockDpsData();

if ((window as any).javaBridge) {
  const originalError = console.error;
  console.error = (...args) => {
    (window as any).javaBridge.log?.("[ERROR] " + args.join(" "));
    originalError(...args);
  };
  const originalLog = console.log;
  console.log = (...args) => {
    (window as any).javaBridge.log?.(args.join(" "));
    originalLog(...args);
  };
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={150}>
      <FontApplier />
      <App />
    </TooltipProvider>
  </StrictMode>,
);
