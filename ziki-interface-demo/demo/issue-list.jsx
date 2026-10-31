"use client";
import Link from 'next/link';
import {useDemo} from './provider';
import {Icon} from './workspace-shell';
export function WorkspaceIssues({issues}) {
 const {state}=useDemo();
 return <section className="ops-panel issue-worklist"><div className="panel-heading"><h2>Workspace issues <span className="count-label">{issues.length}</span></h2><span className="context-caption">Prioritized for your team</span></div><div className="issue-list-head"><span>Issue / project</span><span>Priority</span><span>Stage / status</span><span>Agent / evidence</span></div>{issues.map(issue=>{
 const claim=state.claims.find(c=>c.bugId===issue.id&&c.status==='active');
 const pending=state.approvals.some(a=>a.bugId===issue.id&&a.status==='pending');
 return <Link href={`/issues/${issue.number}`} key={issue.id} className="issue-work-row"><div className="issue-work-title"><Icon name="issues"/><div><h3>{issue.title}</h3><small>#{issue.number} · {issue.typeName} · {state.projects.find(p=>p.id===issue.projectId)?.name}</small></div></div><span className={`issue-priority priority-${issue.severity}`}><span className="status-dot"/>{issue.severity}</span><div className="issue-state"><strong>{['resolved','closed'].includes(issue.status)?'Merged / completed':pending?'Human approval':issue.pullRequestUrl?'Prove / review':issue.status==='in_progress'?'Deliver':issue.stage==='reported'?'Report':'Confirm'}</strong><small>{issue.status.replaceAll('_',' ')}</small></div><div className="issue-evidence"><strong>{claim?.agent||'Unassigned'}</strong><small>{issue.pullRequestUrl?'PR linked · inspect evidence':'Validation & review pending'}</small></div></Link>;
 })}{!issues.length&&<p className="queue-empty">No issues match these filters.</p>}</section>;
}
