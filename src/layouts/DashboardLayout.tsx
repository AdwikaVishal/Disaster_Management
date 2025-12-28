import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LayoutDashboard, FileWarning, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login");
    };

    const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to}>
                <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
                )}>
                    {icon}
                    <span className="font-medium">{label}</span>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-2 border-b">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold">SenseSafe</span>
                </div>

                <div className="flex-1 p-4 space-y-2">
                    <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" />
                    <NavItem to="/report" icon={<FileWarning className="w-5 h-5" />} label="Report Incident" />
                </div>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name || user.username || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header (visible only on small screens) */}
                <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="font-bold">SenseSafe</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleLogout}>Log out</Button>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
