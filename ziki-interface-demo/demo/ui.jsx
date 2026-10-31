"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemo } from "./provider";

export const linkClass = "font-semibold text-zk-accent hover:underline";
export function Panel({ children, className = "", ...props }) { return <section className={`demo-panel ${className}`} {...props}>{children}</section>; }
export function Heading({ title, description, children }) { return <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[28px] font-extrabold tracking-tight text-zk-text">{title}</h1>{description ? <p className="mt-2 text-sm text-zk-muted">{description}</p> : null}</div>{children}</div>; }
export function Tag({ children, tone = "neutral" }) { return <span className={`demo-tag demo-tag-${tone}`}>{children}</span>; }
export function Field({ label, ...props }) { return <label className="demo-field">{label}<input {...props} /></label>; }
export function Select({ label, children, ...props }) { return <label className="demo-field">{label}<select {...props}>{children}</select></label>; }
export function Textarea({ label, ...props }) { return <label className="demo-field">{label}<textarea rows={4} {...props} /></label>; }
export function Empty({ children }) { return <p className="py-6 text-sm text-zk-muted">{children}</p>; }
export function DisabledIntegration({ children }) { return <p className="rounded-xl border border-zk-warn-bd bg-zk-warn-bg p-4 text-sm text-zk-warn-fg">{children} This demo never contacts an external integration.</p>; }
export function IssueLink({ id }) {
  const { state } = useDemo(); const issue = state.issues.find((bug) => bug.id === id);
  return issue ? <Link className={linkClass} href={`/issues/${issue.number}`}>#{issue.number} {issue.title}</Link> : <span className="text-zk-muted">No linked issue</span>;
}
export function Dialog({ title, children, close }) {
  const ref = useRef(null);
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  return <dialog ref={ref} className="demo-dialog" aria-labelledby="demo-dialog-title" onCancel={(event) => { event.preventDefault(); close(); }}><div className="mb-5 flex items-start justify-between gap-4"><h2 id="demo-dialog-title" className="text-xl font-bold">{title}</h2><Button variant="secondary" onClick={close}>Close</Button></div>{children}</dialog>;
}
export function ActionButton({ action, children, success, variant = "primary", onDone }) {
  const { dispatch, setNotice } = useDemo(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <div className="inline-block"><Button variant={variant} disabled={busy} onClick={async () => { setBusy(true); setError(""); await new Promise((resolve) => setTimeout(resolve, 300)); const result = dispatch(action); setBusy(false); if (!result.ok) setError(result.error); else { setNotice(success || "Sample changes saved."); onDone?.(); } }}>{busy ? "Saving…" : children}</Button>{error ? <p role="alert" className="mt-2 text-sm text-zk-bad-fg">{error}</p> : null}</div>;
}
