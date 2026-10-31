import { initialState, transition, VIEWER } from "./activity-model.mjs";
export { VIEWER };
export const NOW = "2026-10-27T14:00:00.000Z";
export const WORKSPACES = [{ id: "zendor", name: "Team Zendor", slug: "team-zendor" }, { id: "labs", name: "Ziki Labs", slug: "ziki-labs" }];
export const ROUTES = ["/", "/login", "/signup", "/dashboard", "/issues", "/issues/new", "/activity", "/escalations", "/projects", "/projects/ziki-issues/settings", "/milestones", "/workers", "/team", "/jobs", "/feed", "/marketing", "/redesigns", "/notifications", "/settings", "/settings/profile", "/settings/agents", "/settings/agents/pair", "/settings/agents/connect", "/settings/audit", "/settings/security", "/settings/webhooks", "/settings/team", "/tenants", "/tenants/team-zendor", "/admin", "/admin/dashboard", "/admin/users", "/admin/rewards", "/admin/categories", "/admin/types", "/admin/milestones", "/points/disputes", "/points/disputes/new", "/docs"];

export function seedStore(workspace = "zendor") {
  const base = initialState();
  const projects = workspace === "zendor" ? [{ id: "p1", slug: "ziki-issues", name: "Ziki Issues", description: "Collaborative issue tracking for humans and agents." }, { id: "p2", slug: "agent-platform", name: "Agent Platform", description: "Agent APIs, dispatching and review workflows." }] : [{ id: "labs-project", slug: "experiments", name: "Experiments", description: "An independent sandbox workspace." }];
  const issues = workspace === "zendor" ? base.issues : [{ id: "labs-1", number: 1, title: "Explore agent-assisted accessibility testing", status: "open", description: "Compare keyboard and screen reader checks across the demo's core workflows.", pullRequestUrl: null }];
  return {
    ...base, projects,
    issues: issues.map((bug, i) => ({ ...bug, projectId: projects[i % projects.length].id, severity: ["high", "critical", "medium", "low"][i % 4], typeName: i === 2 ? "Feature" : "Bug", voteCount: 8 + i * 3, userVoted: false, commentCount: 2, createdAt: new Date(new Date(NOW) - (i + 1) * 86400000).toISOString(), reporter: i % 2 ? "Jonas Reed" : VIEWER, assignee: i < 3 ? VIEWER : "Jonas Reed", stage: "ready", milestone: "Autumn reliability", watched: false })),
    claims: workspace === "zendor" ? base.claims : [],
    questions: workspace === "zendor" ? base.questions : [],
    approvals: workspace === "zendor" ? base.approvals : [],
    events: workspace === "zendor" ? base.events : [],
    agents: (workspace === "zendor" ? base.agents : [{ name: "Nova", model: "GPT", owner: VIEWER, level: "Observer" }]).map((agent, i) => ({ ...agent, id: `agent-${i + 1}`, revoked: false, instructions: "Prioritize reproducible reports and keep the human owner informed." })),
    comments: issues.flatMap((bug) => [
      { id: `${bug.id}-c1`, bugId: bug.id, author: "Jonas Reed", body: "Reproduced this in the current release. The steps in the report are accurate.", at: "2026-10-26T10:00:00Z" },
      { id: `${bug.id}-c2`, bugId: bug.id, author: "Sage", body: "I have added a regression check and will post my verdict once the proposed change is ready.", at: "2026-10-26T11:20:00Z" },
    ]),
    notifications: workspace === "zendor" ? [{ id: "n1", title: "Human approval required before merge · #1441", href: "/activity", read: false }, { id: "n2", title: "Atlas is waiting for your guidance · #1438", href: "/escalations/q1", read: false }, { id: "n3", title: "Font reliability fix accepted", href: "/issues/1432", read: true }] : [],
    milestones: [{ id: "m1", name: "Autumn reliability", description: "Reliable builds, accessible navigation and predictable delivery.", due: "2026-11-06" }, { id: "m2", name: "Agent collaboration", description: "Make human oversight clear at every step.", due: "2026-11-20" }],
    messages: [], jobs: [{ id: "job1", title: "Audit keyboard navigation across issue workflows", description: "Review focus order, accessible names and Escape behavior on the issue list and detail pages.", submissions: 3, limit: 10, reward: 150 }],
    redesigns: [{ id: "r1", title: "Compact issue metadata layout", description: "A denser issue detail panel with clear hierarchy on narrow screens.", status: "pending", agent: "Atlas" }],
    disputes: [], categories: ["Web", "API", "Mobile"], types: ["Bug", "Feature", "Improvement"],
  };
}

export function updateStore(state, action) {
  if (["answer", "approval"].includes(action.type)) return transition(state, action);
  const event = (label, bugId) => ({ id: `evt-${action.at}`, actor: VIEWER, owner: VIEWER, action: label, bugId, createdAt: action.at });
  if (action.type === "vote") return { ...state, issues: state.issues.map((bug) => bug.id === action.id ? { ...bug, userVoted: !bug.userVoted, voteCount: bug.voteCount + (bug.userVoted ? -1 : 1) } : bug) };
  if (action.type === "status" || action.type === "watch") return { ...state, issues: state.issues.map((bug) => bug.id === action.id ? { ...bug, ...(action.type === "status" ? { status: action.status } : { watched: !bug.watched }) } : bug), events: [event(`issue.${action.type === "status" ? "status_changed" : "watch_changed"}`, action.id), ...state.events] };
  if (action.type === "createIssue") {
    const number = Math.max(1459, ...state.issues.map((bug) => bug.number)) + 1;
    const bug = { id: `issue-${number}`, number, title: action.title.trim(), description: action.description.trim(), status: "open", severity: action.severity, projectId: action.projectId, typeName: action.issueType, voteCount: 0, userVoted: false, commentCount: 0, createdAt: action.at, reporter: VIEWER, assignee: null, stage: "reported", milestone: null, pullRequestUrl: null, watched: true };
    if (!bug.title || !bug.description) return state;
    return { ...state, issues: [bug, ...state.issues], events: [event("issue.created", bug.id), ...state.events] };
  }
  if (action.type === "comment") {
    if (!action.body?.trim()) return state;
    return { ...state, comments: [...state.comments, { id: `comment-${action.at}`, bugId: action.id, author: VIEWER, body: action.body.trim(), at: action.at }], issues: state.issues.map((bug) => bug.id === action.id ? { ...bug, commentCount: bug.commentCount + 1 } : bug), events: [event("comment.created", action.id), ...state.events] };
  }
  if (action.type === "readNotification") return { ...state, notifications: state.notifications.map((n) => action.id === "all" || n.id === action.id ? { ...n, read: true } : n) };
  if (action.type === "project") return { ...state, projects: [...state.projects, { id: `project-${action.at}`, slug: `project-${state.projects.length + 1}`, name: action.name, description: action.description }] };
  if (action.type === "milestone") return { ...state, milestones: [...state.milestones, { id: `milestone-${action.at}`, name: action.name, description: action.description, due: action.due }] };
  if (action.type === "agent") return { ...state, agents: [...state.agents, { id: `agent-${action.at}`, name: action.name, model: action.model, level: action.level, owner: VIEWER, revoked: false, instructions: action.instructions || "" }] };
  if (action.type === "agentUpdate") return { ...state, agents: state.agents.map((agent) => agent.id === action.id ? { ...agent, ...action.changes } : agent) };
  if (action.type === "message") return { ...state, messages: [...state.messages, { id: `msg-${action.at}`, agentId: action.id, body: action.body, at: action.at }] };
  if (action.type === "redesign") return { ...state, redesigns: state.redesigns.map((row) => row.id === action.id ? { ...row, status: action.status } : row) };
  if (action.type === "dispute") return { ...state, disputes: [...state.disputes, { id: `dispute-${action.at}`, reason: action.reason, status: "open" }] };
  if (action.type === "taxonomy") return { ...state, [action.kind]: [...state[action.kind], action.name] };
  if (action.type === "submission") return { ...state, jobs: state.jobs.map((job) => job.id === action.id ? { ...job, submissions: job.submissions + 1 } : job) };
  return state;
}
