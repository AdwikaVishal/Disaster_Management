import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { volunteerApi } from '../services/api';
import { toast } from 'sonner';
import {
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface VolunteerApplication {
  id: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    trustScore: number;
  };
  motivation: string;
  skills: string;
  availability: string;
  experience?: string;
  certifications?: string;
  emergencyTraining?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  volunteerType: string;
  preferredLatitude?: number;
  preferredLongitude?: number;
  maxDistanceKm?: number;
  alternatePhone?: string;
  emergencyContact?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewedBy?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

const AdminVolunteerManagement: React.FC = () => {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await volunteerApi.getApplications(
        statusFilter === 'all' ? undefined : statusFilter
      );
      
      if (response.success) {
        setApplications(response.applications || []);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedApplication) return;

    try {
      const response = await volunteerApi.reviewApplication(
        selectedApplication.id,
        decision,
        reviewNotes
      );

      if (response.success) {
        toast.success(`Application ${decision.toLowerCase()} successfully`);
        setReviewDialogOpen(false);
        setSelectedApplication(null);
        setReviewNotes('');
        fetchApplications();
      } else {
        toast.error('Failed to review application');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Error processing review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVolunteerTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FIRST_AID: 'bg-red-100 text-red-700',
      SEARCH_RESCUE: 'bg-blue-100 text-blue-700',
      LOGISTICS: 'bg-green-100 text-green-700',
      MEDICAL_AID: 'bg-purple-100 text-purple-700',
      TECHNICAL_SUPPORT: 'bg-orange-100 text-orange-700',
      COMMUNITY_OUTREACH: 'bg-teal-100 text-teal-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredApplications = applications.filter(app =>
    app.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.volunteerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Management</h2>
          <p className="text-gray-600">Review and manage volunteer applications</p>
        </div>
        <Button onClick={fetchApplications} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('APPROVED')}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('REJECTED')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Applications</CardTitle>
          <CardDescription>
            Review and manage volunteer applications for resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {application.user.firstName} {application.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{application.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getVolunteerTypeColor(application.volunteerType)}>
                          {application.volunteerType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span>{application.user.trustScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(application);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Volunteer Application</DialogTitle>
            <DialogDescription>
              Review the volunteer application and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Volunteer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedApplication.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedApplication.user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span>Trust Score: {selectedApplication.user.trustScore}</span>
                    </div>
                    {selectedApplication.emergencyContact && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span>Emergency: {selectedApplication.emergencyContact}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volunteer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Type: </span>
                      <Badge className={getVolunteerTypeColor(selectedApplication.volunteerType)}>
                        {selectedApplication.volunteerType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Max Distance: </span>
                      <span>{selectedApplication.maxDistanceKm || 'N/A'} km</span>
                    </div>
                    <div>
                      <span className="font-medium">Applied: </span>
                      <span>{new Date(selectedApplication.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedApplication.preferredLatitude && selectedApplication.preferredLongitude && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>
                          {selectedApplication.preferredLatitude.toFixed(4)}, {selectedApplication.preferredLongitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.motivation}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills & Qualifications</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.skills}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.availability}
                  </p>
                </div>

                {selectedApplication.experience && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Previous Experience</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}

                {selectedApplication.certifications && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedApplication.certifications}
                    </p>
                  </div>
                )}

                {selectedApplication.emergencyTraining && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Emergency Training</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedApplication.emergencyTraining}
                    </p>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                <Textarea
                  placeholder="Add your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Previous Review */}
              {selectedApplication.reviewedBy && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Previous Review</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Reviewed by {selectedApplication.reviewedBy.firstName} {selectedApplication.reviewedBy.lastName} 
                    on {new Date(selectedApplication.reviewedAt!).toLocaleDateString()}
                  </p>
                  {selectedApplication.reviewNotes && (
                    <p className="text-gray-700">{selectedApplication.reviewNotes}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            {selectedApplication?.status === 'PENDING' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewApplication('REJECTED')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewApplication('APPROVED')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVolunteerManagement;