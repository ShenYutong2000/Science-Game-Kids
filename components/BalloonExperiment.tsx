"use client";

import { useEffect, useState, type CSSProperties } from "react";
import CharacterSprite from "@/components/CharacterSprite";

type BalloonExperimentProps = {
  drawing: string | null;
  onEditDrawing?: () => void;
};

const MINIMUM_LIFT_SIZE = 70;

export default function BalloonExperiment({ drawing, onEditDrawing }: BalloonExperimentProps) {
  const sourceArtwork = drawing;
  const [balloonSize, setBalloonSize] = useState(36);
  const [croppedArtwork, setCroppedArtwork] = useState(sourceArtwork);
  const [isCrossing, setIsCrossing] = useState(false);
  const [hasCrossed, setHasCrossed] = useState(false);
  const [isTugging, setIsTugging] = useState(false);
  const [tooSmall, setTooSmall] = useState(false);
  const [showForces, setShowForces] = useState(true);
  const [message, setMessage] = useState("Choose a balloon size, then test your idea.");

  useEffect(() => {
    setCroppedArtwork(sourceArtwork);
    if (!sourceArtwork) return;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      const source = document.createElement("canvas");
      source.width = image.naturalWidth;
      source.height = image.naturalHeight;
      const sourceContext = source.getContext("2d", { willReadFrequently: true });
      if (!sourceContext) return;
      sourceContext.drawImage(image, 0, 0);

      const { data, width, height } = sourceContext.getImageData(0, 0, source.width, source.height);
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (data[(y * width + x) * 4 + 3] > 8) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX < minX || maxY < minY) return;
      const padding = Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * 0.035);
      const cropLeft = Math.max(0, minX - padding);
      const cropTop = Math.max(0, minY - padding);
      const cropRight = Math.min(width, maxX + padding + 1);
      const cropBottom = Math.min(height, maxY + padding + 1);
      const cropped = document.createElement("canvas");
      cropped.width = cropRight - cropLeft;
      cropped.height = cropBottom - cropTop;
      cropped.getContext("2d")?.drawImage(source, cropLeft, cropTop, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      if (!cancelled) setCroppedArtwork(cropped.toDataURL("image/png"));
    };
    image.src = sourceArtwork;
    return () => {
      cancelled = true;
      image.onload = null;
    };
  }, [sourceArtwork]);

  useEffect(() => {
    if (!isCrossing) return;
    const timer = window.setTimeout(() => {
      setIsCrossing(false);
      setHasCrossed(true);
      setMessage(`Bunny crossed with a ${balloonSize}% balloon! Try a smaller size to find the smallest one that still works.`);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [isCrossing, balloonSize]);

  useEffect(() => {
    if (!isTugging) return;
    const timer = window.setTimeout(() => setIsTugging(false), 750);
    return () => window.clearTimeout(timer);
  }, [isTugging]);

  function testBalloon() {
    if (isCrossing) return;
    setIsTugging(false);
    if (balloonSize < MINIMUM_LIFT_SIZE) {
      setMessage("A little tug… but Bunny stays on the bank. The upward lift is not strong enough yet. What could you change?");
      setTooSmall(true);
      setIsTugging(true);
      return;
    }

    setTooSmall(false);
    setMessage("Enough lift! A gentle breeze carries Bunny toward the other bank.");
    setHasCrossed(false);
    setIsCrossing(true);
  }

  function changeBalloonSize(value: number) {
    setBalloonSize(value);
    setIsTugging(false);
    setHasCrossed(false);
    setTooSmall(false);
    setMessage("You changed the size. Make a prediction, then test your idea.");
  }

  function resetExperiment() {
    setBalloonSize(36);
    setHasCrossed(false);
    setIsCrossing(false);
    setTooSmall(false);
    setIsTugging(false);
    setMessage("Choose a balloon size, then test your idea.");
  }

  const liftPercent = Math.round((balloonSize / 100) * 100);
  const balloonDiameter = 7 + balloonSize * .07;
  const sceneStyle = {
    "--balloon-size": `${balloonDiameter}cqw`,
    "--balloon-height": `${balloonDiameter * 1.12}cqw`,
  } as CSSProperties;

  return (
    <section className="lesson-layout experiment-layout" aria-label="Balloon lift experiment">
      <div className={`game-frame experiment-frame storybook-experiment${hasCrossed ? " rescue-complete" : ""}`}>
        <div className="painted-river" aria-hidden="true" />
        <CharacterSprite pose="friend" className="waiting-friend" />
        <div
          className={`rescue-rig${isCrossing ? " is-crossing" : ""}${isTugging ? " is-tugging" : ""}${hasCrossed ? " has-crossed" : ""}`}
          style={sceneStyle}
          role="img"
          aria-label={hasCrossed ? "Bunny has crossed the river" : "Bunny with your adjustable balloon"}
        >
          <div className={`experiment-balloon${croppedArtwork ? " child-art-balloon" : ""}`} aria-hidden="true">
            {croppedArtwork ? <img src={croppedArtwork} alt="" draggable="false" /> : <span />}
          </div>
          <div className="balloon-string" aria-hidden="true" />
          <CharacterSprite pose={hasCrossed ? "celebrate" : tooSmall ? "thinking" : "curious"} className="experiment-bunny" />
          <span className="rig-sparkle sparkle-left" aria-hidden="true">✦</span>
          <span className="rig-sparkle sparkle-right" aria-hidden="true">✦</span>
        </div>
        <div className="experiment-scene-label" aria-live="polite">
          {hasCrossed ? "✦ TOGETHER AT LAST! ✦" : isCrossing ? "A LITTLE LIFT, A LITTLE BREEZE…" : "YOUR IDEA, BROUGHT TO LIFE"}
        </div>
        {showForces && !isCrossing && !hasCrossed && (
          <div className="force-diagram" aria-label={`Upward lift ${balloonSize} model units. Downward weight 69 model units.`}>
            <div className="force-column force-lift"><span className="force-shaft" style={{ height: `${balloonSize * .55}px` }} /><strong>Lift</strong><small>pushes up</small></div>
            <div className="force-column force-weight"><span className="force-shaft" /><strong>Weight</strong><small>pulls down</small></div>
          </div>
        )}
        {tooSmall && <div className="scene-feedback" role="status"><strong>Not quite yet…</strong><span>Bunny is safe. Try changing the size!</span></div>}
        {hasCrossed && <>
          <div className="celebration-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>
          <div className="scene-feedback success-feedback" role="status"><strong>You made a discovery!</strong><span>Two happy friends. One wonderful idea.</span></div>
        </>}
      </div>

      <aside className="lesson-card experiment-card" aria-live="polite">
        <div className="lesson-card-icon">🎈</div>
        <p className="eyebrow">BALLOON LIFT EXPERIMENT</p>
        <h2>{hasCrossed ? <>Bunny made<br />it across!</> : <>Can your balloon<br />lift Bunny?</>}</h2>
        <p className="lesson-description">{hasCrossed ? "You found a size with enough lift. What happens if you try a smaller balloon?" : "Make the balloon bigger or smaller. A bigger balloon can lift more, but will yours be big enough?"}</p>

        <div className="experiment-controls">
          <label className="balloon-size-label" htmlFor="balloon-size">
            <span>Balloon size</span>
            <output htmlFor="balloon-size">{balloonSize}%</output>
          </label>
          <input
            id="balloon-size"
            className="balloon-size-slider"
            type="range"
            min="20"
            max="100"
            value={balloonSize}
            disabled={isCrossing}
            onChange={(event) => changeBalloonSize(Number(event.target.value))}
            aria-valuetext={`${balloonSize} percent balloon size`}
          />
          <div className="lift-meter" aria-label={`Lift power ${liftPercent} percent`}>
            <div className="lift-meter-heading"><span>Lift power</span><strong>{liftPercent}%</strong></div>
            <div className="lift-meter-track"><span style={{ width: `${liftPercent}%` }} /></div>
          </div>
          <label className="force-toggle"><input type="checkbox" checked={showForces} onChange={e => setShowForces(e.target.checked)} /> Show the force arrows</label>
          <p className={`experiment-message${hasCrossed ? " is-success" : ""}${balloonSize < MINIMUM_LIFT_SIZE && !hasCrossed ? " is-hint" : ""}`} role="status">{message}</p>
          {hasCrossed && (
            <div className="discovery-note" role="note">
              <span className="discovery-note-icon" aria-hidden="true">💡</span>
              <div className="discovery-note-copy">
                <strong>What made it work?</strong>
                <p>A helium-filled balloon displaces air. A larger volume can provide more lift. When the lift is greater than Bunny’s weight, Bunny rises. Our gentle breeze carries him across.</p>
              </div>
            </div>
          )}
          {hasCrossed ? (
            <button className="primary-button experiment-button" type="button" onClick={resetExperiment}>Try another size <span aria-hidden="true">↻</span></button>
          ) : (
            <button className="primary-button experiment-button" type="button" disabled={isCrossing} onClick={testBalloon}>
              {isCrossing ? "Bunny is on the way…" : "Test my balloon"}<span aria-hidden="true">{isCrossing ? "…" : "→"}</span>
            </button>
          )}
        </div>

          {drawing && (
            <div className="drawing-inspiration">
            <img src={drawing} alt="Your drawing that inspired this experiment" />
              <span><strong>Your drawing is in the scene.</strong><br />Try changing one thing at a time.</span>
          </div>
          )}
        {drawing && onEditDrawing && (
          <button className="secondary-button experiment-edit-button" type="button" onClick={onEditDrawing}>← Edit my drawing</button>
        )}
        <p className="coming-note">A simplified model with helium inside and a gentle breeze. An air-filled party balloon does not lift Bunny.</p>
      </aside>
    </section>
  );
}
