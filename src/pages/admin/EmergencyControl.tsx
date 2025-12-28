import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Siren, Radio, Megaphone, ShieldAlert, Power } from 'lucide-react';

export default function EmergencyControl() {
    const [activeAlert, setActiveAlert] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isSOSContext, setIsSOSContext] = useState(false);

    useEffect(() => {
        const draft = localStorage.getItem('emergency_broadcast_draft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                if (data.type === 'SOS_BROADCAST') {
                    setIsSOSContext(true);
                    setActiveAlert('Civil Emergency');
                    setMessage(`SOS ALERT FROM USER: ${data.userName}\nLOCATION: Lat ${data.coords.lat}, Lng ${data.coords.lng}\nMESSAGE: ${data.message}\n\nACTION REQUIRED: Immediate dispatch initiated.`);
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    const handleBroadcast = () => {
        if (!message || !activeAlert) return;

        // Create the broadcast object
        const broadcast = {
            id: Date.now().toString(),
            type: activeAlert,
            message: message,
            timestamp: Date.now()
        };

        // Save to local storage to trigger the popup on user dashboard
        localStorage.setItem('active_broadcast_alert', JSON.stringify(broadcast));

        // Dispatch event for same-browser testing
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'active_broadcast_alert',
            newValue: JSON.stringify(broadcast)
        }));

        // Mock broadcast success
        alert(`BROADCAST SENT: ${activeAlert}\n\n${message}`);

        // Cleanup
        localStorage.removeItem('emergency_broadcast_draft');
        setMessage('');
        setActiveAlert(null);
        setIsSOSContext(false);
    };

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-lg bg-red-950 border border-red-900 text-red-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-900/50 rounded-full animate-pulse">
                        <Siren className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">EMERGENCY BROADCAST SYSTEM</h2>
                        <p className="text-red-200">Authorized Personnel Only. All actions are logged.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded border border-red-500/30 font-mono text-red-400">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                    SYSTEM ARMED
                </div>
            </div>

            {isSOSContext && (
                <div className="bg-red-500/10 border border-red-500 text-red-600 p-4 rounded-lg flex items-center gap-4 animate-in slide-in-from-top-4">
                    <ShieldAlert className="w-6 h-6" />
                    <div>
                        <p className="font-bold">Active SOS Incident Detected</p>
                        <p className="text-sm">Data has been pre-filled from the incoming distress signal. Verify before broadcasting.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="w-5 h-5" />
                            Mass Notification
                        </CardTitle>
                        <CardDescription>Send alerts to all users in a specific geofence.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {['Natural Disaster', 'Civil Emergency', 'Health Hazard'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveAlert(type)}
                                    className={`p-4 rounded-lg border-2 text-sm font-bold transition-all ${activeAlert === type
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-muted hover:border-red-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm font-mono"
                            placeholder="Enter emergency message contents..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12"
                            onClick={handleBroadcast}
                        >
                            {isSOSContext ? 'BROADCAST SOS ALERT' : 'BROADCAST ALERT'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Power className="w-5 h-5" />
                            System Overrides
                        </CardTitle>
                        <CardDescription>Control automated response protocols.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-bold">Auto-Dispatch Volunteers</p>
                                <p className="text-xs text-muted-foreground">Automatically assign tasks based on proximity</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-bold">AI Risk Scoring</p>
                                <p className="text-xs text-muted-foreground">Use ML model for incident triage</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 opacity-70">
                            <div>
                                <p className="font-bold">Lockdown Mode</p>
                                <p className="text-xs text-muted-foreground">Restrict user movements suggestions</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
