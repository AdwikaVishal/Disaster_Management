import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Siren, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SOSAlert {
    id: string;
    userId: string;
    userName: string;
    coords: { lat: number; lng: number };
    timestamp: number;
    message: string;
}

export function SOSAlertPopup() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState<SOSAlert | null>(null);

    useEffect(() => {
        // Function to check for alerts
        const checkAlerts = () => {
            try {
                const storedAlerts = localStorage.getItem('active_sos_alert');
                if (storedAlerts) {
                    const parsedAlert = JSON.parse(storedAlerts);
                    // Only show if it's recent (less than 1 min old)
                    if (Date.now() - parsedAlert.timestamp < 60000) {
                        setAlert(parsedAlert);
                    } else {
                        // Clear old alert
                        localStorage.removeItem('active_sos_alert');
                        setAlert(null);
                    }
                }
            } catch (e) {
                console.error("Failed to parse SOS alert", e);
            }
        };

        // Check initially
        checkAlerts();

        // Listen for storage events (if triggered from another tab)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'active_sos_alert') {
                checkAlerts();
            }
        };

        // Also poll every 2 seconds for same-tab updates if storage event doesn't fire
        const interval = setInterval(checkAlerts, 2000);

        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const handleAccept = () => {
        if (!alert) return;

        // Pass the alert data to the emergency page via history state or local storage
        // We'll use local storage to ensure it persists
        const emergencyData = {
            type: 'SOS_BROADCAST',
            source: 'SOS_POPUP',
            ...alert
        };
        localStorage.setItem('emergency_broadcast_draft', JSON.stringify(emergencyData));

        // Clear the active alert so it doesn't pop up again immediately
        localStorage.removeItem('active_sos_alert');
        setAlert(null);

        navigate('/admin/emergency');
    };

    const handleDismiss = () => {
        localStorage.removeItem('active_sos_alert');
        setAlert(null);
    };

    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg shadow-2xl border-2 border-red-500 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-red-600 text-white animate-pulse">
                    <div className="flex items-center gap-2">
                        <Siren className="w-6 h-6 animate-bounce" />
                        <h2 className="text-xl font-bold tracking-wider">SOS EMERGENCY ALERT</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                            <MapPin className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Distress Signal Received
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                User <span className="font-bold text-slate-900 dark:text-slate-200">{alert.userName}</span> has triggered an SOS.
                            </p>
                            <div className="mt-2 text-sm bg-slate-900 text-white p-2 rounded font-mono">
                                Lat: {alert.coords.lat.toFixed(6)} | Lng: {alert.coords.lng.toFixed(6)}
                            </div>
                            <p className="mt-2 text-sm italic text-slate-500">
                                "{alert.message}"
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 p-3 rounded-md text-sm text-orange-800 dark:text-orange-300">
                        <strong>Action Required:</strong> Immediate attention needed. Do you want to proceed to Emergency Control to broadcast this alert?
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={handleDismiss}>
                            Dismiss
                        </Button>
                        <Button variant="destructive" className="flex-1 font-bold text-lg" onClick={handleAccept}>
                            YES, PROCEED
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
