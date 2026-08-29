(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const has = (text, pattern) => pattern.test(text);
  const pass = (routeId, evidence) => ({ version:VERSION, routeId, passed:true, confidence:'strong', evidence:[...evidence], reasonCode:null });
  const fail = (routeId, reasonCode, evidence=[]) => ({ version:VERSION, routeId, passed:false, confidence:'none', evidence:[...evidence], reasonCode });

  const INVESTMENT = /(?:股票|基金|ETF|etf|债券|期货|外汇|投资项目|投资机会|投资标的|仓位|持仓|入股)/;
  const PRODUCT = /(?:电脑|手机|耳机|相机|显示器|键盘|平板|路由器|手表|镜头|投影仪|空气净化器|扫地机器人|家电|设备|产品|商品)/;
  const DELIVERY_OBJECT = /(?:订单|包裹|快递件|货物|商品|电脑|手机|耳机|相机|显示器|键盘|平板|路由器|镜头|设备|机器)/;

  function evaluate(routeId, question) {
    const text = normalize(question);
    if (!text) return fail(routeId, 'empty_question');
    switch (routeId) {
      case 'financial_fortune': {
        const anchor = has(text, /(?:财运|钱财|财务|收支|手头[^，。？！?]{0,8}(?:宽裕|充裕|吃紧|紧张|松)|(?:整体|总体|综合)[^，。？！?]{0,6}(?:进账|收入|财务|钱财|收支))/);
        return anchor ? pass(routeId,['overall-finance-anchor']) : fail(routeId,'missing_finance_anchor');
      }
      case 'business_operation': {
        const domain = has(text, /(?:经营|门店|店铺|网店|咖啡店|工作室|开的[^，。？！?]{0,6}店|这间[^，。？！?]{0,6}店|这家[^，。？！?]{0,6}店|生意)/);
        const event = has(text, /(?:盈利|利润|亏损|扭亏|赚钱|经营|业绩|稳定|状况)/);
        return domain && event ? pass(routeId,['business-anchor','operation-outcome']) : fail(routeId, !domain?'missing_business_anchor':'missing_operation_semantics');
      }
      case 'commercial_transaction': {
        const bounded = has(text, /(?:批发(?:单|订单|交易)|商业(?:订单|交易)|采购(?:单|合同)|这笔[^，。？！?]{0,8}(?:交易|订单)|这单[^，。？！?]{0,8}(?:订单|交易)|(?:客户|买家|供应商)[^，。？！?]{0,10}(?:订单|交易|批发))/);
        return bounded ? pass(routeId,['bounded-commercial-trade']) : fail(routeId,'missing_bounded_trade');
      }
      case 'inventory_purchase': {
        const anchor = has(text, /(?:进货|补货|补库存|采购库存|补齐库存|经营用货[^，。？！?]{0,8}(?:采购|进仓)|门店[^，。？！?]{0,10}(?:进|补)[^，。？！?]{0,4}货)/);
        return anchor ? pass(routeId,['inventory-in']) : fail(routeId,'missing_inventory_purchase_anchor');
      }
      case 'inventory_sale': {
        const stock = has(text, /(?:库存|存货|尾货|积压货)/);
        const out = has(text, /(?:卖完|卖掉|出清|清掉|出货|清库存|清仓库)/);
        return stock && out ? pass(routeId,['inventory-stock','inventory-out']) : fail(routeId,!stock?'missing_inventory_anchor':'missing_inventory_sale_action');
      }
      case 'borrow_money': {
        const inward = has(text, /(?:(?:我|本人|这次)?(?:向|跟|从|找)(?:家里|家人|朋友|同事|亲戚|表哥|表姐|姐姐|哥哥|父母|银行)[^，。？！?]{0,10}(?:借|周转)|(?:我|本人)[^，。？！?]{0,8}(?:申请|办理?)[^，。？！?]{0,8}(?:贷款|房贷|信贷|经营贷)|(?:贷款|房贷|信贷|经营贷)[^，。？！?]{0,10}(?:申请|放款|获批|批下来))/);
        return inward ? pass(routeId,['funds-inward']) : fail(routeId,'missing_funds_inward');
      }
      case 'lend_money': {
        const outward = has(text, /(?:向我借|找我借|从我这里借|我[^，。？！?]{0,10}(?:借给|贷给|出借)|借出去)/);
        return outward ? pass(routeId,['funds-outward']) : fail(routeId,'missing_funds_outward');
      }
      case 'debt_collection': {
        const creditor = has(text, /(?:欠我|欠我的|应收(?:账)?款|应收货款|拖欠我的|借给[^，。？！?]{0,10}的钱|借出去的钱|催款|讨债|追债|追回[^，。？！?]{0,8}(?:钱|款)|收回[^，。？！?]{0,8}(?:钱|款))/);
        return creditor ? pass(routeId,['creditor-direction']) : fail(routeId,'missing_creditor_direction');
      }
      case 'debt_repayment': {
        const debtor = has(text, /(?:(?:我|本人)[^，。？！?]{0,8}(?:欠|还|偿还|清偿)[^，。？！?]{0,10}(?:贷款|房贷|消费贷|欠款|债务|信用卡欠款|钱)|(?:房贷|贷款|消费贷|欠款|债务|信用卡欠款)[^，。？！?]{0,12}(?:还清|还完|结清|偿还|清掉))/);
        return debtor ? pass(routeId,['debtor-direction']) : fail(routeId,'missing_debtor_direction');
      }
      case 'partnership': {
        const partner = has(text, /(?:合伙|合伙人|共同经营|一起经营|搭档[^，。？！?]{0,8}(?:经营|开店|做生意))/);
        return partner ? pass(routeId,['partnership-anchor']) : fail(routeId,'missing_partnership_anchor');
      }
      case 'investment_profit': {
        const domain = has(text, INVESTMENT), goal = has(text, /(?:盈利|利润|收益|赚钱|回本|正收益)/);
        return domain && goal ? pass(routeId,['investment-anchor','profit-goal']) : fail(routeId,!domain?'missing_investment_anchor':'missing_profit_goal');
      }
      case 'investment_liquidation': {
        const domain = has(text, INVESTMENT), action = has(text, /(?:赎回|清仓|套现|变现|全部卖掉|全部卖出|退出投资|清掉[^，。？！?]{0,6}仓位|仓位[^，。？！?]{0,8}清掉)/);
        return domain && action ? pass(routeId,['investment-anchor','liquidation-action']) : fail(routeId,!domain?'missing_investment_anchor':'missing_liquidation_action');
      }
      case 'investment_suitability': {
        const domain = has(text, INVESTMENT), choice = has(text, /(?:适不适合|合不合适|值不值得(?:投资|参与)|该不该投|要不要投|值得参与|适合自己)/);
        return domain && choice ? pass(routeId,['investment-anchor','suitability-goal']) : fail(routeId,!domain?'missing_investment_anchor':'missing_suitability_goal');
      }
      case 'investment_position_decision': {
        const domain = has(text, INVESTMENT), choice = has(text, /(?:继续持有|继续拿|继续留|减仓|加仓|持仓[^，。？！?]{0,8}(?:减少|减掉)|持有[^，。？！?]{0,10}还是|要不要[^，。？！?]{0,8}(?:卖|减仓|继续)|应该[^，。？！?]{0,8}(?:持有|减仓|继续)|考虑[^，。？！?]{0,8}(?:减仓|加仓|减少|减掉))/);
        return domain && choice ? pass(routeId,['investment-anchor','position-choice']) : fail(routeId,!domain?'missing_investment_anchor':'missing_position_choice');
      }
      case 'investment_price_trend': {
        const domain = has(text, INVESTMENT), trend = has(text, /(?:走势|净值|价格|涨|跌|上行|回落|偏强|偏弱)/);
        return domain && trend ? pass(routeId,['investment-anchor','price-trend']) : fail(routeId,!domain?'missing_investment_anchor':'missing_price_trend');
      }
      case 'income_salary': {
        const salary = has(text, /(?:工资|薪水|薪资|月薪|基本工资|固定工资|固定薪酬|调薪|加薪|涨薪)/);
        return salary ? pass(routeId,['salary-anchor']) : fail(routeId,'missing_salary_anchor');
      }
      case 'income_bonus': {
        const bonus = has(text, /(?:奖金|年终奖|绩效奖|绩效奖金|项目奖励|奖励金|季度奖励)/);
        return bonus ? pass(routeId,['bonus-anchor']) : fail(routeId,'missing_bonus_anchor');
      }
      case 'receive_item': {
        const delivery = has(text, /(?:收到|到手|送到|送达|发货|寄出|寄到|快递|物流|包裹)/);
        const object = has(text, DELIVERY_OBJECT);
        return delivery && object ? pass(routeId,['delivery-event','delivery-object-anchor']) : fail(routeId,!delivery?'missing_delivery_event':'missing_delivery_object_anchor');
      }
      case 'item_purchase': {
        const purchase = has(text, /(?:购买|购入|入手|值不值得买|值得入手|买下来|准备购买|现在买)/), object = has(text, PRODUCT);
        return purchase && object ? pass(routeId,['purchase-event','purchase-object-anchor']) : fail(routeId,!purchase?'missing_purchase_event':'missing_purchase_object_anchor');
      }
      case 'relationship_development': {
        const romance = has(text, /(?:恋人|情侣|恋爱|表白|暧昧|在一起|谈恋爱|恋爱发展)/);
        const existing = has(text, /(?:妻子|老婆|丈夫|老公|已婚|夫妻关系|这段婚姻)/);
        const marriage = has(text, /(?:结婚|婚事|亲事|领证|婚约|成为夫妻)/);
        return romance && !existing && !marriage ? pass(routeId,['romantic-development']) : fail(routeId, existing||marriage?'relationship_stage_conflict':'missing_romantic_anchor');
      }
      case 'marriage_match': {
        const marriage = has(text, /(?:结婚|婚事|亲事|领证|婚约|成为夫妻|登记结婚|婚礼)/), existing = has(text, /(?:妻子|老婆|丈夫|老公|已婚|夫妻关系|这段婚姻)/);
        return marriage && !existing ? pass(routeId,['marriage-target']) : fail(routeId,existing?'existing_marriage_conflict':'missing_marriage_target');
      }
      case 'marital_relationship': {
        const existing = has(text, /(?:妻子|老婆|丈夫|老公|已婚|夫妻关系|这段婚姻|婚姻关系|我们夫妻)/);
        return existing ? pass(routeId,['existing-marriage']) : fail(routeId,'missing_existing_marriage');
      }
      default:
        return fail(routeId,'unsupported_route_identity_contract');
    }
  }

  GuiJia.liuyaoSemanticRouteIdentityV01 = Object.freeze({ version:VERSION, evaluate });
})(typeof window !== 'undefined' ? window : globalThis);
