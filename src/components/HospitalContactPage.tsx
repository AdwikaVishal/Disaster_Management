import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Phone,
  MapPin,
  Clock,
  Navigation,
  Mail,
  AlertTriangle,
  User,
  Loader2,
  CheckCircle,
  ExternalLink,
  Star,
  Activity,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { emergencyApi } from '../services/api';
import { toast } from 'sonner';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  distance?: number;
  specialties: string[];
  emergencyServices: boolean;
  traumaCenter: boolean;
  rating: number;
  availability: 'Available' | 'Busy' | 'Full';
}

interface EmergencyContact {
  patientName: string;
  location: string;
  injuries: string;
  callbackNumber: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalInfo: string;
}

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Main Street, Downtown',
    phone: '+1-555-0101',
    email: 'emergency@citygeneral.com',
    latitude: 12.9716,
    longitude: 77.5946,
    specialties: ['Emergency Medicine', 'Trauma Surgery', 'Cardiology'],
    emergencyServices: true,
    traumaCenter: true,
    rating: 4.8,
    availability: 'Available',
  },
  {
    id: '2',
    name: 'St. Mary Medical Center',
    address: '456 Oak Avenue, Midtown',
    phone: '+1-555-0102',
    email: 'emergency@stmary.org',
    latitude: 12.9816,
    longitude: 77.6046,
    specialties: ['Pediatrics', 'Emergency Medicine', 'Orthopedics'],
    emergencyServices: true,
    traumaCenter: false,
    rating: 4.6,
    availability: 'Busy',
  },
  {
    id: '3',
    name: 'Regional Trauma Center',
    address: '789 Pine Road, Northside',
    phone: '+1-555-0103',
    email: 'trauma@regional.com',
    latitude: 12.9916,
    longitude: 77.5846,
    specialties: ['Trauma Surgery', 'Neurosurgery', 'Emergency Medicine'],
    emergencyServices: true,
    traumaCenter: true,
    rating: 4.9,
    availability: 'Available',
  },
  {
    id: '4',
    name: 'Community Health Hospital',
    address: '321 Elm Street, Southside',
    phone: '+1-555-0104',
    email: 'emergency@community.health',
    latitude: 12.9616,
    longitude: 77.6146,
    specialties: ['Family Medicine', 'Emergency Medicine', 'Internal Medicine'],
    emergencyServices: true,
    traumaCenter: false,
    rating: 4.4,
    availability: 'Available',
  },
  {
    id: '5',
    name: 'Metropolitan Emergency Center',
    address: '654 Cedar Lane, Eastside',
    phone: '+1-555-0105',
    email: 'emergency@metro.center',
    latitude: 12.9516,
    longitude: 77.6246,
    specialties: ['Emergency Medicine', 'Critical Care', 'Radiology'],
    emergencyServices: true,
    traumaCenter: true,
    rating: 4.7,
    availability: 'Full',
  },
];

const HospitalContactPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState<EmergencyContact>({
    patientName: '',
    location: '',
    injuries: '',
    callbackNumber: '',
    urgency: 'MEDIUM',
    additionalInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { location, error: locationError, getLocation, loading: locationLoading } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (location) {
      calculateDistances();
    } else {
      // Show hospitals without distance sorting if location unavailable
      setHospitals([...MOCK_HOSPITALS]);
    }
  }, [location]);

  const calculateDistances = () => {
    if (!location) return;

    const hospitalsWithDistance = MOCK_HOSPITALS.map(hospital => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        hospital.latitude,
        hospital.longitude
      );
      return { ...hospital, distance };
    });

    // Sort by distance (closest first)
    hospitalsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setHospitals(hospitalsWithDistance);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const handleCall = (hospital: Hospital) => {
    // Open mobile dialer
    const phoneNumber = hospital.phone.replace(/[^\d+]/g, ''); // Clean phone number
    window.location.href = `tel:${phoneNumber}`;
    
    // Track the call attempt
    toast.success(`Dialing ${hospital.name}...`, {
      description: `Calling ${hospital.phone}`,
    });
  };

  const handleSendAlert = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setContactData(prev => ({
      ...prev,
      location: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '',
      callbackNumber: '', // User should fill this
    }));
    setShowContactForm(true);
  };

  const submitHospitalAlert = async () => {
    if (!selectedHospital || !contactData.patientName || !contactData.callbackNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const alertData = {
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        hospitalEmail: selectedHospital.email,
        patientName: contactData.patientName,
        location: contactData.location,
        latitude: location?.latitude,
        longitude: location?.longitude,
        injuries: contactData.injuries,
        callbackNumber: contactData.callbackNumber,
        urgency: contactData.urgency,
        additionalInfo: contactData.additionalInfo,
      };

      const response = await emergencyApi.dialHospital(alertData);

      if (response.success) {
        toast.success('Hospital alert sent successfully!', {
          description: `${selectedHospital.name} has been notified of the emergency.`,
        });
        
        setShowContactForm(false);
        setContactData({
          patientName: '',
          location: '',
          injuries: '',
          callbackNumber: '',
          urgency: 'MEDIUM',
          additionalInfo: '',
        });
      } else {
        throw new Error(response.message || 'Failed to send hospital alert');
      }
    } catch (error) {
      console.error('Hospital alert error:', error);
      toast.error('Failed to send hospital alert', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Busy': return 'bg-yellow-100 text-yellow-700';
      case 'Full': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Hospital Contacts</h1>
          <p className="text-gray-600 mt-1">
            Find and contact nearby hospitals for emergency medical assistance
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={getLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          Update Location
        </Button>
      </div>

      {/* Location Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Current Location</span>
          </div>
          
          {locationLoading ? (
            <div className="flex items-center gap-2 text-blue-600 mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting your location...</span>
            </div>
          ) : locationError ? (
            <div className="flex items-center gap-2 text-red-600 mt-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{locationError.message}</span>
            </div>
          ) : location ? (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Location acquired - hospitals sorted by distance
              </p>
              <p className="text-xs text-gray-500">
                Accuracy: ±{Math.round(location.accuracy)}m
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Location unavailable - showing all hospitals
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search hospitals by name, location, or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Hospital List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital, index) => (
          <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {hospital.name}
                    {hospital.traumaCenter && (
                      <Badge className="bg-red-100 text-red-700 text-xs">
                        Trauma Center
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {hospital.address}
                  </CardDescription>
                </div>
                
                {location && hospital.distance && (
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {hospital.distance} km
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Hospital Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{hospital.rating}</span>
                  </div>
                  <Badge className={getAvailabilityColor(hospital.availability)}>
                    <Activity className="w-3 h-3 mr-1" />
                    {hospital.availability}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3 h-3" />
                  {hospital.phone}
                </div>

                <div className="flex flex-wrap gap-1">
                  {hospital.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {hospital.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{hospital.specialties.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCall(hospital)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                
                <Button
                  onClick={() => handleSendAlert(hospital)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Alert
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between text-xs text-gray-500">
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${hospital.latitude},${hospital.longitude}`, '_blank')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <ExternalLink className="w-3 h-3" />
                  Directions
                </button>
                
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  24/7 Emergency
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Emergency Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-600" />
              Send Hospital Alert
            </DialogTitle>
            <DialogDescription>
              Send emergency notification to {selectedHospital?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Patient Name *
              </label>
              <Input
                type="text"
                placeholder="Enter patient name"
                value={contactData.patientName}
                onChange={(e) => setContactData(prev => ({ ...prev, patientName: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Callback Number *
              </label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={contactData.callbackNumber}
                onChange={(e) => setContactData(prev => ({ ...prev, callbackNumber: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Injuries/Condition
              </label>
              <Textarea
                placeholder="Describe injuries or medical condition..."
                value={contactData.injuries}
                onChange={(e) => setContactData(prev => ({ ...prev, injuries: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setContactData(prev => ({ ...prev, urgency: level }))}
                    className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                      contactData.urgency === level
                        ? getUrgencyColor(level)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Additional Information
              </label>
              <Textarea
                placeholder="Any additional details..."
                value={contactData.additionalInfo}
                onChange={(e) => setContactData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                className="min-h-[60px]"
              />
            </div>

            {location && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Location</span>
                </div>
                <p className="text-xs text-blue-700">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowContactForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitHospitalAlert}
              disabled={isSubmitting || !contactData.patientName || !contactData.callbackNumber}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Alert...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalContactPage;