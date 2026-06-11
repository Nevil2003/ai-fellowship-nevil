# Propstical WhatsApp Bot — Setup

A neutral renovation advisor that Indian homeowners can WhatsApp. They
send contractor quotes, room photos, voice notes, budgets. The bot
catches conflicts, hidden costs, and surfaces a Decision Score before
they commit.

**Stack:** Meta WhatsApp Cloud API (free up to 1000 convos/month) → Next.js
webhook → same AI prompts as the web canvas → Supabase for per-phone
conversation memory.

---

## 1 · Meta app + WhatsApp product

1. Go to https://developers.facebook.com/apps → **Create App** → pick
   **Business** → name it "Propstical".
2. In the app dashboard, **Add Product → WhatsApp → Set up**.
3. Meta gives you a **test phone number** instantly (free, rate-limited).
   Note the **Phone number ID** — you'll need it.
4. Under **WhatsApp → API Setup → Access tokens**, copy the **temporary
   access token** for now (valid 24h — we'll swap it for a permanent
   token at step 5).
5. **Permanent token:** Business Settings → System Users → Add → grant
   `whatsapp_business_messaging` + `whatsapp_business_management` →
   Generate Token → **Never expires**. Use this as `WHATSAPP_TOKEN`.

---

## 2 · Deploy the webhook

You need a public HTTPS URL. For dev, use **ngrok** or **Vercel Preview**.

### Option A — ngrok (local dev)

```bash
npm install -g ngrok
npm run dev                 # runs on :3000
ngrok http 3000             # gives you https://xxxx.ngrok-free.app
```

### Option B — Vercel (production)

```bash
vercel --prod
```

Your webhook URL is: `https://<your-domain>/api/whatsapp`

---

## 3 · Configure env vars

Copy `.env.example` → `.env.local` (dev) or paste into Vercel's env vars
dashboard (prod). Fill in:

```
WHATSAPP_TOKEN=<permanent token from step 1.5>
WHATSAPP_PHONE_NUMBER_ID=<from step 1.3>
WHATSAPP_VERIFY_TOKEN=propstical-verify-change-me

AI_PROVIDER=openrouter
AI_API_KEY=<your OpenRouter key>
AI_MODEL=anthropic/claude-sonnet-4-5

# Optional — enables voice notes
OPENAI_API_KEY=<your OpenAI key>

# Optional — persists conversations across redeploys
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

If Supabase vars are missing, the bot falls back to in-memory storage
(fine for testing, lost on redeploy).

---

## 4 · Register the webhook with Meta

1. In your Meta app dashboard: **WhatsApp → Configuration → Webhook**.
2. Click **Edit** → paste:
   - **Callback URL**: `https://<your-domain>/api/whatsapp`
   - **Verify token**: the exact value you put in `WHATSAPP_VERIFY_TOKEN`
3. Click **Verify and save**. Meta hits `GET /api/whatsapp` with the
   token; our route responds 200 if it matches.
4. Under **Webhook fields**, subscribe to `messages`.

---

## 5 · Run the schema (if using Supabase)

Supabase SQL Editor → paste `supabase/schema.sql` → **Run**.
Creates the `bot_turns` table with deny-all RLS (only the
service-role key can read/write — the anon key sees nothing).

---

## 6 · Test it

From the Meta dashboard (**WhatsApp → API Setup**), send a test message
to your own number. Then from your phone, WhatsApp the test number:

- Send "hi" → should get the welcome message
- Send "contractor quoted ₹1.8L for waterproofing on a 2BHK" → should
  flag the quote is ~30% high and ask about area
- Send a photo of a bathroom → bot describes what it sees + flags concerns
- Send a voice note → transcribed + analyzed
- Send "/reset" → clears history

---

## 7 · Going live

The test number is rate-limited and sandbox-only. To message real
users, you need a **verified business** + a **display name approval**:

1. Meta Business Manager → **Business Settings → Business info** →
   complete verification (takes 1–5 days; requires GST cert, utility
   bill, etc.).
2. **WhatsApp → Phone Numbers → Add number** → use a number not
   currently registered with WhatsApp consumer app.
3. Submit display name for review (24–48h).
4. Once approved, swap `WHATSAPP_PHONE_NUMBER_ID` to the production
   number's ID. Same webhook, same code.

**Pricing after verification:**
- 1000 user-initiated conversations/month: **free**
- After that: ~₹0.35/conversation (Meta's India rate)
- "Conversation" = a 24h window per user, not per-message

---

## Architecture at a glance

```
User's WhatsApp
  ↓ sends text/image/voice
Meta Cloud API
  ↓ webhook POST to
app/api/whatsapp/route.ts
  ↓
┌─ downloadMediaAsDataUrl()  (images → base64)
├─ transcribeVoice()         (voice → Whisper → text)
├─ getHistory(phone)         (last 30 turns from Supabase)
├─ askBrain(history)         (Claude/GPT-4o with renovation prompt)
├─ appendTurn() ×2           (persist user + assistant turns)
└─ sendText(reply)           (back to Meta → user)
```

Same AI brain as the web canvas — different surface, one prompt, one
set of guarantees.

---

## Troubleshooting

- **"Webhook verification failed"** → your `WHATSAPP_VERIFY_TOKEN` env
  var doesn't match what you typed in the Meta dashboard.
- **"Messages work in Meta test tool but not from a real phone"** →
  you're still in sandbox; see step 7.
- **Bot is silent for 20+ seconds** → first AI call is cold-starting
  on Vercel serverless. Either warm it with a cron ping, or deploy to
  a long-running host (Railway, Fly).
- **Images aren't being understood** → check that your `AI_MODEL`
  supports vision. Claude Sonnet 4.5, GPT-4o, and Gemini 2.5 Pro do.
  DeepSeek and Mistral Small do not.
