# LifeBridge India — Data Classification Specification (Phase 3)

**Version:** V1.1.1  
**Date:** October 2026  
**Status:** Approved Security Foundation Specification  

---

## 1. Classification Levels Overview

LifeBridge India enforces a 6-tier data classification system to maintain medical safety, privacy compliance, and strict role-based access control (RBAC).

| Classification Level | Target Audience / Scope | Example Data / Fields |
| :--- | :--- | :--- |
| **PUBLIC** | Unauthenticated Website Visitors | Sanitized campaign summaries, disease category guides, public transparency ledger, public research links |
| **AUTHENTICATED** | Any Signed-in User (Any Valid Role) | Blood donor search results (sanitized), voluntary donor registration, pilot feedback submissions |
| **ROLE_RESTRICTED** | Verified Specific Roles (`DOCTOR`, `HOSPITAL`, `CSR`, `VOLUNTEER`) | Clinical update logs, hospital milestone entries, CSR sponsorship compliance reports, standby blood alerts |
| **PATIENT_PRIVATE** | Patient/Family Member + Direct Attending Doctor/Hospital + Platform Admin | Full medical diagnosis reports, genetic sequencing PDFs, government identity proofs, hospital proforma cost estimates |
| **ADMIN_RESTRICTED** | Platform Administrator Only | System audit log streams, user role assignments, pilot participant rosters, internal issue tracking |
| **PAYMENT_RESTRICTED** | Platform Ledger & Financial Settlement Systems | Transaction IDs, financial contribution amounts, payout settlement records |

---

## 2. Collection-by-Collection Governance Matrix

### A. Core Platform Collections

#### 1. `/users/{userId}`
- **Purpose:** Primary user profile, session identity, and role storage.
- **Sensitivity Level:** `PATIENT_PRIVATE` / `ADMIN_RESTRICTED`
- **Read:** Owner (`request.auth.uid == userId`) OR `ADMIN`.
- **Create:** Any authenticated user during signup (`request.auth != null`). Self-assigned role restricted to non-privileged roles (`DONOR`, `PATIENT_FAMILY`, `VOLUNTEER`).
- **Update:** Owner OR `ADMIN`. Non-admin users cannot alter their own `role` field (`request.resource.data.role == resource.data.role`).
- **Delete:** Owner OR `ADMIN`.

#### 2. `/patients/{patientId}` & `/campaigns/{campaignId}`
- **Purpose:** Patient support campaign metadata, goal tracking, and verification status.
- **Sensitivity Level:** `PUBLIC` (Sanitized Summary) + `PATIENT_PRIVATE` (Case Details)
- **Read:** Public (`true`) for approved sanitized fields (`patientName`, `age`, `city`, `diseaseCategory`, `targetAmount`, `raisedAmount`, `summary`, `verification.hopeScorePercentage`). Detailed medical history requires authenticated verification access.
- **Create:** `PATIENT_FAMILY` OR `ADMIN`. Must set initial status to `SUBMITTED` or `DRAFT`.
- **Update:** `PATIENT_FAMILY` (own campaign profile), `DOCTOR`, `HOSPITAL`, OR `ADMIN`. `raisedAmount` cannot be altered by arbitrary client writes (`request.resource.data.raisedAmount == resource.data.raisedAmount`).
- **Delete:** `ADMIN` only.

#### 3. `/verification/{verificationId}`
- **Purpose:** 5-Stage Hope Verification audit records and checkpoint sign-offs.
- **Sensitivity Level:** `PUBLIC` (Checklist Status) + `ROLE_RESTRICTED` (Audit Evidence)
- **Read:** Public (`true`) for high-level checklist badge state (e.g. 4/5 checks completed). Detailed reviewer notes restricted to `DOCTOR`, `HOSPITAL`, `ADMIN`.
- **Create / Update:** `DOCTOR`, `HOSPITAL`, OR `ADMIN`.
- **Delete:** `ADMIN` only.

#### 4. `/hopeJourney/{journeyId}`
- **Purpose:** Treatment milestone progress tracking (Diagnosis, Gene Therapy, Rehab, Discharge).
- **Sensitivity Level:** `PUBLIC` (Milestone Titles) + `ROLE_RESTRICTED` (Clinical Progress Notes)
- **Read:** Public (`true`).
- **Create / Update:** `PATIENT_FAMILY`, `DOCTOR`, `HOSPITAL`, OR `ADMIN`.
- **Delete:** `ADMIN` only.

---

### B. Directory & Emergency Network Collections

#### 5. `/hospitals/{hospitalId}` & `/doctors/{doctorId}`
- **Purpose:** Directory of verified treating hospitals and attending specialists.
- **Sensitivity Level:** `PUBLIC`
- **Read:** Public (`true`).
- **Create / Update:** Verified `HOSPITAL` / `DOCTOR` desk OR `ADMIN`.
- **Delete:** `ADMIN` only.

#### 6. `/bloodDonors/{donorId}`
- **Purpose:** Voluntary standby blood donor registry for rare blood types (O-negative, platelets).
- **Sensitivity Level:** `AUTHENTICATED` / `PATIENT_PRIVATE`
- **Read:** Authenticated users only (`request.auth != null`). Contact details (phone, exact address) are **never** returned to client queries.
- **Create / Update / Delete:** Owner (`isOwner(resource.data.userId)`) OR `ADMIN`.

#### 7. `/bloodRequests/{requestId}`
- **Purpose:** Urgent hospital/family blood component requests.
- **Sensitivity Level:** `PUBLIC` (Sanitized Need) + `ROLE_RESTRICTED` (Patient Routing)
- **Read:** Public (`true`).
- **Create:** Authenticated users (`request.auth != null`).
- **Update:** `HOSPITAL` OR `ADMIN`.
- **Delete:** `ADMIN` only.

---

### C. Operations, Audit & Financial Collections

#### 8. `/donations/{donationId}` & `/transparency/{ledgerId}`
- **Purpose:** Public zero-fee transaction ledger and contribution audit records.
- **Sensitivity Level:** `PUBLIC` (Public Ledger) + `PAYMENT_RESTRICTED` (Settlement Gateway)
- **Read:** Public (`true`).
- **Create / Update:** `ADMIN` only (or trusted serverless gateway once deployed). Arbitrary client writes to `/transparency` are prohibited.

#### 9. `/auditLogs/{logId}`
- **Purpose:** System security audit trail recording administrative and medical report access events.
- **Sensitivity Level:** `ADMIN_RESTRICTED` / `ROLE_RESTRICTED`
- **Read:** `ADMIN`, `DOCTOR`, `HOSPITAL`.
- **Create:** Authenticated users (Client-initiated audit entry in ₹0 Spark mode; will transition to Cloud Functions server triggers in Blaze mode).
- **Update / Delete:** Prohibited (`false`). Audit logs are append-only.

#### 10. `/notifications/{notificationId}`
- **Purpose:** In-app notification alerts for campaign updates and blood donor matches.
- **Sensitivity Level:** `PATIENT_PRIVATE`
- **Read:** Recipient only (`request.auth.uid == resource.data.recipientUid`).
- **Create:** Authenticated users (Client trigger; recipient UID required).
- **Update:** Recipient only (`request.auth.uid == resource.data.recipientUid`).
- **Delete:** Recipient OR `ADMIN`.

#### 11. `/pilotFeedback/{feedbackId}`, `/pilotParticipants/{participantId}`, `/pilotIssues/{issueId}`
- **Purpose:** Usability testing feedback, pilot participant tracking, and issue management.
- **Sensitivity Level:** `ADMIN_RESTRICTED`
- **Read:** Owner OR `ADMIN`.
- **Create:** Authenticated users (Feedback); `ADMIN` (Participants / Issues).
- **Update / Delete:** `ADMIN` only.

---

## 3. Summary Risk Boundary Enforcement

1. **No Public PII Exposure:** Patient phone numbers, guardian national IDs, and exact residential addresses are strictly isolated from `/patients` public queries.
2. **Client Financial Protection:** `raisedAmount` cannot be incremented by client payload manipulation in Firestore rules.
3. **Immutable Audit Stream:** `/auditLogs` rejects all `update` and `delete` attempts server-side.
