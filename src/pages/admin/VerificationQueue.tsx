import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, MapPin, Check, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VerificationQueue() {
    const [reports, setReports] = useState([
        { id: 1, type: 'Flood', loc: 'Sector 4', time: '5m ago', risk: 85, status: 'Pending' },
        { id: 2, type: 'Fire', loc: 'Industrial Zone', time: '12m ago', risk: 92, status: 'Pending' },
        { id: 3, type: 'Accident', loc: 'Main Highway', time: '30m ago', risk: 65, status: 'Pending' },
    ]);

    const handleAction = (id: number) => {
        setReports(reports.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Verification Queue</h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">3 Pending Reviews</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-yellow-400">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 bg-slate-100 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-slate-600" />
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold">{report.type}</h3>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold text-white",
                                        report.risk > 80 ? "bg-red-500" : "bg-orange-500"
                                    )}>
                                        RISK SCORE: {report.risk}
                                    </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {report.loc} • {report.time}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <div className="w-16 h-16 bg-slate-200 rounded object-cover" />
                                    <div className="w-16 h-16 bg-slate-200 rounded object-cover" />
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                                <Button size="sm" variant="outline" className="flex-1">
                                    <Eye className="w-4 h-4 mr-2" /> Examine
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => handleAction(report.id)}>
                                    <Check className="w-4 h-4 mr-2" /> Verify
                                </Button>
                                <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleAction(report.id)}>
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reports.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg">All caught up! No pending reports.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
