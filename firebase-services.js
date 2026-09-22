/* ==========================================================================
   LIFEBRIDGE INDIA - FIREBASE SERVICES & CONTROLLED PILOT MODULE
   Authentication, Firestore Collections, Document Review, Feedback & Audit Logging
   ========================================================================== */

// Shared Validation Constants
const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_ROLES = ["DONOR", "PATIENT_FAMILY", "VOLUNTEER", "DOCTOR", "HOSPITAL", "CSR", "ADMIN"];
const VALID_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUIRED", "VERIFIED", "APPROVED", "REJECTED", "SUSPENDED"];

// Validation Helpers
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidBloodGroup(grp) {
  if (!grp || typeof grp !== 'string') return false;
  const formatted = grp.trim().toUpperCase().replace('_', '+');
  return VALID_BLOOD_GROUPS.includes(formatted);
}

function sanitizeRole(role) {
  if (!role || typeof role !== 'string') return 'DONOR';
  const upper = role.trim().toUpperCase();
  return VALID_ROLES.includes(upper) ? upper : 'DONOR';
}

/**
 * 1. FIREBASE AUTHENTICATION & ROLE MANAGEMENT
 */
const LifeBridgeAuth = {
  currentUser: null,
  currentRole: 'DONOR',

  async registerUser(email, password, displayName, role = 'DONOR', phone = '') {
    try {
      if (!isValidEmail(email)) {
        return { success: false, error: "Invalid email format." };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }

      const assignedRole = sanitizeRole(role);
      console.log(`[Firebase Auth] Registering user ${email} with role: ${assignedRole}`);
      const mockUid = "user_" + Math.random().toString(36).substring(2, 9);
      
      const userProfile = {
        uid: mockUid,
        email: email.trim().toLowerCase(),
        displayName: (displayName || email.split('@')[0]).substring(0, 100),
        role: assignedRole,
        phone: (phone || '').substring(0, 20),
        isEmailVerified: true,
        consentAccepted: true,
        consentTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      this.currentUser = userProfile;
      this.currentRole = assignedRole;

      await LifeBridgeDB.createRecord('users', mockUid, userProfile);

      await LifeBridgeDB.createAuditLog(
        mockUid,
        'USER_REGISTERED',
        `users/${mockUid}`,
        null,
        { email: userProfile.email, role: assignedRole }
      );

      return { success: true, user: userProfile };
    } catch (error) {
      console.error("[Firebase Auth Error]", error);
      return { success: false, error: "Authentication failed." };
    }
  },

  async loginUser(email, password) {
    try {
      if (!isValidEmail(email)) {
        return { success: false, error: "Invalid email format." };
      }
      console.log(`[Firebase Auth] Logging in user: ${email}`);
      const userProfile = {
        uid: "user_active_" + Math.random().toString(36).substring(2, 7),
        email: email.trim().toLowerCase(),
        displayName: email.split('@')[0],
        role: this.currentRole || 'DONOR',
        createdAt: new Date().toISOString()
      };
      this.currentUser = userProfile;
      return { success: true, user: userProfile };
    } catch (error) {
      return { success: false, error: "Login failed." };
    }
  },

  async logoutUser() {
    console.log("[Firebase Auth] Signing out user session...");
    const previousUid = this.currentUser ? this.currentUser.uid : null;
    
    this.currentUser = null;
    this.currentRole = 'DONOR';

    if (previousUid) {
      await LifeBridgeDB.createAuditLog(
        previousUid,
        'USER_LOGGED_OUT',
        `users/${previousUid}`,
        { status: "AUTHENTICATED" },
        { status: "UNAUTHENTICATED" }
      );
    }

    return { success: true, message: "User signed out cleanly." };
  },

  async sendPasswordReset(email) {
    if (!isValidEmail(email)) {
      return { success: false, error: "Invalid email format." };
    }
    console.log(`[Firebase Auth] Dispatching password reset email to: ${email}`);
    return {
      success: true,
      message: "If an account exists for this email address, a password reset link has been dispatched."
    };
  },

  async loginWithPhone(phoneNumber, appVerifier) {
    try {
      if (!phoneNumber || phoneNumber.length < 10) {
        return { success: false, error: "Invalid phone number format." };
      }
      const mockUid = "phone_user_" + Math.random().toString(36).substring(2, 8);
      const userProfile = {
        uid: mockUid,
        phone: phoneNumber,
        role: 'DONOR',
        createdAt: new Date().toISOString()
      };

      this.currentUser = userProfile;
      this.currentRole = 'DONOR';

      return { success: true, user: userProfile };
    } catch (error) {
      return { success: false, error: "Phone authentication failed." };
    }
  },

  async loginWithGoogle(preferredRole = 'DONOR') {
    const assignedRole = sanitizeRole(preferredRole);
    const userProfile = {
      uid: "google_user_" + Math.random().toString(36).substring(2, 8),
      email: "google.user@example.org",
      displayName: "Google User",
      role: assignedRole,
      createdAt: new Date().toISOString()
    };
    this.currentUser = userProfile;
    this.currentRole = assignedRole;
    return { success: true, user: userProfile };
  },

  async deleteAccount(uid) {
    const targetUid = uid || (this.currentUser ? this.currentUser.uid : null);
    if (!targetUid) {
      return { success: false, error: "No active user session to delete." };
    }

    console.log(`[Firebase Auth & Privacy] Deleting account for UID: ${targetUid}`);
    await LifeBridgeDB.createAuditLog(
      targetUid,
      'ACCOUNT_DELETED_PRIVACY_REQUEST',
      `users/${targetUid}`,
      { uid: targetUid },
      { status: 'DELETED_AND_ANONYMIZED' }
    );

    this.currentUser = null;
    this.currentRole = 'DONOR';
    return { success: true, message: "Account data scrubbed successfully under Privacy Policy." };
  }
};

/**
 * 2. CLOUD FIRESTORE COLLECTIONS & CONTROLLED PILOT DATA MANAGEMENT
 */
const LifeBridgeDB = {
  
  async createRecord(collectionName, recordId, data) {
    console.log(`[Firestore DB] Creating document in '${collectionName}/${recordId}'`, data);
    return { id: recordId, ...data };
  },

  async createAuditLog(actorUid, action, affectedRecordPath, previousState, newState) {
    const logId = "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const auditRecord = {
      logId: logId,
      actor: actorUid || 'SYSTEM_SERVERLESS',
      action: action,
      affectedRecord: affectedRecordPath,
      previousState: previousState ? JSON.stringify(previousState) : null,
      newState: newState ? JSON.stringify(newState) : null,
      timestamp: new Date().toISOString()
    };
    console.log(`[Firestore AuditLog] 📋 Record Created:`, auditRecord);
    return auditRecord;
  },

  async createPatientCampaign(patientData, userRole = 'PATIENT_FAMILY') {
    const patientId = "patient_" + Date.now();
    const campaignId = "camp_" + Date.now();

    const rawGoal = Number(patientData.goalAmount);
    const goalAmount = (Number.isFinite(rawGoal) && rawGoal >= 1000 && rawGoal <= 500000000) ? rawGoal : 160000000;

    const newPatient = {
      patientId: patientId,
      name: (patientData.name || "Sample Patient Case").substring(0, 100),
      age: (patientData.age || "12 Months").substring(0, 50),
      diseaseCategory: (patientData.diseaseCategory || "SMA").substring(0, 50),
      smaType: (patientData.smaType || "SMA Type 1").substring(0, 50),
      hospitalId: (patientData.hospitalId || "hosp_aiims_delhi").substring(0, 50),
      doctorId: (patientData.doctorId || "doc_neurologist_01").substring(0, 50),
      goalAmount: goalAmount,
      raisedAmount: 0,
      status: "SUBMITTED", // Initial status in pipeline
      isDemoData: true,
      verificationDrawer: {
        identity: { status: "VERIFIED", reviewer: "Admin Desk", lastReviewed: new Date().toLocaleDateString() },
        medicalDocs: { status: "VERIFIED", reviewer: "Treating Neurologist", lastReviewed: new Date().toLocaleDateString() },
        hospital: { status: "VERIFIED", reviewer: "Partner Hospital Desk", lastReviewed: new Date().toLocaleDateString() },
        doctor: { status: "VERIFIED", reviewer: "Neurology Desk", lastReviewed: new Date().toLocaleDateString() },
        estimate: { status: "VERIFIED", reviewer: "Hospital Accounts", lastReviewed: new Date().toLocaleDateString() },
        disclaimerNote: "Verification confirms that listed information and documents have undergone review. It does not guarantee treatment outcome or medical success."
      },
      createdBy: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'anonymous',
      createdAt: new Date().toISOString()
    };

    await this.createRecord('patients', patientId, newPatient);

    await this.createRecord('hopeJourney', `${patientId}_step1`, {
      patientId: patientId,
      milestoneIndex: 1,
      milestoneName: "Diagnosis & Document Submission",
      status: "COMPLETED",
      timestamp: new Date().toISOString()
    });

    await this.createAuditLog(
      LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'system',
      'CAMPAIGN_CREATED',
      `patients/${patientId}`,
      null,
      newPatient
    );

    return { patientId, campaignId, patient: newPatient };
  },

  // Document Review Handler (Human Verification Only)
  async reviewDocument(docId, action, reviewerRole, notes = '') {
    if (!['ADMIN', 'DOCTOR', 'HOSPITAL'].includes(reviewerRole)) {
      throw new Error("Permission denied. Human reviewer authorization required.");
    }

    console.log(`[Document Review] Document ${docId} action: ${action} by ${reviewerRole}`);

    const reviewRecord = {
      docId: docId,
      reviewStatus: action, // APPROVED, REJECTED, REQUIRES_CLARIFICATION
      reviewerUid: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'reviewer_id',
      reviewerRole: reviewerRole,
      notes: notes,
      reviewDate: new Date().toISOString()
    };

    await this.createAuditLog(
      reviewRecord.reviewerUid,
      `DOCUMENT_${action}`,
      `documents/${docId}`,
      { status: "PENDING_REVIEW" },
      reviewRecord
    );

    return reviewRecord;
  },

  // Hospital Milestone Update Handler
  async updateHospitalMilestone(patientId, milestoneName, notes = '') {
    if (LifeBridgeAuth.currentRole !== 'HOSPITAL' && LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Hospital Desk authorization required.");
    }

    const milestoneRecord = {
      patientId: patientId,
      milestoneName: milestoneName,
      updatedBy: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'hosp_desk',
      notes: notes,
      timestamp: new Date().toISOString()
    };

    await this.createAuditLog(
      milestoneRecord.updatedBy,
      'HOSPITAL_MILESTONE_UPDATED',
      `patients/${patientId}/milestones`,
      null,
      milestoneRecord
    );

    return milestoneRecord;
  },

  // Doctor Clinical Update Handler
  async addDoctorClinicalUpdate(patientId, updateText) {
    if (LifeBridgeAuth.currentRole !== 'DOCTOR' && LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Doctor Desk authorization required.");
    }

    const clinicalRecord = {
      patientId: patientId,
      updateText: updateText,
      doctorUid: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'doc_neurologist',
      timestamp: new Date().toISOString()
    };

    await this.createAuditLog(
      clinicalRecord.doctorUid,
      'DOCTOR_CLINICAL_UPDATE_ADDED',
      `patients/${patientId}/clinical`,
      null,
      clinicalRecord
    );

    return clinicalRecord;
  },

  // Enhanced Pilot User Feedback Handler (V1.1)
  async submitPilotFeedback(feedbackData) {
    const feedbackId = "fb_" + Date.now();
    const feedbackRecord = {
      feedbackId: feedbackId,
      userId: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'anonymous',
      role: LifeBridgeAuth.currentRole || 'DONOR',
      page: feedbackData.page || window.location.hash.replace('#', '') || 'home',
      category: (feedbackData.category || 'UX').toUpperCase(), // UX, Trust, Medical, Privacy, Security, Blood Donation, Fundraising, Navigation, Accessibility, Other
      severity: (feedbackData.severity || 'MEDIUM').toUpperCase(), // LOW, MEDIUM, HIGH, CRITICAL
      message: (feedbackData.message || feedbackData.whatWorked || '').substring(0, 1000),
      whatWorked: feedbackData.whatWorked || '',
      whatWasConfusing: feedbackData.whatWasConfusing || '',
      whatShouldImprove: feedbackData.whatShouldImprove || '',
      status: "OPEN", // OPEN, IN_REVIEW, PLANNED, FIXED, WONT_FIX
      isDemoData: true,
      createdAt: new Date().toISOString()
    };

    await this.createRecord('pilotFeedback', feedbackId, feedbackRecord);

    await this.createAuditLog(
      feedbackRecord.userId,
      'PILOT_FEEDBACK_SUBMITTED',
      `pilotFeedback/${feedbackId}`,
      null,
      { role: feedbackRecord.role, category: feedbackRecord.category, severity: feedbackRecord.severity }
    );

    return feedbackRecord;
  },

  // Pilot Test Participant Manager (Admin Only Write)
  async registerPilotParticipant(participantData) {
    if (LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Admin authorization required to register pilot participants.");
    }

    const participantId = "part_" + Date.now();
    const participantRecord = {
      participantId: participantId,
      userId: participantData.userId || (LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'anon_user'),
      role: (participantData.role || 'DONOR').toUpperCase(),
      consentGiven: true,
      joinedAt: new Date().toISOString(),
      status: "ACTIVE", // INVITED, ACTIVE, COMPLETED, WITHDRAWN
      notes: participantData.notes || "Controlled Pilot Participant",
      isDemoData: true
    };

    await this.createRecord('pilotParticipants', participantId, participantRecord);

    await this.createAuditLog(
      LifeBridgeAuth.currentUser.uid,
      'PILOT_PARTICIPANT_REGISTERED',
      `pilotParticipants/${participantId}`,
      null,
      participantRecord
    );

    return participantRecord;
  },

  // Update Pilot Participant Status (Admin Only)
  async updateParticipantStatus(participantId, newStatus, notes = '') {
    if (LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Admin authorization required.");
    }

    const previousState = { status: "ACTIVE" };
    const newState = { status: newStatus, notes: notes, updatedAt: new Date().toISOString() };

    await this.createAuditLog(
      LifeBridgeAuth.currentUser.uid,
      'PILOT_PARTICIPANT_STATUS_CHANGED',
      `pilotParticipants/${participantId}`,
      previousState,
      newState
    );

    return { success: true, participantId, newState };
  },

  // Pilot Issue Tracker Manager (Admin Only)
  async createPilotIssue(issueData) {
    if (LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Admin authorization required to create issues.");
    }

    const issueId = "issue_" + Date.now();
    const issueRecord = {
      issueId: issueId,
      feedbackId: issueData.feedbackId || null,
      title: (issueData.title || "Pilot Usability Issue").substring(0, 150),
      description: (issueData.description || "").substring(0, 1000),
      category: (issueData.category || "UX").toUpperCase(),
      severity: (issueData.severity || "MEDIUM").toUpperCase(),
      assignedTo: issueData.assignedTo || "ADMIN_DESK",
      status: "OPEN", // OPEN, IN_REVIEW, PLANNED, FIXED, WONT_FIX
      isDemoData: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.createRecord('pilotIssues', issueId, issueRecord);

    await this.createAuditLog(
      LifeBridgeAuth.currentUser.uid,
      'PILOT_ISSUE_CREATED',
      `pilotIssues/${issueId}`,
      null,
      issueRecord
    );

    return issueRecord;
  },

  // Update Pilot Issue Status (Admin Only)
  async updatePilotIssueStatus(issueId, newStatus, assignedTo = '') {
    if (LifeBridgeAuth.currentRole !== 'ADMIN') {
      throw new Error("Permission denied. Admin authorization required.");
    }

    const previousState = { status: "OPEN" };
    const newState = { status: newStatus, assignedTo: assignedTo || "ADMIN_DESK", updatedAt: new Date().toISOString() };

    await this.createAuditLog(
      LifeBridgeAuth.currentUser.uid,
      'PILOT_ISSUE_STATUS_CHANGED',
      `pilotIssues/${issueId}`,
      previousState,
      newState
    );

    return { success: true, issueId, newState };
  },

  // Trust Survey & Usability Rating Submitter
  async submitTrustSurvey(surveyData) {
    const surveyId = "surv_" + Date.now();
    const surveyRecord = {
      surveyId: surveyId,
      userId: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'anonymous',
      userRole: LifeBridgeAuth.currentRole || 'DONOR',
      trustChoice: surveyData.trustChoice || 'Probably', // Definitely, Probably, Not sure, Probably not, Definitely not
      trustFeedback: (surveyData.trustFeedback || '').substring(0, 500),
      usabilityRatings: {
        easeOfUse: Number(surveyData.easeOfUse) || 5,
        clarity: Number(surveyData.clarity) || 5,
        trust: Number(surveyData.trust) || 5,
        navigation: Number(surveyData.navigation) || 5
      },
      noticeLabel: "Internal pilot feedback — not a scientific survey.",
      isDemoData: true,
      createdAt: new Date().toISOString()
    };

    await this.createRecord('pilotSurveys', surveyId, surveyRecord);

    await this.createAuditLog(
      surveyRecord.userId,
      'TRUST_SURVEY_SUBMITTED',
      `pilotSurveys/${surveyId}`,
      null,
      { choice: surveyRecord.trustChoice }
    );

    return surveyRecord;
  },

  // Simulated Donation Ledger Record (DEMO MODE SAFEGUARD)
  async recordDonation(campaignId, amount, paymentMethod = 'UPI') {
    const rawAmt = Number(amount);
    
    if (typeof amount === 'boolean' || amount === null || !Number.isFinite(rawAmt) || rawAmt < 1 || rawAmt > 500000) {
      throw new Error("Invalid donation amount. Amount must be a number between ₹1 and ₹5,00,000.");
    }

    const donationId = "don_" + Date.now();
    const donationRecord = {
      donationId: donationId,
      campaignId: campaignId,
      donorUserId: LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'guest_donor',
      amount: rawAmt,
      paymentMethod: paymentMethod,
      isDemoMode: true,
      receiptNote: "DEMO RECEIPT — NOT A TAX DOCUMENT",
      timestamp: new Date().toISOString()
    };

    await this.createRecord('transparency', `ledger_${donationId}`, {
      type: "DEMO_DONATION_SIMULATION",
      campaignId: campaignId,
      amount: rawAmt,
      isDemoMode: true,
      timestamp: new Date().toISOString()
    });

    return donationRecord;
  }
};

/**
 * 3. FIREBASE CLOUD STORAGE HELPERS & MEDICAL PRIVACY RULES
 */
const LifeBridgeStorage = {
  async uploadMedicalReport(patientId, fileObj) {
    const storagePath = `medical_reports/${patientId}/${Date.now()}_${(fileObj.name || 'report.pdf').replace(/[^a-zA-Z0-9_.-]/g, '')}`;
    
    await LifeBridgeDB.createAuditLog(
      LifeBridgeAuth.currentUser ? LifeBridgeAuth.currentUser.uid : 'family',
      'MEDICAL_REPORT_UPLOADED',
      storagePath,
      null,
      { accessLevel: "RESTRICTED_AUTHENTICATED_ONLY" }
    );

    return {
      storagePath: storagePath,
      isPublic: false,
      accessRestriction: "DOCTOR_HOSPITAL_PATIENT_FAMILY_ADMIN_ONLY"
    };
  },

  async uploadIdentityDoc(userId, fileObj) {
    const storagePath = `identity_documents/${userId}/${Date.now()}_${(fileObj.name || 'govt_id.jpg').replace(/[^a-zA-Z0-9_.-]/g, '')}`;
    return {
      storagePath: storagePath,
      isPublic: false,
      accessRestriction: "OWNER_AND_ADMIN_ONLY"
    };
  }
};

/**
 * 4. FIREBASE CLOUD MESSAGING (FCM) NOTIFICATION SERVICE
 */
const LifeBridgeMessaging = {
  async requestNotificationPermission() {
    return { success: true, fcmToken: "fcm_token_demo_9876543210_optin" };
  },

  async dispatchEmergencyBloodAlert(rawBloodGroup, city) {
    if (!isValidBloodGroup(rawBloodGroup)) {
      throw new Error(`Invalid blood group '${rawBloodGroup}'. Allowed blood groups: ${VALID_BLOOD_GROUPS.join(', ')}`);
    }
    const bloodGroup = rawBloodGroup.trim().toUpperCase().replace('_', '+');
    const cleanCity = (city || 'mumbai').trim().toLowerCase();

    return {
      topic: `emergency_blood_${bloodGroup}_${cleanCity}`,
      recipientsNotified: 42,
      timestamp: new Date().toISOString()
    };
  }
};

// Export to Global Window Context
window.LifeBridgeAuth = LifeBridgeAuth;
window.LifeBridgeDB = LifeBridgeDB;
window.LifeBridgeStorage = LifeBridgeStorage;
window.LifeBridgeMessaging = LifeBridgeMessaging;

console.log("LifeBridge India Controlled Pilot Services Loaded Successfully.");
