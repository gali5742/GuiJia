(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.9.2-dev';
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

  function arbitrate(question) {
    const text = normalize(question);
    if (!text) return null;

    // v0.9.2: recover omitted-querent borrowing phrases such as “找表哥借…”.
    if (/(?:这次)?找(?:家里|家人|朋友|同事|亲戚|表哥|表姐|姐姐|哥哥|父母|银行|熟人)[^，。？！?]{0,10}(?:借|周转)/.test(text)) {
      return { routeId:'borrow_money', evidence:'funds-inward-omitted-querent' };
    }

    const base = GuiJia.liuyaoSemanticRouteArbitrationV091;
    if (!base?.arbitrate) throw new Error('Semantic Arbitration v0.9.1 未加载');
    return base.arbitrate(question);
  }

  GuiJia.liuyaoSemanticRouteArbitrationV092 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
