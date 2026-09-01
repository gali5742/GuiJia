(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.5-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

  function extract(question) {
    const baseExtractor = GuiJia.liuyaoSemanticRouteEvidenceV04;
    if (!baseExtractor?.extract) throw new Error('Route Semantic Evidence v0.4 未加载');
    const base = baseExtractor.extract(question);
    const text = normalize(question);
    const currentTargets = Array.isArray(base.currentTargets) ? base.currentTargets : [];
    const unsupportedTargets = new Set(base.unsupportedTargets || []);
    const hasSupportedCurrentTarget = currentTargets.length > 0;

    // Candidate v0.6 intentionally reuses the existing rule/procedure information family.
    // These are generic question-shape extensions, not finance/marriage/etc route exceptions.
    const requirementSubject = /(?:申请条件|办理条件|登记条件|注册条件|资格条件|准入条件|使用条件|参与条件|所需条件|相关要求|办理要求|申请要求|登记要求|手续要求)/.test(text);
    const requirementListIntent = /(?:包括什么|包含什么|包括哪些|包含哪些|都有什么|都有哪些|主要包括什么|主要包括哪些|通常包括什么|通常包括哪些|一般包括什么|一般包括哪些)/.test(text);
    const explicitRequirementListInformation = requirementSubject && requirementListIntent;

    const procedureAction = /(?:办理|申请|登记|注册|备案|开户|过户|签约|申报|认证|提交申请)/.test(text);
    const requiredMaterialIntent = /(?:需要|需|要|应当|应该|通常需要|一般需要)[^，。？！?]{0,10}(?:准备|提交|提供|携带|出示)?[^，。？！?]{0,8}(?:什么|哪些|哪几种)[^，。？！?]{0,8}(?:材料|资料|证件|文件|证明)/.test(text);
    const explicitRequiredMaterialInformation = procedureAction && requiredMaterialIntent;

    if (!hasSupportedCurrentTarget && (explicitRequirementListInformation || explicitRequiredMaterialInformation)) {
      unsupportedTargets.add('rule_or_procedure_information');
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

  GuiJia.liuyaoSemanticRouteEvidenceV05 = Object.freeze({ version:VERSION, extract });
})(typeof window !== 'undefined' ? window : globalThis);
