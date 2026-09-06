(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPathPair?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCounterfactualPathPairContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCounterfactualPathPairProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT, SOURCE_REGISTRY } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const unique = (items = []) => [...new Set((items || []).filter(Boolean))];
    const sourceIds = freezeArray(Object.keys(SOURCE_REGISTRY));

    const buildAudit = () => {
        const profile = profileApi.buildProfile();
        return Object.freeze({
            id:'CF-PARTY-COUNTERFACTUAL-PATH-PAIR-V01', version:VERSION, ruleId:RULE_ID,
            status:profile.finiteCoverageComplete ? 'counterfactual-path-pair-source-scoped-complete' : 'counterfactual-path-pair-partial',
            contract:CONTRACT, profile, pairCount:profile.pairs.length, resolvedPairCount:profile.resolvedPairs.length,
            finiteCoverageComplete:profile.finiteCoverageComplete, sourceScopedCounterfactualPathPairDefined:true,
            runtimePairSelectorDefined:false, sourcePairAuthorizesExecution:false, alternateChartDefined:false,
            relativeDominance:null, numericScore:null, scalarForce:null, sourceIds
        });
    };

    const claim = (audit) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR', claimKey:'strength.contextual-force.party.competing-path.counterfactual-path-pair',
        status:audit.finiteCoverageComplete ? 'resolved' : 'unresolved', ruleId:RULE_ID,
        value:Object.freeze({ sourceIds, coverageComplete:audit.finiteCoverageComplete, runtimePairSelectorDefined:false, sourcePairAuthorizesExecution:false }),
        sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:freezeArray(['CF-PCPA-REC-01','CF-RSMS-E04','CF-RSMS-E05']),
        rationale:'程潜命例的 source-scoped placement alternative 已闭合，徐氏 E04/E05 又明确给出实际“财生煞旺，时上食制之”与反事实“食神生财，财生煞”的两套解释，因此可保存一对 placement-sensitive source path compositions。',
        boundary:'这只是 contested modern commentary 的 source interpretation pair；不生成 alternate chart，不选择 runtime branch，不执行 relation edge，也不成为古典通用规则。'
    });

    const dep = ({ id, kind='semantic-model', scope, status, statement, boundary, dependsOn=[], resolvedBy=[] }) => Object.freeze({ id, kind, scope, status, ruleId:RULE_ID, sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), sourceRegistryEvidenceIds:freezeArray(['CF-PCPA-REC-01','CF-RSMS-E04','CF-RSMS-E05']), dependsOnDependencyIds:freezeArray(dependsOn), resolvedByClaimIds:freezeArray(resolvedBy), statement, boundary });
    const rebuild = (base,id,additions,statement,boundary) => {
        const current=(base.dependencies||[]).find((item)=>item.id===id)||{};
        return Object.freeze({ ...current,id,status:'unresolved',ruleId:RULE_ID,dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds||[]),...additions.map((item)=>item.id)])),resolvedByClaimIds:Object.freeze([]),statement,boundary });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySourceScopedSequentialComposition) return base;
        const audit=buildAudit(); const c=claim(audit);
        const contractDep=dep({ id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR-CONTRACT',kind:'source-audit',scope:'chengqian-placement-sensitive-source-path-pair-contract',status:'resolved',statement:'Counterfactual Path Pair v0.1 已定义实际/反事实两套 source composition 的分层合同。',boundary:'合同不定义 runtime selector 或 executable edges。',dependsOn:['SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE'],resolvedBy:[c.id] });
        const coverageDep=dep({ id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR-FINITE-COVERAGE',kind:'source-coverage',scope:'chengqian-counterfactual-path-pair-coverage',status:audit.finiteCoverageComplete?'resolved':'unresolved',statement:audit.finiteCoverageComplete?'程潜命例 source interpretation pair 已 1/1 通过 validator。':'程潜 path pair 尚未闭合。',boundary:'只覆盖徐氏这一 contested modern case。',dependsOn:[contractDep.id],resolvedBy:audit.finiteCoverageComplete?[c.id]:[] });
        const pairDep=dep({ id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR',scope:'source-scoped-placement-sensitive-path-pair',status:coverageDep.status,statement:'实际盘保存“财生煞 + 食制煞”，反事实保存“食生财 → 财生煞”；两套解释保持 source-scoped distinct。',boundary:'不得把 pair 当二选一 runtime 分支，更不得据此构造 alternate chart。',dependsOn:[contractDep.id,coverageDep.id],resolvedBy:coverageDep.status==='resolved'?[c.id]:[] });
        const coverage=rebuild(base,'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE',[coverageDep,pairDep],'Competing Path corpus 现新增程潜 placement-sensitive source pair coverage，但 broader corpus 仍未证明完整，因此 coverage 继续 unresolved。','不得把一条现代 contested case 当全 corpus coverage。');
        const resolution=rebuild(base,'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION',[pairDep,coverage],'REC-01/02 sequential composition 与程潜 counterfactual path pair 已 source-scoped resolved；但 REC-03 proximity、REC-04 relative-capacity、任意 chart matcher 与 broader coverage 仍未闭合。','不得把 source pair 转成通用 path winner、distance priority 或 numeric dominance。');
        const replaced=new Set([contractDep.id,coverageDep.id,pairDep.id,coverage.id,resolution.id]);
        const claims=Object.freeze([...(base.claims||[]).filter((item)=>item.id!==c.id),c]);
        const dependencies=Object.freeze([...(base.dependencies||[]).filter((item)=>!replaced.has(item.id)),contractDep,coverageDep,pairDep,coverage,resolution]);
        const conflicts=priorSynthesisApi.detectConflicts?priorSynthesisApi.detectConflicts(claims):(base.conflicts||Object.freeze([]));
        const sufficiency=priorSynthesisApi.buildSufficiency?priorSynthesisApi.buildSufficiency({dependencies,conflicts,activeRuleIds:base.activeRuleIds||[]}):base.sufficiency;
        return Object.freeze({ ...base,claims,dependencies,conflicts,contextualForcePartyCounterfactualPathPair:audit,contextualForcePartyCounterfactualPathPairRuleIds:Object.freeze([RULE_ID]),sufficiency,boundaries:Object.freeze([...(base.boundaries||[]),'Counterfactual Path Pair v0.1 只保存程潜命例实际“财生煞+食制煞”与反事实“食生财→财生煞”的 source interpretation pair。','徐氏 interpretationContested provenance 保留；pair 不授权 relation execution、alternate chart、numeric priority、Relative Dominance、Strength 或 Assessment。']) });
    };

    priorSynthesisApi.registerExtension('contextual-force-party-counterfactual-path-pair-v01',extendSynthesis);
    GuiJia.baziContextualForcePartyCounterfactualPathPair=Object.freeze({installed:true,VERSION,RULE_ID,CONTRACT,buildAudit,extendSynthesis});
})(typeof window !== 'undefined' ? window : globalThis);
