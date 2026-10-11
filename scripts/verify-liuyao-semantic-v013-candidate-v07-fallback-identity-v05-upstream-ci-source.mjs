import {read,json,binding,assert} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
import {executionPath,git,committed} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-audit-lib.mjs';
const e=json(executionPath);committed(executionPath);
assert(process.argv.includes('--ci-bootstrap'),'Isolated CI source proof required');
assert(git(['diff','--name-only','HEAD^','HEAD'])===e.isolatedEntryPath,'CI wrapper changed non-entry files');
const workflow=read(e.workflowPath).toString('utf8'),start=workflow.indexOf('\non:\n'),end=workflow.indexOf('\npermissions:',start);
assert(start>0&&end>start,'Workflow structure drift');
assert(read(e.isolatedEntryPath).toString('utf8')===workflow.slice(0,start)+'\non:\n  workflow_dispatch:\n'+workflow.slice(end),'CI wrapper differs from frozen audit workflow');
for(const b of e.bindings){assert(binding(b.path).gitBlobSha===b.gitBlobSha&&binding(b.path).sha256===b.sha256,'CI source binding drift');committed(b.path);assert(git(['rev-parse',`HEAD^:${b.path}`])===b.gitBlobSha,'CI source differs from frozen parent');}
assert(git(['rev-parse',`HEAD^:${executionPath}`])===binding(executionPath).gitBlobSha,'Execution contract missing from committed source');
console.log(JSON.stringify({status:'isolated_audit_ci_entry_and_committed_source_verified',sourceCommit:git(['rev-parse','HEAD^']),wrapperCommit:git(['rev-parse','HEAD']),encoderInvocations:0}));
