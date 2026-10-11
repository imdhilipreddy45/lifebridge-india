// LifeBridge India - Direct Firebase Web SDK v10 API Services & Persistence
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions } from './firebase';
import { PatientCampaign, BloodDonor, BloodRequest, AuditLog, PilotFeedback, PilotIssue, UserRole, TransparencyRecord } from '../types';

const isApiKeyError = (err: any) => {
  if (!err) return false;
  const code = String(err.code || '').toLowerCase();
  const message = String(err.message || '').toLowerCase();
  return code.includes('api-key') || message.includes('api-key') || code.includes('invalid-api-key') || code.includes('api_key');
};

// Real Firebase Auth Services
export const firebaseRegisterUser = async (email: string, pass: string, role: UserRole) => {
  if (['ADMIN', 'DOCTOR', 'HOSPITAL', 'CSR'].includes(role)) {
    throw new Error('Privileged roles (Admin, Doctor, Hospital, CSR) cannot be self-created.');
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userRecord = {
      uid: cred.user.uid,
      email: email,
      displayName: email.split('@')[0],
      role: role,
      createdAt: new Date().toISOString(),
      consentGiven: true
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), userRecord);
    } catch (e) {
      console.warn("Firestore document creation pending:", e);
    }
    return userRecord;
  } catch (err: any) {
    if (isApiKeyError(err)) {
      return {
        uid: "usr_" + email.replace(/[^a-zA-Z0-9]/g, '_'),
        email: email,
        displayName: email.split('@')[0],
        role: role,
        createdAt: new Date().toISOString(),
        consentGiven: true
      };
    }
    throw err;
  }
};

export const firebaseLoginUser = async (email: string, pass: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    try {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn("Could not fetch user profile document:", e);
    }
    return {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || email.split('@')[0],
      role: 'DONOR',
      createdAt: new Date().toISOString(),
      consentGiven: true
    };
  } catch (err: any) {
    if (isApiKeyError(err)) {
      return {
        uid: "usr_" + email.replace(/[^a-zA-Z0-9]/g, '_'),
        email: email,
        displayName: email.split('@')[0],
        role: 'DONOR',
        createdAt: new Date().toISOString(),
        consentGiven: true
      };
    }
    throw err;
  }
};

export const firebaseLogoutUser = async () => {
  await signOut(auth);
};

export const firebaseSendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Real Firestore Patient Campaign Services
export const fetchPatientCampaignsFromFirebase = async (): Promise<PatientCampaign[]> => {
  try {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientCampaign));
    }
  } catch (e) {
    console.warn("Firestore query empty or error loading campaigns:", e);
  }
  return [];
};

export const fetchPatientCampaigns = async (): Promise<PatientCampaign[]> => {
  return fetchPatientCampaignsFromFirebase();
};

// Real Firestore Blood Donor Search
export const fetchBloodDonorMatches = async (bloodGroup: string, city: string): Promise<BloodDonor[]> => {
  try {
    const normGroup = (bloodGroup || 'O-').toUpperCase();
    const normCity = (city || '').toLowerCase();
    const q = query(
      collection(db, "bloodDonors"),
      where("bloodGroup", "==", normGroup),
      where("city", "==", normCity),
      where("isAvailable", "==", true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BloodDonor));
    }
  } catch (e) {
    console.warn("Firestore blood donor search error:", e);
  }
  return [];
};

// Simulated Financial Support Recording (Strict Ledger Integrity: Never writes to public ledger)
export const recordDonation = async (campaignId: string, amount: number, paymentMethod: string = 'CARD') => {
  if (amount < 1 || amount > 500000) {
    throw new Error("Invalid contribution amount. Allowed bounds: ₹1 to ₹5,00,000.");
  }

  const txId = "sim_tx_" + Date.now();
  const txRecord = {
    id: "sim_" + Math.random().toString(36).substring(2, 9),
    campaignId,
    amount,
    transactionId: txId,
    purpose: "Verified Medical Campaign Support (Demonstration)",
    paymentMethod,
    status: "SIMULATED",
    isSimulated: true,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('lifebridge_simulated_donations') || '[]');
    existing.unshift(txRecord);
    localStorage.setItem('lifebridge_simulated_donations', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn("Local storage simulation recording warning:", e);
  }

  return {
    success: true,
    transactionId: txId,
    amount,
    status: 'SIMULATION_COMPLETED',
    isSimulated: true,
    receiptNotice: "Demonstration only — no real payment was processed. Simulation completed — no money was transferred."
  };
};

export const fetchSimulatedDonations = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('lifebridge_simulated_donations') || '[]');
  } catch {
    return [];
  }
};

export const registerBloodDonorRecord = async (donor: Partial<BloodDonor>) => {
  const donorRecord = {
    city: (donor.city || 'mumbai').toLowerCase().trim(),
    bloodGroup: donor.bloodGroup || 'O-',
    componentType: donor.componentType || 'Whole Blood',
    isAvailable: true,
    userId: auth.currentUser ? auth.currentUser.uid : 'anon_volunteer',
    lastDonatedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  try {
    if (auth.currentUser) {
      const docRef = await addDoc(collection(db, "bloodDonors"), donorRecord);
      return { id: docRef.id, isRemote: true, isLocal: false, persistenceType: 'FIRESTORE', storageNotice: 'Persisted to Firestore database', ...donorRecord };
    }
  } catch (e) {
    console.warn("Firestore blood donor save rejected/error:", e);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('lifebridge_blood_donors') || '[]');
    const localEntry = { id: 'bd_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...donorRecord };
    existing.unshift(localEntry);
    localStorage.setItem('lifebridge_blood_donors', JSON.stringify(existing));
    return localEntry;
  } catch {
    return { id: 'bd_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...donorRecord };
  }
};

export const submitBloodRequestRecord = async (request: Partial<BloodRequest>) => {
  const requestRecord = {
    patientName: request.patientName || 'Emergency Patient',
    hospitalName: request.hospitalName || 'Verified Partner Hospital',
    city: (request.city || 'mumbai').toLowerCase().trim(),
    bloodGroup: request.bloodGroup || 'O-',
    component: request.component || 'Whole Blood',
    urgency: request.urgency || 'Emergency',
    requiredUnits: Number(request.requiredUnits) || 1,
    status: 'PENDING',
    disclaimer: 'Standby donor coordination dispatched. Treating hospital blood bank must be engaged concurrently.',
    createdAt: new Date().toISOString()
  };

  try {
    if (auth.currentUser) {
      const docRef = await addDoc(collection(db, "bloodRequests"), requestRecord);
      return { id: docRef.id, isRemote: true, isLocal: false, persistenceType: 'FIRESTORE', storageNotice: 'Persisted to Firestore database', ...requestRecord };
    }
  } catch (e) {
    console.warn("Firestore blood request save rejected/error:", e);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('lifebridge_blood_requests') || '[]');
    const localEntry = { id: 'br_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...requestRecord };
    existing.unshift(localEntry);
    localStorage.setItem('lifebridge_blood_requests', JSON.stringify(existing));
    return localEntry;
  } catch {
    return { id: 'br_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...requestRecord };
  }
};

export const fetchTransparencyLedger = async (): Promise<TransparencyRecord[]> => {
  try {
    const q = query(collection(db, "transparency"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransparencyRecord));
    }
  } catch (e) {
    console.warn("Firestore transparency fetch error:", e);
  }
  return [];
};

// Real Firebase Storage Upload Service (Strict Privacy Path)
export const uploadMedicalDocumentToStorage = async (file: File, patientId: string) => {
  const storagePath = `medical_reports/${patientId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  await addDoc(collection(db, "auditLogs"), {
    actor: auth.currentUser ? auth.currentUser.uid : 'anon',
    actorRole: 'PATIENT_FAMILY',
    action: 'MEDICAL_DOCUMENT_UPLOADED',
    affectedRecord: storagePath,
    previousState: null,
    newState: { filename: file.name, path: storagePath },
    timestamp: serverTimestamp()
  });

  return { storagePath, downloadUrl };
};

// Real Cloud Function Invocation Wrappers
export const callMatchBloodDonorsFunction = async (bloodGroup: string, city: string) => {
  const matchFn = httpsCallable(functions, 'matchBloodDonors');
  const res = await matchFn({ bloodGroup, city, requiredUnits: 1 });
  return res.data;
};

export const callAskLifeBridgeAIFunction = async (promptQuery: string) => {
  const aiFn = httpsCallable(functions, 'askLifeBridgeAI');
  const res = await aiFn({ query: promptQuery });
  return res.data;
};

export const submitPilotFeedback = async (feedback: Partial<PilotFeedback>) => {
  const newEntry = {
    userId: feedback.userId || (auth.currentUser ? auth.currentUser.uid : "anon"),
    role: feedback.role || "DONOR",
    page: feedback.page || "home",
    category: feedback.category || "UX",
    severity: feedback.severity || "MEDIUM",
    message: feedback.message || "",
    status: "OPEN",
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, "pilotFeedback"), newEntry);
    return { feedbackId: docRef.id, isRemote: true, isLocal: false, persistenceType: 'FIRESTORE', storageNotice: 'Persisted to Firestore database', ...newEntry };
  } catch (err) {
    console.warn("Firestore pilotFeedback write rejected by rules, saving locally:", err);
    try {
      const existing = JSON.parse(localStorage.getItem('lifebridge_pilot_feedback') || '[]');
      const localEntry = { feedbackId: 'fb_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...newEntry };
      existing.unshift(localEntry);
      localStorage.setItem('lifebridge_pilot_feedback', JSON.stringify(existing));
      return localEntry;
    } catch {
      return { feedbackId: 'fb_' + Date.now(), isRemote: false, isLocal: true, persistenceType: 'LOCAL_DEMO', storageNotice: 'Saved to local browser sandbox (pilot demonstration)', ...newEntry };
    }
  }
};

export const fetchStoredPilotFeedback = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('lifebridge_pilot_feedback') || '[]');
  } catch {
    return [];
  }
};

export const fetchStoredBloodRequests = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('lifebridge_blood_requests') || '[]');
  } catch {
    return [];
  }
};

export const fetchStoredBloodDonors = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('lifebridge_blood_donors') || '[]');
  } catch {
    return [];
  }
};

export const submitPatientApplicationRemote = async (applicationData: any) => {
  if (!auth.currentUser) {
    throw new Error("Authentication required. Please sign in as a Patient/Family applicant to submit.");
  }

  const payload = {
    ...applicationData,
    userId: auth.currentUser.uid,
    applicantEmail: auth.currentUser.email || '',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "patientApplications"), payload);
  return {
    id: docRef.id,
    isRemote: true,
    isLocal: false,
    persistenceType: 'FIRESTORE',
    storageNotice: 'Persisted to Cloud Firestore private patient applications collection',
    ...payload
  };
};

export const fetchRemotePatientApplications = async (userId?: string): Promise<any[]> => {
  if (!auth.currentUser) return [];

  try {
    if (userId) {
      const q = query(
        collection(db, "patientApplications"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, isRemote: true, isLocal: false, ...d.data() }));
      return docs.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } else {
      const q = query(
        collection(db, "patientApplications"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, isRemote: true, isLocal: false, ...d.data() }));
    }
  } catch (err) {
    console.warn("Error fetching remote patient applications:", err);
    throw err;
  }
};

export const updateRemotePatientApplicationStatus = async (appId: string, newStatus: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("Authentication required to update application status.");
  }
  const appRef = doc(db, "patientApplications", appId);
  await updateDoc(appRef, {
    status: newStatus,
    lastReviewedAt: new Date().toISOString()
  });
};

export const fetchLocalApplications = (userId?: string): any[] => {
  try {
    const list: any[] = JSON.parse(localStorage.getItem('lifebridge_local_applications') || '[]');
    if (userId) {
      return list.filter(item => item.userId === userId || (!item.userId && userId === 'anon'));
    }
    return list;
  } catch {
    return [];
  }
};

export const saveLocalApplication = (application: any): void => {
  try {
    const existing = JSON.parse(localStorage.getItem('lifebridge_local_applications') || '[]');
    existing.unshift(application);
    localStorage.setItem('lifebridge_local_applications', JSON.stringify(existing));
  } catch (e) {
    console.warn("Error saving local application:", e);
  }
};

export const updateLocalApplicationStatus = (appId: string, newStatus: string): void => {
  try {
    const existing: any[] = JSON.parse(localStorage.getItem('lifebridge_local_applications') || '[]');
    const updated = existing.map(item => item.id === appId ? { ...item, status: newStatus } : item);
    localStorage.setItem('lifebridge_local_applications', JSON.stringify(updated));
  } catch (e) {
    console.warn("Error updating local application status:", e);
  }
};
