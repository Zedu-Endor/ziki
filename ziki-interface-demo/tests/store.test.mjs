import { test } from "node:test";
import assert from "node:assert/strict";
import { seedStore, updateStore, ROUTES, VIEWER, NOW } from "../demo/store.mjs";
import { visibleData, pageRows } from "../demo/activity-model.mjs";
test("sample workspaces have isolated records", () => {
  const state = seedStore(), labs = seedStore("labs");
  const next = updateStore(state, { type: "status", id: state.issues[0].id, status: "closed", at: NOW });
  assert.equal(next.issues[0].status, "closed"); assert.equal(state.issues[0].status, "in_progress");
  assert.equal(labs.issues.length, 1); assert.equal(labs.questions.length, 0); assert.equal(labs.issues[0].status, "open");
});
test("owner and admin views keep private escalation bodies owner-scoped", () => {
  for (const role of ["member", "admin"]) {
    const data = visibleData(seedStore(), role, { issue: "", state: "all" });
    assert.ok(data.questions.every((q) => q.owner === VIEWER));
    if (role === "member") { assert.equal(data.approvals.length, 0); assert.ok(data.work.every((c) => c.owner === VIEWER)); }
  }
});
test("created issues and comments update list and audit records", () => {
  const state = seedStore();
  const created = updateStore(state, { type: "createIssue", title: "Sample issue", description: "Reproduction details", severity: "medium", issueType: "Bug", projectId: "p1", at: NOW });
  assert.equal(created.issues.length, state.issues.length + 1); assert.equal(created.issues[0].number, 1460);
  const next = updateStore(created, { type: "comment", id: created.issues[0].id, body: "Confirmed", at: NOW });
  assert.equal(next.issues[0].commentCount, 1); assert.equal(next.events[0].action, "comment.created"); assert.equal(next.comments.at(-1).body, "Confirmed");
});
test("votes and notification reads are reversible/local", () => {
  const state = seedStore(); const next = updateStore(state, { type: "vote", id: state.issues[0].id });
  assert.equal(next.issues[0].voteCount, state.issues[0].voteCount + 1);
  assert.equal(updateStore(next, { type: "vote", id: state.issues[0].id }).issues[0].voteCount, state.issues[0].voteCount);
  assert.ok(updateStore(state, { type: "readNotification", id: "all" }).notifications.every((n) => n.read));
});
test("owner responses resume claims without granting a pipeline gate", () => {
  const state = seedStore(); const next = updateStore(state, { type: "answer", id: "q1", answer: "Use the panel", at: NOW });
  assert.equal(next.claims[0].waitingOnOwnerSince, null); assert.equal(next.approvals[0].status, "pending");
  const approved = updateStore(state, { type: "approval", id: "a1", role: "admin", decision: "approved", at: NOW });
  assert.equal(approved.approvals[0].status, "approved"); assert.equal(approved.claims, state.claims);
  assert.equal(updateStore(state, { type: "approval", id: "a1", role: "member", decision: "approved", at: NOW }), state);
});
test("pagination stays bounded and invalid issue filters match nothing", () => {
  const state = seedStore(); assert.equal(pageRows(state.claims, 0).items.length, 20); assert.equal(pageRows(state.claims, 1).items.length, 5);
  assert.equal(visibleData(state, "admin", { issue: "garbage", state: "all" }).work.length, 0);
});
test("agent settings, messages and taxonomy update sample data", () => {
  let state = updateStore(seedStore(), { type: "agentUpdate", id: "agent-1", changes: { instructions: "Accessibility first" } });
  assert.equal(state.agents[0].instructions, "Accessibility first");
  state = updateStore(state, { type: "message", id: "agent-1", body: "Investigate", at: NOW }); assert.equal(state.messages.at(-1).agentId, "agent-1");
  assert.ok(updateStore(state, { type: "taxonomy", kind: "types", name: "Accessibility" }).types.includes("Accessibility"));
});
test("inventory covers original primary menus and activity", () => {
  for (const route of ["/dashboard", "/issues", "/activity", "/escalations", "/settings/agents", "/settings/security", "/projects", "/workers", "/admin/users", "/docs"]) assert.ok(ROUTES.includes(route));
});
