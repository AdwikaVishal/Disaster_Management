import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, BellRing, Info } from 'lucide-react';

export default function Alerts() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">System Alerts</h1>

            <div className="space-y-4">
                {[
                    { type: 'critical', title: 'Flash Flood Warning', msg: 'Heavy rains predicted in your sector. Stay indoors.', time: '10 mins ago' },
                    { type: 'warning', title: 'High Wind Alert', msg: 'Wind speeds exceeding 60km/h.', time: '2 hours ago' },
                    { type: 'info', title: 'System Maintenance', msg: 'Scheduled downtime for 15 mins tonight.', time: '1 day ago' },
                ].map((alert, idx) => (
                    <div key={idx} className={`flex gap-4 p-4 rounded-lg border l-4 ${alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 border-l-red-500' :
                            alert.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 border-l-orange-500' :
                                'bg-blue-50 dark:bg-blue-900/10 border-blue-200 border-l-blue-500'
                        }`}>
                        <div className={`mt-1 ${alert.type === 'critical' ? 'text-red-500' :
                                alert.type === 'warning' ? 'text-orange-500' :
                                    'text-blue-500'
                            }`}>
                            {alert.type === 'critical' ? <AlertTriangle /> : alert.type === 'warning' ? <BellRing /> : <Info />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">{alert.title}</h4>
                            <p className="text-muted-foreground">{alert.msg}</p>
                            <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
