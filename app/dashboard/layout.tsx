import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar"
import { StarredProvider } from "@/features/dashboard/context/starred-context"
import { getAllPlaygroundForUser } from "@/features/playground/actions"
import type React from "react"

// Define the type for playground data returned by getAllPlaygroundForUser
type PlaygroundWithRelations = {
  id: string
  title: string
  description: string | null
  template: 'REACT' | 'NEXTJS' | 'EXPRESS' | 'VUE' | 'HONO' | 'ANGULAR'
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: 'ADMIN' | 'USER' | 'PREMIUM_USER'
    createdAt: Date
    updatedAt: Date
  }
  Starmark: {
    isMarked: boolean
  }[]
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const playgroundData = await getAllPlaygroundForUser()

  // Store icon names (strings) instead of the components themselves
  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  }

  const formattedPlaygroundData =
    playgroundData?.map((item: PlaygroundWithRelations) => ({
      id: item.id,
      name: item.title,
      starred: item.Starmark?.[0]?.isMarked || false,
      // Pass the icon name as a string
      icon: technologyIconMap[item.template] || "Code2", // Default to "Code2" if template not found
    })) || []

  return (
    <SidebarProvider>
      <StarredProvider initialPlaygroundData={formattedPlaygroundData}>
        <div className="flex min-h-screen w-full overflow-x-hidden">
          {/* Pass the formatted data with string icon names */}
          <DashboardSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </StarredProvider>
    </SidebarProvider>
  )
}
