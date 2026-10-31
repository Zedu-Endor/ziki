# Ziki operational workspace

This package is the existing full interface demo, preserved from the activity-center worktree and redesigned in place. Its fixture store, response and approval transitions, issue actions, agent settings, workspace switching, and supported routes remain local simulations. No production Ziki database is connected.

The dashboard derives attention requests, agent states, available issues, review gates, and activity bars from that store. Owner questions remain private and pipeline decisions retain the existing role checks. Points remain the existing illustrative totals. The sidebar and contextual panels navigate to working screens; Ask Agent opens agent management and instructions.

New core files: `demo/workspace-shell.jsx`, `demo/dashboard.jsx`, `demo/workspace-model.mjs`, `demo/workspace.css`, `demo/issue-list.jsx`, and `demo/reviews.jsx`. Shared styling also applies to Activity & Approvals. Existing integration limitations remain visible in their screens.

Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, then `pnpm start`. `node tests/smoke.mjs` checks all supported production routes against port 3003. The lint configuration excludes copied production components and utilities; it checks the demo controllers and new workspace implementation.

The preserved local `.vercel/project.json` points to project `prj_ItHU0DV2XiJJ4QwimFxkxvAiaJHb`, named `ziki-full-interface-demo-20261027`. It remains ignored, as do environment files. Deploy from this package using that existing link and `vercel deploy --prod`; never create or relink a replacement project.
