export const STORY_DURATION = 10;
export const STORY_BEATS = [
  { start: 0, end: 3.4, text: "Across the river, a friend is waiting." },
  { start: 3.4, end: 6.6, text: "But Bunny cannot hop that far." },
  { start: 6.6, end: 10, text: "How could Bunny cross the river?" },
];

/** One art composition shared by the live introduction and its final frozen frame. */
export function drawStoryFrame(ctx: CanvasRenderingContext2D, background: HTMLImageElement, characters: HTMLImageElement, time: number) {
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(background, 0, 0, w, h);
  const drawCharacter = (frame: number, x: number, ground: number, size: number) => {
    const cellW = characters.naturalWidth / 2;
    const cellH = characters.naturalHeight / 2;
    ctx.drawImage(characters, (frame % 2) * cellW, Math.floor(frame / 2) * cellH, cellW, cellH, x - size / 2, ground - size, size, size);
  };
  const progress = Math.min(1, time / 3.4);
  const hop = progress < 1 ? Math.abs(Math.sin(progress * Math.PI * 3)) * h * .025 : 0;
  drawCharacter(time < 3.4 ? 0 : 1, w * (.12 + progress * .12), h * .62 - hop, h * .28);
  drawCharacter(3, w * .82, h * .62 - (time < 10 ? Math.sin(time * 3) * 2 : 0), h * .24);
  // Small reflected highlights, with no solution objects in the introduction.
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(255,245,207,${.12 + .12 * Math.sin(time * 1.4 + i)})`;
    ctx.fillRect(w * (.40 + (i % 3) * .065), h * (.68 + i * .035), w * .025, 2);
  }
}
