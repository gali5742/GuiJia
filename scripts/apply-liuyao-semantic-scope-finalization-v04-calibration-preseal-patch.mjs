import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.4-calibration.json');
const patchFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.4-calibration-preseal-patch.json');
const calibration = JSON.parse(fs.readFileSync(calibrationFile, 'utf8'));
if (calibration.status !== 'presealed_fresh_scope_calibration' || calibration.sealed !== false) throw new Error('Candidate v0.6 Scope calibration must be presealed before wording patch');

const changes = [
  ['SC4-004','仓库新到的这批商品月底前能不能完成补货入库','仓库里的这批货下周三前能不能全部入库','restore frozen inventory object + acquisition anchors'],
  ['SC4-006','店里最后一批旧款这个月能不能全部卖完','店里最后这批尾货这个月能不能全部卖完','restore frozen inventory object + disposal anchors'],
  ['SC4-007','我向堂姐借的临时周转款下周能不能拿到','我向表姐借的临时周转款下周能不能拿到','use a frozen borrower-counterparty anchor without changing semantics'],
  ['SC4-015','公司这笔应收项目款周五前能不能要回','公司这笔应收款周五前能不能要回','restore frozen creditor anchor'],
  ['SC4-016','我的车贷明年三月以前能不能还清','我的银行贷款明年三月以前能不能还清','restore frozen debtor-loan anchor'],
  ['SC4-018','手里剩下的培训贷今年冬天能不能还完','手里剩下的消费贷今年冬天能不能还完','restore frozen debtor-loan anchor'],
  ['SC4-024','手里的医药股仓位一次卖掉会不会卡住','手上的股票仓位下周一次性卖出会不会卡住','restore frozen investment-asset + liquidation anchors'],
  ['SC4-034','已经寄出的唱片机明天能不能到手','已经寄出的相机明天能不能到手','restore frozen delivery-object anchor'],
  ['SC4-036','这台除湿机现在该不该买','这台空气净化器本月该不该买','restore frozen purchasable-item anchor'],
  ['SC4-038','这款电纸书现在买下来合不合适','这款平板阅读器现在买下来合不合适','restore frozen purchasable-item anchor'],
  ['SC4-048','今年现金余量起伏比较大，我想单独占这个主题','今年整体资金流起伏比较大，我想单独占这个主题','restore frozen finance-domain support anchor'],
  ['SC4-049','最近手里的钱进出不太稳定，我想看看这一项','最近整体收支不太稳定，我想看看这一项','restore frozen finance-domain support anchor'],
  ['SC4-051','近期资金宽紧变化明显，我想单独看看','近期资金流变化明显，我想单独看看','restore frozen finance-domain support anchor'],
  ['SC4-056','自己做的买卖近来亏赚反复，我想占一下','自己做的生意近来利润反复，我想占一下','restore frozen business-domain + operation-event support anchors'],
  ['SC4-059','这个小摊最近营业状态变化不少，我想占这一项','这个摊位最近营业状况变化不少，我想占这一项','restore frozen business-domain + operation-event support anchors'],
  ['SC4-069','手里的医药股准备一次卖掉，我想看看这一步','手里的股票准备一次性卖出，我想看看这一步','restore frozen investment-asset + liquidation support anchors'],
  ['SC4-073','这份持仓准备全部清掉，我想单独看看','这份持仓准备全部卖出，我想单独看看','restore frozen liquidation support anchor'],
  ['SC4-074','我已经决定把这笔合约平仓，想问一下这个步骤','我已经决定把这笔期货平仓，想问一下这个步骤','restore frozen investment-asset support anchor'],
  ['SC4-075','这只蓝筹股我正在考虑继续持有，想占一下','这只股票我正在考虑继续持有，想占一下','restore frozen investment-asset + position support anchors'],
  ['SC4-083','手里的医药股最近价格变化明显，我想看看涨跌方面','手里的股票最近价格变化明显，我想看看涨跌方面','restore frozen investment-asset + trend support anchors'],
  ['SC4-086','这只蓝筹股近来的价格波动让我在意，想问一下','这只个股近来的价格波动让我在意，想问一下','restore frozen investment-asset + trend support anchors']
].map(([id,from,to,reason]) => ({ id, from, to, reason }));

for (const change of changes) {
  const row = calibration.rows.find((item) => item.id === change.id);
  if (!row) throw new Error(`missing calibration row ${change.id}`);
  if (row.text !== change.from) throw new Error(`preseal patch source drift for ${change.id}: ${row.text}`);
  row.text = change.to;
}
fs.writeFileSync(calibrationFile, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
const patch = {
  version:'0.13-scope-finalization-v0.4-calibration-preseal-patch-v0.1',
  status:'recorded_before_seal_and_before_scope_scoring',
  candidate:'v0.6',
  modelOrThresholdScoredBeforePatch:false,
  semanticRuntimeModified:false,
  verifierWeakened:false,
  changeReasonClass:'fixture_wording_restored_to_frozen_evidence_path_contracts',
  changes
};
fs.writeFileSync(patchFile, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
console.log(`Applied ${changes.length} Candidate v0.6 Scope pre-seal wording patch(es).`);
