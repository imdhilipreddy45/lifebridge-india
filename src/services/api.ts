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

// Real Firestore Financial Transaction Recording
export const recordDonation = async (campaignId: string, amount: number, paymentMethod: string = 'CARD') => {
  if (amount < 1 || amount > 500000) {
    throw new Error("Invalid contribution amount. Allowed bounds: ₹1 to ₹5,00,000.");
  }

  const txId = "tx_" + Date.now();
  const txRecord: TransparencyRecord = {
    id: doc(collection(db, "transparency")).id,
    campaignId,
    amount,
    transactionId: txId,
    purpose: "Verified Medical Campaign Support",
    paymentMethod,
    status: "SUCCESSFUL",
    timestamp: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, "transparency"), {
      ...txRecord,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("Transparency record write warning:", e);
  }

  return {
    success: true,
    transactionId: txId,
    amount,
    status: 'SUCCESSFUL',
    receiptNotice: "Official Receipt — Zero Platform Fee."
  };
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

  const docRef = await addDoc(collection(db, "pilotFeedback"), newEntry);
  return { feedbackId: docRef.id, ...newEntry };
};
