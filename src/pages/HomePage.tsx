import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import RealTimeDashboard from '../components/RealTimeDashboard';
import VolunteerRegistrationForm from '../components/VolunteerRegistrationForm';
import SOSButton from '../components/SOSButton';
import EmergencyContactsManager from '../components/EmergencyContactsManager';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Heart,
  Users,
  Shield,
  Activity,
  Bell,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickStats = [
    {
      label: 'Community Members',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Volunteers',
      value: '156',
      change: '+8%',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Response Time',
      value: '4.2 min',
      change: '-15%',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Safety Score',
      value: '94%',
      change: '+3%',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const emergencyContacts = [
    { name: 'Fire Department', number: '911', icon: '🔥' },
    { name: 'Police', number: '911', icon: '🚔' },
    { name: 'Medical Emergency', number: '911', icon: '🚑' },
    { name: 'Gas Emergency', number: '1-800-GAS-LEAK', icon: '⚠️' },
  ];

  return (
    <>
      <Helmet>
        <title>SenseSafe - Community Safety Dashboard</title>
        <meta name="description" content="Real-time community safety monitoring and volunteer coordination platform" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SenseSafe</h1>
                  <p className="text-sm text-gray-600">Community Safety Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>System Online</span>
                </div>
                
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to SenseSafe Community Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Real-time incident monitoring, community coordination, and volunteer management 
                for a safer neighborhood. Join our mission to protect and serve our community.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{stat.change}</span>
                          </div>
                        </div>
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Real-Time Dashboard
              </TabsTrigger>
              <TabsTrigger value="volunteer" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Volunteer Registration
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Info
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <RealTimeDashboard />
            </TabsContent>

            {/* Volunteer Registration Tab */}
            <TabsContent value="volunteer" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VolunteerRegistrationForm 
                    onSuccess={() => {
                      // Could show success message or redirect
                    }}
                  />
                </div>
                
                <div className="space-y-6">
                  {/* Volunteer Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Why Volunteer?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Make a Difference</h4>
                          <p className="text-sm text-gray-600">
                            Help your community during emergencies and disasters
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Gain Skills</h4>
                          <p className="text-sm text-gray-600">
                            Receive training in emergency response and first aid
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Stay Connected</h4>
                          <p className="text-sm text-gray-600">
                            Build relationships with like-minded community members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Volunteers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Active Volunteers
                      </CardTitle>
                      <CardDescription>
                        Our dedicated community responders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">First Aid Responders</span>
                          <Badge className="bg-red-100 text-red-700">42</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Search & Rescue</span>
                          <Badge className="bg-blue-100 text-blue-700">28</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Logistics Support</span>
                          <Badge className="bg-green-100 text-green-700">35</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Medical Aid</span>
                          <Badge className="bg-purple-100 text-purple-700">18</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Technical Support</span>
                          <Badge className="bg-orange-100 text-orange-700">22</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Community Outreach</span>
                          <Badge className="bg-teal-100 text-teal-700">11</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Emergency Info Tab */}
            <TabsContent value="emergency" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emergency Contacts Management */}
                <div className="space-y-6">
                  <EmergencyContactsManager />
                  
                  {/* SOS Test Button */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-red-500" />
                        Emergency SOS
                      </CardTitle>
                      <CardDescription>
                        Test your emergency alert system or trigger a real SOS
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-900">Emergency SOS Alert</h4>
                              <p className="text-sm text-red-700 mt-1">
                                Pressing the SOS button will immediately notify all your emergency contacts
                                with your current location and emergency details.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <SOSButton variant="inline" size="md" className="w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Contacts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-red-500" />
                      Emergency Services
                    </CardTitle>
                    <CardDescription>
                      Important numbers for immediate assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{contact.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            <p className="text-sm text-gray-600">Emergency Services</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => window.open(`tel:${contact.number}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {contact.number}
                        </Button>
                      </div>
                    ))}
                    
                    {/* Hospital Contacts Link */}
                    <div className="border-t pt-4">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.location.href = '/hospitals'}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Find Nearby Hospitals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Safety Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Safety Guidelines
                    </CardTitle>
                    <CardDescription>
                      Essential safety information for emergencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">During an Emergency</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Stay calm, assess the situation, and call appropriate emergency services immediately.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Reporting Incidents</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Provide accurate location, description, and severity when reporting incidents.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Emergency Kit</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Keep a basic emergency kit with water, food, flashlight, and first aid supplies.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-900">Stay Informed</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Follow official emergency alerts and updates from local authorities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Community Resources
                    </CardTitle>
                    <CardDescription>
                      Local facilities and services available during emergencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Evacuation Centers</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Community Center (Main St)</li>
                          <li>• High School Gymnasium</li>
                          <li>• City Hall Auditorium</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Medical Facilities</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• General Hospital (24/7)</li>
                          <li>• Urgent Care Center</li>
                          <li>• Community Health Clinic</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Supply Stations</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Fire Station #1</li>
                          <li>• Police Station</li>
                          <li>• Emergency Services Building</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Floating SOS Button */}
        {user && <SOSButton />}

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">SenseSafe</h3>
                    <p className="text-gray-400">Community Safety Platform</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Empowering communities with real-time safety monitoring, 
                  incident reporting, and volunteer coordination for a safer tomorrow.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Emergency Info</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Emergency</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="tel:911" className="hover:text-white transition-colors">Call 911</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Report Incident</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 SenseSafe. All rights reserved. Built for community safety.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;