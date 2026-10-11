(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyTransformationResultIdentityContract?.installed) return;
    const prior = GuiJia.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract;
    if (!prior) return;
    const { freeze } = prior;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-TRANSFORMATION-RESULT-IDENTITY-CONTRACT-001';
    const CONTRACT_ID = 'BAZI-CONTEXTUAL-FORCE-PARTY-TRANSFORMATION-RESULT-IDENTITY-CONTRACT-001';
    const STATES = freeze({ PROVENANCE_RESOLVED:'resolved-transformation-operation-and-result-provenance-only',
        INVALID:'invalid-transformation-result-identity-input',UNRESOLVED:'unresolved-transformation-result-identity',
        NOT_APPLICABLE:'transformation-result-identity-not-applicable' });
    const MATERIALIZATION_STATES = freeze({ MISSING:'transformation-result-materialization-missing',
        INVALID:'invalid-transformation-result-materialization-claim',
        UNREGISTERED:'well-formed-unregistered-transformation-result-materialization-claim' });
    // Schema validity does not create an authority entry. No source currently licenses materialization.
    const MATERIALIZATION_AUTHORITIES = freeze([]);
    const object = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
    const text = (v) => typeof v === 'string' && v.trim().length > 0;
    const keys = (v,list) => object(v) && Object.keys(v).length === list.length && list.every((k) => Object.hasOwn(v,k));
    const ids = (v) => Array.isArray(v) && v.length > 0 && Array.from(v).every(text) && new Set(v).size === v.length;
    const resultKeyFor = (record) => [record?.sourceCaseId,record?.operation?.id,record?.result?.id].every(text)
        ? `derived-result:${record.sourceCaseId}:${record.operation.id}:${record.result.id}` : null;
    const validateIdentityInput = (record) => {
        const issues = [];
        if (!keys(record,['schemaVersion','contractId','id','sourceCaseId','chartKey','sourceProvenance','operation','result'])) {
            return freeze({ valid:false,issues:['closed-transformation-identity-input-shape-required'] });
        }
        if (record.schemaVersion !== VERSION || record.contractId !== CONTRACT_ID) issues.push('transformation-identity-schema-version-mismatch');
        if (![record.id,record.sourceCaseId,record.chartKey].every(text)) issues.push('transformation-identity-reference-missing');
        const p = record.sourceProvenance,o = record.operation,r = record.result;
        if (!object(p) || p.id !== record.sourceCaseId || p.chartKey !== record.chartKey
            || ![p.sourceId,p.sourceTitle,p.sourceUrl,p.sourceText,p.retrievedOn].every(text)
            || !Object.hasOwn(p,'revisionId') || !(p.revisionId === null || text(p.revisionId))) issues.push('complete-linked-source-provenance-required');
        if (!keys(o,['id','kind','inputEndpoints','assertion','resultId']) || o.kind !== 'source-asserted-compound-transformation') {
            issues.push('closed-source-transformation-operation-required');
        }
        if (!keys(r,['id','nodeKind','operationId','assertion','labels','executableEndpoint'])
            || r.nodeKind !== 'source-asserted-transformation-result') issues.push('closed-transformation-result-provenance-required');
        if (!text(o?.id) || !text(r?.id) || new Set([record.id,record.sourceCaseId,o?.id,r?.id]).size !== 4) issues.push('distinct-case-record-operation-result-identities-required');
        if (o?.resultId !== r?.id || r?.operationId !== o?.id) issues.push('operation-result-provenance-link-mismatch');
        const operands = o?.inputEndpoints;
        if (!Array.isArray(operands) || operands.length < 2 || Array.from(operands).some((e) => !keys(e,['type','actorKey','scope','cardinality'])
            || e.type !== 'actor' || !text(e.actorKey) || !text(e.scope) || e.cardinality !== 1)
            || new Set(operands.map((e) => e?.actorKey)).size !== operands.length) issues.push('distinct-complete-original-operand-endpoints-required');
        if (Array.isArray(operands) && operands.some((e) => e?.actorKey === r?.id || e?.actorKey === o?.id)) issues.push('original-operand-cannot-alias-operation-or-result');
        for (const assertion of [o?.assertion,r?.assertion]) {
            if (!keys(assertion,['span','state','authorityId','evidenceIds']) || !text(assertion.span)
                || assertion.state !== 'asserted-in-exact-source-context' || !text(assertion.authorityId)
                || !ids(assertion.evidenceIds) || !assertion.evidenceIds.includes(record.sourceCaseId)
                || !assertion.evidenceIds.includes(assertion.authorityId) || !text(p?.sourceText) || !p.sourceText.includes(assertion.span)) {
                issues.push('linked-source-assertion-evidence-required');
            }
        }
        if (!keys(r?.labels,['element','role']) || !text(r.labels.element) || !text(r.labels.role)) issues.push('original-result-source-labels-required');
        if (r?.executableEndpoint !== null) issues.push('provenance-input-cannot-materialize-executable-endpoint');
        return freeze({ valid:!issues.length,issues:[...new Set(issues)],schemaValidityIsSourceAuthority:false });
    };
    const validateMaterializationClaim = (record,claim) => {
        const identityValidation = validateIdentityInput(record),issues = [...identityValidation.issues];
        if (!identityValidation.valid) return freeze({ valid:false,issues,schemaValidityIsMaterializationAuthority:false });
        if (!keys(claim,['id','sourceCaseId','chartKey','operationId','resultId','authorityId','sourceEvidenceIds','endpoint'])) {
            issues.push('closed-independent-materialization-claim-required');
        } else {
            if (![claim.id,claim.authorityId].every(text) || [record?.id,record?.sourceCaseId,record?.operation?.id,record?.result?.id].includes(claim.id)) issues.push('independent-materialization-record-identity-required');
            if (claim.sourceCaseId !== record.sourceCaseId || claim.chartKey !== record.chartKey
                || claim.operationId !== record.operation?.id || claim.resultId !== record.result?.id) issues.push('materialization-case-operation-result-link-mismatch');
            if (!ids(claim.sourceEvidenceIds) || !claim.sourceEvidenceIds.includes(claim.authorityId)
                || !claim.sourceEvidenceIds.includes(record.sourceCaseId)) issues.push('independent-materialization-source-evidence-required');
            if ([record.operation?.assertion?.authorityId,record.result?.assertion?.authorityId].includes(claim.authorityId)) issues.push('source-assertion-authority-is-not-materialization-authority');
            const e = claim.endpoint;
            if (!keys(e,['type','resultKey','scope','cardinality']) || e.type !== 'transformation-result'
                || e.scope !== 'source-case-operation-result' || e.cardinality !== 1
                || !identityValidation.valid || e.resultKey !== resultKeyFor(record)) issues.push('dedicated-source-case-result-endpoint-proposal-required');
        }
        return freeze({ valid:!issues.length,issues:[...new Set(issues)],schemaValidityIsMaterializationAuthority:false });
    };
    const CONTRACT = freeze({ id:CONTRACT_ID,version:VERSION,scope:'source-reviewed-transformation-operation-result-provenance-and-materialization-gates',
        inputOperandIdentityIsResultIdentity:false,resultProvenanceIdentityIsExecutableIdentity:false,
        schemaValidityIsSourceAuthority:false,materializationAuthorityCount:0,
        reservedMaterializationEndpointType:'transformation-result',reservedTypeIsKernelEndpointSupport:false,
        ordinaryStemOrPolarityRequiredForProvenance:false,resultSourceLabelsNormalizeTenGodClass:false,
        requiredMaterializationGates:['complete-linked-materialization-claim','independently-registered-source-materialization-authority',
            'authorized-materialized-result-inventory','execution-kernel-endpoint-support'],
        runtimeTransformationComputed:false,ordinaryActorReclassification:false,natalInventoryMutation:false,
        bladeTargetSelection:false,relationRealizationAuthorization:false,effectTypeAuthorityCreated:false,
        numericAggregation:false,relativeDominanceMapping:false,finalStrengthMapping:false,
        boundary:'R18 normalizes source-reviewed original operands, transformation operation and result provenance into distinct linked identities. Materialization has separate schema/authority/inventory/kernel gates; no authority is registered, no result actor is allocated, and the reserved proposal type is not added to R4. Source assertion cannot authorize a blade target, realization or effect.' });
    GuiJia.baziContextualForcePartyTransformationResultIdentityContract = freeze({ installed:true,VERSION,RULE_ID,CONTRACT,STATES,
        MATERIALIZATION_STATES,MATERIALIZATION_AUTHORITIES,validateIdentityInput,validateMaterializationClaim,resultKeyFor,freeze });
})(typeof window !== 'undefined' ? window : globalThis);
