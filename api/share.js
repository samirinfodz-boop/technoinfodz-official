// api/share.js — بطاقة مشاركة ديناميكية (Server-Side Open Graph)
// ═══════════════════════════════════════════════════════════════
// المشكلة التي يحلّها هذا الملف:
// روبوت فيسبوك/واتساب لا ينفّذ JavaScript إطلاقاً، لذا أي صفحة تعتمد
// على قراءة ?id= وتعديل وسوم <meta> عبر جافاسكريبت في المتصفح لن
// تعمل معه — سيرى فقط القيم الثابتة الأصلية في المصدر.
//
// الحل: دالة تعمل على خادم Vercel، تُنفَّذ *قبل* إرسال أي HTML للمتصفح،
// تجلب بيانات المنتج، وتبني وسوم og: الصحيحة مباشرة في الـ HTML الناتج.
// النتيجة: ملف واحد فقط يخدم كل المنتجات مهما كان عددها، بدون أي كتابة
// على مستودع GitHub، وبدون أي حدود لعدد الطلبات (كل طلب مستقل تماماً).

const SITE           = 'https://technoinfodz-official.vercel.app';
const PRODUCTS_URL   = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const DEFAULT_LOGO   = `${SITE}/assets/logo.jpg`;
const DEFAULT_TITLE  = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
const DEFAULT_DESC   = 'نوفر برامج تسيير ومعدات كاشير وأنظمة أمنية بالجزائر';

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const id = (req.query.id || '').toString().trim();
  const targetUrl = id
    ? `${SITE}/product.html?id=${encodeURIComponent(id)}`
    : `${SITE}/index.html`;

  let title = DEFAULT_TITLE;
  let desc  = DEFAULT_DESC;
  let img   = DEFAULT_LOGO;

  if (id) {
    try {
      const r = await fetch(`${PRODUCTS_URL}?v=${Date.now()}`);
      if (r.ok) {
        const data = await r.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        const p = products.find(pr => String(pr.id) === id);
        if (p) {
          title = `${p.name} — TECHNO INFODZ`;
          desc  = p.desc || p.price || 'TECHNO INFODZ';
          img   = p.img || DEFAULT_LOGO;
        }
      }
    } catch (e) {
      // في حال فشل الجلب (مثلاً بطء الشبكة)، تُستخدم القيم الافتراضية
      // بدل إظهار خطأ للزائر أو للروبوت
      console.error('share.js: failed to load products.json', e.message);
    }
  }

  const shareUrl = `${SITE}/api/share${id ? `?id=${encodeURIComponent(id)}` : ''}`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0;url=${targetUrl}">
<title>${escapeHtml(title)}</title>
<meta property="og:site_name" content="TECHNO INFODZ">
<meta property="og:type" content="product">
<meta property="og:locale" content="ar_DZ">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(img)}">
<meta property="og:url" content="${shareUrl}">
<meta name="twitter:card" content="summary_large_image">
<script>location.replace(${JSON.stringify(targetUrl)});<\/script>
</head>
<body>
<p style="font-family:sans-serif;text-align:center;padding:2rem;">جاري تحويلك... <a href="${targetUrl}">اضغط هنا إذا لم يتم التحويل تلقائياً</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // كاش خفيف على حافة Vercel (5 دقائق) لتخفيف الجلب المتكرر لـ products.json
  // دون التأثير على تحديث الصور بعد أي تعديل من لوحة التحكم
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}
