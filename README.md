# TECHNO INFODZ — موقع الشركة

## 🚀 طريقة النشر على GitHub + Netlify

### 1. رفع الكود على GitHub

```bash
git init
git add .
git commit -m "first commit: TECHNO INFODZ website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/techno-infodz.git
git push -u origin main
```

### 2. ربط GitHub بـ Netlify

1. اذهب إلى [app.netlify.com](https://app.netlify.com)
2. اضغط **"Add new site" → "Import an existing project"**
3. اختر GitHub ثم اختر الـ repository
4. في **Build settings**:
   - Publish directory: `.`
   - Build command: (اتركه فارغاً)
5. اضغط **Deploy site**

### 3. إعداد متغير البيئة ADMIN_TOKEN

في Netlify:
1. اذهب إلى **Site settings → Environment variables**
2. أضف متغيراً جديداً:
   - Key: `ADMIN_TOKEN`
   - Value: (كلمة سر طويلة وعشوائية مثل: `Xk9mP2qL7nR4wZ1vB8dF3hJ6sY0tU5eC`)
3. احفظ وأعد النشر

### 4. دخول لوحة التحكم

**الطريقة الأولى — عبر الرابط (مؤقت):**
```
https://your-site.netlify.app/?admin=YOUR_TOKEN
```
- سيُحفظ التوكن تلقائياً في localStorage ويختفي من الرابط

**الطريقة الثانية — عبر Console (دائم):**
```javascript
localStorage.setItem('techno_admin_token', 'YOUR_TOKEN');
location.reload();
```

**للخروج:**
```javascript
localStorage.removeItem('techno_admin_token');
location.reload();
```

### 5. هيكل الملفات

```
/
├── index.html              ← الموقع الرئيسي
├── data.json               ← أسعار المنتجات (قابلة للتعديل)
├── netlify.toml            ← إعدادات Netlify
├── netlify/
│   └── functions/
│       └── verify-token.js ← التحقق من التوكن (serverless)
├── .env.example            ← نموذج متغيرات البيئة
├── .gitignore              ← الملفات المستثناة من Git
└── README.md               ← هذا الملف
```

### 6. تعديل البيانات (data.json)

عدّل `data.json` لتغيير الأسعار في الموقع:
```json
{
  "prices": {
    "pme":   "25,000 دج",
    "hyper": "35,000 دج",
    "pos":   "20,000 دج"
  }
}
```
ثم ارفع التغييرات وسيتحدث الموقع تلقائياً.

---
**رقم واتساب:** 0666636473
