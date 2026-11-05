"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useDemo } from './provider';
import { VIEWER } from './store.mjs';
import { FILTER_DEFAULTS, readIssueFilters, issueFiltersHref, filterIssues } from './issue-filters.mjs';
import { WorkspaceIssues } from './issue-list';
import { Heading, Panel, Field, Select } from './ui';
import { Button } from '@/components/ui/button';

export function Issues() {
  const { state } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const filters = readIssueFilters(params);
  const issues = filterIssues(state.issues, filters, VIEWER);
  const active = Object.entries(FILTER_DEFAULTS).some(([key, value]) => filters[key] !== value);
  function update(changes) {
    const href = issueFiltersHref(params.toString(), changes);
    startTransition(() => router.push(href, { scroll: false }));
  }
  const select = key => ({ value: filters[key], disabled: pending, onChange: event => update({ [key]: event.target.value }) });
  return <div className="space-y-5">
    <Heading title="Issues" description="Track reports, confirm issues and follow fixes through review.">
      <Link className="rounded-full bg-electric-blue-strong px-4 py-2 font-semibold text-white" href="/issues/new">+ New issue</Link>
    </Heading>
    <Panel aria-label="Issue filters">
      <form className="mb-4 flex flex-wrap items-end gap-3" onSubmit={event => {
        event.preventDefault();
        update({ q: String(new FormData(event.currentTarget).get('q') || '') });
      }}>
        <div className="min-w-0 flex-1"><Field key={filters.q} label="Search issues" name="q" type="search" defaultValue={filters.q} placeholder="Search title or #number" disabled={pending} /></div>
        <Button disabled={pending}>Search</Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select label="Status" {...select('status')}><option value="all">All statuses</option>{['open', 'in_progress', 'resolved', 'closed'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</Select>
        <Select label="Severity" {...select('severity')}><option value="all">All priorities</option>{['low', 'medium', 'high', 'critical'].map(value => <option key={value}>{value}</option>)}</Select>
        <Select label="Project" {...select('project')}><option value="all">All projects</option>{state.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</Select>
        <Select label="My issues" {...select('mine')}><option value="all">Everyone&apos;s issues</option><option value="assigned">Assigned to me</option><option value="created">Reported by me</option></Select>
        <Select label="Sort" {...select('sort')}><option value="votes">Top votes</option><option value="newest">Newest</option></Select>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite">{pending ? 'Updating issues…' : `${issues.length} of ${state.issues.length} issues`}</p>
        {active && <Button variant="secondary" disabled={pending} onClick={() => update(FILTER_DEFAULTS)}>Clear all filters</Button>}
      </div>
    </Panel>
    <div aria-busy={pending}><WorkspaceIssues issues={issues} filters={issueFiltersHref('', filters).split('?')[1] || ''} /></div>
    {!issues.length && <Panel><h2 className="font-bold">No matching issues</h2><p className="my-3 text-sm text-zk-muted">Try a different search or clear the filters to see all issues in this workspace.</p>{active && <Button variant="secondary" disabled={pending} onClick={() => update(FILTER_DEFAULTS)}>Show all issues</Button>}</Panel>}
  </div>;
}
