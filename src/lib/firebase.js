import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

let messaging = null

export async function getMessagingSafe() {
  if (messaging) return messaging
  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('Firebase Messaging no soportado en este navegador')
      return null
    }
    messaging = getMessaging(app)
    return messaging
  } catch (err) {
    console.warn('Error inicializando Messaging:', err)
    return null
  }
}

export { app }