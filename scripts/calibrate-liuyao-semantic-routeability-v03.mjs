import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => createHash('sha256').update(read(relative)).digest('hex');
const base = readJson('data/liuyao-semantic-routeability-v0.2.json');
const calibration = readJson('data/liuyao-semantic-routeability-v0.3-calibration.json');
const contract = readJson('data/liuyao-semantic-routeability-v0.3-contract.json');
if (base.status !== 'frozen' || base.model?.weights?.length !== 512) throw new Error('frozen Routeability v0.2 model missing');
if (calibration.rows?.length !== 223 || calibration.status !== 'fresh_calibration') throw new Error('fresh v0.3 calibration corpus missing');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js','js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-routeability-v03.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const G = context.GuiJia;
const evidenceExtractor = G.liuyaoSemanticRouteEvidenceV02;
const arbitration = G.liuyaoSemanticRouteArbitrationV012;
const routeability = G.liuyaoSemanticRouteabilityV03;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !routeability?.decide) throw new Error('v0.3 policy modules failed to load');

const dot = (weights, vector) => { let total = 0; for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i]; return total; };
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
env.allowLocalModels = false; env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', base.encoder.modelId, { dtype:base.encoder.dtype, revision:base.encoder.revision });
const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== base.encoder.vectorSize) throw new Error(`embedding size ${hidden} != ${base.encoder.vectorSize}`);
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden); const offset = row * hidden;
    for (let i = 0; i < hidden; i += 1) vector[i] = Number(tensor.data[offset + i]);
    vectors.push(vector);
  }
  return vectors;
};
const vectors = [];
for (let start = 0; start < calibration.rows.length; start += 24) {
  const chunk = calibration.rows.slice(start, start + 24).map((row) => row.text);
  const output = await extractor(chunk, { pooling:base.encoder.pooling, normalize:base.encoder.normalize });
  vectors.push(...tensorToVectors(output, chunk.length));
  console.log(`embedded ${Math.min(start + chunk.length, calibration.rows.length)}/${calibration.rows.length}`);
}
const scored = calibration.rows.map((row, index) => {
  const probability = sigmoid(dot(base.model.weights, vectors[index]) + base.model.bias);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  return { ...row, probability, evidence, arbitration:arb };
});
const known = scored.filter((row) => row.routeabilityLabel === 'route_known');
const nonRoute = scored.filter((row) => row.routeabilityLabel === 'non_route');
const ratio = (n,d) => d ? n/d : 0;
const thresholds = [...new Set(scored.map((row) => row.probability)), 1.0000001].sort((a,b) => a-b);
const evaluate = (threshold) => {
  const decisions = scored.map((row) => ({ row, decision:routeability.decide({ probability:row.probability, threshold, arbitration:row.arbitration, evidence:row.evidence }) }));
  const knownAccepted = decisions.filter(({row,decision}) => row.routeabilityLabel === 'route_known' && decision.disposition === 'route_known').length;
  const nonRouteActivated = decisions.filter(({row,decision}) => row.routeabilityLabel === 'non_route' && decision.disposition === 'route_known').length;
  const subtypes = {};
  for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
    const subset = decisions.filter(({row}) => row.subtype === subtype);
    const activated = subset.filter(({decision}) => decision.disposition === 'route_known').length;
    subtypes[subtype] = { n:subset.length, falseActivation:ratio(activated, subset.length), safety:1-ratio(activated, subset.length) };
  }
  const paths = {};
  for (const pathId of ['support_arbitration','fallback_head']) {
    const subset = decisions.filter(({row}) => row.candidatePath === pathId);
    const accepted = subset.filter(({decision}) => decision.disposition === 'route_known').length;
    paths[pathId] = { n:subset.length, recall:ratio(accepted, subset.length) };
  }
  const falseActivation = ratio(nonRouteActivated, nonRoute.length);
  const maxSubtypeFalseActivation = Math.max(...Object.values(subtypes).map((item) => item.falseActivation));
  return { threshold, knownRecall:ratio(knownAccepted, known.length), falseActivation, nonRouteSafety:1-falseActivation, maxSubtypeFalseActivation, byPath:paths, bySubtype:subtypes };
};
const maxOverall = contract.calibration.maxFalseActivationOverall;
const maxSubtype = contract.calibration.maxFalseActivationPerSubtype;
const eligible = thresholds.map(evaluate).filter((item) => item.falseActivation <= maxOverall + 1e-12 && item.maxSubtypeFalseActivation <= maxSubtype + 1e-12);
if (!eligible.length) throw new Error('No Routeability v0.3 threshold satisfies safety caps');
eligible.sort((a,b) => b.knownRecall - a.knownRecall || a.maxSubtypeFalseActivation - b.maxSubtypeFalseActivation || a.falseActivation - b.falseActivation || b.threshold - a.threshold);
const chosen = eligible[0];
const sourceFiles = [
  'data/liuyao-semantic-routeability-v0.2.json','data/liuyao-semantic-routeability-v0.3-calibration.json','data/liuyao-semantic-routeability-v0.3-contract.json',
  'js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-compatibility-v02.js','js/liuyao-semantic-routeability-v03.js'
];
const artifact = {
  version:'0.3', status:'frozen', scope:'liuyao_semantic_routeability_v03',
  baseModel:{ version:'0.2', path:'data/liuyao-semantic-routeability-v0.2.json', sha256:sha256('data/liuyao-semantic-routeability-v0.2.json'), weightsReusedUnchanged:true },
  encoder:{ ...base.encoder },
  policy:{
    explicitUnsupportedTarget:'non_route',
    modelScoreAtOrAboveThreshold:'route_known',
    belowThresholdConfirmedStrongArbitration:'route_known',
    belowThresholdSupportOrFallback:'non_route',
    maxFalseActivationOverall:maxOverall,
    maxFalseActivationPerSubtype:maxSubtype
  },
  calibration:{ total:scored.length, byLabel:{ route_known:known.length, non_route:nonRoute.length }, threshold:chosen.threshold, knownRecall:chosen.knownRecall, falseActivation:chosen.falseActivation, nonRouteSafety:chosen.nonRouteSafety, maxSubtypeFalseActivation:chosen.maxSubtypeFalseActivation, byPath:chosen.byPath, bySubtype:chosen.bySubtype, objective:contract.calibration.objective },
  sources:sourceFiles.map((relative) => ({ path:relative, sha256:sha256(relative) }))
};
const artifactPath = 'data/liuyao-semantic-routeability-v0.3.json';
fs.writeFileSync(path.join(root, artifactPath), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
const artifactSha = sha256(artifactPath);
const lock = { version:'0.3-lock', status:'locked', artifactPath, artifactSha256:artifactSha, baseModelSha256:artifact.baseModel.sha256, calibrationDataSha256:sha256('data/liuyao-semantic-routeability-v0.3-calibration.json'), threshold:chosen.threshold };
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-routeability-v0.3.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Routeability v0.3 threshold=${chosen.threshold}`);
console.log(`known recall=${chosen.knownRecall}; false activation=${chosen.falseActivation}; max subtype false activation=${chosen.maxSubtypeFalseActivation}`);
console.log(`support recall=${chosen.byPath.support_arbitration.recall}; fallback recall=${chosen.byPath.fallback_head.recall}`);
console.log(`artifact SHA-256=${artifactSha}`);
