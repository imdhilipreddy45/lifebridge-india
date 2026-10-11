# LifeBridge India — Repository Architecture Audit (Phase 3)

**Version:** V1.1.1  
**Date:** October 2026  
**Status:** Architecture Inspection & Cleanup Recommendation  

---

## 1. Executive Summary

This audit evaluates legacy root-level JavaScript files, CSS files, and configuration scripts to distinguish active codebase components from legacy static prototype artifacts.

---

## 2. File-by-File Audit Analysis

| File Path | Original Purpose | Current Status | Usage / Dependency Analysis | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `app.js` | Legacy static HTML/JS prototype application script (542 lines) | 🔴 **Legacy Prototype Artifact** | Not imported by `src/main.tsx`, `index.html`, or Vite build bundle. Contains standalone DOM manipulation functions. | **Safe to remove** (pending explicit user approval). |
| `firebase-config.js` | Legacy static HTML prototype config object (66 lines) | 🔴 **Legacy Prototype Artifact** | Not imported by TypeScript source. Real config is maintained in `src/services/firebase.ts`. | **Safe to remove** (pending explicit user approval). |
| `firebase-services.js` | Legacy static HTML prototype Firebase services script (606 lines) | 🔴 **Legacy Prototype Artifact** | Not imported by React application. Contains mock objects (`LifeBridgeAuth`, `LifeBridgeDB`). Real API is in `src/services/api.ts`. | **Safe to remove** (pending explicit user approval). |
| `styles.css` | Legacy static HTML stylesheet (547 lines) | 🔴 **Legacy Prototype Artifact** | Not imported by React build. Real design tokens and styles are in `src/styles/tokens.css` and `src/styles/global.css`. | **Safe to remove** (pending explicit user approval). |
| `firebase-messaging-sw.js` | Firebase Cloud Messaging (FCM) Service Worker script (34 lines) | 🟢 **Required Infrastructure** | Placed in project root/public for browser FCM background push notification handling. Required by PWA/Firebase SDK. | **MUST KEEP**. |
| `firestore.rules` | Security rules for Cloud Firestore database | 🟢 **Active Core Security** | Defines server-side security policies for Firestore collections. | **MUST KEEP**. |
| `storage.rules` | Security rules for Cloud Storage bucket | 🟢 **Active Core Security** | Defines server-side path security policies for medical documents. | **MUST KEEP**. |

---

## 3. Recommended Actions

1. Preserve `firebase-messaging-sw.js`, `firestore.rules`, and `storage.rules`.
2. Keep legacy files (`app.js`, `firebase-config.js`, `firebase-services.js`, `styles.css`) intact for current Phase 3 audit compliance, but mark for cleanup in next refactoring release upon approval.
