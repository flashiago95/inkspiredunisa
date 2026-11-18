/* UNISA Global network map: outline of South Africa, three ring pins, red network triangle, travelling pulses. */
(function(){
function NetMap(svgHost,M,opt={}){
  const [,,BW,BH]=M.box.map(Number);
  const S=M.sites,pts={hub:S.hub.map(Number),centre:S.centre.map(Number),spoke:S.spoke.map(Number)};
  const lab={hub:['Cape Town',30,12,'start'],centre:['Mahikeng',32,12,'start'],spoke:['Mthatha',32,12,'start']};
  const red=opt.red||'#e3241b',fs=opt.fontSize||36;
  const pad=60;
  const segs=[['hub','centre'],['centre','spoke'],['spoke','hub']];
  let h='<svg viewBox="-'+pad+' -'+pad+' '+(BW+pad*2+220)+' '+(BH+pad*2)+'" style="width:100%;height:100%;overflow:visible" font-family="'+(opt.font||'IBM Plex Sans, Inter, Arial, sans-serif')+'">';
  h+='<defs><radialGradient id="nmGlow"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="nmSoft"><feGaussianBlur stdDeviation="1.2"/></filter></defs>';
  h+='<path class="nm-land" d="'+M.za+'" fill="'+(opt.land||'#1a1a1a')+'" stroke="none"/>';
  h+='<path class="nm-out" d="'+M.za+'" fill="none" stroke="#d9d9d9" stroke-width="2.4" stroke-linejoin="round" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>';
  h+='<path class="nm-out2" d="'+M.ls+M.sz+'" fill="#151515" stroke="#d9d9d9" stroke-width="2.2" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>';
  segs.forEach(([a,b],i)=>{const A=pts[a],B=pts[b];h+='<line class="nm-ln" data-i="'+i+'" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" stroke="'+red+'" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'});
  segs.forEach((s,i)=>{h+='<circle class="nm-pulse" data-i="'+i+'" r="6" fill="#fff" opacity="0"/>'});
  ['hub','centre','spoke'].forEach(k=>{const p=pts[k],l=lab[k];h+='<g class="nm-pin" data-k="'+k+'" opacity="0" style="transform-box:fill-box"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="70" fill="url(#nmGlow)"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="16" fill="none" stroke="#fff" stroke-width="8"/><circle cx="'+(p[0]+17)+'" cy="'+(p[1]-17)+'" r="4.5" fill="#fff"/><text x="'+(p[0]+l[1])+'" y="'+(p[1]+l[2])+'" font-size="'+fs+'" fill="#fff" font-weight="400">'+l[0]+'</text></g>'});
  h+='</svg>';
  svgHost.innerHTML=h;
  const q=s=>svgHost.querySelector(s),qa=s=>[...svgHost.querySelectorAll(s)];
  const out=q('.nm-out'),out2=q('.nm-out2'),land=q('.nm-land'),lns=qa('.nm-ln'),pls=qa('.nm-pulse'),pins=qa('.nm-pin');
  return {set(st){
    out.setAttribute('stroke-dashoffset',1000*(1-st.outline));out2.setAttribute('stroke-dashoffset',1000*(1-Math.max(0,st.outline*1.3-.3)));
    land.setAttribute('opacity',Math.max(0,st.outline*1.5-.5));
    pins.forEach((g,i)=>{const v=st.pins[i];g.setAttribute('opacity',v);g.style.transformOrigin='center';g.style.transform='scale('+(.6+.4*v)+')'});
    lns.forEach((l,i)=>l.setAttribute('stroke-dashoffset',1-st.lines[i]));
    pls.forEach((c,i)=>{const [a,b]=segs[i];const A=pts[a],B=pts[b];const f=((st.t||0)*.16+i*.33)%1;c.setAttribute('cx',A[0]+(B[0]-A[0])*f);c.setAttribute('cy',A[1]+(B[1]-A[1])*f);c.setAttribute('opacity',st.lines[i]>=1?.95:0)});
  }};
}
window.NetMap=NetMap;
})();
