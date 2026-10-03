import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const contractPath = 'data/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-contract-v0.1.json';
export const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs';
export const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs';
export const libraryPath = 'scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
export const sealerPath = 'scripts/seal-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs';
export const read = p => fs.readFileSync(path.join(root, p));
export const json = p => JSON.parse(read(p).toString('utf8'));
export const serialize = value => `${JSON.stringify(value, null, 2)}\n`;
export const exists = p => fs.existsSync(path.join(root, p));
export const assert = (ok, message) => { if (!ok) throw new Error(message); };
export const hashBytes = b => crypto.createHash('sha256').update(b).digest('hex');
export const binding = p => {
  const bytes = read(p);
  return { path:p, sha256:hashBytes(bytes), gitBlobSha:crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex') };
};
export const write = (p, value) => fs.writeFileSync(path.join(root, p), serialize(value), 'utf8');
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const normalize = text => String(text).normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
const grams = text => {
  const chars = Array.from(normalize(text));
  return new Set(chars.length < 3 ? [chars.join('')] : chars.slice(0, -2).map((_, i) => chars.slice(i, i + 3).join('')));
};
const similarity = (a, b) => {
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection++;
  return intersection / (a.size + b.size - intersection || 1);
};
export function contract() {
  const c = json(contractPath);
  assert(c.status === 'frozen_before_data_generation_and_first_v05_encoder_scoring', 'Contract must precede generation/scoring');
  for (const key of ['designBinding','designLockBinding','boundaryBinding','routeInventoryBinding','authoringBinding','encoderExecution','correctedFrozenDependenciesBinding','algorithm']) {
    const expected = c[key];
    const actual = binding(expected.path);
    assert(actual.sha256 === expected.sha256 && actual.gitBlobSha === expected.gitBlobSha, `Frozen binding drift: ${key}`);
  }
  assert(c.designBinding.gitBlobSha === '77ed639b92a152783f589d7697dc54eec283e4d0', 'v0.5 design changed');
  assert(c.boundaryBinding.gitBlobSha === 'a9b21fcd76a69577f3cf6f14ba4c871cbe762f87', 'Sufficiency boundary changed');
  const inventory = json(c.routeInventoryBinding.path);
  assert(inventory.routeCount === 22 && inventory.routes.length === 22, 'Inventory drift');
  assert(equal(c.coverageMatrix.map(x => x.routeId).sort(), inventory.routes.map(x => x.routeId).sort()), 'Coverage inventory drift');
  assert(equal(c.labels, ['route_semantics_sufficient','route_semantics_insufficient']), 'Binary labels drift');
  assert(equal(c.rowSchema.modelInputFields, ['text']) && equal(c.rowSchema.modelTargetFields, ['label']), 'Only text/label may train');
  assert(c.algorithm.type === 'single_binary_logistic_head' && c.algorithm.trainFromScratch && !c.algorithm.legacyWeightsReusable, 'Head contract drift');
  assert(equal(c.algorithm.hyperparameters, {epochs:360, learningRate:0.42, l2:0.0015}), 'Hyperparameter drift');
  const e = c.encoderExecution;
  assert(e.modelId === 'Xenova/bge-small-zh-v1.5' && e.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781' && e.transformersJsVersion === '4.2.0', 'Encoder identity drift');
  assert(e.vectorSize === 512 && e.canonicalTextsPerEncoderCall === 1 && e.multiTextFeatureExtractionBatchForbidden && !e.encoderRetraining, 'Encoder execution drift');
  const calibration = c.calibrationBoundary;
  assert(calibration.maximumInsufficientFalsePass === 0.05 && calibration.minimumSufficientRetention === 0.90, 'Predeclared feasibility gate drift');
  assert(calibration.oneGlobalThresholdOnly && !calibration.routeSpecificOrFamilyThresholdsAllowed && !calibration.calibrationMayTrainWeights && calibration.weightsLockedAndCommittedBeforeCalibrationScoring, 'Calibration boundary drift');
  for (const key of ['independentEvaluationRead','sealedBlindEvaluationRead','v05EncoderScoringBeforeContract','candidateV04FailureWordingUsedForGeneration','traditionalFeaturesUsed']) assert(c.governance[key] === false, `Governance drift: ${key}`);
  assert(c.sealPolicy.encoderScoringBeforeSeal === false && c.sealPolicy.trainingAndCalibrationTogether && c.sealPolicy.deterministic, 'Seal policy drift');
  return c;
}

export function generate(c) {
  const source = json(c.authoringBinding.path);
  assert(source.generation === 'literal_pairs_only_no_template_expansion_no_model_feedback', 'Literal authoring required');
  assert(source.groups.length === 22, 'Authoring route count drift');
  const result = {};
  for (const split of ['training','calibration']) {
    const rows = [];
    for (let routeIndex = 0; routeIndex < source.groups.length; routeIndex++) {
      const group = source.groups[routeIndex];
      const coverage = c.coverageMatrix[routeIndex];
      assert(group.routeId === coverage.routeId && group.domainFamily === coverage.domainFamily && group.missingDimension === coverage.missingDimension && group.pairs.length === 5, 'Authoring coverage drift');
      for (const pairIndex of split === 'training' ? [0,1,2] : [3,4]) {
        const pair = group.pairs[pairIndex];
        assert(pair.length === 2, 'Each literal pair requires both labels');
        const contrastGroup = `V013-V05-RS-${split === 'training' ? 'T' : 'C'}-${String(routeIndex + 1).padStart(2,'0')}-${pairIndex + 1}`;
        for (let labelIndex = 0; labelIndex < 2; labelIndex++) {
          rows.push({
            id:`${contrastGroup}-${labelIndex ? 'I' : 'S'}`,
            text:pair[labelIndex], label:c.labels[labelIndex], split,
            domainFamily:group.domainFamily, contrastGroup,
            style:labelIndex ? (['credit_direction','debt_direction'].includes(group.domainFamily) ? 'role_direction_ambiguity' : 'generic_domain_or_missing_dimension') : ['strong','support','fallback','support','fallback'][pairIndex],
            routeCoverage:[group.routeId],
            missingDimension:labelIndex ? group.missingDimension : null,
            provenance:source.provenance
          });
        }
      }
    }
    result[split] = {
      version:`0.13-candidate-v0.5-route-sufficiency-${split}-v0.1`,
      status:`presealed_${split}_data`, sealed:false,
      contractPath, contractSha256:binding(contractPath).sha256,
      policy:{ fresh:true, literalAuthoring:true, encoderScoringPerformed:false, independentEvaluationRead:false, sealedBlindEvaluationRead:false, candidateV04FailureWordingUsedForGeneration:false, useForWeightTraining:split === 'training', useForThresholdSelection:split === 'calibration' },
      rows
    };
  }
  return result;
}
export const sealCorpus = corpus => ({ ...corpus, status:`sealed_${corpus.rows[0].split}_data`, sealed:true, sealedBeforeFirstEncoderScoring:true });

export function audit(c, corpora) {
  const rows = [...corpora.training.rows, ...corpora.calibration.rows];
  const ids = new Set(), texts = new Set(), contrast = new Map();
  const counts = {};
  for (const split of ['training','calibration']) {
    const dataset = corpora[split];
    assert(dataset.rows.length === c.splitPolicy[split].rows, `Row count drift: ${split}`);
    counts[split] = { rows:dataset.rows.length, labels:{}, styles:{}, coverage:{} };
    for (const row of dataset.rows) {
      for (const key of c.rowSchema.required) assert(Object.hasOwn(row,key), `Missing ${key} on ${row.id}`);
      assert(row.split === split && c.labels.includes(row.label) && normalize(row.text).length >= 8, `Invalid row: ${row.id}`);
      assert(!ids.has(row.id) && !texts.has(normalize(row.text)), `Duplicate row/id: ${row.id}`);
      ids.add(row.id); texts.add(normalize(row.text));
      assert(!/(六亲|世爻|应爻|用神|官鬼|妻财|父母爻|兄弟爻|子孙爻|TR\/MR)/.test(row.text), `Traditional terminology: ${row.id}`);
      assert(row.routeCoverage.length === 1 && c.coverageMatrix.some(x => x.routeId === row.routeCoverage[0] && x.domainFamily === row.domainFamily), `Unknown coverage: ${row.id}`);
      counts[split].labels[row.label] = (counts[split].labels[row.label] || 0) + 1;
      counts[split].styles[row.style] = (counts[split].styles[row.style] || 0) + 1;
      const coverage = counts[split].coverage[row.routeCoverage[0]] ||= {};
      coverage[row.label] = (coverage[row.label] || 0) + 1;
      const pair = contrast.get(row.contrastGroup) || new Set(); pair.add(row.label); contrast.set(row.contrastGroup, pair);
    }
    for (const label of c.labels) assert(counts[split].labels[label] === c.splitPolicy[split].perLabel, `Label distribution drift: ${split}`);
    for (const [style,n] of Object.entries(c.splitPolicy[split].positiveStyles)) assert(counts[split].styles[style] === n, `Positive style drift: ${split}/${style}`);
    for (const route of c.coverageMatrix) for (const [label,n] of [[c.labels[0],route[split].sufficient],[c.labels[1],route[split].insufficient]]) assert(counts[split].coverage[route.routeId]?.[label] === n, `Missing coverage: ${split}/${route.routeId}/${label}`);
  }
  assert(contrast.size === 110 && [...contrast.values()].every(x => x.size === 2), 'Missing contrast label');
  const representation = rows.map(row => ({ id:row.id, normalized:normalize(row.text), grams:grams(row.text), split:row.split }));
  let crossSplitMaximum = 0, crossSplitPairs = 0;
  for (const a of representation.filter(x => x.split === 'training')) for (const b of representation.filter(x => x.split === 'calibration')) {
    const score = similarity(a.grams,b.grams); crossSplitMaximum = Math.max(crossSplitMaximum,score); crossSplitPairs++;
    assert(score < c.duplicatePolicy.maximumCrossSplitSimilarityExclusive, `Cross-split near-copy: ${a.id}/${b.id}, similarity=${score}`);
  }
  // Only these explicitly bound sources are opened. No independent/blind/reserved research contents are read.
  const blocked = new RegExp(c.contaminationPolicy.noReadNamePattern,'i');
  const histories = [...c.contaminationPolicy.historyAuditOnly, c.contaminationPolicy.candidateV04DevelopmentAuditOnly];
  const historyBindings = [];
  let historicalMaximum = 0, historicalComparisons = 0;
  function strings(value, out = []) {
    if (typeof value === 'string' && /[\u3400-\u9fff]/.test(value) && normalize(value).length >= 8 && normalize(value).length <= 200) out.push(value);
    else if (Array.isArray(value)) value.forEach(x => strings(x,out));
    else if (value && typeof value === 'object') for (const [key,item] of Object.entries(value)) if (!/validation|independent|blind|evaluation/i.test(key)) strings(item,out);
    return out;
  }
  for (const source of histories) {
    assert(!blocked.test(path.basename(source.path)), 'Protected source must not be opened');
    const actual = binding(source.path);
    assert(actual.sha256 === source.sha256 && actual.gitBlobSha === source.gitBlobSha, 'Contamination-source binding drift');
    const historical = [...new Set(strings(json(source.path)).map(normalize))].map(text => ({text, grams:grams(text)}));
    historyBindings.push({...actual, auditStrings:historical.length, mode:source.allowedUse || 'automated lexical audit only; never model input'});
    for (const a of representation) for (const b of historical) {
      assert(a.normalized !== b.text, `Historical exact overlap: ${a.id}; source=${source.path}`);
      const score = similarity(a.grams,b.grams); historicalMaximum = Math.max(historicalMaximum,score); historicalComparisons++;
      // Do not reveal historical wording in failures, reports or terminal output.
      assert(score < c.duplicatePolicy.maximumHistoricalSimilarityExclusive, `Historical near-copy: ${a.id}; source=${source.path}; similarity=${score}`);
    }
  }
  return {
    version:'0.13-candidate-v0.5-route-sufficiency-contamination-audit-v0.1', status:'pass_encoder_free_data_audit',
    contractBinding:binding(contractPath), counts,
    contrastPairs:contrast.size,
    duplicateAudit:{ exactDuplicates:0, crossSplitNearDuplicates:0, historicalExactOverlap:0, historicalNearOverlap:0, crossSplitMaximum, historicalMaximum, crossSplitPairs, historicalComparisons },
    historyBindings,
    protectedIsolation:{ method:'explicit source allowlist plus forbidden-name rejection; independent/blind/reserved research excluded without content read', independentEvaluationRead:false, sealedBlindEvaluationRead:false, candidateV04FailureWordingUsedForGeneration:false, candidateV04DevelopmentRead:'automated audit only; no wording exposed or used as source' },
    encoderScoringOccurred:false,
    semanticParaphraseLimit:c.duplicatePolicy.limits
  };
}

export function makeLock(c, corpora, report) {
  return {
    version:'0.13-candidate-v0.5-route-sufficiency-data-lock-v0.1', status:'locked_before_first_v05_encoder_scoring',
    bindings:[contractPath, c.authoringBinding.path, c.outputPolicy.trainingPath, c.outputPolicy.calibrationPath, c.outputPolicy.contaminationAuditPath, generatorPath, verifierPath, libraryPath, sealerPath, c.algorithm.path].map(binding),
    counts:report.counts, duplicateAudit:report.duplicateAudit,
    membership:Object.fromEntries(['training','calibration'].map(split => [split,corpora[split].rows.map(row => ({id:row.id,label:row.label,domainFamily:row.domainFamily,routeCoverage:row.routeCoverage,style:row.style,contrastGroup:row.contrastGroup,normalizedTextSha256:hashBytes(normalize(row.text))}))])),
    frozenCalibration:c.calibrationBoundary,
    governance:{v05EncoderScoringBeforeSeal:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV04FailureWordingUsedForGeneration:false,traditionalFeaturesUsed:false},
    nextAction:'require_seal_commit_and_successful_data_ci_before_first_route_sufficiency_training'
  };
}

export function verify({requireSeal = false} = {}) {
  const c = contract(), expected = generate(c);
  const corpora = {training:json(c.outputPolicy.trainingPath), calibration:json(c.outputPolicy.calibrationPath)};
  assert(corpora.training.sealed === corpora.calibration.sealed, 'Partial seal forbidden');
  for (const split of ['training','calibration']) assert(equal(corpora[split], corpora[split].sealed ? sealCorpus(expected[split]) : expected[split]), `Literal corpus drift: ${split}`);
  const report = audit(c,corpora);
  if (requireSeal || corpora.training.sealed || exists(c.outputPolicy.dataLockPath)) {
    assert(corpora.training.sealed && corpora.calibration.sealed, 'Sealed membership required');
    assert(equal(json(c.outputPolicy.contaminationAuditPath),report), 'Audit artifact drift');
    assert(equal(json(c.outputPolicy.dataLockPath),makeLock(c,corpora,report)), 'Seal drift');
  }
  return {c,corpora,report};
}
