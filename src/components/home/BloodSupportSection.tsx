import React, { useState } from 'react';
import { Droplets, Search, ShieldAlert, Heart } from 'lucide-react';
import { BloodGroup } from '../../types';
import { fetchBloodDonorMatches } from '../../services/api';

export const BloodSupportSection: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('mumbai');
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    const matches = await fetchBloodDonorMatches(selectedGroup, city);
    setMatchedCount(matches.length);
    setSearching(false);
  };

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Network
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
              Voluntary Blood Donor Matching
            </h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Connecting rare disease families in urgent need of rare blood components (O-negative, platelets, plasma) with registered voluntary donors.
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '1.5rem' }}>
              <strong>Blood Bank Notice:</strong> LifeBridge India coordinates voluntary donor standby requests. Final donor eligibility, testing, compatibility, and transfusion decisions are handled strictly by authorized blood banks and hospitals. Donor phone numbers and location are NEVER publicly exposed.
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets color="#dc2626" size={22} /> Search Standby Donors
            </h3>

            <form onSubmit={handleSearch}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Blood Group Needed
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O- (Emergency Universal)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi NCR</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="ahmedabad">Ahmedabad</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-emergency"
                disabled={searching}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Search size={18} /> {searching ? 'Searching Donors...' : 'Search Standby Donors'}
              </button>
            </form>

            {matchedCount !== null && (
              <div style={{ marginTop: '1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>
                  {matchedCount > 0 ? `Found ${matchedCount} Standby ${selectedGroup} Donors in ${city.toUpperCase()}` : `No Standby ${selectedGroup} Donors registered in ${city.toUpperCase()} yet.`}
                </span>
                <p style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.25rem', margin: 0 }}>
                  Authorized blood bank coordinator desk notified via Firebase FCM dispatch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
