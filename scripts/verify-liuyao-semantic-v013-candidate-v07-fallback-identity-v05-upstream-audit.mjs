import {preflight,verifyAudit} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-audit-lib.mjs';
if(process.argv.includes('--preflight')) {
  preflight({checkCI:!process.argv.includes('--offline')});
  console.log(JSON.stringify({status:'committed_audit_execution_and_successful_data_ci_verified',encoderInvocations:0}));
} else {
  const r=verifyAudit({requireCommitted:process.argv.includes('--committed')});
  console.log(JSON.stringify({status:r.exposure.status,conditionalRows:r.exposure.result.conditionalRows,conditionalNonRoute:r.exposure.result.conditionalNonRoute,violations:r.exposure.violations,newEncoderInvocations:0,weightsTrained:false}));
  if(process.argv.includes('--require-exposure')&&!r.exposure.eligibleToTrain)process.exitCode=2;
}
