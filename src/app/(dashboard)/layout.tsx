import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContentShell } from "@/components/dashboard/dashboard-content-shell"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="dashboard-app-layout min-h-screen w-full bg-background antialiased">
        <AppSidebar />

        <main className="dashboard-app-main min-h-screen w-full">
          <DashboardContentShell>
            {children}
          </DashboardContentShell>
        </main>
      </div>
    </TooltipProvider>
  )
}
