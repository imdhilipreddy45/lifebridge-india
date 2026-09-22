# LifeBridge India — Testing Strategy & Verification Protocols

## Testing Strategy Overview

LifeBridge India maintains strict quality assurance standards across type correctness, component rendering, security rule validation, and multi-stakeholder role isolation.

---

## 1. Static Analysis & Type Verification

Strict TypeScript typing (`strict: true` in `tsconfig.json`) prevents runtime type errors:

```bash
# Execute strict TypeScript type verification (Exit code 0 required)
npx tsc --noEmit
```

Checks verified:
- Interface conformance for `PatientCampaign`, `BloodDonor`, `UserProfile`, `TransparencyRecord`
- Non-null assertion safety on Firebase snapshot data
- Enum boundary verification (`UserRole`, `ApplicationStatus`)

---

## 2. Production Build Verification

```bash
# Execute production Vite build
npm run build
```

Bundle verification checks:
- HTML/CSS minification & gzip optimization
- Single-page application route fallback rewrites
- Module tree transformation (1,500+ modules transformed cleanly)

---

## 3. End-to-End Authentication & Security Test Matrix

| Test Scenario | Procedure | Expected Result | Pass Criteria |
|---|---|---|---|
| **Account Creation** | Register new email with `PATIENT_FAMILY` role | Account created in Auth, document written to `users/{uid}` in Firestore | `uid` matches, `role === 'PATIENT_FAMILY'` |
| **Privileged Role Guard** | Attempt registration selecting `ADMIN` or `DOCTOR` | Client blocks attempt with explicit error | Error message displayed: "Privileged roles cannot be self-created" |
| **Session Persistence** | Refresh browser while logged in | `onAuthStateChanged` restores session state automatically | Active dashboard workspace rendered |
| **Logout Behavior** | Click Sign Out button | Auth session destroyed, user returned to home page | Public navbar controls displayed |
| **Invalid Credentials** | Enter incorrect password | Auth returns `auth/invalid-credential` | Clean error displayed: "Invalid email or password" |
| **Password Reset** | Enter email in Reset Password modal | Reset email dispatched via Firebase Auth | Confirmation message displayed without exposing account existence |
| **Empty Database Display** | Query empty Firestore collections | Professional empty states rendered across all views | No hardcoded fake statistics or mock campaigns shown |

---

## 4. Manual UI & Responsive Checklist

- [x] High-contrast button styling (`.btn-primary` blue + white text, `.btn-emergency` red + white text, `.btn-outline` white + dark text)
- [x] Lucide SVG icon color inheritance inside buttons
- [x] Responsive layout validation at 360px (mobile), 768px (tablet), and 1280px (desktop) viewports
- [x] Modal drawer keyboard accessibility & overlay dismissal
