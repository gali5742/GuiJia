import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationPath = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.2-calibration.json');
const patchPath = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.2-calibration-preseal-patch.json');
const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'));
if (calibration.status !== 'presealed_fresh_scope_calibration' || calibration.sealed !== false) throw new Error('Scope calibration wording patch is preseal-only');

const replacements = [
  '这笔办公设备采购交易下周五前能不能成交','客户这一单批发订单月底以前能不能签成',
  '门店这批货周六以前能不能全部入库','门店下一轮补货能不能按时到齐',
  '仓库里的这批尾货月底前能不能全部出清','门店这批积压货下周能不能全部卖完',
  '我向哥哥借的这笔周转钱周三前能不能拿到','这次经营贷申请下个月能不能批下来','我找熟人借的一笔钱这周能不能拿到',
  '朋友向我借两万元周转，我这次该不该借给他','亲戚找我借一笔钱，我现在借出去合适吗','我准备借给同事一笔应急款，这样做妥不妥',
  '客户欠我的项目尾款这个月能不能收回','我借给朋友的那笔钱年底前还能不能追回','公司的应收账款这周能不能要回',
  '我的房贷今年年底前能不能还清','这笔信用卡欠款下个月能不能结清','手上的消费贷今年能不能全部还完',
  '我和朋友合伙开店以后能不能稳定做下去','我跟这个人共同经营工作室以后合不合适',
  '这只基金继续持有五个月能不能盈利','这个投资项目到明年能不能有利润',
  '这只基金月底全部赎回能不能顺利完成','手里的股票仓位一次性卖出会不会卡住',
  '这只基金现在适不适合我参与','这个投资项目目前值不值得我投',
  '这只股票接下来两周价格会不会继续上涨','这只基金未来一个月净值会不会走低',
  '明年我的固定工资会不会上调','公司下一轮调薪时我的基本工资能不能增加',
  '今年绩效奖金能不能发下来','这个项目的奖励金月底前能不能到账',
  '我买的显示器周末以前能不能收到','已经寄出的相机明天能不能到手','这个键盘包裹周五前能不能送达',
  '这台投影仪现在该不该买','我现在要不要买这副耳机','这款扫地机器人现在买合不合适',
  '我和这个人以后能不能正式成为恋人','我们之间的暧昧会不会发展成恋爱',
  '我和对象明年有没有机会结婚','我们这门亲事年底以前能不能成',
  '我和妻子这段时间关系紧张，之后能不能缓和','我们夫妻最近总争执，这段婚姻接下来还能不能继续',

  '最近整体财务状况起伏明显，我想单独占一下','这一阵钱财方面变化不少，我想看看这一块','近几个月现金流反复得很，我想问问财务这件事','最近资金流变化明显，我想占一下这一项','今年收支状态不太稳定，我想单独看看','这段时间进账忽多忽少，我想问问钱财方面','最近手头资金松紧变化很大，我想占一下财务这一块','目前钱财方面让我很在意，我想单独看看',
  '我的小店最近经营状况反复，我想单独占一下','工作室这阵子利润起伏很大，我想问经营这块','这家门店最近业绩变化明显，我想看看经营本身','自己做的生意近来亏损和回升反复，我想占一下','这个网店最近经营状况不太稳定，我想问问','餐馆这阵子利润忽高忽低，我想看看这一项','手里的门店最近现金流反复，我想单独占一下','公司业务最近业绩变化很大，我想看看经营面',
  '这只基金最近收益起伏明显，我想占一下','这笔投资近来利润变化很大，我想看看收益这块','我投的基金最近回本情况反复，想单独问一下','这个投资项目目前收益忽高忽低，我想占一下','手里的股票最近有收益波动，我想看看这一项','这份基金近来利润变化让我很在意，想问问','我的投资最近回本情况反复，想单独占这件事',
  '我已经决定把这只基金全部赎回，想占一下这个动作','手里的股票准备一次性卖出，我想看看这一步','这笔投资正在安排全部变现，我想单独占一下','这项投资已经决定全部变现，我想单独占这个动作','手上的ETF计划全部卖出，我想看看这一项','这份基金仓位准备清掉，我想占一下这一步','我已经决定把这个持仓平仓，想问这件事',
  '这只股票我正在考虑继续持有，想占一下','手里的基金准备调整仓位，我想看看这件事','这只ETF我在犹豫要不要减仓，想问一下','目前股票持仓正在考虑加仓，我想单独占这一步','我对这笔基金仓位调整一直拿不定主意','这只股票继续拿还是减仓这件事我想占一下','当前ETF持仓要不要调整，我一直在考虑',
  '这只基金最近净值波动很大，我想单独占一下','手里的股票最近价格变化明显，我想看看这一块','这个ETF近来涨跌反复，我想占一下','我关注的基金最近净值起伏很大，想单独看看','这只个股最近价格波动让我很在意，想问问','这个投资标的近来的涨跌变化明显，我想占一下','这只债券基金最近净值变化频繁，我想看看'
];
if (replacements.length !== 88) throw new Error(`expected 88 path-contract wording replacements, got ${replacements.length}`);

const patchRows = [];
for (let i = 0; i < 88; i += 1) {
  const row = calibration.rows[i];
  if (!row || row.expectedDisposition !== 'route_known') throw new Error(`unexpected row at ${i}`);
  patchRows.push({ id:row.id, before:row.text, after:replacements[i], expectedCandidatePath:row.expectedCandidatePath, expectedRoute:row.expectedRoute });
  row.text = replacements[i];
}

const fallbackCorrection = calibration.rows.find((row) => row.id === 'SC2-089');
if (!fallbackCorrection || fallbackCorrection.expectedCandidatePath !== 'pure_fallback' || fallbackCorrection.expectedRoute !== 'financial_fortune') {
  throw new Error('SC2-089 pure-fallback fixture contract drift');
}
const fallbackReplacement = '明年我在钱这方面会不会比今年轻松些';
patchRows.push({
  id:fallbackCorrection.id,
  before:fallbackCorrection.text,
  after:fallbackReplacement,
  expectedCandidatePath:fallbackCorrection.expectedCandidatePath,
  expectedRoute:fallbackCorrection.expectedRoute
});
fallbackCorrection.text = fallbackReplacement;

calibration.presealWordingPatch = {
  applied:true,
  reason:'Preseal verifier found wording that did not reliably realize the declared frozen Evidence/Arbitration path. Corrections change fixture wording only; no semantic rule, model, threshold, label, route, count or scope objective changed.',
  patchPath:'data/liuyao-semantic-scope-finalization-v0.2-calibration-preseal-patch.json',
  correctedRows:patchRows.length
};
const patch = {
  version:'0.13-scope-finalization-v0.2-calibration-preseal-patch-v0.1',
  status:'recorded_before_seal_and_before_scope_scoring',
  scope:'fixture_wording_only',
  semanticRulesChanged:false,
  modelOrThresholdScoredBeforePatch:false,
  labelsOrRoutesChanged:false,
  rows:patchRows
};
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
console.log(`Applied ${patchRows.length} preseal Scope calibration wording corrections.`);
console.log('- fixture wording only; semantic rules/models/thresholds/labels unchanged');
