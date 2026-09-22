import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorks } from '../components/home/HowItWorks';
import { RareDiseasesGrid } from '../components/home/RareDiseasesGrid';
import { PatientCampaignsGrid } from '../components/home/PatientCampaignsGrid';
import { AdoptTreatmentGrid } from '../components/home/AdoptTreatmentGrid';
import { BloodSupportSection } from '../components/home/BloodSupportSection';
import { TransparencySection } from '../components/home/TransparencySection';
import { LifeBridgeAI } from '../components/home/LifeBridgeAI';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientApplyModal } from '../components/modals/PatientApplyModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<PatientCampaign | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    fetchPatientCampaigns().then(setCampaigns);
  }, []);

  return (
    <main>
      {/* 1. HERO SECTION */}
      <HeroSection 
        onFindSupport={() => onNavigate('patients')}
        onHowItWorks={() => onNavigate('how-it-works')}
      />

      {/* 2. HOW IT WORKS */}
      <HowItWorks />

      {/* 3. RARE DISEASE SUPPORT */}
      <RareDiseasesGrid onSelectCategory={() => onNavigate('rare-diseases')} />

      {/* 4. VERIFIED PATIENT CAMPAIGNS */}
      <PatientCampaignsGrid 
        campaigns={campaigns}
        onSelectCampaign={() => onNavigate('patients')}
        onDonateCampaign={(c) => setSelectedDonationCampaign(c)}
      />

      {/* 5. ADOPT A TREATMENT */}
      <AdoptTreatmentGrid onAdoptNeed={() => setSelectedDonationCampaign(campaigns[0] || null)} />

      {/* 6. BLOOD SUPPORT */}
      <BloodSupportSection />

      {/* 7. TRANSPARENCY */}
      <TransparencySection />

      {/* 8. AI ASSISTANT CHATBOT */}
      <LifeBridgeAI />

      {/* DEMO DONATION MODAL */}
      <DemoDonationModal 
        campaign={selectedDonationCampaign}
        isOpen={!!selectedDonationCampaign}
        onClose={() => setSelectedDonationCampaign(null)}
      />

      {/* PATIENT APPLICATION MODAL */}
      <PatientApplyModal 
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </main>
  );
};
