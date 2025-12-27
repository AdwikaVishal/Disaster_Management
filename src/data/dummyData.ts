import { User, Analytics, Incident, Notification } from '../types';

export const dummyUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john.doe@email.com",
    reports: 5,
    trustScore: 85,
    lastActivity: "2024-12-27T12:00:00Z",
    status: 'active',
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    reports: 2,
    trustScore: 92,
    lastActivity: "2024-12-27T14:30:00Z",
    status: 'active',
  },
  {
    id: "user3",
    name: "Mike Johnson",
    email: "mike.j@email.com",
    reports: 12,
    trustScore: 45,
    lastActivity: "2024-12-26T09:15:00Z",
    status: 'flagged',
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah.w@email.com",
    reports: 8,
    trustScore: 78,
    lastActivity: "2024-12-27T16:45:00Z",
    status: 'active',
  },
  {
    id: "user5",
    name: "David Brown",
    email: "david.b@email.com",
    reports: 0,
    trustScore: 100,
    lastActivity: "2024-12-25T11:00:00Z",
    status: 'inactive',
  },
  {
    id: "user6",
    name: "Emily Chen",
    email: "emily.c@email.com",
    reports: 3,
    trustScore: 88,
    lastActivity: "2024-12-27T08:20:00Z",
    status: 'active',
  },
];

export const dummyNotifications: Notification[] = [
  {
    id: "n1",
    message: "New high-risk incident reported in Downtown area",
    type: "alert",
    timestamp: "2024-12-27T16:30:00Z",
    read: false,
  },
  {
    id: "n2",
    message: "User trust score updated for Mike Johnson",
    type: "warning",
    timestamp: "2024-12-27T15:00:00Z",
    read: false,
  },
  {
    id: "n3",
    message: "Daily report generated successfully",
    type: "info",
    timestamp: "2024-12-27T09:00:00Z",
    read: true,
  },
];

export const dummyAnalytics: Analytics = {
  riskLevels: [45, 28, 18, 9],
  highRiskCount: 9,
  peopleReported: 156,
  avgApprovalTime: 12,
  notifications: dummyNotifications,
  totalIncidents: 234,
  resolvedIncidents: 198,
};

export const dummyIncidents: Incident[] = [
  {
    id: "inc1",
    type: "Fire Emergency",
    location: { lat: 12.97, lng: 77.59, address: "123 Main St, Bangalore" },
    severity: "High",
    status: "In Progress",
    reportedBy: "John Doe",
    reporterContact: "+91 98765 43210",
    timestamp: "2024-12-27T14:00:00Z",
    description: "Large fire reported in commercial building. Multiple floors affected with heavy smoke visible from street level.",
    requiredResources: ["Fire Brigade", "Ambulance", "Police Unit", "Water Tanker", "Evacuation Support"]
  },
  {
    id: "inc2",
    type: "Flood",
    location: { lat: 12.95, lng: 77.62, address: "456 Oak Ave, Bangalore" },
    severity: "Critical",
    status: "New",
    reportedBy: "Jane Smith",
    reporterContact: "+91 87654 32109",
    timestamp: "2024-12-27T15:30:00Z",
    description: "Severe flooding due to burst water main. Road completely submerged, vehicles stranded.",
    requiredResources: ["Rescue Boats", "Medical Teams", "Disaster Relief Volunteers", "Temporary Shelter Units"]
  },
  {
    id: "inc3",
    type: "Medical Emergency",
    location: { lat: 12.99, lng: 77.58, address: "789 Pine Rd, Bangalore" },
    severity: "Medium",
    status: "Resolved",
    reportedBy: "Sarah Williams",
    reporterContact: "+91 76543 21098",
    timestamp: "2024-12-27T10:00:00Z",
    description: "Elderly person collapsed in public area. Conscious but requires immediate medical attention.",
    requiredResources: ["Ambulance", "Nearest Hospital", "Medical Staff Availability"]
  },
  {
    id: "inc4",
    type: "Gas Leak",
    location: { lat: 12.96, lng: 77.60, address: "321 Elm St, Bangalore" },
    severity: "Critical",
    status: "New",
    reportedBy: "Mike Johnson",
    reporterContact: "+91 65432 10987",
    timestamp: "2024-12-27T16:45:00Z",
    description: "Strong gas odor reported in residential area. Multiple residents evacuating voluntarily.",
    requiredResources: ["Gas Emergency Team", "Fire Brigade", "Police Unit", "Evacuation Support", "Hazmat Team"]
  },
  {
    id: "inc5",
    type: "Traffic Accident",
    location: { lat: 12.94, lng: 77.61, address: "654 Cedar Blvd, Bangalore" },
    severity: "Low",
    status: "In Progress",
    reportedBy: "Emily Chen",
    reporterContact: "+91 54321 09876",
    timestamp: "2024-12-27T13:20:00Z",
    description: "Minor vehicle collision at intersection. No serious injuries reported, traffic flow affected.",
    requiredResources: ["Traffic Police", "Tow Service", "Medical Team (Standby)"]
  }
];

export const riskLabels = ['Low', 'Medium', 'High', 'Critical'];
