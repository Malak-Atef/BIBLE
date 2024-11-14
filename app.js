// استيراد مكتبات Firebase الضرورية
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// إعداد Firebase باستخدام الإعدادات التي قدمتها
const firebaseConfig = {
    apiKey: "AIzaSyAhn_98Cfaai7Et5H3qJwtZnJZPhOAnsLw",
    authDomain: "bible-app-7c4d2.firebaseapp.com",
    projectId: "bible-app-7c4d2",
    storageBucket: "bible-app-7c4d2.appspot.com",
    messagingSenderId: "127229574852",
    appId: "1:127229574852:web:bf2732e3f2ee4c27ced391",
    measurementId: "G-C8WF86ZSYY"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// الحصول على إذن المستخدم للإشعارات بعد تسجيل الدخول
async function requestAndSaveToken(userId) {
    try {
        // اطلب إذن المستخدم للإشعارات
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: "BLhZGEBgFbz-BwYLlEfFq7SlHsE30d5rhK0-wL7dK86h2Zl5nPPwkdAHL0bLiU_LzZW9hVEjl5XVvdfWieJ_kL0" });
            if (currentToken) {
                console.log('تم الحصول على رمز التسجيل:', currentToken);

                // التحقق من وجود الـ token في Firestore قبل تخزينه
                const tokenRef = doc(db, "tokens", userId);
                const docSnapshot = await getDoc(tokenRef);

                if (!docSnapshot.exists()) {
                    await setDoc(tokenRef, { token: currentToken });
                    console.log("تم حفظ رمز التسجيل بنجاح في قاعدة البيانات");
                } else {
                    console.log("الرمز موجود بالفعل في قاعدة البيانات.");
                }
            } else {
                console.warn('لم يتم توفير رمز التسجيل. تأكد من قبول المستخدم لتلقي الإشعارات.');
            }
        } else {
            alert('من فضلك قم بتمكين الإشعارات لتلقي التحديثات.');
        }
    } catch (err) {
        console.error('خطأ في جلب رمز التسجيل:', err);
    }
}

// التعامل مع الإشعارات الواردة عندما يكون الموقع مفتوحًا
onMessage(messaging, (payload) => {
    console.log('تم تلقي إشعار:', payload);
    alert(`إشعار جديد: ${payload.notification.title} - ${payload.notification.body}`);
});

// تسجيل firebase-messaging-sw.js فقط
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
        .then((registration) => {
            console.log('تم تسجيل firebase-messaging-sw.js بنجاح:', registration.scope);
        })
        .catch((error) => {
            console.error('فشل تسجيل firebase-messaging-sw.js:', error);
        });
}



// مراقبة حالة المصادقة
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('المستخدم مسجّل الدخول:', user.uid);
        requestAndSaveToken(user.uid);
    } else {
        console.log('المستخدم غير مسجّل الدخول');
    }
});



// تحميل الأسماء من Firestore إلى القائمة المنسدلة (صفحة تسجيل الدخول)
async function loadUsernames() {
    const userSelect = document.getElementById("userSelect");
    const querySnapshot = await getDocs(collection(db, "users"));

    querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.data().email; // استخدام البريد الإلكتروني لتسجيل الدخول
        option.textContent = doc.data().username;
        userSelect.appendChild(option);
    });
}

// إظهار حقل كلمة المرور بعد اختيار اسم المستخدم (صفحة تسجيل الدخول)
document.getElementById("userSelect").addEventListener("change", function() {
    document.getElementById("passwordDiv").style.display = "block";
});

// وظيفة لإظهار الرسالة الاحترافية (صفحة تسجيل الدخول)
function showToastMessage(message) {
    const toastBody = document.querySelector('#toastMessage .toast-body');
    toastBody.textContent = message;
    $('.toast').toast('show');
}

// معالجة عملية تسجيل الدخول (صفحة تسجيل الدخول)
document.getElementById("loginBtn").addEventListener("click", async function() {
    const email = document.getElementById("userSelect").value;
    const password = document.getElementById("passwordInput").value;

    if (email && password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            // طلب إذن الإشعارات وحفظ `Token` للمستخدم
            await requestAndSaveToken(userId);

            // بعد نجاح تسجيل الدخول، الانتقال إلى صفحة الإصحاح
            window.location.href = "challenges.html";
        } catch (error) {
            showToastMessage("فشل تسجيل الدخول: تحقق من الاسم وكلمة المرور.");
        }
    } else {
        showToastMessage("يرجى اختيار الاسم وإدخال كلمة المرور.");
    }
});

// استدعاء دالة تحميل الأسماء عند تحميل صفحة تسجيل الدخول
window.onload = loadUsernames;


