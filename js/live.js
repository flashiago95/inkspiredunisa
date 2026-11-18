/* Living still engine: depth parallax camera, sky drift, light sweep. Shared by the board film and the web app. */
(function(){
const VS='attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D uImg,uDep;uniform vec2 uRes,uIS,uCam;uniform float uZoom,uFocus,uDolly,uAlpha,uTime,uSky,uSweep,uSweepPos,uVig,uOff;
varying vec2 v;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
vec2 warp(vec2 c,float d){float s=1./(uZoom*(1.+uDolly*(d-uFocus)));return .5+c*s-uCam*(d-uFocus)+vec2(uOff,0.);}
void main(){
  float ra=uRes.x/uRes.y,ia=uIS.x/uIS.y;vec2 sc=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
  vec2 c=(v-.5)*sc;float d=texture2D(uDep,.5+c).r;vec2 q;
  for(int i=0;i<5;i++){q=warp(c,d);d=texture2D(uDep,q).r;}
  q=warp(c,d);
  float sky=smoothstep(.13,.03,d)*smoothstep(.72,.30,q.y);
  if(uSky>0.){q.x-=uTime*.0016*sky*uSky;q.y+=sin(q.x*6.+uTime*.2)*.0006*sky*uSky;}
  vec3 col=texture2D(uImg,clamp(q,.001,.999)).rgb;
  if(uSky>0.){float cl=smoothstep(.55,.95,fbm(vec2(q.x*2.6-uTime*.018,q.y*7.)));col=mix(col,vec3(1.,.985,.96),cl*sky*.22*uSky);}
  if(uSweep>0.){float b=exp(-pow((q.x*.8+q.y*.5-uSweepPos)*5.,2.));float l=dot(col,vec3(.3,.59,.11));col+=b*uSweep*.16*smoothstep(.25,.95,l)*vec3(1.,.93,.82);}
  if(uVig>0.){vec2 w=v-.5;col*=1.-uVig*dot(w,w)*1.2;}
  gl_FragColor=vec4(col,uAlpha);
}`;
function Live(canvas){
  const gl=canvas.getContext('webgl',{premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false,alpha:false});
  if(!gl)throw new Error('WebGL unavailable');
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const U={};['uImg','uDep','uRes','uIS','uCam','uZoom','uFocus','uDolly','uAlpha','uTime','uSky','uSweep','uSweepPos','uVig','uOff'].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  gl.uniform1i(U.uImg,0);gl.uniform1i(U.uDep,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const cache=new Map();const MAX=10;
  function tex(im){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);return t}
  const imgs={};
  this.register=(key,imgEl,depEl)=>{imgs[key]=[imgEl,depEl]};
  function get(key){if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v}
    const [i,d]=imgs[key];const v={i:tex(i),d:tex(d),w:i.naturalWidth,h:i.naturalHeight};cache.set(key,v);
    if(cache.size>MAX){const k=cache.keys().next().value;const o=cache.get(k);gl.deleteTexture(o.i);gl.deleteTexture(o.d);cache.delete(k)}return v}
  this.has=k=>!!imgs[k];
  this.render=(layers,time)=>{
    const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);gl.clearColor(0.047,0.051,0.059,1);gl.clear(gl.COLOR_BUFFER_BIT);
    for(const L of layers){if(!(L.alpha>0)||!imgs[L.key])continue;const T=get(L.key);let RW=W,RH=H;if(L.rect){const[x,y,w,h]=L.rect;gl.viewport(x,H-y-h,w,h);RW=w;RH=h}else gl.viewport(0,0,W,H);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.i);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,T.d);
      gl.uniform2f(U.uRes,RW,RH);gl.uniform2f(U.uIS,T.w,T.h);gl.uniform2f(U.uCam,L.cx||0,L.cy||0);gl.uniform1f(U.uZoom,(L.zoom||1.06)*(1+(L.dolly||0)*.45)+Math.abs(L.cx||0)*.5+Math.abs(L.cy||0)*.5);gl.uniform1f(U.uFocus,L.focus??.35);
      gl.uniform1f(U.uDolly,L.dolly||0);gl.uniform1f(U.uAlpha,L.alpha);gl.uniform1f(U.uTime,L.tl??0);gl.uniform1f(U.uSky,L.sky||0);gl.uniform1f(U.uSweep,L.sweep||0);gl.uniform1f(U.uSweepPos,L.sweepPos||0);gl.uniform1f(U.uVig,L.vig??.35);gl.uniform1f(U.uOff,L.off||0);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
  };
}
/* camera presets: p is 0..1 progress through the shot */
Live.move=function(kind,p,o={}){const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  switch(kind){
    case 'push':return{zoom:1.05+.08*e,dolly:.04*e,cx:.008*(e-.5),cy:-.004*e};
    case 'pull':return{zoom:1.13-.07*e,dolly:.04*(1-e),cx:-.008*(e-.5),cy:.003*e};
    case 'truckL':return{zoom:1.10,dolly:.03,cx:.026*(e-.5),cy:0};
    case 'truckR':return{zoom:1.10,dolly:.03,cx:-.026*(e-.5),cy:0};
    case 'orbit':return{zoom:1.08+.03*e,dolly:.04,cx:.024*(e-.5),cy:-.008*Math.sin(e*Math.PI)};
    case 'rise':return{zoom:1.10,dolly:.04,cx:0,cy:.022*(e-.5)};
    default:return{zoom:1.06,dolly:0,cx:0,cy:0}}};
window.Live=Live;
})();
