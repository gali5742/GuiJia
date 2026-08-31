(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.3-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const add = (set, value, condition) => { if (condition) set.add(value); };

  function extract(question) {
    const baseExtractor = GuiJia.liuyaoSemanticRouteEvidenceV02;
    if (!baseExtractor?.extract) throw new Error('Route Semantic Evidence v0.2 未加载');
    const base = baseExtractor.extract(question);
    const text = normalize(question);
    const unsupportedTargets = new Set(base.unsupportedTargets || []);
    const currentTargets = Array.isArray(base.currentTargets) ? base.currentTargets : [];
    const hasSupportedCurrentTarget = currentTargets.length > 0;

    // These are explicit information-seeking targets, not mere mentions of rules/fees/admin concepts.
    // A positively extracted supported current target wins so that e.g. “扣完手续费还能不能盈利” remains routable.
    const explicitRuleOrProcedureInfo = (
      /(?:规则|规定|流程|手续|步骤|办理方式|申请条件|操作方法|截止时间|截止日期|受理时间|申报时间|交易时间|到账规则|赎回规则|购买规则)/.test(text)
      && /(?:是什么|有哪些|需要什么|怎么|如何|怎样|几点|几号|什么时候|多久|多少天|按什么|怎么算|是否要求|有没有要求|截止)/.test(text)
    );
    const explicitFeeOrTaxInfo = (
      /(?:手续费|佣金|托管费|管理费|服务费|税|税率|印花税|费率|收费标准|扣费|费用)/.test(text)
      && /(?:多少|怎么收|如何收|怎么算|如何算|费率|税率|收费标准|标准是多少|现在是多少|按什么)/.test(text)
    );
    const explicitAdministrativeOrAccountingInfo = (
      /(?:工资单|工资条|账单|对账单|明细|扣款|扣税|个税|社保|结算单|发票|记账|核算|会计处理)/.test(text)
      && /(?:对不对|有没有错|怎么算|如何算|怎么处理|如何处理|多少|为什么|明细|计算|核算|扣了|扣得)/.test(text)
    );

    if (!hasSupportedCurrentTarget) {
      add(unsupportedTargets, 'rule_or_procedure_information', explicitRuleOrProcedureInfo);
      add(unsupportedTargets, 'fee_or_tax_information', explicitFeeOrTaxInfo);
      add(unsupportedTargets, 'administrative_or_accounting_information', explicitAdministrativeOrAccountingInfo);
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

  GuiJia.liuyaoSemanticRouteEvidenceV03 = Object.freeze({ version:VERSION, extract });
})(typeof window !== 'undefined' ? window : globalThis);
