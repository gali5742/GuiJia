(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const effectApi = GuiJia.liuyaoTimeEffects;
    const assessmentApi = GuiJia.liuyaoTimeAssessment;
    const evidenceApi = GuiJia.liuyaoTimeEvidence;
    const relevanceApi = GuiJia.liuyaoTimeRelevance;
    if (!effectApi?.validateTimeEffectSet) throw new Error('liuyao-time-effects.js must be loaded before liuyao-time-output.js');
    if (!assessmentApi?.validateNodeAssessment) throw new Error('liuyao-time-assessment.js must be loaded before liuyao-time-output.js');
    if (!evidenceApi?.validateEvidenceBundle) throw new Error('liuyao-time-evidence.js must be loaded before liuyao-time-output.js');
    if (!relevanceApi?.validateStructuralRelevanceProfile) throw new Error('liuyao-time-relevance.js must be loaded before liuyao-time-output.js');

    const SCHEMA_VERSION = 1;
    const DIMENSIONS = Object.freeze([...effectApi.DIMENSIONS]);
    const DIMENSION_LABELS = effectApi.DIMENSION_LABELS;
    const DATE_CODES = Object.freeze(['preferred','secondary','mixed','observe','caution']);
    const DATE_LABELS = Object.freeze({
        preferred:'偏有利',
        secondary:'较平稳',
        mixed:'利弊并见',
        observe:'一般观察',
        caution:'有一定负担'
    });
    const DATE_RANK = Object.freeze({ preferred:5, secondary:4, mixed:3, observe:2, caution:1 });
    const LEGACY_TOKENS = new Set(['supportive','adverse','mixed-direction','preferred-direction','restraining']);

    const active = (assessment, kind) => Boolean(assessment?.dimensions?.[kind]?.active);
    const dim = (assessment, kind) => assessment?.dimensions?.[kind] || {};
    const count = (assessment, kind) => Number(dim(assessment, kind).reasonCount || 0);

    const evidenceKindText = (item) => (item?.coversKinds || [])
        .map((kind) => DIMENSION_LABELS[kind] || kind)
        .join('、');

    // alpha.11 只收束候选用户文案，不改变 TimeFact / TimeEffect / Selection 判断。
    const buildCandidateSummaryText = (assessment) => {
        const kinds = DIMENSIONS.filter((kind) => assessment?.activeKinds?.includes(kind));
        const hasTrigger = kinds.includes('trigger');
        const substantive = kinds.filter((kind) => kind !== 'trigger');
        if (!substantive.length) return hasTrigger ? '以触发为主' : '以结构观察为主';
        if (substantive.length === 1) {
            const single = {
                support:hasTrigger ? '触发中见生扶' : '对主要观察爻有生扶',
                peer:hasTrigger ? '触发中见比和' : '与主要观察爻比和',
                constraint:hasTrigger ? '触发伴随受制' : '对主要观察爻偏受制',
                outflow:hasTrigger ? '触发伴随泄力' : '主要观察爻有泄力',
                exertion:hasTrigger ? '触发伴随耗力' : '主要观察爻有耗力'
            };
            return single[substantive[0]] || (hasTrigger ? `触发中见${DIMENSION_LABELS[substantive[0]] || substantive[0]}` : `${DIMENSION_LABELS[substantive[0]] || substantive[0]}`);
        }
        const labels = substantive.map((kind) => DIMENSION_LABELS[kind] || kind);
        const joined = labels.length === 2 ? labels.join('与') : `${labels.slice(0, -1).join('、')}与${labels[labels.length - 1]}`;
        return hasTrigger ? `触发中，${joined}并见` : `${joined}并见`;
    };

    const candidateEvidenceLabel = (item) => {
        const original = String(item?.label || '');
        const code = String(item?.eventCode || '');
        const subject = String(item?.subject || '');
        const covers = new Set(item?.coversKinds || []);
        if (code === 'TARGET_DAY_DRAIN') return '观察爻泄力';
        if (code === 'TARGET_CONTROLS_DAY') return '观察爻耗力';
        if (code === 'TARGET_VOID_OUT') return '观察爻出空';
        if (code === 'TARGET_VOID_FILL') return '观察爻填实';
        if (code === 'TARGET_VOID_CLASH') return '观察爻冲空';
        if (code === 'TARGET_MONTH_BREAK_VALUE') return '观察爻月破逢值';
        if (code === 'TARGET_MONTH_BREAK_HARMONY') return '观察爻月破合破';
        if (original !== '出空并逢值') return original;
        if (subject === 'main-observer') return '观察爻出空并逢值';
        if (covers.has('support')) return '生扶爻出空并逢值';
        if (covers.has('constraint')) return '克制爻出空并逢值';
        if (covers.has('peer')) return '比和爻出空并逢值';
        return '关键爻出空并逢值';
    };

    const TIER_RANK = Object.freeze({ primary:3, secondary:2, context:1 });
    const candidateEvidencePriority = (item) => ({
        mainObserver:String(item?.subject || '') === 'main-observer' ? 1 : 0,
        substantive:(item?.coversKinds || []).filter((kind) => kind !== 'trigger').length,
        coverage:(item?.coversKinds || []).length,
        tier:TIER_RANK[String(item?.tier || '')] || 0,
        sourceIndex:Number(item?.sourceIndex ?? 9999)
    });

    const sortCandidateEvidence = (items = []) => [...(items || [])].sort((a, b) => {
        const ap = candidateEvidencePriority(a);
        const bp = candidateEvidencePriority(b);
        for (const key of ['mainObserver','substantive','coverage','tier']) {
            if (ap[key] !== bp[key]) return bp[key] - ap[key];
        }
        return ap.sourceIndex - bp.sourceIndex;
    });

    const evidenceLabelImpliesTrigger = (label) => /逢值|逢冲|逢合|出空|填实|冲空|暗动|日破|合起|合绊|三合|月破/.test(String(label || ''));

    // beta.2：正式用户证据必须能直接解释摘要中的实质效力。
    // Evidence Selector 的 coversKinds 是机器语义；这里把标签中尚未显式出现的
    // 生扶 / 比和 / 受制 / 泄力 / 耗力补到用户可见标签，避免“摘要有耗力，证据看不出来”。
    const formatEvidenceDisplayLabel = (item) => {
        const label = candidateEvidenceLabel(item);
        const missing = (item?.coversKinds || []).filter((kind) => {
            if (kind === 'trigger' && evidenceLabelImpliesTrigger(label)) return false;
            const dimensionLabel = DIMENSION_LABELS[kind] || kind;
            return !label.includes(dimensionLabel);
        });
        const substantive = missing.filter((kind) => kind !== 'trigger');
        return substantive.length
            ? `${label}（${substantive.map((kind) => DIMENSION_LABELS[kind] || kind).join('、')}）`
            : label;
    };

    const outputEvidenceItem = (item) => ({
        eventCode:String(item?.eventCode || ''),
        label:formatEvidenceDisplayLabel(item),
        text:String(item?.text || ''),
        coversKinds:[...(item?.coversKinds || [])],
        effectText:evidenceKindText(item),
        subject:String(item?.subject || ''),
        tier:String(item?.tier || ''),
        sourceIndex:Number(item?.sourceIndex ?? 9999),
        memberEventCodes:[...(item?.memberEventCodes || [])]
    });

    const buildDateSelectionProfile = (assessment) => {
        const support = active(assessment, 'support');
        const peer = active(assessment, 'peer');
        const constraint = active(assessment, 'constraint');
        const outflow = active(assessment, 'outflow');
        const exertion = active(assessment, 'exertion');
        const benefit = support || peer;
        const cost = outflow || exertion;
        let code = 'observe';
        if (benefit && !constraint && !cost) {
            code = support ? 'preferred' : 'secondary';
        } else if (benefit && (constraint || cost)) {
            code = 'mixed';
        } else if (constraint) {
            code = 'caution';
        } else if (cost) {
            code = 'caution';
        }
        const structuralRelevance = relevanceApi.buildStructuralRelevanceProfile(assessment);
        return {
            code,
            label:DATE_LABELS[code],
            rank:DATE_RANK[code],
            structuralRelevance,
            flags:{ trigger:active(assessment,'trigger'), support, peer, constraint, outflow, exertion },
            direct:{
                support:Boolean(dim(assessment,'support').directMainObserver),
                peer:Boolean(dim(assessment,'peer').directMainObserver),
                constraint:Boolean(dim(assessment,'constraint').directMainObserver),
                outflow:Boolean(dim(assessment,'outflow').directMainObserver),
                exertion:Boolean(dim(assessment,'exertion').directMainObserver)
            },
            primary:{
                support:Boolean(dim(assessment,'support').primary),
                peer:Boolean(dim(assessment,'peer').primary),
                constraint:Boolean(dim(assessment,'constraint').primary),
                outflow:Boolean(dim(assessment,'outflow').primary),
                exertion:Boolean(dim(assessment,'exertion').primary)
            },
            counts:{
                support:count(assessment,'support'), peer:count(assessment,'peer'), constraint:count(assessment,'constraint'),
                outflow:count(assessment,'outflow'), exertion:count(assessment,'exertion')
            }
        };
    };

    const materialDateSignature = (profile) => {
        const p = profile || {};
        const flags = p.flags || {};
        return [
            String(p.code || 'observe'),
            'support','peer','constraint','outflow','exertion'
        ].map((part, index) => index === 0 ? part : `${part}:${Number(Boolean(flags[part]))}`).join('|');
    };

    const materiallyEquivalentDateProfiles = (a, b) => materialDateSignature(a) === materialDateSignature(b);

    const dateSelectionVector = (profile) => {
        const p = profile || {};
        const flags = p.flags || {};
        const direct = p.direct || {};
        const primary = p.primary || {};
        const code = String(p.code || 'observe');
        const base = [Number(p.rank || 0)];

        // 日期比较只比较“效力性质”，不使用 reasonCount 累加成隐性总分。
        // 在 mixed / caution 中，真正的受制优先视为比泄力、耗力更重的负担；
        // 同一实质效力组合下，direct / primary 仅用于稳定内部顺序，
        // 用户层仍可通过 materialDateSignature 保留“并列”结论。
        if (code === 'mixed') {
            base.push(
                Number(!flags.constraint),
                Number(!flags.outflow),
                Number(!flags.exertion),
                Number(Boolean(flags.support)),
                Number(Boolean(flags.peer)),
                Number(Boolean(direct.support)),
                Number(Boolean(primary.support)),
                Number(Boolean(direct.peer)),
                Number(Boolean(primary.peer)),
                Number(!direct.constraint),
                Number(!primary.constraint),
                Number(!direct.outflow),
                Number(!direct.exertion)
            );
        } else if (code === 'preferred') {
            base.push(
                Number(Boolean(flags.peer)),
                Number(Boolean(direct.support)),
                Number(Boolean(primary.support)),
                Number(Boolean(direct.peer)),
                Number(Boolean(primary.peer))
            );
        } else if (code === 'secondary') {
            base.push(
                Number(Boolean(direct.peer)),
                Number(Boolean(primary.peer))
            );
        } else if (code === 'caution') {
            base.push(
                Number(!flags.constraint),
                Number(!flags.outflow),
                Number(!flags.exertion),
                Number(!direct.constraint),
                Number(!primary.constraint),
                Number(!direct.outflow),
                Number(!direct.exertion)
            );
        }
        return base;
    };

    const compareDateProfiles = (a, b) => {
        const av = dateSelectionVector(a);
        const bv = dateSelectionVector(b);
        for (let i = 0; i < Math.max(av.length, bv.length); i += 1) {
            const diff = Number(bv[i] || 0) - Number(av[i] || 0);
            if (diff) return diff;
        }
        return 0;
    };

    const dateProfileFromOutput = (item) => item?.candidateOutput?.dateAssessment || item?.dateAssessment || item?.assessment || null;

    const compareDateOutputs = (a, b) => {
        const profileDiff = compareDateProfiles(dateProfileFromOutput(a), dateProfileFromOutput(b));
        if (profileDiff) return profileDiff;
        return Number(a?.sortTime || 0) - Number(b?.sortTime || 0);
    };

    const chooseDateReasonEvidence = (evidence, profile, limit = 2) => {
        const items = evidence?.selected || [];
        const desired = [];
        if (profile?.flags?.support) desired.push('support');
        if (profile?.flags?.peer) desired.push('peer');
        if (profile?.flags?.constraint) desired.push('constraint');
        if (profile?.flags?.outflow) desired.push('outflow');
        if (profile?.flags?.exertion) desired.push('exertion');
        if (!desired.length && profile?.flags?.trigger) desired.push('trigger');
        const selected = [];
        desired.forEach((kind) => {
            if (selected.length >= limit) return;
            const item = items.find((candidate) => !selected.includes(candidate) && candidate.coversKinds?.includes(kind));
            if (item) selected.push(item);
        });
        items.forEach((item) => {
            if (selected.length < limit && !selected.includes(item)) selected.push(item);
        });
        return selected.slice(0, Math.max(0, limit));
    };

    const formatDateReasonEvidence = (item) => formatEvidenceDisplayLabel(item);

    const dateAssessmentLead = (profile) => {
        const flags = profile?.flags || {};
        const benefit = Boolean(flags.support || flags.peer);
        const softCost = Boolean(flags.outflow || flags.exertion);
        if (flags.constraint && benefit) return '利弊并见';
        if (flags.constraint) return '偏受制';
        if (benefit && softCost) return '有助亦有负担';
        if (benefit) return '偏有利';
        if (softCost) return '有一定负担';
        return '一般观察';
    };

    const buildDateAssessmentText = (profile, evidence) => {
        const reasons = chooseDateReasonEvidence(evidence, profile, 2).map(formatDateReasonEvidence);
        const lead = dateAssessmentLead(profile);
        return reasons.length ? `${lead}：${reasons.join('；')}。` : `${lead}。`;
    };

    const buildCandidateNodeOutput = (assessment, evidence, options = {}) => {
        const assessmentErrors = assessmentApi.validateNodeAssessment(assessment);
        if (assessmentErrors.length) throw new Error(`invalid Node Assessment in candidate output: ${assessmentErrors.join(',')}`);
        const evidenceErrors = evidenceApi.validateEvidenceBundle(evidence, assessment);
        if (evidenceErrors.length) throw new Error(`invalid Evidence bundle in candidate output: ${evidenceErrors.join(',')}`);
        const caveat = String(options.caveat || '').trim();
        const candidateSummary = buildCandidateSummaryText(assessment);
        const summaryText = caveat ? `${candidateSummary}；${caveat}` : candidateSummary;
        const orderedEvidence = sortCandidateEvidence(evidence.selected || []);
        const evidenceItems = orderedEvidence.map(outputEvidenceItem);
        const dateAssessment = buildDateSelectionProfile(assessment);
        dateAssessment.label = dateAssessmentLead(dateAssessment);
        dateAssessment.text = buildDateAssessmentText(dateAssessment, { ...evidence, selected:orderedEvidence });
        return {
            schemaVersion:SCHEMA_VERSION,
            summary:{ text:summaryText, kinds:[...(assessment.summary?.kinds || assessment.activeKinds || [])] },
            evidence:evidenceItems,
            facts:evidenceItems.map((item) => `${item.label}：${item.text}`),
            dateAssessment
        };
    };

    const buildDateSelectionComparison = (nodes = []) => {
        const usable = (nodes || []).filter((node) => node?.candidateOutput?.dateAssessment).sort(compareDateOutputs);
        if (!usable.length) return null;
        const first = usable[0];
        const firstProfile = first.candidateOutput.dateAssessment;
        // “并列”按实质效力组合判断，不要求 direct/primary 等内部排序细节完全一致。
        // 这样可以避免为了细微来源差异强行选出唯一日期。
        const top = usable.filter((item) => materiallyEquivalentDateProfiles(firstProfile, item.candidateOutput.dateAssessment));
        if (top.length > 1) {
            return {
                status:'tie',
                preferredDates:top.map((item) => item.dateText),
                summary:`较值得比较：${top.map((item) => `${item.dateText} ${item.dayGanZhi}日`).join('、')}；当前未形成单一优先日。`
            };
        }
        const next = usable[1] || null;
        const prefix = firstProfile.code === 'preferred'
            ? '优先观察'
            : firstProfile.code === 'secondary'
                ? '相对较顺'
                : firstProfile.code === 'mixed'
                    ? '相对可先观察'
                    : firstProfile.code === 'caution'
                        ? '相对较少受制或耗力'
                        : '相对可先观察';
        return {
            status:'preferred',
            preferredDates:[first.dateText],
            summary:`${prefix}：${first.dateText} ${first.dayGanZhi}日${next ? `；次看：${next.dateText} ${next.dayGanZhi}日` : ''}。`
        };
    };

    const validateCandidateNodeOutput = (output, assessment, evidence) => {
        const errors = [];
        if (!output || typeof output !== 'object') return ['output-not-object'];
        if (output.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!output.summary || typeof output.summary.text !== 'string' || !output.summary.text) errors.push('summary');
        if (!Array.isArray(output.summary?.kinds)) errors.push('summary-kinds');
        if (!Array.isArray(output.evidence)) errors.push('evidence');
        if (!Array.isArray(output.facts)) errors.push('facts');
        if (!output.dateAssessment || !DATE_CODES.includes(output.dateAssessment.code)) errors.push('date-assessment');
        else {
            const relevanceErrors = relevanceApi.validateStructuralRelevanceProfile(output.dateAssessment.structuralRelevance, assessment);
            if (relevanceErrors.length) errors.push(...relevanceErrors.map((item) => `structural-relevance:${item}`));
        }
        if (JSON.stringify(output.summary?.kinds || []) !== JSON.stringify(assessment?.summary?.kinds || assessment?.activeKinds || [])) errors.push('summary-kind-mismatch');
        if ((output.evidence || []).length !== (evidence?.selected || []).length) errors.push('evidence-count-mismatch');
        (assessment?.activeKinds || []).forEach((kind) => {
            if (!(output.evidence || []).some((item) => item.coversKinds?.includes(kind))) errors.push(`missing-visible-evidence:${kind}`);
        });
        const walk = (value, path = '') => {
            if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${path}[${index}]`));
            if (!value || typeof value !== 'object') {
                if (typeof value === 'string' && LEGACY_TOKENS.has(value)) errors.push(`legacy-token:${path}`);
                return;
            }
            Object.entries(value).forEach(([key, nested]) => walk(nested, path ? `${path}.${key}` : key));
        };
        walk(output);
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeOutput = {
        SCHEMA_VERSION,
        DIMENSIONS,
        DATE_CODES,
        DATE_LABELS,
        DATE_RANK,
        buildCandidateSummaryText,
        candidateEvidenceLabel,
        candidateEvidencePriority,
        sortCandidateEvidence,
        formatEvidenceDisplayLabel,
        formatDateReasonEvidence,
        dateAssessmentLead,
        buildDateSelectionProfile,
        materialDateSignature,
        materiallyEquivalentDateProfiles,
        dateSelectionVector,
        compareDateProfiles,
        dateProfileFromOutput,
        compareDateOutputs,
        buildDateAssessmentText,
        buildCandidateNodeOutput,
        buildDateSelectionComparison,
        validateCandidateNodeOutput
    };
})(window);
