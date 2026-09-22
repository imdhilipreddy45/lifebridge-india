import React, { useState, useEffect } from 'react';
import { AdoptTreatmentGrid } from '../components/home/AdoptTreatmentGrid';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

export const AdoptTreatmentPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<PatientCampaign | null>(null);

  useEffect(() => {
    fetchPatientCampaigns().then(setCampaigns);
  }, []);

  return (
    <main style={{ minHeight: '80vh', paddingTop: '1rem' }}>
      <AdoptTreatmentGrid onAdoptNeed={() => setSelectedCampaign(campaigns[0] || null)} />

      <DemoDonationModal
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </main>
  );
};
