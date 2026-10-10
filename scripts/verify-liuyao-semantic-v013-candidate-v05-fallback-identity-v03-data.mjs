import {verify} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
const {a}=verify({requireSeal:process.argv.includes('--require-seal')});
console.log(JSON.stringify({status:a.status,counts:a.counts,duplicateAudit:a.duplicateAudit,phaseBEncoderScoringOccurred:false}));
