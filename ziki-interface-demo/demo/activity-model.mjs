export const PAGE_SIZE = 20;
export const VIEWER = "Demo user";
const at = (minutes) => new Date(Date.UTC(2026, 9, 27, 14, 0) - minutes * 60000).toISOString();

const issue = (number, title, status, pr, description) => ({
  id: `issue-${number}`, number, title, status,
  pullRequestUrl: pr ? `https://github.com/ziki-demo/issue-tracker/pull/${pr}` : null,
  description,
});

export function initialState() {
  const issues = [
    issue(1438, "Restore keyboard focus after closing issue details", "in_progress", null, "When the issue detail panel closes, focus should return to the row that opened it. Verify with keyboard navigation and a screen reader."),
    issue(1441, "Prevent duplicate webhook delivery on retry", "in_progress", 312, "Make the delivery retry idempotent and preserve the original delivery identifier. The pull request is waiting for a workspace approval gate."),
    issue(1446, "Export filtered issue lists as CSV", "open", null, "Add CSV export for the selected project and active filters. Include number, title, severity, status and assignee."),
    issue(1432, "Self-host fonts for reliable production builds", "resolved", 306, "Bundle application fonts locally so production builds do not depend on a remote font download."),
    issue(1427, "Keep notification count in sync after reading", "resolved", 298, "Update unread counts when a notification is opened, including when the panel is used in a second tab."),
    issue(1450, "Add audit log cursor pagination", "open", null, "Introduce stable timestamp and identifier cursors so new activity cannot make older rows repeat or disappear."),
  ];
  const agents = [
    { name: "Atlas", model: "Claude", owner: VIEWER, level: "Contributor" },
    { name: "Sage", model: "GPT", owner: VIEWER, level: "Reviewer" },
    { name: "Orbit", model: "Claude", owner: "Jonas Reed", level: "Contributor" },
  ];
  const claims = Array.from({ length: 25 }, (_, index) => {
    const agent = agents[index % agents.length];
    const bug = issues[index % issues.length];
    const status = index < 2 ? "active" : index === 2 ? "offered" : "released";
    return {
      id: `claim-${index}`, agent: agent.name, owner: agent.owner, bugId: bug.id, status,
      createdAt: at(65 + index * 140), deliverBy: at(-120 + index * 140),
      lastHeartbeatAt: index < 2 ? at(8 + index * 4) : at(40 + index * 140),
      waitingOnOwnerSince: index === 0 ? at(24) : null,
      releaseReason: status === "released" ? (index % 5 === 0 ? "deadline" : "resolved") : null,
    };
  });
  const questions = [
    { id: "q1", agent: "Atlas", owner: VIEWER, bugId: issues[0].id, type: "Blocker", body: "The focus trap and the issue panel both restore focus. Which component should own the return-focus behavior? I have paused the claim until we choose one.", createdAt: at(24), answer: null },
    { id: "q2", agent: "Sage", owner: VIEWER, bugId: issues[1].id, type: "Scope Expansion", body: "The retry fix also affects the manual redelivery endpoint. May I include a small regression test for that path in this review?", createdAt: at(47), answer: null },
    { id: "q3", agent: "Atlas", owner: VIEWER, bugId: issues[2].id, type: "Work Authorization", body: "I can implement the CSV export in about 45 minutes. The plan reuses the existing issue filters and excludes private comment content. May I submit a bid?", createdAt: at(80), answer: null },
    { id: "q4", agent: "Sage", owner: VIEWER, bugId: null, type: "Question", body: "For my next review session, should I prioritize accessibility regressions or webhook delivery failures?", createdAt: at(115), answer: null },
    // Deliberately separate ownership for the preview's visibility checks.
    { id: "q5", agent: "Orbit", owner: "Jonas Reed", bugId: issues[5].id, type: "Blocker", body: "Please confirm the project-specific cursor behavior.", createdAt: at(50), answer: null },
  ];
  const approvals = [
    { id: "a1", bugId: issues[1].id, stage: "before_merge", status: "pending", reasons: "type: Bug, severity: high, files matching: lib/webhooks/**", createdAt: at(18) },
    { id: "a2", bugId: issues[2].id, stage: "before_offer", status: "pending", reasons: "type: Feature, severity: medium", createdAt: at(55) },
    { id: "a3", bugId: issues[5].id, stage: "before_offer", status: "pending", reasons: "files matching: lib/agent-audit/**", createdAt: at(95) },
  ];
  const actions = ["issue.claimed", "issue.pr_linked", "validation.accepted", "question.asked", "test_verdict.submitted", "claim.released"];
  const events = Array.from({ length: 27 }, (_, index) => ({
    id: `event-${index}`, actor: agents[index % 3].name, owner: agents[index % 3].owner,
    action: actions[index % actions.length], bugId: issues[index % issues.length].id,
    createdAt: at(12 + index * 55),
  }));
  return { issues, agents, claims, questions, approvals, events };
}

export function visibleData(state, role, filters) {
  const number = filters.issue.trim().replace(/^#/, "");
  const matches = (row) => !number || state.issues.find((bug) => bug.id === row.bugId)?.number.toString() === number;
  const mine = (row) => role === "admin" || row.owner === VIEWER;
  return {
    questions: state.questions.filter((q) => q.owner === VIEWER && q.answer === null && matches(q)),
    approvals: role === "admin" ? state.approvals.filter((a) => a.status === "pending" && matches(a)) : [],
    work: state.claims.filter((c) => mine(c) && matches(c) && (filters.state === "all" || c.status === filters.state)),
    events: state.events.filter((e) => mine(e) && matches(e)),
  };
}

export function transition(state, action) {
  if (action.type === "reset") return initialState();
  const event = (name, bugId) => ({ id: `decision-${action.at}`, actor: VIEWER, owner: VIEWER, action: name, bugId, createdAt: action.at });
  if (action.type === "answer") {
    const q = state.questions.find((row) => row.id === action.id);
    if (!q || q.owner !== VIEWER || q.answer !== null || !action.answer?.trim()) return state;
    const questions = state.questions.map((row) => row.id === action.id ? { ...row, answer: action.answer.trim() } : row);
    const stillWaiting = questions.some((row) => row.agent === q.agent && row.bugId === q.bugId && row.answer === null);
    const claims = state.claims.map((claim) => {
      if (stillWaiting || claim.agent !== q.agent || claim.bugId !== q.bugId || !claim.waitingOnOwnerSince) return claim;
      const pause = new Date(action.at) - new Date(claim.waitingOnOwnerSince);
      return { ...claim, waitingOnOwnerSince: null, deliverBy: new Date(new Date(claim.deliverBy).getTime() + Math.max(0, pause)).toISOString() };
    });
    return { ...state, questions, claims, events: [event("question.answered", q.bugId), ...state.events] };
  }
  if (action.type === "approval") {
    if (action.role !== "admin" || !["approved", "rejected"].includes(action.decision)) return state;
    const approval = state.approvals.find((a) => a.id === action.id && a.status === "pending");
    if (!approval) return state;
    return {
      ...state,
      approvals: state.approvals.map((a) => a.id === action.id ? { ...a, status: action.decision } : a),
      events: [event(`approval.${action.decision}`, approval.bugId), ...state.events],
    };
  }
  return state;
}

export function pageRows(rows, page) {
  const last = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
  const current = Math.min(Math.max(0, page), last);
  return { items: rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE), current, last };
}
