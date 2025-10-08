import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import {UserButton} from "@clerk/nextjs";
import {TrendingDown, LayoutDashboard, Wallet, CreditCard, Calendar, BarChart3} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
                                                children,
                                              }: {
  children: React.ReactNode;
}) {
  const {userId} = await auth();

  if (!userId) {
    redirect("/");
  }

  const menuItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      href: "/dashboard/debt-sources",
      icon: Wallet,
      label: "Debt Sources"
    },
    {
      href: "/dashboard/snapshots",
      icon: Calendar,
      label: "Snapshots"
    },
    {
      href: "/dashboard/stats",
      icon: BarChart3,
      label: "Stats"
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-opacity">
              <TrendingDown className="w-6 h-6 text-primary"/>
              <span className="text-xl font-bold text-foreground">Debt-Free</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild className="h-12 text-base font-semibold">
                          <Link href={item.href}>
                            <Icon className="w-10 h-10"/>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-4">
              <SidebarTrigger className="text-foreground cursor-pointer"/>
              <UserButton/>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}