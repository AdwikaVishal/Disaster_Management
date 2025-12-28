import { useState, useEffect } from 'react';
import { AlertTriangle, BellRing, Info, Loader2 } from 'lucide-react';
import { IncidentService, Incident } from '@/services/incident.service';
import { formatDistanceToNow } from 'date-fns';

export default function Alerts() {
    const [alerts, setAlerts] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await IncidentService.getAllIncidents(24);
                if (response.success && response.incidents) {
                    // Filter for VERIFIED incidents only
                    const verifiedAlerts = response.incidents
                        .filter(i => i.status === 'VERIFIED')
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setAlerts(verifiedAlerts);
                }
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const getAlertType = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return { type: 'critical', icon: AlertTriangle, bgColor: 'bg-red-50 dark:bg-red-900/10', borderColor: 'border-red-200 dark:border-red-900/50', borderLeft: 'border-l-red-500', textColor: 'text-red-500' };
            case 'HIGH':
                return { type: 'warning', icon: BellRing, bgColor: 'bg-orange-50 dark:bg-orange-900/10', borderColor: 'border-orange-200 dark:border-orange-900/50', borderLeft: 'border-l-orange-500', textColor: 'text-orange-500' };
            default:
                return { type: 'info', icon: Info, bgColor: 'bg-blue-50 dark:bg-blue-900/10', borderColor: 'border-blue-200 dark:border-blue-900/50', borderLeft: 'border-l-blue-500', textColor: 'text-blue-500' };
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">System Alerts</h1>
            <p className="text-muted-foreground">Verified incidents requiring community awareness</p>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <BellRing className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">All Clear!</p>
                        <p>No verified alerts at the moment.</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const alertStyle = getAlertType(alert.severity);
                        const AlertIcon = alertStyle.icon;

                        return (
                            <div key={alert.id} className={`flex gap-4 p-4 rounded-lg border ${alertStyle.bgColor} ${alertStyle.borderColor} ${alertStyle.borderLeft}`}>
                                <div className={`mt-1 ${alertStyle.textColor}`}>
                                    <AlertIcon />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{alert.type} - {alert.severity}</h4>
                                    <p className="text-muted-foreground">{alert.description}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {alert.address || `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`} • {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
