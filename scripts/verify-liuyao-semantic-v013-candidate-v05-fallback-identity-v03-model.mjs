import {preflight,verifyReachability,verifyWeights,verifyCalibration} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-execution-lib.mjs';
if(process.argv.includes('--preflight')){preflight();console.log('Committed seal and successful data CI proven; no encoder invoked.');}
else if(process.argv.includes('--reachability')){const {r}=verifyReachability();console.log(JSON.stringify(r.summary));}
else if(process.argv.includes('--weights')){verifyWeights();console.log('All22 weights lock verified; no encoder invoked.');}
else {const r=verifyCalibration();console.log(JSON.stringify({status:r.status,threshold:r.result.selectedThreshold,metrics:r.result.selectedMetrics}));}
