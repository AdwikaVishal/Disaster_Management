import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  X, 
  FileText, 
  Search, 
  Download,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dummyIncidents } from '@/data/dummyData';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateReportModal = ({ isOpen, onClose }: GenerateReportModalProps) => {
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [checklist, setChecklist] = useState({
    verified: false,
    actionTaken: false,
    resourcesDeployed: false,
    resolved: false
  });
  const [notes, setNotes] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredIncidents = dummyIncidents.filter(incident =>
    incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIncidentData = dummyIncidents.find(inc => inc.id === selectedIncident);

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateReport = async () => {
    if (!selectedIncident) {
      toast.error('Please select an incident to generate report');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Report generated successfully!', {
      description: `${reportFormat.toUpperCase()} report is ready for download.`
    });
    
    setIsGenerating(false);
    onClose();
    
    // Reset form
    setSelectedIncident('');
    setSearchTerm('');
    setChecklist({
      verified: false,
      actionTaken: false,
      resourcesDeployed: false,
      resolved: false
    });
    setNotes('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-green-900">Generate Incident Report</CardTitle>
                    <p className="text-sm text-green-700 mt-1">
                      Create structured reports for documentation or authorities
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Incident Selection */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Select Incident</h3>
                      
                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search incidents..."
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                      </div>

                      {/* Incident List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredIncidents.map((incident) => (
                          <div
                            key={incident.id}
                            onClick={() => setSelectedIncident(incident.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedIncident === incident.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-border hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{incident.type}</h4>
                              <div className="flex gap-1">
                                <Badge className={getSeverityColor(incident.severity)}>
                                  {incident.severity}
                                </Badge>
                                <Badge className={getStatusColor(incident.status)}>
                                  {incident.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{incident.location.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(incident.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Format */}
                    <div>
                      <h4 className="font-medium mb-3">Report Format</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'pdf', label: 'PDF Document', icon: '📄' },
                          { value: 'summary', label: 'Summary Report', icon: '📋' }
                        ].map((format) => (
                          <button
                            key={format.value}
                            type="button"
                            onClick={() => setReportFormat(format.value)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              reportFormat === format.value
                                ? 'border-green-500 bg-green-50'
                                : 'border-border hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{format.icon}</span>
                              <span className="text-sm font-medium">{format.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Report Details */}
                  <div className="space-y-4">
                    {selectedIncidentData ? (
                      <>
                        {/* Incident Details */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Incident Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Type:</strong> {selectedIncidentData.type}</div>
                            <div><strong>Location:</strong> {selectedIncidentData.location.address}</div>
                            <div><strong>Reported By:</strong> {selectedIncidentData.reportedBy}</div>
                            <div><strong>Time:</strong> {new Date(selectedIncidentData.timestamp).toLocaleString()}</div>
                            {selectedIncidentData.description && (
                              <div><strong>Description:</strong> {selectedIncidentData.description}</div>
                            )}
                          </div>
                        </div>

                        {/* Checklist */}
                        <div>
                          <h4 className="font-medium mb-3">Report Checklist</h4>
                          <div className="space-y-3">
                            {[
                              { key: 'verified', label: 'Incident Verified', icon: CheckCircle },
                              { key: 'actionTaken', label: 'Action Taken', icon: Users },
                              { key: 'resourcesDeployed', label: 'Resources Deployed', icon: AlertTriangle },
                              { key: 'resolved', label: 'Incident Resolved', icon: CheckCircle }
                            ].map((item) => (
                              <label
                                key={item.key}
                                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={checklist[item.key as keyof typeof checklist]}
                                  onChange={() => handleChecklistChange(item.key as keyof typeof checklist)}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <item.icon className={`w-4 h-4 ${
                                  checklist[item.key as keyof typeof checklist] 
                                    ? 'text-green-600' 
                                    : 'text-muted-foreground'
                                }`} />
                                <span className="text-sm font-medium">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className="font-medium mb-3">Additional Notes</h4>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional comments, observations, or recommendations..."
                            rows={4}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                        <h4 className="font-medium text-muted-foreground mb-2">No Incident Selected</h4>
                        <p className="text-sm text-muted-foreground">
                          Please select an incident from the list to generate a report
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isGenerating || !selectedIncident}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GenerateReportModal;