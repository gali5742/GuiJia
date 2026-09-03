(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziResearchBootstrap?.installed) return;

    const VERSION = '0.3';
    const dependencies = Object.freeze([
        Object.freeze({ globalKey:'baziMonthCommand', src:'./js/bazi-month-command.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziStrengthSynthesis', src:'./js/bazi-strength-synthesis.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootEffectState', src:'./js/bazi-root-effect-state.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootSixRelations', src:'./js/bazi-root-six-relations.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashPreconditions', src:'./js/bazi-clash-preconditions.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashSeasonalPosition', src:'./js/bazi-clash-seasonal-position.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashNonseasonalForce', src:'./js/bazi-clash-nonseasonal-force.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziElementPresenceScope', src:'./js/bazi-element-presence-scope.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziClashRescueContext', src:'./js/bazi-clash-rescue-context.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootClashSourceOutcome', src:'./js/bazi-root-clash-source-outcome.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootClashInteractionEffect', src:'./js/bazi-root-clash-interaction-effect.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootActorInteractionAggregation', src:'./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziRootBaselineEffectiveness', src:'./js/bazi-root-baseline-effectiveness.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziStemBearingEffect', src:'./js/bazi-stem-bearing-effect.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionalAvailability', src:'./js/bazi-visible-stem-functional-availability.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionReachability', src:'./js/bazi-visible-stem-function-reachability.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemDirectedFunction', src:'./js/bazi-visible-stem-directed-function.js?v=13.44.0' }),
        Object.freeze({ globalKey:'baziVisibleStemFunctionCoverage', src:'./js/bazi-visible-stem-function-coverage.js?v=13.44.0' })
    ]);

    const canParserLoad = typeof document !== 'undefined' && document.readyState === 'loading';
    if (canParserLoad) {
        dependencies.forEach((dependency) => {
            if (GuiJia[dependency.globalKey]) return;
            document.write(`<script src="${dependency.src}"><\/script>`);
        });
    }

    GuiJia.baziResearchBootstrap = Object.freeze({
        installed:true,
        version:VERSION,
        mode:'explicit-research-opt-in',
        dependencies
    });
})(typeof window !== 'undefined' ? window : globalThis);
