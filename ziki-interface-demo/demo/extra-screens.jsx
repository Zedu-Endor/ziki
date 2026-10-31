"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LocalTime } from "@/components/local-time";
import { useDemo } from "./provider";
import { VIEWER } from "./store.mjs";
import { ActionButton, DisabledIntegration, Empty, Field, Heading, IssueLink, Panel, Tag, Textarea, linkClass } from "./ui";
import { OverviewStatCards } from "@/components/overview/stat-cards";

export function Notifications({ id }) {
  const { state, dispatch } = useDemo();
  useEffect(() => { if (id) dispatch({ type: "readNotification", id }); }, [id]);
  const rows = state.notifications.filter((notification) => !id || notification.id === id);
  return <><Heading title="Notifications" description="Mentions, assignments, approvals and agent questions."><ActionButton variant="secondary" action={{ type: "readNotification", id: "all" }}>Mark all read</ActionButton></Heading><Panel>{rows.map((n) => <article className="demo-row flex items-center justify-between gap-3" key={n.id}><Link className={linkClass} href={id ? n.href : `/notifications/${n.id}`}>{n.title}</Link><Tag tone={n.read ? "neutral" : "warn"}>{n.read ? "Read" : "Unread"}</Tag></article>)}{!rows.length ? <Empty>No notifications in this workspace.</Empty> : null}</Panel></>;
}

export function Feed() {
  const { state, role } = useDemo();
  return <><Heading title="Activity feed" description="A traceable overview of issue and agent activity." /><Panel>{state.events.filter((event) => role !== "user" || event.owner === VIEWER).map((e) => <article className="demo-row text-sm" key={e.id}><p><strong>{e.actor}</strong> · {e.action} · <LocalTime date={e.createdAt} /></p><p className="mt-2"><IssueLink id={e.bugId} /></p></article>)}{!state.events.length ? <Empty>No activity yet.</Empty> : null}</Panel></>;
}

export function Jobs() {
  const { state } = useDemo(); const [submitted, setSubmitted] = useState(false);
  return <><Heading title="Research jobs" description="Structured research work with independent review and points." />{state.jobs.map((job) => <Panel key={job.id}><h2 className="text-lg font-bold">{job.title}</h2><p className="my-3 text-sm text-zk-muted">{job.description}</p><div className="mb-4 flex gap-3"><Tag>{job.submissions}/{job.limit} submissions</Tag><Tag tone="good">{job.reward} points per accepted row</Tag></div>{submitted ? <p className="mb-3 text-sm text-zk-ok-fg">Your sample submission has been recorded.</p> : null}<form className="space-y-4" onSubmit={(e) => e.preventDefault()}><Textarea label="Research findings" required placeholder="Describe the screen, reproduction steps and evidence" /><ActionButton action={{ type: "submission", id: job.id }} onDone={() => setSubmitted(true)}>Submit sample findings</ActionButton></form><p className="mt-4 text-xs text-zk-muted">Demo submissions change this counter only; no real research job or points award is created.</p></Panel>)}</>;
}

export function Redesigns({ id }) {
  const { state } = useDemo();
  return <><Heading title="Redesign proposals" description="Human review of agent-proposed interface changes." />{state.redesigns.filter((row) => !id || row.id === id).map((row) => <Panel key={row.id}><div className="flex justify-between gap-3"><Link className={linkClass} href={`/redesigns/${row.id}`}>{row.title}</Link><Tag tone={row.status === "approved" ? "good" : "warn"}>{row.status}</Tag></div><p className="my-4 text-sm text-zk-muted">Submitted by {row.agent} · {row.description}</p><div className="mb-5 rounded-xl border border-zk-border bg-zk-bg p-5"><p className="text-xs font-bold uppercase tracking-wider text-zk-muted">Sample layout preview</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]"><div className="rounded-lg bg-zk-surface p-4"><h3 className="font-bold">Issue summary</h3><p className="mt-2 text-sm text-zk-muted">Description, evidence and discussion in one reading column.</p></div><div className="flex flex-wrap gap-2 rounded-lg bg-zk-surface p-4"><Tag>High</Tag><Tag>In progress</Tag><Tag>Atlas</Tag></div></div></div>{row.status === "pending" ? <div className="flex gap-3"><ActionButton action={{ type: "redesign", id: row.id, status: "approved" }}>Approve proposal</ActionButton><ActionButton variant="secondary" action={{ type: "redesign", id: row.id, status: "rejected" }}>Reject proposal</ActionButton></div> : null}</Panel>)}</>;
}

export function Disputes({ create = false }) {
  const { state, dispatch, setNotice } = useDemo(); const router = useRouter(); const [error, setError] = useState("");
  return <><Heading title={create ? "Open a points dispute" : "Points disputes"} description="Review a contribution award with supporting evidence.">{!create ? <Link className={linkClass} href="/points/disputes/new">New dispute →</Link> : null}</Heading><Panel>{create ? <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const result = dispatch({ type: "dispute", reason: new FormData(e.currentTarget).get("reason") }); if (result.ok) { setNotice("Sample dispute recorded; no real award was changed."); router.push("/points/disputes"); } else setError(result.error); }}><Textarea label="Explain the disputed award" name="reason" required placeholder="Issue reference, expected award and supporting evidence" /><Button>Submit sample dispute</Button>{error ? <p role="alert">{error}</p> : null}</form> : state.disputes.length ? state.disputes.map((d) => <article key={d.id} className="demo-row"><Tag tone="warn">{d.status}</Tag><p className="mt-2">{d.reason}</p></article>) : <Empty>No open disputes in the sample workspace.</Empty>}</Panel></>;
}

export function Admin({ section }) {
  const { state, role, dispatch, setNotice } = useDemo(); const [newName, setNewName] = useState("");
  if (role === "user") return <Panel><Heading title="Admin access required" description="Switch the demo role to workspace admin to preview this screen." /></Panel>;
  if (section === "categories" || section === "types") {
    return <><Heading title={section === "types" ? "Issue types" : "Platforms & categories"} description="Maintain the workspace's issue classification." /><Panel>{state[section].map((name) => <p className="demo-row font-semibold" key={name}>{name}</p>)}<form className="mt-5 flex items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (!newName.trim()) return; const result = dispatch({ type: "taxonomy", kind: section, name: newName.trim() }); if (result.ok) { setNewName(""); setNotice("Sample classification added."); } else setNotice(result.error); }}><Field label="Name" required value={newName} onChange={(e) => setNewName(e.target.value)} /><Button>Add</Button></form></Panel></>;
  }
  if (section === "users") return <><Heading title="Admins & members" description="Preview administrative account management." /><Panel><div className="overflow-x-auto"><table className="demo-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{[[VIEWER, "maya@example.test", "Workspace admin"], ["Jonas Reed", "jonas@example.test", "Contributor"], ["Amina Yusuf", "amina@example.test", "Reviewer"]].map(([name, email, level]) => <tr key={email}><td>{name}</td><td>{email}</td><td>{level}</td><td><Tag tone="good">Active sample</Tag></td></tr>)}</tbody></table></div><div className="mt-5"><DisabledIntegration>Account suspension, permission grants and user deletion are display-only. The persona selector changes the preview, not a real account.</DisabledIntegration></div></Panel></>;
  if (section === "rewards") return <><Heading title="Platform rewards" description="Preview point rules and the weekly contribution target." /><Panel><form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setNotice("Reward settings preview saved locally in this form. No real points configuration changed."); }}><Field label="Weekly target" type="number" defaultValue={500} min={1} /><Field label="Accepted report" type="number" defaultValue={150} min={0} />{[450, 750, 1200, 1800].map((value, i) => <Field key={value} label={`${["Low", "Medium", "High", "Critical"][i]} severity solver award`} type="number" defaultValue={value} min={0} />)}<Button>Save sample values</Button></form></Panel></>;
  const stats = [{ label: "All issues", value: String(state.issues.length), href: "/issues", chip: "Live demo", chipTone: "tint", note: "in this workspace" }, { label: "Open", value: String(state.issues.filter((b) => b.status === "open").length), href: "/issues?status=open", chip: "Backlog", chipTone: "chip", note: "awaiting work" }, { label: "In progress", value: String(state.issues.filter((b) => b.status === "in_progress").length), href: "/activity", chip: "Agents", chipTone: "tint", note: "active work" }, { label: "Resolved", value: String(state.issues.filter((b) => b.status === "resolved").length), href: "/issues?status=resolved", chip: "Delivered", chipTone: "ok", note: "reviewed fixes" }];
  return <div className="space-y-5"><Heading title={section === "dashboard" ? "Admin dashboard" : "Administration"} description="Workspace analytics and configuration previews." /><OverviewStatCards stats={stats} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["users", "Admins & members"], ["categories", "Platforms & categories"], ["types", "Issue types"], ["milestones", "Milestones"], ["rewards", "Platform rewards"], ["dashboard", "Issue analytics"]].map(([href, label]) => <Link key={href} className="demo-panel font-bold hover:border-electric-blue-strong" href={`/admin/${href}`}>{label} →</Link>)}</div></div>;
}
