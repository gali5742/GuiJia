(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const STABLE_CLASS_MAP = Object.freeze({
        generic_property: Object.freeze({ traditionalClass:'generic_property', selector:{ type:'six_relative', value:'妻财' }, provenanceStatus:'stable_consensus' }),
        document_credential: Object.freeze({ traditionalClass:'document_credential', selector:{ type:'six_relative', value:'父母' }, provenanceStatus:'stable_consensus' }),
        vehicle: Object.freeze({ traditionalClass:'vehicle_clothing', selector:{ type:'six_relative', value:'父母' }, provenanceStatus:'cross_source_compatible_to_stable' }),
        clothing: Object.freeze({ traditionalClass:'vehicle_clothing', selector:{ type:'six_relative', value:'父母' }, provenanceStatus:'cross_source_compatible_to_stable' })
    });

    const KNOWN_AMBIGUOUS = Object.freeze(new Set([
        'phone','key','ring','bank_card','computer','usb','disk','cloud_data'
    ]));

    const ALLOWED_FUNCTIONS = Object.freeze(new Set([
        'general_possession',
        'document_or_credential',
        'vehicle_or_transport',
        'clothing_or_wearable',
        'communication_device',
        'information_carrier',
        'access_or_control_token',
        'store_of_value',
        'payment_or_account_access',
        'work_tool',
        'unknown'
    ]));

    const issue = (code, extra = {}) => ({ code, ...extra });
    const candidate = (traditionalClass, selectorValue, support, evidenceRefs = []) => ({
        traditionalClass,
        selector: selectorValue ? { type:'six_relative', value:selectorValue } : null,
        support,
        evidenceRefs:[...evidenceRefs]
    });

    const normalizeFunctions = (context = {}) => {
        const values = [context.primaryFunction, ...(Array.isArray(context.secondaryFunctions) ? context.secondaryFunctions : [])]
            .filter(Boolean);
        const unique = [...new Set(values)];
        return unique.filter((value) => ALLOWED_FUNCTIONS.has(value));
    };

    const validateSemanticObjectContext = (context) => {
        const issues = [];
        if (!context || typeof context !== 'object') {
            return { status:'insufficient', issues:[issue('object_context_missing')] };
        }
        if (context.animacy !== 'inanimate') issues.push(issue('inanimate_object_required', { value:context.animacy || 'unknown' }));
        if (context.specificity !== 'specific') issues.push(issue('specific_object_required', { value:context.specificity || 'unknown' }));
        if (!context.entityType || context.entityType === 'unknown') issues.push(issue('entity_type_unresolved'));
        const functions = normalizeFunctions(context);
        if (!functions.length) issues.push(issue('function_context_missing_or_unsupported'));
        if (context.physicality === 'digital' && context.entityType !== 'cloud_data') {
            issues.push(issue('digital_physicality_requires_explicit_entity_support'));
        }
        return { status:issues.length ? 'insufficient' : 'sufficient', issues, functions };
    };

    const resolveKnownAmbiguousObject = (context, functions) => {
        const entityType = context.entityType;
        const issues = [];
        const candidates = [];

        if (entityType === 'phone') {
            candidates.push(candidate('document_or_information_carrier', '父母', 'modern_school_supported', ['LP-RF-005-ZCB-PHONE']));
            candidates.push(candidate('generic_property', '妻财', 'modern_school_supported', ['LP-RF-005-WANG-PHONE']));
            issues.push(issue('phone_mapping_cross_author_conflict'));
            return { status:'conflicted', provenanceStatus:'conflicted', candidates, issues };
        }

        if (entityType === 'key') {
            candidates.push(candidate('document_or_control_object', '父母', 'school_specific', ['LP-RF-KEY-ZCB']));
            issues.push(issue('key_mapping_school_specific'));
            return { status:'unresolved', provenanceStatus:'school_specific', candidates, issues };
        }

        if (entityType === 'ring') {
            if (functions.includes('store_of_value') || context.valueRole === 'store_of_value') {
                candidates.push(candidate('generic_property', '妻财', 'school_specific', ['LP-RF-RING-ZCB-STORE-VALUE']));
            }
            if (functions.includes('clothing_or_wearable') || context.valueRole === 'ordinary_use') {
                candidates.push(candidate('wearable_or_personal_article', '父母', 'school_specific', ['LP-RF-RING-ZCB-DAILY-WEAR']));
            }
            if (!candidates.length) {
                candidates.push(candidate('wearable_or_personal_article', '父母', 'school_specific', ['LP-RF-RING-ZCB-DAILY-WEAR']));
                candidates.push(candidate('generic_property', '妻财', 'school_specific', ['LP-RF-RING-ZCB-STORE-VALUE']));
            }
            issues.push(issue('ring_mapping_function_dependent_school_specific'));
            return { status:'unresolved', provenanceStatus:'school_specific', candidates, issues };
        }

        if (entityType === 'bank_card') {
            issues.push(issue('bank_card_multi_function_insufficient_evidence', { functions }));
            return { status:'unresolved', provenanceStatus:'insufficient_evidence', candidates, issues };
        }
        if (entityType === 'computer') {
            issues.push(issue('computer_multi_function_insufficient_evidence', { functions }));
            return { status:'unresolved', provenanceStatus:'insufficient_evidence', candidates, issues };
        }
        if (entityType === 'usb' || entityType === 'disk') {
            issues.push(issue('digital_storage_carrier_insufficient_evidence', { entityType, functions }));
            return { status:'unresolved', provenanceStatus:'insufficient_evidence', candidates, issues };
        }
        if (entityType === 'cloud_data') {
            issues.push(issue('digital_asset_no_direct_traditional_continuity'));
            return { status:'unresolved', provenanceStatus:'insufficient_evidence', candidates, issues };
        }

        return { status:'unresolved', provenanceStatus:'insufficient_evidence', candidates, issues:[issue('known_ambiguous_object_unhandled')] };
    };

    const resolveTraditionalObject = (context) => {
        const semantic = validateSemanticObjectContext(context);
        if (semantic.status !== 'sufficient') {
            return {
                version:VERSION,
                status:'unresolved',
                entityType:context?.entityType || 'unknown',
                functions:semantic.functions || [],
                traditionalClass:null,
                selector:null,
                traditionalClassCandidates:[],
                provenanceStatus:'insufficient_semantic_context',
                evidenceRefs:[],
                issues:semantic.issues
            };
        }

        const entityType = context.entityType;
        const functions = semantic.functions;

        if (KNOWN_AMBIGUOUS.has(entityType)) {
            const result = resolveKnownAmbiguousObject(context, functions);
            return {
                version:VERSION,
                status:result.status,
                entityType,
                functions,
                traditionalClass:null,
                selector:null,
                traditionalClassCandidates:result.candidates,
                provenanceStatus:result.provenanceStatus,
                evidenceRefs:[...new Set(result.candidates.flatMap((item) => item.evidenceRefs || []))],
                issues:result.issues
            };
        }

        const stable = STABLE_CLASS_MAP[entityType];
        if (stable) {
            return {
                version:VERSION,
                status:'resolved',
                entityType,
                functions,
                traditionalClass:stable.traditionalClass,
                selector:{ ...stable.selector },
                traditionalClassCandidates:[],
                provenanceStatus:stable.provenanceStatus,
                evidenceRefs:[`LP-RF-STABLE-${entityType.toUpperCase().replace(/[^A-Z0-9]+/g,'-')}`],
                issues:[]
            };
        }

        return {
            version:VERSION,
            status:'unresolved',
            entityType,
            functions,
            traditionalClass:null,
            selector:null,
            traditionalClassCandidates:[],
            provenanceStatus:'insufficient_evidence',
            evidenceRefs:[],
            issues:[issue('entity_type_has_no_supported_traditional_mapping', { entityType })]
        };
    };

    const buildResolverSnapshot = (context) => {
        const resolution = resolveTraditionalObject(context);
        return {
            semanticEntityType:context?.entityType || 'unknown',
            semanticFunctions:normalizeFunctions(context || {}),
            semanticValueRole:context?.valueRole || 'unknown',
            semanticPhysicality:context?.physicality || 'unknown',
            traditionalResolutionStatus:resolution.status,
            traditionalClass:resolution.traditionalClass,
            traditionalSelector:resolution.selector,
            provenanceStatus:resolution.provenanceStatus,
            issues:resolution.issues
        };
    };

    const buildCompatibilityWithLostProperty = (lostIntent) => {
        const context = lostIntent?.lostObject || null;
        const resolution = resolveTraditionalObject(context);
        const semanticReady = Boolean(
            lostIntent?.event?.type === 'lost_property'
            && ['confirmed_lost','possibly_misplaced'].includes(lostIntent?.semantics?.lossState)
            && context?.animacy === 'inanimate'
            && context?.specificity === 'specific'
        );
        return {
            semanticStatus:semanticReady ? 'sufficient' : 'insufficient',
            traditionalObjectStatus:resolution.status,
            readyForTraditionalObservation:semanticReady && resolution.status === 'resolved',
            legalPartialState:semanticReady && ['unresolved','conflicted'].includes(resolution.status),
            resolution,
            finalRecoveryAssessment:null,
            finalLocationAssessment:null
        };
    };

    const findTraditionalSemanticLeaks = (context) => {
        const serialized = JSON.stringify(context || {});
        return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']
            .filter((term) => serialized.includes(term));
    };

    GuiJia.liuyaoLostPropertyObjectFunctionResolverPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        normalizeFunctions,
        validateSemanticObjectContext,
        resolveTraditionalObject,
        buildResolverSnapshot,
        buildCompatibilityWithLostProperty,
        findTraditionalSemanticLeaks
    });
})(typeof window !== 'undefined' ? window : globalThis);
