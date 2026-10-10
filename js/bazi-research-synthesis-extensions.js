(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziResearchSynthesisExtensions?.installed) return;
    const synthesis = GuiJia.baziStrengthSynthesis;
    if (!synthesis || typeof synthesis.buildStrengthSynthesis !== 'function') return;
    const registeredNames = new Set();
    const registerExtension = (name, extend) => {
        if (typeof name !== 'string' || !name || typeof extend !== 'function') throw new TypeError('Research synthesis extension requires a name and function');
        if (registeredNames.has(name)) return false;
        // Capture the current builder, including any legacy wrapper installed since the previous registration.
        const current = GuiJia.baziStrengthSynthesis;
        const build = current.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...current,
            registerExtension,
            buildStrengthSynthesis:(semanticModel = {}) => extend(semanticModel, build(semanticModel))
        });
        registeredNames.add(name);
        return true;
    };
    GuiJia.baziStrengthSynthesis = Object.freeze({ ...synthesis, registerExtension });
    GuiJia.baziResearchSynthesisExtensions = Object.freeze({
        installed:true, version:'0.1', registerExtension,
        registeredNames:() => Object.freeze([...registeredNames])
    });
})(typeof window !== 'undefined' ? window : globalThis);
