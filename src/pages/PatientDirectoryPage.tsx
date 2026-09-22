import React, { useState, useEffect } from 'react';
import { PatientCampaignsGrid } from '../components/home/PatientCampaignsGrid';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

interface PatientDirectoryPageProps {
  onNavigate: (tab: string) => void;
}

export const PatientDirectoryPage: React.FC<PatientDirectoryPageProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<PatientCampaign | null>(null);

  useEffect(() => {
    fetchPatientCampaigns().then(setCampaigns);
  }, []);

  return (
    <main style={{ minHeight: '80vh', paddingTop: '1rem' }}>
      <PatientCampaignsGrid 
        campaigns={campaigns}
        onSelectCampaign={(c) => setSelectedDonationCampaign(c)}
        onDonateCampaign={(c) => setSelectedDonationCampaign(c)}
      />

      <DemoDonationModal 
        campaign={selectedDonationCampaign}
        isOpen={!!selectedDonationCampaign}
        onClose={() => setSelectedDonationCampaign(null)}
      />
    </main>
  );
};
