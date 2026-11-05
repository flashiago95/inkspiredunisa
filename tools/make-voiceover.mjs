#!/usr/bin/env node
/* Records the narrated tour with ElevenLabs.

   Reads every line from js/voiceover.js, asks ElevenLabs for speech with character timings,
   and writes audio/{slide}-{line}.mp3 plus audio/timings.js. The deck picks these up on its own:
   captions then follow the recorded voice word by word.

   Usage (Node 18 or newer, no installs needed):
     ELEVENLABS_API_KEY=... node tools/make-voiceover.mjs
     node tools/make-voiceover.mjs --list-voices          shows the voices on your account
     node tools/make-voiceover.mjs --voice=VOICE_ID       records with that voice
     node tools/make-voiceover.mjs --only=journey-03      re-records one line (comma separate several)
     node tools/make-voiceover.mjs --force                re-records everything
     node tools/make-voiceover.mjs --dry-run              shows what would be recorded and the character count

   Lines whose wording and voice have not changed since the last run are skipped, so edits cost only
   the characters you changed. Put an optional music bed at audio/music.mp3 and it plays under the voice. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const AUDIO=path.join(ROOT,'audio');
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.match(/^--([^=]+)(?:=(.*))?$/);return m?[m[1],m[2]??true]:[a,true]}));
const KEY=args.key||process.env.ELEVENLABS_API_KEY;
const BASE=(process.env.ELEVENLABS_BASE||'https://api.elevenlabs.io').replace(/\/$/,'');
const VOICE=args.voice||process.env.ELEVENLABS_VOICE_ID||'JBFqnCBsd6RMkjVDRZzb';
const MODEL=args.model||'eleven_multilingual_v2';
const SETTINGS={stability:+(args.stability??.5),similarity_boost:+(args.similarity??.8),style:+(args.style??.15),use_speaker_boost:true,speed:+(args.speed??.97)};

function loadWindowScript(file){
  const sandbox={window:{}};
  if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
  return sandbox.window;
}
/* Must match buildLine() and hashText() in js/deck.js. */
function hashText(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function wordMap(say,pron){
  const toks=say.split(/\s+/).filter(Boolean), ranges=[]; let sp='';
  toks.forEach((t,k)=>{let s=t;pron.forEach(([re,r])=>{re.lastIndex=0;s=s.replace(re,r)});if(k)sp+=' ';ranges.push([sp.length,sp.length+s.length]);sp+=s});
  return {toks,ranges,spoken:sp};
}
async function api(pathname,init={},tries=5){
  for(let i=0;;i++){
    const res=await fetch(BASE+pathname,{...init,headers:{'xi-api-key':KEY,'Content-Type':'application/json',...(init.headers||{})}});
    if(res.ok)return res.json();
    const body=await res.text();
    if((res.status===429||res.status>=500)&&i<tries-1){const wait=2000*2**i;console.log(`  ElevenLabs is busy (${res.status}), retrying in ${wait/1000}s`);await new Promise(r=>setTimeout(r,wait));continue}
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0,400)}`);
  }
}

const {VO_LINES={},VO_PRON=[]}=loadWindowScript(path.join(ROOT,'js','voiceover.js'));
const PRON=VO_PRON.map(([p,f,r])=>[new RegExp(p,f),r]);
const lines=[];
for(const [slide,list] of Object.entries(VO_LINES))list.forEach((say,i)=>lines.push({key:`${slide}-${String(i+1).padStart(2,'0')}`,say,...wordMap(say,PRON)}));

if(args['list-voices']){
  if(!KEY){console.error('Set ELEVENLABS_API_KEY first.');process.exit(1)}
  const {voices=[]}=await api('/v1/voices');
  for(const v of voices){const l=v.labels||{};console.log(`${v.voice_id}  ${v.name.padEnd(22)} ${[l.gender,l.age,l.accent,l.description||l.descriptive,l.use_case].filter(Boolean).join(', ')}`)}
  process.exit(0);
}

const prev=(loadWindowScript(path.join(AUDIO,'timings.js')).VO_TIMINGS)||{};
const out={voice:VOICE,model:MODEL,generated:new Date().toISOString(),music:fs.existsSync(path.join(AUDIO,'music.mp3'))?'audio/music.mp3':null,lines:{}};
const only=typeof args.only==='string'?new Set(args.only.split(',')):null;
const sameVoice=prev.voice===VOICE;
const todo=lines.filter(l=>{
  const old=sameVoice&&prev.lines&&prev.lines[l.key];
  const fresh=old&&old.h===hashText(l.say)&&fs.existsSync(path.join(AUDIO,l.key+'.mp3'));
  return only?only.has(l.key):(args.force||!fresh);
});
/* Keep earlier recordings in the same voice for every line not being re-recorded. */
if(sameVoice&&prev.lines)lines.forEach(l=>{if(!todo.includes(l)&&prev.lines[l.key])out.lines[l.key]=prev.lines[l.key]});
const chars=todo.reduce((a,l)=>a+l.spoken.length,0);
console.log(`${lines.length} lines in the script, ${todo.length} to record (${chars} characters), voice ${VOICE}, model ${MODEL}.`);
if(args['dry-run']){todo.forEach(l=>console.log(`  ${l.key}  ${l.spoken}`));process.exit(0)}
if(!todo.length){write();console.log('Nothing to record. audio/timings.js is up to date.');process.exit(0)}
if(!KEY){console.error('Set ELEVENLABS_API_KEY (or pass --key=...) to record.');process.exit(1)}
fs.mkdirSync(AUDIO,{recursive:true});

function write(){
  const sorted={};lines.forEach(l=>{if(out.lines[l.key])sorted[l.key]=out.lines[l.key]});out.lines=sorted;
  fs.writeFileSync(path.join(AUDIO,'timings.js'),'/* Written by tools/make-voiceover.mjs. Word timings for the recorded voiceover; h is a fingerprint of the line\'s text. */\nwindow.VO_TIMINGS='+JSON.stringify(out)+';\n');
}
for(const l of todo){
  const idx=lines.indexOf(l);
  const body={text:l.spoken,model_id:MODEL,voice_settings:SETTINGS,previous_text:idx>0?lines[idx-1].spoken:undefined,next_text:idx<lines.length-1?lines[idx+1].spoken:undefined};
  process.stdout.write(`  ${l.key}  `);
  const r=await api(`/v1/text-to-speech/${encodeURIComponent(VOICE)}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',body:JSON.stringify(body)});
  fs.writeFileSync(path.join(AUDIO,l.key+'.mp3'),Buffer.from(r.audio_base64,'base64'));
  const al=r.alignment||r.normalized_alignment;
  const st=al.character_start_times_seconds, en=al.character_end_times_seconds, n=al.characters.length;
  /* The alignment normally has one entry per character of the text sent. If it differs, map positions proportionally. */
  const at=(i,arr)=>arr[Math.min(n-1,n===l.spoken.length?i:Math.round(i*(n-1)/Math.max(1,l.spoken.length-1)))];
  const w=l.ranges.map(([a,b])=>[+at(a,st).toFixed(3),+at(b-1,en).toFixed(3)]);
  out.lines[l.key]={h:hashText(l.say),d:+en[n-1].toFixed(3),w};
  write();
  console.log(`${out.lines[l.key].d.toFixed(1)}s`);
}
write();
console.log(`Done. ${Object.keys(out.lines).length} of ${lines.length} lines recorded. Open index.html: the tour now uses the recorded voice.`);
