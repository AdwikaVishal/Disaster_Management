import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, MapPin, Activity, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_INCIDENTS = [
    { id: 1, type: 'Flood', location: 'Downtown Area', severity: 'High', time: '10 mins ago' },
    { id: 2, type: 'Fire', location: 'Industrial Zone', severity: 'Critical', time: '25 mins ago' },
    { id: 3, type: 'Road Block', location: 'Highway 42', severity: 'Medium', time: '1 hour ago' },
];

export default function Overview() {
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-destructive">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Risk Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">High</div>
                        <p className="text-xs text-muted-foreground mt-1">Due to heavy rainfall alert</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">+3 since last hour</p>
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
                            <div className="space-y-4">
                                {MOCK_INCIDENTS.map((incident) => (
                                    <div key={incident.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold">{incident.type}</h4>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{incident.severity}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                                {incident.location} • {incident.time}
                                            </div>
                                            <p className="text-sm">Reports of rising water levels. Please avoid the area.</p>
                                        </div>
                                    </div>
                                ))}
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
                            <Button variant="secondary" className="w-full font-semibold">Apply Now</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
