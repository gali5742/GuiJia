(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.4-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const add = (set, value, condition) => { if (condition) set.add(value); };

  function extract(question) {
    const baseExtractor = GuiJia.liuyaoSemanticRouteEvidenceV03;
    if (!baseExtractor?.extract) throw new Error('Route Semantic Evidence v0.3 未加载');
    const base = baseExtractor.extract(question);
    const text = normalize(question);
    const currentTargets = Array.isArray(base.currentTargets) ? base.currentTargets : [];
    const unsupportedTargets = new Set(base.unsupportedTargets || []);
    const hasSupportedCurrentTarget = currentTargets.length > 0;

    // v0.4 expands information-target coverage at the semantic-object level. These patterns
    // describe classes of documentation/governance/accounting questions; they are not route-
    // specific exceptions. A positively extracted supported current outcome still wins.
    const governanceOrDocumentationSubject = /(?:职责分工|职责安排|岗位职责|权责分工|权责安排|权限分配|工作分工|利益分配|合伙协议|合作协议|协议模板|合同模板|协议条款|合同条款|条款写法|章程)/.test(text);
    const governanceOrDocumentationInfoIntent = /(?:(?:怎么|如何|怎样|通常|一般|应该|需要)[^，。？！?]{0,12}(?:写|分|安排|约定|规定|起草|拟定|设置|明确)|(?:模板|范本|写法|怎么写|如何写|怎样写|怎么分|如何分|怎样分))/.test(text);
    const explicitGovernanceOrDocumentationInfo = governanceOrDocumentationSubject && governanceOrDocumentationInfoIntent;

    const accountingClassificationSubject = /(?:账龄|账龄分析|会计科目|会计分类|账务分类|账务处理|核算口径|入账|记账|应收账款|应付账款|应付款|存货计价|成本归类|会计凭证|记账凭证)/.test(text);
    const accountingClassificationInfoIntent = /(?:(?:怎么|如何|怎样|通常|一般|应该|需要|按什么)[^，。？！?]{0,14}(?:分类|归类|记录|记账|入账|核算|计算|处理|划分)|(?:分哪类|分几类|属于哪类|归哪类|分类标准|分类规则|核算方法|记账方法|入账方法|会计上怎么|账务上怎么))/.test(text);
    const explicitAccountingClassificationInfo = accountingClassificationSubject && accountingClassificationInfoIntent;

    if (!hasSupportedCurrentTarget) {
      add(unsupportedTargets, 'governance_or_documentation_information', explicitGovernanceOrDocumentationInfo);
      add(unsupportedTargets, 'administrative_or_accounting_information', explicitAccountingClassificationInfo);
    }

    return Object.freeze({
      version:VERSION,
      text:base.text || text,
      domains:Object.freeze([...(base.domains || [])]),
      events:Object.freeze([...(base.events || [])]),
      objects:Object.freeze([...(base.objects || [])]),
      directions:Object.freeze([...(base.directions || [])]),
      relations:Object.freeze([...(base.relations || [])]),
      goals:Object.freeze([...(base.goals || [])]),
      background:Object.freeze([...(base.background || [])]),
      currentTargets:Object.freeze([...currentTargets]),
      unsupportedTargets:Object.freeze([...unsupportedTargets])
    });
  }

  GuiJia.liuyaoSemanticRouteEvidenceV04 = Object.freeze({ version:VERSION, extract });
})(typeof window !== 'undefined' ? window : globalThis);
