const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const output = path.join(process.cwd(), 'public/assets/river-rescue');
// Assemble a silent VP8/WebM story from the generated art. Narration and
// accessible captions are synchronized by the website's story player.
function bytes(n) { let hex=n.toString(16); if(hex.length%2)hex='0'+hex; return Buffer.from(hex,'hex'); }
function size(n) { let len=1; while(n>=2**(7*len)-1)len++; const b=Buffer.alloc(len); for(let i=len-1;i>=0;i--){b[i]=n&255;n=Math.floor(n/256);} b[0]|=1<<(8-len);return b; }
function el(id,data) { const b=Array.isArray(data)?Buffer.concat(data):Buffer.isBuffer(data)?data:typeof data==='string'?Buffer.from(data):bytes(data);return Buffer.concat([bytes(id),size(b.length),b]); }
function duration(n) { const b=Buffer.alloc(8); b.writeDoubleBE(n); return b; }
function vp8(webp) { let i=12; while(i<webp.length){ const tag=webp.toString('ascii',i,i+4), n=webp.readUInt32LE(i+4); if(tag==='VP8 ')return webp.subarray(i+8,i+8+n); i+=8+n+(n%2); }throw new Error('Expected lossy VP8 WebP'); }
async function main(){
  const w=960,h=540,fps=12;
  const bg=await sharp(path.join(output,'river-background.png')).resize(w,h,{fit:'fill'}).png().toBuffer();
  const sheet=path.join(output,'characters.png'); const meta=await sharp(sheet).metadata(); const cw=Math.floor(meta.width/2),ch=Math.floor(meta.height/2);
  const sprites=await Promise.all([0,1,3].map((frame,i)=>sharp(sheet).extract({left:(frame%2)*cw,top:Math.floor(frame/2)*ch,width:cw,height:ch}).resize(Math.round(h*(i===2?.24:.28))).png().toBuffer()));
  const clusters=[];
  for(let second=0;second<10;second++){
    const blocks=[];
    for(let f=0;f<fps;f++){
      const t=second+f/fps,progress=Math.min(1,t/3.4),hop=progress<1?Math.abs(Math.sin(progress*Math.PI*3))*h*.025:0;
      const s=Math.round(h*.28),friendSize=Math.round(h*.24);
      const frame=await sharp(bg).composite([
        {input:sprites[t<3.4?0:1],left:Math.round(w*(.12+progress*.12)-s/2),top:Math.round(h*.62-hop-s)},
        {input:sprites[2],left:Math.round(w*.82-friendSize/2),top:Math.round(h*.62-Math.sin(t*3)*2-friendSize)}
      ]).webp({quality:46,effort:4}).toBuffer();
      const header=Buffer.alloc(4);header[0]=0x81;header.writeInt16BE(Math.round(f*1000/fps),1);header[3]=0x80;
      blocks.push(el(0xa3,Buffer.concat([header,vp8(frame)])));
    }
    clusters.push(el(0x1f43b675,[el(0xe7,second*1000),...blocks]));
    console.log(`Rendered ${second+1}/10 seconds`);
  }
  const header=el(0x1a45dfa3,[el(0x4286,1),el(0x42f7,1),el(0x42f2,4),el(0x42f3,8),el(0x4282,'webm'),el(0x4287,2),el(0x4285,2)]);
  const info=el(0x1549a966,[el(0x2ad7b1,1000000),el(0x4d80,'Curious Lab'),el(0x5741,'Curious Lab'),el(0x4489,duration(10000))]);
  const tracks=el(0x1654ae6b,[el(0xae,[el(0xd7,1),el(0x73c5,1),el(0x83,1),el(0x86,'V_VP8'),el(0x23e383,Math.round(1e9/fps)),el(0xe0,[el(0xb0,w),el(0xba,h)])])]);
  // Cue points allow skipping and replaying without downloading the whole film.
  let position=info.length+tracks.length;
  const cues=el(0x1c53bb6b,clusters.map((cluster,i)=>{const entry=el(0xbb,[el(0xb3,i*1000),el(0xb7,[el(0xf7,1),el(0xf1,position)])]);position+=cluster.length;return entry;}));
  fs.writeFileSync(path.join(output,'intro.webm'),Buffer.concat([header,el(0x18538067,[info,tracks,...clusters,cues])]));
  console.log('Saved 10-second intro.webm');
}
main().catch(e=>{console.error(e);process.exit(1)});
