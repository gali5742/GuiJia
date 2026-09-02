import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json');
const calibrationPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json');
const schemaV02Path = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.2.json';
const training = JSON.parse(fs.readFileSync(trainingPath, 'utf8'));
const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'));
for (const corpus of [training, calibration]) {
  if (corpus.sealed !== false) throw new Error('Fallback v0.2 corpus is not editable preseal data');
  if (corpus.policy?.encoderScoringObserved !== false) throw new Error('Fallback v0.2 encoder scoring already observed');
  corpus.schema = schemaV02Path;
}

const textCorrections = [
  {
    corpus:'calibration',
    id:'V04-FI-C-066',
    from:'项目结束后的奖励金会不会有我的份',
    to:'这次项目收尾以后，公司另外那份奖励最后会不会发到我这里',
    reason:'remove_train_calibration_near_duplicate_before_any_encoder_scoring'
  }
];
for (const correction of textCorrections) {
  const corpus = correction.corpus === 'training' ? training : calibration;
  const row = corpus.rows.find((item) => item.id === correction.id);
  if (!row) throw new Error(`missing preseal correction row ${correction.id}`);
  if (row.text === correction.to) continue;
  if (row.text !== correction.from) throw new Error(`unexpected text for ${correction.id}: ${row.text}`);
  row.text = correction.to;
}

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window=context; context.globalThis=context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
if (!extractor?.extract || !arbitration?.arbitrate) throw new Error('failed to load deterministic path modules');

const classify = (row) => {
  const evidence = extractor.extract(row.text);
  if ((evidence.unsupportedTargets || []).length) return { kind:'unsupported', evidence, arbitration:null };
  const arb = arbitration.arbitrate(row.text, evidence);
  return { kind:arb ? 'upstream_arbitration' : 'fallback_candidate', evidence, arbitration:arb };
};
const annotate = (row) => {
  if (row.identityLabel !== 'route_identity_positive') return;
  const result = classify(row);
  if (result.kind === 'unsupported') throw new Error(`known row became unsupported before seal: ${row.id}/${row.text}`);
  row.deterministicPath = result.kind;
  row.arbitrationRoute = result.arbitration?.routeId ?? null;
  row.arbitrationStrength = result.arbitration?.strength ?? null;
  row.subtype = result.kind === 'fallback_candidate' ? 'fallback_style_known' : 'upstream_resolved_known';
};
for (const row of training.rows) annotate(row);
for (const row of calibration.rows) annotate(row);

const fallbackAnchors = {
  financial_fortune:{train:'往后这阵子我的日子能不能过得松快些',calibration:'接下来一段我的日子会不会比现在宽松些'},
  business_operation:{train:'我手里这个铺面后面还能不能一直撑着',calibration:'这处铺面往后还能不能继续做下去'},
  commercial_transaction:{train:'和对方眼前这桩事情最后能不能谈拢',calibration:'我跟那边正在说的这回事最后能不能定下来'},
  inventory_purchase:{train:'铺子后面缺的那些东西能不能慢慢备妥',calibration:'后屋接下来少的那些东西能不能及时添齐'},
  inventory_sale:{train:'后屋压着的那些东西往后能不能慢慢腾出去',calibration:'角落里剩着的那批东西后面能不能逐渐走掉'},
  borrow_money:{train:'眼下这个缺口能不能有人先帮我补上',calibration:'最近差的这一截有没有人能先替我顶过去'},
  lend_money:{train:'熟人这阵手里紧，我先拿一笔给他顶着妥不妥',calibration:'对方最近周转不开，我先给他垫一阵好不好'},
  debt_collection:{train:'早前放在别人那边的那笔钱以后还能不能回我这里',calibration:'之前留在对方手里的那一笔最后还能不能回来'},
  debt_repayment:{train:'压在我身上的那笔账以后能不能彻底了结',calibration:'我这边一直挂着的那笔账今年能不能收尾'},
  partnership:{train:'我跟这个人两边一起把这门事做下去以后稳不稳',calibration:'我和他两个人把这摊事并在一起做，后面行不行'},
  investment_profit:{train:'我放进去的那笔钱过一阵能不能多出来一些',calibration:'这笔已经放进去的钱以后会不会给我多带回来一些'},
  investment_liquidation:{train:'手里这一份现在全部退出来能不能顺当',calibration:'我想把手上这一份整个收回来，后面会不会卡'},
  investment_suitability:{train:'眼下把钱放进这个里面对我来说合不合宜',calibration:'这个东西我现在进去，对我是不是妥当'},
  investment_position_decision:{train:'手里这一份后面是多留些还是少留些',calibration:'现在这份东西我是继续多拿一点还是收一点回来'},
  investment_price_trend:{train:'手上这个东西过阵子会抬高还是压低',calibration:'这一份后面一阵会往高处还是低处走'},
  income_salary:{train:'公司每个月固定给我的那一份以后会不会多些',calibration:'往后每月公司固定给我的那部分能不能增加'},
  income_bonus:{train:'年底公司另外给的那一份今年还有没有',calibration:'这次事情做完以后公司多给的那一份会不会落到我这里'},
  receive_item:{train:'我定的书柜大概哪天来',calibration:'前几天定的床垫还要多久才会来'},
  item_purchase:{train:'这把办公椅眼下收不收',calibration:'这个咖啡磨现在拿不拿'},
  relationship_development:{train:'我和这个人之后能不能真正走到一起',calibration:'我跟她往后有没有机会变得更近一步'},
  marriage_match:{train:'我和对象以后有没有机会成为一家人',calibration:'我们两个最后能不能把日子正式过到一块'},
  marital_relationship:{train:'家里两个人已经一起过了很多年，往后相处能不能缓下来',calibration:'我们两个人共同生活很久了，接下来关系会不会和顺些'}
};

const routeIds = Object.keys(fallbackAnchors);
const ensureRouteCoverage = (corpus, split) => {
  const corrections=[];
  for (const routeId of routeIds) {
    const routeRows = corpus.rows.filter((row) => row.identityLabel === 'route_identity_positive' && row.expectedRoute === routeId);
    if (!routeRows.length) throw new Error(`no known rows for ${split}/${routeId}`);
    if (routeRows.some((row) => row.deterministicPath === 'fallback_candidate')) continue;
    const row = routeRows[0];
    const previous = row.text;
    row.text = fallbackAnchors[routeId][split];
    annotate(row);
    if (row.deterministicPath !== 'fallback_candidate') {
      throw new Error(`fallback anchor still resolves upstream: ${split}/${routeId}/${row.text}/${row.arbitrationRoute}`);
    }
    corrections.push({ id:row.id, routeId, reason:'ensure_one_fallback_style_known_per_route_before_any_encoder_scoring', from:previous, to:row.text });
  }
  return corrections;
};
const coverageCorrections = [
  ...ensureRouteCoverage(training,'train'),
  ...ensureRouteCoverage(calibration,'calibration')
];

// Re-annotate after route coverage corrections.
for (const row of training.rows) annotate(row);
for (const row of calibration.rows) annotate(row);
const fallbackCount = (rows) => rows.filter((row) => row.identityLabel === 'route_identity_positive' && row.deterministicPath === 'fallback_candidate').length;
const trainingFallback = fallbackCount(training.rows);
const calibrationFallback = fallbackCount(calibration.rows);
if (trainingFallback < 44) throw new Error(`training fallback-style known ${trainingFallback} < 44`);
if (calibrationFallback < 22) throw new Error(`calibration fallback-style known ${calibrationFallback} < 22`);

const correctionSummary = [
  ...textCorrections.map(({corpus,id,reason}) => ({corpus,id,reason})),
  ...coverageCorrections.map(({id,routeId,reason}) => ({id,routeId,reason}))
];
training.presealCorrections = correctionSummary.filter((item) => item.corpus !== 'calibration');
calibration.presealCorrections = correctionSummary.filter((item) => item.corpus !== 'training');
training.presealPathSummary = { fallbackStyleKnown:trainingFallback, upstreamResolvedKnown:132-trainingFallback };
calibration.presealPathSummary = { fallbackStyleKnown:calibrationFallback, upstreamResolvedKnown:88-calibrationFallback };
training.schemaRevisionReason = 'v0.2 refines overly strict v0.1 all-known-Arbitration-null requirement after deterministic preseal failure; no encoder scoring observed';
calibration.schemaRevisionReason = training.schemaRevisionReason;

fs.writeFileSync(trainingPath, `${JSON.stringify(training, null, 2)}\n`, 'utf8');
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
console.log('Candidate v0.4 Fallback Identity v0.2 deterministic preseal corrections/path annotations applied.');
console.log(`- training fallback-style known: ${trainingFallback}/132`);
console.log(`- calibration fallback-style known: ${calibrationFallback}/88`);
console.log(`- route coverage corrections: ${coverageCorrections.length}; label changes: 0; encoder scoring: 0`);
