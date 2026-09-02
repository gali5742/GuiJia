import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outPath=path.join(root,'data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json');
const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-route-exposure-supplement-schema-v0.1.json';

const texts={
  investment_price_trend:[
    '我关注的那只基金最近屏幕上的数字来回变化，接下来一阵会不会比现在高一些','手里看的这只股票这几天标出来的数不太安稳，后面会不会慢慢到更高的位置','我一直留意的ETF最近数值反复，过些日子显示出来的数字会不会高过眼下','这只指数基金最近每天看到的数字差别挺大，下一阶段会不会整体比现在高','我看的科技股最近盘面数字忽高忽低，之后一段时间会不会更多出现在较高位置','这只债券基金最近页面上的数变化不少，再往后会不会比当前这个水平更高','我关注的黄金ETF最近显示数值有些反复，接下来会不会逐渐移到更高一档','这只个股最近每天收盘后的数字不太一样，后面一阵会不会常常高于目前','我看的新能源项目估值最近变化明显，往后一段时间会不会来到比现在更高的区间','这只基金最近账户里显示的单位数字经常变化，过阵子会不会高过这几天','我留意的股票最近盘面上的数上下晃得厉害，接下来会不会慢慢抬到更高的位置','这只ETF近来每天看到的数字都在变，之后会不会出现一段明显高于当前的时期','我跟踪的指数基金最近数值不稳定，未来一阵显示出来的水平会不会高于眼下','这只科技股最近牌面上的数字反复变化，后面会不会逐渐靠近更高的区域','我看的债券最近市场上标出的数有些波动，再过一阵会不会比目前更高','这只基金最近每天记录下来的数字差距不小，接下来几周会不会整体高过现在','我关注的个股最近屏幕上的数一会儿高一会儿低，之后会不会更多停在高一些的位置','这只ETF最近看到的数字没有固定在一个水平，往后会不会进入比当前更高的一段','我看的黄金ETF最近盘面数字变化频繁，下一阵会不会逐渐来到较高的范围','这只指数基金最近账户里的数字有些反复，之后一个月会不会比现在更高','我关注的科技股近期标示出来的数不太稳定，后面会不会明显高过眼前这个水平','这只基金最近每天显示的数字上下变动，接下来是否更可能出现在比现在高的位置','我留意的股票近期收盘时看到的数差别很大，后面一段会不会高于目前这一带','这只ETF最近页面数字经常换位置，未来几周会不会慢慢挪到更高一层','我看的债券基金近期数值反复变化，接下来一段是否会比眼下这个数字更高','这只个股最近盘面显示的数没有定下来，之后会不会逐渐进入较高的范围','我关注的指数基金近来每天的数都不一样，再往后会不会比目前这一阶段高一些','这只黄金ETF最近账户显示值变化较多，接下来会不会更多时候高于现在','我看的基金近期屏幕数字反复移动，未来一阵会不会到达比眼下更高的位置','这只股票最近每天标出的数很不稳定，之后几周会不会整体处在较高一边','我留意的ETF近期盘面数字变化明显，下一阶段会不会比现在这个水平更高','这只科技股最近账户里看到的数字差异很大，后面会不会逐步来到高一些的区域','我关注的债券基金近来显示的数常有变化，过一阵会不会高于现在看到的这个数','这只个股最近记录下来的每日数字来回变，之后一段会不会更多落在高一些的位置','我看的指数基金最近页面上那个数经常变化，接下来一个月会不会比目前高','这只黄金ETF近期盘面上显示的数字不稳定，再往后会不会逐渐到更高的水平','我关注的基金最近每天看到的数都有差异，未来几周会不会明显高于现在','这只股票近期屏幕上的数字变化挺快，后面一阵会不会更多出现在较高区域','我看的ETF最近收盘以后记录的数忽高忽低，接下来会不会整体比当前高一些','这只科技股近期页面数字持续变化，往后一段会不会来到比眼下更高的位置'
  ],
  marital_relationship:[
    '我成家这些年和家里那位最近话越来越少，接下来这种相处会不会慢慢缓和','办过婚礼以后我们一直共同生活，最近却常常各忙各的，后面相处能不能好一点','我和另一半已经共同过了很多年日子，最近容易为小事别扭，往后会不会改善','家里那位和我最近总是说不到一块，接下来一段这种相处状态会不会变顺','我们成家多年最近交流明显少了，之后彼此相处会不会重新变得自然一些','我和孩子的另一位家长最近总因家里的事起摩擦，往后能不能少一些冲突','共同生活这么多年的人最近对我有些疏远，接下来彼此之间会不会慢慢回暖','我和家里那个人这阵子各有各的心事，后面日常相处会不会比现在融洽','成家以后我们一路过到现在，最近却总有隔阂，接下来这种状态会不会缓下来','我和另一半最近为了家里的安排常有分歧，往后彼此能不能重新协调好','家里两个人这些年一直一起过日子，最近气氛有点僵，后面会不会逐渐松动','我和共同生活多年的那个人最近很少认真说话，接下来交流会不会恢复一些','成家很多年以后我们最近都有些疲惫，往后这段共同生活会不会更稳定','我和家里那位最近常常互相不理解，之后能不能重新找到舒服的相处方式','我们共同养孩子也一起生活多年，最近关系有些紧张，后面会不会慢慢缓解','我和另一半近来因为钱和家务总有争执，接下来日子能不能重新过得顺一点','家里那个人最近对很多事情都不愿和我商量，往后彼此沟通会不会改善','我成家后和对方共同生活到现在，最近经常冷着不说话，之后会不会好转','这些年我们一直在同一个家里过日子，最近距离感变强，接下来会不会减弱','我和孩子另一位家长近来意见经常相反，往后日常配合会不会越来越顺','共同生活很久的那个人最近对我明显没以前耐心，后面相处能不能恢复平和','我和家里那位最近一说重要事情就容易僵住，下一阶段沟通会不会顺畅些','成家多年后我们最近像各过各的，接下来彼此会不会重新愿意靠近一点','我和另一半最近常为双方家里的事情闹不愉快，之后这种摩擦会不会减少','我们共同生活多年最近很难好好说完一件事，往后能不能重新有耐心交流','家里那个人最近总把很多想法憋着不说，接下来彼此之间会不会更坦诚','我成家这些年总体还算平稳，但最近气氛有些淡，后面会不会重新变温和','我和孩子的另一位家长最近因为安排问题常不高兴，之后配合会不会改善','共同过日子这么久最近却容易互相挑毛病，接下来这种状态会不会变少','我和家里那位近来对未来安排分歧很大，后面能不能慢慢找到共同方向','成家以后我们经历了不少事情，最近彼此有点累，接下来相处会不会稳定下来','我和另一半最近各自压力都很大，对彼此耐心变少，往后会不会缓过来','家里两个人最近因为长辈和孩子的事总起争执，后面这种紧张会不会减轻','我和共同生活多年的那个人最近变得很客气，接下来会不会重新自然亲近','成家多年最近我们越来越少分享每天的事情，往后交流会不会重新多起来','我和家里那位最近一到周末也各忙各的，接下来彼此互动会不会改善','共同生活这些年本来很熟悉，最近却常觉得隔了一层，之后会不会慢慢消除','我和另一半最近谈到家庭计划就容易不开心，往后能不能更容易达成共识','家里那个人最近对我态度有些冷淡，接下来这种距离会不会逐渐缩小','我成家多年后最近第一次觉得彼此很难理解，往后一段相处会不会重新顺起来'
  ],
  relationship_development:[
    '我喜欢的那个人最近主动联系多了，接下来我们之间会不会更进一步','我们认识一阵子彼此都有好感，后面两个人会不会越来越靠近','我和喜欢的人最近聊天越来越频繁，之后这种关系会不会变得更特别','对方最近常主动找我说话，我也很在意他，接下来彼此会不会更亲近','我们彼此有好感但一直没有说破，往后这种状态会不会出现新的变化','我喜欢的人最近愿意和我单独见面更多了，后面我们会不会走得更近','我们最近联系很密切又都没有明说，接下来彼此的距离会不会继续缩小','我对那个人有特别的感觉，对方似乎也不排斥，之后两个人会不会更靠近','最近我们总会分享很多私人的事情，接下来这种关系会不会往前走一步','我喜欢的人最近明显更关心我的生活，后面彼此之间会不会有新的进展','我们认识很久最近突然聊得特别多，接下来两个人会不会变得比现在亲近','我和那个人彼此都很在意对方但没有挑明，往后会不会自然走近一些','对方最近总找机会和我见面，我也愿意回应，后面这种关系会不会继续推进','我们最近常一起吃饭聊天但都没明说心意，接下来会不会出现更明确的变化','我喜欢的人最近对我明显比以前热络，之后彼此会不会进一步靠近','我们两个人都有好感却一直保持现在这样，往后这种关系会不会向前变化','最近对方开始经常问我周末安排，接下来我们之间会不会比现在更亲近','我和那个人最近交流越来越自然，也会互相关心，后面会不会更进一步','彼此认识后一直聊得来，最近感觉距离变近了，接下来会不会继续靠近','我在意的人最近会主动分享很多事情，往后我们之间会不会出现新的进展','我们最近单独相处时越来越放松，接下来彼此会不会变得更加亲近','我喜欢的人开始主动约我出去，后面两个人的关系会不会往前走','对方和我最近常聊到很晚，彼此也都很投入，接下来会不会有进一步变化','我们认识不久但很快就熟起来了，之后两个人会不会慢慢变得更特别','我和那个人最近见面的次数增加不少，往后彼此会不会继续拉近距离','彼此都没有明说但身边人也感觉我们很亲近，接下来会不会再向前一步','我喜欢的人最近遇到事情会先来找我，后面我们之间会不会出现更深的连接','我们最近从普通聊天变成每天都联系，接下来这种关系会不会继续发展','对方最近对我的态度越来越温柔，我也愿意靠近，之后会不会更进一步','我和那个人最近常互相分享日常，彼此明显更熟，后面会不会有新的变化','我们彼此欣赏也愿意花时间见面，接下来两个人会不会越来越亲近','我喜欢的人最近开始把我介绍给熟悉的朋友，之后我们之间会不会往前走','最近我们都很期待见到对方，但谁也没有说得很明白，接下来会不会有进展','我和那个人从认识到现在越来越默契，后面彼此会不会进一步靠近','对方最近常主动问候我，也会记得很多细节，往后这种关系会不会更深','我们最近一起做很多事情时都很开心，接下来两个人会不会变得更亲近','我喜欢的人最近愿意告诉我不少心里话，之后彼此会不会进一步走近','我们目前比普通朋友亲近一些但还没有说清楚，接下来会不会再往前一步','对方最近明显增加了和我相处的时间，后面我们之间会不会有新的进展','我和那个人彼此都有特别的在意，往后一段会不会逐渐变得更加亲近'
  ]
};

const axis={
  investment_price_trend:'future_market_level_direction_without_profit_position_or_liquidation_target',
  marital_relationship:'existing_long_term_household_pair_relationship_quality_without_explicit_marriage_trigger',
  relationship_development:'mutual_affection_closeness_progression_without_explicit_romance_trigger'
};

const rows=[];
let serial=1;
for(const routeId of ['investment_price_trend','marital_relationship','relationship_development']){
  if(texts[routeId].length!==40)throw new Error(`${routeId} text count ${texts[routeId].length} !=40`);
  texts[routeId].forEach((text,index)=>rows.push({
    id:`V04-FI-X1-${String(serial++).padStart(3,'0')}`,
    text,
    identityLabel:'route_identity_positive',
    expectedRoute:routeId,
    subtype:'fallback_stage_route_exposure_supplement',
    confusableFamily:routeId,
    semanticAxis:axis[routeId],
    wordingPattern:`${routeId}_fresh_${String(index+1).padStart(2,'0')}`
  }));
}

const payload={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-route-exposure-supplement-v0.1',
  status:'presealed_route_exposure_supplement',
  sealed:false,
  schema:schemaPath,
  policy:{
    oneShotSupplement:true,
    encoderScoringObserved:false,
    fallbackIdentityTrainingPerformed:false,
    fallbackIdentityProbabilityUsed:false,
    fallbackThresholdSelected:false,
    v04CalibrationTextReadForGeneration:false,
    v04ReachabilityRowResultsRead:false,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    candidateV03FailureRowsRead:false,
    aggregateZeroRouteIdsOnly:true
  },
  sampling:{totalRows:120,perRoute:40,routes:['investment_price_trend','marital_relationship','relationship_development']},
  rows
};
fs.writeFileSync(outPath,`${JSON.stringify(payload,null,2)}\n`,'utf8');
console.log('One-shot Fallback route-exposure supplement generated without encoder scoring.');
console.log('- rows: 120 = 40 each for investment_price_trend / marital_relationship / relationship_development');
console.log('- v0.4 calibration text / row-level reachability results read: 0');
console.log('- model probabilities / Fallback training / threshold selection: 0');
