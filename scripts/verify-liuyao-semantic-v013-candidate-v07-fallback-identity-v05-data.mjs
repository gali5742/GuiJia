import {verify} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
const {a}=verify({requireSeal:process.argv.includes('--require-seal'),requireCommitted:process.argv.includes('--committed-inputs')});
console.log(JSON.stringify({status:a.status,counts:a.counts,duplicateAudit:a.duplicateAudit,encoderInvocations:0,independentEvaluationRead:false,sealedBlindEvaluationRead:false}));
