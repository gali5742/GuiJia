(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (!GuiJia.liuyaoIntent?.parseDivinationIntent) throw new Error('liuyao-intent.js must be loaded before liuyao-semantic-parser.js');

    const INTENT_SCHEMA_VERSION = '0.1';
    const ADAPTER_VERSION = '0.2';
    const FORBIDDEN_TRADITIONAL_KEYS = new Set([
        'sixRelative','six_relative','useGod','use_god','yao','yaoTarget','yao_target',
        'shiYing','shi_ying','traditionalRole','traditional_role','selector','semanticDuty'
    ]);

    let nlpProvider = null;

    const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

    const findForbiddenKey = (value, path = '$') => {
        if (!value || typeof value !== 'object') return null;
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i += 1) {
                const found = findForbiddenKey(value[i], `${path}[${i}]`);
                if (found) return found;
            }
            return null;
        }
        for (const [key, child] of Object.entries(value)) {
            if (FORBIDDEN_TRADITIONAL_KEYS.has(key)) return { key, path:`${path}.${key}` };
            const found = findForbiddenKey(child, `${path}.${key}`);
            if (found) return found;
        }
        return null;
    };

    const validateIntent = (intent) => {
        const errors = [];
        if (!intent || typeof intent !== 'object') return { valid:false, errors:[{ code:'intent_not_object' }] };
        if (intent.version !== INTENT_SCHEMA_VERSION) errors.push({ code:'intent_version_mismatch', expected:INTENT_SCHEMA_VERSION, actual:intent.version });
        if (typeof intent.rawQuestion !== 'string' || !intent.rawQuestion.trim()) errors.push({ code:'raw_question_missing' });
        if (!['resolved','blocked'].includes(intent.status)) errors.push({ code:'invalid_intent_status', actual:intent.status });
        if (!Array.isArray(intent.goals)) errors.push({ code:'goals_not_array' });
        if (!Array.isArray(intent.participants)) errors.push({ code:'participants_not_array' });
        if (intent.status === 'resolved' && !intent.event?.type) errors.push({ code:'resolved_event_missing' });
        if (intent.semantics != null && typeof intent.semantics !== 'object') errors.push({ code:'semantics_not_object' });

        (intent.participants || []).forEach((participant, index) => {
            if (!participant || typeof participant !== 'object') {
                errors.push({ code:'participant_not_object', index });
                return;
            }
            if (!participant.role) errors.push({ code:'participant_role_missing', index });
            if (participant.sex && !['male','female','unknown'].includes(participant.sex)) errors.push({ code:'participant_sex_invalid', index, actual:participant.sex });
            if (participant.specificity && !['specific','generic','unknown'].includes(participant.specificity)) errors.push({ code:'participant_specificity_invalid', index, actual:participant.specificity });
        });

        const forbidden = findForbiddenKey(intent);
        if (forbidden) errors.push({ code:'traditional_mapping_leak', ...forbidden });
        return { valid:errors.length === 0, errors };
    };

    const normalizeNlpIntent = (payload, rawQuestion) => {
        const source = payload && typeof payload === 'object' && payload.intent && typeof payload.intent === 'object'
            ? payload.intent
            : payload;
        const intent = {
            version:INTENT_SCHEMA_VERSION,
            rawQuestion:String(rawQuestion || source?.rawQuestion || '').trim(),
            status:source?.status === 'blocked' ? 'blocked' : 'resolved',
            ...(source || {})
        };
        intent.version = INTENT_SCHEMA_VERSION;
        intent.rawQuestion = String(rawQuestion || intent.rawQuestion || '').trim();
        intent.goals = Array.isArray(intent.goals) ? intent.goals : [];
        intent.participants = Array.isArray(intent.participants) ? intent.participants : [];
        intent.ambiguities = Array.isArray(intent.ambiguities) ? intent.ambiguities : [];
        intent.semantics = intent.semantics && typeof intent.semantics === 'object' ? intent.semantics : {};
        intent.confidence = Number.isFinite(intent.confidence) ? intent.confidence : 0.8;
        return intent;
    };

    const parseTimeScope = (question) => {
        try {
            return GuiJia.questionTime?.parseQuestionTimeScope?.(String(question || ''), new Date()) || null;
        } catch (_error) {
            return null;
        }
    };

    const defaultSemantics = () => ({
        incomeType:'unknown',
        investmentAction:'none',
        investmentGoal:'unknown',
        investmentPosition:'unknown',
        deliveryMode:'unknown',
        purchaseGoal:'unknown',
        transactionPurpose:'unknown',
        romanticStage:'unknown',
        querentSex:'unknown',
        counterpartSex:'unknown',
        fortuneScope:'short_or_bounded'
    });

    const promoteResolvedIntent = (intent, question, overrides = {}) => ({
        version:INTENT_SCHEMA_VERSION,
        rawQuestion:String(question || intent?.rawQuestion || '').trim(),
        status:'resolved',
        goals:Array.isArray(overrides.goals) ? overrides.goals : Array.isArray(intent?.goals) && intent.goals.length ? intent.goals : [{ type:'outcome' }],
        event:overrides.event || intent?.event || { type:'unknown' },
        participants:Array.isArray(overrides.participants) ? overrides.participants : Array.isArray(intent?.participants) ? intent.participants : [],
        targetTime:overrides.targetTime !== undefined ? overrides.targetTime : (intent?.targetTime || parseTimeScope(question)),
        expectedState:overrides.expectedState !== undefined ? overrides.expectedState : (intent?.expectedState || ''),
        confidence:Number.isFinite(overrides.confidence) ? overrides.confidence : Number.isFinite(intent?.confidence) ? Math.max(intent.confidence, 0.86) : 0.86,
        ambiguities:Array.isArray(overrides.ambiguities) ? overrides.ambiguities : Array.isArray(intent?.ambiguities) ? intent.ambiguities.filter((item) => item.code !== 'missing_event' && item.code !== 'unknown_event') : [],
        semantics:{ ...defaultSemantics(), ...(intent?.semantics || {}), ...(overrides.semantics || {}) }
    });

    const isExplicitStockTrendQuery = (text) => {
        if (!/(?:股票|持股|持仓|大盘|基金|ETF|etf|期货|外汇)/.test(text)) return false;
        return /(?:走势|趋势|涨不涨|跌不跌|会不会(?:继续|还|再|仍然)?(?:涨|跌|上涨|下跌)|还会不会(?:涨|跌|上涨|下跌)|是否(?:继续|还|再)?(?:涨|跌|上涨|下跌)|(?:继续|还会|仍会|再)(?:涨|跌|上涨|下跌)|接下来[^，。？！?]{0,8}(?:涨|跌|上涨|下跌))/.test(text);
    };

    const isExplicitReceiveItemQuery = (text) => (
        /(?:买了|新买了|新买|购买了|订了|下单(?:买)?了)[^，。？！?]{0,30}(?:能不能|能否|会不会|是否)[^，。？！?]{0,10}(?:收到|拿到)/.test(text)
    );

    const isComparativeFinanceQuery = (text) => (
        /(?:今年|本年)[^，。？！?]{0,16}(?:比|较)[^，。？！?]{0,8}(?:去年|上年)[^，。？！?]{0,18}(?:赚|收入|收益|进账)[^，。？！?]{0,10}(?:更多|更高|多|增加)/.test(text)
        || /(?:今年|本年)[^，。？！?]{0,24}(?:赚|收入|收益|进账)[^，。？！?]{0,10}(?:比|较)[^，。？！?]{0,8}(?:去年|上年)[^，。？！?]{0,8}(?:更多|更高|多)/.test(text)
    );

    const isCompactExplicitRomance = (text) => (
        /(?:喜欢的|追求的)(?:这个|那个)?(?:女生|女性|女孩|男生|男性|男孩)[^，。？！?]{0,18}(?:会不会|能不能|能否|是否|会)[^，。？！?]{0,10}(?:接受我|愿意|喜欢我|和我在一起|发展)/.test(text)
    );

    const detectNlpRequirement = (question, intent) => {
        const text = normalize(question);
        const narrativeSignals = [
            /最近.*认识(?:了)?一个(?:男生|女生|男性|女性)/,
            /刚认识(?:了)?一个(?:男生|女生|男性|女性)/,
            /我对(?:他|她).*(?:好感|喜欢)/,
            /(?:他|她).*(?:对我|和我)/,
            /我们之间/,
            /想(?:算|看|问)(?:一下)?/,
            /有点好感/
        ].filter((pattern) => pattern.test(text)).length;
        const relationalOutcome = /(?:有没有|是否有|还有没有|会不会有).*(?:可能|机会)|(?:可能|机会)(?:吗|\?|？|$)/.test(text);
        const pronounChain = /(?:认识|遇到).*(?:男生|女生|男性|女性).*(?:他|她|我们)/.test(text);
        const crossClauseOpportunity = /(?:喜欢|有好感)[^，,。；;]{0,18}(?:一个|某个)?(?:男生|女生|男性|女性)[，,。；;][^，,。；;]{0,24}(?:我们|我和(?:他|她))[^，,。；;]{0,16}(?:机会|可能)/.test(text);
        const unknownButRelational = intent?.event?.type === 'unknown' && narrativeSignals >= 2 && relationalOutcome;
        return Boolean(crossClauseOpportunity || unknownButRelational || (narrativeSignals >= 3 && relationalOutcome) || (pronounChain && relationalOutcome));
    };

    const refineBaselineIntent = (question, originalIntent) => {
        const text = normalize(question);
        let intent = originalIntent;
        const schemaGaps = [];

        if (isExplicitReceiveItemQuery(text) && (intent?.status === 'blocked' || intent?.event?.type !== 'receive_item')) {
            intent = promoteResolvedIntent(intent, question, {
                goals:[{ type:'outcome' }],
                event:{ type:'receive_item' },
                expectedState:'received',
                confidence:0.9,
                ambiguities:[],
                semantics:{ deliveryMode:'unknown', transactionPurpose:'personal_purchase' }
            });
        }

        if (isComparativeFinanceQuery(text) && (intent?.status === 'blocked' || intent?.event?.type === 'unknown')) {
            intent = promoteResolvedIntent(intent, question, {
                goals:[{ type:'outcome' }],
                event:{ type:'financial_fortune' },
                expectedState:'increase',
                confidence:0.92,
                ambiguities:[],
                semantics:{ fortuneScope:'short_or_bounded' }
            });
        }
        if (isComparativeFinanceQuery(text)) {
            schemaGaps.push({
                code:'comparative_period_semantics',
                message:'已识别“目标期间相对参照期间”的财务比较，但 DivinationIntent v0.1 尚未定义 comparison 结构。',
                targetPeriod:'this_year',
                referencePeriod:'last_year',
                metric:'earnings',
                relation:'greater_than'
            });
        }

        if (intent?.status === 'resolved' && intent?.event?.type === 'investment' && isExplicitStockTrendQuery(text) && intent?.semantics?.investmentGoal !== 'price_trend') {
            intent = promoteResolvedIntent(intent, question, {
                expectedState:'price_trend',
                semantics:{ investmentGoal:'price_trend' }
            });
        }

        if (intent?.status === 'resolved' && intent?.event?.type === 'unknown' && isCompactExplicitRomance(text)) {
            intent = promoteResolvedIntent(intent, question, {
                goals:[{ type:'outcome' }],
                event:{ type:'relationship_development' },
                expectedState:'relationship_possible',
                confidence:0.9,
                ambiguities:[],
                semantics:{ romanticStage:'unestablished_interest' }
            });
            if (GuiJia.liuyaoParticipantResolver?.refineDivinationIntent) {
                intent = GuiJia.liuyaoParticipantResolver.refineDivinationIntent(intent);
            }
        }

        const requiresNlp = detectNlpRequirement(question, intent);
        const baselineFailures = [];
        if (!requiresNlp) {
            if (isExplicitStockTrendQuery(text) && intent?.semantics?.investmentGoal !== 'price_trend') baselineFailures.push({ code:'investment_price_trend_missed' });
            if (isExplicitReceiveItemQuery(text) && intent?.event?.type !== 'receive_item') baselineFailures.push({ code:'receive_item_missed' });
            if (isComparativeFinanceQuery(text) && intent?.event?.type !== 'financial_fortune') baselineFailures.push({ code:'comparative_finance_event_missed' });
            if (isCompactExplicitRomance(text) && intent?.event?.type !== 'relationship_development') baselineFailures.push({ code:'compact_romance_event_missed' });
            if (intent?.status === 'resolved' && intent?.event?.type === 'unknown') baselineFailures.push({ code:'unknown_event_after_baseline' });
        }

        return { intent, requiresNlp, schemaGaps, baselineFailures };
    };

    const parseBaseline = (question) => {
        const originalIntent = GuiJia.liuyaoIntent.parseDivinationIntent(question);
        const refined = refineBaselineIntent(question, originalIntent);
        const intent = refined.intent;
        const validation = intent ? validateIntent(intent) : { valid:true, errors:[] };
        return {
            intent,
            source:'baseline',
            adapterVersion:ADAPTER_VERSION,
            validation,
            diagnostics:{
                requiresNlp:refined.requiresNlp,
                schemaGaps:refined.schemaGaps,
                baselineFailures:refined.baselineFailures
            }
        };
    };

    const parseQuestionSync = (question, options = {}) => {
        if (options.intentOverride) {
            const intent = normalizeNlpIntent(options.intentOverride, question);
            const validation = validateIntent(intent);
            return {
                intent,
                source:'nlp_override',
                adapterVersion:ADAPTER_VERSION,
                validation,
                diagnostics:{ requiresNlp:false, schemaGaps:Array.isArray(options.schemaGaps) ? options.schemaGaps : [], baselineFailures:[] }
            };
        }
        return parseBaseline(question);
    };

    const parseQuestion = async (question, options = {}) => {
        if (options.intentOverride) return parseQuestionSync(question, options);
        if (!nlpProvider || options.preferNlp === false) return parseBaseline(question);
        try {
            const payload = await nlpProvider(String(question || ''), {
                intentSchemaVersion:INTENT_SCHEMA_VERSION,
                adapterVersion:ADAPTER_VERSION
            });
            const intent = normalizeNlpIntent(payload, question);
            const validation = validateIntent(intent);
            if (!validation.valid && options.allowBaselineFallback !== false) {
                const fallback = parseBaseline(question);
                fallback.diagnostics.providerError = { code:'nlp_intent_validation_failed', errors:validation.errors };
                return fallback;
            }
            return {
                intent,
                source:'nlp',
                adapterVersion:ADAPTER_VERSION,
                validation,
                diagnostics:{
                    requiresNlp:false,
                    schemaGaps:Array.isArray(payload?.schemaGaps) ? payload.schemaGaps : [],
                    baselineFailures:[]
                }
            };
        } catch (error) {
            if (options.allowBaselineFallback === false) throw error;
            const fallback = parseBaseline(question);
            fallback.diagnostics.providerError = { code:'nlp_provider_failed', message:String(error?.message || error) };
            return fallback;
        }
    };

    const classifyPipelineResult = ({ question, intent, selection, plan, semanticParse } = {}) => {
        if (!intent) return { code:'INPUT_EMPTY', category:null, message:'未生成语义结果。' };

        const validationErrors = semanticParse?.validation?.errors || [];
        if (semanticParse?.source === 'baseline' && validationErrors.length) {
            return { code:'A_BASELINE_PARSER_FAILURE', category:'A', message:'baseline 解析结果未通过 Intent 契约校验。', details:validationErrors };
        }
        const baselineFailures = semanticParse?.diagnostics?.baselineFailures || [];
        if (semanticParse?.source === 'baseline' && baselineFailures.length) {
            return { code:'A_BASELINE_PARSER_FAILURE', category:'A', message:'当前输入包含 baseline 应能识别的显式语义，但核心字段仍未正确抽取。', details:baselineFailures };
        }
        if (semanticParse?.diagnostics?.requiresNlp && semanticParse?.source === 'baseline') {
            return { code:'B_NLP_REQUIRED', category:'B', message:'该输入包含跨分句叙述、指代或主问题识别需求，应交由 NLP 语义解析。' };
        }
        if ((semanticParse?.diagnostics?.schemaGaps || []).length) {
            return { code:'C_INTENT_SCHEMA_GAP', category:'C', message:'当前 DivinationIntent v0.1 无法完整表达已识别语义。', details:semanticParse.diagnostics.schemaGaps };
        }
        if (intent.status === 'blocked') return { code:'INPUT_BLOCKED', category:null, message:`语义阻断：${intent.blockReason || 'unknown'}` };
        if (plan?.status === 'resolved') return { code:'OK', category:null, message:'语义、规则与观察方案均已解析。' };

        const ambiguityCodes = new Set((intent.ambiguities || []).map((item) => item.code));
        if (ambiguityCodes.has('romantic_querent_sex_unknown')) {
            return { code:'SEMANTIC_AMBIGUITY', category:null, message:'已识别特定恋爱对象，但未明确占问者的男女角色。' };
        }
        if (ambiguityCodes.has('romantic_counterpart_sex_unknown')) {
            return { code:'SEMANTIC_AMBIGUITY', category:null, message:'已识别特定恋爱对象，但未明确对象的男女角色。' };
        }
        if (ambiguityCodes.has('romantic_sex_role_unknown')) {
            return { code:'SEMANTIC_AMBIGUITY', category:null, message:'已识别特定恋爱对象，但双方男女角色仍不完整。' };
        }

        const issue = selection?.issues?.[0];
        if (['no_confirmed_rule','no_enabled_confirmed_rule','rule_conflict'].includes(issue?.type)) {
            return {
                code:'D_RULE_UNAVAILABLE',
                category:'D',
                subtype:issue.type === 'no_enabled_confirmed_rule' ? 'provisional_rule_skipped' : issue.type,
                message:issue.type === 'no_enabled_confirmed_rule'
                    ? '已找到候选规则，但当前模式不执行 provisional 规则。'
                    : issue.type === 'rule_conflict'
                        ? '规则层出现同级冲突，当前不自动决断。'
                        : '语义已完整解析，但当前没有已确认的自动取用规则。'
            };
        }
        return { code:'UNCLASSIFIED_UNRESOLVED', category:null, message:'当前未生成观察方案，需检查语义或规则层诊断。' };
    };

    const setNlpProvider = (provider) => {
        if (provider != null && typeof provider !== 'function') throw new TypeError('NLP provider must be a function or null');
        nlpProvider = provider || null;
    };

    GuiJia.liuyaoSemanticParser = Object.freeze({
        intentSchemaVersion:INTENT_SCHEMA_VERSION,
        adapterVersion:ADAPTER_VERSION,
        validateIntent,
        normalizeNlpIntent,
        refineBaselineIntent,
        parseQuestionSync,
        parseQuestion,
        classifyPipelineResult,
        setNlpProvider,
        clearNlpProvider() { nlpProvider = null; }
    });
})(typeof window !== 'undefined' ? window : globalThis);
