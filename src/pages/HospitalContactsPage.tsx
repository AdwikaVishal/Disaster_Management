import React from 'react';
import HospitalContactPage from '../components/HospitalContactPage';

const HospitalContactsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <HospitalContactPage />
      </div>
    </div>
  );
};

export default HospitalContactsPage;