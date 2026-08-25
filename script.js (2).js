// script.js — سكريبت التتبع الآلي للموقع الرئيسي TECHNO INFODZ

// 1. معرّف الـ Gist الخاص بك
const GIST_ID = 'f122407760e1f5905fabd84326180ebf';

// 2. جلب المفتاح من ذاكرة المتصفح المحلية
let GIST_TOKEN = localStorage.getItem('my_gist_token');

// في حال عدم توفر التوكن على البيئة المحلية
if (!GIST_TOKEN && (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
    GIST_TOKEN = prompt("يرجى إدخال GitHub Gist Token الخاص بك لتفعيل التتبع:");
    if (GIST_TOKEN) {
        localStorage.setItem('my_gist_token', GIST_TOKEN.trim());
    }
}

async function trackVisitor() {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (sessionStorage.getItem('visited_today')) return;
  if (!GIST_TOKEN) return;

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!res.ok) return;

    const gistData = await res.json();
    
    let stats = { visits: 0, today: 0, mobile: 0, desktop: 0, last_date: "" };
    if (gistData.files['stats.json'] && gistData.files['stats.json'].content) {
      stats = JSON.parse(gistData.files['stats.json'].content);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    if (stats.last_date !== todayStr) {
      stats.last_date = todayStr;
      stats.today = 1;
    } else {
      stats.today = (stats.today || 0) + 1;
    }

    stats.visits = (stats.visits || 0) + 1;

    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile) {
      stats.mobile = (stats.mobile || 0) + 1;
    } else {
      stats.desktop = (stats.desktop || 0) + 1;
    }

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

    sessionStorage.setItem('visited_today', 'true');

  } catch (err) {
    console.error('Tracking Error:', err);
  }
}

window.addEventListener('DOMContentLoaded', trackVisitor);