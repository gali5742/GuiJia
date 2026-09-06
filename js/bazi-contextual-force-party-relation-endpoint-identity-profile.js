(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEndpointIdentityProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyRelationEndpointIdentityContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, ENDPOINT_TYPES, IDENTITY_SHAPES, KNOWN_SHAPE_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const classifyRecordShape = (record = {}) => {
        const hasSourceActor = Boolean(record.sourceActorKey);
        const hasSourceGroup = Boolean(record.sourceGroupId);
        const hasTargetActor = Boolean(record.targetActorKey);
        const hasTargetGroup = Boolean(record.targetGroupId);

        if (hasSourceActor && !hasSourceGroup && hasTargetActor && !hasTargetGroup) return IDENTITY_SHAPES.ACTOR_TO_ACTOR;
        if (hasSourceActor && !hasSourceGroup && !hasTargetActor && hasTargetGroup) return IDENTITY_SHAPES.ACTOR_TO_GROUP;
        if (!hasSourceActor && hasSourceGroup && hasTargetActor && !hasTargetGroup) return IDENTITY_SHAPES.GROUP_TO_ACTOR;
        if (!hasSourceActor && hasSourceGroup && !hasTargetActor && hasTargetGroup) return IDENTITY_SHAPES.GROUP_TO_GROUP;
        return null;
    };

    const validateRecordShape = (record = {}, expectedShape = null) => {
        const issues = [];
        const classifiedShape = classifyRecordShape(record);
        if (!classifiedShape) issues.push('endpoint-shape-ambiguous-or-incomplete');
        if (expectedShape && classifiedShape !== expectedShape) issues.push('endpoint-shape-source-bucket-mismatch');
        if (record.relationIdentityType && classifiedShape && record.relationIdentityType !== classifiedShape) issues.push('declared-relation-identity-type-mismatch');
        if (classifiedShape === IDENTITY_SHAPES.GROUP_TO_GROUP) issues.push('group-to-group-shape-not-defined');
        if (classifiedShape && classifiedShape !== IDENTITY_SHAPES.GROUP_TO_GROUP && !KNOWN_SHAPE_REGISTRY[classifiedShape]) issues.push('endpoint-shape-not-registered');
        if (record.memberEdgeExpansion === true || record.sourceMemberEdgeExpansion === true) issues.push('group-member-edge-expansion-detected');
        return Object.freeze({
            valid:issues.length === 0,
            classifiedShape,
            issues:freezeArray(issues)
        });
    };

    const makeObservedRecord = (record = {}, expectedShape = '', sourceBucket = '') => {
        const validation = validateRecordShape(record, expectedShape);
        return Object.freeze({
            recordId:record.id || record.relationRecordId || null,
            sourceBucket,
            expectedShape,
            classifiedShape:validation.classifiedShape,
            relationType:record.relationType || null,
            relationEffectState:record.relationEffectState || null,
            valid:validation.valid,
            issues:validation.issues
        });
    };

    const buildProfile = (synthesis = {}) => {
        const actorToActorRecords = synthesis.contextualForcePartyRelationEffectView?.records || [];
        const actorToGroupRecords = synthesis.contextualForcePartyCollectiveRelationEffectRecords || [];
        const groupToActorRecords = synthesis.contextualForcePartyCollectiveMediationEffectRecords || [];
        const observedRecords = freezeArray([
            ...actorToActorRecords.map((record) => makeObservedRecord(record, IDENTITY_SHAPES.ACTOR_TO_ACTOR, 'relation-effect-view')),
            ...actorToGroupRecords.map((record) => makeObservedRecord(record, IDENTITY_SHAPES.ACTOR_TO_GROUP, 'collective-relation-effect')),
            ...groupToActorRecords.map((record) => makeObservedRecord(record, IDENTITY_SHAPES.GROUP_TO_ACTOR, 'collective-mediation-effect'))
        ]);
        const blockerRecords = observedRecords.filter((item) => !item.valid);
        const contractShapes = Object.keys(KNOWN_SHAPE_REGISTRY);
        const contractShapeCoverageComplete = [
            IDENTITY_SHAPES.ACTOR_TO_ACTOR,
            IDENTITY_SHAPES.ACTOR_TO_GROUP,
            IDENTITY_SHAPES.GROUP_TO_ACTOR
        ].every((shape) => contractShapes.includes(shape)) && !contractShapes.includes(IDENTITY_SHAPES.GROUP_TO_GROUP);

        return Object.freeze({
            status:blockerRecords.length ? 'known-endpoint-identity-shape-validation-partial' : 'known-endpoint-identity-shape-validation-complete',
            resolverScope:CONTRACT.resolverScope,
            endpointTypes:freezeArray(Object.values(ENDPOINT_TYPES)),
            knownIdentityShapes:freezeArray(contractShapes),
            contractShapeCoverageComplete,
            groupToGroupDefined:false,
            observedRecords,
            blockerRecords:freezeArray(blockerRecords),
            observedRecordCount:observedRecords.length,
            observedRecordsValid:blockerRecords.length === 0,
            endpointShapeDefinesEffectType:false,
            endpointShapeDefinesRealization:false,
            genericRelationEffectResolverDefined:false,
            relativeDominance:null,
            numericScore:null,
            boundary:'Profile 只验证已有 relation-effect records 是否符合各自 endpoint identity shape。actor→actor、actor→group、group→actor 的存在不互相泛化；没有观察 record 时只表示该次 synthesis 无实例，不影响 shape contract 本身。'
        });
    };

    GuiJia.baziContextualForcePartyRelationEndpointIdentityProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        ENDPOINT_TYPES,
        IDENTITY_SHAPES,
        KNOWN_SHAPE_REGISTRY,
        CONTRACT,
        classifyRecordShape,
        validateRecordShape,
        makeObservedRecord,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
