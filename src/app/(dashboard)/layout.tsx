import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <div className="flex w-full min-h-screen bg-background antialiased">
          
          <AppSidebar />
          
          <main className="flex-1 flex flex-col min-w-0">
            {/* Header con efecto desenfoque al hacer scroll */}
            <header className="sticky top-0 z-40 h-16 w-full flex items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-[1px] bg-border/60 mx-1" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-sm font-semibold text-foreground tracking-tight">Vista General</span>
              </div>
            </header>
            
            {/* Área de Contenido */}
            <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  )
}