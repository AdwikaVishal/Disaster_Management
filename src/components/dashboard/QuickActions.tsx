import { motion } from 'framer-motion';
import { useState } from 'react';
import { Phone, Building2, Plus, AlertCircle, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import AddIncidentModal from './AddIncidentModal';
import SendAlertModal from './SendAlertModal';
import GenerateReportModal from './GenerateReportModal';
import ViewMapModal from './ViewMapModal';

const QuickActions = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleEmergencyCall = (service: string) => {
    toast.success(`${service} contacted`, {
      description: 'Emergency services have been notified.',
    });
  };

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const actions = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Dial Hospital',
      description: 'Emergency medical services',
      onClick: () => handleEmergencyCall('Hospital'),
      variant: 'primary' as const,
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: 'Contact Police',
      description: 'Law enforcement dispatch',
      onClick: () => handleEmergencyCall('Police'),
      variant: 'danger' as const,
    },
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Add Incident',
      description: 'Report new incident',
      onClick: () => openModal('add-incident'),
      variant: 'default' as const,
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Send Alert',
      description: 'Broadcast emergency alert',
      onClick: () => openModal('send-alert'),
      variant: 'default' as const,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Generate Report',
      description: 'Create incident report',
      onClick: () => openModal('generate-report'),
      variant: 'default' as const,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'View Map',
      description: 'Open live incident map',
      onClick: () => openModal('view-map'),
      variant: 'default' as const,
    },
  ];

  const getButtonClass = (variant: 'primary' | 'danger' | 'default') => {
    switch (variant) {
      case 'primary':
        return 'action-button-primary';
      case 'danger':
        return 'action-button-danger';
      default:
        return 'action-button';
    }
  };

  return (
    <>
      <motion.div
        className="card-elevated p-6"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-1">Quick Actions</h3>
        <p className="text-sm text-muted-foreground mb-5">Emergency response shortcuts</p>

        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              className={getButtonClass(action.variant)}
              onClick={action.onClick}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              aria-label={action.label}
            >
              {action.icon}
              <div className="text-left">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs opacity-70">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <AddIncidentModal 
        isOpen={activeModal === 'add-incident'} 
        onClose={closeModal} 
      />
      <SendAlertModal 
        isOpen={activeModal === 'send-alert'} 
        onClose={closeModal} 
      />
      <GenerateReportModal 
        isOpen={activeModal === 'generate-report'} 
        onClose={closeModal} 
      />
      <ViewMapModal 
        isOpen={activeModal === 'view-map'} 
        onClose={closeModal} 
      />
    </>
  );
};

export default QuickActions;
