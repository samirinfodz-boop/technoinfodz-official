// netlify/functions/verify-token.js
// ──────────────────────────────────
// Netlify Serverless Function — التحقق من توكن المشرف
// يتم استدعاؤها من المتصفح: fetch('/api/verify-token')
// ADMIN_TOKEN محفوظ في Netlify Environment Variables — لا يظهر أبداً في الكود

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const clientToken = event.headers['x-admin-token'] || '';
  const serverToken = process.env.ADMIN_TOKEN || '';

  if (!serverToken) {
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ ok: false, error: 'Server not configured' }),
    };
  }

  const valid = clientToken === serverToken;

  return {
    statusCode: valid ? 200 : 401,
    headers,
    body: JSON.stringify({ ok: valid }),
  };
};
