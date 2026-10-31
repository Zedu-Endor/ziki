"use client";
import Link from 'next/link';
import { useDemo } from './provider';
import { workspaceSummary } from './workspace-model.mjs';
import { Heading, Panel, Empty } from './ui';
export function Reviews() {
 const {state,role}=useDemo();const {reviews,approvals}=workspaceSummary(state,role);
 return <div className="space-y-5"><Heading title="Pull requests & reviews" description="Inspect delivered work, independent evidence, and human approval gates."/><Panel><h2 className="text-lg font-semibold">Linked work</h2>{!reviews.length&&<Empty>No pull requests waiting for review.</Empty>}{reviews.map(i=><article className="review-queue-row" key={i.id}><div><small>PROVE → MERGE · #{i.number}</small><h3><Link href={`/issues/${i.number}?pr=1`}>{i.title}</Link></h3><p>Independent test and review evidence must be checked before merge.</p></div><Link className="row-action" href={`/issues/${i.number}?pr=1`}>Inspect work ↗</Link></article>)}</Panel><Panel><h2 className="text-lg font-semibold">Human approval gates</h2>{!approvals.length&&<Empty>No pending gates available to this persona.</Empty>}{approvals.map(a=>{const issue=state.issues.find(i=>i.id===a.bugId);return <article className="review-queue-row" key={a.id}><div><small>{a.stage==='before_merge'?'MERGE':'AUTHORIZE'} · Human decision required</small><h3>{issue?.title}</h3><p>{a.reasons}</p></div><Link className="row-action" href={`/activity?issue=${issue?.number||''}`}>Review gate ↗</Link></article>;})}</Panel></div>;
}
