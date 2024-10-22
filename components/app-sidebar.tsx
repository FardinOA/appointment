"use client";

import * as React from "react";
import { Calendar, LayoutDashboard, Users } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { NavUser } from "./nav-user";

// This is sample data.
const data = {
    navItems: [
        { title: "Dashboard", icon: LayoutDashboard, url: "/" },
        { title: "Users", icon: Users, url: "/user" },
        { title: "Appointment", icon: Calendar, url: "/appointments" },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>Logo</SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {data.navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
