// api/share.js — بطاقة مشاركة ديناميكية (Server-Side Open Graph)

const SITE           = 'https://technoinfodz-official.vercel.app';
const PRODUCTS_URL   = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const DEFAULT_LOGO   = `${SITE}/assets/logo.jpg`;
const DEFAULT_TITLE  = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
const DEFAULT_DESC   = 'نوفر برامج تسيير ومعدات كاشير وأنظمة أمنية بالجزائر';

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// دالة تحويل أي مسار صورة إلى رابط مطلق صحيح
function getAbsoluteImageUrl(imgUrl) {
  if (!imgUrl) return DEFAULT_LOGO;
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
  return `${SITE}${cleanPath}`;
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
          img   = getAbsoluteImageUrl(p.img); // ضمان إرجاع رابط مطلق مفعل بـ https
        }
      }
    } catch (e) {
      console.error('share.js: failed to load products.json', e.message);
    }
  }

  const shareUrl = `${SITE}/api/share${id ? `?id=${encodeURIComponent(id)}` : ''}`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>

<!-- وسوم المعاينة المعتمدة (Open Graph) -->
<meta property="og:site_name" content="TECHNO INFODZ">
<meta property="og:type" content="product">
<meta property="og:locale" content="ar_DZ">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(img)}">
<meta property="og:image:secure_url" content="${escapeHtml(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${shareUrl}">

<!-- تويتر / x -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${escapeHtml(img)}">

<!-- تحويل المتصفح للزائر العادي دون إرباك روبوتات المعاينة -->
<script>
  window.location.replace(${JSON.stringify(targetUrl)});
</script>
</head>
<body>
<p style="font-family:sans-serif;text-align:center;padding:2rem;">جاري تحويلك إلى صفحة المنتج... <a href="${targetUrl}">اضغط هنا إذا لم يتم التحويل تلقائياً</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}
