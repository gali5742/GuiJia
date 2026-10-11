import {read,json,binding,assert,committed,git} from './liuyao-semantic-v013-candidate-v08-fallback-identity-v06-data-lib.mjs';
const p='data/liuyao-semantic-v013-candidate-v08-fallback-identity-v06-ci-transport-contract-v0.2.json',e=json(p);committed(p);
assert(e.semanticInputsChanged===false&&e.numericGatesChanged===false,'Technical transport may not change semantic policy');
assert(git(['diff','--name-only','HEAD^','HEAD'])===e.isolatedEntryPath,'CI wrapper changed non-entry files');
const text=read(e.workflowPath).toString(),start=text.indexOf('\non:\n'),end=text.indexOf('\npermissions:',start);
assert(start>0&&end>start&&read(e.isolatedEntryPath).toString()===text.slice(0,start)+'\non:\n  workflow_dispatch:\n'+text.slice(end),'CI wrapper differs from frozen transport workflow');
for(const b of e.bindings){assert(binding(b.path).sha256===b.sha256&&binding(b.path).gitBlobSha===b.gitBlobSha,'Transport binding drift');committed(b.path);assert(git(['rev-parse',`HEAD^:${b.path}`])===b.gitBlobSha,'Transport source differed from frozen parent');}
assert(git(['rev-parse',`HEAD^:${p}`])===binding(p).gitBlobSha,'Transport contract absent from source');
console.log(JSON.stringify({status:'frozen_transport_and_unchanged_semantic_execution_verified',sourceCommit:git(['rev-parse','HEAD^']),wrapperCommit:git(['rev-parse','HEAD']),encoderInvocations:0}));
