import React, { useState } from 'react';
import { Droplets, Search, ShieldAlert, Heart, UserPlus, FilePlus, X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { BloodGroup, BloodComponent, UrgencyLevel } from '../../types';
import { fetchBloodDonorMatches, registerBloodDonorRecord, submitBloodRequestRecord } from '../../services/api';

export const BloodSupportSection: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [city, setCity] = useState('mumbai');
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchConducted, setSearchConducted] = useState(false);

  // Modals state
  const [registerDonorOpen, setRegisterDonorOpen] = useState(false);
  const [donorFormGroup, setDonorFormGroup] = useState<BloodGroup>('O-');
  const [donorComponent, setDonorComponent] = useState<BloodComponent>('Whole Blood');
  const [donorCity, setDonorCity] = useState('mumbai');
  const [donorConsent, setDonorConsent] = useState(false);
  const [donorSubmitting, setDonorSubmitting] = useState(false);
  const [donorSuccess, setDonorSuccess] = useState(false);
  const [donorError, setDonorError] = useState<string | null>(null);

  const [requestBloodOpen, setRequestBloodOpen] = useState(false);
  const [reqPatientName, setReqPatientName] = useState('');
  const [reqHospitalName, setReqHospitalName] = useState('');
  const [reqCity, setReqCity] = useState('mumbai');
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup>('O-');
  const [reqComponent, setReqComponent] = useState<BloodComponent>('Whole Blood');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqUrgency, setReqUrgency] = useState<UrgencyLevel>('Emergency');
  const [reqConsent, setReqConsent] = useState(false);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<any | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchConducted(true);
    try {
      const matches = await fetchBloodDonorMatches(selectedGroup, city);
      setMatchedCount(matches.length);
    } catch {
      setMatchedCount(0);
    } finally {
      setSearching(false);
    }
  };

  const handleResetSearch = () => {
    setSelectedGroup('O-');
    setCity('mumbai');
    setMatchedCount(null);
    setSearchConducted(false);
  };

  const handleDonorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonorError(null);
    if (!donorConsent) {
      setDonorError('You must confirm consent for private hospital coordination.');
      return;
    }
    setDonorSubmitting(true);
    try {
      await registerBloodDonorRecord({
        bloodGroup: donorFormGroup,
        componentType: donorComponent,
        city: donorCity
      });
      setDonorSuccess(true);
    } catch (err: any) {
      setDonorError(err?.message || 'Registration could not be recorded.');
    } finally {
      setDonorSubmitting(false);
    }
  };

  const handleResetDonorModal = () => {
    setRegisterDonorOpen(false);
    setDonorSuccess(false);
    setDonorConsent(false);
    setDonorError(null);
  };

  const handleBloodRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(null);
    if (!reqPatientName.trim() || !reqHospitalName.trim()) {
      setReqError('Patient Name and Treating Hospital are required.');
      return;
    }
    if (!reqConsent) {
      setReqError('You must confirm that treating hospital blood bank is engaged.');
      return;
    }
    setReqSubmitting(true);
    try {
      const res = await submitBloodRequestRecord({
        patientName: reqPatientName.trim(),
        hospitalName: reqHospitalName.trim(),
        city: reqCity,
        bloodGroup: reqBloodGroup,
        component: reqComponent,
        requiredUnits: reqUnits,
        urgency: reqUrgency
      });
      setReqSuccess(res);
    } catch (err: any) {
      setReqError(err?.message || 'Request could not be logged.');
    } finally {
      setReqSubmitting(false);
    }
  };

  const handleResetRequestModal = () => {
    setRequestBloodOpen(false);
    setReqSuccess(null);
    setReqPatientName('');
    setReqHospitalName('');
    setReqConsent(false);
    setReqError(null);
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
          {/* LEFT INFORMATION COLUMN */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldAlert size={15} color="#dc2626" /> Emergency Voluntary Network
            </div>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem', marginBottom: '1rem', color: '#0f172a' }}>
              Voluntary Blood Donor Matching
            </h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Connecting rare disease families in urgent need of rare blood components (O-negative, platelets, plasma) with registered voluntary donors.
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong>Blood Bank Notice:</strong> LifeBridge India coordinates voluntary donor standby requests. Final donor eligibility, testing, compatibility, and transfusion decisions are handled strictly by authorized blood banks and hospitals. <strong>Donor phone numbers and personal contact details are never publicly exposed.</strong>
            </div>

            {/* VOLUNTEER & REQUEST ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRegisterDonorOpen(true)}
              >
                <UserPlus size={16} /> Register as Standby Donor
              </button>
              <button
                type="button"
                className="btn btn-emergency"
                onClick={() => setRequestBloodOpen(true)}
              >
                <Droplets size={16} /> Post Urgent Blood Request
              </button>
            </div>
          </div>

          {/* RIGHT SEARCH CARD */}
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
                  <option value="pune">Pune</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="chennai">Chennai</option>
                  <option value="kolkata">Kolkata</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {searchConducted && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleResetSearch}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-emergency"
                  disabled={searching}
                  style={{ flex: searchConducted ? 2 : 1, justifyContent: 'center' }}
                >
                  <Search size={18} /> {searching ? 'Searching Donors...' : 'Search Standby Donors'}
                </button>
              </div>
            </form>

            {matchedCount !== null && (
              <div style={{ marginTop: '1.25rem', backgroundColor: matchedCount > 0 ? '#ecfdf5' : '#f8fafc', border: `1px solid ${matchedCount > 0 ? '#a7f3d0' : '#e2e8f0'}`, borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: matchedCount > 0 ? '#047857' : '#334155' }}>
                  {matchedCount > 0
                    ? `Found ${matchedCount} Standby ${selectedGroup} Donors in ${city.toUpperCase()}`
                    : `No Standby ${selectedGroup} Donors registered in ${city.toUpperCase()} in pilot records.`}
                </span>
                <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.35rem', margin: 0, lineHeight: 1.45 }}>
                  {matchedCount > 0
                    ? 'Hospital blood bank coordinators receive voluntary dispatch alerts without exposing donor personal details.'
                    : 'In urgent medical need, please engage your treating hospital blood bank or state transfusion council directly.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: REGISTER AS STANDBY DONOR */}
      {registerDonorOpen && (
        <div className="modal-overlay" onClick={handleResetDonorModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Register as Standby Blood Donor
              </h3>
              <button type="button" onClick={handleResetDonorModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {donorSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle color="#059669" size={48} style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h4 style={{ color: '#047857', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Standby Registration Confirmed
                </h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Thank you for standing by as a voluntary donor for <strong>{donorFormGroup}</strong> in <strong>{donorCity.toUpperCase()}</strong>. Your contact details remain private and will only be contacted via verified hospital blood bank coordinators during rare blood matches.
                </p>
                <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleResetDonorModal}>
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonorRegister}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Your Blood Group *
                  </label>
                  <select
                    value={donorFormGroup}
                    onChange={e => setDonorFormGroup(e.target.value as BloodGroup)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O- (Universal Red Cell)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Component Willingness *
                  </label>
                  <select
                    value={donorComponent}
                    onChange={e => setDonorComponent(e.target.value as BloodComponent)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Whole Blood">Whole Blood (Standard)</option>
                    <option value="Platelets">Single Donor Platelets (SDP / Apherisis)</option>
                    <option value="Plasma">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Location City *
                  </label>
                  <select
                    value={donorCity}
                    onChange={e => setDonorCity(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi NCR</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="ahmedabad">Ahmedabad</option>
                    <option value="pune">Pune</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="chennai">Chennai</option>
                    <option value="kolkata">Kolkata</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>
                    <input
                      type="checkbox"
                      checked={donorConsent}
                      onChange={e => setDonorConsent(e.target.checked)}
                      required
                      style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: '#1d4ed8' }}
                    />
                    <span>
                      <strong>Voluntary Donor Privacy Consent:</strong> I agree to stand by as a voluntary donor. I understand my phone number is never shown publicly, and donations are conducted strictly at certified blood banks under standard clinical safety screening.
                    </span>
                  </label>
                </div>

                {donorError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {donorError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleResetDonorModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={donorSubmitting} style={{ flex: 2, justifyContent: 'center' }}>
                    {donorSubmitting ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: POST URGENT BLOOD REQUEST */}
      {requestBloodOpen && (
        <div className="modal-overlay" onClick={handleResetRequestModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#dc2626' }}>
                  Post Urgent Blood Request
                </h3>
              </div>
              <button type="button" onClick={handleResetRequestModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {reqSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle color="#059669" size={48} style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h4 style={{ color: '#047857', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Emergency Request Dispatched
                </h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Urgent request for <strong>{reqSuccess.bloodGroup} {reqSuccess.component}</strong> ({reqSuccess.requiredUnits} unit/s) has been logged with Reference ID <strong>{reqSuccess.id}</strong>.
                </p>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <strong>Reminder:</strong> Please ensure your attending hospital blood bank and treating doctor are continuously informed.
                </div>
                <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleResetRequestModal}>
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleBloodRequest}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={reqPatientName}
                      onChange={e => setReqPatientName(e.target.value)}
                      placeholder="e.g. Master Aarav"
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Treating Hospital *
                    </label>
                    <input
                      type="text"
                      value={reqHospitalName}
                      onChange={e => setReqHospitalName(e.target.value)}
                      placeholder="e.g. AIIMS Delhi"
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Blood Group Needed *
                    </label>
                    <select
                      value={reqBloodGroup}
                      onChange={e => setReqBloodGroup(e.target.value as BloodGroup)}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Component *
                    </label>
                    <select
                      value={reqComponent}
                      onChange={e => setReqComponent(e.target.value as BloodComponent)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Platelets">Platelets / SDP</option>
                      <option value="Plasma">Plasma</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Required Units *
                    </label>
                    <input
                      type="number"
                      value={reqUnits}
                      onChange={e => setReqUnits(Number(e.target.value))}
                      min={1}
                      max={10}
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Urgency Level *
                    </label>
                    <select
                      value={reqUrgency}
                      onChange={e => setReqUrgency(e.target.value as UrgencyLevel)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="Standard">Standard (Within 24 Hours)</option>
                      <option value="Emergency">Emergency (Within 6 Hours)</option>
                      <option value="ICU Fast-Track">ICU Fast-Track (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>
                    <input
                      type="checkbox"
                      checked={reqConsent}
                      onChange={e => setReqConsent(e.target.checked)}
                      required
                      style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: '#dc2626' }}
                    />
                    <span>
                      <strong>Clinical Engagement Confirmation:</strong> I confirm this blood request corresponds to an active in-hospital medical requirement.
                    </span>
                  </label>
                </div>

                {reqError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {reqError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleResetRequestModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emergency" disabled={reqSubmitting} style={{ flex: 2, justifyContent: 'center' }}>
                    {reqSubmitting ? 'Posting...' : 'Dispatch Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
