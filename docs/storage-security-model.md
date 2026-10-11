# LifeBridge India — Storage Security Model (Phase 3)

**Version:** V1.1.1  
**Date:** October 2026  
**Status:** Approved Security Specification  

---

## 1. Storage Access Matrix & Path Security

LifeBridge Firebase Cloud Storage bucket (`lifebridge-india.firebasestorage.app`) enforces strict role-based access path controls to prevent unauthorized access to medical records, genetic sequencing files, government identity proofs, and hospital proforma invoices.

| Storage Path Bucket Location | Sensitivity Level | Read Authorization Rules | Write / Upload Authorization Rules |
| :--- | :--- | :--- | :--- |
| `medical_reports/{patientId}/*` | `PATIENT_PRIVATE` | `PATIENT_FAMILY`, `DOCTOR`, `HOSPITAL`, `ADMIN` | `PATIENT_FAMILY`, `DOCTOR`, `HOSPITAL`, `ADMIN` |
| `genetic_reports/{patientId}/*` | `PATIENT_PRIVATE` | `PATIENT_FAMILY`, `DOCTOR`, `HOSPITAL`, `ADMIN` | `PATIENT_FAMILY`, `DOCTOR`, `HOSPITAL`, `ADMIN` |
| `identity_documents/{userId}/*` | `PATIENT_PRIVATE` | Owner (`request.auth.uid == userId`) OR `ADMIN` | Owner (`request.auth.uid == userId`) OR `ADMIN` |
| `hospital_estimates/{patientId}/*` | `ROLE_RESTRICTED` | `PATIENT_FAMILY`, `HOSPITAL`, `ADMIN` | `HOSPITAL`, `ADMIN` |
| `public_assets/*` | `PUBLIC` | Public (`true`) | Authenticated Users (`request.auth != null`) |
| `/*` (Unspecified default) | `DENY_ALL` | Prohibited (`false`) | Prohibited (`false`) |

---

## 2. Mandatory Validation & Safeguards

### A. MIME Type Enforcement
Client file uploads must adhere to restricted MIME types:
- **Medical & Genetic Reports:** `application/pdf`, `image/jpeg`, `image/png`.
- **Identity Documents:** `application/pdf`, `image/jpeg`, `image/png`.
- **Hospital Estimates:** `application/pdf`.

### B. Size Limits
- Maximum single file upload limit: **10 MB**.
- Attempted uploads exceeding 10 MB are rejected at the storage rule boundary.

### C. Path Ownership & Traversal Prevention
- Storage path prefixes use explicit `{patientId}` or `{userId}` parameters.
- Path traversal sequences (`../`, `./`) are sanitized both on client file preparation and enforced via strict pattern matching in `storage.rules`.

### D. Public URL Isolation
- Public download URLs (`getDownloadURL`) are generated only for `public_assets/*`.
- Access to `/medical_reports/` and `/identity_documents/` requires short-lived, authenticated tokens attached to valid user sessions.
