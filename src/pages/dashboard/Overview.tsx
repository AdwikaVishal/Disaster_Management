import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, MapPin, Droplets, Wind, ThermometerSun, Loader2, ShieldAlert, Check } from 'lucide-react';
import { IncidentService, Incident } from '@/services/incident.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { VolunteerApplicationModal } from '@/components/VolunteerApplicationModal';

export default function Overview() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeCount: 0,
        riskLevel: 'Low'
    });
    const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await IncidentService.getAllIncidents(24);
                if (response.success && response.incidents) {
                    // Filter to show only VERIFIED incidents (from admin verification queue)
                    const activeIncidents = response.incidents
                        .filter(i => i.status === 'VERIFIED')
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    setIncidents(activeIncidents);

                    // Calculate simple stats
                    const highRiskCount = activeIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;

                    setStats({
                        activeCount: activeIncidents.length,
                        riskLevel: highRiskCount > 5 ? 'Critical' : highRiskCount > 2 ? 'High' : 'Low'
                    });
                }
            } catch (error) {
                console.error("Failed to fetch incidents", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <VolunteerApplicationModal
                isOpen={isVolunteerModalOpen}
                onClose={() => setIsVolunteerModalOpen(false)}
            />
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-destructive">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Risk Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold",
                            stats.riskLevel === 'Critical' ? "text-destructive" :
                                stats.riskLevel === 'High' ? "text-orange-500" : "text-green-600"
                        )}>{stats.riskLevel}</div>
                        <p className="text-xs text-muted-foreground mt-1">Based on recent activity</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">In the last 24 hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Nearby Volunteers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground mt-1">Within 5km radius</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">My Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">350</div>
                        <p className="text-xs text-muted-foreground mt-1">Top 5% reporter</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Live Incident Feed</CardTitle>
                            <CardDescription>Real-time reports from your community</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : incidents.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground">
                                        No recent incidents reported.
                                    </div>
                                ) : (
                                    incidents.map((incident) => (
                                        <div key={incident.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className={cn("p-3 rounded-full",
                                                incident.severity === 'CRITICAL' ? "bg-red-100 dark:bg-red-900/20" :
                                                    incident.severity === 'HIGH' ? "bg-orange-100 dark:bg-orange-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                                            )}>
                                                <AlertTriangle className={cn("w-5 h-5",
                                                    incident.severity === 'CRITICAL' ? "text-red-600 dark:text-red-400" :
                                                        incident.severity === 'HIGH' ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                                                )} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{incident.type}</h4>
                                                        {incident.status === 'VERIFIED' && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wider">
                                                                <Check className="w-3 h-3" /> Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {(incident as any).riskScore > 0 && (
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                                                                <ShieldAlert className="w-3 h-3" /> ML Risk: {Math.round((incident as any).riskScore)}%
                                                            </span>
                                                        )}
                                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                                                            incident.severity === 'CRITICAL' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                incident.severity === 'HIGH' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        )}>{incident.severity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`} • {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                                                </div>
                                                <p className="text-sm line-clamp-2">{incident.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4 text-center">
                                <Button variant="outline" className="w-full">View All Incidents</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Weather / Conditions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Local Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ThermometerSun className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm font-medium">Temperature</span>
                                </div>
                                <span className="text-sm font-bold">28°C</span>
                            </div>
                            <div className="border-t border-border" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium">Humidity</span>
                                </div>
                                <span className="text-sm font-bold">78%</span>
                            </div>
                            <div className="border-t border-border" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wind className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium">Wind</span>
                                </div>
                                <span className="text-sm font-bold">12 km/h</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Volunteer CTA */}
                    <Card className="bg-primary text-primary-foreground border-none">
                        <CardHeader>
                            <CardTitle>Become a Hero</CardTitle>
                            <CardDescription className="text-primary-foreground/80">Join the volunteer network today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="secondary"
                                className="w-full font-semibold"
                                onClick={() => setIsVolunteerModalOpen(true)}
                            >
                                Apply Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
