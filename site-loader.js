/**
 * site-loader.js — TECHNO INFODZ
 * ────────────────────────────────
 * يقرأ data.json و content.json من GitHub
 * ويحدّث الموقع الرئيسي تلقائياً
 *
 * أضفه في index.html قبل </body>:
 * <script src="site-loader.js"></script>
 *
 * وأضف هذه العناصر في index.html:
 * <div id="dynamic-products"></div>   ← مكان المنتجات
 * <span id="site-hero-title"></span>  ← عنوان Hero
 * <span id="site-hero-desc"></span>   ← وصف Hero
 * <span id="site-hero-badge"></span>  ← الشارة
 */

(async function(){
  const REPO  = 'samirinfodz-boop/technoinfodz-official';
  const BRANCH= 'main';
  const BASE  = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
  const WA    = '213666636473';

  async function fetchJSON(file){
    try {
      const r = await fetch(`${BASE}/${file}?t=${Date.now()}`);
      if(!r.ok) return null;
      return r.json();
    } catch(e){ return null; }
  }

  // ── LOAD CONTENT (Hero / About / Contact) ──
  const content = await fetchJSON('content.json');
  if(content){
    // Hero
    const heroTitle = document.getElementById('site-hero-title');
    const heroBadge = document.getElementById('site-hero-badge');
    const heroDesc  = document.getElementById('site-hero-desc');
    const heroBtn   = document.getElementById('site-hero-btn');
    if(heroTitle && content.hero?.title) heroTitle.textContent = content.hero.title;
    if(heroBadge && content.hero?.badge) heroBadge.textContent = content.hero.badge;
    if(heroDesc  && content.hero?.desc)  heroDesc.textContent  = content.hero.desc;
    if(heroBtn   && content.hero?.btn)   heroBtn.textContent   = content.hero.btn;

    // About
    const about1 = document.getElementById('site-about-1');
    const about2 = document.getElementById('site-about-2');
    if(about1 && content.about?.p1) about1.textContent = content.about.p1;
    if(about2 && content.about?.p2) about2.textContent = content.about.p2;

    // Contact
    const phone = content.contact?.phone || WA;
    document.querySelectorAll('[data-wa]').forEach(el=>{
      el.href = `https://wa.me/${phone}?text=${encodeURIComponent(el.dataset.msg||'مرحباً')}`;
    });
  }

  // ── LOAD PRODUCTS ──
  const data = await fetchJSON('data.json');
  const products = data?.products || data || [];
  const container = document.getElementById('dynamic-products');
  if(!container || !products.length) return;

  const phone = content?.contact?.phone || WA;

  container.innerHTML = products.map(p => `
    <div style="
      background:#0e1829;border:1px solid rgba(0,229,255,.09);border-radius:15px;
      overflow:hidden;transition:transform .25s,box-shadow .25s,border-color .25s;
      display:flex;flex-direction:column;
    " onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 0 36px rgba(0,229,255,.13)';this.style.borderColor='rgba(0,229,255,.2)'"
       onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='rgba(0,229,255,.09)'">

      <div style="width:100%;height:160px;background:#121f33;display:flex;align-items:center;justify-content:center;font-size:3rem;overflow:hidden;border-bottom:1px solid rgba(0,229,255,.09);">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;"
               onerror="this.parentElement.innerHTML='<span style=font-size:3rem>${p.icon||'📦'}</span>'">`
          : `<span style="font-size:3rem;">${p.icon||'📦'}</span>`}
      </div>

      <div style="padding:1.1rem;display:flex;flex-direction:column;flex:1;">
        <div style="font-weight:700;font-size:.975rem;color:#dbeeff;margin-bottom:.3rem;">${p.name}</div>
        <span style="display:inline-block;font-size:.65rem;font-family:monospace;padding:.18rem .5rem;border-radius:4px;margin-bottom:.55rem;background:rgba(0,82,212,.15);color:#5fa8ff;">${p.cat}</span>
        <div style="font-size:.8rem;color:#4a7090;line-height:1.55;margin-bottom:.75rem;flex:1;">${p.desc||''}</div>
        <div style="font-family:monospace;color:#00e5ff;font-size:1rem;font-weight:600;margin-bottom:.85rem;">${p.price}</div>
        <a href="https://wa.me/${phone}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن: '+p.name+' — '+p.price)}"
           target="_blank"
           style="display:flex;align-items:center;justify-content:center;gap:.5rem;
                  background:linear-gradient(135deg,#0052d4,#5b00ff);color:#fff;
                  padding:.7rem;border-radius:8px;text-decoration:none;font-size:.875rem;font-weight:600;">
          💬 اطلب عبر واتساب
        </a>
      </div>
    </div>
  `).join('');

})();
