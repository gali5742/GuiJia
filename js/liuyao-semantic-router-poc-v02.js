import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';

const DOMAINS = Object.freeze([
  {
    id:'financial_general',
    title:'总体财务 / 财运',
    prototypes:[
      '今年整体财运和收入情况怎么样',
      '最近这段时间总体赚钱情况如何',
      '这一年整体进账和手头宽裕程度',
      '个人整体财务状态接下来怎么样'
    ]
  },
  {
    id:'business',
    title:'经营 / 生意',
    prototypes:[
      '开店做生意的经营情况',
      '这家店今年生意和经营会怎样',
      '做这个买卖最终有没有利润',
      '创业经营这个项目能不能做起来'
    ]
  },
  {
    id:'loan_request',
    title:'借款 / 贷款申请',
    prototypes:[
      '向银行申请贷款和房贷审批',
      '申请借款能否获批',
      '融资申请能不能拿到款',
      '银行是否同意我的贷款申请'
    ]
  },
  {
    id:'debt',
    title:'债务 / 偿还',
    prototypes:[
      '偿还贷款和债务',
      '把欠款全部还清结清',
      '房贷什么时候能够还完',
      '剩余债务能否清掉'
    ]
  },
  {
    id:'investment',
    title:'投资 / 股票 / 基金 / 持仓',
    prototypes:[
      '股票基金和投资项目',
      '买入投资标的之后的情况',
      '手里的股票持仓和投资决策',
      '投资资金以及标的价格变化'
    ]
  },
  {
    id:'salary',
    title:'工资 / 薪资',
    prototypes:[
      '工资月薪和薪资待遇',
      '工作收入以及加薪调薪',
      '今年薪水会不会提高',
      '月薪和工资待遇的变化'
    ]
  },
  {
    id:'bonus',
    title:'奖金 / 年终奖',
    prototypes:[
      '年终奖和绩效奖金',
      '公司发放奖金奖励金',
      '这次奖金最终能不能拿到',
      '年底的奖金是否会到账'
    ]
  },
  {
    id:'delivery',
    title:'快递 / 收货 / 送达',
    prototypes:[
      '网购买的东西通过快递送到',
      '包裹商品什么时候能够收到',
      '已经下单的货物什么时候到手',
      '买的电脑手机能不能按时送达'
    ]
  },
  {
    id:'purchase',
    title:'购买商品 / 设备',
    prototypes:[
      '要不要买这台电脑或设备',
      '现在入手这个商品是否合适',
      '购买这件东西值不值得',
      '买这个相机手机是否划算'
    ]
  },
  {
    id:'relationship',
    title:'未婚恋爱 / 特定对象',
    prototypes:[
      '和喜欢的具体对象发展恋爱关系',
      '我和这个人有没有机会在一起',
      '朋友之间能不能进一步变成恋人',
      '喜欢的人是否愿意和我交往'
    ]
  },
  {
    id:'marital',
    title:'既有婚姻 / 夫妻',
    prototypes:[
      '我和丈夫妻子的婚姻关系',
      '夫妻之间目前的感情状态',
      '和老婆老公还能不能和好',
      '现在这段婚姻能不能继续'
    ]
  }
]);

const GOALS = Object.freeze([
  {
    id:'overall_state',
    title:'总体状态 / 是否好转',
    prototypes:[
      '整体情况怎么样',
      '接下来会不会好转',
      '总体状态会怎样',
      '最近这段时间顺不顺'
    ]
  },
  {
    id:'profit',
    title:'盈利 / 赚钱 / 回本',
    prototypes:[
      '最后能不能赚钱',
      '有没有利润',
      '能否盈利',
      '投进去的钱能不能赚回来'
    ]
  },
  {
    id:'approval',
    title:'审批 / 获批',
    prototypes:[
      '申请能不能批下来',
      '能不能通过审批',
      '对方会不会同意申请',
      '最终能否获批'
    ]
  },
  {
    id:'completion',
    title:'完成 / 结清',
    prototypes:[
      '能不能全部还清',
      '什么时候能够还完',
      '是否可以彻底结清',
      '能否在目标时间完成偿还'
    ]
  },
  {
    id:'suitability',
    title:'适合度 / 值不值得',
    prototypes:[
      '值不值得做',
      '适不适合',
      '现在这样做合不合适',
      '该不该选择这个方案'
    ]
  },
  {
    id:'price_trend',
    title:'价格走势 / 涨跌',
    prototypes:[
      '接下来会不会涨',
      '后面还会不会跌',
      '能不能反弹回升涨回来',
      '后面的走势向上还是向下'
    ]
  },
  {
    id:'choice',
    title:'持有 / 卖出选择',
    prototypes:[
      '继续持有还是卖出',
      '现在该留着还是退出',
      '清仓还是继续拿着',
      '应该卖掉还是继续持有'
    ]
  },
  {
    id:'increase',
    title:'增加 / 提升',
    prototypes:[
      '会不会增加提高',
      '能不能比以前更多',
      '接下来是否会提升',
      '最终能提高多少'
    ]
  },
  {
    id:'receipt',
    title:'收到 / 到手 / 到账',
    prototypes:[
      '什么时候能够收到',
      '能不能按时到手',
      '会不会送到',
      '最终什么时候能够拿到'
    ]
  },
  {
    id:'relationship_outcome',
    title:'恋爱发展结果',
    prototypes:[
      '有没有机会在一起',
      '对方会不会接受我',
      '能不能开始交往',
      '关系能不能进一步发展'
    ]
  },
  {
    id:'marriage',
    title:'结婚 / 婚事',
    prototypes:[
      '两个人能不能结婚',
      '有没有结婚的可能',
      '能否走到婚姻',
      '最终会不会成为夫妻'
    ]
  },
  {
    id:'relationship_state',
    title:'关系改善 / 延续',
    prototypes:[
      '关系会不会改善',
      '两个人还能不能和好',
      '这段关系能不能继续',
      '目前感情状态如何'
    ]
  }
]);

const ROUTE_MATRIX = Object.freeze({
  financial_general:Object.freeze({
    overall_state:'financial_fortune',
    increase:'financial_fortune',
    profit:'financial_fortune'
  }),
  business:Object.freeze({
    overall_state:'business_operation',
    profit:'business_operation',
    increase:'business_operation'
  }),
  loan_request:Object.freeze({ approval:'borrow_money' }),
  debt:Object.freeze({ completion:'debt_repayment' }),
  investment:Object.freeze({
    profit:'investment_profit',
    suitability:'investment_suitability',
    choice:'investment_position_decision',
    price_trend:'investment_price_trend'
  }),
  salary:Object.freeze({ increase:'income_salary', overall_state:'income_salary' }),
  bonus:Object.freeze({ receipt:'income_bonus', overall_state:'income_bonus', approval:'income_bonus' }),
  delivery:Object.freeze({ receipt:'receive_item' }),
  purchase:Object.freeze({ suitability:'item_purchase' }),
  relationship:Object.freeze({ relationship_outcome:'relationship_development', marriage:'marriage_match' }),
  marital:Object.freeze({ relationship_state:'marital_relationship', overall_state:'marital_relationship' })
});

const EVAL_SETS = Object.freeze({
  financial_fortune:[
    '今年财运能不能比去年好', '今年会不会比去年赚得多', '这一年整体进账怎么样', '最近几个月赚钱顺不顺',
    '今年收入总体能提升多少', '今年手头会不会比去年宽裕', '今年整体的赚钱能力如何'
  ],
  business_operation:[
    '创业开这家店能盈利吗', '这门生意继续做下去有钱赚吗', '经营这个项目能不能赚钱', '这个店今年生意会不会好转',
    '做这个买卖最终有没有利润', '我自己开店的经营结果怎么样', '这个项目商业运营能不能做起来'
  ],
  borrow_money:[
    '银行这次会不会给我放贷', '房贷申请可以批下来吗', '我想融资这次能不能成功拿到款', '申请的贷款有没有希望通过',
    '这次借款审批能不能过', '贷款额度最终能不能批下来', '银行会不会同意我的贷款申请'
  ],
  debt_repayment:[
    '今年房贷能彻底还完吗', '这笔欠款什么时候可以清掉', '我今年能不能把债务结清', '剩下的贷款能不能全部偿还',
    '这笔债今年能还干净吗', '信用卡欠款什么时候能全部还清', '我能否在年底前清掉这笔贷款'
  ],
  investment_profit:[
    '这只股票买进去能赚到钱吗', '投这个基金最后有收益吗', '这笔钱拿去投资能盈利不', '现在投资进去能不能回本',
    '买这个标的最后有没有利润', '这项投资会不会让我赚钱', '投入这个项目最终回报如何'
  ],
  investment_suitability:[
    '这个基金现在适合买吗', '这家公司目前值得投资吗', '这个项目适不适合我投钱', '现在介入这只股票合适不合适',
    '这项投资机会值不值得参加', '我现在投进去合不合适', '这个标的值得现在布局吗'
  ],
  investment_position_decision:[
    '这只票我是继续拿还是卖掉', '现在清仓好还是继续持有', '手里的股票要不要继续留着', '这个仓位现在该退出还是继续拿',
    '持有这只股票还是趁现在卖', '这笔持仓应该止盈离场还是继续放着', '我该卖出还是继续持股'
  ],
  investment_price_trend:[
    '这只股票现在跌了，下周会不会重新涨', '跌成这样后面还能反弹吗', '股价之后有没有回升的可能', '下周还会继续往下跌吗',
    '这只票还能涨回来吗', '后面走势是向上还是向下', '接下来会不会扭转跌势', '这支股票下周还会跌不跌',
    '现在跌了一段，后面是否重新走强', '这只基金接下来价格会回升吗'
  ],
  income_salary:[
    '老板今年会给我涨薪吗', '这次调薪我的工资能提高吗', '我的月薪今年会不会增加', '今年薪水有上涨机会吗',
    '工资待遇接下来能不能提高', '这份工作今年能加工资吗', '下半年我的薪资会提升吗'
  ],
  income_bonus:[
    '年终奖今年还有没有', '这次奖金最后能到账吗', '绩效奖会不会发下来', '公司年底会不会发奖金',
    '我今年能拿到年终奖金吗', '这笔奖励金会不会兑现', '奖金什么时候能发到手'
  ],
  receive_item:[
    '上周买的电脑这周能到手吗', '我订的东西明天可以收到不', '商品已经下单了，这几天能不能拿到', '这个快递今天能送过来吗',
    '买的手机什么时候能收到', '我的包裹这周能不能到', '网购的东西月底前能到手吗'
  ],
  item_purchase:[
    '这台电脑值得买吗', '现在买这个手机划算不划算', '我该不该买这个相机', '这个设备买回来好不好用',
    '这件商品值不值这个价格', '现在入手这台机器合适吗', '这东西我买了会不会后悔'
  ],
  relationship_development:[
    '我是男生，我非常喜欢的这个女生会接受我吗', '最近认识一个男生，我对他有好感，我们有机会吗', '我和她以后有可能在一起吗', '这个男生对我有没有发展的意思',
    '我追的那个女生会答应和我交往吗', '我和这个朋友能不能从朋友变成恋人', '我们之间还有进一步发展的可能吗', '我喜欢的那个男生愿不愿意跟我在一起'
  ],
  marriage_match:[
    '我们以后能结婚吗', '这段感情最后能走进婚姻吗', '我和这个女生有没有结婚可能', '这门亲事能不能成',
    '我们俩最终会不会成为夫妻', '和这个人谈下去最后能结婚吗', '我和对象今年能不能把婚结了'
  ],
  marital_relationship:[
    '我和老婆还能和好吗', '夫妻关系最近会不会改善', '我和老公这段婚姻还能继续吗', '妻子和我现在感情怎么样',
    '我们夫妻会不会复合', '我和丈夫目前关系会不会缓和', '这段婚姻还有没有继续维持的可能'
  ],
  __unknown__:[
    '明天东京会不会下雨', '这场足球比赛谁会赢', '我丢的钥匙在哪里', '明天考试能不能通过',
    '这次面试能不能过', '我家的猫为什么突然不吃饭', '周末去镰仓会不会堵车', '这篇论文能不能按时写完',
    '电脑蓝屏是什么原因', '这个菜怎么做更好吃', '我什么时候可以学会法语', '明天适不适合剪头发',
    '这趟航班会不会晚点', '我的耳机为什么连不上电脑', '今年能不能考到驾照', '这本书值不值得看'
  ]
});

let extractor = null;
let domainCentroids = null;
let goalCentroids = null;

function l2Normalize(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const norm = Math.sqrt(sum) || 1;
  return vector.map((value) => value / norm);
}

function meanVector(vectors) {
  const out = new Array(vectors[0].length).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < out.length; i += 1) out[i] += vector[i];
  }
  for (let i = 0; i < out.length; i += 1) out[i] /= vectors.length;
  return l2Normalize(out);
}

function cosine(a, b) {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) sum += a[i] * b[i];
  return sum;
}

async function embed(text) {
  if (!extractor) throw new Error('模型尚未加载');
  const output = await extractor(text, { pooling:'mean', normalize:true });
  return Array.from(output.data);
}

async function buildCentroids(groups, onStep) {
  const result = new Map();
  let done = 0;
  const total = groups.reduce((sum, group) => sum + group.prototypes.length, 0);
  for (const group of groups) {
    const vectors = [];
    for (const prototype of group.prototypes) {
      vectors.push(await embed(prototype));
      done += 1;
      onStep?.(done, total, group);
    }
    result.set(group.id, meanVector(vectors));
  }
  return result;
}

function scoreAxis(vector, groups, centroids) {
  return groups
    .map((group) => ({ id:group.id, title:group.title, score:cosine(vector, centroids.get(group.id)) }))
    .sort((a, b) => b.score - a.score);
}

function decideAxis(scores, minSimilarity, minMargin) {
  const top1 = scores[0];
  const top2 = scores[1] || { id:'__none__', title:'—', score:-1 };
  const margin = top1.score - top2.score;
  const accepted = top1.score >= minSimilarity && margin >= minMargin;
  return { accepted, top1, top2, margin, minSimilarity, minMargin };
}

function composeRoute(domainId, goalId) {
  return ROUTE_MATRIX[domainId]?.[goalId] || '__unknown__';
}

async function classify(text, options={}) {
  if (!domainCentroids || !goalCentroids) throw new Error('语义 centroid 尚未准备完成');
  const vector = await embed(text);
  const domainScores = scoreAxis(vector, DOMAINS, domainCentroids);
  const goalScores = scoreAxis(vector, GOALS, goalCentroids);
  const domain = decideAxis(domainScores, options.domainMinSimilarity ?? 0.60, options.domainMinMargin ?? 0.025);
  const goal = decideAxis(goalScores, options.goalMinSimilarity ?? 0.55, options.goalMinMargin ?? 0.020);

  let predicted = '__unknown__';
  let accepted = false;
  let reason = 'axis_rejected';
  if (domain.accepted && goal.accepted) {
    const route = composeRoute(domain.top1.id, goal.top1.id);
    if (route !== '__unknown__') {
      predicted = route;
      accepted = true;
      reason = 'composed';
    } else {
      reason = 'invalid_domain_goal_pair';
    }
  } else if (!domain.accepted && goal.accepted) {
    reason = 'domain_rejected';
  } else if (domain.accepted && !goal.accepted) {
    reason = 'goal_rejected';
  }

  return { text, predicted, accepted, reason, domain, goal, domainScores, goalScores };
}

async function loadModel(progressCallback, centroidCallback) {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', MODEL_ID, {
      dtype:MODEL_DTYPE,
      progress_callback:progressCallback
    });
  }
  if (!domainCentroids) {
    domainCentroids = await buildCentroids(DOMAINS, (done, total, group) => centroidCallback?.('domain', done, total, group));
  }
  if (!goalCentroids) {
    goalCentroids = await buildCentroids(GOALS, (done, total, group) => centroidCallback?.('goal', done, total, group));
  }
}

function flattenEval() {
  const rows = [];
  for (const [expected, samples] of Object.entries(EVAL_SETS)) {
    for (const text of samples) rows.push({ expected, text });
  }
  return rows;
}

async function runEvaluation(options={}) {
  const samples = flattenEval();
  const results = [];
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i];
    const result = await classify(sample.text, options);
    const correct = result.predicted === sample.expected;
    results.push({ ...sample, ...result, correct });
    options.onProgress?.(i + 1, samples.length);
  }

  const known = results.filter((row) => row.expected !== '__unknown__');
  const unknown = results.filter((row) => row.expected === '__unknown__');
  const acceptedKnown = known.filter((row) => row.accepted);
  const correctAcceptedKnown = acceptedKnown.filter((row) => row.correct);
  const exact = results.filter((row) => row.correct);
  const falseActivations = unknown.filter((row) => row.accepted);

  return {
    results,
    metrics:{
      total:results.length,
      exactAccuracy:exact.length / results.length,
      knownCoverage:acceptedKnown.length / known.length,
      acceptedKnownAccuracy:acceptedKnown.length ? correctAcceptedKnown.length / acceptedKnown.length : 0,
      unknownRejectionRate:unknown.length ? (unknown.length - falseActivations.length) / unknown.length : 1,
      falseRuleActivationRate:unknown.length ? falseActivations.length / unknown.length : 0,
      falseActivationCount:falseActivations.length,
      knownCount:known.length,
      unknownCount:unknown.length
    }
  };
}

export const semanticRouterPocV02 = Object.freeze({
  version:'0.2',
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  domains:DOMAINS,
  goals:GOALS,
  routeMatrix:ROUTE_MATRIX,
  evalSets:EVAL_SETS,
  loadModel,
  classify,
  runEvaluation,
  composeRoute
});
