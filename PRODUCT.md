# Product

## Register

product

## Users

Strength-training lifters running a percentage-based bench-press program. They open the app
in three contexts: at home figuring out what loads to use for the upcoming block, mid-session
in a gym checking what to load on the bar today, and right after training to log a new block
or queue the next one. Phone-first usage during sessions; desktop more for setup and review.

## Product Purpose

A focused calculator for one job: turn any single number a lifter knows (1RM, 90%, or a
working-set load) into a complete bench program rounded to plate-feasible kg, then track that
program as a 3-week block with history and per-session plate breakdown. Success = a lifter can
walk to the bar and know exactly what to load, without doing math, without scrolling, without
signing in unless they want history.

## Brand Personality

Focused, confident, technical. The voice of a lifter who built a tool for themselves and a few
gym friends: numbers up front, no marketing copy, no motivational text, no emoji-as-vibe. Trust
comes from precision (exact kg, exact plates) and from honesty about trade-offs (anon means
device-only; refresh tokens can't be revoked; etc.). Closer in feel to a stopwatch or a
graphing calculator than to a fitness app.

## Anti-references

- **Generic SaaS dashboard.** No cream-on-paper backgrounds, no gradient-accent hero metrics,
  no purple-blue marketing gradients, no oversized hero illustrations, no "Streamline your
  training" headline. The hero-metric template specifically is banned.
- **Bodybuilding bro-app.** No aggressive black/red, no fire emoji, no capslock motivational
  copy ("CRUSH IT"), no flame icons.
- **Health/wellness pastel.** No mint/lavender, no rounded-everything, no meditation calm.

## Design Principles

1. **Numbers come first.** Every screen leads with the weight you came for. Chrome (titles,
   chevrons, decoration) yields to the number.
2. **Status before settings.** When you're in week 2 of 3, that fact is the most important
   thing on the page. Form controls and selectors follow it.
3. **Trust through precision.** Exact kg, exact plate stacks, exact dates. No "approximately",
   no marketing words, no emoji standing in for meaning.
4. **One click to today's load.** The primary task is "what do I lift today" — it must be
   visible at a glance for a returning, signed-in lifter, with no scroll on a phone.
5. **Honest about trade-offs.** Anonymous works but is local-only — say so plainly. Signed-in
   syncs but tokens can't be revoked instantly — say so plainly. Don't hide the model.

## Accessibility & Inclusion

WCAG 2.1 AA target. Body text ≥4.5:1 against background; large text ≥3:1. Both themes
(light/dark) must pass. Keyboard reachable: every action (Calculate, Start program, Log out,
plate toggles, Use next 90%) accessible without a mouse; visible focus rings. Forms have
explicit labels and inline error text that names the problem ("Wrong email or password" not
"error"). Reduced-motion alternative for any added animations. Chart and plate breakdown
remain usable without color alone (lift labels accompany dot colors; remainder is announced in
text, not just a glyph).
