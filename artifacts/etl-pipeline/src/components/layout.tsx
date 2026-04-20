import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Activity, Menu, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: healthData, isError: healthError } = useHealthCheck();

  const isHealthy = healthData?.status === "ok" && !healthError;

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Results", href: "/results", icon: Activity },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="w-6 h-6 rounded-sm bg-primary" />
          <span>S-ETL</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
                <div className="w-6 h-6 rounded-sm bg-primary" />
                <span>S-ETL Pipeline</span>
              </div>
            </div>
            <div className="px-4 py-6 flex flex-col gap-2">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card/50">
        <div className="p-6 h-16 flex items-center border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <div className="w-6 h-6 rounded-sm bg-primary" />
            <span>S-ETL Pipeline</span>
          </div>
        </div>
        <div className="px-4 py-6 flex flex-col gap-2 flex-1">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-3 tracking-wider uppercase">
            Platform
          </div>
          <NavLinks />
        </div>
        <div className="p-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
          <span>v0.1.0-alpha</span>
          <div className="flex items-center gap-1.5">
            {isHealthy ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>System Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>System Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
