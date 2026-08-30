// api/og-product.js — Vercel Serverless Function
// توليد وسوم Open Graph ديناميكياً لمعاينات الفيس بوك وواتساب

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  // الإعدادات المباشرة للموقع
  const GITHUB_PAGES_URL = 'https://samirinfodz-boop.github.io/technoinfodz-official';
  const PRODUCTS_JSON_URL = `${GITHUB_PAGES_URL}/products.json`;
  const DEFAULT_IMAGE = `${GITHUB_PAGES_URL}/assets/logo.jpg`;

  const targetUrl = id 
    ? `${GITHUB_PAGES_URL}/product.html?id=${encodeURIComponent(id)}`
    : `${GITHUB_PAGES_URL}/index.html`;

  let title = "TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر";
  let description = "نوفر برامج تسيير ومعدات كاشير وأنظمة أمنية بالجزائر";
  let image = DEFAULT_IMAGE;

  if (id) {
    try {
      const response = await fetch(PRODUCTS_JSON_URL, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        const product = products.find(p => String(p.id) === String(id));

        if (product) {
          title = `${product.name} — TECHNO INFODZ`;
          if (product.price) {
            title += ` (${product.price})`;
          }
          description = product.desc && product.desc.trim() 
            ? product.desc.slice(0, 200) 
            : `اكتشف تفاصيل ومواصفات ${product.name} من TECHNO INFODZ.`;
          
          if (product.img && product.img.startsWith('http')) {
            image = product.img;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  // إرجاع صفحة HTML مع وسوم Open Graph ورابط التحويل المباشر
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  
  <!-- وسوم Open Graph الخاصة بفيسبوك وواتساب -->
  <meta property="og:site_name" content="TECHNO INFODZ" />
  <meta property="og:type" content="product" />
  <meta property="og:locale" content="ar_DZ" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(targetUrl)}" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  
  <!-- تحويل الزائر الحقيقي مباشرة للمنتج -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(targetUrl)}">
  <script>window.location.href = "${escapeHtml(targetUrl)}";</script>
</head>
<body>
  <p>جاري إعادة التوجيه إلى المنتج... <a href="${escapeHtml(targetUrl)}">اضغط هنا إذا لم يتم التحويل تلقائياً</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
