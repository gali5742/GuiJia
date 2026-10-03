import { contract, generate, sealCorpus, equal, exists, json, write, assert } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const c = contract(), corpora = generate(c);
// An existing seal is immutable. Regeneration checks equality and never destroys it.
for (const split of ['training','calibration']) {
  const destination = c.outputPolicy[`${split}Path`];
  if (exists(destination)) {
    const current = json(destination);
    assert(equal(current, current.sealed ? sealCorpus(corpora[split]) : corpora[split]), `Refusing to replace divergent corpus: ${split}`);
  } else {
    assert(!exists(c.outputPolicy.dataLockPath), 'Refusing partial sealed corpus regeneration');
    write(destination,corpora[split]);
  }
}
console.log('Fresh Route Sufficiency literal corpora prepared/checked; encoder calls: 0.');
console.log('- training 132 (66 sufficient / 66 insufficient); calibration 88 (44 / 44)');
