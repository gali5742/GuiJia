import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const calibrationPath=path.join(root,'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json');
const calibration=JSON.parse(fs.readFileSync(calibrationPath,'utf8'));
if(calibration.status!=='presealed_fallback_stage_calibration'||calibration.sealed!==false)throw new Error('calibration v0.4 is not editable preseal data');
if(calibration.policy?.encoderScoringObserved!==false||calibration.policy?.semanticActProbabilityUsedForGeneration!==false||calibration.policy?.routeabilityProbabilityUsedForGeneration!==false)throw new Error('model scoring/probability already observed before diversity correction');

const frame2Templates={
  financial_fortune:(anchor,choice)=>`为了月底自己回看方便，我想让${anchor}${choice}，这样以后找某一笔内容会不会更快`,
  business_operation:(anchor,choice)=>`每天收档时都会碰到${anchor}，如果${choice}，以后查当天内容会不会更省事`,
  commercial_transaction:(anchor,choice)=>`以后翻旧资料时我想把${anchor}${choice}，这样按对方查找会不会更清楚`,
  inventory_purchase:(anchor,choice)=>`补齐东西后还要回看${anchor}，若${choice}，以后核对缺项会不会更方便`,
  inventory_sale:(anchor,choice)=>`整理后屋旧东西时我常看${anchor}，改成${choice}以后会不会更容易定位`,
  borrow_money:(anchor,choice)=>`我偶尔要回看${anchor}，如果${choice}，以后按时间找某次安排会不会更顺手`,
  lend_money:(anchor,choice)=>`以后按人回看${anchor}时，我想${choice}，这样找某次安排会不会更省事`,
  debt_collection:(anchor,choice)=>`对照不同月份的${anchor}时，我准备${choice}，以后查某一段往来会不会更清楚`,
  debt_repayment:(anchor,choice)=>`年末自己核对${anchor}时，我想${choice}，这样找旧条目会不会更容易`,
  partnership:(anchor,choice)=>`两边交接各自负责内容时都会看${anchor}，若${choice}，以后分清责任会不会更方便`,
  investment_profit:(anchor,choice)=>`隔几个月回看${anchor}时，我准备${choice}，这样比较前后记录会不会更直观`,
  investment_liquidation:(anchor,choice)=>`整理不同阶段的${anchor}时，我想${choice}，以后找对应资料会不会更快`,
  investment_suitability:(anchor,choice)=>`对照不同来源的${anchor}时，我准备${choice}，这样以后复查依据会不会更清楚`,
  investment_position_decision:(anchor,choice)=>`每周回看${anchor}时，我想${choice}，以后找某次观察会不会更方便`,
  investment_price_trend:(anchor,choice)=>`比较前后几天的${anchor}时，我准备${choice}，这样以后定位某天内容会不会更快`,
  income_salary:(anchor,choice)=>`月底核对${anchor}时，我想${choice}，以后找某个月份会不会更省事`,
  income_bonus:(anchor,choice)=>`年末回看${anchor}时，我准备${choice}，以后按事项查找会不会更清楚`,
  receive_item:(anchor,choice)=>`东西多的时候我会回看${anchor}，如果${choice}，以后找某个条目会不会更方便`,
  item_purchase:(anchor,choice)=>`比较不同东西时我常翻${anchor}，若${choice}，以后找某个候选会不会更快`,
  relationship_development:(anchor,choice)=>`回看一段时间里的${anchor}时，我想${choice}，以后找某次安排会不会更清楚`,
  marriage_match:(anchor,choice)=>`两边讨论长期安排时会翻${anchor}，如果${choice}，以后找某项事情会不会更方便`,
  marital_relationship:(anchor,choice)=>`分配日常事情时会参考${anchor}，我想${choice}，以后找某项安排会不会更省事`
};

const changed=[];
for(const row of calibration.rows){
  if(row.subtype!=='near_domain_not_current_route'||!row.wordingPattern?.endsWith('_frame_2'))continue;
  const family=row.pressureFamily;
  const template=frame2Templates[family];
  if(!template)throw new Error(`missing frame-2 template for ${family}`);
  const match=row.wordingPattern.match(/_choice_(\d+)_frame_2$/);
  if(!match)throw new Error(`unexpected wording pattern ${row.id}/${row.wordingPattern}`);
  const choiceIndex=Number(match[1])-1;
  const choices=[
    '按日期分开而不是混在一处',
    '单独放一栏而不是并进总表',
    '每周整理一次而不是月底集中整理',
    '用编号标记而不是只写名称',
    '按对象分组而不是按先后顺序排列'
  ];
  const anchors={
    financial_fortune:'日常钱款记录',business_operation:'铺面每天的杂项记录',commercial_transaction:'客户往来资料',inventory_purchase:'补充物料的登记',inventory_sale:'后屋旧品的编号',borrow_money:'临时周转记录',lend_money:'朋友周转记录',debt_collection:'往来款记录',debt_repayment:'名下账目记录',partnership:'两个人的分工记录',investment_profit:'基金持有记录',investment_liquidation:'基金账户资料',investment_suitability:'投资资料分类',investment_position_decision:'股票观察记录',investment_price_trend:'基金每日记录',income_salary:'公司每月固定给款的记录',income_bonus:'公司额外给款的记录',receive_item:'网购订单资料',item_purchase:'想看的设备清单',relationship_development:'两个人的见面安排',marriage_match:'两个人的家庭事项记录',marital_relationship:'共同生活的家务安排'
  };
  if(choiceIndex<0||choiceIndex>=choices.length)throw new Error(`choice index drift ${row.id}`);
  const previous=row.text;
  row.text=template(anchors[family],choices[choiceIndex]);
  changed.push({id:row.id,pressureFamily:family,reason:'diversify_cross_family_frame_2_before_encoder_scoring',from:previous,to:row.text});
}
if(changed.length!==110)throw new Error(`expected 110 frame-2 diversity corrections, got ${changed.length}`);
calibration.presealDiversityCorrections=changed.map(({id,pressureFamily,reason})=>({id,pressureFamily,reason}));
calibration.presealDiversityPolicy={changedRows:110,labelChanges:0,subtypeChanges:0,encoderScoringObserved:false,modelProbabilityUsed:false,nearDuplicateThresholdChanged:false};
fs.writeFileSync(calibrationPath,`${JSON.stringify(calibration,null,2)}\n`,'utf8');
console.log('Calibration v0.4 deterministic preseal diversity correction applied.');
console.log('- changed: 110 near-domain frame-2 rows across 22 pressure families');
console.log('- labels/subtypes changed: 0');
console.log('- encoder/model probability used: 0');
console.log('- near-duplicate threshold changed: 0');
