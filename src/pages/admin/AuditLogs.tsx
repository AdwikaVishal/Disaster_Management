import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BadgeAlert, Database, Hash, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Mock Blockchain Audit Data
const LOGS = [
    { id: 'LOG-001', action: 'INCIDENT_VERIFIED', user: 'Admin-01', target: 'INC-2938', time: '2023-12-28 14:30:22', hash: '0x7f83...9a2b', status: 'Committed' },
    { id: 'LOG-002', action: 'VOLUNTEER_APPROVED', user: 'Admin-01', target: 'USR-8821', time: '2023-12-28 14:15:10', hash: '0x3c21...8b1d', status: 'Committed' },
    { id: 'LOG-003', action: 'ALERT_BROADCAST', user: 'System', target: 'REGION-4', time: '2023-12-28 13:45:00', hash: '0x9d44...2e5f', status: 'Committed' },
    { id: 'LOG-004', action: 'INCIDENT_REPORTED', user: 'User-4402', target: 'INC-2939', time: '2023-12-28 13:30:55', hash: '0x1a99...4f7c', status: 'Pending' },
    { id: 'LOG-005', action: 'LOGIN_ATTEMPT', user: 'Admin-02', target: 'AUTH_SYS', time: '2023-12-28 13:00:12', hash: '0x5b66...1d3e', status: 'Committed' },
];

export default function AuditLogs() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200">
                            BLOCKCHAIN ENABLED
                        </div>
                    </div>
                    <p className="text-muted-foreground">Immutable record of all critical system actions. Future blockchain integration pending.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search hash, action, or user..." />
                    </div>
                    <Button variant="outline">Export CSV</Button>
                </div>
            </div>

            <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        Ledger Entries
                    </CardTitle>
                    <CardDescription>Displaying recent blocks and transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left">Timestamp</th>
                                    <th className="px-4 py-3 text-left">Action Type</th>
                                    <th className="px-4 py-3 text-left">Initiator</th>
                                    <th className="px-4 py-3 text-left">Target ID</th>
                                    <th className="px-4 py-3 text-left font-mono">Merkle Hash</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {LOGS.map((log, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-xs">{log.time}</td>
                                        <td className="px-4 py-3 font-semibold">{log.action}</td>
                                        <td className="px-4 py-3">{log.user}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{log.target}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            {log.hash}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${log.status === 'Committed'
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 animate-pulse'
                                                }`}>
                                                {log.status === 'Committed' && <Lock className="w-3 h-3" />}
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span>Latest Block: #8,922,103</span>
                            <span>Gas Price: 12 gwei</span>
                            <span>Peers: 42</span>
                        </div>
                        <div>
                            Sync Status: <span className="text-green-600 font-bold">● Connected</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
