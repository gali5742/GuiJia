import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.5-calibration.json');
const patchFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.5-calibration-preseal-patch.json');
const calibration = JSON.parse(fs.readFileSync(calibrationFile, 'utf8'));
if (calibration.status !== 'presealed_fresh_scope_calibration' || calibration.sealed !== false) throw new Error('Candidate v0.7 Scope calibration must be presealed before wording patch');

const changes = [
  ['SC5-039','我和这个女生以后能不能正式谈恋爱','我跟这个女生以后有没有机会正式谈恋爱','remove prior exact overlap while preserving strong romantic-development outcome'],
  ['SC5-056','自己做的生意最近亏损和回升反复，我想占一下','我自己这门生意近来亏损又回升，想单独占一下经营面','remove prior exact overlap while preserving business support anchors'],
  ['SC5-060','公司的这项业务近来业绩波动，我想看看本身','公司手上的这块业务最近业绩起落，我想单独看看经营状况','remove prior exact overlap while preserving business support anchors'],
  ['SC5-062','这笔投资近来利润变化很大，我想看看收益这块','这项投资近来的利润上下变化明显，我想单独看看收益方面','remove prior exact overlap while preserving investment-profit support anchors'],
  ['SC5-064','这个投资项目目前收益忽高忽低，我想占这一项','这个投资项目最近收益一阵高一阵低，我想单独占一下','remove prior exact overlap while preserving investment-profit support anchors'],
  ['SC5-067','这份投资最近回本情况不稳定，我想单独占一下','手上这份投资近来回本情况来回变化，我想单独看看','remove prior exact overlap while preserving investment-profit support anchors'],
  ['SC5-070','这笔投资正在安排全部变现，我想单独占这件事','这笔投资已经在安排全部套现，我想单独看看这个动作','remove prior exact overlap while preserving liquidation support anchors'],
  ['SC5-071','这个项目已经决定退出投资，我想问问这个动作','这个投资项目已经决定退出投资，我想单独占一下这一步','remove prior exact overlap while preserving liquidation support anchors'],
  ['SC5-073','这份持仓准备清掉仓位，我想单独占一下','手里的这份持仓准备清掉全部仓位，我想看看这个动作','remove prior exact overlap while preserving liquidation support anchors'],
  ['SC5-074','我已经决定把这笔期货平仓，想问这个步骤','这笔期货我已经决定全部平仓，想单独占一下这个动作','remove prior exact overlap while preserving liquidation support anchors'],
  ['SC5-078','目前这只股票的持仓正在考虑加仓，我想单独占这一步','这只股票的持仓我正在考虑继续加仓，想单独占一下这一步','remove prior exact overlap while preserving position support anchors'],
  ['SC5-079','我对这份基金的仓位调整一直拿不定主意','我一直拿不定这只基金的仓位要怎么调整，想单独占一下','remove prior exact overlap while preserving position support anchors'],
  ['SC5-080','这只股票继续拿还是减仓这件事我想看看','这只股票我是继续拿还是先减仓，一直想单独看看','remove prior exact overlap while preserving position support anchors'],
  ['SC5-081','当前债券基金持仓要不要调整，我一直在考虑','手里的债券基金持仓现在要不要调整，我想单独占一下','remove prior exact overlap while preserving position support anchors'],
  ['SC5-085','我关注的混合基金最近净值起伏明显，想单独看看','我关注的这只混合基金近来净值上下起伏，想单独占一下涨跌','remove prior exact overlap while preserving trend support anchors'],
  ['SC5-087','这个投资标的近来的涨跌变化不少，我想占这一项','这个投资标的最近涨跌来回变化，我想单独看看走势这块','remove prior exact overlap while preserving trend support anchors'],
  ['SC5-088','这只短债基金最近净值变化频繁，我想看看','这只短债基金近来净值频繁波动，我想单独占一下','remove prior exact overlap while preserving trend support anchors'],
  ['SC5-091','我手上这个小买卖以后还能不能继续做下去','我手上这一摊以后还能不能继续撑下去','remove frozen business-support lexical anchor while preserving the intended business_operation pure-fallback semantic label'],
  ['SC5-141','论文答辩能不能顺利通过','这次毕业论文答辩我能不能顺利通过','remove prior blind-eval exact overlap while preserving outside-current22 exam outcome'],
  ['SC5-164','接下来会不会顺利一点','接下来这段时间会不会比现在顺一点','remove prior exact overlap while preserving unresolved generic outcome'],
  ['SC5-165','我现在这样做到底好不好','我眼下这样继续做到底好不好','remove prior exact overlap while preserving unresolved generic decision']
].map(([id,from,to,reason]) => ({ id, from, to, reason }));

for (const change of changes) {
  const row = calibration.rows.find((item) => item.id === change.id);
  if (!row) throw new Error(`missing calibration row ${change.id}`);
  if (row.text !== change.from) throw new Error(`preseal patch source drift for ${change.id}: ${row.text}`);
  row.text = change.to;
}
fs.writeFileSync(calibrationFile, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
const patch = {
  version:'0.13-scope-finalization-v0.5-calibration-preseal-patch-v0.1',
  status:'recorded_before_seal_and_before_scope_scoring',
  candidate:'v0.7',
  modelOrThresholdScoredBeforePatch:false,
  semanticRuntimeModified:false,
  questionModeModified:false,
  verifierWeakened:false,
  changeReasonClass:'fixture_path_and_freshness_wording_only',
  changes
};
fs.writeFileSync(patchFile, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
console.log(`Applied ${changes.length} Candidate v0.7 Scope pre-seal wording patch(es).`);
