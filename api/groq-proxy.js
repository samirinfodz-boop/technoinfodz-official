export default async function handler(req, res) {
  // 1. ضبط هيدرز CORS للسماح بالطلبات من أي مصدر
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. معالجة طلب OPTIONS الخاص بـ Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. التحقق من نوع الطلب POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, prompt, apiKey } = req.body || {};
    
    // استخدام المفتاح القادم من العميل أو الموجود في متغيّرات بيئة Vercel
    const GROQ_API_KEY = apiKey || process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(400).json({ error: 'مفتاح GROQ API غير متوفر' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt || name }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
