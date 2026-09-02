(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_abstention_contract';
    const RESOLVER_REF = 'PRR-TRAVEL-ALTERNATIVE-ANCHOR';
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateAlternative = (alternative, index) => {
        const issues = [];
        if (!alternative || typeof alternative !== 'object' || Array.isArray(alternative)) {
            return [issue('alternative_object_required', { index })];
        }
        if (!hasText(alternative.alternativeId)) issues.push(issue('alternative_id_required', { index }));
        if (!hasText(alternative.semanticDestinationRef)) issues.push(issue('semantic_destination_ref_required', { index }));
        return issues;
    };

    const validateInput = ({ readingRef, travelerRelationToQuerent, alternatives } = {}) => {
        const issues = [];
        if (!hasText(readingRef)) issues.push(issue('reading_ref_required'));
        if (!hasText(travelerRelationToQuerent)) issues.push(issue('traveler_relation_required'));
        if (!Array.isArray(alternatives) || !alternatives.length) {
            issues.push(issue('alternatives_nonempty_array_required'));
        } else {
            alternatives.forEach((alternative, index) => issues.push(...validateAlternative(alternative, index)));
            const ids = alternatives.map((item) => item?.alternativeId).filter(hasText);
            if (new Set(ids).size !== ids.length) issues.push(issue('alternative_ids_must_be_unique'));
            const destinations = alternatives.map((item) => item?.semanticDestinationRef).filter(hasText);
            if (new Set(destinations).size !== destinations.length) issues.push(issue('semantic_destination_refs_must_be_unique'));
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const unresolvedAlternative = (alternative, code) => ({
        alternativeId:alternative?.alternativeId || null,
        semanticDestinationRef:alternative?.semanticDestinationRef || null,
        anchorStatus:'unresolved',
        traditionalSelector:null,
        anchorEvidenceRefs:[],
        issues:[issue(code)]
    });

    const resolveTravelAlternativeAnchors = (input = {}) => {
        const validation = validateInput(input);
        if (validation.status !== 'valid') {
            return {
                resolverRef:RESOLVER_REF,
                version:VERSION,
                status:'unresolved',
                readingRef:hasText(input.readingRef) ? input.readingRef : null,
                alternatives:[],
                comparisonReady:false,
                issues:validation.issues,
                formalEligible:false
            };
        }

        const { readingRef, travelerRelationToQuerent, alternatives } = input;
        if (alternatives.length > 1) {
            return {
                resolverRef:RESOLVER_REF,
                version:VERSION,
                status:'unresolved',
                readingRef,
                alternatives:alternatives.map((alternative) => unresolvedAlternative(alternative,'named_multi_destination_anchor_not_supported')),
                comparisonReady:false,
                issues:[issue('multi_alternative_traditional_anchor_unresolved')],
                formalEligible:false
            };
        }

        const alternative = alternatives[0];
        if (travelerRelationToQuerent !== 'self') {
            return {
                resolverRef:RESOLVER_REF,
                version:VERSION,
                status:'partial',
                readingRef,
                alternatives:[unresolvedAlternative(alternative,'represented_traveler_destination_anchor_requires_general_relation_provider')],
                comparisonReady:false,
                issues:[issue('represented_traveler_single_destination_not_resolved_here')],
                formalEligible:false
            };
        }

        return {
            resolverRef:RESOLVER_REF,
            version:VERSION,
            status:'resolved',
            readingRef,
            alternatives:[{
                alternativeId:alternative.alternativeId,
                semanticDestinationRef:alternative.semanticDestinationRef,
                anchorStatus:'resolved',
                traditionalSelector:{ type:'ying' },
                anchorEvidenceRefs:['TR-TV-001-A:single_bounded_destination'],
                issues:[]
            }],
            comparisonReady:false,
            issues:[issue('single_destination_resolved_but_multi_alternative_comparison_not_applicable')],
            formalEligible:false
        };
    };

    const describeResolver = () => ({
        version:VERSION,
        status:STATUS,
        resolverRef:RESOLVER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        singleSelfDestinationSupported:true,
        representedTravelerSupported:false,
        namedMultiDestinationSupported:false,
        comparisonReadyForMultipleAlternatives:false,
        hardcodedAlternativePositions:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoTravelAlternativeAnchorPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        resolverRef:RESOLVER_REF,
        currentRuntimeReachable:false,
        registered:false,
        formalEligible:false,
        validateInput,
        resolveTravelAlternativeAnchors,
        describeResolver
    });
})(typeof window !== 'undefined' ? window : globalThis);
