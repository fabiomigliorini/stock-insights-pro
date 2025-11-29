import { LayoutDashboard, Package, TrendingUp, Building2, Settings, Upload, LogOut, User, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/", current: true },
  { name: "Classes", icon: Layers, href: "/classes", current: false },
  { name: "Predições", icon: TrendingUp, href: "/predicoes", current: false },
  { name: "Filiais", icon: Building2, href: "/filiais", current: false },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-sidebar-primary" />
            Giro Certo
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
          
          <Link
            to="/import"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mt-4 border border-sidebar-border",
              location.pathname === "/import"
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary-foreground hover:border-sidebar-primary"
            )}
          >
            <Upload className="h-5 w-5" />
            Importar Dados
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-sidebar-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
