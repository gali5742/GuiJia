import {execFileSync} from 'node:child_process';
import {json,read,binding,equal,assert,root} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const c=json('data/liuyao-semantic-v013-candidate-v07-policy-verification-contract-v0.2.json');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
assert(c.encoderInvocations===0&&!c.semanticPolicyChange&&!c.dataOrMembershipChange,'Verification-only contract required');
for(const b of c.bindings)assert(equal(binding(b.path),b),`CI verification binding drift: ${b.path}`);
git(['merge-base','--is-ancestor',c.designSourceCommit,'HEAD']);
if(process.argv.includes('--ci-checkout')) {
  // Bootstrap ref uses the existing registered workflow entry, with all source
  // and frozen semantic artifacts identical to its development-branch parent.
  assert(git(['diff','--name-only','HEAD^','HEAD'])===c.isolatedEntryPath,'CI branch must change only the workflow entry');
  const s=read(c.correctedWorkflowPath).toString('utf8'),start=s.indexOf('\non:\n'),end=s.indexOf('\npermissions:',start);
  assert(start>0&&end>start,'Workflow event structure invalid');
  const wrapper=s.slice(0,start)+'\non:\n  workflow_dispatch:\n'+s.slice(end);
  assert(read(c.isolatedEntryPath).toString('utf8')===wrapper,'CI entry must exactly derive from the corrected dedicated workflow');
  for(const b of c.bindings)assert(git(['rev-parse',`HEAD^:${b.path}`])===b.gitBlobSha,'Policy or verification source differs from the input commit');
}
console.log(JSON.stringify({status:'verification_only_bindings_and_ci_entry_proven',isolatedEntryChecked:process.argv.includes('--ci-checkout'),encoderInvocations:0,semanticPolicyChange:false}));
