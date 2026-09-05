(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedTargetResolverProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCuratedTargetResolverContract || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    const actorGroupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile || null;
    const hiddenBindingProfileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile || null;
    if (!contractApi || !targetSource || !annotationSource || !actorGroupProfileApi || !hiddenBindingProfileApi) return;

    const { VERSION, RULE_ID, RESOLUTION_STATES, TARGET_REFERENCE_TYPES, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const annotationByCaseId = Object.freeze(Object.fromEntries((annotationSource.ANNOTATIONS || []).map((item) => [item.upstreamCaseId, item])));

    const unresolved = (sourceCase = {}, annotation = {}, reasons = []) => Object.freeze({
        sourceCaseId:sourceCase.id || annotation.upstreamCaseId || null,
        annotationId:annotation.id || null,
        resolutionState:RESOLUTION_STATES.UNRESOLVED,
        semanticLevel:null,
        targetReferenceType:null,
        targetReference:null,
        blockerReasons:freezeArray(reasons),
        relationEffect:null,
        membershipMutation:null,
        numericWeight:null
    });

    const relationTargetLevel = (annotation = {}) => {
        const levels = [...new Set((annotation.relationUnits || []).map((unit) => unit.target?.semanticLevelHint).filter(Boolean))];
        return Object.freeze({ levels:freezeArray(levels), level:levels.length === 1 ? levels[0] : null });
    };

    const roleClasses = (annotation = {}) => freezeArray([...new Set((annotation.relationUnits || []).map((unit) => unit.target?.roleClass).filter(Boolean))]);

    const resolveCase = (sourceCase = {}, actorGroups = [], hiddenBindings = []) => {
        const annotation = annotationByCaseId[sourceCase.id] || null;
        if (!annotation) return unresolved(sourceCase, {}, ['missing-curated-annotation']);

        if (annotation.annotationDisposition === 'no-relation-target') {
            return Object.freeze({
                sourceCaseId:sourceCase.id,
                annotationId:annotation.id,
                resolutionState:RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET,
                semanticLevel:null,
                targetReferenceType:TARGET_REFERENCE_TYPES.NONE,
                targetReference:null,
                sourcePredicateType:annotation.sourcePredicateType,
                contextSpans:freezeArray(annotation.contextSpans || []),
                blockerReasons:Object.freeze([]),
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null,
                boundary:'No-relation-target 是合法 not-applicable 结果，不应为了四选一强制制造 target。'
            });
        }

        if (annotation.annotationDisposition === 'configuration-state-only') {
            const configurationSpans = freezeArray((annotation.contextSpans || []).filter((span) => span.semanticLevelHint === 'configuration').map((span) => span.text));
            if (!configurationSpans.length) return unresolved(sourceCase, annotation, ['configuration-disposition-without-configuration-span']);
            return Object.freeze({
                sourceCaseId:sourceCase.id,
                annotationId:annotation.id,
                resolutionState:RESOLUTION_STATES.RESOLVED_CONFIGURATION,
                semanticLevel:'configuration',
                targetReferenceType:TARGET_REFERENCE_TYPES.CONFIGURATION_STATE,
                targetReference:Object.freeze({ configurationSpans }),
                sourcePredicateType:annotation.sourcePredicateType,
                blockerReasons:Object.freeze([]),
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null,
                boundary:'Configuration result 只保存 aggregate/state semantics，不创建 actor/group identity。'
            });
        }

        if (annotation.annotationDisposition !== 'relation-target-present') {
            return unresolved(sourceCase, annotation, ['unsupported-annotation-disposition']);
        }

        const levelEvidence = relationTargetLevel(annotation);
        if (!levelEvidence.level) return unresolved(sourceCase, annotation, ['mixed-or-missing-relation-target-level']);
        if (sourceCase.expectedTargetLevel && sourceCase.expectedTargetLevel !== levelEvidence.level) {
            return unresolved(sourceCase, annotation, ['source-case-and-annotation-target-level-mismatch']);
        }

        if (levelEvidence.level === 'role-class') {
            const roles = roleClasses(annotation);
            if (!roles.length) return unresolved(sourceCase, annotation, ['missing-role-class-reference']);
            return Object.freeze({
                sourceCaseId:sourceCase.id,
                annotationId:annotation.id,
                resolutionState:RESOLUTION_STATES.RESOLVED_ROLE_CLASS,
                semanticLevel:'role-class',
                targetReferenceType:TARGET_REFERENCE_TYPES.ROLE_CLASS,
                targetReference:Object.freeze({ roleClasses:roles }),
                relationUnitIds:freezeArray((annotation.relationUnits || []).map((unit) => unit.id)),
                blockerReasons:Object.freeze([]),
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null,
                boundary:'Theory-general role-class resolution 不绑定 chart actor，也不创建 chart edge。'
            });
        }

        if (levelEvidence.level === 'actor-set') {
            const group = (actorGroups || []).find((item) => item.sourceCaseId === sourceCase.id && String(item.status || '').startsWith('resolved')) || null;
            if (!group?.groupId) return unresolved(sourceCase, annotation, ['actor-set-group-identity-unresolved']);
            return Object.freeze({
                sourceCaseId:sourceCase.id,
                annotationId:annotation.id,
                resolutionState:RESOLUTION_STATES.RESOLVED_ACTOR_SET,
                semanticLevel:'actor-set',
                targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_GROUP,
                targetReference:Object.freeze({
                    groupId:group.groupId,
                    memberActorKeys:freezeArray(group.memberActorKeys || []),
                    cardinality:group.cardinality ?? null,
                    scope:group.scope || null,
                    targetRoleClass:group.targetRoleClass || null
                }),
                blockerReasons:Object.freeze([]),
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null,
                boundary:'Actor-set resolution 复用已审定 source-scoped group identity；不展开 member-specific relation edges。'
            });
        }

        if (levelEvidence.level === 'single-actor') {
            const binding = (hiddenBindings || []).find((item) => item.sourceCaseId === sourceCase.id && String(item.status || '').startsWith('resolved')) || null;
            if (!binding?.stableActorKey) return unresolved(sourceCase, annotation, ['single-actor-identity-unresolved']);
            return Object.freeze({
                sourceCaseId:sourceCase.id,
                annotationId:annotation.id,
                resolutionState:RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR,
                semanticLevel:'single-actor',
                targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_KEY,
                targetReference:Object.freeze({
                    actorKey:binding.stableActorKey,
                    scope:binding.scope || null,
                    targetRoleClass:binding.targetRoleClass || null,
                    antecedentSpan:binding.targetAntecedentSpan || null
                }),
                blockerReasons:Object.freeze([]),
                relationEffect:null,
                membershipMutation:null,
                numericWeight:null,
                boundary:'Single-actor resolution 复用 CASE-06 source-scoped hidden binding；不形成 generic hidden target rule。'
            });
        }

        return unresolved(sourceCase, annotation, ['unsupported-target-semantic-level']);
    };

    const buildProfile = () => {
        const actorGroupProfile = actorGroupProfileApi.buildProfile();
        const hiddenBindingProfile = hiddenBindingProfileApi.buildProfile();
        const resolutions = freezeArray((targetSource.AUDIT_CASES || []).map((sourceCase) => resolveCase(
            sourceCase,
            actorGroupProfile.resolvedGroups || [],
            hiddenBindingProfile.resolvedBindings || []
        )));
        const unresolvedResolutions = resolutions.filter((item) => item.resolutionState === RESOLUTION_STATES.UNRESOLVED);
        const applicableResolutions = resolutions.filter((item) => item.resolutionState !== RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET);
        return Object.freeze({
            status:unresolvedResolutions.length ? 'finite-curated-target-resolution-partial' : 'finite-curated-target-resolution-complete',
            resolverScope:CONTRACT.resolverScope,
            resolutions,
            applicableResolutions:freezeArray(applicableResolutions),
            unresolvedResolutions:freezeArray(unresolvedResolutions),
            coverageComplete:unresolvedResolutions.length === 0 && resolutions.length === (targetSource.AUDIT_CASES || []).length,
            globalResolver:null,
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Profile 只解析 8-case curated audit corpus；8/8 可确定不等于 broader relation source registry 或 global resolver 已完成。'
        });
    };

    GuiJia.baziContextualForcePartyCuratedTargetResolverProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        CONTRACT,
        relationTargetLevel,
        roleClasses,
        resolveCase,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);