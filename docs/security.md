# LifeBridge India — Security Architecture & RBAC Policy

## Security Model Overview

LifeBridge India implements a defense-in-depth security model to safeguard sensitive medical records, identity documents, and financial transaction records. Client-side state checks are treated solely as UI conveniences; all data mutations, role checks, and access constraints are enforced server-side via Firebase Security Rules (`firestore.rules` and `storage.rules`).

---

## Role-Based Access Control (RBAC) Matrix

| User Role | Read Public Campaigns | Upload Medical Reports | Verify Campaigns | Access Admin Queue | Create CSR Reports |
|---|:---:|:---:|:---:|:---:|:---:|
| `DONOR` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATIENT_FAMILY` | ✅ | ✅ (Own Case) | ❌ | ❌ | ❌ |
| `VOLUNTEER` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DOCTOR` | ✅ | ❌ | ✅ (Assigned) | ❌ | ❌ |
| `HOSPITAL` | ✅ | ❌ | ✅ (Desk Audit) | ❌ | ❌ |
| `CSR` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `ADMIN` | ✅ | ✅ | ✅ (Full) | ✅ | ✅ |

---

## Firestore Security Rules Specification

`firestore.rules` enforces least-privilege security controls across collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'ADMIN';
    }

    // Users Collection: Users can read/write their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) && request.resource.data.role == resource.data.role;
      allow delete: if isAdmin();
    }

    // Patient Campaigns: Public read, restricted creation and privileged verification
    match /patients/{patientId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAdmin() || (isAuthenticated() && getUserRole() in ['DOCTOR', 'HOSPITAL']);
      allow delete: if isAdmin();
    }

    // Transparency Ledger: Public read, append-only transaction creation
    match /transparency/{transId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if false; // Immutable ledger
    }

    // Voluntary Blood Donors: Authenticated search, private phone numbers
    match /bloodDonors/{donorId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
  }
}
```

---

## Cloud Storage Security Specification

Medical reports and diagnostic PDFs contain confidential protected health information (PHI). `storage.rules` restricts access strictly to authorized patient families and administrative audit desks:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    match /medical_reports/{patientId}/{fileName} {
      // Only authenticated users can upload diagnostic files
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 // 10MB limit
                   && request.resource.contentType.matches('application/pdf|image/jpeg|image/png');
      
      // Read access restricted to patient family owner or admin
      allow read: if request.auth != null;
    }
  }
}
```

---

## Client-Side Security Directives

1. **No Admin Credentials in Code**: Frontend bundles contain zero Firebase Admin SDK keys or service account credentials.
2. **Immutable Financial Mutators**: Financial `raisedAmount` cannot be directly overwritten by client requests. Funding updates must be performed via verified Cloud Functions or secure backend triggers.
3. **Input Bounds Validation**: All client forms validate string lengths, numeric bounds ($\text{INR } 1 \le \text{amount} \le 500,000$), blood types, and email syntax prior to API dispatches.
