// Netlify Edge Function — OG Tags لصفحة الأقسام
// المسار: netlify/edge-functions/og-index.js

const PRODUCTS_URL = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const SITE_URL     = 'https://fantastic-dasik-bbe34e.netlify.app';
const DEFAULT_IMG  = 'https://samirinfodz-boop.github.io/technoinfodz-official/assets/logo.jpg';

export default async function handler(request, context) {
  const url = new URL(request.url);
  const ua  = request.headers.get('user-agent') || '';

  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot/i.test(ua);

  if (!isCrawler) return context.next();

  const catParam = url.searchParams.get('cat');
  if (!catParam || catParam === 'all') return context.next();

  let title = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
  let desc  = 'نوفر برامج تسيير متطورة ومعدات كاشير متكاملة وأنظمة أمنية';
  let img   = DEFAULT_IMG;
  const canonical = `${SITE_URL}/?cat=${catParam}#products`;

  try {
    const res      = await fetch(PRODUCTS_URL + '?t=' + Date.now());
    const data     = await res.json();
    const products = data.products || [];

    const catProducts = products.filter(p =>
      p.cat && (p.cat.toLowerCase().includes(catParam.toLowerCase()) ||
      (p.urlKey && p.urlKey === catParam))
    );

    if (catProducts.length > 0) {
      const catName = catProducts[0].cat;
      title = `${catName} — TECHNO INFODZ`;
      desc  = `تصفح ${catProducts.length} منتجاً في قسم ${catName} من TECHNO INFODZ بالجزائر`;
      img   = catProducts.find(p => p.img && p.img.startsWith('http'))?.img || DEFAULT_IMG;
    }
  } catch(e) {}

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  <meta property="og:image"       content="${img}"/>
  <meta property="og:url"         content="${canonical}"/>
  <meta property="og:type"        content="website"/>
  <meta property="og:site_name"   content="TECHNO INFODZ"/>
  <meta property="og:locale"      content="ar_DZ"/>
  <meta name="twitter:card"       content="summary_large_image"/>
  <meta name="twitter:image"      content="${img}"/>
  <meta http-equiv="refresh"      content="0;url=${canonical}"/>
</head>
<body><p>جاري التوجيه...</p></body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=300' }
  });
}
