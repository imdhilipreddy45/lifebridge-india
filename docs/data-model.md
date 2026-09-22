# LifeBridge India — Firestore Data Models & Schema Specifications

## Overview

All operational data within LifeBridge India is stored in Cloud Firestore using document-oriented collections. Data types are strictly typed in TypeScript (`src/types/index.ts`) and validated against schema constraints.

---

## Collections Specification

### 1. `users` Collection
Stores user account profile metadata linked to Firebase Auth UID (`/users/{uid}`).

```json
{
  "uid": "string (Firebase Auth UID)",
  "email": "string (Email address)",
  "displayName": "string (Display name)",
  "role": "DONOR | PATIENT_FAMILY | VOLUNTEER | DOCTOR | HOSPITAL | CSR | ADMIN",
  "phoneNumber": "string (Optional contact number)",
  "createdAt": "string (ISO 8601 UTC timestamp)",
  "consentGiven": "boolean (Terms & Privacy consent)"
}
```

### 2. `patients` Collection
Stores verified patient support campaigns (`/patients/{patientId}`).

```json
{
  "id": "string (Document ID)",
  "patientName": "string (Full name)",
  "age": "number (Age in years)",
  "city": "string (City location)",
  "state": "string (State location)",
  "diseaseCategory": "SMA | DMD | Thalassemia | Pediatric Cancer | Organ Transplant | Blood Disorders",
  "targetAmount": "number (Total goal in INR)",
  "raisedAmount": "number (Total confirmed raised in INR)",
  "treatingHospital": "string (Hospital name)",
  "attendingDoctor": "string (Attending doctor name)",
  "status": "DRAFT | SUBMITTED | UNDER_REVIEW | CLARIFICATION_REQUIRED | VERIFIED | APPROVED | REJECTED | SUSPENDED",
  "verification": {
    "identityVerified": "boolean",
    "medicalReportsVerified": "boolean",
    "hospitalDeskVerified": "boolean",
    "doctorVerificationCompleted": "boolean",
    "treatmentEstimateVerified": "boolean",
    "hopeScorePercentage": "number (0 to 100)",
    "lastReviewedAt": "string (ISO timestamp)",
    "reviewedByRole": "UserRole",
    "disclaimer": "string"
  },
  "milestones": [
    {
      "id": "string",
      "stageName": "string",
      "date": "string",
      "completed": "boolean",
      "notes": "string (Optional)"
    }
  ],
  "summary": "string (Case description)",
  "createdAt": "string (ISO timestamp)"
}
```

### 3. `bloodDonors` Collection
Stores voluntary blood donor availability records (`/bloodDonors/{donorId}`).

```json
{
  "id": "string (Document ID)",
  "city": "string (Lowercase city name e.g. 'mumbai')",
  "bloodGroup": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
  "componentType": "Whole Blood | Platelets | Plasma",
  "isAvailable": "boolean",
  "lastDonatedDate": "string (Optional ISO date)",
  "userId": "string (Optional user UID reference)"
}
```

### 4. `bloodRequests` Collection
Stores voluntary blood component requests (`/bloodRequests/{requestId}`).

```json
{
  "id": "string (Document ID)",
  "patientName": "string",
  "hospitalName": "string",
  "city": "string",
  "bloodGroup": "BloodGroup",
  "component": "BloodComponent",
  "urgency": "Standard | Emergency | ICU Fast-Track",
  "requiredUnits": "number",
  "status": "PENDING | MATCHED | FULFILLED",
  "disclaimer": "string",
  "createdAt": "string (ISO timestamp)"
}
```

### 5. `transparency` Collection
Stores public immutable financial transaction records (`/transparency/{transId}`).

```json
{
  "id": "string (Document ID)",
  "campaignId": "string (Target patient campaign ID)",
  "amount": "number (Contribution amount in INR)",
  "transactionId": "string (Unique reference identifier)",
  "purpose": "string",
  "paymentMethod": "string (e.g. 'CARD', 'UPI')",
  "status": "INITIATED | PENDING | SUCCESSFUL | FAILED | REFUNDED",
  "timestamp": "string (ISO timestamp)"
}
```

### 6. `auditLogs` Collection
Stores internal operational audit entries (`/auditLogs/{logId}`).

```json
{
  "id": "string",
  "actor": "string (User UID or 'anon')",
  "actorRole": "UserRole",
  "action": "string (e.g. 'MEDICAL_DOCUMENT_UPLOADED')",
  "affectedRecord": "string",
  "previousState": "any",
  "newState": "any",
  "timestamp": "FieldValue (Firestore serverTimestamp)"
}
```

---

## Index Specifications (`firestore.indexes.json`)

To ensure high-performance query execution without missing-index runtime errors, compound indexes are defined:

```json
{
  "indexes": [
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bloodDonors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bloodGroup", "order": "ASCENDING" },
        { "fieldPath": "city", "order": "ASCENDING" },
        { "fieldPath": "isAvailable", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transparency",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```
