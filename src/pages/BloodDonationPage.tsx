import React from 'react';
import { BloodSupportSection } from '../components/home/BloodSupportSection';

export const BloodDonationPage: React.FC = () => {
  return (
    <main style={{ minHeight: '80vh', paddingTop: '1rem' }}>
      <BloodSupportSection />
    </main>
  );
};
