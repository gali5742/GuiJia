(function (global) {
  'use strict';

  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1';
  const POLICY_ID = 'liuyao_divination_policy';
  const DISALLOWED_CATEGORY = 'health_or_disease_divination';

  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
  const has = (text, pattern) => pattern.test(text);

  // Policy is focus-based rather than keyword-based. Medical words may be background
  // for an otherwise supported employment, insurance, purchase, or investment question.
  const BODY_OR_HEALTH = /(?:身体|健康状况|身体状况|病情|疾病|这个病|这种病|生病|患病|病症|症状|疼痛|头疼|头痛|腹痛|胃痛|发烧|发热|咳嗽|眩晕|失眠|伤势|感染|炎症)/;
  const HEALTH_RESULT = /(?:好转|转好|康复|恢复|痊愈|治好|治愈|恶化|加重|严重|复发|正常|异常|有问题|没问题|危险|有危险|有效|效果|疗效)/;
  const HEALTH_QUESTION = /(?:能不能|会不会|是否|能否|是不是|有没有|有无|怎么样|怎样|如何|多久|什么时候|吗|呢)/;
  const MEDICAL_INTERVENTION = /(?:手术|治疗|用药|吃药|服药|药物治疗|化疗|放疗|康复治疗|住院治疗)/;
  const INTERVENTION_RESULT = /(?:顺利|成功|有效|效果|疗效|好转|康复|恢复|治好|治愈|风险|危险)/;
  const DIAGNOSTIC_TEST = /(?:体检|医学检查|化验|验血|病理|CT|核磁|磁共振|B超|超声|胃镜|肠镜|诊断)/i;
  const DIAGNOSTIC_RESULT = /(?:正常|异常|有问题|没问题|查出|发现|确诊|诊断出|结果[^，。？！?]{0,8}(?:好|坏|正常|异常|问题))/;
  const DIAGNOSIS_FOCUS = /(?:(?:是不是|会不会|是否|可能不可能|有可能)[^，。？！?]{0,10}(?:病|疾病|癌|肿瘤|感染|炎症)|(?:是什么病|得了什么病|患了什么病))/;

  function isHealthOrDiseaseDivination(text) {
    if (!text) return false;

    const healthSubject = has(text, BODY_OR_HEALTH);
    const healthQuestion = has(text, HEALTH_QUESTION);
    const healthResult = has(text, HEALTH_RESULT);

    // General condition or prognosis: “身体怎么样”“这个病多久能好”“病情会不会恶化”.
    if (healthSubject && healthQuestion && (healthResult || /(?:身体|健康状况|身体状况|病情|这个病|这种病)/.test(text))) return true;

    // Diagnosis from a symptom or condition: “头疼会不会是某种病”.
    if (healthSubject && has(text, DIAGNOSIS_FOCUS)) return true;

    // Treatment / surgery outcome, but not administrative questions such as scheduling.
    if (has(text, MEDICAL_INTERVENTION) && healthQuestion && has(text, INTERVENTION_RESULT)) return true;

    // Medical test outcome, but not purchase of a check-up package or when a report is delivered.
    if (has(text, DIAGNOSTIC_TEST) && healthQuestion && has(text, DIAGNOSTIC_RESULT)) return true;

    return false;
  }

  function evaluate(question) {
    const text = normalize(question);
    const disallowed = isHealthOrDiseaseDivination(text);
    if (disallowed) {
      return Object.freeze({
        version: VERSION,
        policyId: POLICY_ID,
        status: 'disallowed',
        allowed: false,
        reasonCode: 'disallowed_health_or_disease_divination',
        category: DISALLOWED_CATEGORY
      });
    }
    return Object.freeze({
      version: VERSION,
      policyId: POLICY_ID,
      status: 'allowed',
      allowed: true,
      reasonCode: 'allowed_no_disallowed_policy_match'
    });
  }

  GuiJia.liuyaoDivinationPolicyGateV01 = Object.freeze({
    version: VERSION,
    policyId: POLICY_ID,
    evaluate
  });
})(typeof window !== 'undefined' ? window : globalThis);
