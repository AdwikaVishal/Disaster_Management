import React from 'react';
import IncidentReportForm from './IncidentReportForm';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const handleSuccess = (incident: any) => {
    console.log('Incident reported successfully:', incident);
    // The IncidentReportForm already handles success notifications and closing
  };

  return (
    <IncidentReportForm
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
    />
  );
};

export default ReportModal;
