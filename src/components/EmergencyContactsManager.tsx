import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { emergencyApi } from '../services/api';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
}

interface EmergencyContactsManagerProps {
  className?: string;
}

const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({ className = '' }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await emergencyApi.getUserContacts();
      
      if (response.success && response.emergencyContacts) {
        const loadedContacts: EmergencyContact[] = [];
        
        if (response.emergencyContacts.contact1) {
          loadedContacts.push({
            id: '1',
            name: 'Emergency Contact 1',
            email: response.emergencyContacts.contact1,
            relationship: 'Primary Contact',
          });
        }
        
        if (response.emergencyContacts.contact2) {
          loadedContacts.push({
            id: '2',
            name: 'Emergency Contact 2',
            email: response.emergencyContacts.contact2,
            relationship: 'Secondary Contact',
          });
        }
        
        if (response.emergencyContacts.contact3) {
          loadedContacts.push({
            id: '3',
            name: 'Emergency Contact 3',
            email: response.emergencyContacts.contact3,
            relationship: 'Tertiary Contact',
          });
        }
        
        setContacts(loadedContacts);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
      toast.error('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    try {
      setSaving(true);
      
      const contactData = {
        contact1: updatedContacts[0]?.email || '',
        contact2: updatedContacts[1]?.email || '',
        contact3: updatedContacts[2]?.email || '',
      };

      const response = await emergencyApi.updateContacts(contactData);
      
      if (response.success) {
        toast.success('Emergency contacts updated successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to update contacts');
      }
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
      toast.error('Failed to save emergency contacts');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }

    if (contacts.length >= 3) {
      toast.error('Maximum 3 emergency contacts allowed');
      return;
    }

    const contact: EmergencyContact = {
      id: (contacts.length + 1).toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      relationship: newContact.relationship || 'Emergency Contact',
    };

    const updatedContacts = [...contacts, contact];
    const success = await saveContacts(updatedContacts);
    
    if (success) {
      setContacts(updatedContacts);
      setNewContact({ name: '', email: '', phone: '', relationship: '' });
    }
  };

  const updateContact = async (id: string, updatedData: Partial<EmergencyContact>) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === id ? { ...contact, ...updatedData } : contact
    );
    
    const success = await saveContacts(updatedContacts);
    
    if (success) {
      setContacts(updatedContacts);
      setEditingId(null);
    }
  };

  const removeContact = async (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    const success = await saveContacts(updatedContacts);
    
    if (success) {
      setContacts(updatedContacts);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading emergency contacts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Emergency Contacts
        </CardTitle>
        <CardDescription>
          Manage up to 3 emergency contacts who will be notified during SOS alerts.
          These contacts will receive detailed location and emergency information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Contacts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Current Contacts ({contacts.length}/3)</h4>
            {contacts.length > 0 && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                SOS Ready
              </Badge>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No Emergency Contacts</h3>
              <p className="text-yellow-700 mb-4">
                Add emergency contacts to enable SOS functionality. These contacts will be notified
                immediately when you trigger an emergency alert.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  isEditing={editingId === contact.id}
                  onEdit={() => setEditingId(contact.id)}
                  onSave={(updatedData) => updateContact(contact.id, updatedData)}
                  onCancel={() => setEditingId(null)}
                  onRemove={() => removeContact(contact.id)}
                  saving={saving}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add New Contact */}
        {contacts.length < 3 && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Add New Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
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
                  placeholder="Family, Friend, Colleague, etc."
                />
              </div>
            </div>
            
            <Button
              onClick={addContact}
              disabled={!newContact.name || !newContact.email || !validateEmail(newContact.email) || saving}
              className="mt-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Emergency Contact
                </>
              )}
            </Button>
          </div>
        )}

        {/* SOS Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">How SOS Alerts Work</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Emergency contacts receive immediate email notifications</li>
            <li>• Alerts include your exact location with Google Maps link</li>
            <li>• Your contact information is shared for quick response</li>
            <li>• Timestamp and emergency message are included</li>
            <li>• All contacts are notified simultaneously</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

interface ContactCardProps {
  contact: EmergencyContact;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<EmergencyContact>) => void;
  onCancel: () => void;
  onRemove: () => void;
  saving: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  saving,
}) => {
  const [editData, setEditData] = useState({
    name: contact.name,
    email: contact.email,
    phone: contact.phone || '',
    relationship: contact.relationship,
  });

  const handleSave = () => {
    if (!editData.name || !editData.email) {
      toast.error('Name and email are required');
      return;
    }
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Name"
          />
          <Input
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            placeholder="Email"
          />
          <Input
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            placeholder="Phone (optional)"
          />
          <Input
            value={editData.relationship}
            onChange={(e) => setEditData({ ...editData, relationship: e.target.value })}
            placeholder="Relationship"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{contact.name}</h5>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <Mail className="w-3 h-3" />
            <span>{contact.email}</span>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Phone className="w-3 h-3" />
              <span>{contact.phone}</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs mt-2">
            {contact.relationship}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsManager;