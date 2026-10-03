import { verify, sealCorpus, write, makeLock, exists } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const {c,corpora,report} = verify();
if (exists(c.outputPolicy.dataLockPath)) {
  verify({requireSeal:true});
  console.log('Existing Route Sufficiency seal verified; no files rewritten.');
} else {
  for (const split of ['training','calibration']) {
    corpora[split] = sealCorpus(corpora[split]);
    write(c.outputPolicy[`${split}Path`],corpora[split]);
  }
  write(c.outputPolicy.contaminationAuditPath,report);
  write(c.outputPolicy.dataLockPath,makeLock(c,corpora,report));
  verify({requireSeal:true});
  console.log('Route Sufficiency membership sealed deterministically; encoder calls: 0.');
}
