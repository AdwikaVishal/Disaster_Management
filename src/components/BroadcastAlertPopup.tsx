import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ChevronUp } from 'lucide-react';

interface BroadcastMessage {
    id: string;
    type: string;
    message: string;
    timestamp: number;
}

export function BroadcastAlertPopup() {
    const [alert, setAlert] = useState<BroadcastMessage | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Init check
        checkAlerts();

        // Listen for storage events (multi-tab)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'active_broadcast_alert') {
                checkAlerts();
            }
        };

        // Poll for single-tab updates
        const interval = setInterval(checkAlerts, 2000);

        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const checkAlerts = () => {
        try {
            const data = localStorage.getItem('active_broadcast_alert');
            const lastAckId = localStorage.getItem('last_acknowledged_alert');

            if (data) {
                const parsed = JSON.parse(data);
                // Check if expired (5 mins)
                if (Date.now() - parsed.timestamp < 300000) {
                    setAlert(prev => {
                        // If it's a completely new alert ID, reset minimization
                        if (prev?.id !== parsed.id) {
                            if (parsed.id === lastAckId) {
                                setIsMinimized(true);
                            } else {
                                setIsMinimized(false);
                            }
                        }
                        return parsed;
                    });
                } else {
                    localStorage.removeItem('active_broadcast_alert');
                    setAlert(null);
                }
            } else {
                setAlert(null);
            }
        } catch (e) {
            console.error("Failed to parse broadcast", e);
        }
    };

    const handleDismiss = () => {
        if (alert) {
            setIsMinimized(true);
            localStorage.setItem('last_acknowledged_alert', alert.id);
        }
    };

    const handleMaximize = () => {
        setIsMinimized(false);
    };

    if (!alert) return null;

    // Minimized View (Bottom-Left Mini Popup)
    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 left-4 z-[90] bg-red-600 text-white p-3 rounded-lg shadow-lg border border-red-400 flex items-center gap-3 cursor-pointer hover:bg-red-700 transition-all animate-in slide-in-from-left-5 duration-300 max-w-sm group"
                onClick={handleMaximize}
                role="button"
                aria-label="Expand Alert"
                title="Click to view full emergency alert"
            >
                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-wider">ACTIVE ALERT</p>
                        <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-bold truncate">{alert.type.toUpperCase()}</p>
                </div>
            </div>
        );
    }

    // Full Screen View
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-red-600 rounded-xl shadow-2xl border-4 border-red-400 animate-in zoom-in-95 duration-300 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-red-500 bg-red-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full animate-pulse">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-widest text-white uppercase">
                                EMERGENCY ALERT
                            </h2>
                            <p className="text-red-100 font-bold tracking-wider opacity-90">
                                {alert.type.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-red-200 hover:text-white hover:bg-red-500/50" onClick={handleDismiss}>
                        Minimize <X className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="bg-white/10 p-6 rounded-lg border border-red-400/50 backdrop-blur-sm">
                        <p className="text-xl md:text-2xl font-bold text-yellow-300 leading-relaxed font-mono whitespace-pre-wrap">
                            {alert.message}
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-white text-red-600 border-white hover:bg-red-50 font-bold px-8 py-6 text-lg tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            onClick={handleDismiss}
                        >
                            ACKNOWLEDGE & MINIMIZE
                        </Button>
                    </div>
                </div>

                {/* Footer Stripe */}
                <div className="bg-yellow-400 text-red-900 font-black text-center py-2 text-sm tracking-[0.2em] animate-pulse">
                    OFFICIAL SENTINEL BROADCAST • DO NOT IGNORE
                </div>
            </div>
        </div>
    );
}
