import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
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
import { volunteerApi } from '../services/api';
import { toast } from 'sonner';
import {
  Heart,
  Shield,
  Truck,
  Stethoscope,
  Wrench,
  Users,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const volunteerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  skills: z.string().min(10, 'Please describe your skills (minimum 10 characters)'),
  preferredRole: z.enum([
    'FIRST_AID',
    'SEARCH_RESCUE',
    'LOGISTICS',
    'MEDICAL_AID',
    'TECHNICAL_SUPPORT',
    'COMMUNITY_OUTREACH',
  ]),
  availability: z.string().min(5, 'Please describe your availability'),
  experience: z.string().optional(),
  certifications: z.string().optional(),
  emergencyTraining: z.string().optional(),
  motivation: z.string().min(20, 'Please explain your motivation (minimum 20 characters)'),
  emergencyContact: z.string().optional(),
  maxDistanceKm: z.number().min(1).max(100).optional(),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const volunteerRoles = [
  {
    value: 'FIRST_AID',
    label: 'First Aid Responder',
    description: 'Provide immediate medical assistance',
    icon: Heart,
    color: 'bg-red-100 text-red-700',
  },
  {
    value: 'SEARCH_RESCUE',
    label: 'Search & Rescue',
    description: 'Help locate and rescue people in emergencies',
    icon: Shield,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'LOGISTICS',
    label: 'Logistics Support',
    description: 'Coordinate resources and supplies',
    icon: Truck,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'MEDICAL_AID',
    label: 'Medical Aid',
    description: 'Advanced medical support and triage',
    icon: Stethoscope,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'TECHNICAL_SUPPORT',
    label: 'Technical Support',
    description: 'Communications and technical assistance',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    value: 'COMMUNITY_OUTREACH',
    label: 'Community Outreach',
    description: 'Public communication and coordination',
    icon: Users,
    color: 'bg-teal-100 text-teal-700',
  },
];

interface VolunteerRegistrationFormProps {
  onSuccess?: () => void;
  className?: string;
}

const VolunteerRegistrationForm: React.FC<VolunteerRegistrationFormProps> = ({
  onSuccess,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      skills: '',
      preferredRole: 'FIRST_AID',
      availability: '',
      experience: '',
      certifications: '',
      emergencyTraining: '',
      motivation: '',
      emergencyContact: '',
      maxDistanceKm: 10,
    },
  });

  const onSubmit = async (data: VolunteerFormData) => {
    try {
      setIsSubmitting(true);

      // Map form data to API format
      const applicationData = {
        motivation: data.motivation,
        skills: data.skills,
        availability: data.availability,
        experience: data.experience || '',
        certifications: data.certifications || '',
        emergencyTraining: data.emergencyTraining || '',
        volunteerType: data.preferredRole,
        maxDistanceKm: data.maxDistanceKm || 10,
        emergencyContact: data.emergencyContact || '',
        // Note: name, email, phone are handled by the user's profile
      };

      const response = await volunteerApi.apply(applicationData);

      if (response.success) {
        setIsSubmitted(true);
        toast.success('Application submitted successfully!', {
          description: 'We will review your application and get back to you soon.',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Volunteer application error:', error);
      toast.error('Failed to submit application', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for volunteering to help your community. We'll review your application and contact you soon.
          </p>
          <Button
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            variant="outline"
          >
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Volunteer Registration
        </CardTitle>
        <CardDescription>
          Join our community response team and help make a difference during emergencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Personal Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact info" {...field} />
                      </FormControl>
                      <FormDescription>
                        Contact person in case of emergency
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Volunteer Role Selection */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Preferred Role</h4>
              
              <FormField
                control={form.control}
                name="preferredRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select your preferred volunteer role</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {volunteerRoles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = field.value === role.value;
                        
                        return (
                          <div
                            key={role.value}
                            onClick={() => field.onChange(role.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{role.label}</h5>
                                <p className="text-sm text-gray-600">{role.description}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills and Experience */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Skills & Experience</h4>
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills & Qualifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your relevant skills, qualifications, and abilities..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any relevant skills, training, or qualifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Experience</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any previous volunteer or emergency response experience..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="First Aid, CPR, EMT, etc..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emergencyTraining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Training</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="CERT, disaster response training, etc..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Availability</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When are you available?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Weekdays, weekends, evenings, 24/7 emergency calls..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDistanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Travel Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        How far are you willing to travel for volunteer activities?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Motivation */}
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to volunteer?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your motivation to help the community during emergencies..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help us understand your commitment and motivation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VolunteerRegistrationForm;