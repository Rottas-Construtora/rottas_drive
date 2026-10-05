import { Link, useLocation } from "react-router-dom";
import { Building2, Star, User, Trash2, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { StorageGauge } from "@/components/StorageGauge";
import { useAuthContext } from "@/components/AuthProvider";
import logo from "@/assets/logo.png";

const baseMenuItems = [
  { title: "Coleções", url: "/home", icon: Building2 },
  { title: "Favoritos", url: "/favoritos", icon: Star },
  { title: "Lixeira", url: "/lixeira", icon: Trash2 },
  { title: "Perfil", url: "/perfil", icon: User },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuthContext();

  const menuItems = isAdmin
    ? [...baseMenuItems.slice(0, 3), { title: "Admin", url: "/admin", icon: Shield }, baseMenuItems[3]]
    : baseMenuItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-2 py-4 group-data-[collapsible=icon]:!px-0">
        <div className="flex items-center gap-3 overflow-hidden justify-center">
          <img
            src={logo}
            alt="Rottas Drive"
            className="h-7 w-7 object-contain shrink-0 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
          />
          <span
            className="text-base font-bold tracking-tight truncate group-data-[collapsible=icon]:hidden"
            style={{ color: "#979798" }}
          >
            Rottas Drive
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup className="group-data-[collapsible=icon]:!px-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2 group-data-[collapsible=icon]:!px-0">
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url === "/home" && location.pathname === "/") ||
                  (item.url !== "/home" && location.pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.url}>
                    <Link
                      to={item.url}
                      title={item.title}
                      className={`
                        flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all min-w-0
                        group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:mx-auto
                        ${isActive
                          ? "bg-[#EEEFF4] text-gray-700"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}
                      `}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 group-data-[collapsible=icon]:hidden">
        <StorageGauge />
      </SidebarFooter>
    </Sidebar>
  );
}
