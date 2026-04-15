import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/profileCard";

export const metadata = {
  title: "Dashboard - Obligence | AI-powered legal document extraction and review",
  description: "Dashboard layout",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pb-4">
      <SidebarProvider>
        <AppSidebar />

        <main className="md:flex-1 overflow-hidden relative z-0 max-w-5xl mx-auto space-y-6 justify-center p-4 md:p-5 lg:p-12 pt-5 md:pt-8 lg:pt-20 2xl:pt-28">
          <div className="flex items-center justify-between">
            <SidebarTrigger className="flex md:hidden h-full" />
          </div>
          <div className="mx-4">{children}</div>
        </main>
      </SidebarProvider>
    </main>
  );
}
