import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Siren, Radio, Megaphone, ShieldAlert, Power, Loader2 } from 'lucide-react';

export default function EmergencyControl() {
    const [activeAlert, setActiveAlert] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isSOSContext, setIsSOSContext] = useState(false);
    
    // System Configuration State
    const [systemConfig, setSystemConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch system configuration
    const fetchSystemConfig = async () => {
        try {
            setError(null);
            const response = await fetch('/api/admin/system-config', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSystemConfig(data.systemConfig);
            } else {
                setError('Failed to fetch system configuration');
            }
        } catch (err) {
            setError('Network error while fetching configuration');
            console.error('Error fetching system config:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update system configuration
    const updateSystemConfig = async (configKey: string, enabled: boolean) => {
        try {
            setUpdating(configKey);
            setError(null);
            
            const response = await fetch(`/api/admin/system-config/${configKey}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update local state
                setSystemConfig(prev => ({
                    ...prev,
                    [configKey]: {
                        ...prev[configKey],
                        enabled: data.config.enabled
                    }
                }));
            } else {
                setError('Failed to update system configuration');
            }
        } catch (err) {
            setError('Network error while updating configuration');
            console.error('Error updating system config:', err);
        } finally {
            setUpdating(null);
        }
    };

    // Initialize system configuration
    useEffect(() => {
        // First initialize default configurations, then fetch them
        const initializeAndFetch = async () => {
            try {
                // Try to initialize system configurations
                await fetch('/api/admin/system-config/initialize', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                // Ignore initialization errors (configurations might already exist)
                console.log('System config initialization skipped (configurations may already exist)');
            } finally {
                // Always fetch the current configuration
                fetchSystemConfig();
            }
        };
        
        initializeAndFetch();
    }, []);

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
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="ml-2">Loading system configuration...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-600 text-center py-4">
                                <p className="font-semibold">Error</p>
                                <p className="text-sm">{error}</p>
                                <Button 
                                    onClick={fetchSystemConfig} 
                                    variant="outline" 
                                    className="mt-2"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-bold">Auto-Dispatch Volunteers</p>
                                        <p className="text-xs text-muted-foreground">Automatically assign tasks based on proximity</p>
                                    </div>
                                    <button
                                        onClick={() => updateSystemConfig('AUTO_DISPATCH_VOLUNTEERS', !systemConfig.autoDispatchVolunteers?.enabled)}
                                        disabled={updating === 'AUTO_DISPATCH_VOLUNTEERS'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                            systemConfig.autoDispatchVolunteers?.enabled 
                                                ? 'bg-green-500' 
                                                : 'bg-slate-200'
                                        } ${updating === 'AUTO_DISPATCH_VOLUNTEERS' ? 'opacity-50' : ''}`}
                                    >
                                        {updating === 'AUTO_DISPATCH_VOLUNTEERS' ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white mx-auto" />
                                        ) : (
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                systemConfig.autoDispatchVolunteers?.enabled 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-1'
                                            }`} />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-bold">AI Risk Scoring</p>
                                        <p className="text-xs text-muted-foreground">Use ML model for incident triage</p>
                                    </div>
                                    <button
                                        onClick={() => updateSystemConfig('AI_RISK_SCORING', !systemConfig.aiRiskScoring?.enabled)}
                                        disabled={updating === 'AI_RISK_SCORING'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                            systemConfig.aiRiskScoring?.enabled 
                                                ? 'bg-green-500' 
                                                : 'bg-slate-200'
                                        } ${updating === 'AI_RISK_SCORING' ? 'opacity-50' : ''}`}
                                    >
                                        {updating === 'AI_RISK_SCORING' ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white mx-auto" />
                                        ) : (
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                systemConfig.aiRiskScoring?.enabled 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-1'
                                            }`} />
                                        )}
                                    </button>
                                </div>

                                <div className={`flex items-center justify-between p-4 border rounded-lg ${
                                    systemConfig.lockdownMode?.enabled 
                                        ? 'bg-red-50 border-red-200' 
                                        : 'bg-slate-50'
                                }`}>
                                    <div>
                                        <p className="font-bold">Lockdown Mode</p>
                                        <p className="text-xs text-muted-foreground">Restrict user movements suggestions</p>
                                        {systemConfig.lockdownMode?.enabled && (
                                            <p className="text-xs text-red-600 font-semibold">⚠️ ACTIVE - System in restricted mode</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => updateSystemConfig('LOCKDOWN_MODE', !systemConfig.lockdownMode?.enabled)}
                                        disabled={updating === 'LOCKDOWN_MODE'}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                            systemConfig.lockdownMode?.enabled 
                                                ? 'bg-red-500' 
                                                : 'bg-slate-200'
                                        } ${updating === 'LOCKDOWN_MODE' ? 'opacity-50' : ''}`}
                                    >
                                        {updating === 'LOCKDOWN_MODE' ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white mx-auto" />
                                        ) : (
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                systemConfig.lockdownMode?.enabled 
                                                    ? 'translate-x-6' 
                                                    : 'translate-x-1'
                                            }`} />
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
