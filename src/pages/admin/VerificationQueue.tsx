import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Check, X, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncidentService, Incident } from '@/services/incident.service';
import { formatDistanceToNow } from 'date-fns';

export default function VerificationQueue() {
    const [reports, setReports] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingReports();
        const interval = setInterval(fetchPendingReports, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchPendingReports = async () => {
        setIsLoading(true);
        try {
            const response = await IncidentService.getAllIncidents(48); // Get last 48 hours
            if (response.success && response.incidents) {
                // Filter for NEW incidents only
                const pending = response.incidents.filter(i => i.status === 'NEW');
                setReports(pending);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'VERIFIED' | 'REJECTED') => {
        try {
            const response = await IncidentService.updateIncidentStatus(id, action);
            if (response.success) {
                setReports(reports.filter(r => r.id !== id));
            } else {
                throw new Error(response.message || 'Action failed');
            }
        } catch (error) {
            console.error("Action failed", error);
            // Optionally set error state to show inline error
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Verification Queue</h1>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                    {reports.length} Pending Reviews
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-yellow-400 overflow-hidden">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                                <AlertTriangle className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                            </div>

                            <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-xl font-bold truncate">{report.type}</h3>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold text-white uppercase",
                                        report.severity === 'CRITICAL' ? "bg-red-600" :
                                            report.severity === 'HIGH' ? "bg-orange-500" : "bg-blue-500"
                                    )}>
                                        {report.severity}
                                    </span>
                                    {(report as any).riskScore > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <ShieldAlert className="w-3 h-3 text-primary" />
                                            Risk: {Math.round((report as any).riskScore)}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                    <span className="truncate">
                                        {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span className="whitespace-nowrap">
                                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/80 line-clamp-2">
                                    {report.description}
                                </p>

                                {report.mediaUrls && report.mediaUrls.length > 0 && (
                                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                        {report.mediaUrls.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt="Evidence"
                                                className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded object-cover border border-border"
                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 flex-1 md:w-32 text-white"
                                    onClick={() => handleAction(report.id, 'VERIFIED')}
                                >
                                    <Check className="w-4 h-4 mr-2" /> Verify
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1 md:w-32"
                                    onClick={() => handleAction(report.id, 'REJECTED')}
                                >
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reports.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">All caught up!</p>
                        <p>No new reports passing the filter.</p>
                        <Button variant="link" onClick={fetchPendingReports} className="mt-2">Refresh Queue</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
