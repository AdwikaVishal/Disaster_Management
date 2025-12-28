import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { emergencyApi } from '../services/api';
import { toast } from 'sonner';
import {
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  Zap,
  Users,
  Navigation,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
}

interface SOSButtonProps {
  className?: string;
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  className = '', 
  variant = 'floating',
  size = 'lg' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showContactsDialog, setShowContactsDialog] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
  });

  // Load user's emergency contacts on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadEmergencyContacts();
    }
  }, [isAuthenticated]);

  const loadEmergencyContacts = async () => {
    try {
      const response = await emergencyApi.getUserContacts();
      if (response.success && response.emergencyContacts) {
        const contacts: EmergencyContact[] = [];
        
        if (response.emergencyContacts.contact1) {
          contacts.push({
            id: '1',
            name: 'Emergency Contact 1',
            email: response.emergencyContacts.contact1,
            relationship: 'Primary Contact',
          });
        }
        
        if (response.emergencyContacts.contact2) {
          contacts.push({
            id: '2',
            name: 'Emergency Contact 2',
            email: response.emergencyContacts.contact2,
            relationship: 'Secondary Contact',
          });
        }
        
        if (response.emergencyContacts.contact3) {
          contacts.push({
            id: '3',
            name: 'Emergency Contact 3',
            email: response.emergencyContacts.contact3,
            relationship: 'Tertiary Contact',
          });
        }
        
        setEmergencyContacts(contacts);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            // Try to get address from coordinates using reverse geocoding
            const address = await reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              accuracy,
              address,
            });
          } catch (error) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              latitude,
              longitude,
              accuracy,
            });
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a simple reverse geocoding service (in production, use a proper service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || data.locality || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const handleSOSClick = async () => {
    setShowConfirmDialog(true);
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const locationData = await getCurrentLocation();
      setLocation(locationData);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const sendSOSAlert = async () => {
    if (!location) {
      toast.error('Location is required to send SOS alert');
      return;
    }

    if (emergencyContacts.length === 0) {
      toast.error('No emergency contacts configured');
      setShowContactsDialog(true);
      return;
    }

    setIsSendingAlert(true);

    try {
      const contactEmails = emergencyContacts.map(contact => contact.email);
      
      const sosData = {
        message: emergencyMessage || 'Emergency assistance needed - SOS alert triggered',
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.address,
        emergencyContacts: contactEmails,
      };

      const response = await emergencyApi.sendSOS(sosData);

      if (response.success) {
        toast.success('SOS alert sent successfully!', {
          description: `${response.contactsNotified} contacts have been notified.`,
        });
        
        setShowConfirmDialog(false);
        setEmergencyMessage('');
      } else {
        throw new Error(response.message || 'Failed to send SOS alert');
      }
    } catch (error) {
      console.error('SOS alert error:', error);
      toast.error('Failed to send SOS alert', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSendingAlert(false);
    }
  };

  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }

    if (emergencyContacts.length >= 3) {
      toast.error('Maximum 3 emergency contacts allowed');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      relationship: newContact.relationship || 'Emergency Contact',
    };

    setEmergencyContacts([...emergencyContacts, contact]);
    setNewContact({ name: '', email: '', phone: '', relationship: '' });
    
    // Save to backend
    saveEmergencyContacts([...emergencyContacts, contact]);
  };

  const removeEmergencyContact = (id: string) => {
    const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
    setEmergencyContacts(updatedContacts);
    saveEmergencyContacts(updatedContacts);
  };

  const saveEmergencyContacts = async (contacts: EmergencyContact[]) => {
    if (!isAuthenticated) return;

    try {
      const contactData = {
        contact1: contacts[0]?.email || '',
        contact2: contacts[1]?.email || '',
        contact3: contacts[2]?.email || '',
      };

      await emergencyApi.updateContacts(contactData);
      toast.success('Emergency contacts updated');
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
      toast.error('Failed to save emergency contacts');
    }
  };

  const buttonSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'floating') {
    return (
      <>
        {/* Floating SOS Button */}
        <button
          onClick={handleSOSClick}
          className={`fixed bottom-6 right-6 ${buttonSizeClasses[size]} bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 ${className}`}
          aria-label="Emergency SOS Alert"
        >
          <Phone className={iconSizeClasses[size]} />
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        </button>

        {/* SOS Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Emergency SOS Alert
              </DialogTitle>
              <DialogDescription>
                This will immediately notify your emergency contacts with your location and situation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Location Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Location Status</span>
                </div>
                
                {isGettingLocation ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Getting your location...</span>
                  </div>
                ) : locationError ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{locationError}</span>
                  </div>
                ) : location ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Location acquired</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Emergency Contacts */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Emergency Contacts</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowContactsDialog(true)}
                  >
                    Manage
                  </Button>
                </div>
                
                {emergencyContacts.length === 0 ? (
                  <p className="text-sm text-red-600">No emergency contacts configured</p>
                ) : (
                  <div className="space-y-1">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="text-sm text-gray-600">
                        {contact.name} ({contact.email})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Message (Optional)
                </label>
                <Textarea
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  placeholder="Describe your emergency situation..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Alert will be sent at: {new Date().toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSendingAlert}
              >
                Cancel
              </Button>
              <Button
                onClick={sendSOSAlert}
                disabled={isSendingAlert || !location || emergencyContacts.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSendingAlert ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Alert...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Send SOS Alert
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Emergency Contacts Management Dialog */}
        <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Emergency Contacts</DialogTitle>
              <DialogDescription>
                Add up to 3 emergency contacts who will be notified during SOS alerts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Contacts */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Contacts</h4>
                {emergencyContacts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No emergency contacts added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-sm text-gray-600">{contact.phone}</p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {contact.relationship}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeEmergencyContact(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Contact */}
              {emergencyContacts.length < 3 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Add New Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Input
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (Optional)
                      </label>
                      <Input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <Input
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                        placeholder="Family, Friend, etc."
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addEmergencyContact}
                    className="mt-4"
                    disabled={!newContact.name || !newContact.email}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowContactsDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={handleSOSClick}
      className={`bg-red-600 hover:bg-red-700 text-white ${className}`}
      size={size}
    >
      <Phone className="w-4 h-4 mr-2" />
      Emergency SOS
    </Button>
  );
};

export default SOSButton;