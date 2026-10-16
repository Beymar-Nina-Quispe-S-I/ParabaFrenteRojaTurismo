/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCAhTlvnEVGVGYF9kyCr311OX8Z5MufNdQ',
  authDomain: 'feria-paraba.firebaseapp.com',
  projectId: 'feria-paraba',
  storageBucket: 'feria-paraba.firebasestorage.app',
  messagingSenderId: '1050603022296',
  appId: '1:1050603022296:web:12e0cd40ac12cb2024b4ad',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'Ecosvuelos', {
    body: body || '',
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  })
})