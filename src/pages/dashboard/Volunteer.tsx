import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CheckCircle2, Loader2, AlertCircle, Heart, Shield } from 'lucide-react';
import { VolunteerService } from '@/services/volunteer.service';
import { useAuth } from '@/context/AuthContext';

export default function Volunteer() {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');
    const [myApplications, setMyApplications] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        volunteerType: 'GENERAL',
        skills: '',
        experience: '',
        availability: 'WEEKENDS',
        motivation: '',
        emergencyTraining: false,
        certifications: '',
        alternatePhone: '',
        emergencyContact: '',
        maxDistanceKm: 10
    });

    useEffect(() => {
        loadMyApplications();
    }, []);

    const loadMyApplications = async () => {
        const response = await VolunteerService.getMyApplications();
        if (response.success && response.applications) {
            setMyApplications(response.applications);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [id]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSubmitSuccess(false);

        try {
            const response = await VolunteerService.submitApplication(formData);

            if (response.success) {
                setSubmitSuccess(true);
                setShowForm(false);
                loadMyApplications();
                // Reset form
                setFormData({
                    volunteerType: 'GENERAL',
                    skills: '',
                    experience: '',
                    availability: 'WEEKENDS',
                    motivation: '',
                    emergencyTraining: false,
                    certifications: '',
                    alternatePhone: '',
                    emergencyContact: '',
                    maxDistanceKm: 10
                });
            } else {
                setError(response.message || 'Failed to submit application');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingApplication = myApplications.find(app => app.status === 'PENDING');
    const approvedApplication = myApplications.find(app => app.status === 'APPROVED');

    return (
        <div className="space-y-6">
            {submitSuccess && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">Application Submitted!</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">Admins will review your application soon.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {!showForm && !approvedApplication && (
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="text-center pb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl">Become a Hero</CardTitle>
                        <CardDescription className="text-base">Join the volunteer network and help save lives in your community</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingApplication ? (
                            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                                <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-lg mb-2">Application Under Review</h3>
                                <p className="text-sm text-muted-foreground">Your volunteer application is being reviewed by our admins. You'll be notified once it's approved!</p>
                                <p className="text-xs text-muted-foreground mt-2">Applied on: {new Date(pendingApplication.createdAt).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold text-primary">500+</p>
                                        <p className="text-xs text-muted-foreground">Active Volunteers</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold text-primary">2,400</p>
                                        <p className="text-xs text-muted-foreground">Lives Saved</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-2xl font-bold text-primary">24/7</p>
                                        <p className="text-xs text-muted-foreground">Response Time</p>
                                    </div>
                                </div>
                                <Button className="w-full h-12 text-base" size="lg" onClick={() => setShowForm(true)}>
                                    Apply Now
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Volunteer Application Form</CardTitle>
                        <CardDescription>Fill out the form below to join our emergency response network</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="volunteerType">Volunteer Type</Label>
                                    <select
                                        id="volunteerType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.volunteerType}
                                        onChange={handleChange}
                                    >
                                        <option value="GENERAL">General Volunteer</option>
                                        <option value="MEDICAL">Medical Professional</option>
                                        <option value="RESCUE">Rescue & Recovery</option>
                                        <option value="LOGISTICS">Logistics Support</option>
                                        <option value="TECHNICAL">Technical Support</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="availability">Availability</Label>
                                    <select
                                        id="availability"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formData.availability}
                                        onChange={handleChange}
                                    >
                                        <option value="WEEKENDS">Weekends Only</option>
                                        <option value="WEEKDAYS">Weekdays Only</option>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="ON_CALL">On Call</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills & Expertise</Label>
                                <Input
                                    id="skills"
                                    placeholder="e.g., First Aid, CPR, Search & Rescue, Logistics"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Relevant Experience</Label>
                                <textarea
                                    id="experience"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Describe your relevant experience in emergency response or volunteering..."
                                    value={formData.experience}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivation">Why do you want to volunteer?</Label>
                                <textarea
                                    id="motivation"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Tell us what motivates you to help others..."
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="certifications">Certifications (Optional)</Label>
                                    <Input
                                        id="certifications"
                                        placeholder="e.g., EMT, Firefighter, etc."
                                        value={formData.certifications}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxDistanceKm">Max Travel Distance (km)</Label>
                                    <Input
                                        id="maxDistanceKm"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.maxDistanceKm}
                                        onChange={handleNumberChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                                    <Input
                                        id="alternatePhone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={formData.alternatePhone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                                    <Input
                                        id="emergencyContact"
                                        placeholder="Name and phone number"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="emergencyTraining"
                                    className="w-4 h-4 rounded border-input"
                                    checked={formData.emergencyTraining}
                                    onChange={handleChange}
                                />
                                <Label htmlFor="emergencyTraining" className="font-normal cursor-pointer">
                                    I have completed emergency response training
                                </Label>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowForm(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {approvedApplication && (
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Active Volunteer
                        </CardTitle>
                        <CardDescription>You are an approved volunteer in the emergency response network</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Volunteer ID</span>
                                <span className="font-medium">#{approvedApplication.id.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium capitalize">{approvedApplication.volunteerType.toLowerCase().replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Approved On</span>
                                <span className="font-medium">{approvedApplication.reviewedAt ? new Date(approvedApplication.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
