import Link from "next/link";
import BalloonExperiment from "@/components/BalloonExperiment";

export default function BalloonExperimentPreviewPage() {
  return (
    <main className="site-shell workshop-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>Curious Lab</span>
        </Link>
        <Link className="back-link" href="/workshops/river-rescue">← River Rescue</Link>
      </header>

      <div className="lesson-heading">
        <div>
          <p className="eyebrow">INTERACTIVE PREVIEW</p>
          <h1>Balloon Lift Experiment</h1>
          <p>Try the balloon controls and crossing animation.</p>
        </div>
        <span className="age-pill">Ages 6–9</span>
      </div>

      <BalloonExperiment drawing={null} />

      <footer className="site-footer"><span>Change the balloon size, then test your idea.</span><span>River Rescue · Preview</span></footer>
    </main>
  );
}
