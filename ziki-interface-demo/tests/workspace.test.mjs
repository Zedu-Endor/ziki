import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedStore,updateStore,NOW,VIEWER} from '../demo/store.mjs';
import {workspaceSummary} from '../demo/workspace-model.mjs';
test('attention queue respects private ownership and pipeline permissions',()=>{
 const state=seedStore(); const admin=workspaceSummary(state,'admin');const member=workspaceSummary(state,'user');
 assert.equal(admin.rows.length,7);assert.equal(member.rows.length,4);
 assert.ok(admin.questions.every(q=>q.owner===VIEWER)); assert.ok(!admin.rows.some(r=>r.id==='q5'));
 assert.equal(member.approvals.length,0);
 assert.ok(admin.rows.every((r,i,rows)=>!i||new Date(rows[i-1].createdAt)>=new Date(r.createdAt)));
});
test('decisions remove requests and recompute waiting agent status',()=>{
 let state=seedStore();const before=workspaceSummary(state,'admin');
 for(const q of before.questions.filter(q=>q.agent==='Atlas'))state=updateStore(state,{type:'answer',id:q.id,answer:'Proceed with the documented plan.',at:NOW});
 state=updateStore(state,{type:'approval',id:'a1',decision:'approved',role:'admin',at:NOW});
 const after=workspaceSummary(state,'admin');assert.equal(after.rows.length,before.rows.length-3);
 assert.equal(after.agents.find(a=>a.name==='Atlas').status,'Working');
 assert.ok(after.hours.reduce((a,b)=>a+b,0)>before.hours.reduce((a,b)=>a+b,0));
});
test('workspace switching yields an empty, isolated queue',()=>{
 const summary=workspaceSummary(seedStore('labs'),'admin');assert.equal(summary.rows.length,0);
 assert.equal(summary.agents.length,1);assert.equal(summary.agents[0].name,'Nova');assert.equal(summary.available.length,1);
 assert.equal(summary.hours.reduce((a,b)=>a+b,0),0);
});
