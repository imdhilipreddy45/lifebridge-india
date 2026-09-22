/* ==========================================================================
   LIFEBRIDGE INDIA - FIREBASE CLOUD MESSAGING (FCM) SERVICE WORKER
   Handles background opt-in push notifications for emergency blood requests,
   campaign updates, and verification milestone alerts.
   ========================================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDemoKeyLifeBridgeIndia2026_Secured",
  authDomain: "lifebridge-india-rare-diseases.firebaseapp.com",
  projectId: "lifebridge-india-rare-diseases",
  storageBucket: "lifebridge-india-rare-diseases.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:a1b2c3d4e5f6g7h8i9j0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM Service Worker] Received background push notification payload:', payload);

  const notificationTitle = payload.notification ? payload.notification.title : 'LifeBridge India Emergency Alert';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'New pediatric emergency or verification update.',
    icon: '/assets/hero_illustration.png',
    badge: '/assets/hero_illustration.png',
    tag: 'lifebridge-emergency-alert',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
