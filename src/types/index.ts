// LifeBridge India - Strict TypeScript Data Models & Types

export type UserRole =
  | 'DONOR'
  | 'PATIENT_FAMILY'
  | 'VOLUNTEER'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'CSR'
  | 'ADMIN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
  consentGiven: boolean;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUIRED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface HopeVerificationChecklist {
  identityVerified: boolean;
  medicalReportsVerified: boolean;
  hospitalDeskVerified: boolean;
  doctorVerificationCompleted: boolean;
  treatmentEstimateVerified: boolean;
  hopeScorePercentage: number; // e.g., 95%
  lastReviewedAt: string;
  reviewedByRole: UserRole;
  disclaimer: string;
}

export interface HopeJourneyMilestone {
  id: string;
  stageName: string; // e.g., "Diagnosis Confirmed", "50% Goal Reached", "Dosing Schedule Confirmed"
  date: string;
  completed: boolean;
  notes?: string;
}

export interface PatientCampaign {
  id: string;
  patientName: string;
  age: number;
  city: string;
  state: string;
  diseaseCategory: 'SMA' | 'DMD' | 'Thalassemia' | 'Pediatric Cancer' | 'Organ Transplant' | 'Blood Disorders';
  targetAmount: number;
  raisedAmount: number;
  treatingHospital: string;
  attendingDoctor: string;
  status: ApplicationStatus;
  verification: HopeVerificationChecklist;
  milestones: HopeJourneyMilestone[];
  summary: string;
  createdAt: string;
}

export interface TreatmentNeedItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  description: string;
  iconName: string;
  patientId: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'Whole Blood' | 'Platelets' | 'Plasma';
export type UrgencyLevel = 'Standard' | 'Emergency' | 'ICU Fast-Track';

export interface BloodDonor {
  id: string;
  city: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponent;
  isAvailable: boolean;
  lastDonatedDate?: string;
  userId?: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  hospitalName: string;
  city: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  urgency: UrgencyLevel;
  requiredUnits: number;
  status: 'PENDING' | 'MATCHED' | 'FULFILLED';
  disclaimer: string;
  createdAt: string;
}

export interface TransparencyRecord {
  id: string;
  campaignId: string;
  amount: number;
  transactionId: string;
  purpose: string;
  paymentMethod: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  affectedRecord: string;
  previousState: any;
  newState: any;
  timestamp: string;
}

export interface PilotFeedback {
  feedbackId: string;
  userId: string;
  role: UserRole;
  page: string;
  category: 'UX' | 'Trust' | 'Medical' | 'Privacy' | 'Security' | 'Blood Donation' | 'Fundraising' | 'Navigation' | 'Accessibility' | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  status: 'OPEN' | 'IN_REVIEW' | 'PLANNED' | 'FIXED' | 'WONT_FIX';
  createdAt: string;
}

export interface PilotIssue {
  issueId: string;
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo: string;
  status: 'OPEN' | 'IN_REVIEW' | 'PLANNED' | 'FIXED' | 'WONT_FIX';
  createdAt: string;
}
