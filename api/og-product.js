// api/og-product.js — Vercel Serverless Function v2
// يستخدم GitHub API بدلاً من raw.githubusercontent

const GITHUB_OWNER  = 'samirinfodz-boop';
const GITHUB_REPO   = 'technoinfodz-official';
const VERCEL_URL    = 'https://technoinfodz-official.vercel.app';
const SITE_URL      = 'https://samirinfodz-boop.github.io/technoinfodz-official';
const DEFAULT_IMG   = `${SITE_URL}/assets/logo.jpg`;

// تحويل raw.githubusercontent → github.io
function toGhPages(imgUrl) {
  if (!imgUrl || imgUrl.startsWith('data:')) return DEFAULT_IMG;
  if (imgUrl.includes('raw.githubusercontent.com')) {
    return imgUrl.replace(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/`,
      `${SITE_URL}/`
    );
  }
  return imgUrl;
}

// جلب المنتجات عبر GitHub API (يتجاوز CSP)
async function fetchProducts() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/products.json`;
  const res  = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'TechnoInfodz-OG-Bot/1.0'
    }
  });
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  return res.json();
}

module.exports = async function handler(req, res) {
  const ua        = req.headers['user-agent'] || '';
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot/i.test(ua);
  const productId  = req.query.id;

  // إضافة CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  // زيارة عادية بدون id أو بدون crawler → توجيه للصفحة
  if (!productId) {
    return res.redirect(302, `${VERCEL_URL}/product.html`);
  }

  // إذا مستخدم عادي (ليس crawler) → توجيه مباشر للصفحة
  if (!isCrawler) {
    return res.redirect(302, `${VERCEL_URL}/product.html?id=${productId}`);
  }

  // Crawler → ابنِ OG tags
  let title    = 'TECHNO INFODZ — حلول برمجية وعتاد ذكي بالجزائر';
  let desc     = 'نوفر برامج تسيير متطورة ومعدات كاشير متكاملة وأنظمة أمنية تناسب كافة الأنشطة بالجزائر';
  let img      = DEFAULT_IMG;
  let canonical = `${VERCEL_URL}/api/og-product?id=${productId}`;

  try {
    const data     = await fetchProducts();
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
    console.error('fetchProducts error:', e.message);
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
  <meta http-equiv="refresh"       content="0;url=${VERCEL_URL}/product.html?id=${productId}"/>
  <link rel="canonical"            href="${canonical}"/>
</head>
<body><p>جاري التوجيه...</p></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=120');
  return res.status(200).send(html);
};
