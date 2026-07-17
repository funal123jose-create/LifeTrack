import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full bg-background antialiased">
        <AppSidebar />

        <main className="min-h-screen w-full">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
