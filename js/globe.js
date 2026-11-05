/* Opening globe: Africa at a distance, then the One UNISA network.
   Drawn with three.js. createGlobe returns null when WebGL is unavailable, and the deck shows a still image instead.
   Phases: 0 Africa, 1 distance learners scattered across the continent, 2 the three front doors and the shared backbone.
   dive() flies the camera into the Cape Town waterfront.

   Built for smooth motion on ordinary laptops and projectors: it renders on GSAP's clock (one frame loop
   for camera and tweens), compiles its shaders before it fades in, skips dots on the far side of the globe
   before they are shaded, draws the glow only at the rim, and lowers its resolution if frames run long. */
(function(){
const DEG=Math.PI/180;
const NODES={
  pretoria:{lat:-25.75,lon:28.23,color:0xeeebe6,name:'Pretoria',sub:'Main campus · shared backbone'},
  hub:{lat:-33.92,lon:18.42,color:0x5b9be0,name:'Cape Town',sub:'The Hub · marine studies'},
  centre:{lat:-25.85,lon:25.64,color:0xd77a40,name:'Mahikeng',sub:'The Centre · mining'},
  spoke:{lat:-31.59,lon:28.78,color:0xe4b844,name:'Mthatha',sub:'The Spoke · health'}
};
const VIEWS={
  0:{lat:4,lon:19,dist:4.4,shift:.62},
  1:{lat:-2,lon:21,dist:3.35,shift:.5},
  2:{lat:-29,lon:25,dist:2.3,shift:.4},
  dive:{lat:-33.92,lon:18.42,dist:1.0105,shift:0}
};

function unpack(b64){
  const bin=atob(b64), n=bin.length/4, out=new Float32Array(n*2), u8=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const dv=new DataView(u8.buffer);
  for(let i=0;i<n;i++){out[i*2]=dv.getInt16(i*4,true)/100;out[i*2+1]=dv.getInt16(i*4+2,true)/100}
  return out;
}
function xyz(lat,lon,r){r=r||1;const a=lat*DEG,o=lon*DEG;return new THREE.Vector3(r*Math.cos(a)*Math.cos(o),r*Math.sin(a),-r*Math.cos(a)*Math.sin(o))}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* Shared shader pieces: how far a point on the globe faces the camera (1 facing, 0 at the edge, negative behind). */
const FACING='float facing(vec3 p){vec4 mv=modelViewMatrix*vec4(p,1.);vec3 c=(modelViewMatrix*vec4(0.,0.,0.,1.)).xyz;return dot(normalize(mv.xyz-c),normalize(-mv.xyz));}';

function createGlobe(canvas,labelsEl,opts){
  opts=opts||{};
  const speed=opts.reduce?0.02:1;
  /* No multisampling: it roughly doubles the cost of every frame. Every shape smooths its own edges instead. */
  const DPR=window.devicePixelRatio||1;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'high-performance'})}catch(e){return null}
  if(!renderer||!renderer.getContext())return null;
  let pr=Math.min(DPR,1.5);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,0.004,50);
  const tilt=new THREE.Group(), spin=new THREE.Group();
  tilt.add(spin); scene.add(tilt);
  const U={uScale:{value:800},uTime:{value:0}};

  /* Ocean sphere: hides everything behind the globe. */
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(0.996,96,64),new THREE.MeshBasicMaterial({color:0x0d0f12})));

  /* Atmosphere: the inside of a slightly larger sphere, so only the rim around the globe is ever shaded. */
  const atmU={uColor:{value:new THREE.Color(0x5b9be0)},uStrength:{value:.55}};
  const atm=new THREE.Mesh(new THREE.SphereGeometry(1.06,96,64),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,uniforms:atmU,
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uColor;uniform float uStrength;varying vec3 vN;varying vec3 vV;void main(){float d=clamp(dot(-vN,vV),0.,1.);float f=pow(smoothstep(0.,.34,d),1.8);gl_FragColor=vec4(uColor*f*uStrength,f*uStrength);}'
  }));
  tilt.add(atm);

  /* Land as dots: the world dim, Africa brighter, South Africa densest. */
  const sets=[[unpack(GEO_DOTS.world),0,.0078],[unpack(GEO_DOTS.africa),1,.0052],[unpack(GEO_DOTS.sa),2,.0029]];
  let total=0; sets.forEach(s=>total+=s[0].length/2);
  const lp=new Float32Array(total*3), lk=new Float32Array(total), ls=new Float32Array(total);
  let k=0;
  sets.forEach(([pts,kind,size])=>{for(let i=0;i<pts.length;i+=2){const v=xyz(pts[i],pts[i+1],1.0015);lp[k*3]=v.x;lp[k*3+1]=v.y;lp[k*3+2]=v.z;lk[k]=kind;ls[k]=size;k++}});
  const lg=new THREE.BufferGeometry();
  lg.setAttribute('position',new THREE.BufferAttribute(lp,3));lg.setAttribute('aKind',new THREE.BufferAttribute(lk,1));lg.setAttribute('aSize',new THREE.BufferAttribute(ls,1));
  const landU={uScale:U.uScale,uAfrica:{value:.6},uFade:{value:1}};
  spin.add(new THREE.Points(lg,new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,uniforms:landU,
    vertexShader:FACING+'attribute float aKind;attribute float aSize;uniform float uScale;varying float vK;varying float vS;varying float vF;'+
      'void main(){vK=aKind;float f=facing(position);vF=smoothstep(0.,.14,f);'+
      'if(f<0.){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}'+
      'vec4 mv=modelViewMatrix*vec4(position,1.);vS=clamp(aSize*uScale/-mv.z,1.,34.);gl_PointSize=vS;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vK;varying float vS;varying float vF;uniform float uAfrica;uniform float uFade;'+
      'void main(){float r=length(gl_PointCoord-.5);float e=clamp((.5-r)*vS+.5,0.,1.);if(e<=0.)discard;'+
      'vec3 w=vec3(.2,.215,.24);vec3 a=mix(vec3(.27,.29,.32),vec3(.82,.8,.76),uAfrica);vec3 col=vK<.5?w:(vK<1.5?a:a*1.08);'+
      'gl_FragColor=vec4(col,(vK<.5?.8:1.)*uFade*e*vF);}'
  })));

  /* Distance learners: points of light across Africa, weighted to South Africa.
     Southern points later gather at the nearest front door. Illustrative only. */
  const R=rng(11), nodeV={}; for(const n in NODES)nodeV[n]=xyz(NODES[n].lat,NODES[n].lon);
  const pool=[], A=sets[1][0], Z=sets[2][0];
  for(let i=0;i<Z.length;i+=2)pool.push([Z[i],Z[i+1]]);
  for(let i=0;i<A.length;i+=2)if(R()<.17)pool.push([A[i],A[i+1]]);
  const n=pool.length, sp=new Float32Array(n*3), st=new Float32Array(n*3), ss=new Float32Array(n), sm=new Float32Array(n);
  const doorKeys=['pretoria','hub','centre','spoke'];
  pool.forEach(([lat,lon],i)=>{
    lat+=(R()-.5)*.5; lon+=(R()-.5)*.5;
    const a=xyz(lat,lon); sp.set([a.x,a.y,a.z],i*3); ss[i]=R();
    if(lat<-16.5&&lon>11&&lon<36){
      let best='pretoria',bd=9;doorKeys.forEach(d=>{const ad=a.angleTo(nodeV[d]);if(ad<bd){bd=ad;best=d}});
      const nd=NODES[best],r=.25+R()*.75,th=R()*Math.PI*2;
      const t=xyz(nd.lat+r*Math.sin(th),nd.lon+r*Math.cos(th)/Math.cos(nd.lat*DEG));
      st.set([t.x,t.y,t.z],i*3); sm[i]=1;
    }else{st.set([a.x,a.y,a.z],i*3);sm[i]=0}
  });
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('aTarget',new THREE.BufferAttribute(st,3));sg.setAttribute('aSeed',new THREE.BufferAttribute(ss,1));sg.setAttribute('aMove',new THREE.BufferAttribute(sm,1));
  const stuU={uScale:U.uScale,uTime:U.uTime,uShow:{value:0},uGather:{value:0},uLink:{value:0},uHome:{value:nodeV.pretoria.clone()}};
  spin.add(new THREE.Points(sg,new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:stuU,
    vertexShader:[FACING,
      'attribute vec3 aTarget;attribute float aSeed;attribute float aMove;',
      'uniform float uScale;uniform float uTime;uniform float uShow;uniform float uGather;uniform float uLink;uniform vec3 uHome;',
      'varying float vA;',
      'void main(){',
      ' if(uShow<.001){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}',
      ' float g=clamp(uGather*1.7-aSeed*.7,0.,1.);g=g*g*(3.-2.*g);',
      ' vec3 p=normalize(mix(position,aTarget,g*aMove))*1.004;',
      ' float f=facing(p); if(f<0.){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}',
      ' float tw=.5+.5*sin(uTime*1.6+aSeed*43.);',
      ' float d=acos(clamp(dot(normalize(position),uHome),-1.,1.));',
      ' float wave=pow(max(0.,sin(d*9.-uTime*2.2)),6.)*uLink*(1.-aMove);',
      ' vA=uShow*(.35+.5*tw+wave*1.6)*clamp(uShow*1.4-aSeed*.4,0.,1.)*smoothstep(0.,.14,f);',
      ' vec4 mv=modelViewMatrix*vec4(p,1.);',
      ' gl_PointSize=clamp(.0105*(.75+aSeed*.6)*uScale/-mv.z,1.5,7.);',
      ' gl_Position=projectionMatrix*mv;',
      '}'].join('\n'),
    fragmentShader:'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=smoothstep(.5,0.,length(c));gl_FragColor=vec4(vec3(1.,.85,.56)*a*vA,a*vA);}'
  })));

  /* Backbone arcs from the Pretoria main campus to each site. */
  const arcs=['hub','centre','spoke'].map((key,idx)=>{
    const a=nodeV.pretoria,b=nodeV[key],ang=a.angleTo(b),pts=[];
    for(let i=0;i<=60;i++){const t=i/60;pts.push(a.clone().lerp(b,t).normalize().multiplyScalar(1.003+.3*ang*Math.sin(Math.PI*t)))}
    const curve=new THREE.CatmullRomCurve3(pts);
    const geo=new THREE.TubeGeometry(curve,120,.0026,8,false);
    const mu={uColor:{value:new THREE.Color(NODES[key].color)},uOpacity:{value:.95}};
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:mu,
      vertexShader:'varying float vE;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vE=abs(dot(normalize(normalMatrix*normal),normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform vec3 uColor;uniform float uOpacity;varying float vE;void main(){gl_FragColor=vec4(uColor,uOpacity*smoothstep(.05,.55,vE));}'});
    const mesh=new THREE.Mesh(geo,mat); geo.setDrawRange(0,0); spin.add(mesh);
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3),3));
    const pu={uScale:U.uScale,uOpacity:{value:0}};
    const pulse=new THREE.Points(pg,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:pu,
      vertexShader:'uniform float uScale;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(.016*uScale/-mv.z,2.,24.);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform float uOpacity;void main(){float a=smoothstep(.5,.0,length(gl_PointCoord-.5));gl_FragColor=vec4(vec3(1.)*a*uOpacity,a*uOpacity);}'}));
    pulse.frustumCulled=false; spin.add(pulse);
    return {key,idx,curve,geo,mu,pu,pulse,prog:0,count:geo.index.count,drawn:-1};
  });

  /* Site markers in the Inkspired mark: a ring with its offset dot (Pretoria is a ring around a dot).
     Drawn from a distance field, so the edges stay crisp at any size, right through the dive. */
  const MARK={
    transparent:true,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true},
    vertexShader:'uniform float uR;varying vec2 vP;void main(){vP=position.xy/uR;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 uColor;uniform float uOpacity;uniform float uDot;varying vec2 vP;'+
      'void main(){float l=length(vP);float d=abs(l-.71)-.29;'+
      'd=uDot>.5?min(d,length(vP-vec2(.759,1.082))-.141):min(d,l-.22);'+
      'float a=clamp(.5-d/max(fwidth(d),1e-5),0.,1.)*uOpacity;if(a<=.001)discard;gl_FragColor=vec4(uColor,a);}'
  };
  const markers={};
  for(const key in NODES){
    const g=new THREE.Group(), col=new THREE.Color(NODES[key].color), ro=key==='pretoria'?.0105:.0135;
    const mu={uColor:{value:col},uOpacity:{value:0},uR:{value:ro},uDot:{value:key==='pretoria'?0:1}};
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(ro*2.7,ro*2.7),new THREE.ShaderMaterial(Object.assign({uniforms:mu},MARK))));
    const hu={uColor:{value:col},uOpacity:{value:0},uR:{value:ro}};
    const halo=new THREE.Mesh(new THREE.PlaneGeometry(ro*3.2,ro*3.2),new THREE.ShaderMaterial({uniforms:hu,transparent:true,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true},
      vertexShader:MARK.vertexShader,
      fragmentShader:'uniform vec3 uColor;uniform float uOpacity;varying vec2 vP;void main(){float d=abs(length(vP)-1.33)-.07;float a=clamp(.5-d/max(fwidth(d),1e-5),0.,1.)*uOpacity;if(a<=.001)discard;gl_FragColor=vec4(uColor,a);}'}));
    g.add(halo);
    const pos=nodeV[key].clone().multiplyScalar(1.0045);
    g.position.copy(pos); g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),nodeV[key]);
    g.scale.setScalar(.001); spin.add(g);
    const el=document.createElement('div'); el.className='glabel'; el.dataset.site=key;
    el.innerHTML='<div class="in"><b>'+NODES[key].name+'</b><span>'+NODES[key].sub+'</span></div>';
    labelsEl.appendChild(el);
    markers[key]={g,mu,hu,halo,el,show:0,ri:ro*.42,lx:'',lo:''};
  }

  /* View state, tweened between phases. */
  const view=Object.assign({},VIEWS[0]), live={drift:1,labels:0,markerFade:1};
  let phase=null, running=false, clock=0, diving=null, narrow=false, W=1, H=1;
  const tl=[];
  function kill(){tl.forEach(t=>t.kill());tl.length=0}
  function to(target,vars){const t=gsap.to(target,Object.assign({},vars,{duration:(vars.duration||1)*speed,delay:(vars.delay||0)*speed}));tl.push(t);return t}
  function viewFor(p){const v=Object.assign({},VIEWS[p]);if(narrow){v.shift=0;v.dist*=1.3;if(p===0||p===1)v.lat-=10}return v}

  function setPhase(p,o){
    o=o||{};
    if(p===phase&&!o.instant&&!diving)return;
    const d=o.instant?0.001:1, fromDive=!!diving;
    diving=null; phase=p; kill();
    /* Coming back out of the dive, the land, glow and marks return gently rather than all at once. */
    to(landU.uFade,{value:1,duration:(fromDive?1.2:.3)*d});
    to(atmU.uStrength,{value:.55,duration:(fromDive?1.4:.3)*d});
    to(live,{markerFade:1,duration:(fromDive?1:.3)*d});
    to(view,Object.assign(viewFor(p),{duration:(fromDive?3:p===2?2.6:2.2)*d,ease:fromDive?'power3.inOut':'power2.inOut'}));
    to(live,{drift:p===0?1:0,duration:1.6*d,ease:'sine.inOut'});
    to(landU.uAfrica,{value:p===0?.6:p===1?.32:.28,duration:1.4*d,ease:'sine.inOut'});
    to(stuU.uShow,{value:p>=1?1:0,duration:(p>=1?2.2:.8)*d,ease:'power1.inOut'});
    to(stuU.uGather,{value:p>=2?1:0,duration:(p>=2?3.6:1)*d,delay:p>=2?1.1*d:0,ease:'power1.inOut'});
    to(stuU.uLink,{value:p>=2?1:0,duration:1.5*d,delay:p>=2?2*d:0});
    to(live,{labels:p>=2?1:0,duration:.8*d,delay:p>=2?1.4*d:0});
    ['pretoria','centre','hub','spoke'].forEach((key,i)=>{
      to(markers[key],{show:p>=2?1:0,duration:(p>=2?.9:.4)*d,delay:p>=2?(.5+i*.28)*d:0,ease:p>=2?'back.out(1.7)':'power1.in'});
    });
    arcs.forEach((a,i)=>to(a,{prog:p>=2?1:0,duration:(p>=2?1.6:.5)*d,delay:p>=2?(.9+i*.3)*d:0,ease:'power2.inOut'}));
  }
  function dive(){
    if(diving)return diving;
    kill(); phase='dive';
    diving=new Promise(res=>{
      to(live,{labels:0,duration:.5});
      to(live,{drift:0,duration:.6});
      to(view,Object.assign({},VIEWS.dive,{duration:2.6,ease:'power3.inOut',onComplete:res}));
      /* Everything but the Hub's mark fades, so the camera flies through its ring into the render. */
      to(live,{markerFade:0,duration:.7,delay:.5});
      to(landU.uFade,{value:0,duration:.9,delay:.9});
      to(stuU.uShow,{value:0,duration:.8,delay:.6});
      to(atmU.uStrength,{value:0,duration:.8,delay:.6});
    });
    return diving;
  }

  function resize(){
    const r=canvas.parentElement.getBoundingClientRect();
    W=Math.max(1,r.width); H=Math.max(1,r.height); narrow=W<760;
    renderer.setSize(W,H,false); camera.aspect=W/H; camera.updateProjectionMatrix();
    U.uScale.value=H*renderer.getPixelRatio()*1.744;
  }
  /* If frames run long for a while, render fewer pixels rather than drop frames. */
  let qWarm=0, qSum=0, qN=0;
  function quality(dt){
    if(qWarm<90){qWarm++;return}
    if(dt>120)return;
    qSum+=dt; qN++;
    if(qN<45)return;
    const avg=qSum/qN; qSum=0; qN=0;
    if(avg>21&&pr>1){pr=Math.max(1,+(pr-.25).toFixed(2));renderer.setPixelRatio(pr);resize();qWarm=60}
  }

  const v3=new THREE.Vector3(), nrm=new THREE.Vector3(), camW=new THREE.Vector3(), tmp=new THREE.Vector3();
  function place(){
    const t=clock;
    U.uTime.value=t;
    const lon=view.lon+live.drift*Math.sin(t*.09)*12;
    spin.rotation.y=-(lon+90)*DEG; tilt.rotation.x=view.lat*DEG; tilt.position.x=view.shift;
    camera.position.set(0,0,view.dist); camera.lookAt(0,0,0);
    for(const a of arcs){
      const c=Math.floor(a.count*a.prog/3)*3; if(c!==a.drawn){a.geo.setDrawRange(0,c);a.drawn=c}
      a.mu.uOpacity.value=.95*live.markerFade;
      const f=a.prog>=1?(t*.45+a.idx*.33)%1:0;
      a.pu.uOpacity.value=a.prog>=1?Math.sin(f*Math.PI)*live.markerFade:0;
      a.curve.getPointAt(f,a.pulse.position);
    }
    scene.updateMatrixWorld();
    camera.getWorldPosition(camW);
    for(const key in markers){
      const m=markers[key], s=Math.max(.001,m.show), vis0=Math.min(1,m.show);
      const fade=diving&&key==='hub'?1:live.markerFade;
      m.g.scale.setScalar(s); m.mu.uOpacity.value=vis0*fade;
      const hp=(t*.6+(key.length*.13))%1; m.halo.scale.setScalar(1+hp*1.5); m.hu.uOpacity.value=(1-hp)*.45*vis0*live.markerFade;
      m.g.getWorldPosition(v3); nrm.copy(v3).sub(tilt.position).normalize();
      const facing=nrm.dot(tmp.copy(camW).sub(v3).normalize());
      const vis=live.labels*vis0*(facing>.15?1:0);
      tmp.copy(v3).project(camera);
      const o=vis.toFixed(2), x='translate3d('+((tmp.x+1)/2*W).toFixed(1)+'px,'+((1-tmp.y)/2*H).toFixed(1)+'px,0)';
      if(o!==m.lo){m.el.style.opacity=o;m.lo=o}
      if(vis>0&&x!==m.lx){m.el.style.transform=x;m.lx=x}
    }
  }
  /* The globe counts as ready once it has drawn a run of steady frames, so it fades up only after any start-up stall. */
  let frames=0, steady=0, ready=false;
  function frame(time,dt){
    if(!running)return;
    if(!ready){frames++;steady=dt<34?steady+1:0;if((frames>=8&&steady>=45)||clock>3.5){ready=true;canvas.classList.add('ready');if(opts.onReady)opts.onReady()}}
    clock+=Math.min(dt,50)/1000;
    quality(dt);
    place();
    renderer.render(scene,camera);
  }
  /* Where the opening of the Hub's ring is on screen, in CSS pixels, so the deck can show the render through it. */
  const hp0=new THREE.Vector3(), hp1=new THREE.Vector3();
  function hubHole(){
    const m=markers.hub;
    hp0.set(0,0,0); m.g.localToWorld(hp0); hp1.set(m.ri,0,0); m.g.localToWorld(hp1);
    hp0.project(camera); hp1.project(camera);
    const x=(hp0.x+1)/2*W, y=(1-hp0.y)/2*H, bx=(hp1.x+1)/2*W, by=(1-hp1.y)/2*H;
    return {x,y,r:Math.hypot(bx-x,by-y),w:W,h:H};
  }
  function start(){if(running)return;running=true;resize();gsap.ticker.add(frame)}
  function stop(){running=false;gsap.ticker.remove(frame)}
  if('ResizeObserver' in window)new ResizeObserver(()=>{resize();if(!running){place();renderer.render(scene,camera)}}).observe(canvas.parentElement);
  resize(); setPhase(0,{instant:true});
  /* Compile every shader and draw one frame before the globe is shown, so it never stalls on its first moves. */
  for(const key in markers)markers[key].show=1;
  arcs.forEach(a=>a.prog=1); stuU.uShow.value=1; live.labels=0;
  place(); renderer.compile(scene,camera); renderer.render(scene,camera);
  for(const key in markers)markers[key].show=0;
  arcs.forEach(a=>a.prog=0); stuU.uShow.value=0;
  place(); renderer.render(scene,camera);

  return {setPhase,dive,start,stop,resize,hubHole,get phase(){return phase},get diving(){return !!diving},get pixelRatio(){return pr}};
}
window.createGlobe=createGlobe;
})();
