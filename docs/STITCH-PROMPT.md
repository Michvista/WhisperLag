# WhisperLag — Stitch AI Design Brief

> Feed this prompt into **Stitch AI** to generate the design system and
> screens. Paste the resulting design back here and the frontend will be built
> to match it using the `.agents` frontend skills.

---

## Product

**WhisperLag** — a mobile-first, **anonymous-by-design** Quality Assurance
System (QAS) for the University of Lagos. Students submit honest feedback
safely; faculty get aggregated performance insight; administrators generate
accreditation reports in under two minutes.

**Audience:** UNILAG students (primary), faculty, QA administrators, and
external accreditors (e.g. NUC).

**Single job of the design:** build **trust**. The entire identity rests on the
*Whisper Lock* — a permanent visual guarantee that "your whisper is hidden;
nobody knows it is you."

---

## Brand & personality

- **Name:** WhisperLag (whisper + Lagos).
- **Tagline:** *"A student who whispers is still speaking."*
- **Voice:** calm, reassuring, institutional-but-warm. Plain verbs, sentence
  case, no filler. Not salesy, not corporate.
- **Feeling:** trustworthy, safe, modern, university-grade. Should read as a
  product of UNILAG, not a generic SaaS template.

### Signature element — the "Whisper Lock"
A small lock inside a speech bubble that appears on **every student-facing
screen** with the text: *"Your whisper is hidden. Nobody knows it is you."*
This must be a persistent, unmistakable UI element — not a hidden checkbox.
Make it the memorable detail of the whole design.

---

## Color palette

| Token | Hex | Usage |
| --- | --- | --- |
| UNILAG Green | `#009A44` | Primary — brand, primary buttons, headers |
| White | `#FFFFFF` | Surfaces, cards |
| Soft Gray | `#F5F5F5` | App background |
| Lagoon Blue | `#78C4EE` | Interactive / secondary accents, links |
| Sun Gold | `#E5A823` | Accents, badges, highlights |
| Ink | `#111827` | Body text |

Use UNILAG Green with restraint as the anchor; let Soft Gray and White do the
heavy lifting so the interface feels calm, not loud. Reserve Green for the
moments that matter (submit, the Whisper Lock).

---

## Typography

- **Display / Headings:** **Montserrat** (modern, bold, trustworthy).
- **Body / UI:** **Inter** (high readability on small screens).
- Clear type scale; headings ≥ 700 weight; comfortable line-height. Mobile is
  the baseline (375px), so type must remain legible and buttons ≥ 48px tall.

---

## Layout & screens to design

Design **mobile-first (375px)**, then note how each scales to tablet/desktop.

### 1. Landing / marketing page
Hero with the Whisper Lock concept, the tagline, and "Go to Dashboard" CTA.
Sections: what WhisperLag does, the six modules, the roles, the trust promise.

### 2. Onboarding / sign-in
Simple email+password login and a register flow. Reassuring copy about
anonymity right on the screen.

### 3. Student Dashboard
The star of the product. Must feature the **Whisper Lock** prominently.
- Submit a whisper (category, message, optional department).
- Polls / surveys available to answer.
- "Have I been heard?" — see if action was taken on past whispers (without
  revealing the submitter).

### 4. Whisper submission screen
Large, low-friction text area. Under-60-seconds flow. Show the Whisper Lock
indicator. Confirmation state: "Your whisper is hidden. It's been received."

### 5. Faculty Dashboard
Aggregates only — course evaluation averages, response counts, distributions.
**Never individual names.** Benchmark vs department. Calm, data-dense but
readable.

### 6. Admin Dashboard
KPIs, trend lines, compliance status, department snapshots, and a
"Generate accreditation report" action (under 2 minutes). Survey builder.

### 7. Reports / Accreditation view
Report list + a report detail with export (PDF/Excel) affordances.

---

## Design principles to follow

1. **One memorable signature:** the Whisper Lock. Keep everything else quiet
   and disciplined.
2. **Trust through consistency:** every action keeps the same name through the
   whole flow (e.g. the button that says "Submit Whisper" produces a
   confirmation that says "Whisper submitted").
3. **Anonymous-first UX:** anonymity should feel like a promise, always
   visible, never an afterthought.
4. **Mobile-first:** baseline 375px; thumb-friendly targets (≥48px).
5. **Accessibility:** visible focus states, sufficient contrast, and a
   reduced-motion-friendly feel.

---

## What to return from Stitch

Please produce:
- A cohesive **design token set** (colors, type scale, spacing, radii,
  shadows) that we can drop into Tailwind.
- A **component inventory** (buttons, cards, inputs, the Whisper Lock badge,
  nav, dashboards).
- **All seven screens** above, mobile-first, with desktop variants where
  useful.
- Clear **states**: empty, loading, success (e.g. "Whisper submitted"),
  and error.

Avoid the generic AI look (warm cream + serif + terracotta; near-black +
acid-green; or broadsheet newspaper). This is a calm, trustworthy university
QA product in UNILAG Green — let the design feel specific to *that*.
