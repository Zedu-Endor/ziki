export const FILTER_DEFAULTS = { q: '', status: 'all', severity: 'all', project: 'all', mine: 'all', sort: 'votes' };
const choices = {
  status: ['all', 'open', 'in_progress', 'resolved', 'closed'],
  severity: ['all', 'low', 'medium', 'high', 'critical'],
  mine: ['all', 'assigned', 'created'],
  sort: ['votes', 'newest'],
};

export function readIssueFilters(params) {
  return Object.fromEntries(Object.entries(FILTER_DEFAULTS).map(([key, fallback]) => {
    const value = params.get(key);
    return [key, value && (!choices[key] || choices[key].includes(value)) ? value : fallback];
  }));
}

export function issueFiltersHref(params, changes) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (!(key in FILTER_DEFAULTS)) continue;
    const normalized = key === 'q' ? value.trim() : value;
    if (!normalized || normalized === FILTER_DEFAULTS[key]) next.delete(key);
    else next.set(key, normalized);
  }
  next.delete('page');
  return `/issues${next.size ? `?${next}` : ''}`;
}

export function filterIssues(issues, filters, viewer) {
  const term = filters.q.trim().replace(/^#/, '').toLowerCase();
  return issues.filter(issue =>
    (filters.status === 'all' || issue.status === filters.status) &&
    (filters.severity === 'all' || issue.severity === filters.severity) &&
    (filters.project === 'all' || issue.projectId === filters.project) &&
    (filters.mine !== 'assigned' || issue.assignee === viewer) &&
    (filters.mine !== 'created' || issue.reporter === viewer) &&
    `${issue.number} ${issue.title}`.toLowerCase().includes(term)
  ).sort((a, b) => (filters.sort === 'newest'
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : b.voteCount - a.voteCount) || b.number - a.number);
}

// A return link is always a local issue-list URL, never an arbitrary destination.
export function issueListReturnHref(params) {
  const saved = new URLSearchParams(params.get('filters') || '');
  const filters = readIssueFilters(saved);
  return issueFiltersHref('', filters);
}
