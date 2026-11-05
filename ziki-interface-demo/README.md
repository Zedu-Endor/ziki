# Ziki complete-interface demo

Independent Next.js package based on `feat/human-agent-activity-center`. Original application source and PR #1434 are unchanged. Do not deploy from the parent checkout: it has a different Vercel link/configuration.

## Run

Use Node 22 and pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start
```

Open http://localhost:3003. `/` and `/dashboard` show the existing dashboard with sample workspace data. Sign-in is replaced with a credential-free persona. No Prisma dependency, PostgreSQL, cron, live integrations or required environment variables.

## Issue filter workflow

On `/issues`, search with the Search button or Enter, then combine status, severity, project, personal view and sort. The URL stores the applied filters, so copied links, reload and browser Back/Forward restore the same view. Opening a result and using “Back to issues” (including from its history) preserves those filters. The result count announces updates; Clear all filters and the empty-state Show all issues button reset the view. Filters operate on the currently selected sample workspace; they do not persist sample record edits.

`pnpm check` covers filter parsing, combinations, search, sorting, URL round trips and safe return links. With the parent repository's existing Playwright installation and Chrome available, run `node tests/issue-filters-browser.mjs http://localhost:3003` against a running production server for desktop/mobile navigation, reload, empty-state and overflow checks.

## Reused interface

Copied original header/account/agent/workspace menus, global light/dark/brand themes, local fonts, homepage, avatars, dates, buttons, dashboard cards/chart, issue table/votes, approval banner and developer documentation. Data-dependent page controllers use local fixture adapters. The copied approval banner invokes a local adapter instead of a server endpoint.

Screens cover homepage/mock sign-in, dashboard, filtered issues/create/detail/history/comments/status, Activity & Approvals with escalation responses, pipeline gates, claims and audit pagination, escalation detail, projects/rule previews, milestones, team/ranking/profiles/ledger, research jobs, feed, redesigns, notifications, workspaces, settings/profile/theme/agents/pairing/messages/instructions/security/webhooks/audit/team, admin analytics/members/classifications/rewards, points disputes and docs. Original navigation is preserved with Activity & Approvals alongside Product, Marketing and Security in the shared desktop/mobile navigation. The existing account-menu shortcut remains available.

## Limitations

- Records live in separate per-workspace in-memory stores. They survive client navigation and reset on reload. Theme preference can persist in browser storage.
- The signed-in demo user is a mock identity, not real authentication or a security boundary. All fixtures are bundled sample data. Owner escalation queues exclude other sample owners' private bodies. Never enter credentials or private/personal information.
- Issue edits, comments, votes, responses, approval decisions, agent messages/settings, project/milestone/taxonomy creation and disputes update sample data. They never affect official systems.
- GitHub installations/checks/merges, file uploads/download exports, webhooks, email/invites, real memberships/permissions, agent keys/pairing/MCP, password reset/2FA, account deletion and real rewards/points awards are unavailable. Integration screens are marked as read-only/simulated. Research submissions update a counter only; reward input values stay in the form. Static approval rules and charts are illustrative.
- Production API docs are reference only: copied commands use a reserved `.invalid` example host and are not a live demo API. This is comprehensive UI/navigation coverage, not a production-equivalent backend or an implementation of every edge case.
- Browser automation is unavailable in this environment. Automated tests cover the adapter and production HTTP rendering; manually review client interactions/visuals before treating the demo as product QA sign-off.

## Deploy separately to Vercel

Use this folder's own package, lockfile and `vercel.json`. It has **no cron configuration**, custom domain or required environment variables and sends `noindex, nofollow` headers. Deploy only to the existing `ziki-full-interface-demo-20261027` project linked in this directory. Never use official Ziki projects, domains or environment variables. No Git connection is needed.

After starting a production build, run `node tests/smoke.mjs http://127.0.0.1:3003` to check the declared navigation inventory and dynamic details. `/demo-limitations` repeats these limitations inside the demo.
