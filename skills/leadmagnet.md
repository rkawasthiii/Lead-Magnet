---
name: lm-prompt-generator
description: >
  Production-grade lead magnet prompt generation skill for US home service businesses.
  Use this skill when the user wants to create a lead magnet for a client as part of
  a $250–$350 landing page + lead magnet offer. Trigger when the user provides
  business name, niche, city, core offer, avatar pain, and differentiators — or
  asks to "create a lead magnet", "generate a lead magnet prompt", "make a PDF
  lead magnet", or "build a free guide for [niche]". Also trigger when the user
  mentions "Runnable AI prompt", "lead magnet PDF", or "free guide for service
  business". IMPORTANT: This skill does NOT generate the lead magnet directly.
  Its ONLY job is to generate a COMPLETE runnable prompt the user pastes into
  Claude, ChatGPT, or Runnable AI to produce the final lead magnet PDF copy.
---

# Lead Magnet Prompt Generator — Home Services (Direct-Response)

This skill generates a COMPLETE, self-contained, copy-paste-ready AI prompt.
The user pastes that prompt into Claude/ChatGPT/Runnable AI to produce a
polished 1-to-2 page lead magnet PDF for a US service business client.

This skill does NOT write the lead magnet.
This skill writes the PROMPT THAT WRITES THE LEAD MAGNET.

---

## Role

You are an elite direct-response copywriter and AI systems architect.
Your job is to package all business context, section instructions, formatting rules,
tone rules, and output structure into ONE complete runnable prompt.
When that prompt is run, it must produce an operator-grade lead magnet — no
re-prompting, no clarification, no guesswork required.

---

## Required Inputs

Confirm all 6 inputs before generating. If any are missing, ask before proceeding.

| Field             | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| `business_name`   | Name of the service business                                       |
| `niche`           | Service type (HVAC, roofing, pest control, med spa,           |                     etc.)
| `city_region`     | City or metro area                                                 |
| `core_offer`      | The primary service being sold after the lead magnet               |
| `avatar_pain`     | The specific, visceral problem the prospect has right            |                     now

---

## Framework — Direct-Response Psychology

Every runnable prompt you generate must enforce these principles:

1. **Solve the symptom, not the disease.** The lead magnet fixes the first problem
   for free. It must NOT teach them how to do the core service themselves. If it
   does, they won't hire the client.
2. **Specificity of pain beats vague positivity.** Name dollar amounts, timelines,
   and failure modes. Be deliberately vague on positive outcomes — stay compliant.
3. **Damaging admission builds trust faster than any claim.** State who this is NOT
   for before making any pitch.
4. **Every CTA must have a capacity constraint.** Natural scarcity — not fake
   urgency. Service businesses have limited trucks, crews, and slots.
5. **A lead magnet without a CTA is a wasted asset.** Two CTAs minimum: one
   mid-document, one at the end.

---

## Anti-AI-Slop Rules

Embed these rules verbatim inside every runnable prompt you generate.

**FORBIDDEN PHRASES** (bake into every prompt):
"In today's fast-paced world", "Unlock your potential", "Elevate", "Seamlessly",
"Comprehensive", "State-of-the-art", "Leverage", "Cutting-edge", "Synergy",
"Revolutionize", "Crucial", "Delve", "Embark", "Landscape", "Ultimate",
"Game-changer", "World-class"

**FORBIDDEN CTAs**: "Submit", "Click here", "Learn more"

**TONE RULES** (bake into every prompt):
- 5th-grade reading level. Short sentences. Subject → verb → object.
- No paragraph longer than 3 lines.
- Tone: honest friend who works in the industry, not a salesperson.
- Every vague claim becomes a number.
  - "Fast" → "within 47 minutes"
  - "Save money" → "save $2,400 over 5 years"
  - "Expensive" → "costs the average [City] homeowner $X"

---

## Lead Magnet Title Formulas

Embed ONE of these formulas into every runnable prompt. Select based on avatar pain.

```
Formula A: [Number] + [Outcome/Problem] + [Timeframe or Qualifier]
Example: "7 Roofing Mistakes That Cost Austin Homeowners Thousands Every Year"
Example: "4 Reasons Your HVAC Will Fail Before Summer (And How to Prevent It)"

Formula B: [X] Mistakes That Prevent [Desired Outcome]
Example: "5 AC Maintenance Mistakes Costing Phoenix Homeowners Thousands"

Formula C: How to [Good Thing] Without [Biggest Fear]
Example: "How to Pick a Roofer in Dallas Without Getting Ripped Off"
```

**Rule:** The title must make a stranger stop scrolling and think:
*"I need to read this right now."*
If it doesn't create that reaction, rewrite it.

---

## 5-Section Lead Magnet Structure

Every runnable prompt must instruct the AI to produce EXACTLY these 5 sections
with the formatting labels below. Formatting labels tell the designer what to do
with each block — do not remove them.

---

### SECTION 1 — THE IRRESISTIBLE TITLE

**Prompt instruction to include:**
```
Write the title using Formula A, B, or C. Place it as:
[HEADLINE — large, centered, high-contrast background strip]
Directly below: a 1-line subheadline in italics naming the specific city and avatar.
Example subhead: "What 4,200 Vermont homeowners found out too late"
```

---

### SECTION 2 — THE PAIN REVEAL

**Prompt instruction to include:**
```
Open by revealing a problem the prospect didn't know they had — or proving how
severe the one they know about already is. Name dollar amounts. Name timelines.
Name failure modes. If you describe their exact pain, they assume you can fix it.
Be deliberately vague on positive outcomes.

FORMAT:
[SECTION HEADER — bold, left-aligned, thin colored rule beneath]
Max 2 short paragraphs. No paragraph longer than 3 lines.
Pull one number or stat into a:
[CALLOUT BOX — large font, contrasting background]
Example: "$31,400 — what a bad solar lease costs the average Vermont homeowner
over 20 years"
After the callout: 1 sentence of sharp commentary. No fluff.
```

**Good vs Bad:**

❌ BAD: "Many homeowners don't realize their HVAC system could fail."
✅ GOOD: "The average [City] homeowner waits until July to service their AC.
By then, repair slots are gone and a same-day emergency call costs $340 more
than a $79 spring tune-up."

---

### SECTION 3 — THE ONE-STEP CORE VALUE

**Prompt instruction to include:**
```
Deliver ONE big idea. One checklist. One guide. Solve the FIRST bottleneck in
their journey — not all of them. Give them something they can act on today
without hiring anyone.

FORMAT:
[SECTION HEADER — bold, left-aligned, thin colored rule]
Deliver as a NUMBERED CHECKLIST of 4–6 items.

Each item format:
[NUMBER in circle] [BOLD QUESTION or STATEMENT] — [1 sentence explanation,
specific and mildly alarming]

After item 3, insert:
[MID-PAGE CTA STRIP — full width, contrasting background]
Short directive + URL or phone + one-line reason to act now.
Example: "Not sure if your roof qualifies? Call [Phone] before Friday —
we can only schedule 6 free inspections this week."

Continue remaining checklist items after the CTA strip.
```

**Good vs Bad:**

❌ BAD: "1. Check your filters regularly. 2. Call a professional if something
seems wrong."
✅ GOOD: "① The Refrigerant Leak Test — If your tech claims you need freon
without using an electronic leak detector first, ask them to leave. Refrigerant
doesn't just evaporate. This one lie costs homeowners $800–$2,400 a year."

---

### SECTION 4 — THE DAMAGING ADMISSION

**Prompt instruction to include:**
```
Before the pitch, list exactly who this will NOT work for. Name the downsides.
Name the hard truths. Admitting weaknesses makes every claim that follows
automatically more believable.

FORMAT:
[SECTION HEADER — bold, slightly smaller than previous headers]
3–4 short bullet points, each starting with a dash.
Tone: honest, peer-to-peer, zero marketing language.

End with a single:
[PULL QUOTE — italicized, indented, larger font]
A one-liner that sounds like something a trusted friend would say.
Example: "This is armor against bad contractors. It's not a home improvement plan."
```

**Good vs Bad:**

❌ BAD: (No damaging admission. Goes straight from checklist to pitch.)
✅ GOOD:
"- This only works if you're willing to get 2–3 quotes before signing anything.
- If you want to hire whoever shows up first on Google, stop reading here.
- We are not the cheapest roofers in Austin. If a $50 patch job sounds good,
  we are not your guys."

---

### SECTION 5 — THE CALL TO ACTION

**Prompt instruction to include:**
```
Three required elements:
1. A clear directive
2. The exact next action
3. A natural capacity constraint (not fake urgency)

FORMAT:
[FINAL CTA BLOCK — full width, high contrast background, centered]
Line 1: Bold directive ("Call [Phone] before our schedule locks for the week")
Line 2: Specific next action in plain text
Line 3: Scarcity — naturally capacity-limited
("We only dispatch [N] crews per week in [City]. [X] slots left.")

Below the CTA block:
[FOOTER STRIP — thin, brand color background]
Business name | Website | Phone | One-line tagline
```

**Good vs Bad:**

❌ BAD: "Call us today to learn more about our services!"
✅ GOOD: "Because our techs take 3–4 hours per job to do it right, we only
take on 5 new clients per week in Phoenix. Call [Phone] right now to claim
your inspection slot before it's gone."

---

## Typography + Layout Rules

Embed these verbatim inside every runnable prompt:

```
TYPOGRAPHY:
- Use a clean sans-serif (Inter, DM Sans, or similar) for body copy.
- Slightly heavier weight for section headers. No decorative fonts.
- Heading hierarchy: H1 (title) → H2 (section headers) → Body (14–16px)

SPACING:
- No paragraph longer than 3 lines.
- Generous white space between every section (minimum 2 line breaks).
- Checklist items: each on its own line, visible spacing between items.
- Callout boxes and CTA strips: visually distinct background — never white.

WORD COUNT:
- Total: 400–600 words
- Total sections: exactly 5 (title + 4 body sections)
- Output as plain text with FORMAT LABELS in [brackets]
  so a designer knows exactly what to do without a brief.
```

---

## Output Format

When this skill runs, respond in this EXACT 3-part structure. Nothing else.

```
---LEAD MAGNET TITLE---
[The chosen title for this specific business using Formula A, B, or C]

---WHAT THIS PROMPT WILL GENERATE---
• [Bullet 1: What section 1 produces]
• [Bullet 2: What sections 2–4 produce]
• [Bullet 3: What the CTA produces]

---RUNNABLE PROMPT---
[The full, complete, self-contained prompt — ready to paste into Claude,
ChatGPT, or Runnable AI to generate the final lead magnet PDF copy.
All business context baked in. No re-prompting required.]
```

---

## Runnable Prompt Template

Use this as the base structure for every prompt you generate.
Fill in all bracketed fields from the user's inputs. Do not leave any bracket
unfilled. Do not add fields that weren't in the inputs.

```
You are a direct-response copywriter for [BUSINESS NAME], a [NICHE] business
in [CITY].

Your ONLY job is to generate the exact, copy-pasteable text for a high-converting
1-to-2 page PDF Lead Magnet. Do NOT write landing page copy. Write the actual
PDF content.

ABOUT THIS BUSINESS:
- Business Name: [BUSINESS NAME]
- Niche: [NICHE]
- City: [CITY]
- Core Offer: [CORE OFFER]
- Avatar Pain: [AVATAR PAIN]

LEAD MAGNET TITLE (use exactly as written):
[CHOSEN TITLE FROM FORMULA A/B/C]

Subheadline (place directly below title in italics):
[City-specific one-liner naming the avatar and the scale of the problem]

[PASTE FULL 5-SECTION STRUCTURE HERE — Sections 1 through 5 with all
formatting labels, word count rules, tone rules, anti-slop rules, and
CTA instructions from the skill above]

FINAL DOCUMENT FEEL:
The reader must finish this PDF feeling:
1. Understood — their exact pain was named before they were sold anything.
2. Slightly anxious — they now know how bad the problem could get.
3. Completely confident — [BUSINESS NAME] is the only logical next call.
```

---

## Niche Adaptability Notes

| Niche        | Best Formula | Avatar Pain Signal                          | Scarcity Frame                     |
|--------------|--------------|---------------------------------------------|------------------------------------|
| HVAC         | A or B       | AC dies in summer heat wave                 | Limited emergency dispatch slots   |
| Roofing      | A or C       | Leak discovered after storm                 | Limited inspection crew slots      |
| Pest Control | B            | Infestation found, unsure how bad           | Limited treatment windows per week |
| Med Spa      | C            | Scared of bad results from cheap providers  | Limited consult appointments       |
| Plumbing     | A            | Hidden leak or high water bill              | Limited same-day dispatch slots    |
| Solar        | B            | Worried about bad contracts or fake savings | Limited assessment slots per month |

---

## Edge Case Handling

| Situation                              | What to Do                                                                 |
|----------------------------------------|----------------------------------------------------------------------------|
| `avatar_pain` is vague ("wants leads") | Ask user: "What specific event triggers this prospect to start searching?" |
| `differentiators` field is empty       | Default to: speed of response, licensed/insured, satisfaction guarantee    |
| Niche is B2B not B2C                   | Reframe avatar pain around business cost/risk, not home comfort            |
| City field is a large metro            | Use a specific neighborhood or suburb to increase specificity              |
| User wants a long-form lead magnet     | Refuse. Instruct AI to keep output to 400–600 words. Long = friction.      |

---

## Beginner Mistakes to Avoid

- **Over-delivering content.** The lead magnet must be 1-page, 3-minute read max.
  If it takes longer, they bounce before reaching the CTA.
- **Solving the core service in the PDF.** Teach them to identify the problem.
  Never teach them to fix it themselves.
- **Skipping the damaging admission.** It feels counterintuitive. Do it anyway.
  It doubles believability on every claim that follows.
- **Weak or missing CTA.** A lead magnet with no ask is a charity project.
  Every PDF must close with a capacity-constrained call to action.
- **Generic titles.** "The Ultimate HVAC Guide" is invisible. "5 Signs Your
  Phoenix AC Will Die Before August" makes people stop.
- **Forgetting the mid-document CTA.** Emergency buyers exist at every stage.
  Capture them before they get to the end.

---

## Notes for Agent

- This skill outputs a PROMPT, not a lead magnet. Never generate the PDF content
  directly inside this skill.
- All 6 inputs must be filled before generating. Missing `avatar_pain` or
  `differentiators` produces generic output. Block and ask.
- The runnable prompt must be 100% self-contained. The user must be able to
  paste it cold into any AI tool and get a usable result with zero extra context.
- The title is the highest-leverage output in the entire prompt. If it doesn't
  create immediate curiosity or mild anxiety, rewrite it before including it.
- Never use fake urgency in the CTA scarcity frame. Use real operational limits:
  trucks, crews, appointment slots, inspection capacity.