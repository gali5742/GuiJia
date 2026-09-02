(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';
    const SOURCE_REF = 'liuyao-core.buildLiuYaoLineStatus';

    const KNOWN_STATUS_CODES = Object.freeze([
        'SEASON_STATE',
        'MONTH_COMMAND',
        'MONTH_HARMONY',
        'MONTH_BREAK',
        'MONTH_GENERATE',
        'MONTH_CONTROL',
        'MONTH_SUPPORT',
        'DAY_COMMAND',
        'DAY_HARMONY',
        'DAY_CLASH',
        'DARK_MOVING',
        'DAY_BREAK',
        'DAY_GENERATE',
        'DAY_CONTROL',
        'DAY_SUPPORT',
        'VOID'
    ]);

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

    const validateLineSnapshot = (line) => {
        const issues = [];
        if (!line || typeof line !== 'object' || Array.isArray(line)) {
            return { status:'invalid', issues:[issue('line_snapshot_object_required')] };
        }
        const position = Number(line.position);
        if (!Number.isInteger(position) || position < 1 || position > 6) {
            issues.push(issue('line_position_invalid', { value:line.position ?? null }));
        }
        if (!hasText(line.branch)) issues.push(issue('line_branch_required'));
        if (!hasText(line.element)) issues.push(issue('line_element_required'));
        if (!Array.isArray(line.statusTags)) {
            issues.push(issue('status_tags_array_required'));
        } else {
            const seenCodes = new Set();
            line.statusTags.forEach((tag, index) => {
                if (!tag || typeof tag !== 'object' || Array.isArray(tag)) {
                    issues.push(issue('status_tag_object_required', { index }));
                    return;
                }
                if (!hasText(tag.code)) issues.push(issue('status_tag_code_required', { index }));
                if (!hasText(tag.text)) issues.push(issue('status_tag_text_required', { index }));
                if (!hasText(tag.type)) issues.push(issue('status_tag_type_required', { index }));
                if (hasText(tag.code)) {
                    if (seenCodes.has(tag.code)) issues.push(issue('duplicate_status_tag_code', { code:tag.code }));
                    seenCodes.add(tag.code);
                }
            });
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const factRefFor = (line, code) => `LINE-STATUS:${Number(line.position)}:${String(code)}`;

    const buildAtomicFacts = (line) => {
        const validation = validateLineSnapshot(line);
        if (validation.status !== 'valid') {
            return {
                status:'invalid',
                facts:[],
                issues:validation.issues,
                formalEligible:false
            };
        }

        const facts = line.statusTags.map((tag) => ({
            factRef:factRefFor(line, tag.code),
            schemaVersion:VERSION,
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
            traceRefs:[SOURCE_REF, `status:${tag.code}`]
        }));

        return {
            status:'resolved',
            facts,
            issues:[],
            formalEligible:false
        };
    };

    const findFactByCode = (result, code) => {
        if (!result || !Array.isArray(result.facts)) return null;
        return result.facts.find((fact) => fact.sourceCode === code) || null;
    };

    const describeAdapter = () => ({
        version:VERSION,
        status:STATUS,
        sourceRef:SOURCE_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        knownStatusCodes:[...KNOWN_STATUS_CODES],
        recomputesLineStatus:false,
        recomputesVoid:false,
        buildsVitalitySummary:false,
        scoringEnabled:false,
        probabilityEnabled:false,
        assessmentEnabled:false,
        comparatorEnabled:false,
        note:'Preserves existing line status tags as atomic provenance records only; sourceTagType is not a domain Assessment direction.'
    });

    GuiJia.liuyaoLineStatusFactAdapterPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        SOURCE_REF,
        KNOWN_STATUS_CODES,
        familyForCode,
        validateLineSnapshot,
        factRefFor,
        buildAtomicFacts,
        findFactByCode,
        describeAdapter
    });
})(typeof window !== 'undefined' ? window : globalThis);
