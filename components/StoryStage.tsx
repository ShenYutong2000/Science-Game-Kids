"use client";

import { useEffect, useRef, useState } from "react";
import CharacterSprite from "@/components/CharacterSprite";
import { STORY_BEATS, STORY_DURATION } from "@/lib/workshops/river-story";

export default function StoryStage({ onStoryComplete, onStoryStart }: {
  onStoryComplete: () => void;
  onStoryStart: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const lastBeat = useRef(-1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [voice, setVoice] = useState(true);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const caption = STORY_BEATS.find(beat => time < beat.end)?.text ?? STORY_BEATS[2].text;

  function narrate(text: string, enabled = voice) {
    if (!enabled) return;
    if (!("speechSynthesis" in window)) { setVoiceUnavailable(true); return; }
    const synth = window.speechSynthesis;
    const englishVoice = synth.getVoices().find(v => v.lang.startsWith("en"));
    if (!englishVoice) { setVoiceUnavailable(true); return; }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = englishVoice;
    utterance.lang = englishVoice.lang;
    utterance.rate = 1.08;
    utterance.onerror = event => {
      if (event.error !== "canceled" && event.error !== "interrupted") setVoiceUnavailable(true);
    };
    setVoiceUnavailable(false);
    synth.speak(utterance);
  }

  useEffect(() => {
    window.speechSynthesis?.getVoices();
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  function finish() {
    video.current?.pause(); window.speechSynthesis?.cancel();
    if (video.current && Number.isFinite(video.current.duration)) video.current.currentTime = Math.max(0, video.current.duration - .05);
    setTime(STORY_DURATION); setPlaying(false); setFinished(true); onStoryComplete();
  }
  async function play() {
    if (error) { finish(); return; }
    const film = video.current;
    if (!film) return;
    if (finished) { film.currentTime = 0; setTime(0); setFinished(false); }
    if (film.currentTime < .1) onStoryStart();
    lastBeat.current = Math.max(0, STORY_BEATS.findIndex(b => film.currentTime < b.end));
    try { await film.play(); narrate(STORY_BEATS[lastBeat.current].text); }
    catch { setError(true); }
  }
  function pause() { video.current?.pause(); window.speechSynthesis?.cancel(); }
  function updateTime() {
    const next = video.current?.currentTime ?? 0;
    if (!finished) setTime(next);
    const beat = STORY_BEATS.findIndex(b => next < b.end);
    if (playing && beat >= 0 && beat !== lastBeat.current) { lastBeat.current = beat; narrate(STORY_BEATS[beat].text); }
  }

  return (
    <div className="storybook-player">
      <div className="cinematic-scene">
        <video ref={video} src="/assets/river-rescue/intro.webm" poster="/assets/river-rescue/river-background.png" playsInline preload="auto"
          aria-label="Ten-second story: Bunny meets a wide river while a squirrel friend waits across it."
          onLoadedData={() => { setReady(true); if (finished && video.current) video.current.currentTime = Math.max(0, video.current.duration - .05); }} onError={() => setError(true)} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={finish} onTimeUpdate={updateTime}>
          <track kind="captions" src="/assets/river-rescue/captions-en.vtt" srcLang="en" label="English" />
        </video>
        {error && <div className="story-fallback"><CharacterSprite pose="thinking" /><CharacterSprite pose="friend" /></div>}
        <span className="chapter-stamp">CHAPTER 01 <span>Two friends. One river.</span></span>
        {!playing && !finished && (
          <button type="button" className="story-play" disabled={!ready && !error} onClick={play}>
            <span aria-hidden="true">{error ? "→" : "▶"}</span>{error ? "Read the story below, then continue" : !ready ? "Opening the story…" : time > 0 ? "Continue story" : "Play the story"}
            <small>{error ? "Film could not load" : "10 seconds · English captions"}</small>
          </button>
        )}
        {(playing || finished || time > 0) && <p className="cinematic-caption" aria-live="polite">{caption}</p>}
      </div>
      <div className="cinematic-controls">
        <button type="button" disabled={!ready && !error} onClick={playing ? pause : play}>{finished ? "↻ Watch again" : playing ? "Ⅱ Pause" : "▶ Play"}</button>
        <div className="story-progress" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={10} aria-valuenow={Math.floor(time)}><span style={{ width: `${time * 10}%` }} /></div>
        <span className="story-time">{Math.floor(time)} / 10s</span>
        <button type="button" aria-pressed={voice} onClick={() => { setVoice(!voice); if (voice) window.speechSynthesis?.cancel(); else if (playing) narrate(caption, true); }}>{voice ? "Voice on" : "Voice off"}</button>
        {!finished && <button type="button" onClick={finish}>Skip →</button>}
      </div>
      {voiceUnavailable && <p className="voice-note" role="status">English voice is unavailable on this device. Follow the captions.</p>}
      <details className="story-transcript"><summary>Read the story</summary><p>{STORY_BEATS.map(b => b.text).join(" ")}</p><p>Narration uses a synthetic English voice when available on your device.</p><a href="/assets/river-rescue/intro.webm" download>Download the silent story film</a><span> · </span><a href="/assets/river-rescue/captions-en.vtt" download>English captions</a></details>
    </div>
  );
}
