# LinkedIn Engineering Story — LifeBridge India

*Copy and paste the text below for your LinkedIn post.*

---

I designed and developed **LifeBridge India**, a medical-support and rare-disease care platform built for high-impact pediatric treatment coordination (including Spinal Muscular Atrophy, Duchenne Muscular Dystrophy, and Thalassemia Major).

The interesting part of this project wasn't building another CRUD application.

When families face catastrophic rare-disease treatment costs, existing platforms often introduce high commission fees, opaque accounting, and privacy risks. I wanted to see if I could design an application architecture that solves this using a **0% platform commission model**, a **5-stage human verification workflow**, **auditable financial transparency records**, and **strict role-based security**.

Here is how I designed and engineered it:

---

### 🏗️ 1. Architecture & Tech Stack
* **Frontend:** React 18, TypeScript (strict mode), Vite 5.3, and tokenized custom CSS.
* **Backend:** Firebase Web SDK v10 (Cloud Firestore, Firebase Auth, Cloud Storage).
* **Hosting:** Firebase Hosting CDN edge nodes with Single-Page Application (SPA) rewrite rules.

---

### 👥 2. Seven-Role Access Control (RBAC)
Instead of a simple user/admin binary, the platform isolates capabilities across **7 distinct roles**:
`DONOR`, `PATIENT_FAMILY`, `VOLUNTEER`, `DOCTOR`, `HOSPITAL`, `CSR`, and `ADMIN`.

Privileged role elevation (such as claiming a Doctor or Hospital billing desk account) is strictly blocked client-side and enforced backend-side via declarative Cloud Firestore Security Rules:
`request.resource.data.role == resource.data.role`

---

### 🛡️ 3. Five-Stage Hope Verification Workflow
To prevent fraudulent campaigns, I designed a multi-checkpoint verification pipeline:
1. Identity Proof Check (Guardian Aadhaar/ID)
2. Diagnostic Medical Report Verification (Genetic testing/EMG)
3. Attending Doctor Desk Confirmation
4. Hospital Billing Desk Account Validation
5. Itemized Treatment Estimate Audit

Campaigns only become publicly viewable once they transition to `VERIFIED` status through authorized verification workflows.

---

### 🔒 4. Medical Document Privacy & Security Rules
Patient diagnostic reports and hospital estimate certificates contain sensitive medical PII. I implemented Cloud Storage security rules restricting files to `/medical_reports/{patientId}/*`. Users can only upload files to their own isolated path (`request.auth.uid == patientId`), with strict 10 MB file size caps and MIME-type restrictions enforced at the storage layer.

---

### 🧪 5. Testing & Live Verification
Before freezing V1.1.0, I ran a strict 19-point live production smoke test on the deployed site:
* **TypeScript Compilation:** `npx tsc --noEmit` — 0 errors (Exit code 0)
* **Production Build:** Vite production bundle generated cleanly
* **Live Smoke Test:** 19/19 checks passed on [https://lifebridge-india.web.app](https://lifebridge-india.web.app)
* **Console Cleanliness:** 0 unhandled runtime errors, 0 CORS failures

---

### 💡 Lessons Learned
1. **Security belongs in declarative backend rules**, not client-side IF statements.
2. **Multi-role state management** requires clean session initialization (`onAuthStateChanged` bound to Firestore profiles).
3. **Designing for extreme transparency** forces cleaner data architecture.

The project is live on Firebase Hosting: [https://lifebridge-india.web.app](https://lifebridge-india.web.app)

I'd love critical feedback from software engineers, security professionals, product leaders, and healthcare technology experts on the architecture, security rules, and verification workflow!

#SoftwareEngineering #ReactJS #TypeScript #Firebase #WebDevelopment #SystemDesign #HealthcareTech #Security #OpenSource #BuildInPublic
