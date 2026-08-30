// api/og-product.js — Vercel Serverless Function
// يستقبل Facebook/WhatsApp Crawler ويعيد OG tags ديناميكية

const PRODUCTS_URL = 'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/products.json';
const VERCEL_URL   = 'https://technoinfodz-official.vercel.app';
const SITE_URL     = 'https://samirinfodz-boop.github.io/technoinfodz-official';
const DEFAULT_IMG  = `${SITE_URL}/assets/logo.jpg`;

// تحويل raw.githubusercontent → github.io (مقبول من Facebook)
function toGhPages(imgUrl) {
  if (!imgUrl || imgUrl.startsWith('data:')) return DEFAULT_IMG;
  if (imgUrl.includes('raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/')) {
    return imgUrl.replace(
      'https://raw.githubusercontent.com/samirinfodz-boop/technoinfodz-official/main/',
      `${SITE_URL}/`
    );
  }
  return imgUrl || DEFAULT_IMG;
}

module.exports = async function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot/i.test(ua);
  const productId  = req.query.id;

  // زيارة عادية أو بدون id → أعد التوجيه للصفحة الأصلية
  if (!isCrawler || !productId) {
    res.setHeader('Location', `${VERCEL_URL}/product.html${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
    return res.status(302).end();
  }

  // Facebook/WhatsApp Crawler + id موجود → ابنِ OG tags
  let title    = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
  let desc     = 'نوفر برامج تسيير متطورة ومعدات كاشير متكاملة وأنظمة أمنية تناسب كافة الأنشطة بالجزائر';
  let img      = DEFAULT_IMG;
  let canonical = `${VERCEL_URL}/product.html?id=${productId}`;

  try {
    const response = await fetch(PRODUCTS_URL + '?t=' + Date.now());
    const data     = await response.json();
    const products = data.products || [];
    const product  = products.find(p => String(p.id) === String(productId));

    if (product) {
      title = `${product.name} — TECHNO INFODZ`;
      desc  = product.desc
        ? product.desc.slice(0, 200)
        : `${product.cat || ''} | ${product.price || 'تواصل معنا'}`;
      img   = toGhPages(product.img);
    }
  } catch(e) {
    // نستمر بالقيم الافتراضية
  }

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

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).send(html);
};
