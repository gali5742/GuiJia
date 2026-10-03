(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherProfile?.installed) return;
    const contract = GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherContract;
    const relation = GuiJia.baziContextualForcePartyRelationEffectContract;
    const relationProfile = GuiJia.baziContextualForcePartyRelationEffectProfile;
    const affiliationProfile = GuiJia.baziContextualForcePartyAffiliationProfile;
    const realization = GuiJia.baziVisibleStemFunctionRealizationSource;
    const normalization = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
    const execution = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
    const core = GuiJia.baziCore;
    if (!contract || !relation || !relationProfile || !affiliationProfile || !realization || !normalization || !execution || !core) return;
    const { VERSION, RULE_ID, MATCH_STATES, AUTHORIZATION_STATES, CONTRACT } = contract;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const actorInChart = (key = '', chartKey = '') => {
        const match = /^visible:([013]):([甲乙丙丁戊己庚辛壬癸])$/.exec(key);
        return !!match && Array.from(chartKey.split('|')[Number(match[1])] || '')[0] === match[2];
    };
    const rolesFor = (inventory, key, chartKey) => {
        const dayGan = Array.from(chartKey.split('|')[2] || '')[0];
        const expected = core.shiShenMap?.[dayGan]?.[key.split(':')[2]];
        const roles = relationProfile.actorTenGods(inventory, key);
        return expected && roles.length === 1 && roles[0] === expected ? roles : null;
    };
    const validateInput = ({ edge = {}, inventory = {}, chartKey = '' } = {}) => {
        const issues = [];
        if (!edge.id) issues.push('relation-id-missing');
        if (edge.directed !== true) issues.push('explicit-directed-relation-required');
        if (edge.relationScope !== 'cross-visible-actor') issues.push('cross-visible-actor-scope-required');
        if (!actorInChart(edge.sourceActorKey, chartKey) || !actorInChart(edge.targetActorKey, chartKey)) issues.push('visible-endpoint-chart-binding-invalid');
        if (edge.sourceActorKey === edge.targetActorKey) issues.push('distinct-endpoints-required');
        const profiles = inventory.actorProfiles || [];
        for (const key of [edge.sourceActorKey, edge.targetActorKey]) {
            if (profiles.filter((item) => item.actorKey === key).length !== 1) issues.push('unique-inventory-actor-required');
        }
        if (!rolesFor(inventory, edge.sourceActorKey || '', chartKey) || !rolesFor(inventory, edge.targetActorKey || '', chartKey)) issues.push('actor-role-chart-binding-invalid');
        const patterns = realization.DIRECT_SOURCE_PATTERNS.filter((item) => item.id === edge.sourcePatternId);
        const pattern = patterns.length === 1 ? patterns[0] : null;
        if (!pattern) issues.push('unique-registered-direct-source-pattern-required');
        if (pattern && (pattern.chartKey !== chartKey || pattern.sourceActorKey !== edge.sourceActorKey
            || pattern.targetActorKey !== edge.targetActorKey || pattern.functionType !== edge.functionType
            || pattern.relationScope !== edge.relationScope || pattern.realizationState !== edge.realizationState
            || pattern.scope !== 'exact-source-case-only')) issues.push('direct-source-pattern-binding-mismatch');
        if (!['realized-in-source-context','not-realized-in-source-context'].includes(edge.realizationState)) issues.push('independent-realization-unresolved');
        if (edge.sourceEvidenceRuleId !== realization.VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID
            || edge.sourceEvidenceKind !== 'direct-source-relation-outcome') issues.push('direct-source-realization-authority-required');
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray([...new Set(issues)]), pattern });
    };

    const matchAuthorization = (input = {}, index = 0) => {
        const { edge = {}, inventory = {}, chartKey = '', affiliationRecords = [] } = input;
        const validation = validateInput(input);
        const result = (state, issues = [], record = null, motif = null) => Object.freeze({
            id:`CF-RMAM-${String(index + 1).padStart(3, '0')}`,
            matchState:state,
            relationRecordId:edge.id || null,
            motifId:motif?.id || null,
            sourceRecord:record,
            blockerReasons:freezeArray(issues),
            authorization:Object.freeze({
                state:state === MATCH_STATES.MATCHED ? AUTHORIZATION_STATES.AUTHORIZED
                    : state === MATCH_STATES.UNMAPPED ? AUTHORIZATION_STATES.UNMAPPED : AUTHORIZATION_STATES.UNRESOLVED,
                sourceBacked:state === MATCH_STATES.MATCHED,
                relationTypes:freezeArray(motif ? [motif.relationType] : []),
                authorityIds:freezeArray(motif ? [motif.id] : []),
                sourceEvidenceIds:freezeArray(motif ? motif.sourceRegistryEvidenceIds : [])
            }),
            provenance:Object.freeze({
                chartKey,
                sourceActorKey:edge.sourceActorKey || null,
                targetActorKey:edge.targetActorKey || null,
                sourcePatternId:validation.pattern?.id || null,
                sourceContractId:realization.CONTRACT.id,
                sourceRuleId:edge.sourceEvidenceRuleId || null,
                sourceWording:edge.sourceTerm || null,
                positionPathScope:'exact-source-context-only'
            }),
            globalResolverDefined:false,
            positiveSourceCalibrationIntroduced:false
        });
        if (!validation.valid) return result(MATCH_STATES.UNRESOLVED, validation.issues);
        const sourceRoles = rolesFor(inventory, edge.sourceActorKey, chartKey);
        const targetRoles = rolesFor(inventory, edge.targetActorKey, chartKey);
        const candidates = relation.MOTIFS.filter((motif) => motif.functionType === edge.functionType
            && sourceRoles.some((role) => motif.sourceTenGods.includes(role))
            && targetRoles.some((role) => motif.targetTenGods.includes(role)));
        if (!candidates.length) return result(MATCH_STATES.UNMAPPED);
        if (candidates.length !== 1) return result(MATCH_STATES.UNRESOLVED, ['registered-motif-authority-conflict']);
        const motif = candidates[0];
        if (!motif.sourceRegistryEvidenceIds.length) return result(MATCH_STATES.UNRESOLVED, ['registered-motif-evidence-missing']);
        let record;
        if (motif.inputAuthority === 'existing-party-affiliation-record') {
            const expectedMotifs = affiliationProfile.MOTIFS.filter((item) => affiliationProfile.matchesMotif(edge, item, inventory));
            const compatible = affiliationRecords.filter((item) => item.id && item.relationRecordId === edge.id
                && item.sourceActorKey === edge.sourceActorKey && item.targetActorKey === edge.targetActorKey
                && item.sourcePatternId === edge.sourcePatternId && item.functionType === edge.functionType
                && item.relationScope === edge.relationScope
                && item.realizationState === edge.realizationState && item.blocked === false
                && item.affiliationState === affiliationProfile.stateForRealization(edge.realizationState)
                && item.affiliated === (edge.realizationState === 'realized-in-source-context')
                && expectedMotifs.some((expected) => expected.id === item.motifId
                    && normalization.sameSet(item.sourceRegistryEvidenceIds || [], expected.sourceEvidenceIds || [])));
            if (compatible.length !== 1) return result(MATCH_STATES.UNRESOLVED, ['unique-validated-affiliation-identity-required']);
            record = relationProfile.makeAugmentationRecord(compatible[0], motif, index);
        } else {
            if (!relationProfile.matchesRawMotif(edge, motif, inventory)) return result(MATCH_STATES.UNRESOLVED, ['registered-motif-membership-gate-failed']);
            record = relationProfile.makeRawRelationRecord(edge, motif, inventory, index);
        }
        record = Object.freeze({ ...record, sourceWording:edge.sourceTerm || null });
        return result(MATCH_STATES.MATCHED, [], record, motif);
    };

    const evaluateInput = (input = {}, index = 0) => {
        const match = matchAuthorization(input, index);
        const normalized = match.sourceRecord ? normalization.normalizeActorToActor(match.sourceRecord, index) : null;
        const edge = input.edge || {};
        // Invalid provenance must not retain a supplied positive/negative realization in execution.
        const fallback = Object.freeze({
            id:match.id,
            sourceEndpoint:Object.freeze({ type:'actor', actorKey:edge.sourceActorKey || null, cardinality:1, scope:'visible-stem' }),
            targetResolution:execution.targetResolutionForActor(edge.targetActorKey || '', 'visible-stem'),
            relationIdentity:Object.freeze({ id:edge.id || null, functionType:edge.functionType || null, directed:edge.directed === true }),
            realizationState:match.matchState === MATCH_STATES.UNRESOLVED ? 'unresolved' : edge.realizationState,
            authorization:match.authorization
        });
        const executionInput = normalized ? normalization.toExecutionInput(normalized) : fallback;
        return Object.freeze({ match, normalized, execution:execution.executeRelationEffect(executionInput || fallback) });
    };
    const buildProfile = (semanticModel = {}, synthesis = {}) => {
        const chartKey = realization.buildStructuredChartKey(semanticModel, synthesis) || '';
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const affiliationRecords = synthesis.contextualForcePartyAffiliationView?.records || [];
        const edges = (synthesis.visibleStemFunctionRealizationRecords || []).filter((edge) => edge.relationScope === 'cross-visible-actor');
        const results = freezeArray(edges.map((edge, index) => evaluateInput({ edge, inventory, chartKey, affiliationRecords }, index)));
        return Object.freeze({
            status:!results.length ? 'registered-motif-matcher-not-applicable'
                : results.some((item) => item.match.matchState === MATCH_STATES.UNRESOLVED) ? 'registered-motif-matcher-partial' : 'registered-motif-matcher-evaluated',
            results,
            evaluatedRelationCount:results.length,
            matchedRelationCount:results.filter((item) => item.match.matchState === MATCH_STATES.MATCHED).length,
            unmappedRelationCount:results.filter((item) => item.match.matchState === MATCH_STATES.UNMAPPED).length,
            unresolvedRelationCount:results.filter((item) => item.match.matchState === MATCH_STATES.UNRESOLVED).length,
            positiveSourceCalibrationIntroduced:false,
            genericEffectTypeAuthorizationResolverDefined:false,
            broaderSourceCoverageProven:false,
            relativeDominance:null,
            numericScore:null
        });
    };
    GuiJia.baziContextualForcePartyRegisteredMotifAuthorizationMatcherProfile = Object.freeze({
        installed:true, VERSION, RULE_ID, CONTRACT, MATCH_STATES,
        validateInput, matchAuthorization, evaluateInput, buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
