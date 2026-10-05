const fs = require('node:fs');
require('@next/env').loadEnvConfig(process.cwd());
const beats = [
  { start: 0, end: 3.4, text: 'Across the river, a friend is waiting.' },
  { start: 3.4, end: 6.6, text: 'But Bunny cannot hop that far.' },
  { start: 6.6, end: 10, text: 'How could Bunny cross the river?' }
];
async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing API key');
  fs.mkdirSync('work', {recursive: true});
  const rate = 24000;
  const audio = Buffer.alloc(rate * 10 * 2);
  for (const [i, beat] of beats.entries()) {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST', headers: {Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type':'application/json'},
      body: JSON.stringify({model:'gpt-4o-mini-tts',voice:'coral',input:beat.text,response_format:'pcm',speed:1.1,instructions:'Warm, gentle English storybook narrator for children. Speak clearly and naturally, with curious, friendly expression. No dramatic pauses. Finish this short sentence in under three seconds.'}),
      signal: AbortSignal.timeout(60000)
    });
    if (!response.ok) { const body = await response.json().catch(()=>({})); throw new Error(`Speech request failed: HTTP ${response.status}, code ${body.error?.code ?? 'unknown'}`); }
    const pcm=Buffer.from(await response.arrayBuffer());
    if(pcm.length<1000) throw new Error('Empty speech response');
    fs.writeFileSync(`work/narration-${i}.pcm`,pcm);
    const samples=pcm.length/2, available=Math.floor((beat.end-beat.start-.2)*rate), count=Math.min(samples,available);
    const offset=Math.round((beat.start+.05)*rate);
    for(let n=0;n<count;n++) { const pos=n*samples/count, a=Math.floor(pos), b=Math.min(samples-1,a+1), fraction=pos-a; const value=pcm.readInt16LE(a*2)*(1-fraction)+pcm.readInt16LE(b*2)*fraction; audio.writeInt16LE(Math.round(value),(offset+n)*2); }
    console.log(`Narration ${i+1}/3 saved (${(samples/rate).toFixed(2)} seconds)`);
  }
  const wav=Buffer.alloc(44); wav.write('RIFF');wav.writeUInt32LE(36+audio.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(audio.length,40);
  fs.writeFileSync('public/assets/river-rescue/narration-en.wav',Buffer.concat([wav,audio]));
  console.log('Saved fixed 10-second English narration.');
}
main().catch(e=>{console.error(e.message);process.exit(1)});
