(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.9-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

  function arbitrate(question) {
    const text = normalize(question);
    if (!text) return null;

    // Money direction: modern participant/fund-flow semantics only.
    if (/(?:欠我的|欠我|应收款|催款|讨债|追债|货款[^，。？！?]{0,8}欠着我|借给[^，。？！?]{0,8}的钱[^，。？！?]{0,8}(?:收回|追回|要回))/.test(text)) return { routeId:'debt_collection', evidence:'creditor-direction' };
    if (/(?:我|本人)[^，。？！?]{0,8}(?:欠|还|偿还|清偿)[^，。？！?]{0,10}(?:贷款|房贷|欠款|债务|钱)|(?:房贷|贷款|欠款|债务)[^，。？！?]{0,10}(?:还清|还完|结清|偿还)/.test(text)) return { routeId:'debt_repayment', evidence:'debtor-direction' };
    if (/(?:向我借|找我借|从我这里借|我[^，。？！?]{0,10}(?:借给|贷给|出借)|借出去)/.test(text)) return { routeId:'lend_money', evidence:'funds-outward' };
    if (/(?:我|本人)[^，。？！?]{0,8}(?:向|找|跟|从)[^，。？！?]{0,10}(?:借|周转)|(?:我|本人)[^，。？！?]{0,8}(?:申请|办)[^，。？！?]{0,6}(?:贷款|房贷|信贷)|(?:贷款|房贷|信贷)[^，。？！?]{0,10}(?:申请|获批|批下来)/.test(text)) return { routeId:'borrow_money', evidence:'funds-inward' };

    // Relationship semantics: existing marriage > marriage target > romance development.
    if (/(?:妻子|老婆|丈夫|老公|夫妻|已婚|婚后)/.test(text)) return { routeId:'marital_relationship', evidence:'existing-marriage' };
    if (/(?:结婚|婚事|亲事|领证|婚约|成为夫妻|结为夫妻|结婚计划)/.test(text)) return { routeId:'marriage_match', evidence:'marriage-target' };
    if (/(?:恋人|情侣|恋爱|表白|暧昧|在一起|恋爱方面|女朋友|男朋友)/.test(text)) return { routeId:'relationship_development', evidence:'romantic-development' };

    // Investment semantics before ordinary purchase semantics.
    const investment = /(?:股票|基金|ETF|etf|债券|期货|外汇|投资项目|投资机会|投资标的|仓位|持仓)/.test(text);
    if (investment) {
      if (/(?:继续持有|继续拿|加仓|减仓|持有[^，。？！?]{0,10}还是[^，。？！?]{0,10}卖|该不该减仓|要不要减仓|要不要继续留|犹豫[^，。？！?]{0,8}退出)/.test(text)) return { routeId:'investment_position_decision', evidence:'position-choice' };
      if (/(?:赎回|清仓|套现|变现|全部卖掉|全部卖出|退出投资|投资退出|卖掉套现|卖出套现)/.test(text)) return { routeId:'investment_liquidation', evidence:'liquidation-action' };
      if (/(?:走势|净值|价格[^，。？！?]{0,8}(?:涨|跌)|会不会涨|会不会跌|继续涨|继续跌|偏涨|偏跌|偏强|偏弱)/.test(text)) return { routeId:'investment_price_trend', evidence:'price-trend' };
      if (/(?:适不适合|合不合适|值不值得投资|要不要投资|是否要投|参与[^，。？！?]{0,8}合适|进场[^，。？！?]{0,8}合适)/.test(text)) return { routeId:'investment_suitability', evidence:'investment-suitability' };
      if (/(?:盈利|利润|收益|赚钱|回本)/.test(text)) return { routeId:'investment_profit', evidence:'investment-profit' };
    }

    // Income semantics.
    if (/(?:年终奖|奖金|绩效奖|项目奖励|季度奖励|奖励金)/.test(text)) return { routeId:'income_bonus', evidence:'bonus-income' };
    if (/(?:工资|薪水|薪资|月薪|调薪|加薪|涨薪|基本工资|固定薪酬)/.test(text)) return { routeId:'income_salary', evidence:'salary-income' };

    // Delivery before purchase.
    if (/(?:快递|包裹|发货|寄出|寄来|运输途中|送达|送到|到手|收到)/.test(text) && /(?:订单|商品|键盘|耳机|相机|显示器|平板|镜头|包裹|快递|发货|寄出|运输)/.test(text)) return { routeId:'receive_item', evidence:'delivery-event' };

    // Commercial event semantics.
    if (/(?:进货|补货|补库存|采购库存|经营用货[^，。？！?]{0,8}进库)/.test(text)) return { routeId:'inventory_purchase', evidence:'inventory-in' };
    if (/(?:库存|存货|尾货)[^，。？！?]{0,12}(?:卖|出货|出清|清掉|没清|压着)|(?:清库存|清仓库)/.test(text)) return { routeId:'inventory_sale', evidence:'inventory-out' };
    if (/(?:合伙|合伙人|共同经营|一起经营|搭档[^，。？！?]{0,8}经营)/.test(text)) return { routeId:'partnership', evidence:'partnership' };
    if (/(?:这笔批发|这单商业|商业订单|商业交易|批发生意|批发单|采购合同)[^，。？！?]{0,18}(?:成交|签|做成|谈成|落地)|(?:客户|买家|供应商)[^，。？！?]{0,16}(?:订单|交易|成交)/.test(text)) return { routeId:'commercial_transaction', evidence:'bounded-commercial-trade' };
    if (/(?:经营|门店|网店|工作室|开的[^，。？！?]{0,5}店|这家[^，。？！?]{0,5}店|长期生意)[^，。？！?]{0,16}(?:盈利|利润|亏|赚钱|收益|经营状况|稳定)/.test(text)) return { routeId:'business_operation', evidence:'business-operation' };
    if (/(?:财运|总体财务|整体财务|综合进账|总体钱财|整体收支|手头[^，。？！?]{0,8}(?:紧|宽裕|充裕))/.test(text)) return { routeId:'financial_fortune', evidence:'overall-finance' };

    // Ordinary item purchase is last, after investment/delivery guards.
    if (/(?:买|入手|换)[^，。？！?]{0,8}(?:投影仪|空气净化器|耳机|路由器|显示器|相机|平板|手机|电脑|键盘|镜头)|(?:投影仪|空气净化器|耳机|路由器|显示器|相机|平板|手机|电脑|键盘|镜头)[^，。？！?]{0,10}(?:值得买|该不该买|好不好|合不合适|入手)/.test(text)) return { routeId:'item_purchase', evidence:'ordinary-purchase' };
    return null;
  }

  GuiJia.liuyaoSemanticRouteArbitrationV09 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
