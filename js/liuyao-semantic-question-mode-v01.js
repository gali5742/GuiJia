(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

  const OUTCOME_OR_DECISION = /(?:能不能|会不会|有没有|是否|能否|该不该|要不要|值不值得|适不适合|合不合适|可不可以|好不好|顺不顺利|能否顺利|什么时候(?:能|会|可以)|多久(?:能|会|可以))/;
  const DIRECT_DEFINITION_OR_EXPLANATION = /(?:是什么|什么意思|何谓|定义(?:是|为)?|含义(?:是|为)?|怎么理解|如何理解|怎样理解|怎么解释|如何解释|怎样解释)/;
  const REQUIREMENTS_OR_LIST = /(?:包括什么|包含什么|包括哪些|包含哪些|都有什么|都有哪些|主要有哪些|需要准备哪些|需要提交哪些|需要提供哪些|需要携带哪些|要准备哪些|要提交哪些|要提供哪些)/;
  const GENERALIZED_HOW_TO = /(?:一般|通常|一般来说|通常情况下|正常情况下|原则上)[^，。？！?]{0,16}(?:怎么|如何|怎样)[^，。？！?]{0,18}/;
  const EXPLICIT_METHOD = /(?:怎么|如何|怎样)[^，。？！?]{0,10}(?:计算|核算|分析|统计|分类|整理|填写|撰写|编写|写进|写入|记录|约定|解释|理解|操作|办理|准备|提交|提供|设置|安排|处理|重新[^，。？！?]{0,6})/;
  const ASSISTANT_INFORMATION_REQUEST = /(?:请|能不能|可以不可以|可不可以)?(?:告诉|解释|介绍|说明)[^，。？！?]{0,16}(?:什么|怎么|如何|哪些|区别|含义|定义|流程|条件|材料)/;

  function classify(question, suppliedEvidence) {
    const text = normalize(question);
    const currentTargets = Array.isArray(suppliedEvidence?.currentTargets) ? suppliedEvidence.currentTargets : [];
    const reasons = [];

    if (currentTargets.length > 0) {
      reasons.push('supported_current_target');
      return Object.freeze({ version:VERSION, mode:'outcome_or_decision', reasons:Object.freeze(reasons) });
    }

    const directDefinition = DIRECT_DEFINITION_OR_EXPLANATION.test(text);
    const requirementsOrList = REQUIREMENTS_OR_LIST.test(text);
    const generalizedHowTo = GENERALIZED_HOW_TO.test(text);
    const explicitMethod = EXPLICIT_METHOD.test(text);
    const assistantInformationRequest = ASSISTANT_INFORMATION_REQUEST.test(text);
    if (directDefinition) reasons.push('definition_or_explanation_form');
    if (requirementsOrList) reasons.push('requirements_or_list_form');
    if (generalizedHowTo) reasons.push('generalized_how_to_form');
    if (explicitMethod) reasons.push('explicit_method_form');
    if (assistantInformationRequest) reasons.push('assistant_information_request_form');

    if (reasons.length > 0) {
      return Object.freeze({ version:VERSION, mode:'information_request', reasons:Object.freeze(reasons) });
    }

    if (OUTCOME_OR_DECISION.test(text)) {
      reasons.push('outcome_or_decision_modality');
      return Object.freeze({ version:VERSION, mode:'outcome_or_decision', reasons:Object.freeze(reasons) });
    }

    return Object.freeze({ version:VERSION, mode:'undetermined', reasons:Object.freeze([]) });
  }

  GuiJia.liuyaoSemanticQuestionModeV01 = Object.freeze({ version:VERSION, classify });
})(typeof window !== 'undefined' ? window : globalThis);
