# Propstical Canvas

**India's first AI home-decision canvas. See it before you spend on it.**

The average Indian homeowner wastes ₹2.1 Lakh on renovation mistakes they could have caught before signing. Contractors upsell. Designers push preferred vendors. Every existing tool — Livspace, HomeLane, Pinterest — profits when you commit. Nobody profits from helping you think clearly first.

Propstical Canvas is the pre-decision tool. Drop every variable you are juggling — materials, quotes, room dimensions, budget, inspiration, worries — onto a spatial canvas, and the AI quietly classifies them, finds the conflicts between them, and surfaces the one insight that will save you from a ₹2 Lakh mistake.

---

## How it works

1. **Drop in every variable.** Type a material (*"Italian marble, ₹350/sqft"*), a contractor quote, a room dimension, a budget line, a style inspiration, or a worry. Paste a product URL. Press Enter.

2. **The AI classifies it.** Every note is automatically typed — **Material**, **Contractor Quote**, **Open Question**, **Specification**, **Risk / Concern**, **Preference**, **Inspiration**, **Option Compare**, and more.

3. **It flags hidden costs.** Each note is enriched with a 2–4 sentence annotation tuned for Indian tier-1 cities: realistic ₹ ranges, commonly excluded items (waterproofing, GST, labour), compatibility with monsoon / hard water / society bye-laws.

4. **It maps conflicts.** The AI draws connection lines between notes that interact — your marble choice vs your budget, your layout vs your room dimensions, your quote vs the specs it silently excludes.

5. **It surfaces a Decision Score.** Once the canvas has enough context, Propstical emits a sharp 18–28 word insight on the single biggest pre-commitment risk: a budget gap, a rework risk, a resale concern, or a missing spec. Solidify it into your brief, or dismiss and keep thinking.

Three views: **Tiling** (spatial grid), **Kanban** (grouped by type — to-dos and open questions float to the top), **Graph** (force-directed — load-bearing decisions drift to the centre).

---

## Setup

**Requirements**: a desktop browser and an API key from one of the supported providers (OpenRouter recommended — free models available).

```bash
cd propstical-canvas
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

**Add your API key**: menu icon (top-left) → Settings → choose provider → paste your key. The key is stored in your browser's `localStorage` and goes directly to the AI provider — it never touches a Propstical server.

**Enable web grounding** (optional): lets the AI cite real sources for contractor claims, material specs, and vendor statements. Supported on OpenRouter `:online` models and OpenAI search-preview models.

---

## Providers & Models

### OpenRouter *(default)*

Create a free account at [openrouter.ai](https://openrouter.ai). Use the free-tier models with no credits, or add credits for GPT-4o, Claude Sonnet, Gemini.

| Model | Notes |
|---|---|
| `anthropic/claude-sonnet-4-5` | **Recommended for Propstical** — strong reasoning, best at flagging subtle renovation conflicts. |
| `openai/gpt-4o` | Strong annotation quality, web grounding. |
| `google/gemini-2.5-pro` | Long context, web grounding. |

Free tier (no credits, ~200 req/day):
- `nvidia/nemotron-3-nano-30b-a3b:free`
- `nvidia/nemotron-3-super-120b-a12b:free`

### OpenAI *(direct)*
`gpt-4o` · `gpt-4o-mini` · `gpt-4.1` · `o4-mini`

### Z.ai
`glm-4.7` · `glm-5` · `glm-5-turbo`

---

## Keyboard shortcuts

| | |
|---|---|
| `Enter` | Add note |
| `⌘K` | Command palette |
| `⌘Z` | Undo |
| `Escape` | Deselect / close panels |

Double-click any note to edit. Click the type label to reclassify manually.

---

## Force a type with `#type`

Start your note with a shorthand to override AI classification:

- `#entity` — a material or product
- `#claim` — a contractor quote or price statement
- `#definition` — a specification (size, finish, grade)
- `#question` — an unresolved question
- `#reflection` — a risk / concern you're flagging
- `#opinion` — a personal preference
- `#comparison` — compare two or more options
- `#task` — a to-do

---

## Data

Everything lives in your browser. No account, no Propstical server, no database.

- Notes are persisted to `localStorage` under `nodepad-projects` (the underlying serialisation format is shared with the upstream open-source engine, so exports are portable)
- Export to `.md` (a contractor-ready brief) or `.nodepad` (versioned JSON) via `⌘K`
- Import `.nodepad` files via the sidebar

---

## Tech

Next.js · React 19 · TypeScript · Tailwind CSS v4 · D3.js · Framer Motion

---

## Credits

Propstical Canvas is built on the open-source **[Nodepad](https://github.com/mskayyali/nodepad)** spatial-thinking engine by [Saleh Kayyali](http://mskayyali.com), licensed MIT. We kept the spatial canvas, AI classification pipeline, and graph/kanban/tiling view logic, and reframed the domain (note types, system prompts, synthesis engine, UI copy) for Indian home-renovation decisions.

---

## License

MIT (inherited from upstream Nodepad).
