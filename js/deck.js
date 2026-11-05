(function(){
/* One UNISA deck: slides, the narrated tour, transitions and presenter tools.
   The words of the tour are in voiceover.js; the opening globe is in globe.js. */
gsap.registerPlugin(Flip,SplitText);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const IMG=n=>'img/'+n+'.webp', TH=n=>'img/'+n+'-t.webp';
const fmt=n=>n.toLocaleString('en-ZA').replace(/ |\s/g,',');
const pad=n=>String(n).padStart(2,'0');
const ACC={hub:'var(--hub)',centre:'var(--centre)',spoke:'var(--spoke)'};
const CAT={L:['Learning and teaching','var(--cat-l)'],R:['Research and innovation','var(--cat-r)'],S:['Student support and public','var(--cat-s)'],A:['Administration and operations','var(--cat-a)']};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

const deck=$('#deck'), track=$('#track'), pages=$$('.pg'), N=pages.length, IDS=pages.map(p=>p.id);
const IX=id=>IDS.indexOf(id);
deck.addEventListener('scroll',()=>{deck.scrollLeft=0;deck.scrollTop=0});
let pi=0;
const vo={state:'idle',ci:0,part:0,pos:0,wi:-1,fired:0,tok:0,timer:null,tt:null,raf:0,fx:[],audio:null,tDone:0,tTotal:null,tStart:0,synthBroken:false,voice:null,voices:[],rate:1,auto:true,waiting:false,engine:''};

/* ---------- HERO ---------- */
const HERO=[
 {tag:'The Hub · Cape Town · <span style="text-transform:none">5,000 m²</span>',h:'One UNISA. A <em>connected</em> learning ecosystem.',p:'Three sites, one design language and one digital backbone, built where Africa’s growth economies already live.'},
 {tag:'The Centre · Mahikeng · <span style="text-transform:none">2,200 m²</span>',h:'Built where the <em>economy</em> already lives.',p:'Mining and geoscience, with a facade patterned on the land and a welcome from Sol Plaatje.'},
 {tag:'The Spoke · Mthatha · <span style="text-transform:none">700 m²</span>',h:'Global knowledge. <em>Local</em> impact.',p:'Pharmaceutical and health studies, a short walk from the community it serves.'}
];
const slides=$$('.slide'), segs=$$('.seg'), heroCopy=$('#heroCopy');
let hi=0, paused=reduce, t0=performance.now(), DUR=7500;
function renderHero(){
  const s=HERO[hi]; const acc=slides[hi].style.getPropertyValue('--acc');
  heroCopy.innerHTML='';
  const d=document.createElement('div'); d.className='hc'; d.style.cssText='--acc:'+acc;
  d.innerHTML='<span class="tag mono"><b></b>'+s.tag+'</span><h1>'+s.h+'</h1><p>'+s.p+'</p>';
  heroCopy.appendChild(d);
}
function goHero(i){
  i=(i+3)%3; if(i===hi&&heroCopy.firstChild){t0=performance.now();return}
  hi=i; slides.forEach((s,k)=>s.classList.toggle('on',k===hi));
  segs.forEach((s,k)=>{s.setAttribute('aria-current',k===hi);s.querySelector('i').style.setProperty('--p',k<hi?'100%':'0%')});
  renderHero(); t0=performance.now();
}
segs.forEach(s=>s.onclick=()=>{userTookOver();goHero(+s.dataset.i)});
$('#heroNext').onclick=()=>goHero(hi+1);
const pBtn=$('#heroPause');
function setPause(p){paused=p;pBtn.setAttribute('aria-label',p?'Play slides':'Pause slides');pBtn.innerHTML=p?'<svg viewBox="0 0 16 16" fill="#fff"><path d="M4 2l10 6-10 6z"/></svg>':'<svg viewBox="0 0 16 16" fill="#fff"><rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/></svg>';t0=performance.now()-(parseFloat(segs[hi].querySelector('i').style.getPropertyValue('--p'))||0)/100*DUR}
pBtn.onclick=()=>setPause(!paused);
function tick(now){
  if(!paused&&IDS[pi]==='vision'&&vo.state==='idle'){const p=Math.max(0,Math.min(1,(now-t0)/DUR));segs[hi].querySelector('i').style.setProperty('--p',(p*100)+'%');if(p>=1)goHero(hi+1)}
  else if(IDS[pi]!=='vision'||vo.state!=='idle')t0=now-(parseFloat(segs[hi].querySelector('i').style.getPropertyValue('--p'))||0)/100*DUR;
  requestAnimationFrame(tick);
}
renderHero(); setPause(paused); requestAnimationFrame(tick);
const hero=$('#hero');
if(!reduce) hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*2);hero.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*2)});

/* ---------- MAP ---------- */
const SA=[[16.45,-28.63],[17.4,-28.75],[18.2,-28.9],[19.0,-28.95],[19.9,-28.45],[20.0,-24.75],[20.6,-25.3],[21.6,-26.6],[22.5,-26.2],[23.4,-25.5],[24.2,-25.6],[25.0,-25.75],[25.6,-25.45],[26.4,-24.6],[27.0,-23.65],[28.0,-22.85],[29.3,-22.2],[30.5,-22.3],[31.3,-22.4],[31.6,-23.7],[31.95,-24.4],[32.0,-25.9],[32.1,-26.3],[32.9,-26.85],[32.6,-28.0],[32.2,-28.7],[31.4,-29.4],[31.0,-29.9],[30.3,-30.9],[29.6,-31.6],[28.9,-32.2],[28.0,-32.95],[27.1,-33.5],[26.5,-33.75],[25.7,-33.95],[25.0,-34.0],[24.3,-34.1],[23.4,-34.08],[22.2,-34.1],[21.4,-34.4],[20.5,-34.5],[20.0,-34.83],[19.4,-34.6],[18.85,-34.38],[18.47,-34.35],[18.4,-33.9],[18.1,-33.25],[17.85,-32.6],[18.2,-32.2],[17.9,-31.4],[17.3,-30.3],[16.9,-29.4],[16.45,-28.63]];
const LES=[[27.0,-29.6],[27.6,-28.9],[28.6,-28.6],[29.4,-29.2],[29.2,-29.9],[28.3,-30.6],[27.5,-30.4],[27.0,-29.6]];
const P=([lo,la])=>[((lo-15.6)*0.88)*35+20,((-la)-21.7)*35+16];
const poly=a=>a.map(P).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
const NODES={hub:{ll:[18.42,-33.92],name:'Cape Town',sub:'The Hub · Marine'},centre:{ll:[25.64,-25.85],name:'Mahikeng',sub:'The Centre · Mining'},spoke:{ll:[28.78,-31.59],name:'Mthatha',sub:'The Spoke · Health'}};
const HQ=P([28.23,-25.75]);
function hlSite(k){
  $$('#tiers .tier').forEach(t=>t.classList.toggle('hl',t.dataset.site===k));
  const svg=$('#mapSvg'); svg.classList.toggle('focus',!!k);
  svg.querySelectorAll('[data-site]').forEach(p=>p.classList.toggle('hl',p.dataset.site===k));
}
(function(){
  const svg=$('#mapSvg'); let h='';
  for(let x=0;x<620;x+=40)h+='<line class="grat" x1="'+x+'" y1="0" x2="'+x+'" y2="520"/>';
  for(let y=0;y<520;y+=40)h+='<line class="grat" x1="0" y1="'+y+'" x2="620" y2="'+y+'"/>';
  h+='<polygon class="land" points="'+poly(SA)+'"/><polygon points="'+poly(LES)+'" fill="#171b20" stroke="#3d444d" stroke-width="1"/>';
  for(const k in NODES){const p=P(NODES[k].ll);const mx=(p[0]+HQ[0])/2+(k==='hub'?-40:20),my=(p[1]+HQ[1])/2+(k==='hub'?30:-10);
    h+='<path class="link" data-site="'+k+'" d="M'+HQ[0]+','+HQ[1]+' Q'+mx+','+my+' '+p[0]+','+p[1]+'" style="stroke:'+ACC[k]+'"/>';}
  h+='<g><circle cx="'+HQ[0]+'" cy="'+HQ[1]+'" r="7" fill="var(--bg)" stroke="var(--fg)" stroke-width="2"/><circle cx="'+HQ[0]+'" cy="'+HQ[1]+'" r="2.5" fill="var(--fg)"/><text x="'+(HQ[0]+14)+'" y="'+(HQ[1]-4)+'">Pretoria</text><text class="sub" x="'+(HQ[0]+14)+'" y="'+(HQ[1]+11)+'">Main campus</text><text class="sub" x="'+(HQ[0]+14)+'" y="'+(HQ[1]+25)+'">Shared backbone</text></g>';
  const lab={hub:[14,22,'start'],centre:[-14,-16,'end'],spoke:[14,16,'start']};
  for(const k in NODES){const p=P(NODES[k].ll),l=lab[k];
    h+='<g class="pin" data-site="'+k+'" tabindex="0" role="button" aria-label="'+NODES[k].sub+'"><circle class="halo" cx="'+p[0]+'" cy="'+p[1]+'" r="12" style="fill:'+ACC[k]+'"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="none" stroke-width="5" style="stroke:'+ACC[k]+'"/><circle cx="'+(p[0]+8)+'" cy="'+(p[1]-8)+'" r="2.6" style="fill:'+ACC[k]+'"/>'+
    '<text x="'+(p[0]+l[0])+'" y="'+(p[1]+l[1])+'" text-anchor="'+l[2]+'">'+NODES[k].name+'</text><text class="sub" x="'+(p[0]+l[0])+'" y="'+(p[1]+l[1]+14)+'" text-anchor="'+l[2]+'">'+NODES[k].sub+'</text></g>';}
  svg.innerHTML=h;
  const hov=k=>{if(vo.state!=='playing')$$('#tiers .tier').forEach(t=>t.classList.toggle('hl',t.dataset.site===k))};
  const jump=k=>{userTookOver();go(IX('sites'),{morph:k,keepSite:true})};
  svg.querySelectorAll('.pin').forEach(p=>{p.onmouseenter=()=>hov(p.dataset.site);p.onmouseleave=()=>hov(null);p.onclick=()=>jump(p.dataset.site);p.onkeydown=e=>{if(e.key==='Enter')p.onclick()}});
  $$('#tiers .tier').forEach(t=>{t.onclick=()=>jump(t.dataset.site)});
})();

/* ---------- JOURNEY ---------- */
const J=[
 {k:'Discover',img:'g-spk-byod',say:'I have enrolled. Where do I go now?',act:'Enrolment triggers a welcome in the student’s own language with the nearest site, opening hours and a bookable orientation slot.',touch:'UNISA app, SMS and email, multilingual welcome screens',space:'Spoke BYOD lounge and welcome wall',measure:'Orientation bookings per new enrolment',c:34},
 {k:'Arrive',img:'d-hub-lobby',say:'I walked in and I was expected.',act:'Smart access recognises the booking. Self help kiosks handle routine requests so staff can focus on the student in front of them.',touch:'Access gates, kiosks, digital wayfinding',space:'Hub entrance lobby and student services',measure:'Time to service at reception',c:52},
 {k:'Support',img:'g-spk-consult',say:'I was falling behind and someone noticed.',act:'Missed submissions or low platform activity raise an early alert. An adviser books a consultation before the student asks.',touch:'Case management, adviser outreach, consultation booking',space:'Consultation and counselling rooms',measure:'Early alerts resolved within seven days',c:40},
 {k:'Learn',img:'d-hub-commons',say:'I found a place to focus.',act:'The app suggests a free seat or study room near the student’s next session, with power and data at every seat.',touch:'Room booking app, availability screens',space:'Learning Commons and library',measure:'Seat and room utilisation by hour',c:60},
 {k:'Collaborate',img:'d-hub-hybrid',say:'My group lives in four provinces.',act:'Hybrid studios join remote peers automatically, with tracking cameras, live captions and recording built in.',touch:'Hybrid studio, learning platform integration',space:'Hybrid learning studios',measure:'Hybrid sessions per week',c:68},
 {k:'Research',img:'d-hub-research',say:'My research has real data and real equipment.',act:'Postgraduate students are matched to lab time, datasets and supervisors, and progress is visible to both sides.',touch:'Lab booking, research data platforms',space:'Research studios and laboratories',measure:'Postgraduate completion on time',c:76},
 {k:'Connect',img:'d-hub-workshop',say:'I met the people who will employ me.',act:'Industry partners post live challenges through the incubator. Students are invited to pitch and to work on partner projects.',touch:'Incubator programmes, partner events, boardrooms',space:'Innovation incubator and engagement hub',measure:'Partner projects and graduate placements',c:84},
 {k:'Belong',img:'d-hub-lecture',say:'This is my university.',act:'Graduation support, public lectures and alumni mentoring keep graduates connected to the next intake.',touch:'Lecture hall events, alumni network',space:'Lecture hall and public atrium',measure:'Alumni returning as mentors',c:92}
];
let ji=-1;
function drawCurve(){
  const svg=$('#curveSvg'),W=1000,H=150,pl=40,pr=30,pt=18,pb=38;
  const xs=J.map((_,i)=>pl+i*(W-pl-pr)/(J.length-1)), ys=J.map(s=>pt+(1-s.c/100)*(H-pt-pb));
  let d='M'+xs[0]+','+ys[0];
  for(let i=1;i<J.length;i++){const cx=(xs[i-1]+xs[i])/2;d+=' C'+cx+','+ys[i-1]+' '+cx+','+ys[i]+' '+xs[i]+','+ys[i]}
  let h='<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4b844" stop-opacity=".28"/><stop offset="1" stop-color="#e4b844" stop-opacity="0"/></linearGradient></defs>';
  h+='<line class="ax" x1="'+pl+'" y1="'+(H-pb)+'" x2="'+(W-pr)+'" y2="'+(H-pb)+'"/>';
  h+='<text class="ylab" x="0" y="'+(pt+4)+'">High</text><text class="ylab" x="0" y="'+(H-pb)+'">Low</text>';
  h+='<text class="ylab" x="'+(W-pr)+'" y="8" text-anchor="end">STUDENT CONFIDENCE ACROSS THE JOURNEY, ILLUSTRATIVE</text>';
  h+='<path class="area" d="'+d+' L'+xs[xs.length-1]+','+(H-pb)+' L'+xs[0]+','+(H-pb)+' Z"/><path class="path" d="'+d+'"/>';
  J.forEach((s,i)=>{h+='<g class="pt'+(i===ji?' on':'')+'" data-i="'+i+'" tabindex="0" role="button" aria-label="Stage '+(i+1)+', '+s.k+'"><circle cx="'+xs[i]+'" cy="'+ys[i]+'" r="'+(i===ji?9:7)+'"/><text x="'+xs[i]+'" y="'+(H-pb+22)+'">'+pad(i+1)+' '+s.k+'</text></g>'});
  svg.innerHTML=h;
  svg.querySelectorAll('.pt').forEach(g=>{g.onclick=()=>{userTookOver();goJ(+g.dataset.i)};g.onkeydown=e=>{if(e.key==='Enter')g.onclick()}});
}
function goJ(i){
  i=Math.max(0,Math.min(J.length-1,i)); if(i===ji)return; ji=i; const s=J[ji];
  $('#stage').innerHTML='<figure><img src="'+IMG(s.img)+'" alt="'+s.space+'"><span class="step">Stage '+pad(ji+1)+' of 08 · '+s.k+'</span></figure>'+
   '<div class="info"><p class="say">'+s.say+'</p><div class="act"><span class="mono">We act first</span><p style="margin-top:6px">'+s.act+'</p></div>'+
   '<dl class="kv"><dt>Touchpoints</dt><dd>'+s.touch+'</dd><dt>Space</dt><dd>'+s.space+'</dd></dl>'+
   '<span class="measure">We measure <b>'+s.measure+'</b></span></div>';
  $('#stage figure img').onclick=e=>openLB([{src:s.img,title:s.space,meta:'Stage '+(ji+1)+' · '+s.k}],0,e.currentTarget);
  drawCurve();
}
goJ(0);

/* ---------- SITES AND BRIEF ---------- */
const SITES={
 hub:{name:'The Hub',place:'Cape Town waterfront',niche:'Marine studies and the blue economy',area:5000,levels:'Four levels',role:'Flagship and network anchor',
  imgs:[['d-hub-night','Exterior at night'],['g-hub-promenade','Waterfront promenade'],['g-hub-entrance','Main entrance'],['d-hub-lobby','Entrance lobby'],['g-hub-atrium','Central atrium'],['d-hub-library','Learning Commons library'],['d-hub-commons','Learning Commons'],['d-hub-hybrid','Hybrid learning studio'],['d-hub-lecture','Lecture hall'],['d-hub-research','Marine and port logistics research studio'],['d-hub-postgrad','Postgraduate research'],['d-hub-workshop','Boardroom, strategy workshop'],['d-hub-ict','ICT operations centre']],
  plans:[['plan-hub-0','Ground'],['plan-hub-1','First'],['plan-hub-2','Second'],['plan-hub-3','Third']],
  zones:[['Marine hub arrival and public engagement',300,'S'],['Marine learning commons',800,'L'],['Marine science teaching laboratories',480,'L'],['Digital ocean and geospatial laboratories',400,'R'],['Teaching and tutorial zone',500,'L'],['Postgraduate and marine research centre',450,'R'],['Blue economy innovation and incubator',350,'R'],['Student support and counselling',330,'S'],['Community and industry engagement',300,'S'],['Administration and staff',300,'A'],['ICT and building support',320,'A']],
  feats:['Multilingual welcome wall, kiosks and smart access','Bookable group rooms with live availability','Hybrid studios with tracking cameras and captions','Operations centre monitoring space use and energy']},
 centre:{name:'The Centre',place:'Mahikeng, North West',niche:'Mining and geoscience',area:2200,levels:'Two levels',role:'Regional knowledge centre',
  imgs:[['d-cen-exterior','Exterior, afternoon'],['g-cen-entrance','Entrance and approach'],['g-cen-plaatje','Atrium with Sol Plaatje artwork'],['g-cen-atrium','Learning commons atrium'],['g-cen-commons','Learning commons'],['g-cen-maker','Geoscience makerspace'],['g-cen-collab','Collaboration studio'],['g-cen-configs','Collaboration studio, four layouts'],['g-cen-lecture','Hybrid lecture hall']],
  plans:[['plan-centre','Ground and first']],
  zones:[['Entrance reception and student services',180,'S'],['Digital learning and computer laboratories',360,'L'],['Learning commons and study',420,'L'],['Tutorial and teaching',320,'L'],['Consultation, counselling and academic support',120,'S'],['Administration and staff',150,'A'],['Student amenities',110,'S'],['Operational support',70,'A']],
  feats:['Facade patterned on the regional landscape','Sol Plaatje artwork as the civic welcome','Collaboration studio that reconfigures into four layouts','Hybrid lecture hall linked to the network']},
 spoke:{name:'The Spoke',place:'Mthatha, Eastern Cape',niche:'Pharmaceutical and health studies',area:700,levels:'Single level',role:'Community access point',
  imgs:[['g-spk-exterior','Street frontage at golden hour'],['g-spk-forecourt','Community forecourt'],['g-spk-byod','Bring your own device lounge'],['g-spk-library','Pharmaceutical knowledge commons'],['g-spk-research','Pharmaceutical research studio'],['g-spk-consult','Consultation room']],
  plans:[['plan-spoke','Ground']],
  zones:[['Public access and student services',80,'S'],['Learning and academic spaces',225,'L'],['Digital library and innovation',150,'R'],['Administration and support',90,'A'],['Amenities and building support',80,'A']],
  feats:['Language choice at the welcome screen','Live expert support from across the network','Outdoor learning under a shaded canopy','Community outreach and wellness programmes']}
};
const SK=['hub','centre','spoke'], TOWN={hub:'Cape Town',centre:'Mahikeng',spoke:'Mthatha'};
let cur=null, viewImg=()=>{}, showPlan=()=>{}, hlZone=()=>{};
$$('[data-tabs]').forEach(tl=>{
  tl.innerHTML=SK.map(k=>'<button class="tab" role="tab" type="button" data-site="'+k+'" style="--acc:'+ACC[k]+'" aria-selected="false"><i></i>'+SITES[k].name+', '+TOWN[k]+'</button>').join('');
  tl.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{userTookOver();openSite(t.dataset.site)});
  tl.onkeydown=e=>{let i=SK.indexOf(cur);if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();openSite(SK[(i+(e.key==='ArrowRight'?1:2))%3]);tl.querySelector('[aria-selected="true"]').focus()}};
});
function openSite(k){
  if(k===cur)return; cur=k; const s=SITES[k], acc=ACC[k];
  $$('[data-tabs] .tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.site===k));
  const alloc=s.zones.reduce((a,z)=>a+z[1],0), un=s.area-alloc;
  const zs=[...s.zones].sort((a,b)=>'LRSA'.indexOf(a[2])-'LRSA'.indexOf(b[2])||b[1]-a[1]);
  const stack=zs.map((z,i)=>'<i data-z="'+i+'" title="'+z[0]+', '+z[1]+' m²" style="flex-grow:'+z[1]+';background:'+CAT[z[2]][1]+'"></i>').join('')+(un>0?'<i class="u" data-z="u" title="Circulation and services, '+un+' m²" style="flex-grow:'+un+'"></i>':'');
  const list=zs.map((z,i)=>'<div data-z="'+i+'"><i style="background:'+CAT[z[2]][1]+'"></i><span>'+z[0]+'</span><span>'+fmt(z[1])+' m²</span></div>').join('')+(un>0?'<div class="u" data-z="u"><i style="background:repeating-linear-gradient(135deg,var(--cat-u) 0 3px,#2a2e34 3px 6px)"></i><span>Circulation and services, to be confirmed</span><span>'+fmt(un)+' m²</span></div>':'');
  const top=$('#sitePanel'), low=$('#briefPanel');
  top.style.setProperty('--acc',acc); low.style.setProperty('--acc',acc);
  top.innerHTML='<div class="vcol"><div class="viewer" id="viewer"></div><div class="thumbs" id="thumbs">'+s.imgs.map((m,i)=>'<button type="button" data-i="'+i+'" aria-label="'+m[1]+'"><img src="'+TH(m[0])+'" alt="" loading="lazy"></button>').join('')+'</div></div>'+
  '<div class="site-facts"><span class="mono" style="color:'+acc+'">'+s.name+' · '+s.role+'</span><div class="big">'+fmt(s.area)+'<small> m²</small></div><p style="color:var(--muted);margin-top:-6px">Stated gross floor area</p>'+
  '<div class="facts"><div><b>'+s.place+'</b><span>Location</span></div><div><b>'+s.niche+'</b><span>Catalytic niche</span></div><div><b>'+s.levels+'</b><span>Building form</span></div><div><b>'+s.zones.length+' zones</b><span>In the accommodation brief</span></div></div>'+
  '<ul class="feat">'+s.feats.map(f=>'<li>'+f+'</li>').join('')+'</ul></div>';
  low.innerHTML='<div class="card"><div class="card-h"><h3>'+s.name+' accommodation brief</h3><span class="mono">'+fmt(alloc)+' of '+fmt(s.area)+' m² allocated</span></div><div class="stack" id="stack">'+stack+'</div><div class="zones" id="zones">'+list+'</div></div>'+
  '<div class="card"><div class="card-h"><h3>Zoning plans</h3><div class="floors" id="floors">'+s.plans.map((p,i)=>'<button type="button" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+p[1]+'</button>').join('')+'</div></div><div class="planbox" id="planbox"></div><p class="mono" style="margin-top:10px">Concept zoning, scale 1:300 at A1. Select to enlarge.</p></div>';
  viewImg=i=>{const m=s.imgs[i];$('#viewer').innerHTML='<img src="'+IMG(m[0])+'" alt="'+m[1]+'"><div class="cap"><span>'+m[1]+'</span><span class="mono">'+(i+1)+' / '+s.imgs.length+'</span></div>';
    $$('#thumbs button').forEach((b,k)=>b.setAttribute('aria-current',k===i));
    const tb=$$('#thumbs button')[i], th=$('#thumbs'); if(tb&&th)th.scrollTo({left:tb.offsetLeft-th.clientWidth/2+tb.clientWidth/2,behavior:reduce?'auto':'smooth'});
    $('#viewer img').onclick=e=>openLB(s.imgs.map(x=>({src:x[0],title:x[1],meta:s.name+', '+s.place})),i,e.currentTarget)};
  $$('#thumbs button').forEach(b=>b.onclick=()=>{userTookOver();viewImg(+b.dataset.i)}); viewImg(0);
  showPlan=i=>{const p=s.plans[Math.min(i,s.plans.length-1)];$('#planbox').innerHTML='<img src="'+IMG(p[0])+'" alt="'+s.name+' zoning plan, '+p[1]+' floor">';$$('#floors button').forEach((b,k)=>b.setAttribute('aria-pressed',k===i));
    $('#planbox').onclick=()=>openLB(s.plans.map(x=>({src:x[0],title:s.name+' zoning plan, '+x[1].toLowerCase()+' floor',meta:'Concept zoning'})),i,$('#planbox img'))};
  $$('#floors button').forEach(b=>b.onclick=()=>{userTookOver();showPlan(+b.dataset.i)}); showPlan(0);
  const mark=(z,on)=>{$$('#stack i,#zones div').forEach(e=>e.classList.toggle('hl',on&&e.dataset.z===z));$$('#stack i').forEach(e=>e.style.opacity=on&&e.dataset.z!==z?.3:1)};
  hlZone=key=>{
    const z=key==null?null:key==='u'?'u':String(zs.findIndex(x=>x[0]===key));
    mark(z,z!=null);
    const row=z!=null&&$('#zones [data-z="'+z+'"]'), box=$('#zones');
    if(row&&box)box.scrollTo({top:row.offsetTop-box.offsetTop-box.clientHeight/2+row.clientHeight/2,behavior:reduce?'auto':'smooth'});
  };
  $$('#stack i[data-z],#zones div[data-z]').forEach(e=>{e.onmouseenter=()=>mark(e.dataset.z,true);e.onmouseleave=()=>mark(e.dataset.z,false)});
}
openSite('hub');

/* ---------- CAPITAL ---------- */
(function(){
  let h='';
  for(const k of SK){const s=SITES[k];const by={L:0,R:0,S:0,A:0};s.zones.forEach(z=>by[z[2]]+=z[1]);const un=s.area-Object.values(by).reduce((a,b)=>a+b,0);
    h+='<div class="mixrow" style="--acc:'+ACC[k]+'"><span class="lab"><i></i>'+s.name.replace('The ','')+'</span><div class="mixbar">';
    for(const c of 'LRSA'){if(!by[c])continue;const pc=by[c]/s.area*100;h+='<i style="flex-grow:'+by[c]+';background:'+CAT[c][1]+'" title="'+CAT[c][0]+', '+fmt(by[c])+' m²">'+(pc>=9?Math.round(pc)+'%':'')+'</i>'}
    if(un>0)h+='<i class="u" style="flex-grow:'+un+'" title="Circulation and services, '+fmt(un)+' m²">'+(un/s.area>=.09?Math.round(un/s.area*100)+'%':'')+'</i>';
    h+='</div><span class="tot">'+fmt(s.area)+'</span></div>'}
  $('#mix').innerHTML=h;
  const rows=[['Arrival and student services',[300,180,80]],['Learning commons and study',[800,420,225]],['Teaching, tutorial and labs',[980,680,0]],['Digital and research laboratories',[850,0,150]],['Innovation and industry engagement',[650,0,0]],['Support and counselling',[330,120,0]],['Administration and staff',[300,150,90]],['Amenities, ICT and building support',[320,180,80]]];
  let m='<thead><tr><th>Module</th><th style="color:var(--hub)">Hub</th><th style="color:var(--centre)">Centre</th><th style="color:var(--spoke)">Spoke</th></tr></thead><tbody>';
  rows.forEach(r=>{m+='<tr><td>'+r[0]+'</td>'+r[1].map((v,i)=>{const b=(5+Math.sqrt(v)*0.55).toFixed(1);return v?'<td style="--acc:'+ACC[SK[i]]+'"><span class="cell"><span class="bub" style="width:'+b+'px;height:'+b+'px"></span><small>'+fmt(v)+'</small></span></td>':'<td class="no">·</td>'}).join('')+'</tr>'});
  m+='</tbody>'; $('#matrix').innerHTML=m;
  const mn=document.createElement('p');mn.style.cssText='font-size:12.5px;color:var(--dim);margin-top:6px';mn.textContent='Spoke learning and academic spaces (225 m²) combine study and teaching.';$('#matrix').parentElement.after(mn);
})();

/* ---------- GALLERY ---------- */
const GAL=[
 ['g-hub-promenade','Waterfront promenade','hub','Exterior'],['g-hub-entrance','Main entrance','hub','Arrival'],['g-hub-atrium','Central atrium','hub','Atrium'],['g-hub-atrium-tall','Atrium, full height view','hub','Atrium'],
 ['g-cen-entrance','Entrance and approach','centre','Arrival'],['g-cen-plaatje','Atrium with Sol Plaatje artwork','centre','Atrium'],['g-cen-atrium','Learning commons atrium','centre','Learning'],['g-cen-commons','Learning commons','centre','Learning'],['g-cen-commons2','Learning commons, upper view','centre','Learning'],['g-cen-commons-annot','Learning commons, design features','centre','Learning'],['g-cen-maker','Geoscience makerspace','centre','Research'],['g-cen-collab','Collaboration studio in use','centre','Collaboration'],['g-cen-configs','Collaboration studio, four layouts','centre','Collaboration'],['g-cen-lecture','Hybrid lecture hall','centre','Teaching'],
 ['g-spk-exterior','Street frontage at golden hour','spoke','Exterior'],['g-spk-forecourt','Community forecourt','spoke','Arrival'],['g-spk-byod','Bring your own device lounge','spoke','Learning'],['g-spk-library','Pharmaceutical knowledge commons','spoke','Learning'],['g-spk-research','Pharmaceutical research studio','spoke','Research'],['g-spk-consult','Consultation room','spoke','Support']
];
const SN={hub:'The Hub',centre:'The Centre',spoke:'The Spoke'};
const TYPES=['Exterior','Arrival','Atrium','Learning','Teaching','Research','Collaboration','Support'];
let fS='all',fT='all';
$('#gal').innerHTML=GAL.map((g,i)=>'<button class="gi" type="button" data-i="'+i+'" style="--acc:'+ACC[g[2]]+'"><img src="'+TH(g[0])+'" alt="'+g[1]+', '+SN[g[2]]+'" loading="lazy"><span class="gl"><b>'+g[1]+'</b><span><i></i>'+SN[g[2]]+' · '+g[3]+'</span></span></button>').join('');
function chips(){
  const cnt=(s,t)=>GAL.filter(g=>(s==='all'||g[2]===s)&&(t==='all'||g[3]===t)).length;
  $('#fSite').innerHTML='<span class="mono">Site</span>'+[['all','All sites'],['hub','The Hub'],['centre','The Centre'],['spoke','The Spoke']].map(([v,l])=>'<button class="chip" type="button" data-v="'+v+'" aria-pressed="'+(fS===v)+'">'+l+' <small>'+cnt(v,fT)+'</small></button>').join('');
  $('#fType').innerHTML='<span class="mono">Space</span>'+[['all','All spaces']].concat(TYPES.map(t=>[t,t])).map(([v,l])=>{const n=cnt(fS,v);return '<button class="chip" type="button" data-v="'+v+'" aria-pressed="'+(fT===v)+'"'+(n===0&&fT!==v?' disabled':'')+'>'+l+' <small>'+n+'</small></button>'}).join('');
  $$('#fSite .chip').forEach(c=>c.onclick=()=>{userTookOver();fS=c.dataset.v;if(cnt(fS,fT)===0)fT='all';apply()});
  $$('#fType .chip').forEach(c=>c.onclick=()=>{userTookOver();fT=c.dataset.v;apply()});
}
function vis(){return GAL.map((g,i)=>i).filter(i=>(fS==='all'||GAL[i][2]===fS)&&(fT==='all'||GAL[i][3]===fT))}
function apply(){const v=vis();$$('.gi').forEach(b=>b.classList.toggle('out',!v.includes(+b.dataset.i)));$('#gCount').textContent='Showing '+v.length+' of '+GAL.length+' renders';chips()}
function setFilter(s){fS=s;fT='all';apply()}
$$('.gi').forEach(b=>b.onclick=()=>{const v=vis();openLB(v.map(i=>({src:GAL[i][0],title:GAL[i][1],meta:SN[GAL[i][2]]+' · '+GAL[i][3]})),v.indexOf(+b.dataset.i),b.querySelector('img'))});
apply();

/* ---------- LIGHTBOX ---------- */
const lb=$('#lb'),lbImg=$('#lbImg');let LB=[],li=0,z=1,tx=0,ty=0,lastFocus=null;
function setZ(){lbImg.style.setProperty('--z',z);lbImg.style.setProperty('--tx',tx+'px');lbImg.style.setProperty('--ty',ty+'px');lb.classList.toggle('zoomed',z>1)}
function showLB(){const it=LB[li];lbImg.src=IMG(it.src);lbImg.alt=it.title;$('#lbTitle').textContent=it.title;$('#lbMeta').textContent=it.meta||'';$('#lbCount').textContent=(li+1)+' / '+LB.length;z=1;tx=ty=0;setZ();$('#lbL').hidden=$('#lbR').hidden=LB.length<2}
/* The image grows from where it was clicked into the viewer. */
function openLB(list,i,from){
  voPause();LB=list;li=Math.max(0,i);lastFocus=document.activeElement;lb.style.backgroundColor='';lb.hidden=false;showLB();$('#lbX').focus();
  if(!from||reduce)return;
  const r0=from.getBoundingClientRect(); if(r0.width<4)return;
  const fly=new Image(); fly.alt=''; fly.className='lb-fly';
  lbImg.style.visibility='hidden'; lb.style.backgroundColor='rgba(5,6,7,0)';
  const land=()=>{
    const r1=lbImg.getBoundingClientRect(); if(!r1.width){lbImg.style.visibility='';return}
    fly.src=lbImg.currentSrc||lbImg.src;
    Object.assign(fly.style,{left:r1.left+'px',top:r1.top+'px',width:r1.width+'px',height:r1.height+'px'});
    document.body.appendChild(fly);
    gsap.to(lb,{backgroundColor:'rgba(5,6,7,.96)',duration:.45});
    gsap.fromTo(fly,{x:r0.left-r1.left,y:r0.top-r1.top,scaleX:r0.width/r1.width,scaleY:r0.height/r1.height},
      {x:0,y:0,scaleX:1,scaleY:1,duration:.7,ease:'expo.out',onComplete:()=>{lbImg.style.visibility='';fly.remove()}});
  };
  (lbImg.decode?lbImg.decode():Promise.resolve()).then(land,land);
}
function closeLB(){lb.hidden=true;lbImg.removeAttribute('src');lastFocus&&lastFocus.focus&&lastFocus.focus()}
$('#lbX').onclick=closeLB;$('#lbL').onclick=()=>{li=(li-1+LB.length)%LB.length;showLB()};$('#lbR').onclick=()=>{li=(li+1)%LB.length;showLB()};
lb.addEventListener('click',e=>{if(e.target===lb||e.target.id==='lbStage')closeLB()});
let moved=0;
lbImg.addEventListener('click',()=>{if(moved>5)return;if(z===1){z=2}else{z=1;tx=ty=0}setZ()});
$('#lbStage').addEventListener('wheel',e=>{e.preventDefault();z=Math.min(3,Math.max(1,z-e.deltaY*0.0015));if(z===1)tx=ty=0;setZ()},{passive:false});
let drag=null;lbImg.addEventListener('pointerdown',e=>{moved=0;if(z>1){drag=[e.clientX-tx,e.clientY-ty,e.clientX,e.clientY];lbImg.setPointerCapture(e.pointerId)}});
lbImg.addEventListener('pointermove',e=>{if(drag){tx=e.clientX-drag[0];ty=e.clientY-drag[1];moved=Math.hypot(e.clientX-drag[2],e.clientY-drag[3]);setZ()}});
lbImg.addEventListener('pointerup',()=>drag=null);
lb.addEventListener('keydown',e=>{if(e.key==='Tab'){const f=[...lb.querySelectorAll('button:not([hidden])')];const a=f.indexOf(document.activeElement);e.preventDefault();f[(a+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});

/* ---------- SPOTLIGHT ---------- */
function spotOn(p,sel,add){
  if(!add)p.querySelectorAll('.lit').forEach(e=>e.classList.remove('lit'));
  if(!sel){if(!add)p.classList.remove('spotting');return}
  p.querySelectorAll(sel).forEach(e=>e.classList.add('lit'));
  p.classList.add('spotting');
}
const spot=sel=>spotOn(pages[pi],sel), spotAdd=sel=>spotOn(pages[pi],sel,true);
const nth=(sel,n)=>sel+':nth-child('+n+')';

/* ---------- OPENING GLOBE ---------- */
const proSteps=$$('.pro-step'), proDots=$$('#proDots button');
let globe=null, ph=-1, divePromise=null, stepTl=null, globeReady;
const globeShown=new Promise(r=>globeReady=r);
try{if(window.THREE&&window.GEO_DOTS&&window.createGlobe)globe=createGlobe($('#globe'),$('#proLabels'),{reduce,onReady:globeReady})}catch(e){globe=null}
if(!globe){$('#africa').classList.add('nogl');globeReady()}
/* The first title waits for the fonts (so its lines split correctly) and for the globe to be running steadily. */
const introReady=Promise.race([Promise.all([(document.fonts&&document.fonts.ready)||Promise.resolve(),globeShown]),new Promise(r=>setTimeout(r,4000))]);
/* Step text changes on one timeline: the old words leave first, then the new headline rises line by line. */
function showStep(p,o){
  o=o||{};
  if(stepTl)stepTl.kill();
  const next=proSteps.find(s=>+s.dataset.ph===p), prev=proSteps.filter(s=>s!==next&&s.classList.contains('on'));
  proSteps.forEach(s=>s.classList.toggle('on',s===next));
  if(!next){stepTl=gsap.to(prev,{autoAlpha:0,duration:.45,ease:'power2.in'});return}
  const h=next.querySelector('h1'), rest=[...next.children].filter(e=>e!==h);
  if(reduce||o.instant){gsap.set(prev,{autoAlpha:0});gsap.set(next,{autoAlpha:1});gsap.set(rest,{clearProps:'opacity,visibility,transform'});return}
  if(!h._split&&window.SplitText)h._split=new SplitText(h,{type:'lines',mask:'lines',linesClass:'split-line'});
  const lines=h._split?h._split.lines:[h];
  const tl=stepTl=gsap.timeline();
  if(prev.length)tl.to(prev,{autoAlpha:0,y:-10,duration:.42,ease:'power2.in'},0).set(prev,{y:0});
  tl.set(next,{autoAlpha:1},prev.length?.38:0)
    .fromTo(lines,{yPercent:112},{yPercent:0,duration:1.15,ease:'expo.out',stagger:.09},'<')
    .fromTo(rest,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.9,ease:'power3.out',stagger:.08},'<+.12');
}
function setPro(p,o){
  o=o||{};
  if(divePromise&&!o.force)return;
  if(p===ph&&!o.force)return;
  ph=p;
  proDots.forEach(b=>b.setAttribute('aria-current',String(+b.dataset.ph===p)));
  if(globe)globe.setPhase(p,o);
  if(o.waitIntro)introReady.then(()=>{if(ph===p&&!divePromise)showStep(p)});else showStep(p,o);
}
proDots.forEach(b=>b.onclick=()=>{userTookOver();setPro(+b.dataset.ph)});
/* The camera dives into the Cape Town waterfront and flies through the Hub's ring: the Hub render shows
   through the ring's opening and fills the screen as the camera passes. The opening is a circular layer that is
   moved and scaled each frame (nothing is repainted), and it crossfades into the cover slide after the cut. */
const flash=$('#diveFlash'), hole=flash.firstElementChild, holeImg=hole.firstElementChild;
let diveTick=null;
function holeAt(x,y,r,z,Rh,cx,cy){
  const s=Math.max(r,.01)/Rh, k=z/s, tx=(cx*(1-z)-(x-r))/s, ty=(cy*(1-z)-(y-r))/s;
  hole.style.transform='translate3d('+(x-r).toFixed(2)+'px,'+(y-r).toFixed(2)+'px,0) scale('+s.toFixed(6)+')';
  holeImg.style.transform='translate3d('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px,0) scale('+k.toFixed(6)+')';
}
function runDive(){
  if(divePromise)return divePromise;
  showStep(-1);
  gsap.to('#africa .pro-scrim,#africa .pro-foot',{opacity:0,duration:.6});
  const W=deck.clientWidth, H=deck.clientHeight, D=Math.ceil(2*Math.hypot(W,H)), Rh=D/2, cx=W/2, cy=H/2;
  hole.style.width=hole.style.height=D+'px'; holeImg.style.width=W+'px'; holeImg.style.height=H+'px';
  gsap.killTweensOf([flash,hole]);
  if(!globe||reduce){
    holeAt(cx,cy,Rh,1,Rh,cx,cy);
    gsap.set(flash,{autoAlpha:0}); gsap.set(hole,{opacity:1});
    divePromise=new Promise(res=>gsap.to(flash,{autoAlpha:1,duration:reduce?.01:.8,ease:'power2.inOut',onComplete:res}));
    return divePromise;
  }
  const cam=globe.dive(); let done=false, el=0; cam.then(()=>{done=true});
  gsap.set(flash,{autoAlpha:1}); gsap.set(hole,{opacity:0});
  divePromise=new Promise(res=>{
    diveTick=(t,dt)=>{
      el+=dt/1000;
      const h=globe.hubHole();
      if(el>.5){hole.style.opacity=Math.min(1,(el-.5)/.3).toFixed(3);holeAt(h.x,h.y,h.r,1.12-.12*Math.min(1,el/2.6),Rh,cx,cy)}
      if(done){holeAt(cx,cy,Rh,1,Rh,cx,cy);hole.style.opacity='1';gsap.ticker.remove(diveTick);diveTick=null;res()}
    };
    gsap.ticker.add(diveTick);
  });
  return divePromise;
}
function endFlash(){gsap.to(flash,{autoAlpha:0,duration:.9,delay:.12,ease:'power1.inOut'})}
function resetDive(){
  divePromise=null; if(diveTick){gsap.ticker.remove(diveTick);diveTick=null}
  gsap.killTweensOf([flash,hole]); gsap.set(flash,{autoAlpha:0});
  gsap.to('#africa .pro-scrim,#africa .pro-foot',{opacity:1,duration:.6});
}

/* ---------- VOICEOVER CUES ----------
   The words live in voiceover.js. Each line here gets its visual cue, matched by position,
   and optional word cues, [word, action], which fire as the voice reaches that word. */
const C=(cue,at)=>({cue,at:at||[]});
const CUES={
 africa:[C(()=>setPro(1)),C(()=>setPro(1)),C(()=>setPro(1),[['front',()=>setPro(2)]]),C(()=>setPro(2)),C(()=>setPro(2),[['Cape',runDive]])],
 vision:[C(()=>goHero(0)),C(()=>goHero(0)),C(()=>goHero(1)),C(()=>goHero(2)),
  C(()=>spot(nth('.strip .wrap>div',1)),[['7,900',()=>spotAdd(nth('.strip .wrap>div',2))],['Three',()=>spotAdd(nth('.strip .wrap>div',3))],['One',()=>spotAdd(nth('.strip .wrap>div',4))]])],
 question:[C(()=>spot('.quote')),C(()=>spot(nth('.gap',1))),C(()=>spot(nth('.gap',2))),C(()=>spot(nth('.gap',3)))],
 model:[C(()=>{hlSite(null);spot('.mcol .head')}),C(()=>hlSite('hub')),C(()=>hlSite('centre')),C(()=>hlSite('spoke')),C(()=>{hlSite(null);spot('.map')})],
 journey:[C(()=>{goJ(0);spot('.jhead')})].concat(J.map((_,i)=>C(()=>goJ(i)))).concat([C(()=>spot('.curve'))]),
 sites:[
  C(()=>{openSite('hub');viewImg(0)}),C(()=>{openSite('hub');viewImg(3)}),C(()=>{openSite('hub');viewImg(7)}),C(()=>{openSite('hub');viewImg(12)}),
  C(()=>{openSite('centre');viewImg(0)}),C(()=>{openSite('centre');viewImg(2)},[['collaboration',()=>viewImg(7)]]),
  C(()=>{openSite('spoke');viewImg(0)}),C(()=>{openSite('spoke');viewImg(1)})],
 brief:[
  C(()=>{openSite('hub');showPlan(0);hlZone(null)}),C(()=>{openSite('hub');hlZone('Marine learning commons')}),
  C(()=>{openSite('hub');hlZone(null);showPlan(0)},[['floor',()=>showPlan(1)],['by',()=>showPlan(2)],['floor',()=>showPlan(3)]]),
  C(()=>{openSite('centre');hlZone('Learning commons and study')}),C(()=>{openSite('spoke');hlZone(null)}),C(()=>hlZone('u'))],
 capital:[C(()=>spot('.ccol .head')),C(()=>spot(nth('.kpis>div',2)),[['7,900',()=>spotAdd(nth('.kpis>div',1))],['87%',()=>spot(nth('.kpis>div',3))]]),C(()=>spot('#mixCard')),C(()=>spot('#kitCard'))],
 levers:[C(()=>spot('.head')),C(()=>spot(nth('.lever',1))),C(()=>spot(nth('.lever',2))),C(()=>spot(nth('.lever',3)))],
 gates:[C(()=>spot('.head'),[['Gate',()=>spot(nth('.gate',1))]]),C(()=>spot(nth('.gate',2))),C(()=>spot(nth('.gate',3))),C(()=>spot(nth('.gate',4))),C(()=>spot(nth('.gate',5))),C(()=>spot('#riskCard'))],
 ask:[C(()=>spot('h2')),C(()=>spot('.lede')),C(()=>spot('.next>div'),[['cost',()=>spot(nth('.next>div',1))],['enrolment',()=>spotAdd(nth('.next>div',2))],['partners',()=>spotAdd(nth('.next>div',3))]])],
 gallery:[C(()=>{setFilter('all');[['hub',2400],['centre',4400],['spoke',6400]].forEach(([s,t])=>fxAt(t,()=>setFilter(s)))}),C(()=>setFilter('all'))]
};

/* Each line is split into words. The voice gets the pronunciation fixes from voiceover.js,
   and every caption word keeps its character range in the spoken text so either can find the other. */
const PRON=(window.VO_PRON||[]).map(([p,f,r])=>[new RegExp(p,f),r]);
const REC=(window.VO_TIMINGS&&window.VO_TIMINGS.lines)||{};
const MUSIC=window.VO_TIMINGS&&window.VO_TIMINGS.music;
function hashText(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
const norm=t=>t.replace(/^[“"‘'(]+|[.,:;!?”"’')]+$/g,'');
function buildLine(id,i,say){
  const toks=say.split(/\s+/).filter(Boolean), ranges=[]; let sp='';
  toks.forEach((t,k)=>{let s=t;PRON.forEach(([re,r])=>{re.lastIndex=0;s=s.replace(re,r)});if(k)sp+=' ';ranges.push([sp.length,sp.length+s.length]);sp+=s});
  const c=(CUES[id]||[])[i]||{}, at=[]; let from=0;
  (c.at||[]).forEach(([w,fn])=>{const k=toks.findIndex((t,j)=>j>=from&&norm(t)===w);if(k>=0){at.push([k,fn]);from=k+1}});
  const parts=[], re=/[^.!?]+[.!?]*["”’]?\s*/g; let m;
  while((m=re.exec(sp)))if(m[0].trim())parts.push({off:m.index,text:m[0]});
  const key=id+'-'+pad(i+1), rec=REC[key];
  return {key,say,cue:c.cue,at,toks,ranges,parts:parts.length?parts:[{off:0,text:sp}],rec:rec&&rec.h===hashText(say)?rec:null};
}
const SCRIPT={};
IDS.forEach(id=>{SCRIPT[id]=((window.VO_LINES||{})[id]||[]).map((s,i)=>buildLine(id,i,s))});
const ALL=IDS.flatMap(id=>SCRIPT[id]);
const recorded=ALL.length>0&&ALL.every(c=>c.rec);
const totalWords=ALL.reduce((a,c)=>a+c.toks.length,0);
$('#ctaMin').textContent='About '+Math.round(totalWords/150)+' min';

/* ---------- VOICEOVER ENGINE ----------
   Three ways to speak a line, in order of preference: the ElevenLabs recording with its word timings,
   the browser's own voice, or captions alone on a timer. All three move the caption word by word. */
const hasSynth='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
const KEEP=[];
/* One audio element for every recorded line, so mobile browsers that unlock audio on the first tap keep it unlocked. */
let AEL=null; const audioEl=()=>AEL||(AEL=new Audio());
/* Mobile Safari only lets speech start from a tap, so the first Play speaks a silent utterance straight away. */
function unlockSpeech(){if(!hasSynth||vo.unlocked||recorded)return;vo.unlocked=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}
const cues=()=>SCRIPT[IDS[pi]]||[];
const voBtn=$('#voBtn'), capEl=$('#cap'), voLabel=$('#voLabel');
const ICON={play:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1.5l11 6.5-11 6.5z"/></svg>',pause:'<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.5" height="12" rx=".5"/><rect x="9.5" y="2" width="3.5" height="12" rx=".5"/></svg>',again:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.5 8A5.5 5.5 0 1 1 11.6 3.8"/><path d="M12 1v3.5H8.5"/></svg>'};
let capWords=[], lastCap='';
const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setCap(t,sys){capEl.className=sys?'sys':'';capEl.textContent=t;capWords=[];lastCap=t;sendState()}
function capLine(c){capEl.className='';capEl.innerHTML=c.toks.map(t=>'<span class="w">'+esc(t)+'</span>').join(' ');capWords=[...capEl.children];lastCap=c.say;sendState()}
const wordsMode=on=>capEl.classList.toggle('words',on);
function setWord(i){
  if(i<=vo.wi)return; vo.wi=i;
  for(let k=0;k<=i&&k<capWords.length;k++)capWords[k].classList.add('on');
  const c=cues()[vo.ci]; if(!c)return;
  while(vo.fired<c.at.length&&c.at[vo.fired][0]<=i){const f=c.at[vo.fired++][1];try{f()}catch(e){}}
}
function updProg(){const n=cues().length,on=vo.state==='playing'||vo.state==='paused';$('#cueBar').style.transform='scaleX('+(on&&n?Math.min(1,(vo.ci+1)/n):0).toFixed(4)+')'}
function ui(){
  const s=vo.state, b=document.body;
  b.classList.toggle('vo-playing',s==='playing');b.classList.toggle('vo-paused',s==='paused');b.classList.toggle('vo-active',s==='playing'||s==='paused');
  voBtn.innerHTML=s==='playing'?ICON.pause:s==='ended'?ICON.again:ICON.play;
  voBtn.setAttribute('aria-label',s==='playing'?'Pause voiceover':s==='ended'?'Replay voiceover':s==='paused'?'Resume voiceover':'Play voiceover');
  const eng=vo.engine==='captions'?'Captions only, no speech voice on this device':vo.engine==='voice'?'Voiceover · browser voice':'Voiceover';
  const n=cues().length;
  voLabel.textContent=s==='idle'?'Voiceover':s==='ended'?'Voiceover finished':(s==='paused'?'Paused · ':'')+eng+(n?' · line '+Math.min(vo.ci+1,n)+' of '+n:'');
  updProg(); sendState();
}
function idleCap(){setCap('Press play for the narrated tour. It moves through the slides and pauses whenever you need it to.',true)}
function halt(keep){
  vo.tok++; clearTimeout(vo.timer); clearTimeout(vo.tt); cancelAnimationFrame(vo.raf); vo.fx.forEach(clearTimeout); vo.fx=[];
  if(hasSynth)try{speechSynthesis.cancel()}catch(e){}
  if(vo.audio){vo.audio.pause();if(!keep){vo.audio.dataset.key='';vo.audio=null}}
  if(vo.tStart){vo.tDone+=performance.now()-vo.tStart;vo.tStart=0}
  if(!keep){vo.part=0;vo.pos=0;vo.wi=-1;vo.fired=0;vo.tDone=0;vo.tTotal=null}
}
function later(fn,ms){const t=vo.tok;vo.timer=setTimeout(()=>{if(t===vo.tok)fn()},ms)}
function fxAt(ms,fn){if(vo.state!=='playing')return;const t=vo.tok;vo.fx.push(setTimeout(()=>{if(t===vo.tok&&vo.state==='playing')fn()},ms/vo.rate))}
function applyCue(c){spot(null);if(c&&c.cue)c.cue()}
function runCue(){
  if(vo.state!=='playing')return;
  const list=cues();
  if(vo.ci>=list.length)return slideDone();
  const c=list[vo.ci];
  vo.fx.forEach(clearTimeout);vo.fx=[];
  applyCue(c); capLine(c); wordsMode(false);
  /* On resume, replay the highlights and word cues up to where the voice stopped. */
  const w=vo.wi; vo.wi=-1; vo.fired=0; if(w>=0){wordsMode(true);setWord(w)}
  ui(); duck(true);
  speak(c,()=>{setWord(c.toks.length-1);vo.ci++;vo.part=0;vo.pos=0;vo.wi=-1;vo.fired=0;vo.tDone=0;vo.tTotal=null;later(runCue,420)});
}
function slideDone(){
  spot(null); duck(false);
  if(pi>=N-1){halt();vo.state='ended';vo.ci=0;ui();bedPause();setCap('That is the end of the narrated tour. Press play to hear it again, or explore the gallery.',true);return}
  if(!vo.auto){vo.waiting=true;ui();setCap('Press the next arrow to continue the tour.',true);return}
  const o={vo:true}; if(IDS[pi]==='model')o.morph='hub';
  later(()=>go(pi+1,o),IDS[pi]==='africa'?0:900);
}
function speak(c,done){
  if(c.rec&&!c.noFile)return playFile(c,done);
  if(hasSynth&&!vo.synthBroken)return ttsPart(c,done);
  timed(c,done);
}
function playFile(c,done){
  const a=audioEl(), t=vo.tok, W=c.rec.w;
  if(a.dataset.key!==c.key){a.src='audio/'+c.key+'.mp3';a.dataset.key=c.key}
  vo.audio=a;
  const fallback=()=>{if(t!==vo.tok)return;c.noFile=true;a.dataset.key='';vo.audio=null;speak(c,done)};
  let live=true;
  a.onended=()=>{if(t!==vo.tok||!live)return;live=false;cancelAnimationFrame(vo.raf);a.dataset.key='';vo.audio=null;done()};
  a.onerror=fallback;
  a.playbackRate=vo.rate;
  a.play().then(()=>{
    if(t!==vo.tok)return; setEngine('file'); wordsMode(true);
    const loop=()=>{if(t!==vo.tok||!live)return;const ct=a.currentTime;let k=vo.wi;while(k+1<W.length&&W[k+1][0]<=ct+.04)k++;if(k>vo.wi)setWord(k);vo.raf=requestAnimationFrame(loop)};
    loop();
  }).catch(err=>{if(err&&err.name==='AbortError')return;fallback()});
}
function ttsPart(c,done){
  const t=vo.tok, ps=c.parts;
  if(vo.part>=ps.length){vo.part=0;vo.pos=0;done();return}
  const part=ps[vo.part], base=vo.pos, u=new SpeechSynthesisUtterance(part.text.slice(base));
  if(vo.voice){u.voice=vo.voice;u.lang=vo.voice.lang}else u.lang='en-GB';
  u.rate=vo.rate; let started=false;
  const toWord=g=>{let k=c.ranges.findIndex(r=>g<r[1]);return k<0?c.ranges.length-1:k};
  const fail=()=>{if(t!==vo.tok)return;vo.synthBroken=true;try{speechSynthesis.cancel()}catch(e){}timed(c,done)};
  u.onstart=()=>{started=true;setEngine('voice')};
  u.onboundary=e=>{if(t!==vo.tok||e.name==='sentence'||!(e.charIndex>=0))return;vo.pos=base+e.charIndex;wordsMode(true);setWord(toWord(part.off+vo.pos))};
  u.onend=()=>{if(t!==vo.tok)return;setWord(toWord(part.off+part.text.trimEnd().length-1));vo.part++;vo.pos=0;ttsPart(c,done)};
  u.onerror=e=>{if(t!==vo.tok||e.error==='interrupted'||e.error==='canceled')return;fail()};
  KEEP.push(u);if(KEEP.length>6)KEEP.shift();
  vo.tt=setTimeout(()=>{if(t!==vo.tok)return;try{speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){fail();return}
    vo.tt=setTimeout(()=>{if(t===vo.tok&&!started)fail()},4500)},60);
}
function timed(c,done){
  setEngine('captions'); wordsMode(true);
  const n=c.toks.length;
  if(vo.tTotal==null){vo.tTotal=(n/2.6*1000+500)/vo.rate;vo.tDone=0}
  vo.tStart=performance.now(); const t=vo.tok;
  const loop=()=>{if(t!==vo.tok)return;const el=vo.tDone+performance.now()-vo.tStart;setWord(Math.min(n-1,Math.floor(el/vo.tTotal*n*1.06)));
    if(el>=vo.tTotal){vo.tStart=0;vo.tTotal=null;vo.tDone=0;done();return}vo.raf=requestAnimationFrame(loop)};
  loop();
}
function setEngine(e){if(vo.engine!==e){vo.engine=e;ui()}}

/* Optional music under the voice: audio/music.mp3, listed in timings.js. It dips while a line is spoken. */
let bed=null;
function bedPlay(){if(!MUSIC)return;if(!bed){bed=new Audio(MUSIC);bed.loop=true;bed.volume=0;bed.onerror=()=>{bed=null}}bed.play().catch(()=>{});duck(false)}
function bedPause(){if(!bed)return;gsap.to(bed,{volume:0,duration:.6,overwrite:true,onComplete:()=>{if(bed&&vo.state!=='playing')bed.pause()}})}
function duck(speaking){if(!bed||vo.state!=='playing')return;gsap.to(bed,{volume:speaking?.05:.14,duration:speaking?.4:1.4,overwrite:true})}

function voPlay(){
  if(vo.state==='playing')return;
  unlockSpeech(); setPause(true); bedPlay();
  if(vo.state==='ended'){vo.state='playing';ui();go(0,{vo:true,force:true});return}
  const wasIdle=vo.state==='idle';
  vo.state='playing';
  if(wasIdle){halt();vo.ci=0}
  closePops();
  if(vo.waiting){vo.waiting=false;ui();go(pi+1,{vo:true});return}
  ui(); runCue();
}
function voPause(){if(vo.state!=='playing')return;halt(true);vo.state='paused';ui();bedPause()}
function voToggle(){vo.state==='playing'?voPause():voPlay()}
/* A click on a tab, thumbnail or stage while the voiceover plays hands control to the viewer. */
function userTookOver(){if(vo.state==='playing'){voPause();setCap('Paused while you explore. Press play to carry on from here.',true)}}
function voSkip(dir){
  const list=cues(), wasPlaying=vo.state==='playing';
  halt(); vo.waiting=false;
  const ci=vo.ci+dir;
  if(ci>=list.length){if(pi<N-1)go(pi+1,{vo:true});else if(wasPlaying)slideDone();return}
  if(ci<0){if(pi>0)go(pi-1,{vo:true,voCue:'last'});return}
  vo.ci=ci;
  if(wasPlaying)runCue();
  else{applyCue(list[ci]);capLine(list[ci]);ui()}
}
function voSlideChanged(o){
  if(vo.state==='idle')return;
  if(vo.state==='ended'&&!o.vo){vo.state='idle';ui();idleCap();return}
  halt(); vo.waiting=false;
  vo.ci=o.voCue==='last'?Math.max(0,cues().length-1):0;
  if(vo.state==='playing')later(runCue,o.cut?450:o.vo?800:900);
  else{const c=cues()[vo.ci];if(c)capLine(c);ui()}
}
voBtn.onclick=voToggle;
$('#heroCta').onclick=voPlay;
addEventListener('pagehide',()=>{if(hasSynth)try{speechSynthesis.cancel()}catch(e){}});

/* Browser voice choice: prefer South African or British English, then the most natural sounding voice. */
function scoreVoice(v){
  const n=v.name,l=(v.lang||'').replace('_','-');let s=0;
  if(/^en-ZA/i.test(l))s+=40;else if(/^en-GB/i.test(l))s+=30;else if(/^en-(AU|IE|NZ)/i.test(l))s+=14;else if(/^en/i.test(l))s+=8;
  if(/natural|neural|online|premium|enhanced/i.test(n))s+=45;
  if(/google/i.test(n))s+=18;
  if(/sonia|libby|ryan|leah|thomas|maisie|daniel|serena|kate|arthur|martha|stephanie|oliver|luke/i.test(n))s+=10;
  if(/compact|espeak|eloquence|novelty|whisper|bells|zarvox|bad news|good news|organ|trinoids|jester|cellos|bubbles|boing|albert|fred|junior|ralph|kathy|superstar|grandma|grandpa|rocko|shelley|sandy|flo|reed|eddy/i.test(n))s-=60;
  return s;
}
function loadVoices(){
  if(!hasSynth)return;
  const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang||'')).sort((a,b)=>scoreVoice(b)-scoreVoice(a)).slice(0,14);
  vo.voices=vs;
  const saved=store.get('vo.voice');
  vo.voice=vs.find(v=>v.voiceURI===saved)||vs[0]||null;
  $('#voVoice').innerHTML=vs.length?vs.map((v,i)=>'<option value="'+i+'"'+(v===vo.voice?' selected':'')+'>'+v.name.replace(/^Microsoft |^Google /,'').replace(/ Online \(Natural\)/,' (natural)')+' · '+v.lang+'</option>').join(''):'<option>Default voice</option>';
}
if(hasSynth){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices)}catch(e){speechSynthesis.onvoiceschanged=loadVoices}}
$('#voVoice').onchange=e=>{const v=vo.voices[+e.target.value];if(!v)return;vo.voice=v;store.set('vo.voice',v.voiceURI);vo.synthBroken=false;if(vo.state==='playing'){halt(true);vo.pos=0;runCue()}};
$('#voRate').onchange=e=>{vo.rate=+e.target.value;store.set('vo.rate',vo.rate);if(vo.state==='playing'){halt(true);vo.tTotal=null;vo.tDone=0;runCue()}};
$('#voAuto').onchange=e=>{vo.auto=e.target.checked;store.set('vo.auto',vo.auto?'1':'0')};
(function(){const r=+store.get('vo.rate');if(r>=.5&&r<=2){vo.rate=r;$('#voRate').value=String(r)}if(store.get('vo.auto')==='0'){vo.auto=false;$('#voAuto').checked=false}})();
$('#voiceFld').hidden=!hasSynth||recorded;
$('#voInfo').textContent=recorded?'Recorded voiceover. Captions follow the voice word by word.':hasSynth?'Uses a voice built into this browser until the recorded voiceover is added. Edge and Chrome offer the most natural voices.':'This browser has no speech voices, so the tour runs with captions only.';

/* ---------- TRANSITIONS ----------
   Slides normally slide sideways. Three moves carry meaning across a cut:
   the globe dives into the Hub, a site's figure travels from the model into its own slide,
   and the Gate one circle opens into the decision we request. Finance slides only fade. */
const STAG='.gaps,.kpis,.levers,.next,.model,.mcol,.site-top,.site-low,.capgrid,.ccol,.stackcards,.risks';
const CALM=['capital','levers','gates','ask'];
pages.forEach((p,i)=>{
  if(CALM.includes(p.id))p.classList.add('calm');
  const n=p.querySelector('.sheet .n'); if(n)n.textContent=pad(i+1)+' / '+pad(N);
  let d=0; const add=el=>{if(el.matches(STAG))[...el.children].forEach(add);else{el.classList.add('rv');if(el.matches('.head,.rowhead,.quote'))el.classList.add('rv-soft');el.style.setProperty('--d',d++)}};
  const w=p.querySelector(':scope>.wrap'); if(w)[...w.children].forEach(add);
});
/* Headlines rise line by line on story slides. */
let splitGen=0;
addEventListener('resize',()=>splitGen++);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>splitGen++);
function headline(p){
  if(reduce||!window.SplitText||p.classList.contains('calm'))return;
  p.querySelectorAll('.head h2,.quote').forEach(h=>{
    let sp=h._split;
    if(!sp||sp._gen!==splitGen){if(sp)sp.revert();sp=new SplitText(h,{type:'lines',mask:'lines',linesClass:'split-line'});sp._gen=splitGen;h._split=sp}
    gsap.fromTo(sp.lines,{yPercent:110},{yPercent:0,duration:1.1,ease:'expo.out',stagger:.09,delay:.22,overwrite:true});
  });
}
/* A site's floor area travels from its row on the model slide to the site slide. */
function morphTier(k,cut){
  const tier=$('#tiers .tier[data-site="'+k+'"]');
  if(!tier||reduce){cut();return Promise.resolve()}
  const num=tier.querySelector('.m2'), r0=tier.getBoundingClientRect(), n0=num.getBoundingClientRect();
  const box=document.createElement('div'); box.className='morph'; box.style.setProperty('--acc',ACC[k]);
  Object.assign(box.style,{left:r0.left+'px',top:r0.top+'px',width:r0.width+'px',height:r0.height+'px'});
  const b=document.createElement('b'); b.className='morph-num'; b.textContent=fmt(SITES[k].area);
  Object.assign(b.style,{position:'fixed',zIndex:91,left:n0.left+'px',top:n0.top+'px',fontSize:getComputedStyle(num).fontSize,fontFamily:'var(--display)',fontStretch:'115%',fontWeight:750,lineHeight:1,pointerEvents:'none'});
  document.body.append(box,b);
  cut();
  const facts=$('#sitePanel .site-facts'), big=facts&&facts.querySelector('.big');
  if(!big){box.remove();b.remove();return Promise.resolve()}
  facts.classList.add('no-anim'); facts.style.visibility='hidden';
  const r1=facts.getBoundingClientRect(), n1=big.getBoundingClientRect(), fs=getComputedStyle(big).fontSize;
  return new Promise(res=>{
    gsap.timeline({onComplete:()=>{facts.style.visibility='';gsap.to([box,b],{opacity:0,duration:.3,onComplete:()=>{box.remove();b.remove();facts.classList.remove('no-anim');res()}})}})
      .to(box,{left:r1.left,top:r1.top,width:r1.width,height:r1.height,borderRadius:16,duration:1,ease:'expo.inOut'},0)
      .to(b,{left:n1.left,top:n1.top,fontSize:fs,duration:1,ease:'expo.inOut'},0);
  });
}
/* Gate one is today's decision: its circle opens out into the ask. */
function revealAsk(){
  const g=$('#gates .gate.now .g');
  if(!g||reduce)return Promise.resolve();
  const r=g.getBoundingClientRect(), d=deck.getBoundingClientRect();
  const cx=r.left+r.width/2-d.left, cy=r.top+r.height/2-d.top, R=Math.hypot(Math.max(cx,d.width-cx),Math.max(cy,d.height-cy));
  const c=document.createElement('div'); c.className='reveal'; deck.appendChild(c);
  const at=' at '+cx.toFixed(1)+'px '+cy.toFixed(1)+'px)';
  return new Promise(res=>gsap.fromTo(c,{clipPath:'circle(22px'+at,backgroundColor:'#e3241b'},{clipPath:'circle('+(R+40).toFixed(0)+'px'+at,backgroundColor:'#930000',duration:1.05,ease:'power2.inOut',
    onComplete:()=>{res();gsap.to(c,{opacity:0,duration:.6,delay:.1,onComplete:()=>c.remove()})}}));
}

/* ---------- DECK NAVIGATION ---------- */
let counted=false, busy=false, farTimer=0;
function runCounters(){
  if(reduce||counted)return; counted=true;
  $$('[data-count]').forEach(el=>{const to=+el.dataset.count,m2=el.dataset.fmt==='m2',t=performance.now();if(to<10)return;(function f(n){const p=Math.min(1,(n-t)/1400),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=fmt(v)+(m2?' m²':'');if(p<1)requestAnimationFrame(f)})(t)});
}
function enter(p,dir,o){
  p.querySelectorAll('.arm-target').forEach(el=>{el.classList.add('arm');void el.offsetWidth;setTimeout(()=>el.classList.remove('arm'),reduce?0:500)});
  if(p.id==='africa'){resetDive();if(!o.vo)setPro(o.step&&o.prev===IX('vision')?2:0,{force:true,waitIntro:!!o.instant})}
  if(p.id==='vision'){runCounters();p.classList.toggle('from-dive',!!o.cut&&IDS[pi-1]==='africa');if(o.cut)goHero(0)}
  if(p.id==='model')hlSite(null);
  if(p.id==='brief')hlZone(null);
  if(o.vo||o.keepSite)return;
  if(p.id==='journey')goJ(dir>0?0:J.length-1);
  if(p.id==='sites'||p.id==='brief')openSite(dir>0?'hub':'spoke');
}
function go(i,o={}){
  i=Math.max(0,Math.min(N-1,i));
  if(busy||(i===pi&&!o.force))return;
  const from=IDS[pi], to=IDS[i], fwd=i>pi;
  if(!o.instant&&fwd){
    if(from==='africa'&&to==='vision'){busy=true;runDive().then(()=>{busy=false;commit(i,Object.assign({},o,{cut:true}));endFlash()});return}
    if(from==='gates'&&to==='ask'&&!reduce){busy=true;revealAsk().then(()=>{busy=false;commit(i,Object.assign({},o,{cut:true}))});return}
    if(from==='model'&&to==='sites'&&o.morph){busy=true;openSite(o.morph);morphTier(o.morph,()=>commit(i,Object.assign({},o,{cut:true,keepSite:true}))).then(()=>busy=false);return}
  }
  commit(i,o);
}
function commit(i,o){
  const prev=pi, dir=i>=prev?1:-1, cut=o.instant||o.cut; pi=i;
  deck.classList.toggle('back',dir<0);
  if(cut)track.style.transition='none';
  track.style.transform='translate3d('+(-i*100)+'%,0,0)';
  if(cut){void track.offsetWidth;track.style.transition=''}
  pages.forEach((p,k)=>{const on=k===i;p.inert=!on;p.setAttribute('aria-hidden',String(!on));if(!on){p.classList.remove('in');spotOn(p,null)}});
  /* Only the current slide, its neighbours and the slide being left are painted, so the browser
     never prepares all twelve slides at once while something is moving. */
  pages.forEach((p,k)=>p.classList.toggle('far',Math.abs(k-i)>1&&k!==prev));
  clearTimeout(farTimer); farTimer=setTimeout(()=>pages.forEach((p,k)=>p.classList.toggle('far',Math.abs(k-pi)>1)),1100);
  const p=pages[i]; p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
  if(prev!==i){const pp=pages[prev];setTimeout(()=>{if(pi!==prev)pp.scrollTop=0},950)}
  p.scrollTop=0;
  if(globe){if(IDS[i]==='africa')globe.start();else setTimeout(()=>{if(IDS[pi]!=='africa')globe.stop()},cut?60:1000)}
  enter(p,dir,Object.assign({prev},o)); headline(p);
  updUI();
  if(!o.fromHash)try{history.replaceState(null,'','#'+p.id)}catch(e){}
  voSlideChanged(o);
}
function step(dir){
  if(busy)return;
  if(vo.state==='playing'||vo.state==='paused'){voSkip(dir);return}
  const id=IDS[pi];
  if(id==='africa'){if(dir>0&&ph<2){setPro(ph+1);return}if(dir<0&&ph>0){setPro(ph-1);return}}
  if(id==='vision'){if(dir>0&&hi<2){setPause(true);goHero(hi+1);return}if(dir<0&&hi>0){setPause(true);goHero(hi-1);return}}
  if(id==='journey'){if(dir>0&&ji<J.length-1){goJ(ji+1);return}if(dir<0&&ji>0){goJ(ji-1);return}}
  if(id==='sites'||id==='brief'){const i=SK.indexOf(cur);if(dir>0&&i<2){openSite(SK[i+1]);return}if(dir<0&&i>0){openSite(SK[i-1]);return}}
  go(pi+dir,{step:true});
}
const NOTES={
 africa:['Opening','Let the globe turn once in silence, or press play for the narrated tour. Step with the arrows: Africa at a distance, then the three front doors. The next step dives into Cape Town.','Takeaway: this is a network for a continent, not a building.'],
 vision:['The three sites','Let the three images run once. Then say: this is One UNISA, three sites and one system.','Takeaway: this is a network, not a building.'],
 question:['The question','Frame the problem in the student’s terms. UNISA has the content. What students lack is a place to be supported, to research and to meet industry.','Takeaway: the gap is presence, not curriculum.'],
 model:['The model','Walk the map from Cape Town to Mahikeng to Mthatha. Point to the bars: each site is sized to its community and all three plug into the main campus backbone. Click a site to open it.','Takeaway: scale follows the catchment, the backbone is shared.'],
 journey:['Student journey','Use the arrow keys to step through all eight stages. At each one, read the student line, then the line in yellow. Stress that the system acts before the student asks.','Takeaway: the buildings deliver a service model, and every stage has a measure.'],
 sites:['The three sites','Step through the Hub, the Centre and the Spoke with the arrow keys. Open any render full screen to answer questions about a space.','Takeaway: each site is designed for its niche and its community.'],
 brief:['The brief','For the CFO, linger on the brief: every square metre is named, and the balance for circulation is declared openly.','Takeaway: the brief is specific enough to cost.'],
 capital:['Case for capital','Slow down. This is the slide the CFO will judge. Start with the numbers: 87% of the gross area is already allocated to named functions.','Takeaway: one repeatable model, specified once.'],
 levers:['Three levers','Make three points: one repeatable model, space measured by use, and new partnership income.','Takeaway: every lever has a measure.'],
 gates:['Gates and risks','Walk the gates left to right, then the risks. Gate one is the only decision today.','Takeaway: no capital is released without evidence from the previous gate.'],
 ask:['The ask','State the request once, clearly, then stop talking and wait.','Takeaway: we ask for a gated first phase, not the full programme.'],
 gallery:['Questions','Keep this open during questions. Filter by site to answer any question about what a space looks like in seconds.','Takeaway: let the board explore.']
};
function updUI(){
  $('#dPos').textContent=pad(pi+1)+' / '+pad(N);
  $('#progBar').style.transform='scaleX('+((pi+1)/N).toFixed(4)+')';
  const chap=pages[pi].dataset.chap;
  $$('.nav a').forEach(a=>a.setAttribute('aria-current',a.dataset.go===chap));
  const n=NOTES[IDS[pi]];$('#nTitle').textContent=pad(pi+1)+' · '+n[0];$('#nBody').textContent=n[1];$('#nTake').textContent=n[2];
  $('#dPrev').disabled=pi===0&&vo.state==='idle'&&ph===0;
  $('#dNext').disabled=pi===N-1&&vo.state==='idle';
  ui();
}
$$('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const i=IX(a.dataset.go);if(i>=0)go(i)}));
$('#dPrev').onclick=()=>step(-1);$('#dNext').onclick=()=>step(1);
addEventListener('hashchange',()=>{const i=IX(location.hash.slice(1));if(i>=0&&i!==pi)go(i,{fromHash:true})});

/* Swipe on touch screens */
let sw=null;
deck.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target.closest('.thumbs,.cs,.scroll-x,.zones'))return;sw=[e.clientX,e.clientY]});
deck.addEventListener('pointercancel',()=>sw=null);
deck.addEventListener('pointerup',e=>{if(!sw)return;const dx=e.clientX-sw[0],dy=e.clientY-sw[1];sw=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4)go(pi+(dx<0?1:-1),{step:true})});

/* Wheel and trackpad: a scroll gesture moves one slide; content taller than the screen scrolls first. */
let wLock=0, lastScroll=0;
pages.forEach(p=>p.addEventListener('scroll',()=>lastScroll=performance.now(),{passive:true}));
const canScroll=(el,dy)=>el&&getComputedStyle(el).overflowY!=='hidden'&&el.scrollHeight>el.clientHeight+2&&(dy>0?el.scrollTop+el.clientHeight<el.scrollHeight-2:el.scrollTop>0);
deck.addEventListener('wheel',e=>{
  if(!lb.hidden||e.ctrlKey)return;
  const now=performance.now(), dx=e.deltaX, dy=e.deltaY;
  const horiz=Math.abs(dx)>Math.abs(dy);
  if(horiz&&e.target.closest('.thumbs,.cs,.scroll-x'))return;
  if(!horiz&&(canScroll(e.target.closest('.zones,.info'),dy)||canScroll(pages[pi],dy)))return;
  e.preventDefault();
  if(now<wLock){wLock=Math.max(wLock,now+180);return}
  const d=horiz?dx:dy;
  if(now-lastScroll<350){lastScroll=now;return}
  if(Math.abs(d)<12)return;
  wLock=now+850;
  go(pi+(d>0?1:-1),{step:true});
},{passive:false});

/* ---------- PRESENTER VIEW, CLICKERS AND PHONE REMOTE ----------
   The presenter view is a second window opened from this one; they talk with postMessage.
   The phone remote works when tools/serve.mjs serves the deck. */
let presenter=null, remote=null, stTimer=0;
const TITLES=pages.map(p=>p.getAttribute('aria-label'));
function stateMsg(){
  const n=NOTES[IDS[pi]]||['','',''];
  return {ns:'oneunisa',type:'state',i:pi,n:N,ids:IDS,titles:TITLES,notes:n,black:!$('#blackout').hidden,
    vo:{state:vo.state,line:Math.min(vo.ci+1,cues().length),lines:cues().length,cap:lastCap},remote:remote?remote.info.phoneUrl:null};
}
function sendState(){
  clearTimeout(stTimer);
  stTimer=setTimeout(()=>{const m=stateMsg();try{if(presenter&&!presenter.closed)presenter.postMessage(m,'*')}catch(e){}if(remote)remote.send(m)},40);
}
function command(c,arg){
  if(c==='next')step(1);else if(c==='prev')step(-1);else if(c==='toggle')voToggle();else if(c==='play')voPlay();else if(c==='pause')voPause();
  else if(c==='go')go(+arg);else if(c==='black')toggleBlack();else if(c==='hello')sendState();
}
addEventListener('message',e=>{const d=e.data;if(d&&d.ns==='oneunisa'&&d.cmd)command(d.cmd,d.arg)});
function toggleBlack(force){const b=$('#blackout');b.hidden=force!=null?!force:!b.hidden;sendState()}
$('#blackout').onclick=()=>toggleBlack(false);
function openPresenter(){
  presenter=window.open('presenter.html','oneunisa-presenter','popup,width=1240,height=780');
  setTimeout(sendState,700);
  setCap('Presenter view opened. Move this window to the projector and press F for full screen.',true);
}
if(/^https?:$/.test(location.protocol))fetch('remote/info').then(r=>r.ok?r.json():null).then(info=>{
  if(!info||!info.token)return;
  const es=new EventSource('remote/events?role=deck&t='+encodeURIComponent(info.token));
  es.onmessage=e=>{try{const d=JSON.parse(e.data);if(d.cmd)command(d.cmd,d.arg)}catch(_){}};
  remote={info,send:m=>fetch('remote/state?t='+encodeURIComponent(info.token),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(m)}).catch(()=>{})};
  sendState();
}).catch(()=>{});

/* ---------- POPOVERS AND KEYS ---------- */
const notes=$('#notes'),help=$('#help'),sets=$('#settings');
function closePops(){[notes,help,sets].forEach(p=>p.hidden=true);syncPops()}
function syncPops(){$('#dNotes').setAttribute('aria-pressed',!notes.hidden);$('#dHelp').setAttribute('aria-pressed',!help.hidden);$('#dSet').setAttribute('aria-pressed',!sets.hidden)}
function tog(p){const open=p.hidden;[notes,help,sets].forEach(x=>x.hidden=true);p.hidden=!open;syncPops()}
$('#dNotes').onclick=()=>tog(notes);$('#dHelp').onclick=()=>tog(help);$('#dSet').onclick=()=>tog(sets);
function setCC(on){document.body.classList.toggle('no-cc',!on);$('#dCC').setAttribute('aria-pressed',on);store.set('vo.cc',on?'1':'0')}
$('#dCC').onclick=()=>setCC(document.body.classList.contains('no-cc'));
setCC(store.get('vo.cc')!=='0');
const full=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}};
$('#dFull').onclick=full;
$('#presentBtn').onclick=openPresenter;
addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea,select'))return;
  if(!lb.hidden){if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')$('#lbR').click();if(e.key==='ArrowLeft')$('#lbL').click();return}
  if(e.target.closest('[role="tablist"]')&&(e.key==='ArrowRight'||e.key==='ArrowLeft'))return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const k=e.key;
  if(!$('#blackout').hidden&&!['b','B','.'].includes(k)){toggleBlack(false);if(k!=='ArrowRight'&&k!=='PageDown')return}
  if(k==='ArrowRight'||k==='PageDown'||k==='ArrowDown'){e.preventDefault();step(1)}
  else if(k==='ArrowLeft'||k==='PageUp'||k==='ArrowUp'){e.preventDefault();step(-1)}
  else if(k===' '||k==='k'||k==='K'){if(k===' '&&e.target.closest('button,a'))return;e.preventDefault();voToggle()}
  else if(k==='Home'){e.preventDefault();go(0)}else if(k==='End'){e.preventDefault();go(IX('ask'))}
  else if(k==='b'||k==='B'||k==='.'){e.preventDefault();toggleBlack()}
  else if(k==='p'||k==='P')openPresenter();
  else if(k==='n'||k==='N')tog(notes);else if(k==='f'||k==='F')full();else if(k==='g'||k==='G')go(IX('gallery'));
  else if(k==='c'||k==='C')$('#dCC').click();
  else if(k==='?')tog(help);
  else if(k==='Escape')closePops();
});

/* ---------- SIZING ---------- */
const sizeVars=()=>{const r=document.documentElement.style;r.setProperty('--dh',deck.clientHeight+'px');r.setProperty('--ph',$('#player').offsetHeight+'px')};
sizeVars();
if('ResizeObserver' in window)new ResizeObserver(sizeVars).observe(deck);else addEventListener('resize',sizeVars);

/* ---------- START ---------- */
const h0=location.hash.slice(1);
const startSite=SK.includes(h0)?h0:null;
const start=startSite?IX('sites'):Math.max(0,IX(h0));
if(startSite)openSite(startSite);
commit(start,{instant:true,fromHash:true,keepSite:!!startSite});
idleCap(); ui();

/* Read-only handle for exporting the script and for automated checks. */
window.__oneUnisa={script:()=>ALL.map(c=>({key:c.key,file:'audio/'+c.key+'.mp3',text:c.say,recorded:!!c.rec})),state:()=>({slide:IDS[pi],line:vo.ci+1,state:vo.state,engine:vo.engine,word:vo.wi,phase:ph,busy}),play:voPlay,pause:voPause,rate:r=>{vo.rate=r},go:i=>go(i)};
})();
