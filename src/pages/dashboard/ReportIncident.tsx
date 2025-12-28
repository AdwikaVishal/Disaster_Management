import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MapPin, Loader2, CheckCircle2, AlertCircle, Sparkles, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncidentService } from '@/services/incident.service';
import { useNavigate } from 'react-router-dom';

export default function ReportIncident() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    // AI Analysis State
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    // Advanced Details State
    const [advancedDetails, setAdvancedDetails] = useState({
        hasBleeding: false,
        hasUnconsciousPeople: false,
        hasFireRisk: false,
        isRoadBlocked: false
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'FIRE',
        severity: 'MEDIUM',
        latitude: 0,
        longitude: 0,
        address: '',
        landmark: '',
        injuriesReported: 0,
        peopleInvolved: 0
    });

    // Get user's current location on mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                    }));

                    // Try to get address from coordinates
                    const locationInfo = await IncidentService.getLocationInfo(lat, lng);
                    if (locationInfo.success && locationInfo.locationInfo) {
                        setFormData(prev => ({
                            ...prev,
                            address: locationInfo.locationInfo.address || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
                        }));
                    }

                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Default to a location if geolocation fails
                    setFormData(prev => ({
                        ...prev,
                        latitude: 28.6139,
                        longitude: 77.2090,
                        address: 'New Delhi, India (Default)'
                    }));
                    setIsLoadingLocation(false);
                }
            );
        } else {
            setFormData(prev => ({
                ...prev,
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'New Delhi, India (Default)'
            }));
            setIsLoadingLocation(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: parseInt(value) || 0
        }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setAdvancedDetails(prev => ({
            ...prev,
            [id]: checked
        }));
    };

    const analyzeIncident = async () => {
        if (!formData.description) return;

        setAiLoading(true);
        setAiResult(null);

        try {
            const analysisData = {
                ...formData,
                hasInjuries: formData.injuriesReported > 0,
                ...advancedDetails,
                vehiclesInvolved: formData.type === 'ROAD_ACCIDENT' ? 1 : 0 // Simple inference
            };

            const [severityRes, emergencyRes] = await Promise.all([
                IncidentService.suggestSeverity(analysisData),
                IncidentService.getEmergencyRecommendations(analysisData)
            ]);

            setAiResult({
                suggestedSeverity: severityRes.suggestedSeverity,
                severityExplanation: severityRes.explanation,
                recommendations: {
                    ambulance: emergencyRes.recommendAmbulance,
                    police: emergencyRes.recommendPolice,
                    fire: emergencyRes.recommendFire,
                    explanation: emergencyRes.explanation
                }
            });

        } catch (err) {
            console.error("AI Analysis failed", err);
        } finally {
            setAiLoading(false);
        }
    };

    const applyAiSuggestions = () => {
        if (aiResult?.suggestedSeverity) {
            setFormData(prev => ({
                ...prev,
                severity: aiResult.suggestedSeverity
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSubmitSuccess(false);

        try {
            const response = await IncidentService.createIncident(formData);

            if (response.success) {
                setSubmitSuccess(true);
                // Reset form after 2 seconds and navigate to map
                setTimeout(() => {
                    navigate('/dashboard/map');
                }, 2000);
            } else {
                setError(response.message || 'Failed to submit incident');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Report an Incident</h1>
                <p className="text-muted-foreground">Your report will be verified and shared with emergency responders.</p>
            </div>

            {submitSuccess && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">Incident Reported Successfully!</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">Redirecting to map view...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Incident Details</CardTitle>
                    <CardDescription>Please provide as much accurate information as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Incident Title</Label>
                            <Input
                                id="title"
                                placeholder="Brief title of the incident"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Incident Type</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="FIRE">Fire</option>
                                    <option value="FLOOD">Flood</option>
                                    <option value="EARTHQUAKE">Earthquake</option>
                                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                                    <option value="ROAD_ACCIDENT">Road Accident</option>
                                    <option value="BUILDING_COLLAPSE">Building Collapse</option>
                                    <option value="GAS_LEAK">Gas Leak</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity</Label>
                                <select
                                    id="severity"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.severity}
                                    onChange={handleChange}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    className="pl-9"
                                    placeholder={isLoadingLocation ? "Fetching your location..." : "Location address"}
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={isLoadingLocation}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-8 text-xs"
                                    onClick={getCurrentLocation}
                                    disabled={isLoadingLocation}
                                >
                                    {isLoadingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Coordinates: {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
                            <Input
                                id="landmark"
                                placeholder="e.g., Near City Hospital"
                                value={formData.landmark}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <div className="relative">
                                <textarea
                                    id="description"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pb-12"
                                    placeholder="Describe what is happening including severity and immediate dangers..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* AI Result Display */}
                            {aiResult && (
                                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> AI Analysis Result
                                            </p>
                                            <div className="mt-2 space-y-1 text-purple-800 dark:text-purple-400">
                                                <p>Suggested Severity: <span className="font-bold">{aiResult.suggestedSeverity}</span></p>
                                                <p className="text-xs opacity-90">{aiResult.severityExplanation}</p>

                                                <div className="mt-2">
                                                    <p className="font-medium">Recommended Services:</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {aiResult.recommendations.ambulance && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs flex items-center gap-1"><Siren className="w-3 h-3" /> Ambulance</span>}
                                                        {aiResult.recommendations.police && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1"><Siren className="w-3 h-3" /> Police</span>}
                                                        {aiResult.recommendations.fire && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs flex items-center gap-1"><Siren className="w-3 h-3" /> Fire</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={applyAiSuggestions}
                                            className="text-xs h-7 border-purple-200 hover:bg-purple-100 hover:text-purple-900"
                                        >
                                            Apply Suggestions
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="injuriesReported">Injuries Reported</Label>
                                <Input
                                    id="injuriesReported"
                                    type="number"
                                    min="0"
                                    value={formData.injuriesReported}
                                    onChange={handleNumberChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="peopleInvolved">People Involved</Label>
                                <Input
                                    id="peopleInvolved"
                                    type="number"
                                    min="0"
                                    value={formData.peopleInvolved}
                                    onChange={handleNumberChange}
                                />
                            </div>
                        </div>

                        {/* Advanced Checkboxes */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={advancedDetails.hasBleeding}
                                    onChange={(e) => handleCheckboxChange('hasBleeding', e.target.checked)}
                                />
                                <span className="text-sm">Severe Bleeding?</span>
                            </Label>
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={advancedDetails.hasUnconsciousPeople}
                                    onChange={(e) => handleCheckboxChange('hasUnconsciousPeople', e.target.checked)}
                                />
                                <span className="text-sm">Unconscious People?</span>
                            </Label>
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={advancedDetails.hasFireRisk}
                                    onChange={(e) => handleCheckboxChange('hasFireRisk', e.target.checked)}
                                />
                                <span className="text-sm">Fire/Explosion Risk?</span>
                            </Label>
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={advancedDetails.isRoadBlocked}
                                    onChange={(e) => handleCheckboxChange('isRoadBlocked', e.target.checked)}
                                />
                                <span className="text-sm">Road Blocked?</span>
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className={cn("w-full", isSubmitting && "opacity-80")}
                            disabled={isSubmitting || submitSuccess}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Report...
                                </>
                            ) : submitSuccess ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Submitted Successfully
                                </>
                            ) : (
                                'Submit Report'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
