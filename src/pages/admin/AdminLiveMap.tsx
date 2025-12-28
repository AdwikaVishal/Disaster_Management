import React from 'react';
import { IncidentMap } from '@/components/ui/IncidentMap';

export default function AdminLiveMap() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">Strategic Command Map</h1>
                    <p className="text-muted-foreground">National overview for resource deployment and status monitoring.</p>
                </div>
            </div>

            <IncidentMap isAdmin={true} />
        </div>
    );
}
