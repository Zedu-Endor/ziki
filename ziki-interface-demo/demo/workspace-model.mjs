import { VIEWER, NOW } from './store.mjs';

export function workspaceSummary(state, role) {
  const questions = state.questions.filter(q => q.owner === VIEWER && !q.answer);
  const approvals = role === 'user' ? [] : state.approvals.filter(a => a.status === 'pending');
  const rows = [
    ...questions.map(q => ({ ...q, kind: q.type === 'Blocker' ? 'Escalations' : q.type === 'Work Authorization' ? 'Approvals' : 'Questions', label: q.type === 'Blocker' ? 'Blocked · waiting on you' : q.type === 'Work Authorization' ? 'Work authorization' : 'Agent has a question', href: `/escalations/${q.id}`, cta: q.type === 'Work Authorization' ? 'Review plan' : 'Respond' })),
    ...approvals.map(a => ({ ...a, agent: 'Workspace gate', kind: 'Approvals', label: a.stage === 'before_merge' ? 'Merge approval required' : 'Offer approval required', href: `/activity?issue=${state.issues.find(i => i.id === a.bugId)?.number || ''}`, cta: 'Review gate' })),
  ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const agents = state.agents.filter(a => !a.revoked).map(a => {
    const waiting = questions.some(q => q.agent === a.name);
    const claim = state.claims.find(c => c.agent === a.name && c.status === 'active');
    return { ...a, status: waiting ? 'Waiting on you' : claim ? 'Working' : 'Available', task: state.issues.find(i => i.id === claim?.bugId)?.title || 'Ready for the next assignment' };
  });
  const events = state.events.filter(e => role !== 'user' || e.owner === VIEWER);
  const hours = Array.from({length: 12}, (_, i) => {
    const start = new Date(NOW).getTime() - (11-i) * 3600000;
    return events.filter(e => new Date(e.createdAt).getTime() >= start && new Date(e.createdAt).getTime() < start + 3600000).length;
  });
  return { questions, approvals, rows, agents, hours, events, reviews: state.issues.filter(i => i.pullRequestUrl && i.status === 'in_progress'), available: state.issues.filter(i => i.status === 'open'), inProgress: state.issues.filter(i => i.status === 'in_progress') };
}
