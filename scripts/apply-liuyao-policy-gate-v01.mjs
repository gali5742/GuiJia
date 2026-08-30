import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const replaceOnce = (relative, before, after) => {
  const file = path.join(root, relative);
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(after)) return false;
  if (!source.includes(before)) throw new Error(`expected patch anchor missing: ${relative}`);
  fs.writeFileSync(file, source.replace(before, after), 'utf8');
  return true;
};

replaceOnce(
  'js/app.js',
  "            const { buildLiuYaoLiterature } = window.GuiJia.liuyaoLiterature;",
  "            const { evaluate: evaluateLiuYaoDivinationPolicy } = window.GuiJia.liuyaoDivinationPolicyGateV01;\n            const { buildLiuYaoLiterature } = window.GuiJia.liuyaoLiterature;"
);
replaceOnce(
  'js/app.js',
  "            const calculateLiuYao = () => {\n                errorMsg.value = '';\n                copyLiuYaoContextStatus.value = '';\n                try {\n                    const rawValues = liuyaoForm.lines.map((value) => Number(value));",
  "            const calculateLiuYao = () => {\n                errorMsg.value = '';\n                copyLiuYaoContextStatus.value = '';\n                const policyDecision = evaluateLiuYaoDivinationPolicy(liuyaoForm.question);\n                if (!policyDecision.allowed) {\n                    errorMsg.value = '当前不提供健康或疾病相关占问分析。';\n                    return;\n                }\n                try {\n                    const rawValues = liuyaoForm.lines.map((value) => Number(value));"
);
replaceOnce(
  'js/liuyao-core.js',
  "id:'career-litigation-illness', target:'官鬼',\n            strongTerms:['求职','面试','录用','入职','升职','转正','跳槽','职位','官司','诉讼','仲裁','疾病','病情'],\n            relatedTerms:['工作','事业','职业'],\n            reason:'占问明确涉及任职结果、诉讼或疾病，优先参考官鬼爻。'",
  "id:'career-litigation', target:'官鬼',\n            strongTerms:['求职','面试','录用','入职','升职','转正','跳槽','职位','官司','诉讼','仲裁'],\n            relatedTerms:['工作','事业','职业'],\n            reason:'占问明确涉及任职结果或诉讼，优先参考官鬼爻。'"
);
replaceOnce(
  'js/liuyao-core.js',
  "{ id:'career-health', target:'官鬼', label:'工作、职位、诉讼与疾病', description:'任职工作、诉讼、疾病等。' },",
  "{ id:'career-litigation', target:'官鬼', label:'工作、职位与诉讼', description:'任职工作、职位变动、诉讼等。' },"
);
replaceOnce(
  'index.html',
  '<script src="./js/liuyao-core.js?v=13.44.0"></script>\n<script src="./js/liuyao-interpretation.js?v=13.44.0"></script>',
  '<script src="./js/liuyao-core.js?v=13.44.0"></script>\n<script src="./js/liuyao-divination-policy-gate-v01.js?v=13.44.0"></script>\n<script src="./js/liuyao-interpretation.js?v=13.44.0"></script>'
);

console.log('LiuYao Divination Policy Gate v0.1 production integration patch applied or already present.');
