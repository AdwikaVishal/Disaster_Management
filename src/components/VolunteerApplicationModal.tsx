import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { X, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { VolunteerService, CreateVolunteerApplicationData } from '@/services/volunteer.service';
import { useNavigate } from 'react-router-dom';

interface VolunteerApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VolunteerApplicationModal({ isOpen, onClose }: VolunteerApplicationModalProps) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState<CreateVolunteerApplicationData>({
        volunteerType: '',
        skills: '',
        experience: '',
        availability: '',
        motivation: '',
        emergencyTraining: false,
        certifications: '',
        alternatePhone: '',
        emergencyContact: '',
        maxDistanceKm: 10
    });

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setError('');
            // Try to get location automatically
            detectLocation();
        }
    }, [isOpen]);

    const detectLocation = () => {
        setLocationStatus('loading');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('success');
                },
                (err) => {
                    console.error("Location error:", err);
                    setLocationStatus('error');
                }
            );
        } else {
            setLocationStatus('error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Append location to motivation if available, since there is no specific field for it in the interface
            let finalData = { ...formData };
            if (location) {
                finalData.motivation = `${finalData.motivation}\n\n[Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}]`;
            }

            const response = await VolunteerService.submitApplication(finalData);

            if (response.success) {
                setIsSuccess(true);
                // Close after a delay and redirect
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setFormData({
                        volunteerType: '',
                        skills: '',
                        experience: '',
                        availability: '',
                        motivation: '',
                        emergencyTraining: false,
                        certifications: '',
                        alternatePhone: '',
                        emergencyContact: '',
                        maxDistanceKm: 10
                    });
                    navigate('/dashboard/volunteer');
                }, 1500);
            } else {
                setError(response.message || 'Failed to submit application');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto overflow-x-hidden">

                {/* Header with Gradient */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10 shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Become a Volunteer</h2>
                        <p className="text-blue-100 text-sm mt-1">Join our network of heroes and help your community.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full text-white hover:bg-white/20">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in zoom-in-50 duration-300">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Application Submitted!</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                                    Thank you for your interest. We are redirecting you to the volunteer dashboard...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Location Status */}
                            <div className={`flex items-center gap-3 text-sm p-4 rounded-lg border ${locationStatus === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'
                                }`}>
                                <MapPin className={`w-5 h-5 ${locationStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
                                <span className="font-medium">
                                    {locationStatus === 'loading' && 'Detecting your location...'}
                                    {locationStatus === 'success' && `Location captured: ${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`}
                                    {locationStatus === 'error' && 'Could not detect location (will proceed without it)'}
                                    {locationStatus === 'idle' && 'Location check pending...'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300">Volunteer Type</Label>
                                    <Select
                                        value={formData.volunteerType}
                                        onValueChange={(val) => setFormData({ ...formData, volunteerType: val })}
                                    >
                                        <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-indigo-500">
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEDICAL">Medical Response</SelectItem>
                                            <SelectItem value="RESCUE">Search & Rescue</SelectItem>
                                            <SelectItem value="LOGISTICS">Logistics & Supply</SelectItem>
                                            <SelectItem value="TECH">Technical Support</SelectItem>
                                            <SelectItem value="GENERAL">General/Support</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300">Max Travel Distance (km)</Label>
                                    <Input
                                        type="number"
                                        className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                        value={formData.maxDistanceKm}
                                        onChange={(e) => setFormData({ ...formData, maxDistanceKm: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300">Alternate Phone</Label>
                                    <Input
                                        placeholder="+91..."
                                        className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                        value={formData.alternatePhone}
                                        onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300">Emergency Contact</Label>
                                    <Input
                                        placeholder="Name & Number"
                                        className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                        value={formData.emergencyContact}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300">Skills</Label>
                                <Input
                                    placeholder="e.g. First Aid, Swimming, Driving..."
                                    className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300">Experience</Label>
                                <textarea
                                    className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                    placeholder="Describe any relevant past experience..."
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300">Availability</Label>
                                <Input
                                    placeholder="e.g. Weekends, Evenings, On-Call..."
                                    className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                    value={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300">Certifications (Optional)</Label>
                                <Input
                                    placeholder="List any valid certifications..."
                                    className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                    value={formData.certifications}
                                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300">Motivation</Label>
                                <textarea
                                    className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                    placeholder="Why do you want to volunteer?"
                                    value={formData.motivation}
                                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center space-x-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="training"
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    checked={formData.emergencyTraining as boolean}
                                    onChange={(e) => setFormData({ ...formData, emergencyTraining: e.target.checked })}
                                />
                                <Label htmlFor="training" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                    I have received formal emergency response training
                                </Label>
                            </div>

                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-slate-200 hover:bg-slate-50">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="min-w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                                >
                                    {isLoading ? (
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
                    )}
                </div>
            </div>
        </div>
    );
}
