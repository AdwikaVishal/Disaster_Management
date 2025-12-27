import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock,
  Loader2,
  Megaphone,
  Globe,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendAlertModal = ({ isOpen, onClose }: SendAlertModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    radius: '5',
    priority: '',
    expiration: ''
  });
  const [isSending, setIsSending] = useState(false);

  const audienceOptions = [
    { 
      value: 'all', 
      label: 'All Users', 
      icon: Globe,
      description: 'Send to all registered users',
      count: '1,247 users'
    },
    { 
      value: 'radius', 
      label: 'Users in Radius', 
      icon: Target,
      description: 'Send to users within specified area',
      count: 'Variable'
    }
  ];

  const priorityLevels = [
    { 
      value: 'info', 
      label: 'Info', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '💡',
      description: 'General information'
    },
    { 
      value: 'warning', 
      label: 'Warning', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⚠️',
      description: 'Important notice'
    },
    { 
      value: 'emergency', 
      label: 'Emergency', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '🚨',
      description: 'Immediate action required'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message || !formData.priority) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const targetCount = formData.audience === 'all' ? '1,247' : 
      formData.audience === 'radius' ? Math.floor(Math.random() * 500 + 100) : '0';
    
    toast.success('Alert sent successfully!', {
      description: `Emergency alert delivered to ${targetCount} users instantly.`
    });
    
    setIsSending(false);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      message: '',
      audience: 'all',
      radius: '5',
      priority: '',
      expiration: ''
    });
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-red-900">Send Emergency Alert</CardTitle>
                    <p className="text-sm text-red-700 mt-1">
                      Broadcast critical information to users instantly
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Alert Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Alert Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Severe Weather Warning, Emergency Evacuation"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      required
                    />
                  </div>

                  {/* Alert Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Alert Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Provide clear, actionable information. What should users do?"
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Keep messages clear and actionable. Include specific instructions if needed.
                    </p>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {audienceOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.audience === option.value
                              ? 'border-red-500 bg-red-50'
                              : 'border-border hover:border-red-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, audience: option.value }))}
                        >
                          <div className="flex items-center gap-3">
                            <option.icon className="w-5 h-5 text-red-600" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{option.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {option.count}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Radius Selection */}
                    {formData.audience === 'radius' && (
                      <div className="ml-8 space-y-2">
                        <label className="text-sm font-medium text-foreground">Radius (km)</label>
                        <div className="flex gap-2">
                          {['1', '5', '10', '25', '50'].map((radius) => (
                            <button
                              key={radius}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, radius }))}
                              className={`px-3 py-1 rounded-lg border text-sm ${
                                formData.radius === radius
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-border hover:border-red-300'
                              }`}
                            >
                              {radius}km
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alert Priority */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Alert Priority <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {priorityLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: level.value }))}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.priority === level.value
                              ? 'border-red-500 bg-red-50'
                              : 'border-border hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{level.icon}</span>
                            <Badge className={`${level.color} border`}>
                              {level.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expiration Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Expiration Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiration}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiration: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for permanent alert. Set expiration for time-sensitive information.
                    </p>
                  </div>

                  {/* Preview */}
                  {formData.title && formData.message && (
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Alert Preview
                      </h4>
                      <div className="bg-white p-3 rounded border-l-4 border-red-500">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            {formData.priority?.toUpperCase() || 'PRIORITY'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <h5 className="font-semibold text-sm">{formData.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{formData.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Alert...
                        </>
                      ) : (
                        <>
                          <Megaphone className="w-4 h-4 mr-2" />
                          Send Alert Now
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

export default SendAlertModal;