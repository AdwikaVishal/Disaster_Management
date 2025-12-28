import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    ShieldAlert,
    Users,
    FileCheck,
    FileText,
    Menu,
    X,
    LogOut,
    Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Updated Admin Links - Removed Analytics, Added User Management
const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Incident Map', href: '/admin/map', icon: MapIcon },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Verification Queue', href: '/admin/verification', icon: FileCheck },
    { name: 'Emergency Control', href: '/admin/emergency', icon: Siren },
    { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
];

import { useAuth } from '@/context/AuthContext';

import { SOSAlertPopup } from '@/components/admin/SOSAlertPopup';

export const AdminLayout = () => {
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background flex">
            <SOSAlertPopup />
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-slate-900 text-slate-50 fixed inset-y-0 z-40">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <span className="text-lg font-bold tracking-wider">ADMIN<span className="text-red-500">SAFE</span></span>
                    </Link>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {adminLinks.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-red-500 text-white shadow-md shadow-red-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="destructive" className="w-full justify-start" size="sm" onClick={() => logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
                        <span className="w-2 h-6 bg-red-500 rounded-full inline-block"></span>
                        {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 animate-pulse">
                            LIVE MONITORING ACTIVE
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
