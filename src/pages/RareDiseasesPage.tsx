import React from 'react';
import { RareDiseasesGrid } from '../components/home/RareDiseasesGrid';

interface RareDiseasesPageProps {
  onNavigate: (tab: string) => void;
}

export const RareDiseasesPage: React.FC<RareDiseasesPageProps> = ({ onNavigate }) => {
  return (
    <main style={{ minHeight: '80vh', paddingTop: '1rem' }}>
      <RareDiseasesGrid onSelectCategory={() => onNavigate('patients')} />
    </main>
  );
};
