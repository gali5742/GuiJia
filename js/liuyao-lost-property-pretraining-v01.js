(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const VERSION = '0.1';
    const STATUS = 'design_only_unreachable';

    const STABLE_OBJECT_CLASS_MAP = Object.freeze({
        generic_property: { relation:'妻财', evidenceStatus:'stable_consensus' },
        document_credential: { relation:'父母', evidenceStatus:'stable_consensus' },
        vehicle: { relation:'父母', evidenceStatus:'cross_source_compatible_to_stable' },
        clothing: { relation:'父母', evidenceStatus:'cross_source_compatible_to_stable' }
    });

    const CONFLICTED_ENTITY_TYPES = Object.freeze(new Set(['phone']));
    const UNRESOLVED_ENTITY_TYPES = Object.freeze(new Set([
        'key', 'ring', 'computer', 'bank_card', 'usb', 'disk', 'cloud_data', 'unknown'
    ]));
    const ALLOWED_GOALS = Object.freeze(new Set(['recovery', 'location']));
    const ALLOWED_LOSS_STATES = Object.freeze(new Set(['confirmed_lost', 'possibly_misplaced']));

    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateIntentContract = (intent) => {
        const issues = [];
        if (!intent || intent.event?.type !== 'lost_property') issues.push(issue('event_not_lost_property'));
        if (!ALLOWED_LOSS_STATES.has(intent?.lossState)) issues.push(issue('loss_state_insufficient', { value:intent?.lossState || 'unknown' }));

        const lostObject = intent?.lostObject || null;
        if (!lostObject) {
            issues.push(issue('lost_object_missing'));
        } else {
            if (lostObject.animacy !== 'inanimate') issues.push(issue('object_not_inanimate', { value:lostObject.animacy || 'unknown' }));
            if (lostObject.specificity !== 'specific') issues.push(issue('object_not_specific', { value:lostObject.specificity || 'unknown' }));
            if (!lostObject.entityType) issues.push(issue('object_entity_type_missing'));
        }

        const goalTypes = Array.isArray(intent?.goals) ? intent.goals.map((goal) => goal?.type).filter(Boolean) : [];
        if (!goalTypes.length) issues.push(issue('goal_missing'));
        const invalidGoals = goalTypes.filter((goal) => !ALLOWED_GOALS.has(goal));
        if (invalidGoals.length) issues.push(issue('goal_not_supported', { values:invalidGoals }));
        const uniqueGoals = [...new Set(goalTypes)];
        if (uniqueGoals.length !== goalTypes.length) issues.push(issue('duplicate_goal'));

        return {
            version:VERSION,
            status:issues.length ? 'insufficient' : 'sufficient',
            issues,
            compatibleGoals:uniqueGoals,
            contractReady:issues.length === 0
        };
    };

    const resolveLostObject = (lostObject) => {
        if (!lostObject) return { version:VERSION, status:'unresolved', selector:null, reason:'lost_object_missing' };
        if (lostObject.animacy && lostObject.animacy !== 'inanimate') {
            return { version:VERSION, status:'unresolved', selector:null, reason:'animate_object_excluded' };
        }

        const traditionalClass = lostObject.traditionalObjectClass || '';
        const entityType = lostObject.entityType || 'unknown';

        if (traditionalClass && STABLE_OBJECT_CLASS_MAP[traditionalClass]) {
            const mapped = STABLE_OBJECT_CLASS_MAP[traditionalClass];
            return {
                version:VERSION,
                status:'resolved',
                selector:{ type:'six_relative', value:mapped.relation },
                traditionalObjectClass:traditionalClass,
                evidenceStatus:mapped.evidenceStatus,
                source:'traditional_object_class'
            };
        }

        if (CONFLICTED_ENTITY_TYPES.has(entityType)) {
            return {
                version:VERSION,
                status:'conflicted',
                selector:null,
                reason:'modern_mapping_conflict',
                entityType,
                alternatives:['父母','妻财']
            };
        }

        if (UNRESOLVED_ENTITY_TYPES.has(entityType) || !traditionalClass) {
            return {
                version:VERSION,
                status:'unresolved',
                selector:null,
                reason:'traditional_object_class_unresolved',
                entityType
            };
        }

        return {
            version:VERSION,
            status:'unresolved',
            selector:null,
            reason:'unsupported_traditional_object_class',
            traditionalObjectClass:traditionalClass,
            entityType
        };
    };

    const checkSufficiency = (intent) => {
        const semantic = validateIntentContract(intent);
        const objectResolution = semantic.status === 'sufficient'
            ? resolveLostObject(intent.lostObject)
            : { version:VERSION, status:'not_evaluated', selector:null, reason:'semantic_insufficient' };
        return {
            version:VERSION,
            semanticStatus:semantic.status,
            semanticIssues:semantic.issues,
            traditionalObjectStatus:objectResolution.status,
            traditionalObjectIssue:objectResolution.reason || null,
            readyForTraditionalObservation:semantic.status === 'sufficient' && objectResolution.status === 'resolved'
        };
    };

    const buildDraftObservationPlan = (intent) => {
        const semantic = validateIntentContract(intent);
        if (semantic.status !== 'sufficient') {
            return {
                version:VERSION,
                status:'unresolved',
                subjects:[],
                unresolvedReasons:semantic.issues,
                currentRuntimeReachable:false
            };
        }

        const objectResolution = resolveLostObject(intent.lostObject);
        if (objectResolution.status !== 'resolved') {
            return {
                version:VERSION,
                status:'unresolved',
                subjects:[],
                unresolvedReasons:[issue('lost_object_traditional_resolution_failed', {
                    resolutionStatus:objectResolution.status,
                    reason:objectResolution.reason,
                    entityType:intent.lostObject?.entityType || 'unknown'
                })],
                currentRuntimeReachable:false
            };
        }

        return {
            version:VERSION,
            status:'resolved',
            subjects:[
                {
                    source:'primary',
                    semanticDuty:'lost_object',
                    required:true,
                    selector:objectResolution.selector,
                    resolverRef:'PRR-LOST-PROPERTY-OBJECT'
                },
                {
                    source:'role',
                    semanticDuty:'querent_self',
                    required:true,
                    selector:{ type:'shi' }
                },
                {
                    source:'domain',
                    semanticDuty:'possible_theft_or_external_removal',
                    required:false,
                    selector:{ type:'six_relative', value:'官鬼' }
                }
            ],
            goals:semantic.compatibleGoals,
            currentRuntimeReachable:false
        };
    };

    const pushEvidence = (target, code, polarity, channel, details = {}) => {
        target.push({ code, polarity, channel, ...details });
    };

    const buildRecoveryEvidence = (facts = {}) => {
        const evidence = [];
        const vitality = facts.vitality || 'unknown';
        const voidState = facts.voidState || 'unknown';
        const moving = Boolean(facts.moving);
        const innerOuter = facts.innerOuter || 'unknown';
        const relationToShi = facts.relationToShi || 'none';

        if (vitality === 'strong') pushEvidence(evidence, 'LP_REC_VITALITY_STRONG', 'positive', 'vitality');
        if (vitality === 'weak' || vitality === 'declining') pushEvidence(evidence, 'LP_REC_VITALITY_WEAK', 'negative', 'vitality');

        if (['self_void','transformed_void','void_extreme'].includes(voidState)) {
            pushEvidence(evidence, 'LP_REC_VOID_NEGATIVE', 'strong_negative', 'void_break', { voidState });
        }

        if (moving) {
            pushEvidence(evidence, 'LP_REC_MOVEMENT', 'neutral', 'movement', {
                meaning:'displacement',
                distanceHint:innerOuter === 'inner' ? 'nearer' : innerOuter === 'outer' ? 'farther' : 'unknown'
            });
        }

        if (facts.isOnShi && !moving) {
            pushEvidence(evidence, 'LP_REC_STATIC_ON_SHI', 'positive', 'self_object_relation', { meaning:'object_still_present_or_near' });
        }

        if (innerOuter === 'inner' && !moving && vitality === 'strong') {
            pushEvidence(evidence, 'LP_REC_INNER_STATIC_STRONG', 'positive', 'composite', { meaning:'near_or_home_side' });
        }

        const voidBlocksPositiveRelation = ['self_void','transformed_void','void_extreme'].includes(voidState);
        if (!voidBlocksPositiveRelation && ['generates','combines'].includes(relationToShi)) {
            pushEvidence(evidence, 'LP_REC_POSITIVE_TO_SHI', 'positive', 'self_object_relation', { relationToShi });
        }

        if (facts.inTomb) pushEvidence(evidence, 'LP_REC_IN_TOMB', 'neutral', 'hidden_contained', { meaning:'contained_or_deeply_hidden' });
        if (facts.hiddenFushen) pushEvidence(evidence, 'LP_REC_HIDDEN_FUSHEN', 'neutral', 'hidden_contained', { meaning:'hidden_or_covered' });
        if (facts.joined) pushEvidence(evidence, 'LP_REC_JOINED', 'neutral', 'hidden_contained', { meaning:'covered_wrapped_or_contained' });

        if (facts.baseRelation === '妻财' && facts.transformsToRelation === '官鬼') {
            pushEvidence(evidence, 'LP_REC_WEALTH_TO_GHOST', 'strong_negative', 'transformation', { meaning:'difficult_recovery_or_theft_related' });
        }
        if (facts.baseRelation === '官鬼' && facts.transformsToRelation === '妻财') {
            pushEvidence(evidence, 'LP_REC_GHOST_TO_WEALTH', 'positive', 'transformation', { meaning:'object_not_far_or_recoverable' });
        }

        if (facts.ghostActive === true) pushEvidence(evidence, 'LP_REC_POSSIBLE_THEFT', 'neutral', 'loss_cause', { meaning:'possible_theft_or_external_removal' });
        if (facts.ghostQuietAbsent === true) pushEvidence(evidence, 'LP_REC_SELF_LOST_TENDENCY', 'neutral', 'loss_cause', { meaning:'self_lost_tendency' });

        return {
            version:VERSION,
            status:'evidence_only',
            evidence,
            finalRecoverability:null,
            scoring:null
        };
    };

    const buildLocationEvidence = (facts = {}) => {
        const evidence = [];
        if (facts.innerOuter === 'inner') pushEvidence(evidence, 'LP_LOC_INNER', 'neutral', 'inside_outside', { meaning:'inside_near_home_side' });
        if (facts.innerOuter === 'outer') pushEvidence(evidence, 'LP_LOC_OUTER', 'neutral', 'inside_outside', { meaning:'outside_farther_external_side' });
        if (Number.isInteger(facts.linePosition) && facts.linePosition >= 1 && facts.linePosition <= 6) {
            pushEvidence(evidence, 'LP_LOC_LINE_POSITION', 'neutral', 'line_position', { linePosition:facts.linePosition });
        }
        if (facts.element) pushEvidence(evidence, 'LP_LOC_ELEMENT_ENVIRONMENT', 'neutral', 'element_environment', { element:facts.element });
        if (facts.branchDirection) pushEvidence(evidence, 'LP_LOC_BRANCH_DIRECTION', 'neutral', 'branch_direction', { branchDirection:facts.branchDirection });
        if (facts.trigramEnvironment) pushEvidence(evidence, 'LP_LOC_TRIGRAM_ENVIRONMENT', 'neutral', 'trigram_environment', { trigramEnvironment:facts.trigramEnvironment });
        if (facts.inTomb) pushEvidence(evidence, 'LP_LOC_TOMB_CONTAINMENT', 'neutral', 'tomb_containment', { meaning:'contained_or_deeply_hidden' });
        if (facts.joined) pushEvidence(evidence, 'LP_LOC_JOINED_COVER', 'neutral', 'joined_cover', { meaning:'covered_wrapped_or_inside_container' });
        if (facts.hiddenFushen) pushEvidence(evidence, 'LP_LOC_FUSHEN_HIDDEN', 'neutral', 'hidden_fushen', { meaning:'hidden_beneath_or_behind_other_object' });

        return {
            version:VERSION,
            status:'symbolic_evidence_only',
            evidence,
            exactCoordinates:null,
            exactDistance:null
        };
    };

    GuiJia.liuyaoLostPropertyPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        stableObjectClassMap:STABLE_OBJECT_CLASS_MAP,
        validateIntentContract,
        resolveLostObject,
        checkSufficiency,
        buildDraftObservationPlan,
        buildRecoveryEvidence,
        buildLocationEvidence
    });
})(typeof window !== 'undefined' ? window : globalThis);
