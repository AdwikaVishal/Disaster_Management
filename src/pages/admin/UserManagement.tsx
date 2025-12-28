import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, User, Clock, Eye } from 'lucide-react';
import { VolunteerService } from '@/services/volunteer.service';

export default function UserManagement() {
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        const response = await VolunteerService.getAllApplications();
        if (response.success && response.applications) {
            setApplications(response.applications);
        }
    };

    const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        const response = await VolunteerService.updateApplicationStatus(id, status);
        if (response.success) {
            loadApplications();
        }
    };

    const viewDetails = (app: any) => {
        setSelectedApp(app);
        setShowDetails(true);
    };

    const pendingCount = applications.filter(app => app.status === 'PENDING').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Volunteer Management</h1>
                    <p className="text-muted-foreground">Review and approve volunteer applications from citizens.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">{pendingCount} Pending Applications</span>
                </div>
            </div>

            {showDetails && selectedApp && (
                <Card className="border-blue-500 border-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Application Details</CardTitle>
                                <CardDescription>Review volunteer application information</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Volunteer Type</p>
                                <p className="font-medium capitalize">{selectedApp.volunteerType.toLowerCase().replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Availability</p>
                                <p className="font-medium capitalize">{selectedApp.availability.toLowerCase().replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Max Distance</p>
                                <p className="font-medium">{selectedApp.maxDistanceKm} km</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Emergency Training</p>
                                <p className="font-medium">{selectedApp.emergencyTraining ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Skills</p>
                            <p className="font-medium">{selectedApp.skills}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Experience</p>
                            <p className="text-sm">{selectedApp.experience}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Motivation</p>
                            <p className="text-sm">{selectedApp.motivation}</p>
                        </div>

                        {selectedApp.certifications && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Certifications</p>
                                <p className="font-medium">{selectedApp.certifications}</p>
                            </div>
                        )}

                        {selectedApp.status === 'PENDING' && (
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        handleAction(selectedApp.id, 'APPROVED');
                                        setShowDetails(false);
                                    }}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve Application
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        handleAction(selectedApp.id, 'REJECTED');
                                        setShowDetails(false);
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject Application
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Application Queue</CardTitle>
                    <CardDescription>Citizens applying to join the emergency response network.</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">No volunteer applications yet</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-border">
                            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50 border-b border-border">
                                <div className="col-span-3">Applicant</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2">Skills</div>
                                <div className="col-span-2">Applied</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>

                            <div className="divide-y divide-border">
                                {applications.map((app) => (
                                    <div key={app.id} className="grid grid-cols-12 gap-4 p-4 items-center animate-in fade-in transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">User #{app.userId}</p>
                                                <p className="text-xs text-muted-foreground">ID: {app.id}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-sm capitalize">
                                            {app.volunteerType.toLowerCase().replace('_', ' ')}
                                        </div>

                                        <div className="col-span-2 text-sm truncate" title={app.skills}>
                                            {app.skills}
                                        </div>

                                        <div className="col-span-2 text-sm text-muted-foreground">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                                app.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        <div className="col-span-1 flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => viewDetails(app)}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAction(app.id, 'APPROVED')}
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleAction(app.id, 'REJECTED')}
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
