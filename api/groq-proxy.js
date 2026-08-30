// api/og-product.js — Vercel Serverless Function

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
  // 1. تصحيح المسار ليكون داخل مجلد data
  const PRODUCTS_JSON_URL = `${GITHUB_PAGES_URL}/data/products.json`;
  const DEFAULT_IMAGE = `${GITHUB_PAGES_URL}/assets/images/logo.png`;

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
          // 2. تصحيح ألقاب الحقول إلى title و description
          const prodTitle = product.title || product.name || '';
          const prodDesc = product.description || product.desc || '';
          
          title = `${prodTitle} — TECHNO INFODZ`;
          if (product.price) {
            title += ` (${product.price})`;
          }
          
          description = prodDesc && prodDesc.trim() 
            ? prodDesc.slice(0, 200) 
            : `اكتشف تفاصيل ومواصفات ${prodTitle} من TECHNO INFODZ.`;
          
          // 3. تصحيح جلب مسار الصورة وتنسيق الروابط النسبية
          let rawImg = product.image || product.img || '';
          if (rawImg) {
            if (rawImg.startsWith('http')) {
              image = rawImg;
            } else {
              // تحويل المسار النسبي مثل ./assets/img.jpg إلى رابط مطلق
              const cleanPath = rawImg.replace(/^\.\//, '').replace(/^\//, '');
              image = `${GITHUB_PAGES_URL}/${cleanPath}`;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  // إرجاع صفحة HTML مع وسوم Open Graph المحدثة
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  
  <!-- وسوم Open Graph الخاصّة بـ Facebook / Messenger / WhatsApp -->
  <meta property="og:site_name" content="TECHNO INFODZ" />
  <meta property="og:type" content="product" />
  <meta property="og:locale" content="ar_DZ" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(targetUrl)}" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  
  <!-- إعادة توجيه الزائر الحقيقي -->
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
