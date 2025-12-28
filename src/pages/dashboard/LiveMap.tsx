import React from 'react';
import { IncidentMap } from '@/components/ui/IncidentMap';

export default function LiveMap() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Incident Map</h1>
                    <p className="text-muted-foreground">Monitor incidents across the country in real-time.</p>
                </div>
            </div>

            <IncidentMap />
        </div>
    );
}
