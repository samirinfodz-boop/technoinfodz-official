// Netlify Edge Function — OG Tags ديناميكية لصفحة المنتج
// المسار: netlify/edge-functions/og-product.js

const PRODUCTS_URL  = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const SITE_URL      = 'https://fantastic-dasik-bbe34e.netlify.app';
const GITHUB_PAGES  = 'https://samirinfodz-boop.github.io/technoinfodz-official';
const DEFAULT_IMG   = `${GITHUB_PAGES}/assets/logo.jpg`;

// تحويل رابط raw.githubusercontent إلى github.io (يقبله Facebook)
function toGithubPages(imgUrl) {
  if (!imgUrl) return DEFAULT_IMG;
  if (imgUrl.startsWith('data:')) return DEFAULT_IMG;
  // تحويل raw.githubusercontent.com → github.io
  if (imgUrl.includes('raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/')) {
    return imgUrl.replace(
      'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/',
      `${GITHUB_PAGES}/`
    );
  }
  return imgUrl;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const ua  = request.headers.get('user-agent') || '';

  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|ia_archiver/i.test(ua);

  if (!isCrawler) return context.next();

  const productId = url.searchParams.get('id');
  if (!productId) return context.next();

  let title    = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
  let desc     = 'نوفر برامج تسيير متطورة ومعدات كاشير متكاملة وأنظمة أمنية تناسب كافة الأنشطة';
  let img      = DEFAULT_IMG;
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
      img   = toGithubPages(product.img);
    }
  } catch(e) {}

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:title"        content="${title}"/>
  <meta property="og:description"  content="${desc}"/>
  <meta property="og:image"        content="${img}"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url"          content="${canonical}"/>
  <meta property="og:type"         content="product"/>
  <meta property="og:site_name"    content="TECHNO INFODZ"/>
  <meta property="og:locale"       content="ar_DZ"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${desc}"/>
  <meta name="twitter:image"       content="${img}"/>
  <meta http-equiv="refresh"       content="0;url=${canonical}"/>
  <link rel="canonical"            href="${canonical}"/>
</head>
<body><p>جاري التوجيه...</p></body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
