// Netlify Edge Function — OG Tags ديناميكية لصفحة المنتج
// المسار: netlify/edge-functions/og-product.js

const PRODUCTS_URL = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const SITE_URL     = 'https://fantastic-dasik-bbe34e.netlify.app';
const DEFAULT_IMG  = 'https://samirinfodz-boop.github.io/technoinfodz-official/assets/logo.jpg';

export default async function handler(request, context) {
  const url = new URL(request.url);
  const ua  = request.headers.get('user-agent') || '';

  // هل الزائر Facebook Crawler أو Crawler آخر؟
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|ia_archiver/i.test(ua);

  // زيارة عادية → أكمل بشكل طبيعي
  if (!isCrawler) {
    return context.next();
  }

  // Facebook Crawler → ابنِ OG tags
  const productId = url.searchParams.get('id');

  if (!productId) {
    return context.next();
  }

  let title = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
  let desc  = 'نوفر برامج تسيير متطورة ومعدات كاشير متكاملة وأنظمة أمنية تناسب كافة الأنشطة';
  let img   = DEFAULT_IMG;
  let canonical = `${SITE_URL}/product.html?id=${productId}`;

  try {
    const res      = await fetch(PRODUCTS_URL + '?t=' + Date.now());
    const data     = await res.json();
    const products = data.products || [];
    const product  = products.find(p => String(p.id) === String(productId));

    if (product) {
      title = `${product.name} — TECHNO INFODZ`;
      desc  = product.desc
        ? product.desc.slice(0, 200)
        : `${product.cat || ''} | ${product.price || 'تواصل معنا'}`;
      img   = product.img && product.img.startsWith('http')
        ? product.img
        : DEFAULT_IMG;
    }
  } catch (e) {
    // في حالة الخطأ نستمر بالقيم الافتراضية
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image"       content="${img}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height"content="630"/>
  <meta property="og:url"         content="${canonical}"/>
  <meta property="og:type"        content="product"/>
  <meta property="og:site_name"   content="TECHNO INFODZ"/>
  <meta property="og:locale"      content="ar_DZ"/>

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image"       content="${img}"/>

  <!-- إعادة توجيه فورية للمستخدم -->
  <meta http-equiv="refresh" content="0;url=${canonical}"/>
  <link rel="canonical" href="${canonical}"/>
</head>
<body>
  <p>جاري التوجيه...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
