import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Upload, 
  Clock, 
  AlertTriangle,
  Camera,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddIncidentModal = ({ isOpen, onClose }: AddIncidentModalProps) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    location: '',
    severity: '',
    media: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const incidentTypes = [
    { value: 'accident', label: 'Accident', icon: '🚗' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'medical', label: 'Medical', icon: '🚑' },
    { value: 'crime', label: 'Crime', icon: '🚨' },
    { value: 'disaster', label: 'Disaster', icon: '🌪️' },
    { value: 'other', label: 'Other', icon: '⚠️' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.title || !formData.severity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Incident created successfully!', {
      description: 'The incident has been added to the system and will appear in real-time feeds.'
    });
    
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setFormData({
      type: '',
      title: '',
      description: '',
      location: '',
      severity: '',
      media: []
    });
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          setUseCurrentLocation(false);
          toast.success('Location detected successfully');
        },
        (error) => {
          setUseCurrentLocation(false);
          toast.error('Unable to detect location');
        }
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...files].slice(0, 5) // Max 5 files
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div>
                  <CardTitle className="text-xl font-semibold">Add New Incident</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manually create or log a new incident into the system
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Incident Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Incident Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {incidentTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.type === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Incident Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Incident Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the incident"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the incident..."
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter address or coordinates"
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={useCurrentLocation}
                        className="px-3"
                      >
                        {useCurrentLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the location icon to auto-detect current position
                    </p>
                  </div>

                  {/* Severity Level */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Severity Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {severityLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.severity === level.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Badge className={`${level.color} border w-full justify-center`}>
                            {level.label}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Upload Media (Optional)</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Click to upload photos or videos</p>
                            <p className="text-xs text-muted-foreground">Max 5 files, up to 10MB each</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    {formData.media.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.media.map((file, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>Timestamp: {new Date().toLocaleString()}</span>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
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
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Incident...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Create Incident
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddIncidentModal;