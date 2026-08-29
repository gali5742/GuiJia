(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const test = (text, pattern) => pattern.test(text);
  const add = (set, name, condition) => { if (condition) set.add(name); };

  const INVESTMENT_ASSET = /(?:投资|股票|个股|基金|ETF|etf|债券|期货|外汇|黄金ETF|指数基金|债券基金|科技股|新能源项目|投资项目|投资标的|仓位|持仓|入股)/;
  const BUSINESS_ENTITY = /(?:经营|营业|生意|业务|门店|店铺|网店|餐馆|饭店|咖啡店|摊位|摊子|工作室|公司业务|创业项目)/;
  const INVENTORY = /(?:库存|存货|尾货|积压货|经营库存|仓库里的货|仓库里[^，。？！?]{0,8}(?:货|商品)|这批货|一批货|货品)/;
  const PRODUCT = /(?:电脑|手机|耳机|相机|显示器|键盘|平板|路由器|手表|镜头|投影仪|空气净化器|扫地机器人|家电|设备|机器|产品|商品)/;
  const DELIVERY_OBJECT = /(?:订单|包裹|快递件|货物|商品|电脑|手机|耳机|相机|显示器|键盘|平板|路由器|手表|镜头|投影仪|设备|机器)/;

  function extract(question) {
    const text = normalize(question);
    const domains = new Set();
    const events = new Set();
    const objects = new Set();
    const directions = new Set();
    const relations = new Set();
    const goals = new Set();
    const background = new Set();
    const currentTargets = new Set();

    const investment = test(text, INVESTMENT_ASSET);
    const business = test(text, BUSINESS_ENTITY);
    const inventory = test(text, INVENTORY);
    const product = test(text, PRODUCT);
    const deliveryObject = test(text, DELIVERY_OBJECT);

    add(domains, 'finance', test(text, /(?:财运|财务|钱财|现金流|资金流|收支|进账|手头[^，。？！?]{0,8}(?:宽裕|充裕|吃紧|紧张|松|顺)|整体[^，。？！?]{0,6}(?:收入|进账|钱|资金)|总体[^，。？！?]{0,6}(?:收入|进账|钱|资金))/));
    add(domains, 'business', business);
    add(domains, 'investment', investment);
    add(domains, 'employment_income', test(text, /(?:工资|薪水|薪资|月薪|基本工资|固定工资|固定薪酬|调薪|加薪|涨薪|年终奖|奖金|绩效奖|绩效奖金|项目奖励|奖励金|季度奖励)/));
    add(domains, 'commerce', test(text, /(?:订单|交易|批发|供应商|客户|买家|合同|采购)/));

    add(objects, 'investment_asset', investment);
    add(objects, 'inventory', inventory);
    add(objects, 'purchasable_item', product);
    add(objects, 'delivery_item', deliveryObject);

    add(events, 'business_operation', business && test(text, /(?:盈利|利润|亏损|扭亏|回本|赚钱|经营状况|营业状况|业绩|稳定|现金流)/));
    add(events, 'commercial_transaction', test(text, /(?:(?:这笔|这单|这一单|商业|批发|采购)[^，。？！?]{0,10}(?:交易|订单|合同)|(?:客户|买家|供应商)[^，。？！?]{0,12}(?:订单|交易|合同|成交|签约))/));
    add(events, 'inventory_acquisition', test(text, /(?:进货|补货|备货|补库存|增加库存|采购[^，。？！?]{0,8}(?:货|库存|商品)|(?:货|商品|库存)[^，。？！?]{0,8}(?:入库|进仓|到齐|到位)|入库|进仓)/));
    add(events, 'inventory_disposal', inventory && test(text, /(?:卖完|卖掉|售出|出掉|出清|出货|清掉|清库存|清仓库|消化[^，。？！?]{0,6}(?:库存|存货|尾货)|处理[^，。？！?]{0,6}(?:积压|尾货|存货))/));

    const collectionFocus = test(text, /(?:收回|追回|要回|讨回|催回|催款|讨债|追债)[^，。？！?]{0,14}(?:能不能|会不会|是否|顺利|到账|回来)?|(?:能不能|会不会|是否)[^，。？！?]{0,12}(?:收回|追回|要回|讨回)/);
    const creditor = test(text, /(?:欠我|欠我的|应收(?:账)?款|应收货款|拖欠我的|借给[^，。？！?]{0,10}的钱|借出去的[^，。？！?]{0,8}(?:钱|款)|债权|催款|讨债|追债)/) || collectionFocus;
    add(directions, 'creditor_inward', creditor);
    add(currentTargets, 'debt_collection', collectionFocus);

    const debtor = test(text, /(?:(?:我|本人)[^，。？！?]{0,10}(?:欠|还|偿还|清偿)[^，。？！?]{0,12}(?:贷款|房贷|消费贷|欠款|债务|信用卡|钱)|(?:房贷|贷款|消费贷|欠款|债务|信用卡欠款)[^，。？！?]{0,14}(?:还清|还完|结清|偿还|清掉|处理)|(?:处理|偿还|还清|还完|结清|清掉)[^，。？！?]{0,10}(?:房贷|贷款|消费贷|欠款|债务|信用卡欠款))/);
    add(directions, 'debtor_outward', debtor);

    const lendBackground = test(text, /(?:向我借|找我借|从我这里借|我[^，。？！?]{0,10}(?:借给|贷给|出借)|借出去)/);
    add(directions, 'funds_outward', lendBackground);
    add(background, 'historical_lending', test(text, /(?:我借出去的|借出去的|我借给[^，。？！?]{0,10}的)/));

    const borrow = test(text, /(?:(?:我|本人)?(?:向|跟|从|找)(?:家里|家人|朋友|同事|亲戚|舅舅|叔叔|阿姨|表哥|表姐|姐姐|哥哥|父母|银行|熟人)[^，。？！?]{0,12}(?:借|周转)|(?:信用贷|信贷|贷款|房贷|经营贷)[^，。？！?]{0,12}(?:申请|办理|获批|批下来|放款)|(?:申请|办理)[^，。？！?]{0,10}(?:信用贷|信贷|贷款|房贷|经营贷))/);
    add(directions, 'funds_inward', borrow);

    add(relations, 'partnership', test(text, /(?:合伙|合伙人|共同经营|一起经营|搭档[^，。？！?]{0,8}(?:经营|开店|做生意))/));
    const existingMarriage = test(text, /(?:妻子|老婆|丈夫|老公|已婚|婚后|夫妻关系|婚姻关系|我们夫妻|夫妻俩|已经存在的婚姻|这段婚姻)/);
    const marriageTarget = test(text, /(?:结婚|婚事|亲事|领证|婚约|成为夫妻|结为夫妻|走进婚姻|走入婚姻)/);
    const romance = test(text, /(?:恋人|情侣|恋爱|表白|暧昧|在一起|谈恋爱|正式确定关系|男女朋友|恋爱发展)/);
    add(relations, 'existing_marriage', existingMarriage);
    add(relations, 'marriage_target', marriageTarget && !existingMarriage);
    add(relations, 'romantic_development', romance && !existingMarriage && !marriageTarget);

    const profit = test(text, /(?:盈利|利润|赚钱|回本|正收益|赚到钱|有收益|收益)/);
    const profitQuestion = test(text, /(?:(?:能不能|会不会|有没有|是否|能否)[^，。？！?]{0,10}(?:盈利|赚钱|回本|有利润|有收益)|(?:盈利|利润|收益)[^，。？！?]{0,8}(?:吗|怎样|如何|怎么样))/);
    add(goals, 'profit', profit);
    add(currentTargets, 'profit', profitQuestion);

    const liquidation = test(text, /(?:赎回|清仓|套现|变现|全部卖掉|全部卖出|一次性卖出|退出投资|退出持仓|平仓|清掉[^，。？！?]{0,8}仓位|仓位[^，。？！?]{0,8}(?:全部)?清掉)/);
    add(events, 'investment_liquidation', investment && liquidation);
    add(currentTargets, 'liquidation', investment && liquidation && test(text, /(?:能不能|会不会|是否|顺利|卡住|阻碍|完成|到账)/));

    const position = test(text, /(?:继续持有|继续拿|继续留|减仓|加仓|调整仓位|调整持仓|仓位调整|持仓调整|要不要[^，。？！?]{0,8}(?:卖|减|加|继续)|应该[^，。？！?]{0,8}(?:持有|减仓|加仓|继续)|犹豫[^，。？！?]{0,10}(?:调整|减仓|加仓|卖|继续)|(?:仓位|持仓)[^，。？！?]{0,14}(?:调整|减掉|减少|加仓|减仓)|(?:调整|减掉|减少)[^，。？！?]{0,10}(?:仓位|持仓))/);
    add(events, 'investment_position', investment && position);
    add(background, 'position_context', investment && test(text, /(?:继续持有[^，。？！?]{0,10}(?:几天|几周|几个月|一段时间)|手上的[^，。？！?]{0,10}(?:股票|基金|ETF))/));

    const suitability = test(text, /(?:适不适合|合不合适|是否合适|值不值得|该不该投|要不要投|值得参与|适合我|适合自己)/);
    add(goals, 'suitability', suitability);
    add(currentTargets, 'suitability', suitability && investment);

    const trend = test(text, /(?:走势|净值|价格|涨|跌|上行|下行|走高|走低|回落|偏强|偏弱)/);
    add(goals, 'price_trend', trend && investment);
    add(currentTargets, 'price_trend', trend && investment && test(text, /(?:会不会|是否|能否|接下来|未来|后面|走势|怎么走|如何走)/));

    const salary = test(text, /(?:工资|薪水|薪资|月薪|基本工资|固定工资|固定薪酬|调薪|加薪|涨薪)/);
    const bonus = test(text, /(?:奖金|年终奖|绩效奖|绩效奖金|项目奖励|奖励金|季度奖励)/);
    add(events, 'salary_income', salary);
    add(events, 'bonus_income', bonus);

    const delivery = test(text, /(?:收到|拿到|到手|送到|送达|发货|发出|寄出|寄到|快递|物流|包裹|运输途中|到齐|到位)/);
    add(events, 'delivery', delivery);
    add(background, 'past_purchase', test(text, /(?:我买的|已经买的|买下的|下单的)/));
    add(currentTargets, 'receipt', delivery && test(text, /(?:能不能|会不会|什么时候|多久|几天|到手|收到|拿到|送到|送达)/));

    const purchase = test(text, /(?:购买|购入|入手|买下|准备买|准备购买|现在买|值不值得买|值得入手|该不该买|要不要买)/);
    add(events, 'ordinary_purchase', purchase && product && !investment);
    add(currentTargets, 'purchase', purchase && product && test(text, /(?:值不值得|该不该|要不要|合不合适|适不适合|好不好|后悔)/));

    return Object.freeze({
      version:VERSION,
      text,
      domains:Object.freeze([...domains]),
      events:Object.freeze([...events]),
      objects:Object.freeze([...objects]),
      directions:Object.freeze([...directions]),
      relations:Object.freeze([...relations]),
      goals:Object.freeze([...goals]),
      background:Object.freeze([...background]),
      currentTargets:Object.freeze([...currentTargets])
    });
  }

  const includes = (evidence, group, value) => Array.isArray(evidence?.[group]) && evidence[group].includes(value);
  GuiJia.liuyaoSemanticRouteEvidenceV01 = Object.freeze({ version:VERSION, extract, includes });
})(typeof window !== 'undefined' ? window : globalThis);
