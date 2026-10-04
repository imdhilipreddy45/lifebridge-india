import React, { useState, useEffect } from 'react';
import { PatientCampaignsGrid } from '../components/home/PatientCampaignsGrid';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientApplyModal } from '../components/modals/PatientApplyModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

interface PatientDirectoryPageProps {
  onNavigate: (tab: string) => void;
}

export const PatientDirectoryPage: React.FC<PatientDirectoryPageProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<PatientCampaign | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    fetchPatientCampaigns().then(setCampaigns);
  }, []);

  return (
    <main style={{ minHeight: '80vh', paddingTop: '1rem' }}>
      <PatientCampaignsGrid 
        campaigns={campaigns}
        onSelectCampaign={(c) => setSelectedDonationCampaign(c)}
        onDonateCampaign={(c) => setSelectedDonationCampaign(c)}
        onApplySupport={() => setApplyModalOpen(true)}
      />

      <DemoDonationModal 
        campaign={selectedDonationCampaign}
        isOpen={!!selectedDonationCampaign}
        onClose={() => setSelectedDonationCampaign(null)}
      />

      <PatientApplyModal 
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </main>
  );
};
