import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    AlertTriangle,
    Users,
    Bell,
    User,
    Menu,
    X,
    Shield,
    LifeBuoy,
    LogOut,
    Loader2,
    Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { BroadcastAlertPopup } from '@/components/BroadcastAlertPopup';

const userLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', href: '/dashboard/map', icon: MapIcon },
    { name: 'Report Incident', href: '/dashboard/report', icon: AlertTriangle },
    { name: 'Volunteer', href: '/dashboard/volunteer', icon: LifeBuoy },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

import { useAuth } from '@/context/AuthContext';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const [sosLoading, setSosLoading] = useState(false);

    const handleSOSClick = () => {
        setSosLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const sosAlert = {
                        id: `sos-${Date.now()}`,
                        userId: user?.id || 'unknown',
                        userName: `${user?.firstName || 'Citizen'} ${user?.lastName || ''}`.trim(),
                        coords: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        timestamp: Date.now(),
                        message: "Requesting immediate emergency assistance!"
                    };

                    // Send to Admin (via LocalStorage for simulation)
                    localStorage.setItem('active_sos_alert', JSON.stringify(sosAlert));
                    // Trigger storage event for same-window testing
                    window.dispatchEvent(new StorageEvent('storage', {
                        key: 'active_sos_alert',
                        newValue: JSON.stringify(sosAlert)
                    }));

                    alert("SOS Signal Sent! Emergency services have been notified of your location.");
                    setSosLoading(false);
                },
                (error) => {
                    console.error("SOS Location Error", error);
                    alert("Could not get location. Sending SOS with last known location...");
                    // Fallback SOS without precise location
                    const sosAlert = {
                        id: `sos-${Date.now()}`,
                        userId: user?.id || 'unknown',
                        userName: `${user?.firstName || 'Citizen'} ${user?.lastName || ''}`.trim(),
                        coords: { lat: 20.5937, lng: 78.9629 }, // Default India Approx
                        timestamp: Date.now(),
                        message: "Requesting immediate emergency assistance! (Location unavailable)"
                    };
                    localStorage.setItem('active_sos_alert', JSON.stringify(sosAlert));
                    window.dispatchEvent(new StorageEvent('storage', {
                        key: 'active_sos_alert',
                        newValue: JSON.stringify(sosAlert)
                    }));
                    setSosLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation not supported.");
            setSosLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <BroadcastAlertPopup />
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card fixed inset-y-0 z-40">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link to="/" className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="text-lg font-bold">SenseSafe</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {userLinks.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.toLowerCase() || 'Citizen'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" size="sm" onClick={() => logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:hidden px-3 py-4 flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <Link to="/" className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="text-lg font-bold">SenseSafe</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <div className="space-y-1 flex-1">
                    {userLinks.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between">
                    <button
                        className="p-2 -ml-2 lg:hidden text-muted-foreground"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <h2 className="text-lg font-semibold hidden lg:block capitalize">
                        {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background"></span>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="hidden sm:flex font-bold animate-pulse shadow-lg shadow-red-500/20"
                            onClick={handleSOSClick}
                            disabled={sosLoading}
                        >
                            {sosLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    SENDING...
                                </>
                            ) : (
                                <>
                                    <Siren className="w-4 h-4 mr-2" />
                                    SOS EMERGENCY
                                </>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
