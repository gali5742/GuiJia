(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract || null;
    const executionProfileApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile || null;
    if (!contractApi || !executionProfileApi) return;

    const {
        VERSION,
        RULE_ID,
        SOURCE_FAMILIES,
        NORMALIZATION_STATES,
        AUTHORITY_KINDS,
        SOURCE_FAMILY_REGISTRY,
        ACTOR_TO_ACTOR_MOTIFS,
        AUTHORIZATION_STATES,
        REALIZATION_STATES,
        ENDPOINT_TYPES,
        IDENTITY_SHAPES,
        TARGET_LEVELS,
        TARGET_RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        CONTRACT
    } = contractApi;

    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const canonical = (items = []) => unique(items).sort();
    const sameSet = (left = [], right = []) => {
        const a = canonical(left);
        const b = canonical(right);
        return a.length === b.length && a.every((item, index) => item === b[index]);
    };
    const scopeOfActorKey = (actorKey = '') => {
        const prefix = String(actorKey).split(':')[0];
        if (prefix === 'visible') return 'visible-stem';
        if (prefix === 'surface-branch') return 'surface-branch';
        if (prefix === 'hidden') return 'hidden-branch';
        return 'unknown';
    };
    const realizationFromSourceRecord = (record = {}) => {
        if ([REALIZATION_STATES.REALIZED,REALIZATION_STATES.NOT_REALIZED].includes(record.realizationState)) return record.realizationState;
        if (record.relationEffectState === 'realized-relation-effect-in-source-context' || record.realized === true) return REALIZATION_STATES.REALIZED;
        if (record.relationEffectState === 'not-realized-relation-effect-through-edge') return REALIZATION_STATES.NOT_REALIZED;
        return REALIZATION_STATES.UNRESOLVED;
    };

    const unresolvedRecord = ({ sourceFamily, sourceRecord = {}, index = 0, issues = [], identityShape = null }) => Object.freeze({
        id:`CF-EANI-${String(index + 1).padStart(3, '0')}`,
        normalizationState:NORMALIZATION_STATES.UNRESOLVED,
        sourceFamily,
        identityShape,
        relationType:sourceRecord.relationType || null,
        functionType:sourceRecord.functionType || null,
        sourceEndpoint:null,
        targetEndpoint:null,
        relationIdentity:null,
        realizationState:realizationFromSourceRecord(sourceRecord),
        authorization:Object.freeze({
            state:AUTHORIZATION_STATES.UNRESOLVED,
            relationTypes:Object.freeze([]),
            authorityIds:Object.freeze([]),
            sourceEvidenceIds:Object.freeze([]),
            sourceBacked:false
        }),
        provenance:Object.freeze({
            sourceContractId:SOURCE_FAMILY_REGISTRY[sourceFamily]?.sourceContractId || null,
            sourceRuleId:SOURCE_FAMILY_REGISTRY[sourceFamily]?.sourceRuleId || null,
            sourceRecordId:sourceRecord.id || null,
            sourceCaseId:sourceRecord.sourceCaseId || null,
            sourceAuthorityKind:SOURCE_FAMILY_REGISTRY[sourceFamily]?.authorityKind || null,
            sourceAuthorityIds:Object.freeze([]),
            sourceEvidenceIds:Object.freeze([]),
            sourceExecutionAuthority:sourceRecord.executionAuthority || null,
            sourceInputAuthority:sourceRecord.inputAuthority || null,
            sourceWording:sourceRecord.sourceWording || null,
            sourceOutcomeTerms:freezeArray(sourceRecord.sourceOutcomeTerms || [])
        }),
        expectedSourceEffectState:sourceRecord.relationEffectState || null,
        blockerReasons:freezeArray(unique(issues)),
        memberEffects:Object.freeze([]),
        membershipMutation:null,
        relativeDominance:null,
        numericWeight:null,
        scalarForce:null
    });

    const normalizedRecord = ({ sourceFamily, sourceRecord = {}, index = 0, sourceEndpoint, targetEndpoint, relationIdentity, authorization, provenance }) => Object.freeze({
        id:`CF-EANI-${String(index + 1).padStart(3, '0')}`,
        normalizationState:NORMALIZATION_STATES.RESOLVED,
        sourceFamily,
        identityShape:SOURCE_FAMILY_REGISTRY[sourceFamily].endpointShape,
        relationType:sourceRecord.relationType,
        functionType:sourceRecord.functionType,
        sourceEndpoint,
        targetEndpoint,
        relationIdentity,
        realizationState:realizationFromSourceRecord(sourceRecord),
        authorization,
        provenance,
        expectedSourceEffectState:sourceRecord.relationEffectState || null,
        blockerReasons:Object.freeze([]),
        memberEffects:Object.freeze([]),
        membershipMutation:null,
        relativeDominance:null,
        numericWeight:null,
        scalarForce:null,
        boundary:'Normalized authorization 只搬运已验证 source authority；source wording/case id 保留为 provenance，不参与 effect-type 决策，也不展开 actor-group member effects。'
    });

    const actorEndpoint = (actorKey = '', scope = null) => Object.freeze({
        type:ENDPOINT_TYPES.ACTOR,
        actorKey:actorKey || null,
        groupId:null,
        memberActorKeys:Object.freeze([]),
        cardinality:1,
        scope:scope || scopeOfActorKey(actorKey),
        sourceScoped:true
    });
    const groupEndpoint = ({ groupId = null, memberActorKeys = [], cardinality = null, scope = null } = {}) => Object.freeze({
        type:ENDPOINT_TYPES.ACTOR_GROUP,
        actorKey:null,
        groupId,
        memberActorKeys:freezeArray(memberActorKeys),
        cardinality,
        scope,
        sourceScoped:true
    });
    const relationIdentity = (record = {}) => Object.freeze({
        id:record.relationRecordId || record.sourceIdentityId || record.id || null,
        functionType:record.functionType || null,
        directed:true
    });
    const authorization = ({ relationType, authorityIds = [], sourceEvidenceIds = [] }) => Object.freeze({
        state:AUTHORIZATION_STATES.AUTHORIZED,
        relationTypes:freezeArray(relationType ? [relationType] : []),
        authorityIds:freezeArray(authorityIds),
        sourceEvidenceIds:freezeArray(sourceEvidenceIds),
        sourceBacked:true
    });
    const provenance = ({ sourceFamily, sourceRecord = {}, authorityIds = [], sourceEvidenceIds = [] }) => Object.freeze({
        sourceContractId:SOURCE_FAMILY_REGISTRY[sourceFamily].sourceContractId,
        sourceRuleId:SOURCE_FAMILY_REGISTRY[sourceFamily].sourceRuleId,
        sourceRecordId:sourceRecord.id || null,
        sourceCaseId:sourceRecord.sourceCaseId || null,
        sourceAuthorityKind:SOURCE_FAMILY_REGISTRY[sourceFamily].authorityKind,
        sourceAuthorityIds:freezeArray(authorityIds),
        sourceEvidenceIds:freezeArray(sourceEvidenceIds),
        sourceExecutionAuthority:sourceRecord.executionAuthority || null,
        sourceInputAuthority:sourceRecord.inputAuthority || null,
        sourceWording:sourceRecord.sourceWording || null,
        sourceOutcomeTerms:freezeArray(sourceRecord.sourceOutcomeTerms || [])
    });

    const normalizeActorToActor = (record = {}, index = 0) => {
        const sourceFamily = SOURCE_FAMILIES.ACTOR_TO_ACTOR_KNOWN_MOTIF;
        const motif = ACTOR_TO_ACTOR_MOTIFS.find((item) => item.id === record.motifId) || null;
        const issues = [];
        if (!record.id) issues.push('source-record-id-missing');
        if (!motif) issues.push('known-motif-authority-missing');
        if (!record.sourceActorKey) issues.push('source-actor-key-missing');
        if (!record.targetActorKey) issues.push('target-actor-key-missing');
        if (!record.functionType) issues.push('function-type-missing');
        if (!record.relationType) issues.push('relation-type-missing');
        if (motif && record.relationType !== motif.relationType) issues.push('relation-type-source-motif-mismatch');
        if (motif && record.functionType !== motif.functionType) issues.push('function-type-source-motif-mismatch');
        if (motif && record.inputAuthority !== motif.inputAuthority) issues.push('input-authority-source-motif-mismatch');
        if (motif && !sameSet(record.sourceRegistryEvidenceIds || [], motif.sourceRegistryEvidenceIds || [])) issues.push('source-evidence-source-motif-mismatch');
        if (record.relationType && !(CONTRACT.allowedRelationTypes || []).includes(record.relationType)) issues.push('relation-type-not-allowed');
        if (issues.length) return unresolvedRecord({ sourceFamily, sourceRecord:record, index, issues, identityShape:IDENTITY_SHAPES.ACTOR_TO_ACTOR });

        const authorityIds = [motif.id];
        const evidenceIds = freezeArray(record.sourceRegistryEvidenceIds || []);
        return normalizedRecord({
            sourceFamily,
            sourceRecord:record,
            index,
            sourceEndpoint:actorEndpoint(record.sourceActorKey),
            targetEndpoint:actorEndpoint(record.targetActorKey),
            relationIdentity:relationIdentity(record),
            authorization:authorization({ relationType:record.relationType, authorityIds, sourceEvidenceIds:evidenceIds }),
            provenance:provenance({ sourceFamily, sourceRecord:record, authorityIds, sourceEvidenceIds:evidenceIds })
        });
    };

    const normalizeActorToGroup = (record = {}, index = 0) => {
        const sourceFamily = SOURCE_FAMILIES.ACTOR_TO_GROUP_FINITE_OUTCOME;
        const issues = [];
        const members = record.targetMemberActorKeys || [];
        if (!record.id) issues.push('source-record-id-missing');
        if (record.status !== 'resolved-source-scoped-collective-relation-effect' || record.realized !== true) issues.push('source-record-not-resolved-realized');
        if (record.validation?.valid !== true) issues.push('source-record-validation-not-passed');
        if (record.executionAuthority !== AUTHORITY_KINDS.EXACT_COLLECTIVE_OUTCOME) issues.push('collective-execution-authority-mismatch');
        if (!record.sourceCaseId) issues.push('source-case-id-missing');
        if (!record.sourceActorKey) issues.push('source-actor-key-missing');
        if (!record.targetGroupId) issues.push('target-group-id-missing');
        if (!record.targetScope) issues.push('target-group-scope-missing');
        if (!Number.isInteger(record.targetCardinality) || record.targetCardinality <= 0) issues.push('target-group-cardinality-invalid');
        if (members.length !== record.targetCardinality || record.targetMembershipComplete !== true) issues.push('target-group-membership-incomplete');
        if (record.memberEdgeExpansion !== false || (record.memberEdges || []).length) issues.push('member-edge-expansion-detected');
        if (!record.functionType) issues.push('function-type-missing');
        if (!record.relationType || !(CONTRACT.allowedRelationTypes || []).includes(record.relationType)) issues.push('relation-type-not-allowed');
        if (issues.length) return unresolvedRecord({ sourceFamily, sourceRecord:record, index, issues, identityShape:IDENTITY_SHAPES.ACTOR_TO_GROUP });

        const authorityIds = [record.id];
        const evidenceIds = [record.sourceCaseId];
        return normalizedRecord({
            sourceFamily,
            sourceRecord:record,
            index,
            sourceEndpoint:actorEndpoint(record.sourceActorKey),
            targetEndpoint:groupEndpoint({ groupId:record.targetGroupId, memberActorKeys:members, cardinality:record.targetCardinality, scope:record.targetScope }),
            relationIdentity:relationIdentity(record),
            authorization:authorization({ relationType:record.relationType, authorityIds, sourceEvidenceIds:evidenceIds }),
            provenance:provenance({ sourceFamily, sourceRecord:record, authorityIds, sourceEvidenceIds:evidenceIds })
        });
    };

    const normalizeGroupToActor = (record = {}, index = 0) => {
        const sourceFamily = SOURCE_FAMILIES.GROUP_TO_ACTOR_FINITE_MEDIATION;
        const issues = [];
        const members = record.sourceMemberActorKeys || [];
        if (!record.id) issues.push('source-record-id-missing');
        if (record.status !== 'realized-relation-effect-in-source-context' || record.realized !== true) issues.push('source-record-not-resolved-realized');
        if (record.validation?.valid !== true) issues.push('source-record-validation-not-passed');
        if (record.executionAuthority !== AUTHORITY_KINDS.EXACT_COLLECTIVE_MEDIATION) issues.push('collective-mediation-authority-mismatch');
        if (!record.sourceCaseId) issues.push('source-case-id-missing');
        if (!record.sourceGroupId) issues.push('source-group-id-missing');
        if (!record.sourceScope) issues.push('source-group-scope-missing');
        if (!Number.isInteger(record.sourceCardinality) || record.sourceCardinality <= 0) issues.push('source-group-cardinality-invalid');
        if (members.length !== record.sourceCardinality) issues.push('source-group-membership-incomplete');
        if (record.sourceMemberEdgeExpansion !== false || (record.sourceMemberEdges || []).length) issues.push('source-member-edge-expansion-detected');
        if (!record.targetActorKey) issues.push('target-actor-key-missing');
        if (!record.functionType) issues.push('function-type-missing');
        if (!record.relationType || !(CONTRACT.allowedRelationTypes || []).includes(record.relationType)) issues.push('relation-type-not-allowed');
        if (issues.length) return unresolvedRecord({ sourceFamily, sourceRecord:record, index, issues, identityShape:IDENTITY_SHAPES.GROUP_TO_ACTOR });

        const authorityIds = unique([record.id,record.motifId]);
        const evidenceIds = [record.sourceCaseId];
        return normalizedRecord({
            sourceFamily,
            sourceRecord:record,
            index,
            sourceEndpoint:groupEndpoint({ groupId:record.sourceGroupId, memberActorKeys:members, cardinality:record.sourceCardinality, scope:record.sourceScope }),
            targetEndpoint:actorEndpoint(record.targetActorKey, record.targetScope || null),
            relationIdentity:relationIdentity(record),
            authorization:authorization({ relationType:record.relationType, authorityIds, sourceEvidenceIds:evidenceIds }),
            provenance:provenance({ sourceFamily, sourceRecord:record, authorityIds, sourceEvidenceIds:evidenceIds })
        });
    };

    const targetResolutionFromEndpoint = (endpoint = {}) => {
        if (endpoint.type === ENDPOINT_TYPES.ACTOR) {
            return Object.freeze({
                resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR,
                semanticLevel:TARGET_LEVELS.SINGLE_ACTOR,
                targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_KEY,
                targetReference:Object.freeze({ actorKey:endpoint.actorKey, scope:endpoint.scope })
            });
        }
        if (endpoint.type === ENDPOINT_TYPES.ACTOR_GROUP) {
            return Object.freeze({
                resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_ACTOR_SET,
                semanticLevel:TARGET_LEVELS.ACTOR_SET,
                targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_GROUP,
                targetReference:Object.freeze({ groupId:endpoint.groupId, memberActorKeys:freezeArray(endpoint.memberActorKeys || []), cardinality:endpoint.cardinality, scope:endpoint.scope })
            });
        }
        return Object.freeze({ resolutionState:TARGET_RESOLUTION_STATES.UNRESOLVED_UNIT, semanticLevel:null, targetReference:null });
    };

    const toExecutionInput = (record = {}) => {
        if (record.normalizationState !== NORMALIZATION_STATES.RESOLVED) return null;
        return Object.freeze({
            id:`EANI-EXEC:${record.id}`,
            sourceEndpoint:record.sourceEndpoint,
            targetResolution:targetResolutionFromEndpoint(record.targetEndpoint),
            relationIdentity:record.relationIdentity,
            realizationState:record.realizationState,
            authorization:record.authorization,
            normalizedAuthorizationInputId:record.id,
            sourceFamily:record.sourceFamily,
            expectedExistingEffectState:record.expectedSourceEffectState
        });
    };

    const compatibleWithExpectedState = (execution = {}, expected = null) => {
        if (!expected) return null;
        if (expected === 'realized-relation-effect-in-source-context') return execution.executionState === 'realized-generic-relation-effect';
        if (expected === 'not-realized-relation-effect-through-edge') return execution.executionState === 'not-realized-generic-relation-effect';
        if (expected === 'unresolved-relation-effect-through-edge') return execution.executionState === 'unresolved-generic-relation-effect';
        return null;
    };

    const buildProfile = (synthesis = {}) => {
        let index = 0;
        const actorToActorSource = synthesis.contextualForcePartyRelationEffectView?.records || [];
        const actorToGroupSource = synthesis.contextualForcePartyCollectiveRelationEffectRecords || [];
        const groupToActorSource = synthesis.contextualForcePartyCollectiveMediationEffectRecords || [];
        const records = [];
        actorToActorSource.forEach((record) => records.push(normalizeActorToActor(record, index++)));
        actorToGroupSource.forEach((record) => records.push(normalizeActorToGroup(record, index++)));
        groupToActorSource.forEach((record) => records.push(normalizeGroupToActor(record, index++)));
        const frozenRecords = freezeArray(records);
        const resolvedRecords = frozenRecords.filter((item) => item.normalizationState === NORMALIZATION_STATES.RESOLVED);
        const unresolvedRecords = frozenRecords.filter((item) => item.normalizationState === NORMALIZATION_STATES.UNRESOLVED);
        const familyCounts = Object.freeze(Object.fromEntries(Object.values(SOURCE_FAMILIES).map((family) => [family,Object.freeze({
            total:frozenRecords.filter((item) => item.sourceFamily === family).length,
            resolved:resolvedRecords.filter((item) => item.sourceFamily === family).length,
            unresolved:unresolvedRecords.filter((item) => item.sourceFamily === family).length
        })])));
        return Object.freeze({
            status:unresolvedRecords.length ? 'normalized-effect-authorization-input-partial' : 'normalized-effect-authorization-input-complete-for-provided-source-records',
            sourceRecordCount:frozenRecords.length,
            records:frozenRecords,
            resolvedRecords:freezeArray(resolvedRecords),
            unresolvedRecords:freezeArray(unresolvedRecords),
            familyCounts,
            providedSourceRecordCoverageComplete:frozenRecords.length === actorToActorSource.length + actorToGroupSource.length + groupToActorSource.length && unresolvedRecords.length === 0,
            genericEffectTypeAuthorizationResolverDefined:false,
            broaderSourceCoverageProven:false,
            memberEffects:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Profile 只规整当前三类已验证 source authority；未登记来源、generic function→effect mapping 与 broader source coverage 均不在本层解决。'
        });
    };

    const buildExecutionCalibration = (synthesis = {}) => {
        const profile = buildProfile(synthesis);
        const inputs = freezeArray(profile.resolvedRecords.map(toExecutionInput).filter(Boolean));
        const executions = freezeArray(inputs.map((input) => executionProfileApi.executeRelationEffect(input)));
        const compatibility = freezeArray(executions.map((execution, index) => compatibleWithExpectedState(execution, inputs[index].expectedExistingEffectState)));
        const comparableCount = compatibility.filter((item) => item != null).length;
        const mismatchCount = compatibility.filter((item) => item === false).length;
        return Object.freeze({
            normalizedRecordCount:profile.resolvedRecords.length,
            inputCount:inputs.length,
            executions,
            comparableCount,
            mismatchCount,
            compatible:comparableCount === 0 ? null : mismatchCount === 0,
            endpointShapes:freezeArray(unique(executions.map((item) => item.identityShape))),
            memberEffectCount:executions.reduce((sum, item) => sum + (item.memberEffects || []).length, 0),
            boundary:'Calibration 只证明 normalized authorization 可无损进入既有 generic execution kernel；不产生新的 authorization，也不扩大 effect-type mapping。'
        });
    };

    GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_FAMILIES,
        NORMALIZATION_STATES,
        CONTRACT,
        canonical,
        sameSet,
        scopeOfActorKey,
        realizationFromSourceRecord,
        normalizeActorToActor,
        normalizeActorToGroup,
        normalizeGroupToActor,
        targetResolutionFromEndpoint,
        toExecutionInput,
        compatibleWithExpectedState,
        buildProfile,
        buildExecutionCalibration
    });
})(typeof window !== 'undefined' ? window : globalThis);
