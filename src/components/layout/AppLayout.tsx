import { ReactNode, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

// Mesmo padrão do Rottas Control (docs/design-system/navegacao.md)
const SIDEBAR_AUTO_COLLAPSE = 1050;

function SidebarAutoCollapse() {
  const { setOpen } = useSidebar();
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_AUTO_COLLAPSE}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setOpen(!e.matches);
    mql.addEventListener("change", onChange as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
  }, [setOpen]);
  return null;
}

/** Seta de recolher/expandir em cima da divisa direita do sidebar (desktop). */
function SidebarEdgeToggle() {
  const { state, toggleSidebar } = useSidebar();
  const aberto = state === "expanded";
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={aberto ? "Recolher menu" : "Expandir menu"}
      title={aberto ? "Recolher menu" : "Expandir menu"}
      className="hidden md:grid fixed top-1/2 z-30 h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/30 bg-card bg-[linear-gradient(hsl(var(--primary)/0.12),hsl(var(--primary)/0.12))] text-primary shadow-sm transition-[left] duration-100 ease-linear hover:bg-[linear-gradient(hsl(var(--primary)/0.22),hsl(var(--primary)/0.22))]"
      style={{ left: aberto ? "var(--sidebar-width)" : "var(--sidebar-width-icon)" }}
    >
      {aberto ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
    </button>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  // AppLayout remonta a cada página; o cookie guarda se o usuário recolheu o menu.
  const [defaultOpen] = useState(
    () => window.innerWidth > SIDEBAR_AUTO_COLLAPSE && !document.cookie.includes("sidebar:state=false"),
  );

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarAutoCollapse />
      {!isMobile && <AppSidebar />}
      <SidebarEdgeToggle />
      <SidebarInset className="h-screen overflow-hidden flex flex-col md:rounded-l-2xl">
        <div className={`flex-1 min-h-0 overflow-y-auto flex flex-col bg-[hsl(var(--page-bg))] ${isMobile ? "pb-20" : ""}`}>
          {children}
        </div>
      </SidebarInset>
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  );
}
