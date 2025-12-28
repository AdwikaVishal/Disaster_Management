import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const data = [
    { name: '00:00', incidents: 4 },
    { name: '04:00', incidents: 3 },
    { name: '08:00', incidents: 10 },
    { name: '12:00', incidents: 25 },
    { name: '16:00', incidents: 18 },
    { name: '20:00', incidents: 12 },
    { name: '24:00', incidents: 5 },
];

const riskData = [
    { name: 'High', value: 12, fill: '#ef4444' },
    { name: 'Medium', value: 25, fill: '#f97316' },
    { name: 'Low', value: 45, fill: '#3b82f6' },
];

export default function AdminOverview() {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Active Incidents', value: '42', icon: AlertTriangle, color: 'text-red-500' },
                    { title: 'Volunteers Online', value: '1,203', icon: Users, color: 'text-blue-500' },
                    { title: 'Resolved Today', value: '156', icon: CheckCircle, color: 'text-green-500' },
                    { title: 'Avg Response', value: '12m', icon: Clock, color: 'text-orange-500' },
                ].map((stat, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Incident Velocity (Last 24h)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorIncidents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Risk Dist Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Risk Level Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={60} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Critical Alerts */}
        </div>
    );
}
