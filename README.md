# Science Game Kids

A playful home for short, interactive science workshops for children.

## Getting started

Requires Node.js 20.9 or later.

The current workshop uses the child's drawing directly in the balloon experiment. No API key is needed to draw, resize the balloon, or test the crossing.

An optional drawing-classification API route is available for future use. To configure it, copy `.env.example` to `.env.local` and add an OpenAI API key:

```env
OPENAI_API_KEY=your_real_key_here
```

Keep the API key in the server environment; never add a real key to browser code or commit it to the repository. The current workshop does not send drawings to an AI service.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page lists available workshops. Select **River Rescue** to open its workshop page.

```bash
npm run build
npm start
```

## Project structure

- `app/` — website routes and shared styles
- `components/` — reusable story player, drawing board, character sprites, and experiment interface
- `lib/workshops/` — shared workshop type and workshop definitions
- `public/assets/river-rescue/` — generated illustrations, a 10-second WebM film, English VTT subtitles, and art direction with generation prompts
- `scripts/` — reproducible film assembly and optional narration generation

The River Rescue workshop includes a 10-second illustrated story, a drawing board, and a balloon lift simulation. Every submitted drawing is treated as a balloon, placed above Bunny, and resized with the experiment slider. Children can return to edit their drawing and test it again. The previous `/workshops/balloon-river` address redirects to `/workshops/river-rescue`.

## Story and teaching assets

The original artwork follows a warm painted storybook direction: golden sunset light, lavender clouds, layered green riverbanks, and cream paper panels. The image-generation prompts and 2×2 character atlas layout are recorded in `public/assets/river-rescue/art-direction.json`. The background is clean, with no characters or solution objects. Rabbit poses are curious, thinking, and celebrating; the fourth atlas cell is the squirrel friend.

`intro.webm` is a 960×540, 12 fps, 10-second silent film assembled from these assets. `captions-en.vtt` contains the three English narration lines and their timings. The website provides synchronized captions, pause, replay, skip, and an English synthetic browser voice when installed. Voice availability varies by device; the story remains usable with captions and a transcript.

Fixed narration audio is **not yet included**: the speech API returned HTTP 429 `credit_balance_exhausted` during production. `scripts/generate-narration.cjs` can create a timed WAV using a funded API account; it does not run during ordinary gameplay. After producing and reviewing that WAV, connect it to the story player in place of browser speech. API reference: https://developers.openai.com/api/docs/guides/text-to-speech

Rebuild the silent film with `node scripts/build-story.cjs` (uses the Sharp package installed with Next.js). The simulation shares the same background and characters. Force arrows compare lift with Bunny's weight; unsuccessful tests keep Bunny safely on the bank, and successful tests end with a celebration and a discovery card. This is a simplified helium-balloon model with a gentle breeze for horizontal motion, not a prediction for an ordinary air-filled balloon.
