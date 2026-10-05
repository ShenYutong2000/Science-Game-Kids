"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[] };
type DrawingMode = "draw" | "preview";

const colors = [
  { name: "coral", value: "#e96d78" },
  { name: "orange", value: "#f2a34a" },
  { name: "yellow", value: "#f2d35d" },
  { name: "green", value: "#55ad91" },
  { name: "blue", value: "#629bd0" },
  { name: "purple", value: "#9a79c9" },
  { name: "dark gray", value: "#263b38" },
];

export default function IdeaDrawingBoard({
  mode,
  drawing,
  onDrawingChange,
}: {
  mode: DrawingMode;
  drawing: string | null;
  onDrawingChange: (drawing: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseDrawingRef = useRef<HTMLImageElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(colors[0].value);
  const [brushSize, setBrushSize] = useState(8);
  const [hasDrawing, setHasDrawing] = useState(Boolean(drawing));
  const [canUndo, setCanUndo] = useState(false);

  const redraw = (publish = false) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.lineCap = "round";
    context.lineJoin = "round";

    if (baseDrawingRef.current) context.drawImage(baseDrawingRef.current, 0, 0, bounds.width, bounds.height);

    for (const stroke of strokesRef.current) {
      if (stroke.points.length === 0) continue;
      context.beginPath();
      context.strokeStyle = stroke.color;
      context.fillStyle = stroke.color;
      context.lineWidth = stroke.size;
      const first = stroke.points[0];
      context.moveTo(first.x * bounds.width, first.y * bounds.height);
      if (stroke.points.length === 1) {
        context.arc(first.x * bounds.width, first.y * bounds.height, stroke.size / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        for (const point of stroke.points.slice(1)) {
          context.lineTo(point.x * bounds.width, point.y * bounds.height);
        }
        context.stroke();
      }
    }
    if (publish && strokesRef.current.length > 0) onDrawingChange(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (drawing) {
      const image = new Image();
      image.onload = () => {
        baseDrawingRef.current = image;
        setHasDrawing(true);
        redraw();
      };
      image.src = drawing;
    } else {
      redraw();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => redraw(true));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  };

  const startStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    strokesRef.current.push({ color, size: brushSize, points: [getPoint(event)] });
    redraw();
  };

  const continueStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw" || !drawingRef.current) return;
    event.preventDefault();
    const activeStroke = strokesRef.current.at(-1);
    activeStroke?.points.push(getPoint(event));
    redraw();
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const nextDrawing = canvas?.toDataURL("image/png") ?? null;
    setHasDrawing(Boolean(baseDrawingRef.current) || strokesRef.current.length > 0);
    setCanUndo(strokesRef.current.length > 0);
    onDrawingChange(nextDrawing);
  };

  const undo = () => {
    strokesRef.current.pop();
    redraw();
    const hasContent = Boolean(baseDrawingRef.current) || strokesRef.current.length > 0;
    setHasDrawing(hasContent);
    setCanUndo(strokesRef.current.length > 0);
    onDrawingChange(hasContent ? canvasRef.current?.toDataURL("image/png") ?? null : null);
  };

  const clear = () => {
    strokesRef.current = [];
    baseDrawingRef.current = null;
    redraw();
    setHasDrawing(false);
    setCanUndo(false);
    onDrawingChange(null);
  };

  return (
    <div className={`idea-board${mode === "preview" ? " is-preview" : ""}`}>
      {mode === "draw" ? (
        <>
          <div className="drawing-toolbar">
            <span className="drawing-label">DRAW YOUR IDEA</span>
            <div className="drawing-colors" role="group" aria-label="Choose a color">
              {colors.map((swatch) => (
                <button
                  key={swatch.name}
                  className={`color-swatch${color === swatch.value ? " is-selected" : ""}`}
                  type="button"
                  style={{ "--swatch-color": swatch.value } as React.CSSProperties}
                  aria-label={`Choose ${swatch.name}`}
                  aria-pressed={color === swatch.value}
                  onClick={() => setColor(swatch.value)}
                />
              ))}
            </div>
          </div>
          <div className="drawing-tools">
            <label className="brush-control">
              <span>Brush</span>
              <input
                type="range"
                min="3"
                max="18"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                aria-label="Brush size"
              />
            </label>
            <button className="drawing-tool-button" type="button" onClick={undo} disabled={!canUndo}>Undo</button>
            <button className="drawing-tool-button" type="button" onClick={clear} disabled={!hasDrawing}>Clear</button>
          </div>
        </>
      ) : (
        <div className="drawing-preview-heading"><span className="drawing-ready-icon" aria-hidden="true">✦</span>Your drawing</div>
      )}
      <div className="drawing-surface" aria-describedby={mode === "draw" ? "drawing-hint" : undefined}>
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          aria-label={mode === "draw" ? "Draw your idea here" : "Preview of your drawing"}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>
      {mode === "draw" && <p className="drawing-hint" id="drawing-hint">Use your imagination. There is no single right answer.</p>}
    </div>
  );
}
