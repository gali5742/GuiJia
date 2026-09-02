(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const SOURCE_REF = 'liuyao-core.buildMoveAnalysis';

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateInput = ({ readingRef, line } = {}) => {
        const issues = [];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!line || typeof line !== 'object' || Array.isArray(line)) {
            issues.push(issue('line_snapshot_object_required'));
            return { status:'invalid', issues };
        }
        const position = Number(line.position);
        if (!Number.isInteger(position) || position < 1 || position > 6) issues.push(issue('line_position_invalid', { value:line.position ?? null }));
        if (line.moving !== true) issues.push(issue('moving_line_required'));
        if (!hasText(line.branch)) issues.push(issue('line_branch_required'));
        if (!hasText(line.element)) issues.push(issue('line_element_required'));
        if (!hasText(line.changedBranch)) issues.push(issue('changed_branch_required'));
        if (!hasText(line.changedElement)) issues.push(issue('changed_element_required'));
        if (!Array.isArray(line.moveTags) || line.moveTags.length === 0) {
            issues.push(issue('move_tags_nonempty_array_required'));
        } else {
            const seenCodes = new Set();
            line.moveTags.forEach((tag,index) => {
                if (!tag || typeof tag !== 'object' || Array.isArray(tag)) {
                    issues.push(issue('move_tag_object_required',{index}));
                    return;
                }
                if (!hasText(tag.code)) issues.push(issue('move_tag_code_required',{index}));
                if (!hasText(tag.text)) issues.push(issue('move_tag_text_required',{index}));
                if (!hasText(tag.type)) issues.push(issue('move_tag_type_required',{index}));
                if (hasText(tag.code)) {
                    if (seenCodes.has(tag.code)) issues.push(issue('duplicate_move_tag_code',{code:tag.code}));
                    seenCodes.add(tag.code);
                }
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const factRefFor = (readingRef, line, code) => `READING:${readingRef}:MOVE:${Number(line.position)}:${String(code)}`;

    const buildAtomicFacts = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') {
            return { status:'invalid', facts:[], issues:validation.issues, formalEligible:false };
        }
        const { readingRef, line } = input;
        const facts = line.moveTags.map((tag) => ({
            factRef:factRefFor(readingRef,line,tag.code),
            schemaVersion:VERSION,
            readingRef,
            sourceLayer:'liuyao_move_analysis',
            sourceRef:SOURCE_REF,
            sourceCode:tag.code,
            sourceTagType:tag.type,
            family:'move_transform_state',
            atomic:true,
            conclusionShaped:false,
            formalEligible:false,
            currentRuntimeReachable:false,
            subjectRef:{
                position:Number(line.position),
                branch:line.branch,
                element:line.element,
                changedBranch:line.changedBranch,
                changedElement:line.changedElement,
                ...(hasText(line.relation) ? { relation:line.relation } : {}),
                ...(hasText(line.changedRelation) ? { changedRelation:line.changedRelation } : {}),
                ...(typeof line.isShi === 'boolean' ? { isShi:line.isShi } : {}),
                ...(typeof line.isYing === 'boolean' ? { isYing:line.isYing } : {})
            },
            text:tag.text,
            traceRefs:[SOURCE_REF,`reading:${readingRef}`,`move:${Number(line.position)}:${tag.code}`]
        }));
        return { status:'resolved', facts, issues:[], formalEligible:false };
    };

    const findFactByCode = (result, code) => Array.isArray(result?.facts)
        ? result.facts.find((fact) => fact.sourceCode === code) || null
        : null;

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        sourceRef:SOURCE_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        readingRefRequired:true,
        movingLineRequired:true,
        recomputesMoveAnalysis:false,
        interpretsTagType:false,
        buildsAssessment:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoMoveTransformFactAdapterPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SOURCE_REF,
        validateInput,
        factRefFor,
        buildAtomicFacts,
        findFactByCode,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
