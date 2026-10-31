import assert from 'node:assert/strict';
import {ROUTES} from '../demo/store.mjs';
const origin=process.argv[2]||'http://localhost:3003';
const routes=[...new Set([...ROUTES,'/reviews','/issues/1438','/issues/1438/history','/escalations/q1','/settings/agents/agent-1/messages','/notifications/n1','/demo-limitations'])];
for(const route of routes){
 const response=await fetch(origin+route);assert.equal(response.status,200,route);const html=await response.text();
 assert.ok(!html.includes('Page not included in this demo'),route);assert.ok(!html.includes('"digest":"'),route);
 if(!['/login','/signup'].includes(route)){
  assert.ok(html.includes('aria-label="Workspace"'),route);
  for(const href of ['/dashboard','/issues','/activity','/settings/agents','/reviews','/projects','/marketing','/security','/workers'])assert.ok(html.includes(`href="${href}"`),`${route}: ${href}`);
 }
 if(route==='/'||route==='/dashboard')for(const text of ['Needs your attention','Your agent team','Before you leave','Available work','Workspace summary'])assert.ok(html.includes(text),text);
 if(route==='/activity')for(const text of ['Needs Attention','Work History','Recent Activity'])assert.ok(html.includes(text),text);
 console.log(`PASS ${route}`);
}
console.log(`${routes.length} production routes passed.`);
