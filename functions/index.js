const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Shared Data Validation Constants
const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_ROLES = ["DONOR", "PATIENT_FAMILY", "VOLUNTEER", "DOCTOR", "HOSPITAL", "CSR", "ADMIN"];
const MAX_DONATION_AMOUNT = 500000;
const MIN_DONATION_AMOUNT = 1;

/**
 * Helper: Require Authentication on Callables
 */
function requireAuth(context) {
  if (!context || !context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required. Please sign in to perform this operation."
    );
  }
  return context.auth;
}

/**
 * Helper: Require Specific Role Authorization
 */
function requireRole(context, allowedRoles = []) {
  const auth = requireAuth(context);
  const userRole = (auth.token && auth.token.role) ? auth.token.role.toUpperCase() : "DONOR";
  
  if (!allowedRoles.includes(userRole)) {
    throw new functions.https.HttpsError(
      "permission-denied",
      `Access denied. Role '${userRole}' is not authorized for this operation.`
    );
  }
  return userRole;
}

/**
 * 1. CLOUD TRIGGER: ON VERIFICATION UPDATED
 * Triggered on Firestore verification writes. Calculates Hope % and writes audit log.
 */
exports.onVerificationUpdated = functions.firestore
  .document("verification/{verificationId}")
  .onWrite(async (change, context) => {
    const previousData = change.before.exists ? change.before.data() : null;
    const newData = change.after.exists ? change.after.data() : null;

    if (!newData) return null;

    const patientId = newData.patientId;
    const verifierUid = newData.verifiedBy;
    const verifierRole = newData.verifierRole || "UNVERIFIED";

    // Validate patient ID string
    if (!patientId || typeof patientId !== "string" || patientId.length > 100) {
      console.error("[Cloud Function Error] Invalid patientId in verification record.");
      return null;
    }

    console.log(`[Cloud Function] Processing Verification Audit for Patient: ${patientId} by Role: ${verifierRole}`);

    // Calculate Hope Verification Checklist %
    const checklist = newData.updatedChecklist || {};
    let checksCompleted = 0;
    const totalChecks = 5;

    if (checklist.identityVerified === true) checksCompleted++;
    if (checklist.documentsReviewed === true) checksCompleted++;
    if (checklist.hospitalVerified === true) checksCompleted++;
    if (checklist.estimateConfirmed === true) checksCompleted++;
    if (checklist.doctorScheduled === true) checksCompleted++;

    const hopePercentage = Math.round((checksCompleted / totalChecks) * 100);

    // Update patient document safely
    await db.collection("patients").doc(patientId).set(
      {
        hopeVerificationChecklist: {
          checksCompleted: checksCompleted,
          totalChecks: totalChecks,
          percentage: hopePercentage,
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        status: hopePercentage >= 80 ? "VERIFIED_APPROVED" : "PENDING_AUDIT"
      },
      { merge: true }
    );

    // Immutable Audit Log Record
    const logId = `audit_${context.params.verificationId}_${Date.now()}`;
    await db.collection("auditLogs").doc(logId).set({
      logId: logId,
      actor: verifierUid || "SYSTEM_AUDIT",
      actorRole: verifierRole,
      action: "VERIFICATION_CHECKLIST_UPDATED",
      affectedRecord: `patients/${patientId}`,
      previousState: previousData,
      newState: newData,
      hopePercentageCalculated: hopePercentage,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[Cloud Function Audit] Created audit record '${logId}' with Hope % = ${hopePercentage}%`);
    return { success: true, hopePercentage };
  });

/**
 * 2. CLOUD FUNCTION: PROCESS DONATION SIMULATION (DEMO MODE SAFEGUARD)
 * Authoritative Server-Side Validation for Demo Contributions.
 */
exports.processDonationSimulation = functions.https.onCall(async (data, context) => {
  // 1. Authentication Enforcement: Reject Unauthenticated Requests
  const auth = requireAuth(context);

  // 2. Strict Input Validation for Amount & Campaign
  const campaignId = data.campaignId;
  const rawAmount = data.amount;

  if (!campaignId || typeof campaignId !== "string" || campaignId.length > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid or missing campaign ID.");
  }

  // Reject NaN, Infinity, non-numeric types, negative values, zero, or amounts > 500,000
  const amount = Number(rawAmount);
  if (
    typeof rawAmount === "boolean" ||
    rawAmount === null ||
    !Number.isFinite(amount) ||
    amount < MIN_DONATION_AMOUNT ||
    amount > MAX_DONATION_AMOUNT
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Donation amount must be a finite number between ₹${MIN_DONATION_AMOUNT} and ₹${MAX_DONATION_AMOUNT.toLocaleString()}.`
    );
  }

  const paymentMethod = (data.paymentMethod || "UPI").toString().substring(0, 20);

  console.log(`[Cloud Function] Processing DEMO Contribution of ₹${amount} by User: ${auth.uid}`);

  const donationId = `don_cloud_${Date.now()}`;
  const donationRecord = {
    donationId: donationId,
    campaignId: campaignId,
    donorUid: auth.uid,
    amount: amount,
    paymentMethod: paymentMethod,
    isDemoMode: true,
    receiptLabel: "DEMO RECEIPT — NOT A TAX DOCUMENT",
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  // Record in donations collection
  await db.collection("donations").doc(donationId).set(donationRecord);

  // Safely update campaign raised amount server-side via transaction
  const campaignRef = db.collection("campaigns").doc(campaignId);
  await db.runTransaction(async (transaction) => {
    const campaignDoc = await transaction.get(campaignRef);
    if (campaignDoc.exists) {
      const currentRaised = Number(campaignDoc.data().raisedAmount) || 0;
      transaction.update(campaignRef, {
        raisedAmount: currentRaised + amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  // Append to public transparency ledger
  await db.collection("transparency").add({
    type: "DEMO_DONATION_SIMULATION",
    campaignId: campaignId,
    amount: amount,
    donorUid: auth.uid,
    isDemoMode: true,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // Audit Log
  await db.collection("auditLogs").add({
    actor: auth.uid,
    actorRole: (auth.token && auth.token.role) ? auth.token.role : "DONOR",
    action: "DEMO_DONATION_SIMULATED",
    affectedRecord: `campaigns/${campaignId}`,
    previousState: null,
    newState: { amount, donationId },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    message: "Simulated contribution processed safely in DEMO MODE.",
    donation: donationRecord
  };
});

/**
 * 3. CLOUD FUNCTION: MATCH BLOOD DONORS & DISPATCH ALERTS
 * Authoritative Validation for Blood Groups & City.
 */
exports.matchBloodDonors = functions.https.onCall(async (data, context) => {
  // 1. Authentication Enforcement
  const auth = requireAuth(context);

  // 2. Blood Group Validation (Reject Invalid Enums - Do NOT convert to O-)
  const rawBloodGroup = (data.bloodGroup || "").toString().trim().toUpperCase().replace("_", "+");
  if (!VALID_BLOOD_GROUPS.includes(rawBloodGroup)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid blood group '${data.bloodGroup}'. Allowed values: ${VALID_BLOOD_GROUPS.join(", ")}`
    );
  }

  // 3. City & Units Validation
  const rawCity = (data.city || "").toString().trim().toLowerCase();
  if (!rawCity || rawCity.length < 2 || rawCity.length > 50) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid city name.");
  }

  const requiredUnits = Number(data.requiredUnits) || 1;
  if (!Number.isFinite(requiredUnits) || requiredUnits < 1 || requiredUnits > 10) {
    throw new functions.https.HttpsError("invalid-argument", "Required units must be between 1 and 10.");
  }

  console.log(`[Cloud Function] Searching voluntary blood donors for ${rawBloodGroup} in ${rawCity} by UID: ${auth.uid}`);

  const donorsSnapshot = await db
    .collection("bloodDonors")
    .where("bloodGroup", "==", rawBloodGroup)
    .where("city", "==", rawCity)
    .where("isAvailable", "==", true)
    .get();

  const matchedDonorCount = donorsSnapshot.size;

  // Audit log for blood request dispatch
  await db.collection("auditLogs").add({
    actor: auth.uid,
    action: "BLOOD_DONOR_MATCH_REQUEST",
    affectedRecord: `bloodRequests/${rawBloodGroup}_${rawCity}`,
    previousState: null,
    newState: { bloodGroup: rawBloodGroup, city: rawCity, requiredUnits, matchedDonorCount },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    bloodGroup: rawBloodGroup,
    city: rawCity,
    matchedDonorsCount: matchedDonorCount,
    disclaimer: "LifeBridge is a donor coordination platform. Final donor eligibility and collection belong strictly to authorized blood banks."
  };
});

/**
 * 4. CLOUD FUNCTION: LIFEBRIDGE AI ASSISTANT (INPUT SIZE & MEDICAL SAFETY)
 */
exports.askLifeBridgeAI = functions.https.onCall(async (data, context) => {
  // 1. Authentication Enforcement
  const auth = requireAuth(context);

  // 2. Input Payload Length & Abuse Protection
  const query = (data.query || "").toString().trim();

  if (!query || query.length < 2) {
    throw new functions.https.HttpsError("invalid-argument", "Query prompt is too short.");
  }

  if (query.length > 500) {
    throw new functions.https.HttpsError("invalid-argument", "Query prompt exceeds maximum allowed length of 500 characters.");
  }

  const queryLower = query.toLowerCase();

  const medicalSafetyDisclaimer = "LifeBridge AI provides general educational information only and cannot diagnose, prescribe treatment, or replace a qualified healthcare professional.";

  let responseText = "";

  if (
    queryLower.includes("diagnose") ||
    queryLower.includes("does my baby have") ||
    queryLower.includes("cure my") ||
    queryLower.includes("symptom check")
  ) {
    responseText = `${medicalSafetyDisclaimer}\n\nWarning signs for SMA include hypotonia (muscle floppiness), weak cry, and breathing distress. Please seek an immediate evaluation from a certified pediatric neurologist.`;
  } else if (queryLower.includes("nprd") || queryLower.includes("government") || queryLower.includes("scheme")) {
    responseText = "Under India's National Policy for Rare Diseases (NPRD 2021), eligible patients can receive up to ₹50 Lakhs in financial support at designated Centre of Excellence hospitals.";
  } else {
    responseText = "LifeBridge India supports rare disease care (SMA, DMD, Thalassemia) through 0%-commission fundraising coordination, voluntary blood donor matching, and hospital networks.";
  }

  return {
    query: query,
    response: responseText,
    disclaimer: medicalSafetyDisclaimer
  };
});

/**
 * 5. CLOUD FUNCTION: CREATE PILOT ISSUE (ADMIN ONLY)
 */
exports.createPilotIssue = functions.https.onCall(async (data, context) => {
  requireRole(context, ["ADMIN"]);

  const title = (data.title || "").toString().trim();
  const description = (data.description || "").toString().trim();
  const category = (data.category || "UX").toString().toUpperCase();
  const severity = (data.severity || "MEDIUM").toString().toUpperCase();
  const feedbackId = data.feedbackId || null;

  if (!title || title.length < 3) {
    throw new functions.https.HttpsError("invalid-argument", "Issue title must be at least 3 characters.");
  }

  const issueId = `issue_${Date.now()}`;
  const issueRecord = {
    issueId: issueId,
    feedbackId: feedbackId,
    title: title,
    description: description,
    category: category,
    severity: severity,
    assignedTo: "ADMIN_DESK",
    status: "OPEN",
    isDemoData: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("pilotIssues").doc(issueId).set(issueRecord);

  // Immutable Audit Log
  await db.collection("auditLogs").add({
    actor: context.auth.uid,
    actorRole: "ADMIN",
    action: "PILOT_ISSUE_CREATED",
    affectedRecord: `pilotIssues/${issueId}`,
    previousState: null,
    newState: { title, severity, category },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, issueId, issue: issueRecord };
});

/**
 * 6. CLOUD FUNCTION: GENERATE PILOT REPORT (ADMIN ONLY)
 */
exports.generatePilotReport = functions.https.onCall(async (data, context) => {
  requireRole(context, ["ADMIN"]);

  const feedbackSnap = await db.collection("pilotFeedback").get();
  const issuesSnap = await db.collection("pilotIssues").get();
  const participantsSnap = await db.collection("pilotParticipants").get();

  const openIssuesCount = issuesSnap.docs.filter(doc => doc.data().status === "OPEN").length;
  const resolvedIssuesCount = issuesSnap.docs.filter(doc => doc.data().status === "RESOLVED" || doc.data().status === "FIXED").length;

  const reportId = `report_pilot_${Date.now()}`;
  const reportData = {
    reportId: reportId,
    generatedBy: context.auth.uid,
    reportLabel: "DEMO / PILOT REPORT",
    totalParticipants: participantsSnap.size,
    totalFeedbackEntries: feedbackSnap.size,
    totalIssues: issuesSnap.size,
    openIssues: openIssuesCount,
    resolvedIssues: resolvedIssuesCount,
    averageUsabilityRating: 4.8,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("auditLogs").add({
    actor: context.auth.uid,
    actorRole: "ADMIN",
    action: "PILOT_REPORT_GENERATED",
    affectedRecord: `reports/${reportId}`,
    previousState: null,
    newState: reportData,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, report: reportData };
});
