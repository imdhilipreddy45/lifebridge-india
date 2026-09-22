# LifeBridge India — Deployment & Infrastructure Pipeline

## Deployment Overview

LifeBridge India uses Firebase Hosting for automated Single Page Application (SPA) distribution with global CDN edge caching, SSL termination, and rewrites to `index.html`. Cloud Functions are deployed to `asia-south1` (Mumbai region) for low-latency operations across India.

---

## Prerequisites & CLI Setup

Ensure node.js v18+ and Firebase CLI are installed:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to authorized Firebase account
firebase login

# Verify active project association
firebase use lifebridge-india
```

---

## Build & Deployment Sequence

### 1. Type Safety & Bundle Verification
Before deploying to production, execute strict TypeScript compilation and Vite build checks:

```bash
# 1. Execute strict TypeScript check (0 errors required)
npx tsc --noEmit

# 2. Execute Vite production build
npm run build
```

Production assets are compiled into the `/dist` directory.

### 2. Security Rules & Indexes Deployment

Deploy Firestore security rules, indexes, and Storage rules:

```bash
# Deploy Firestore rules & compound indexes
firebase deploy --only firestore

# Deploy Storage privacy rules
firebase deploy --only storage
```

### 3. Cloud Functions Deployment

Deploy backend serverless functions:

```bash
# Deploy Cloud Functions to asia-south1
firebase deploy --only functions
```

### 4. Hosting Deployment

Deploy frontend distribution bundle:

```bash
# Deploy static distribution to Firebase Hosting
firebase deploy --only hosting
```

---

## CI/CD GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Production Deployment Pipeline

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js 18
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: TypeScript Compilation Check
        run: npx tsc --noEmit

      - name: Build Web Bundle
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_LIFEBRIDGE_INDIA }}'
          channelId: live
          projectId: lifebridge-india
```

---

## Environment Variables Strategy

All public Firebase client keys are stored in `src/services/firebase.ts`. No secret backend API keys or Firebase Admin credentials are ever stored in client code or repository commits.
