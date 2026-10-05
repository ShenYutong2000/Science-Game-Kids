import type { CSSProperties } from "react";

export type CharacterPose = "curious" | "thinking" | "celebrate" | "friend";

export default function CharacterSprite({ pose = "curious", className = "", style }: {
  pose?: CharacterPose;
  className?: string;
  style?: CSSProperties;
}) {
  return <span className={`character-sprite pose-${pose} ${className}`} style={style} aria-hidden="true" />;
}
