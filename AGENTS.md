# Codex Guidelines — koyjabo-core

Derived from Andrej Karpathy's observations on LLM coding pitfalls.

---

## 1. Think Before Coding

State assumptions explicitly. Surface ambiguity before touching code.

- If a request is ambiguous, list the interpretations and ask which is intended — don't silently pick one
- Before implementing, confirm: "Is this the simplest approach?" If a simpler path exists, name it
- Push back when a request would create unnecessary complexity
- Stop when confused — name what is unclear and ask rather than guessing

**For this codebase specifically:**
- The app is bilingual (Bangla/English). Every user-visible string must go through `lbl(en, bn)` or `t()` — never hardcode display text
- Community features use `communityDataService.ts` for remote storage and localStorage as offline cache
- PWA cache versioning: bump `cacheId` in `vite.config.ts` whenever assets change in a way that would serve stale content

---

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No abstractions for single-use code
- No error handling for impossible scenarios
- No "flexibility" that was not requested
- If 200 lines could be 50, rewrite to 50
- Three similar lines is better than a premature abstraction

**Test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

---

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't improve adjacent code, comments, or formatting unless it's part of the task
- Don't refactor code that isn't broken
- Match existing style even when you'd do it differently
- If you notice unrelated dead code, **mention it — don't delete it**

When your changes create orphaned code:
- Remove imports/variables/functions **your** changes made unused
- Do not remove pre-existing dead code unless explicitly asked

**Test:** Every changed line should trace directly back to the user's request.

---

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform imperative tasks into verifiable goals:

| Instead of | Transform to |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

---

## Project-Specific Guidelines

### Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind, deployed as PWA on GitHub Pages
- **Data:** Static JSON files in `/data/`, community data in private GitHub repo via Cloudflare Worker proxy
- **Analytics:** `services/analyticsService.ts` — `trackFeatureUsage(feature)` for community pages, `trackBusSearch` / `trackRouteSearch` for core search
- **i18n:** `useLanguage()` hook → `language` (`'bn'` | `'en'`), `lbl(en, bn)` inline helper, `t(key)` for keyed strings from `i18n/translations.ts`

### Deployment

- `main` branch → GitHub Actions → `Dhaka-Commute` repo → koyjabo.com (public GitHub Pages)
- `dev` branch → dev.koyjabo.com
- Keep `dev` in sync with `main` after every merge

### Security

- Never commit `.env` or any file containing API keys, tokens, or passwords
- Secrets live in GitHub Actions secrets and `.env` (gitignored)
- Community writes always go through the Cloudflare proxy — never expose tokens in browser code

### PWA / Offline

- All new data sources must have a localStorage fallback (cache on success, read cache on network failure)
- After adding new static assets, bump `cacheId` in `vite.config.ts`
- Notification scheduling lives in `TripReminders.tsx`; re-schedule on `visibilitychange`

### Code Style

- Functional React components only
- `const lbl = (en: string, bn: string) => language === 'bn' ? bn : en` — inline in each component
- Immutable state updates (spread, not mutation)
- No `console.log` in production code
