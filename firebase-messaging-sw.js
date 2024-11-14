importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyAhn_98Cfaai7Et5H3qJwtZnJZPhOAnsLw",
    authDomain: "bible-app-7c4d2.firebaseapp.com",
    projectId: "bible-app-7c4d2",
    storageBucket: "bible-app-7c4d2.appspot.com",
    messagingSenderId: "127229574852",
    appId: "1:127229574852:web:bf2732e3f2ee4c27ced391",
    measurementId: "G-C8WF86ZSYY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('تم تلقي إشعار في الخلفية:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './icon-512x512.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
