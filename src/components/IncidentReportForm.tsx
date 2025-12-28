import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useGeolocation } from '../hooks/useGeolocation';
import { incidentApi } from '../services/api';
import { toast } from 'sonner';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Navigation,
  Zap,
  Brain,
  Plus,
  Minus,
} from 'lucide-react';

const incidentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum([
    'FIRE',
    'FLOOD', 
    'VIOLENCE',
    'ROAD_ACCIDENT',
    'GAS_LEAK',
    'POWER_OUTAGE',
    'INFRASTRUCTURE_FAILURE',
    'MEDICAL_EMERGENCY',
    'NATURAL_DISASTER',
    'OTHER'
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  injuriesReported: z.number().min(0).optional(),
  peopleInvolved: z.number().min(0).optional(),
  mediaFiles: z.array(z.any()).optional(),
  // Guided accident questions
  hasInjuries: z.boolean().optional(),
  hasBleeding: z.boolean().optional(),
  hasUnconsciousPeople: z.boolean().optional(),
  vehiclesInvolved: z.number().min(0).optional(),
  hasFireRisk: z.boolean().optional(),
  hasExplosionRisk: z.boolean().optional(),
  isRoadBlocked: z.boolean().optional(),
  trafficSeverity: z.enum(['NONE', 'LIGHT', 'MODERATE', 'SEVERE']).optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (incident: any) => void;
}

const incidentTypes = [
  { value: 'FIRE', label: 'Fire Emergency', icon: '🔥', color: 'text-red-600' },
  { value: 'FLOOD', label: 'Flood', icon: '🌊', color: 'text-blue-600' },
  { value: 'VIOLENCE', label: 'Violence/Crime', icon: '🚨', color: 'text-red-700' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident', icon: '🚗', color: 'text-orange-600' },
  { value: 'GAS_LEAK', label: 'Gas Leak', icon: '⚠️', color: 'text-yellow-600' },
  { value: 'POWER_OUTAGE', label: 'Power Outage', icon: '⚡', color: 'text-gray-600' },
  { value: 'INFRASTRUCTURE_FAILURE', label: 'Infrastructure Failure', icon: '🏗️', color: 'text-gray-700' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🏥', color: 'text-green-600' },
  { value: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: '🌪️', color: 'text-purple-600' },
  { value: 'OTHER', label: 'Other', icon: '📍', color: 'text-gray-500' },
];

const severityLevels = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700', description: 'Minor incident, no immediate danger' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700', description: 'Moderate incident, some risk involved' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700', description: 'Serious incident, significant risk' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700', description: 'Life-threatening emergency' },
];

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [suggestedSeverity, setSuggestedSeverity] = useState<{
    severity: string;
    explanation: string;
    confidence: number;
  } | null>(null);
  const [emergencyRecommendations, setEmergencyRecommendations] = useState<{
    ambulance: boolean;
    police: boolean;
    fire: boolean;
    explanation: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  } | null>(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [showGuidedQuestions, setShowGuidedQuestions] = useState(false);

  const { location, error: locationError, getLocation, loading: locationLoading } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'OTHER',
      severity: 'MEDIUM',
      latitude: 0,
      longitude: 0,
      address: '',
      landmark: '',
      injuriesReported: 0,
      peopleInvolved: 1,
      mediaFiles: [],
      // Guided questions defaults
      hasInjuries: false,
      hasBleeding: false,
      hasUnconsciousPeople: false,
      vehiclesInvolved: 0,
      hasFireRisk: false,
      hasExplosionRisk: false,
      isRoadBlocked: false,
      trafficSeverity: 'NONE',
    },
  });

  // Get location when form opens
  useEffect(() => {
    if (isOpen && !location) {
      getLocation();
    }
  }, [isOpen, location, getLocation]);

  // Update form with location data
  useEffect(() => {
    if (location) {
      form.setValue('latitude', location.latitude);
      form.setValue('longitude', location.longitude);
      
      // Try to get address from coordinates
      reverseGeocode(location.latitude, location.longitude);
    }
  }, [location, form]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || data.locality || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        form.setValue('address', address);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const getSeveritySuggestion = useCallback(async () => {
    const formData = form.getValues();
    
    if (!formData.type || !formData.description || formData.description.length < 10) {
      return;
    }

    setIsGettingSuggestion(true);
    
    try {
      const suggestionData = {
        type: formData.type,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        injuriesReported: formData.injuriesReported || 0,
        peopleInvolved: formData.peopleInvolved || 1,
        nearSensitiveLocation: false, // Could be determined by location
        // Include guided questions for better analysis
        hasInjuries: formData.hasInjuries,
        hasBleeding: formData.hasBleeding,
        hasUnconsciousPeople: formData.hasUnconsciousPeople,
        vehiclesInvolved: formData.vehiclesInvolved || 0,
        hasFireRisk: formData.hasFireRisk,
        hasExplosionRisk: formData.hasExplosionRisk,
        isRoadBlocked: formData.isRoadBlocked,
        trafficSeverity: formData.trafficSeverity,
      };

      const response = await incidentApi.getSeveritySuggestion(suggestionData);
      
      if (response.success) {
        setSuggestedSeverity({
          severity: response.suggestedSeverity,
          explanation: response.explanation,
          confidence: response.confidence || 0.8,
        });
      }

      // Get emergency service recommendations for accidents
      if (formData.type === 'ROAD_ACCIDENT' || formData.type === 'MEDICAL_EMERGENCY') {
        const emergencyResponse = await incidentApi.getEmergencyRecommendations(suggestionData);
        if (emergencyResponse.success) {
          setEmergencyRecommendations({
            ambulance: emergencyResponse.recommendAmbulance,
            police: emergencyResponse.recommendPolice,
            fire: emergencyResponse.recommendFire,
            explanation: emergencyResponse.explanation,
            urgency: emergencyResponse.urgency,
          });
        }
      }
    } catch (error) {
      console.error('Failed to get severity suggestion:', error);
    } finally {
      setIsGettingSuggestion(false);
    }
  }, [form]);

  // Get severity suggestion when relevant fields change
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (['type', 'description', 'injuriesReported', 'peopleInvolved', 'hasInjuries', 'hasBleeding', 'hasUnconsciousPeople', 'vehiclesInvolved', 'hasFireRisk', 'hasExplosionRisk', 'isRoadBlocked', 'trafficSeverity'].includes(name || '')) {
        const timeoutId = setTimeout(() => {
          getSeveritySuggestion();
        }, 1000); // Debounce

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, getSeveritySuggestion]);

  // Show guided questions for specific incident types
  useEffect(() => {
    const currentType = form.watch('type');
    setShowGuidedQuestions(currentType === 'ROAD_ACCIDENT' || currentType === 'MEDICAL_EMERGENCY');
  }, [form]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaUrls(prev => [...prev, url]);
    });
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => {
      URL.revokeObjectURL(prev[index]); // Clean up object URL
      return prev.filter((_, i) => i !== index);
    });
  };

  const applySuggestedSeverity = () => {
    if (suggestedSeverity) {
      form.setValue('severity', suggestedSeverity.severity as any);
      toast.success('Severity suggestion applied');
    }
  };

  const onSubmit = async (data: IncidentFormData) => {
    if (!location) {
      toast.error('Location is required to submit incident report');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files first (in a real app, you'd upload to a file storage service)
      const uploadedMediaUrls: string[] = [];
      
      for (const file of mediaFiles) {
        // Simulate file upload - in production, upload to cloud storage
        const mockUrl = `https://example.com/media/${Date.now()}-${file.name}`;
        uploadedMediaUrls.push(mockUrl);
      }

      const incidentData = {
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        landmark: data.landmark,
        injuriesReported: data.injuriesReported || 0,
        peopleInvolved: data.peopleInvolved || 1,
        mediaUrls: uploadedMediaUrls,
      };

      const response = await incidentApi.create(incidentData);

      if (response.success) {
        toast.success('Incident reported successfully!', {
          description: 'Emergency services have been notified.',
        });
        
        if (onSuccess) {
          onSuccess(response.incident);
        }
        
        onClose();
        form.reset();
        setMediaFiles([]);
        setMediaUrls([]);
        setSuggestedSeverity(null);
      } else {
        throw new Error(response.message || 'Failed to submit incident report');
      }
    } catch (error) {
      console.error('Incident submission error:', error);
      toast.error('Failed to submit incident report', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityInfo = (severity: string) => {
    return severityLevels.find(s => s.value === severity) || severityLevels[1];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report Incident
          </DialogTitle>
          <DialogDescription>
            Report an emergency or incident in your area. All reports are timestamped and 
            immediately shared with emergency services and the community.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Location Information</span>
                </div>
                
                {locationLoading ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Getting your location...</span>
                  </div>
                ) : locationError ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{locationError.message}</span>
                  </div>
                ) : location ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Location acquired</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {form.watch('address') || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getLocation}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Location
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incidentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the incident" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a clear, concise title for the incident
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Severity Level
                        {suggestedSeverity && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Suggested
                          </Badge>
                        )}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {severityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={level.color}>
                                  {level.label}
                                </Badge>
                                <span className="text-sm text-gray-600">{level.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* ML Severity Suggestion */}
                      {suggestedSeverity && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  AI Suggests: {getSeverityInfo(suggestedSeverity.severity).label}
                                </span>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {Math.round(suggestedSeverity.confidence * 100)}% confidence
                                </Badge>
                              </div>
                              <p className="text-xs text-blue-700">{suggestedSeverity.explanation}</p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={applySuggestedSeverity}
                              className="ml-2"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {isGettingSuggestion && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Getting AI severity suggestion...</span>
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="injuriesReported"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Injuries Reported</FormLabel>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              className="text-center"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange((field.value || 0) + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="peopleInvolved"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>People Involved</FormLabel>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="text-center"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange((field.value || 1) + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Guided Questions for Accidents/Medical Emergencies */}
            {showGuidedQuestions && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Guided Assessment</span>
                    <Badge className="bg-orange-100 text-orange-700">
                      Help us recommend the right emergency services
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {form.watch('type') === 'ROAD_ACCIDENT' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vehiclesInvolved"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicles Involved</FormLabel>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="text-center"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange((field.value || 0) + 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="trafficSeverity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Traffic Impact</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select traffic impact" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="NONE">No Impact</SelectItem>
                                    <SelectItem value="LIGHT">Light Delays</SelectItem>
                                    <SelectItem value="MODERATE">Moderate Delays</SelectItem>
                                    <SelectItem value="SEVERE">Road Blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="isRoadBlocked"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm">Road Blocked?</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hasFireRisk"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm">Fire Risk?</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hasExplosionRisk"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm">Explosion Risk?</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {/* Medical/Injury Questions for both types */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="text-red-600">🏥</span>
                        Medical Assessment
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="hasInjuries"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">Any Injuries?</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasBleeding"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">Bleeding?</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasUnconsciousPeople"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm">Unconscious People?</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Emergency Service Recommendations */}
                    {emergencyRecommendations && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">AI Emergency Service Recommendations</span>
                          <Badge className={`${
                            emergencyRecommendations.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            emergencyRecommendations.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            emergencyRecommendations.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {emergencyRecommendations.urgency} Priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className={`p-3 rounded-lg text-center ${
                            emergencyRecommendations.ambulance ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="text-2xl mb-1">🚑</div>
                            <div className="text-sm font-medium">Ambulance</div>
                            <div className="text-xs">{emergencyRecommendations.ambulance ? 'Recommended' : 'Not needed'}</div>
                          </div>
                          
                          <div className={`p-3 rounded-lg text-center ${
                            emergencyRecommendations.police ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="text-2xl mb-1">🚔</div>
                            <div className="text-sm font-medium">Police</div>
                            <div className="text-xs">{emergencyRecommendations.police ? 'Recommended' : 'Not needed'}</div>
                          </div>
                          
                          <div className={`p-3 rounded-lg text-center ${
                            emergencyRecommendations.fire ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="text-2xl mb-1">🚒</div>
                            <div className="text-sm font-medium">Fire Brigade</div>
                            <div className="text-xs">{emergencyRecommendations.fire ? 'Recommended' : 'Not needed'}</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-blue-700">{emergencyRecommendations.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of what happened, when it occurred, and any other relevant information..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include as much detail as possible to help emergency responders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address or location description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Override or refine the auto-detected address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearby Landmark (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Near City Hall, Behind McDonald's" {...field} />
                    </FormControl>
                    <FormDescription>
                      Help responders locate the incident quickly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos/Videos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB each</p>
                </div>
              </div>

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={mediaUrls[index]}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={mediaUrls[index]}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMediaFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamp Display */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Report will be timestamped: {new Date().toLocaleString()}</span>
            </div>
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !location}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Submit Incident Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentReportForm;