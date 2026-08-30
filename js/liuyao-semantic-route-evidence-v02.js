(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const add = (set, value, condition) => { if (condition) set.add(value); };

  function extract(question) {
    const baseExtractor = GuiJia.liuyaoSemanticRouteEvidenceV01;
    if (!baseExtractor?.extract) throw new Error('Route Semantic Evidence v0.1 未加载');
    const base = baseExtractor.extract(question);
    const text = normalize(question);
    const domains = new Set(base.domains || []);
    const events = new Set(base.events || []);
    const objects = new Set(base.objects || []);
    const directions = new Set(base.directions || []);
    const relations = new Set(base.relations || []);
    const goals = new Set(base.goals || []);
    const background = new Set(base.background || []);
    const currentTargets = new Set(base.currentTargets || []);
    const unsupportedTargets = new Set();

    const salary = /(?:工资|薪水|薪资|月薪|底薪|基本工资|固定工资|固定薪酬|薪酬)/.test(text);
    const bonus = /(?:奖金|年终奖|绩效奖|绩效奖金|项目奖励|奖励金|季度奖励|绩效钱|奖励钱)/.test(text);
    const salaryOutcome = salary && /(?:调薪|涨薪|加薪|上调|调高|提高|增加|上涨|降低|减少|发放|发下来|到账|拿到|收到|多拿|少拿|多少|变化|变多|变少)/.test(text);
    const bonusOutcome = bonus && /(?:发放|发下来|到账|拿到|收到|分到|兑现|增加|减少|变多|变少|高于|低于|多少)/.test(text);
    const salaryAdministration = salary && /(?:工资单|工资条|扣税|扣款|个税|社保|明细|计算|算对|算错)/.test(text);
    const bonusPolicy = bonus && /(?:制度|方案|规则|政策|设计|公平|合理)/.test(text);
    add(currentTargets, 'salary_income', salaryOutcome && !salaryAdministration);
    add(currentTargets, 'bonus_income', bonusOutcome && !bonusPolicy);
    add(unsupportedTargets, 'salary_administration', salaryAdministration);
    add(unsupportedTargets, 'bonus_policy', bonusPolicy);

    const transactionAnchor = /(?:这笔|这单|这一单|这一笔|这份|这个)?(?:商业|批发|采购)?(?:交易|订单|合同|买卖|生意)|(?:这单|这一单|这笔买卖)/.test(text);
    const transactionOutcome = transactionAnchor && /(?:成交|签下|签成|签下来|签约|敲定|谈成|落地|完成|做成|成不成|能不能成|能否成)/.test(text);
    const contractClauseReview = /(?:合同|协议)[^，。？！?]{0,12}(?:条款|违约|手续费|风险|责任|合法|有没有问题|是否有问题|审查)/.test(text);
    add(domains, 'commerce', transactionOutcome);
    add(events, 'commercial_transaction', transactionOutcome);
    add(currentTargets, 'commercial_transaction', transactionOutcome && !contractClauseReview);
    add(unsupportedTargets, 'contract_clause_review', contractClauseReview);

    const smallBusiness = /(?:小买卖|小铺子|小店|摊子|摊位)/.test(text);
    const operationOutcome = smallBusiness && /(?:做得下去|撑起来|撑下去|维持下去|继续做|开下去|经营下去|做起来)/.test(text);
    add(domains, 'business', smallBusiness);
    add(events, 'business_operation', operationOutcome);

    const genericBorrowInward = /(?:(?:缺|需要|想要)[^，。？！?]{0,8}(?:周转款|周转钱|一笔钱|一笔款)[^，。？！?]{0,16}(?:拿到|筹到|获得|弄到)|(?:有没有人|有人|谁)[^，。？！?]{0,12}(?:愿意)?(?:先)?(?:给我|借我)[^，。？！?]{0,10}(?:钱|款)[^，。？！?]{0,8}周转)/.test(text);
    add(directions, 'funds_inward', genericBorrowInward);

    return Object.freeze({
      version:VERSION,
      text:base.text || text,
      domains:Object.freeze([...domains]),
      events:Object.freeze([...events]),
      objects:Object.freeze([...objects]),
      directions:Object.freeze([...directions]),
      relations:Object.freeze([...relations]),
      goals:Object.freeze([...goals]),
      background:Object.freeze([...background]),
      currentTargets:Object.freeze([...currentTargets]),
      unsupportedTargets:Object.freeze([...unsupportedTargets])
    });
  }

  GuiJia.liuyaoSemanticRouteEvidenceV02 = Object.freeze({ version:VERSION, extract });
})(typeof window !== 'undefined' ? window : globalThis);
