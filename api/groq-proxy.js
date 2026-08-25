export default async function handler(req, res) {
  // استقبال طلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, prompt } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  // التحقق من وجود مفتاح API في بيئة Vercel
  if (!apiKey) {
    return res.status(500).json({ error: 'مفتاح GROQ_API_KEY غير معرف في Vercel Environment Variables' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt || `اكتب وصفاً تسويقياً موجزاً واحترافياً باللغة العربية لبرنامج اسمه: ${name}`
          }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'فشل الاتصال بـ Groq API', details: error.message });
  }
}
