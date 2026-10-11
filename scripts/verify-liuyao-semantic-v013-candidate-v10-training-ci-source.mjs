import {read,json,binding,assert,committed,git} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
const p='data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-training-execution-contract-v0.1.json',t=json(p);committed(p);
assert(git(['diff','--name-only','HEAD^','HEAD'])===t.isolatedEntryPath,'Training CI wrapper touched non-entry source');
const text=read(t.workflowPath).toString(),start=text.indexOf('\non:\n'),end=text.indexOf('\npermissions:',start);
assert(start>0&&end>start&&read(t.isolatedEntryPath).toString()===text.slice(0,start)+'\non:\n  workflow_dispatch:\n'+text.slice(end),'Training CI entry differs from frozen workflow');
for(const b of t.bindings){assert(binding(b.path).sha256===b.sha256&&binding(b.path).gitBlobSha===b.gitBlobSha,'Frozen training CI binding drift');committed(b.path);assert(git(['rev-parse',`HEAD^:${b.path}`])===b.gitBlobSha,'Training CI input differs from source parent');}
assert(git(['rev-parse',`HEAD^:${p}`])===binding(p).gitBlobSha,'Training contract absent from source');
console.log(JSON.stringify({status:'frozen_training_source_and_isolated_entry_verified',sourceCommit:git(['rev-parse','HEAD^']),wrapperCommit:git(['rev-parse','HEAD']),encoderInvocations:0}));
