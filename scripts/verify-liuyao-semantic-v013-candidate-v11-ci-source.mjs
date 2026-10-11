import {read,json,binding,assert,committed,git,implementationPath} from './liuyao-semantic-v013-candidate-v11-fallback-identity-v09-data-lib.mjs';
const p=process.argv.includes('--execution')?'data/liuyao-semantic-v013-candidate-v11-fallback-identity-v09-execution-contract-v0.1.json':implementationPath;
const e=json(p);committed(p);
assert(git(['diff','--name-only','HEAD^','HEAD'])===e.isolatedEntryPath,'Isolated CI wrapper may change only entry');
const text=read(e.workflowPath).toString(),start=text.indexOf('\non:\n'),end=text.indexOf('\npermissions:',start);
assert(start>0&&end>start,'Workflow structure drift');
assert(read(e.isolatedEntryPath).toString()===text.slice(0,start)+'\non:\n  workflow_dispatch:\n'+text.slice(end),'CI entry differs from frozen workflow');
for(const b of e.bindings){assert(binding(b.path).gitBlobSha===b.gitBlobSha&&binding(b.path).sha256===b.sha256,'CI binding drift');committed(b.path);assert(git(['rev-parse',`HEAD^:${b.path}`])===b.gitBlobSha,'CI source differs from committed parent');}
assert(git(['rev-parse',`HEAD^:${p}`])===binding(p).gitBlobSha,'Contract absent from frozen source');
console.log(JSON.stringify({status:'isolated_registered_entry_and_committed_source_verified',sourceCommit:git(['rev-parse','HEAD^']),wrapperCommit:git(['rev-parse','HEAD']),encoderInvocations:0}));
