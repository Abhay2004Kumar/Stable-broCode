"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Code2,
  Compass,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Plus,
  Settings,
  Star,
  Terminal,
  Zap,
  Database,
  FlameIcon,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SimpleThemeToggle } from "@/components/ui/toggle-theme"
import UserButton from "../auth/components/user-button"
import Image from "next/image"
import { useStarred } from "./context/starred-context"

// Map icon names (strings) to their corresponding LucideIcon components
const lucideIconMap: Record<string, LucideIcon> = {
  Zap: Zap,
  Lightbulb: Lightbulb,
  Database: Database,
  Compass: Compass,
  FlameIcon: FlameIcon,
  Terminal: Terminal,
  Code2: Code2, // Include the default icon
  // Add any other icons you might use dynamically
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { playgrounds, getStarredPlaygrounds } = useStarred()
  
  const starredPlaygrounds = getStarredPlaygrounds()
  const recentPlaygrounds = playgrounds

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-1 border-r glass-effect">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3 justify-center glow-blue rounded-lg">
          <Image src={"/logo.svg"} alt="logo" height={60} width={60} className="hover:scale-110 transition-transform duration-300" />
        </div>
       
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            <Star className="h-4 w-4 mr-2 text-blue-500" />
            Starred
          </SidebarGroupLabel>
          <SidebarGroupAction title="Add starred playground" className="hover:glow-cyan transition-all duration-300">
            <Plus className="h-4 w-4 text-cyan-400" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>

              {starredPlaygrounds.length === 0 && recentPlaygrounds.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 w-full">Create your playground</div>
              ) : (
                starredPlaygrounds.map((playground) => {
                  const IconComponent = lucideIconMap[playground.icon] || Code2;
                  return (
                    <SidebarMenuItem key={playground.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/playground/${playground.id}`}
                        tooltip={playground.name}
                        className="hover:neon-border hover:glow-blue transition-all duration-300"
                      >
                        <Link href={`/playground/${playground.id}`} className="group">
                          {IconComponent && <IconComponent className="h-4 w-4 text-blue-500 group-hover:text-cyan-400 transition-colors duration-300" />}
                          <span className="group-hover:text-primary transition-colors duration-300">{playground.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            <History className="h-4 w-4 mr-2 text-cyan-400" />
            Recent
          </SidebarGroupLabel>
          <SidebarGroupAction title="Create new playground" className="hover:glow-blue transition-all duration-300">
            <FolderPlus className="h-4 w-4 text-blue-500" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentPlaygrounds.length === 0 ? (
                <div className="text-center text-muted-foreground py-2 px-4 text-sm">
                  No recent playgrounds
                </div>
              ) : (
                recentPlaygrounds.slice(0, 3).map((playground) => {
                  const IconComponent = lucideIconMap[playground.icon] || Code2;
                  return (
                    <SidebarMenuItem key={playground.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/playground/${playground.id}`}
                        tooltip={playground.name}
                        className="hover:neon-border hover:glow-cyan transition-all duration-300"
                      >
                        <Link href={`/playground/${playground.id}`} className="w-full group">
                          {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0 text-cyan-400 group-hover:text-blue-500 transition-colors duration-300" />}
                          <span className="truncate group-hover:text-primary transition-colors duration-300">{playground.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 glass-effect">
        <div className="flex items-center justify-between w-full gap-2">
          <UserButton />
          <SimpleThemeToggle />
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
