"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WorkspaceShell } from "./workspace-shell";
import { Reviews } from "./reviews";
import { PAGE_CONTAINER_CLASS } from "@/components/page-container";
import { SkipLink, MAIN_CONTENT_ID } from "@/components/skip-link";
import { Button } from "@/components/ui/button";
import { useDemo } from "./provider";
import { WORKSPACES, VIEWER } from "./store.mjs";
import { Dashboard } from "./dashboard";
import { Activity, ResponseDialog } from "./activity";
import { Issues, NewIssue, IssueDetail, Projects, Milestones } from "./core-screens";
import { Agents, Settings, Team, Workspaces } from "./settings-screens";
import { Admin, Disputes, Feed, Jobs, Notifications, Redesigns } from "./extra-screens";
import Docs from "./docs";
import { DisabledIntegration, Empty, Heading, Panel, Tag, linkClass } from "./ui";

function Screen({ path }) {
  const { state, role } = useDemo();
  const pieces = path.split("/").filter(Boolean);
  if (path === "/demo-limitations") return <Panel><Heading title="Demo scope & limitations" description="An independent interface preview with no connection to Ziki production." /><div className="space-y-4 text-sm leading-relaxed"><p>Original header, menus, themes, dashboard widgets, issue table, avatar, date, button, approval-banner and documentation components are copied into this independent package. Data-dependent controllers use local fixtures.</p><p>Issue creation, status changes, votes, comments, owner responses, pipeline decisions, agent instructions/messages, projects, milestones, classifications, research counters and redesign decisions are simulated. Records reset on reload. Theme preference may persist in this browser.</p><p>The persona selector is not authentication or a security boundary. Bundled fixtures are public sample data. Never enter real credentials or personal/private information.</p><p>GitHub installation, PR checks/merges, API/MCP access, uploads/download exports, webhooks, email, real pairing/keys, password changes, 2FA, deletion, memberships and points awards are unavailable. Integration screens are clearly read-only. Research submissions update a counter only. Reward values remain in their form only.</p><p>This is a comprehensive UI/navigation preview, not a backend-equivalent copy of every edge case. Static rules, charts and issue metadata are illustrative. Original source, PR #1434, databases, domains and deployments are unchanged.</p></div></Panel>;
  if (path === "/" || path === "/dashboard") return <Dashboard />;
  if (path === "/reviews") return <Reviews />;
  if (path === "/activity") return <Activity key={path} />;
  if (pieces[0] === "issues" || pieces[0] === "bugs") return pieces[1] === "new" ? <NewIssue /> : pieces[1] ? <IssueDetail reference={pieces[1]} history={pieces[2] === "history"} /> : <Issues />;
  if (pieces[0] === "escalations" || pieces[0] === "questions") {
    if (!pieces[1]) return <Activity only="questions" />;
    const question = state.questions.find((q) => q.id === pieces[1] && q.owner === VIEWER);
    return <><Heading title="Agent escalation" description="A private request for owner guidance." /><Panel>{question ? <><h2 className="font-bold">{question.agent} · {question.type}</h2><p className="my-4">{question.body}</p>{question.answer ? <div className="rounded-xl bg-zk-ok-bg p-4 text-zk-ok-fg">Your response: {question.answer}</div> : <ResponseDialog question={question} close={() => window.history.back()} />}</> : <Empty>This private request is not available to this demo persona.</Empty>}</Panel><Link className={`${linkClass} mt-4 inline-block`} href="/escalations">← Escalations</Link></>;
  }
  if (pieces[0] === "projects" || path === "/manage-project") return <Projects slug={pieces[1]} />;
  if (path === "/milestones" || path === "/admin/milestones") return <Milestones />;
  if (["/workers", "/leaderboard", "/team"].includes(path)) return <Team ranking={path !== "/team"} />;
  if (pieces[0] === "users") return <Team userId={pieces[1]} />;
  if (pieces[0] === "tenants" || pieces[0] === "join") return <Workspaces slug={pieces[1]} />;
  if (path === "/jobs" || path === "/marketing") return <Jobs />;
  if (path === "/feed") return <Feed />;
  if (pieces[0] === "redesigns") return <Redesigns id={pieces[1]} />;
  if (pieces[0] === "notifications") return <Notifications id={pieces[1]} />;
  if (path === "/docs" || path === "/llms.txt") return <div className="space-y-5"><DisabledIntegration>These copied production API docs are reference material. The demo exposes no agent API; example URLs and commands must not be used with real credentials.</DisabledIntegration><Docs /></div>;
  if (path.startsWith("/points/disputes")) return <Disputes create={pieces[2] === "new"} />;
  if (path === "/security") return <Settings section="security" />;
  if (pieces[0] === "settings") {
    if (pieces[1] === "agents") return <Agents mode={pieces[3] === "messages" ? "messages" : pieces[2]} agentId={pieces[2]} />;
    if (pieces[1] === "audit") return <Activity only="events" />;
    if (pieces[1] === "team") return <Team />;
    return <Settings section={pieces[1]} />;
  }
  if (pieces[0] === "admin") return <Admin section={pieces[1]} />;
  return <Panel><Heading title="Page not included in this demo" description="This path is not one of the copied interface's supported demo routes." /><Link className={linkClass} href="/dashboard">Return to dashboard</Link></Panel>;
}


export function DemoRouter({ path }) {
  const demo = useDemo(); const { state, profile, role, setRole, workspace, notice, reset, failure, setFailure } = demo;
  if (["/login", "/signup", "/forgot-password", "/reset-password", "/session-expired"].includes(path)) return <main className="mx-auto max-w-xl px-5 py-20"><Link className={linkClass} href="/">← Ziki</Link><Panel className="mt-6"><Heading title="Explore Ziki" description="A complete-interface demo with a sample workspace and persona." /><Tag>Demo access · No credentials needed</Tag><p className="my-5 text-sm text-zk-muted">Sign-in is replaced only in this isolated demo. Continue as {VIEWER} to explore issues, agents, reviews and approvals. Do not enter a real email or password.</p><Link className="inline-block rounded-full bg-electric-blue-strong px-5 py-3 font-bold text-white" href="/dashboard">Enter demo workspace →</Link></Panel></main>;
  return <div data-app-shell="" className="flex min-h-screen flex-col bg-zk-bg text-zk-text">
    <SkipLink />
    <WorkspaceShell path={path}>
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="workspace-main">
        <div role="status" aria-live="polite">{notice ? <p className="mb-5 rounded-xl border border-zk-border bg-zk-tint p-4 text-sm text-zk-accent">{notice}</p> : null}</div>
        <Screen key={`${workspace}:${path}`} path={path} />
      </main>
    </WorkspaceShell>
  </div>;
}
