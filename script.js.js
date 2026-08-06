// script.js — سكريبت التتبع الآلي للموقع الرئيسي
// 1. المتصفح يبحث عن المفتاح في ذاكرته الداخلية
let GIST_TOKEN = localStorage.getItem('my_gist_token');

// 2. إذا لم يجد المفتاح (في أول مرة تفتح فيها الصفحة فقط)، سيظهر لك نافذة صغيرة لتنفيذه
if (!GIST_TOKEN) {
    GIST_TOKEN = prompt("أدخل رمز GitHub Token الخاص بك:");
    if (GIST_TOKEN) {
        // حفظ المفتاح في ذاكرة المتصفح للزيارات القادمة
        localStorage.setItem('my_gist_token', GIST_TOKEN.trim());
    }
}

// 3. كود طلب الـ API الخاص بـ Gist كما هو
async function sendTrackingData() {
    if (!GIST_TOKEN) return;

    try {
        const response = await fetch('https://api.github.com/gists/YOUR_GIST_ID', {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GIST_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    "visits.json": { content: JSON.stringify({ views: 1 }) }
                }
            })
        });
        
        if (response.ok) {
            console.log("تم التتبع بنجاح");
        }
    } catch (error) {
        console.error("خطأ:", error);
    }
}

async function trackVisitor() {
  // منع تسجيل الزيارات أثناء تجاربك على السيرفر المحلي (Localhost)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  // تجنب تكرار احتساب الزائر أثناء التنقل بين الصفحات في نفس الجلسة
  if (sessionStorage.getItem('visited_today')) return;

  try {
    // 1. جلب البيانات الحالية من ملف stats.json
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `token ${GIST_TOKEN}` }
    });
    if (!res.ok) return;

    const gistData = await res.json();
    let stats = JSON.parse(gistData.files['stats.json'].content);

    // 2. تحديث عداد اليوم والسنة
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (stats.last_date !== todayStr) {
      stats.last_date = todayStr;
      stats.today = 1; // إعادة ضبط عداد اليوم
    } else {
      stats.today = (stats.today || 0) + 1;
    }

    stats.visits = (stats.visits || 0) + 1; // الإجمالي العام

    // 3. تحديد نوع جهاز الزائر (هاتف أم حاسوب)
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile) {
      stats.mobile = (stats.mobile || 0) + 1;
    } else {
      stats.desktop = (stats.desktop || 0) + 1;
    }

    // 4. حفظ التحديثات وإرسالها إلى GitHub Gist
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'stats.json': { content: JSON.stringify(stats, null, 2) }
        }
      })
    });

    // تعليم الزائر كـ "تم تسجيله" لهذه الجلسة
    sessionStorage.setItem('visited_today', 'true');

  } catch (err) {
    console.error('Tracking Error:', err);
  }
}

// تشغيل التتبع فور تحميل الصفحة
window.addEventListener('DOMContentLoaded', trackVisitor);
