# LifeBridge India — Android Packaging & Deployment Strategy Guide

**Target Release:** LifeBridge India V1.1.0 Android App Package  
**Product Source:** Deployed React 18 Vite Web Application ([https://lifebridge-india.web.app](https://lifebridge-india.web.app))  
**Selected Strategy:** **Capacitor Native Android Wrapper** (Non-Invasive Architecture)  
**Firebase Backend:** Shares 100% identical Firebase Auth, Firestore, and Storage infrastructure. Zero rewrite required.

---

## 🏗️ 1. Architecture Strategy (Zero App Rewrite)

```
                       LifeBridge India
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
                 Web App            Android App
          (Firebase Hosting)     (Capacitor APK)
                    │                   │
                    └─────────┬─────────┘
                              ↓
                      Firebase Backend
             (Auth, Cloud Firestore, Storage)
```

### Why Capacitor?
1. **Zero Code Changes**: Uses the existing React 18 + TypeScript production bundle compiled by Vite into `/dist`.
2. **Identical Firebase Backend**: Android client connects to the exact same `lifebridge-india` Firebase Auth instance and Firestore security rules.
3. **No Paid Services**: Free, open-source native container. Does not require Firebase Blaze plan or domain purchases.
4. **Minimal Permissions**: Only requests essential internet network access permissions.

---

## 🛠️ 2. Prerequisites & Local Setup

### System Requirements
* **Node.js**: v18.0.0 or higher
* **Android Studio**: Android Studio Jellyfish / Iguana (2024.1+) with Android SDK 34+ installed
* **Java Development Kit (JDK)**: JDK 17 (bundled with Android Studio)
* **Android Device / Emulator**: Android 8.0 (API level 26) or higher

---

## 📦 3. Step-by-Step Android Packaging Process

### Step 1: Install Capacitor CLI & Core Dependencies
In the root directory of `lifebridge-india`:

```bash
# Install Capacitor core and CLI dev dependencies
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor Configuration
Run the Capacitor initializer:

```bash
npx cap init "LifeBridge India" "org.lifebridge.app" --web-dir "dist"
```

This creates a clean [`capacitor.config.json`](../capacitor.config.json) in the workspace root:

```json
{
  "appId": "org.lifebridge.app",
  "appName": "LifeBridge India",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```

### Step 3: Compile Production Web Assets
Execute strict TypeScript verification and build the Vite distribution bundle:

```bash
# 1. Type check verification
npx tsc --noEmit

# 2. Build Vite web bundle
npm run build
```

### Step 4: Add Android Platform Target
Add the Android native folder:

```bash
npx cap add android
```

This generates the native `/android` directory containing the Android Studio Gradle project.

### Step 5: Sync Assets to Android Studio Project
Copy compiled web bundle into the Android container:

```bash
npx cap sync android
```

---

## 📱 4. Android Studio Setup & APK Compilation

### Step 1: Open Project in Android Studio
Launch Android Studio and open the native directory:

```bash
npx cap open android
```

Or manually open the `d:\New folder\android` directory in Android Studio.

### Step 2: Android Manifest & Permission Audit
Verify that `android/app/src/main/AndroidManifest.xml` only requests standard internet access:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="LifeBridge India"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density|smallestScreenSize"
            android:name=".MainActivity"
            android:label="LifeBridge India"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

> [!WARNING]
> **Android Safety & Credentials Rule**: Never place secret service account keys or private certificates inside `AndroidManifest.xml` or client assets. Public Firebase API keys contained in `firebase.ts` are designed for client identification and are secured server-side via Firestore & Storage Security Rules.

### Step 3: Build Debug APK
In Android Studio:
1. Select menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
2. Output path: `android/app/build/outputs/apk/debug/app-debug.apk`.

### Step 4: Build Release APK / Signed AAB
For production distribution:
1. Select menu: **Build → Generate Signed Bundle / APK**.
2. Select **Android App Bundle (AAB)** or **APK**.
3. Provide your release keystore certificate details.

---

## 🧪 5. Testing & Verification Matrix on Android Device/Emulator

| Test Protocol | Target Area | Verification Criteria |
| :--- | :--- | :--- |
| **App Launch & Render** | Splash & Home Screen | App launches cleanly without white screen flicker; responsive layout fills screen |
| **Firebase Connectivity** | Firestore Read/Write | Real-time campaign feeds load from Cloud Firestore over mobile network/Wi-Fi |
| **Authentication Flow** | Firebase Auth Modal | User registration & email/password login persist across app restarts |
| **Mobile Drawer Navigation**| Mobile Navigation | Mobile drawer toggles smoothly; all sub-routes (`/campaigns`, `/transparency`) render |
| **Form Inputs & Touch** | Modals & Forms | Input focus, keyboard opening, button touch targets (44px min) function cleanly |
| **Offline Handling** | Network Disconnect | Graceful fallback when network drops without crashing app |

---

## 🔒 6. Safety & Billing Policy Compliance
* **Google Play Publishing:** Manual publication only; do not publish automatically.
* **Firebase Billing:** Remains on 100% free **Firebase Spark Plan**.
* **Zero Paid Subscriptions:** Package uses free, open-source Capacitor tooling.
