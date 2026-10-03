import { verify } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const {corpora,report} = verify({requireSeal:process.argv.includes('--require-seal')});
console.log(JSON.stringify({status:'pass',sealed:corpora.training.sealed,counts:report.counts,duplicateAudit:report.duplicateAudit,independentEvaluationRead:false,sealedBlindEvaluationRead:false,encoderScoringOccurred:false},null,2));
