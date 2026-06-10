# Propstical Telegram Bot — Setup

Same renovation-advisor brain as the WhatsApp version, but on Telegram
— no Meta, no business verification, no "prohibited" walls.

---

## 1 · Create `.env.local`

In the project root, create a file called `.env.local` (same folder as
`package.json`). Paste this, replacing the placeholders:

```
TELEGRAM_BOT_TOKEN=8744061225:AAGnlnGKErGfwmZgf3sk_6g8XqQDrEo38bQ

AI_PROVIDER=openrouter
AI_API_KEY=<paste your OpenRouter key>
AI_MODEL=anthropic/claude-sonnet-4-5

# Optional — enables voice notes
OPENAI_API_KEY=

# Optional — conversations survive restarts if you set these
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Get the OpenRouter key at https://openrouter.ai/settings/keys (free
signup, free Nvidia Nemotron models available if you don't want to
add credits).

---

## 2 · Run the app

```bash
cd propstical-canvas
npm install
npm run dev
```

Server runs on `http://localhost:3000`. Keep this terminal open.

---

## 3 · Expose your localhost with ngrok

Telegram needs a public HTTPS URL to send webhooks to. In a **new
terminal**:

```bash
npx ngrok http 3000
```

It prints something like:
```
Forwarding  https://a1b2c3d4.ngrok-free.app -> http://localhost:3000
```

Copy that `https://...ngrok-free.app` URL.

---

## 4 · Register the webhook with Telegram

In a **third terminal**, run this ONE command (replace both values):

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<YOUR_NGROK>.ngrok-free.app/api/telegram"
```

For your token that's:

```bash
curl "https://api.telegram.org/bot8744061225:AAGnlnGKErGfwmZgf3sk_6g8XqQDrEo38bQ/setWebhook?url=https://YOURNGROK.ngrok-free.app/api/telegram"
```

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

## 5 · Test it

Open Telegram → search for your bot's username (whatever you named it
when talking to @BotFather) → tap **Start**.

Try these:
- `/start` → welcome message
- "Hi, I'm renovating a 2BHK in Bandra, budget ₹12L"
- "Contractor quoted ₹1.8L for waterproofing"
- Send a photo of any room
- Send a voice note (if you set `OPENAI_API_KEY`)
- `/reset` → clears memory

---

## 6 · Production deploy (Vercel — 5 min)

When you're ready to go live:

```bash
npm install -g vercel
vercel
```

In the Vercel dashboard → **Project Settings → Environment Variables**:
paste every key from your `.env.local` into the Production environment.

Your production URL becomes e.g. `https://propstical.vercel.app`.
Re-register the webhook pointing at the new URL:

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://propstical.vercel.app/api/telegram"
```

Done. ngrok can be shut down — Vercel handles traffic 24/7.

---

## Troubleshooting

**Bot doesn't reply at all**
- Is `npm run dev` still running?
- Is ngrok still running (it expires free sessions after ~2 hours)?
- Hit `http://localhost:3000/api/telegram` in your browser — you
  should see `{"ok":true,"bot":"propstical-telegram","configured":true}`.
  If `configured` is false, your `.env.local` isn't being read —
  restart `npm run dev`.

**"Webhook was not set"**
- The ngrok URL must be `https://`, not `http://`.
- Only one webhook can be active at a time per bot. Run this to check:
  `curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"`

**Bot replies with "My brain hiccupped"**
- Your `AI_API_KEY` is wrong or out of credits. Check the terminal
  where `npm run dev` runs — the real error logs there.

**Images aren't being understood**
- `AI_MODEL` must be vision-capable. Claude Sonnet 4.5, GPT-4o, and
  Gemini 2.5 Pro work. DeepSeek, Mistral Small, and Nemotron do not.

---

## Security — important

The token in this file is visible to anyone who can read this repo.
Once testing works, rotate it:

1. Open Telegram → message @BotFather → `/revoke`
2. Pick your bot → BotFather gives you a new token
3. Update `TELEGRAM_BOT_TOKEN` in `.env.local` (and in Vercel env
   vars if deployed)
4. Re-run the `setWebhook` curl with the new token
