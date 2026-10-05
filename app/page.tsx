import Link from "next/link";
import { workshops } from "@/lib/workshops/registry";
import CharacterSprite from "@/components/CharacterSprite";

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Curious Lab home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>Curious Lab</span>
        </Link>
        <div className="topbar-note"><span className="online-dot" /> Learn by making</div>
      </header>

      <section className="welcome-panel">
        <div className="welcome-copy">
          <p className="eyebrow">STORIES · ART · SCIENCE</p>
          <h1>A little wonder.<br /><span>A big discovery.</span></h1>
          <p className="welcome-description">Turn your curiosity into playful experiments. Draw, make a guess, and see what happens.</p>
          <a className="scroll-cue" href="#workshops"><span>↓</span> Explore a workshop</a>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <CharacterSprite pose="curious" className="hero-bunny" />
          <div className="art-caption">Every adventure starts with “what if?”</div>
        </div>
      </section>

      <section className="workshop-section" id="workshops">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR NEXT ADVENTURE</p>
            <h2>Choose a workshop</h2>
          </div>
          <span className="section-count">{workshops.length} {workshops.length === 1 ? "workshop" : "workshops"}</span>
        </div>

        <div className="workshop-grid">
          {workshops.map((workshop, index) => (
            <article className="workshop-card" key={workshop.id}>
              <Link className="workshop-card-link" href={`/workshops/${workshop.slug}`}>
                <div className={`card-art card-art-${index + 1}`} aria-hidden="true">
                  <span className="chapter-ribbon">CHAPTER 01</span>
                  <CharacterSprite pose="curious" className="card-bunny" />
                  <CharacterSprite pose="friend" className="card-friend" />
                </div>
                <div className="card-content">
                  <div className="card-meta"><span>Ages {workshop.ageRange}</span><span className="meta-dot">·</span><span>Creative challenge</span></div>
                  <h3>{workshop.title}</h3>
                  <p>{workshop.description}</p>
                  <div className="card-footer"><span>Start exploring</span><span className="arrow-circle">↗</span></div>
                </div>
              </Link>
            </article>
          ))}

          <div className="coming-card" aria-label="More workshops coming soon">
            <div className="coming-icon">＋</div>
            <strong>More adventures are on the way</strong>
            <span>New science stories are coming soon</span>
          </div>
        </div>
      </section>

      <footer className="site-footer"><span>Curiosity is the best tool for every experiment.</span><span>Made for curious minds ✦</span></footer>
    </main>
  );
}
