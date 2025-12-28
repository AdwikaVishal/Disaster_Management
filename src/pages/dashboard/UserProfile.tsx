import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/Label';
import { User, Phone, Shield } from 'lucide-react';

export default function UserProfile() {
    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card className="text-center pt-6">
                    <CardContent className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                            <User className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold">John Doe</h2>
                        <p className="text-sm text-muted-foreground">Citizen Reporter</p>
                        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <Shield className="w-3.5 h-3.5" />
                            Verified Account
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Settings */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your contact details and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input defaultValue="John" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input defaultValue="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue="john.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input defaultValue="+91 1234790289" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Contacts</CardTitle>
                        <CardDescription>People to notify if you trigger an SOS.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                    <Phone className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium">Jane Doe (Wife)</p>
                                    <p className="text-sm text-muted-foreground">+91 87645637289</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <Button variant="outline" className="w-full">Add New Contact</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
