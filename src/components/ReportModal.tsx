import React, { useState } from 'react';
import { X, Camera, MapPin, AlertTriangle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { IncidentType, SeverityLevel } from '../types';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const incidentTypes: { type: IncidentType; icon: string; label: string }[] = [
  { type: 'Accident', icon: '🚗', label: 'Accident' },
  { type: 'Medical', icon: '🏥', label: 'Medical' },
  { type: 'Fire', icon: '🔥', label: 'Fire' },
  { type: 'Crime', icon: '🚨', label: 'Crime' },
  { type: 'Other', icon: '⚠️', label: 'Other' },
];

const severityLevels: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { addIncident } = useIncidents();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addIncident({
      type: selectedType,
      description,
      severity,
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.02,
        lng: 77.5946 + (Math.random() - 0.5) * 0.02,
        address: 'Current Location',
      },
      status: 'Pending',
      reporterId: user?.id || 'anonymous',
      reporterName: user?.name || 'Anonymous',
      verifications: 0,
      flags: 0,
      media: [],
    });

    toast.success('Incident reported successfully!', {
      description: 'Your report has been submitted for verification.',
    });

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setSeverity('Medium');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Report Incident</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 px-4 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {step === 1 && (
            <div className="fade-in">
              <p className="text-muted-foreground mb-4">
                What type of incident are you reporting?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {incidentTypes.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setStep(2);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      selectedType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <span className="text-3xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Describe the incident
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's happening? Be as specific as possible..."
                  className="w-full h-32 px-4 py-3 bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Severity Level
                </label>
                <div className="flex gap-2">
                  {severityLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverity(level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        severity === level
                          ? level === 'Critical'
                            ? 'bg-critical text-critical-foreground'
                            : level === 'High'
                            ? 'bg-destructive text-destructive-foreground'
                            : level === 'Medium'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!description.trim()}
                className="w-full mt-4"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!description.trim()}
                >
                  Continue
                </Button>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Using your current location
                </p>
              </div>

              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="font-medium">Add Photos (Optional)</span>
                </div>
                <button className="w-full py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  Tap to add photos
                </button>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Emergency?</p>
                    <p className="text-sm text-muted-foreground">
                      If this is a life-threatening emergency, call emergency
                      services immediately.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Back button for steps 2 and 3 */}
        {step > 1 && (
          <div className="p-4 pt-0">
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
