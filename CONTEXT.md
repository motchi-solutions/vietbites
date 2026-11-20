# Project context: VietBites website

Read this with [AGENTS.md](AGENTS.md) before every task. This file holds the rules that apply only to this project.

## Project

- Website for VietBites Toronto: menu, catering and a contact and wholesale form on `/visit`.
- Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind CSS. Notion is the read-only CMS. Brevo sends email. Hosted on Vercel. Node 26 (`.nvmrc`).
- Branch model: develop flow. `develop` deploys to Vercel Preview, `main` to Production.
- `feature/reservation-demo` is an old, unmerged demo branch. Ask before using or deleting it.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Build | `npm run build` |
| Dependency tracker | `npm run dependencies:inventory` |
| Skill tracker | `npm run skills:inventory` |

## Project-specific rules

- Analytics: Vercel Web Analytics via `src/lib/analytics.ts` and `src/components/analytics/site-analytics.tsx` (Production only, path plus `utm_*` tags). Enable it in the Vercel project's Analytics tab.
- Spam protection: Cloudflare Turnstile. Server check in `src/lib/turnstile.ts`, client hook in `src/lib/use-turnstile.ts`. Needs `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
- All menu and platform content lives in Notion (`src/lib/notion`). This repo has no admin tools.
- `npm run build` needs the Notion database ID variables, plus the Brevo variables for the form. See `.env.example`. CI checks lint and types only. Vercel does the build.
- Email payloads and templates are in `src/lib/email`. Never send real email while testing.
- The footer credit links to Motchi with tracking tags: `https://www.motchi.ca/websites?utm_source=<client>&utm_medium=referral&utm_campaign=client-footer`. Keep this format if you change the footer.

## Design skills

The design skills in `.agents/skills/` were imported from motchi-website for later clean-up passes. Use only the ones that fit the task. This client's brand and approved content always win over skill defaults. Never invent content, reviews, prices or claims.

Suggested order for major UI work: hallmark (audit only) > frontend-design > better-layout > design-systems-frontend-architecture > frontend-ui-engineering > modern-web-guidance > ux-writing > apple-design > unslop (final polish) > web-design-guidelines (final QA) > untangle-codebase (only for real structural problems).

- modern-web-guidance: run only `.agents/skills/modern-web-guidance/mwg search|list|retrieve`. It is offline with telemetry off. Never run `npx modern-web-guidance`.
- web-design-guidelines fetches its rules from GitHub. The hallmark and unslop helpers can open browsers, download images or call image APIs. All of these need explicit approval first.
