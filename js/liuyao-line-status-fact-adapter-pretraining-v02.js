(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.2';
    const STATUS = 'design_only_unreachable';
    const SOURCE_REF = 'liuyao-core.buildLiuYaoLineStatus';

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });
    const familyForCode = (code) => {
        if (code === 'SEASON_STATE') return 'season_state';
        if (String(code).startsWith('MONTH_')) return 'month_relation';
        if (String(code).startsWith('DAY_')) return 'day_relation';
        if (code === 'DARK_MOVING') return 'activity_state';
        if (code === 'VOID') return 'void_state';
        return 'other_line_state';
    };

    const validateInput = ({ readingRef, line } = {}) => {
        const issues = [];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!line || typeof line !== 'object' || Array.isArray(line)) {
            issues.push(issue('line_snapshot_object_required'));
            return { status:'invalid', issues };
        }
        const position = Number(line.position);
        if (!Number.isInteger(position) || position < 1 || position > 6) issues.push(issue('line_position_invalid', { value:line.position ?? null }));
        if (!hasText(line.branch)) issues.push(issue('line_branch_required'));
        if (!hasText(line.element)) issues.push(issue('line_element_required'));
        if (!Array.isArray(line.statusTags)) {
            issues.push(issue('status_tags_array_required'));
        } else {
            const seenCodes = new Set();
            line.statusTags.forEach((tag,index) => {
                if (!tag || typeof tag !== 'object' || Array.isArray(tag)) {
                    issues.push(issue('status_tag_object_required',{index}));
                    return;
                }
                if (!hasText(tag.code)) issues.push(issue('status_tag_code_required',{index}));
                if (!hasText(tag.text)) issues.push(issue('status_tag_text_required',{index}));
                if (!hasText(tag.type)) issues.push(issue('status_tag_type_required',{index}));
                if (hasText(tag.code)) {
                    if (seenCodes.has(tag.code)) issues.push(issue('duplicate_status_tag_code',{code:tag.code}));
                    seenCodes.add(tag.code);
                }
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const factRefFor = (readingRef, line, code) => `READING:${readingRef}:LINE-STATUS:${Number(line.position)}:${String(code)}`;

    const buildAtomicFacts = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') return { status:'invalid', facts:[], issues:validation.issues, formalEligible:false };
        const { readingRef, line } = input;
        return {
            status:'resolved',
            facts:line.statusTags.map((tag) => ({
                factRef:factRefFor(readingRef,line,tag.code),
                schemaVersion:VERSION,
                readingRef,
                sourceLayer:'liuyao_line_status',
                sourceRef:SOURCE_REF,
                sourceCode:tag.code,
                sourceTagType:tag.type,
                family:familyForCode(tag.code),
                atomic:true,
                conclusionShaped:false,
                formalEligible:false,
                currentRuntimeReachable:false,
                subjectRef:{
                    position:Number(line.position),
                    branch:line.branch,
                    element:line.element,
                    ...(hasText(line.relation) ? { relation:line.relation } : {}),
                    ...(typeof line.isShi === 'boolean' ? { isShi:line.isShi } : {}),
                    ...(typeof line.isYing === 'boolean' ? { isYing:line.isYing } : {})
                },
                text:tag.text,
                traceRefs:[SOURCE_REF,`reading:${readingRef}`,`status:${tag.code}`]
            })),
            issues:[],
            formalEligible:false
        };
    };

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        sourceRef:SOURCE_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        readingRefRequired:true,
        readingRefProducerReviewed:false,
        castTimestampAloneAcceptedAsFormalReadingRef:false,
        recomputesLineStatus:false,
        buildsVitalitySummary:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoLineStatusFactAdapterPretrainingV02 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SOURCE_REF,
        familyForCode,
        validateInput,
        factRefFor,
        buildAtomicFacts,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
