/**
 * products-loader.js
 * ──────────────────
 * أضف هذا الـ script في index.html قبل </body>
 * يقرأ المنتجات من localStorage (التي يحفظها admin.html)
 * ويعرضها في قسم المنتجات الرئيسي
 *
 * استخدام: أضف <div id="dynamic-products"></div> في index.html
 * وأضف <script src="products-loader.js"></script>
 */

(function(){
  const STORAGE_KEY = 'techno_products';
  const WHATSAPP    = '213666636473';

  const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const container = document.getElementById('dynamic-products');
  if(!container || !products.length) return;

  container.innerHTML = products.map(p => `
    <div class="glass-card" style="padding:2rem;display:flex;flex-direction:column;">
      ${p.img ? `
        <div style="width:100%;height:160px;border-radius:10px;overflow:hidden;margin-bottom:1.25rem;">
          <img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;"
               onerror="this.parentElement.innerHTML='<div style=font-size:3rem;text-align:center;padding:1rem>${p.icon||'📦'}</div>'"/>
        </div>
      ` : `
        <div style="font-size:3rem;margin-bottom:1.25rem;">${p.icon||'📦'}</div>
      `}
      <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:.4rem;">${p.name}</h3>
      <span style="display:inline-block;font-size:.7rem;padding:.2rem .6rem;border-radius:4px;
                   background:rgba(0,200,255,.1);color:#4dd9ff;margin-bottom:.75rem;">${p.cat}</span>
      <p style="color:var(--text-mid,#8fb0cc);font-size:.875rem;line-height:1.6;flex:1;margin-bottom:.9rem;">${p.desc||''}</p>
      <div style="font-family:'Space Mono',monospace;color:var(--accent,#00d4ff);font-size:1.1rem;font-weight:700;margin-bottom:1rem;">
        ${p.price}
      </div>
      <a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: '+p.name+' — '+p.price)}"
         target="_blank"
         style="display:flex;align-items:center;justify-content:center;gap:.5rem;
                background:linear-gradient(135deg,#0057e7,#6c1fff);
                color:#fff;padding:.7rem;border-radius:8px;text-decoration:none;
                font-size:.875rem;font-weight:600;transition:opacity .2s;"
         onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        💬 اطلب عبر واتساب
      </a>
    </div>
  `).join('');
})();
