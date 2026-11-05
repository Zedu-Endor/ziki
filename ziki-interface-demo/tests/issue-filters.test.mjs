import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedStore, VIEWER } from '../demo/store.mjs';
import { FILTER_DEFAULTS, readIssueFilters, issueFiltersHref, filterIssues, issueListReturnHref } from '../demo/issue-filters.mjs';

test('all filters survive URL serialization and reload', () => {
  const filters = { q: '#1438', status: 'open', severity: 'high', project: 'p1', mine: 'assigned', sort: 'newest' };
  const href = issueFiltersHref('', filters);
  assert.deepEqual(readIssueFilters(new URL(href, 'https://example.test').searchParams), filters);
});

test('updates preserve other filters and unrelated context, and reset pagination', () => {
  const href = issueFiltersHref('q=font&status=open&project=p1&page=3&context=dashboard', { severity: 'high' });
  const params = new URL(href, 'https://example.test').searchParams;
  assert.equal(params.get('q'), 'font');
  assert.equal(params.get('project'), 'p1');
  assert.equal(params.get('severity'), 'high');
  assert.equal(params.get('context'), 'dashboard');
  assert.equal(params.has('page'), false);
  assert.equal(issueFiltersHref(href.split('?')[1], FILTER_DEFAULTS), '/issues?context=dashboard');
});

test('malformed enum values fall back to usable defaults', () => {
  assert.deepEqual(readIssueFilters(new URLSearchParams('status=wrong&severity=urgent&mine=unknown&sort=bad')), FILTER_DEFAULTS);
});

test('search matches issue number and case-insensitive title with surrounding whitespace', () => {
  const { issues } = seedStore();
  const first = issues[0];
  assert.deepEqual(filterIssues(issues, { ...FILTER_DEFAULTS, q: `  #${first.number}  ` }, VIEWER).map(i => i.id), [first.id]);
  assert.ok(filterIssues(issues, { ...FILTER_DEFAULTS, q: first.title.toUpperCase() }, VIEWER).some(i => i.id === first.id));
  assert.equal(filterIssues(issues, { ...FILTER_DEFAULTS, q: 'nonexistent-issue-xyz' }, VIEWER).length, 0);
});

test('combined filters and personal views restrict the same result set without mutating data', () => {
  const { issues } = seedStore();
  const originalOrder = issues.map(i => i.id);
  const first = issues.find(i => i.assignee === VIEWER);
  const filters = { ...FILTER_DEFAULTS, project: first.projectId, status: first.status, severity: first.severity, mine: 'assigned' };
  const result = filterIssues(issues, filters, VIEWER);
  assert.ok(result.length > 0);
  assert.ok(result.every(i => i.projectId === first.projectId && i.status === first.status && i.severity === first.severity && i.assignee === VIEWER));
  assert.ok(filterIssues(issues, { ...FILTER_DEFAULTS, mine: 'created' }, VIEWER).every(i => i.reporter === VIEWER));
  assert.deepEqual(issues.map(i => i.id), originalOrder);
});

test('sorting honors votes and newest, and empty workspaces remain usable', () => {
  const { issues } = seedStore();
  for (const sort of ['votes', 'newest']) {
    const rows = filterIssues(issues, { ...FILTER_DEFAULTS, sort }, VIEWER);
    assert.ok(rows.every((row, index) => !index || (sort === 'votes' ? rows[index - 1].voteCount >= row.voteCount : rows[index - 1].createdAt >= row.createdAt)));
  }
  assert.deepEqual(filterIssues([], FILTER_DEFAULTS, VIEWER), []);
});

test('detail return links restore filters and cannot redirect outside the issue list', () => {
  const filters = 'q=font&project=p1&mine=assigned&sort=newest';
  assert.equal(issueListReturnHref(new URLSearchParams({ filters })), `/issues?${filters}`);
  assert.equal(issueListReturnHref(new URLSearchParams({ filters: 'https://evil.test?status=open' })), '/issues');
  assert.equal(issueListReturnHref(new URLSearchParams()), '/issues');
});
