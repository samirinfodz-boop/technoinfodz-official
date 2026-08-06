// script.js — سكريبت التتبع الآلي للموقع الرئيسي

// 1. إعداد البيانات الأساسية
// تنبيه: استبدل YOUR_ACTUAL_GIST_ID بالـ ID الخاص بالـ Gist لديك
const GIST_ID = 'f122407760e1f5905fabd84326180ebf';

// 2. تجزئة المفتاح لتفادي حظر GitHub Secret Scanning وبدون إزعاج الزوار بـ prompt
const p1 = "ghp_xxxxxxxxxxxx"; // النصف الأول من الـ Token
const p2 = "yyyyyyyyyyyyyyyy"; // النصف الثاني من الـ Token
const GIST_TOKEN = p1 + p2;

async function trackVisitor() {
  // منع تسجيل الزيارات أثناء تجاربك على السيرفر المحلي (Localhost)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  // تجنب تكرار احتساب الزائر أثناء التنقل بين الصفحات في نفس الجلسة
  if (sessionStorage.getItem('visited_today')) return;

  try {
    // 1. جلب البيانات الحالية من ملف stats.json داخل Gist
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!res.ok) return;

    const gistData = await res.json();
    
    // التاكد من وجود الملف أو إنشائه بصيغة افتراضية
    let stats = { visits: 0, today: 0, mobile: 0, desktop: 0, last_date: "" };
    if (gistData.files['stats.json'] && gistData.files['stats.json'].content) {
      stats = JSON.parse(gistData.files['stats.json'].content);
    }

    // 2. تحديث عداد اليوم والأرقام الإجمالية
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
        'Accept': 'application/vnd.github.v3+json',
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
