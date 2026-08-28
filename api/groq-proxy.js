// api/groq-proxy.js — Vercel Serverless Function
// يستخدم CommonJS (module.exports) وليس ESM (export default)

module.exports = async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization, X-Groq-Key'
  );

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, name, apiKey } = req.body || {};

    // الـ Key: من Vercel Environment Variables أولاً، ثم من الطلب
    const GROQ_API_KEY = process.env.GROQ_API_KEY
                      || apiKey
                      || req.headers['x-groq-key']
                      || '';

    if (!GROQ_API_KEY) {
      return res.status(400).json({ error: 'مفتاح GROQ_API_KEY غير موجود' });
    }

    const promptText = prompt || name || '';
    if (!promptText) {
      return res.status(400).json({ error: 'prompt مطلوب' });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        error: data.error?.message || 'خطأ من Groq API'
      });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text, choices: data.choices });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
