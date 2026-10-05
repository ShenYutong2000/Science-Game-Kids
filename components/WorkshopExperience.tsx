"use client";

import { useState } from "react";
import BalloonExperiment from "@/components/BalloonExperiment";
import IdeaDrawingBoard from "@/components/IdeaDrawingBoard";
import StoryStage from "@/components/StoryStage";

type ExperienceStage = "story" | "drawing" | "balloon";

export default function WorkshopExperience() {
  const [storyComplete, setStoryComplete] = useState(false);
  const [stage, setStage] = useState<ExperienceStage>("story");
  const [drawing, setDrawing] = useState<string | null>(null);
  if (stage === "balloon") {
    return (
      <BalloonExperiment
        drawing={drawing}
        onEditDrawing={() => setStage("drawing")}
      />
    );
  }

  return (
    <section className="lesson-layout" aria-label="River rescue story and activity">
      <div className={`game-frame${stage !== "story" ? " idea-frame" : ""}`}>
        {stage === "story" ? (
          <StoryStage
            onStoryComplete={() => setStoryComplete(true)}
            onStoryStart={() => setStoryComplete(false)}
          />
        ) : (
          <IdeaDrawingBoard mode="draw" drawing={drawing} onDrawingChange={setDrawing} />
        )}
      </div>

      <aside className="lesson-card" aria-live="polite">
        <div className="lesson-card-icon">{stage === "drawing" ? "🎨" : storyComplete ? "💡" : "🌈"}</div>
        <p className="eyebrow">{stage === "drawing" ? "IMAGINATION STUDIO" : storyComplete ? "YOUR TURN TO THINK" : "YOUR STORY BEGINS"}</p>
        <h2>
          {stage === "drawing" ? <>Every rescue starts<br />with an idea.</> : storyComplete ? <>How could Bunny<br />cross the river?</> : <>A little friend.<br />A big adventure.</>}
        </h2>
        <p className="lesson-description">
          {stage === "drawing"
            ? "What would you make to help Bunny? Draw your idea in your own way."
            : storyComplete
              ? "Think about how Bunny could get to the other side. When you are ready, draw your idea."
              : "Watch Bunny meet a friend across the river. Think about how Bunny might reach the other side."}
        </p>

        {(stage === "story" || stage === "drawing") && (
          <div className="workshop-steps" aria-label="Workshop steps">
            <div className={`workshop-step${!storyComplete ? " is-current" : " is-complete"}`}>
              <span>{storyComplete ? "✓" : "1"}</span><span>Watch the story</span>
            </div>
            <div className={`workshop-step${storyComplete && stage === "story" ? " is-current" : stage === "drawing" ? " is-complete" : ""}`}>
              <span>{stage === "drawing" ? "✓" : "2"}</span><span>Think of an idea</span>
            </div>
            <div className={`workshop-step${stage === "drawing" ? " is-current" : ""}`}>
              <span>3</span><span>Draw and test it</span>
            </div>
          </div>
        )}

        {stage === "story" && (
          <button className="primary-button drawing-entry-button" type="button" disabled={!storyComplete} onClick={() => setStage("drawing")}>
            {storyComplete ? "I have an idea" : "Watch the story first"}<span aria-hidden="true">→</span>
          </button>
        )}
        {stage === "drawing" && (
          <>
            <button className="primary-button drawing-entry-button" type="button" disabled={!drawing} onClick={() => setStage("balloon")}>
              Put it in the scene <span aria-hidden="true">→</span>
            </button>
            <button className="secondary-button" type="button" onClick={() => setStage("story")}>
              ← Back to the story
            </button>
          </>
        )}
        <p className="coming-note">
          {stage === "drawing" ? "Your idea belongs to you. Keep exploring, keep imagining." : storyComplete ? "Take your time. There is no timer." : "Press play. Watch, wonder, then make something of your own."}
        </p>
      </aside>
    </section>
  );
}
