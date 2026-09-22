/* ==========================================================================
   LIFEBRIDGE INDIA - FIREBASE CONFIGURATION & CONTROLLED PILOT MODULE
   Release Label: LifeBridge India V1.0 - Controlled Pilot Demo
   Supports Firebase Web SDK v10 (Auth, Firestore, Storage, Functions, FCM)
   ========================================================================== */

// Firebase Configuration Object (Standard Project Config Placeholder for Web App)
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyLifeBridgeIndia2026_Secured",
  authDomain: "lifebridge-india-rare-diseases.firebaseapp.com",
  projectId: "lifebridge-india-rare-diseases",
  storageBucket: "lifebridge-india-rare-diseases.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:a1b2c3d4e5f6g7h8i9j0",
  measurementId: "G-LIFEBRIDGE2026"
};

// Global Application & Controlled Pilot Configuration
window.LIFEBRIDGE_CONFIG = {
  RELEASE_LABEL: "LifeBridge India V1.0 - Controlled Pilot Demo",
  APP_VERSION: "1.0.0-V1-PILOT",
  DEMO_MODE: true,
  CONTROLLED_PILOT_MODE: true,
  PILOT_NOTICE: "LifeBridge India is currently operating in Controlled Pilot / Demo Mode. No real donations are processed. Demo patients are fictional. Demo transactions do not transfer money. The pilot is for workflow validation and usability testing.",

  SUPPORTED_ROLES: [
    "DONOR",
    "PATIENT_FAMILY",
    "VOLUNTEER",
    "DOCTOR",
    "HOSPITAL",
    "CSR",
    "ADMIN"
  ],

  PATIENT_STATUS_PIPELINE: [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "CLARIFICATION_REQUIRED",
    "VERIFIED",
    "APPROVED",
    "REJECTED",
    "SUSPENDED"
  ],

  VERIFICATION_CHECKLIST_ITEMS: [
    "IDENTITY_PROOF",
    "MEDICAL_DOCUMENTS",
    "HOSPITAL_ESTIMATE",
    "DOCTOR_SCHEDULING"
  ],

  DISEASE_CATEGORIES: [
    "SMA",
    "DMD",
    "Thalassemia",
    "Pediatric Cancer",
    "Organ Transplant",
    "Metabolic Diseases",
    "Blood Disorders"
  ]
};

console.log(`[LifeBridge Config] Initialized: ${window.LIFEBRIDGE_CONFIG.RELEASE_LABEL}`);
