import './liuyao-divination-policy-gate-v01.js';

const gate = globalThis.GuiJia?.liuyaoDivinationPolicyGateV01;
if (!gate?.evaluate) throw new Error('LiuYao Divination Policy Gate v0.1 is unavailable');

// Shared semantic entrypoint for v0.13+ PoC/runtime. Historical sealed stacks remain untouched.
export const semanticPolicyEntryV01 = Object.freeze({
  version:'0.1',
  evaluate:gate.evaluate
});
