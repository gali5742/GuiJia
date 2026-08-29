import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;

const ROUTES = Object.freeze([
  {
    id:'financial_fortune',
    title:'阶段财运 / 总体赚钱状态',
    prototypes:[
      '今年整体财运怎么样',
      '最近这段时间赚钱情况如何',
      '这一年收入和财运会不会变好',
      '今年能不能比以前赚得更多'
    ]
  },
  {
    id:'business_operation',
    title:'经营 / 开店盈利',
    prototypes:[
      '开这个店能不能赚钱',
      '做这个生意最后有没有利润',
      '这个项目经营下去能否盈利',
      '创业做这门生意前景怎么样'
    ]
  },
  {
    id:'borrow_money',
    title:'借款 / 贷款获批',
    prototypes:[
      '申请贷款能不能批下来',
      '向银行借钱能不能获批',
      '这次房贷审批能通过吗',
      '申请融资最后能拿到钱吗'
    ]
  },
  {
    id:'debt_repayment',
    title:'偿债 / 还清贷款',
    prototypes:[
      '今年能不能把贷款全部还清',
      '这笔债什么时候能还完',
      '我能不能顺利把房贷还清',
      '债务今年是否可以结清'
    ]
  },
  {
    id:'investment_profit',
    title:'投资盈利 / 回本',
    prototypes:[
      '买这只股票能不能赚钱',
      '投资这个项目最后能盈利吗',
      '这笔投资有没有收益',
      '投进去的钱能不能赚回来'
    ]
  },
  {
    id:'investment_suitability',
    title:'投资适合度 / 值不值得投',
    prototypes:[
      '这个项目适不适合投资',
      '现在投这家公司值不值得',
      '这只股票适合现在介入吗',
      '这个投资机会是否值得参与'
    ]
  },
  {
    id:'investment_position_decision',
    title:'持仓决策 / 持有还是卖出',
    prototypes:[
      '这只股票继续持有还是现在卖',
      '现在应该拿着还是清仓',
      '这个持仓是继续留还是退出',
      '股票目前该继续持有还是卖掉'
    ]
  },
  {
    id:'investment_price_trend',
    title:'投资标的价格走势',
    prototypes:[
      '这只股票下周价格走势如何',
      '这只股票后面会涨还是会跌',
      '跌下来以后还能不能重新涨起来',
      '接下来股价会不会反弹回升'
    ]
  },
  {
    id:'income_salary',
    title:'工资 / 薪资收入',
    prototypes:[
      '今年工资能不能涨',
      '这次会不会给我加薪',
      '我的薪资今年有没有提升',
      '工资收入接下来会增加吗'
    ]
  },
  {
    id:'income_bonus',
    title:'奖金 / 年终奖',
    prototypes:[
      '今年年终奖能不能发下来',
      '这次奖金能不能拿到',
      '公司今年会发年终奖金吗',
      '我的绩效奖金最后能到账吗'
    ]
  },
  {
    id:'receive_item',
    title:'收货 / 物品到手',
    prototypes:[
      '我买的电脑这周能不能收到',
      '下单的东西什么时候能到手',
      '这个包裹明天能不能送到',
      '已经买的商品这两天能拿到吗'
    ]
  },
  {
    id:'item_purchase',
    title:'购买物品本身',
    prototypes:[
      '我买这台电脑好不好',
      '这个东西值不值得买',
      '现在买这件商品合不合适',
      '买这个设备是否划算'
    ]
  },
  {
    id:'relationship_development',
    title:'特定对象恋爱发展',
    prototypes:[
      '我和这个女生有没有机会发展恋爱关系',
      '我喜欢的这个男生会接受我吗',
      '我们两个人以后有没有可能在一起',
      '我和这个具体的人感情能不能进一步发展'
    ]
  },
  {
    id:'marriage_match',
    title:'婚事 / 能否结婚',
    prototypes:[
      '我和这个人能不能结婚',
      '这门婚事最后能不能成',
      '我们两个人有没有结婚的可能',
      '这段关系最终能走到婚姻吗'
    ]
  },
  {
    id:'marital_relationship',
    title:'既有婚姻关系',
    prototypes:[
      '我和丈夫现在的婚姻关系怎么样',
      '我和妻子还能不能和好',
      '我们夫妻这段婚姻能不能继续',
      '和老公目前的感情状态如何'
    ]
  }
]);

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
let routeCentroids = null;
let loadingPromise = null;

const normalizeVector = (vector) => {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) sum += vector[i] * vector[i];
  const norm = Math.sqrt(sum) || 1;
  const out = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i += 1) out[i] = vector[i] / norm;
  return out;
};

const dot = (a, b) => {
  let total = 0;
  const size = Math.min(a.length, b.length);
  for (let i = 0; i < size; i += 1) total += a[i] * b[i];
  return total;
};

const averageVectors = (vectors) => {
  const size = vectors[0]?.length || VECTOR_SIZE;
  const mean = new Float32Array(size);
  vectors.forEach((vector) => {
    for (let i = 0; i < size; i += 1) mean[i] += vector[i];
  });
  const divisor = vectors.length || 1;
  for (let i = 0; i < size; i += 1) mean[i] /= divisor;
  return normalizeVector(mean);
};

const tensorToVectors = (tensor, count) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || VECTOR_SIZE;
  const batch = count || dims[0] || 1;
  const data = tensor?.data || [];
  const result = [];
  for (let row = 0; row < batch; row += 1) {
    const start = row * hidden;
    result.push(normalizeVector(Float32Array.from(data.slice(start, start + hidden))));
  }
  return result;
};

const embedTexts = async (texts, chunkSize = 16) => {
  if (!extractor) throw new Error('模型尚未加载');
  const list = Array.isArray(texts) ? texts : [texts];
  const vectors = [];
  for (let start = 0; start < list.length; start += chunkSize) {
    const chunk = list.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:'mean', normalize:true });
    vectors.push(...tensorToVectors(output, chunk.length));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return vectors;
};

const buildRouteCentroids = async () => {
  const all = ROUTES.flatMap((route) => route.prototypes.map((text) => ({ routeId:route.id, text })));
  const vectors = await embedTexts(all.map((item) => item.text));
  const grouped = new Map();
  all.forEach((item, index) => {
    if (!grouped.has(item.routeId)) grouped.set(item.routeId, []);
    grouped.get(item.routeId).push(vectors[index]);
  });
  routeCentroids = new Map(ROUTES.map((route) => [route.id, averageVectors(grouped.get(route.id) || [])]));
  return routeCentroids;
};

const loadModel = async (progressCallback) => {
  if (extractor && routeCentroids) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    extractor = await pipeline('feature-extraction', MODEL_ID, {
      dtype:MODEL_DTYPE,
      progress_callback:progressCallback
    });
    await buildRouteCentroids();
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
};

const scoreVector = (vector) => ROUTES
  .map((route) => ({ id:route.id, title:route.title, score:dot(vector, routeCentroids.get(route.id)) }))
  .sort((a, b) => b.score - a.score);

const classify = async (question, thresholds = {}) => {
  const [vector] = await embedTexts([question], 1);
  const scores = scoreVector(vector);
  const top1 = scores[0] || null;
  const top2 = scores[1] || null;
  const minSimilarity = Number.isFinite(thresholds.minSimilarity) ? thresholds.minSimilarity : 0.55;
  const minMargin = Number.isFinite(thresholds.minMargin) ? thresholds.minMargin : 0.025;
  const margin = top1 && top2 ? top1.score - top2.score : 1;
  const accepted = Boolean(top1 && top1.score >= minSimilarity && margin >= minMargin);
  return {
    accepted,
    predicted:accepted ? top1.id : '__unknown__',
    top1,
    top2,
    margin,
    minSimilarity,
    minMargin,
    scores
  };
};

const runEvaluation = async ({ minSimilarity = 0.55, minMargin = 0.025, onProgress } = {}) => {
  const rows = Object.entries(EVAL_SETS).flatMap(([expected, texts]) => texts.map((text) => ({ expected, text })));
  const vectors = await embedTexts(rows.map((row) => row.text), 12);
  const results = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const scores = scoreVector(vectors[index]);
    const top1 = scores[0] || null;
    const top2 = scores[1] || null;
    const margin = top1 && top2 ? top1.score - top2.score : 1;
    const accepted = Boolean(top1 && top1.score >= minSimilarity && margin >= minMargin);
    const predicted = accepted ? top1.id : '__unknown__';
    results.push({
      ...row,
      predicted,
      correct:predicted === row.expected,
      top1,
      top2,
      margin,
      accepted
    });
    if (onProgress && (index % 8 === 0 || index === rows.length - 1)) onProgress(index + 1, rows.length);
  }

  const known = results.filter((row) => row.expected !== '__unknown__');
  const unknown = results.filter((row) => row.expected === '__unknown__');
  const acceptedKnown = known.filter((row) => row.accepted);
  const correct = results.filter((row) => row.correct).length;
  const knownCorrect = known.filter((row) => row.correct).length;
  const unknownRejected = unknown.filter((row) => row.predicted === '__unknown__').length;
  const falseActivations = unknown.filter((row) => row.predicted !== '__unknown__').length;

  return {
    results,
    metrics:{
      total:results.length,
      exactAccuracy:correct / results.length,
      knownCoverage:acceptedKnown.length / known.length,
      knownExactAccuracy:knownCorrect / known.length,
      acceptedKnownAccuracy:acceptedKnown.length ? acceptedKnown.filter((row) => row.correct).length / acceptedKnown.length : 0,
      unknownRejectionRate:unknown.length ? unknownRejected / unknown.length : 0,
      falseRuleActivationRate:unknown.length ? falseActivations / unknown.length : 0,
      knownCount:known.length,
      unknownCount:unknown.length
    }
  };
};

export const semanticRouterPoc = Object.freeze({
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  routes:ROUTES,
  evalSets:EVAL_SETS,
  loadModel,
  classify,
  runEvaluation
});
