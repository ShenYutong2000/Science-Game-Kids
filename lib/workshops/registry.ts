import type { WorkshopDefinition } from "./types";

export const workshops: WorkshopDefinition[] = [
  {
    id: "river-rescue",
    slug: "river-rescue",
    title: "River Rescue",
    ageRange: "6–9",
    learningGoal: "Explore how a balloon’s volume affects lift.",
    description: "Can you invent a way to help Bunny meet a friend across the river?",
  },
];

export function getWorkshopBySlug(slug: string) {
  return workshops.find((workshop) => workshop.slug === slug);
}
