import Link from "next/link";
import { notFound } from "next/navigation";
import WorkshopExperience from "@/components/WorkshopExperience";
import { getWorkshopBySlug, workshops } from "@/lib/workshops/registry";

export function generateStaticParams() {
  return workshops.map(({ slug }) => ({ slug }));
}

export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) notFound();

  return (
    <main className="site-shell workshop-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>Curious Lab</span>
        </Link>
        <Link className="back-link" href="/">← All workshops</Link>
      </header>

      <div className="lesson-heading">
        <div>
          <p className="eyebrow">WORKSHOP 01 · RIVER RESCUE</p>
          <h1>{workshop.title}</h1>
        </div>
        <span className="age-pill">Ages {workshop.ageRange}</span>
      </div>

      <WorkshopExperience />

      <footer className="site-footer"><span>Ready to observe, predict, and discover?</span><span>Workshop 01 / 01</span></footer>
    </main>
  );
}
