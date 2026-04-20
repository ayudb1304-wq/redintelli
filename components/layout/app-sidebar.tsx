"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Activity,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: Search },
  { label: "Briefs", href: "/briefs", icon: FileText },
  { label: "Monitoring", href: "/monitoring", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex-row items-center justify-between border-b p-0 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 font-semibold tracking-tight group-data-[collapsible=icon]:hidden"
        >
          <svg viewBox="0 0 28 28" width={20} height={20}>
            <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="14" cy="14" r="4.5" fill="currentColor" />
            <circle cx="23" cy="8" r="2.2" fill="oklch(0.88 0.2 125)" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span>RedIntelli</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
