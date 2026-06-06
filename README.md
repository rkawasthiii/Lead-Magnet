# LeadGen Machine

**Turn any landing page into a complete client acquisition package — in under 90 seconds.**

Paste a URL. Get a full conversion audit, rewritten copy, a ready-to-use lead magnet prompt, and 9 personalized outreach scripts. Everything you need to pitch, close, and deliver a $350 landing page rewrite.

---

## The Problem

You find a home service business running Meta ads to a landing page that leaks leads. You know you can fix it. But before you can pitch them, you need to:

- Audit their page and find the specific money leak
- Write a Loom script that hooks them in 15 seconds
- Craft a cold DM that doesn't sound like spam
- Have objection handlers ready when they push back
- Create the actual rewritten copy if they say yes
- Build a lead magnet PDF as part of the deliverable

That's 3-4 hours of work per prospect. Most of it repetitive.

**LeadGen Machine does all of it in one click.**

---

## What You Get

### From one URL input:

| Output | What it is |
|--------|-----------|
| **Conversion Audit** | 5 scores (commitment demand, emotional trigger, trust signal, lead capture, specificity) + the #1 money leak + 3 specific fixes |
| **Loom Hook** | The exact opening line for a 2-min audit video. Personalized to their business. Ready to read on camera. |
| **Rewritten Copy** | Full landing page copy — Google Doc ready. Headlines, subheadline, lead magnet section, trust bar, CTAs. All Hormozi framework. |
| **Lead Magnet Prompt** | A complete, copy-paste AI prompt that generates a 5-section PDF checklist. All business context baked in. Zero extra input needed. |
| **9 Outreach Scripts** | Cold DM, 12hr follow-up, scarcity close, 4 objection handlers, closing script, and a full word-for-word Loom video script. |

### Plus:

| Feature | Description |
|---------|-------------|
| **Deal Tracker** | 9-step pipeline from "Loom sent" to "testimonial received". Checkboxes with auto-timestamps. Revenue tracking built in. |
| **Editable AI Prompts** | Don't like how the audit scores? Change the instructions. Edits apply instantly to all future runs. |
| **Manual Paste Mode** | Can't scrape a site? Paste the text directly. The pipeline runs the same way. |
| **Business History** | Every run is saved. Pick any past business from the sidebar — all outputs are still there. |
| **Instant Model Switching** | Change your AI model or API key from Settings. No restart needed. |

---

## How It Works

```
You paste a URL (or the page text)
        ↓
AI scrapes and reads the full page
        ↓
Scores it against 5 conversion killers
        ↓
Detects: business name, niche, city, differentiators, pain points
        ↓
Writes new landing page copy using everything it found
        ↓
Generates a lead magnet prompt with all context baked in
        ↓
Writes 9 outreach scripts personalized to that exact business
        ↓
You copy, paste, send. Done.
```

The whole pipeline takes 60-90 seconds. Every output is personalized — not generic templates.

---

## Screenshots

**Dashboard** — All your businesses in one view with deal progress bars.

**Business Page** — Enter a URL or paste copy. Watch the 5-step pipeline run. Browse outputs across 6 tabs.

**Tracking** — Full deal pipeline. Check off steps, track payments, add notes. See your conversion rate at a glance.

---

## Quick Start

### What you need

1. **A Supabase account** (free) — [supabase.com](https://supabase.com)
2. **An Amazon Bedrock API key** (bearer token) — AWS Console → Bedrock → API Keys
3. **Node.js 18+** installed

### Setup (5 minutes)

**Step 1** — Install

```bash
npm install
```

**Step 2** — Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then grab these from **Settings → API**:
- Project URL
- `anon` public key
- `service_role` key

**Step 3** — Set up the database

Open **SQL Editor** in Supabase and run the two files in `supabase/` in order:
   1. `supabase/001_initial_schema.sql` — creates all tables + indexes
   2. `supabase/002_enable_rls.sql` — enables row-level security + policies

**Step 4** — Add your credentials

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Step 5** — (Recommended) Disable email confirmation for local dev

In Supabase → **Authentication → Providers → Email** → turn off "Confirm email". This lets you sign up and use the app immediately without checking your inbox.

Also add `http://localhost:3000/auth/callback` to your **Redirect URLs** in Authentication → URL Configuration.

**Step 6** — Run it

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Sign up. Go to **Settings**. Paste your Bedrock bearer token. You're live.

---

## Settings

The **Settings** page has two fields you can change anytime:

| Field | What it does |
|-------|-------------|
| **Bearer Token** | Your Bedrock API key. Generate at AWS Console → Bedrock → API Keys → Create long-term key. |
| **Model ID** | Which Claude model to use. Default: `us.anthropic.claude-opus-4-6-v1`. Switch to any model you have access to. |

Both update instantly — no restart required. Delete and re-enter anytime.

---

## Customizing the AI

The app ships with 4 AI skill prompts that control every output:

| Skill | What it controls |
|-------|-----------------|
| **Audit** | How pages are scored, what the AI looks for, output format |
| **Copy** | Landing page structure, Hormozi rules, forbidden phrases, section order |
| **Lead Magnet** | The 5-section framework, title formulas, prompt generation rules |
| **Outreach** | Tone rules, pricing framing, all 9 script templates |

Edit them from the **Skills tab** on any business page. Changes save to your account and apply to every future run. Hit "Reset to Default" to go back to the originals.

---

## The Pipeline In Detail

### 1. Audit

Scores the page on 5 dimensions (1-10 each):
- **Commitment Demand** — Is the CTA asking for too much too soon?
- **Emotional Trigger** — Does the copy speak to pain/fear/desire?
- **Trust Signal** — Reviews, guarantees, credentials visible?
- **Lead Capture** — Is there a low-friction opt-in before the hard ask?
- **Specificity** — Real numbers and timelines, or vague claims?

Also detects: business name, niche, city, differentiators, current headline, current CTA, and the avatar's primary pain.

### 2. Copy Rewrite

Full landing page in 6 sections: headline variants, subheadline, lead magnet offer, email capture micro-copy, trust bar, and implementation notes. Written at 5th-grade reading level. No AI slop.

### 3. Lead Magnet Prompt

The crown jewel. A self-contained prompt you paste into Claude or ChatGPT. It generates a 5-section lead magnet PDF:
1. Irresistible title
2. Pain reveal (specific dollar amounts, failure modes)
3. One-step core value (actually useful, actionable)
4. Damaging admission (builds trust through honesty)
5. Call to action (with natural scarcity)

All business context is already inside the prompt. The person running it doesn't need to know anything about the business.

### 4. Outreach Scripts

9 scripts covering the full sales cycle:
- Cold DM (references their specific page)
- 12-hour follow-up
- Day 3 scarcity close
- Objection: price too high
- Objection: no portfolio
- Objection: has an agency
- Objection: wants a call
- Closing script (Wise link + delivery promise)
- Full 2-minute Loom video script (word for word)

---

## Deal Tracking

Every business gets a 9-step pipeline:

```
Loom Sent → DM Replied → Wise Link Sent → Payment Received →
Google Doc Written → Lead Magnet Created → Delivered via DM →
Testimonial Asked → Testimonial Received
```

Each checkbox auto-timestamps when clicked. Track payment amounts. Add free-text notes. Filter by business or view all at once.

Dashboard stats show: total businesses, deals pitched, revenue collected, and conversion rate.

---

## Tech Under the Hood

| | |
|-|-|
| **Framework** | Next.js 16 (App Router) |
| **Database** | Supabase (Postgres + Row-Level Security) |
| **AI** | Amazon Bedrock Converse API (bearer token, no SDK) |
| **Scraping** | Cheerio + fetch (lightweight, no browser needed) |
| **Styling** | Tailwind CSS v4 |
| **Auth** | Supabase Auth (email + password) |

All data is isolated per user. No shared state. Runs 100% locally.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Bedrock API error (403)" | Bearer token is invalid/expired. Generate a new one in AWS Console → Bedrock → API Keys. |
| "Could not scrape this page" | Site blocks automated requests. Use "Paste Copy Manually" mode instead. |
| Scores look wrong | Edit the Audit skill from the Skills tab. Adjust scoring criteria to your preference. |
| Skills not showing | Log out and back in. Skills are seeded on first login. |
| Pipeline stuck on "Running" | Refresh the page. If still stuck, the Bedrock call likely timed out — try again. |

---

## Who This Is For

Freelancers and agency owners who:
- Sell landing page rewrites to US home service businesses
- Find prospects through Meta ads and cold DM outreach
- Want to reduce per-prospect prep time from hours to minutes
- Need a system that produces consistent, personalized outputs at scale

---

## License

Private. Not for redistribution.
