import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const target = path.resolve(root, process.argv[2] || '.');
const mode = process.argv[3] || 'source';
const indexPath = path.join(target, 'index.html');

function fail(message) {
  throw new Error(message);
}
function isRemote(value) {
  return /^https?:\/\//i.test(value);
}
function isIgnorable(value) {
  return !value || value.startsWith('#') || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:');
}
function cleanLocal(value) {
  const stripped = value.split('#', 1)[0].split('?', 1)[0];
  return stripped.replace(/^\.\//, '');
}

if (!fs.existsSync(indexPath)) fail(`Missing index.html: ${indexPath}`);
const html = fs.readFileSync(indexPath, 'utf8');

const refs = [];
for (const match of html.matchAll(/<(script|img|link)\b[^>]*?\b(src|href)=["']([^"']+)["'][^>]*>/gi)) {
  refs.push({ tag: match[1].toLowerCase(), attr: match[2].toLowerCase(), value: match[3] });
}

const missing = [];
const remoteScripts = [];
for (const ref of refs) {
  if (isIgnorable(ref.value)) continue;
  if (isRemote(ref.value)) {
    if (ref.tag === 'script') remoteScripts.push(ref.value);
    continue;
  }
  const local = cleanLocal(ref.value);
  if (!local) continue;
  const file = path.join(target, local);
  if (!fs.existsSync(file)) missing.push(`${ref.tag} ${ref.attr}=${ref.value}`);
}

if (missing.length) fail(`Missing local resources:\n- ${missing.join('\n- ')}`);

if (mode === 'deployed') {
  if (remoteScripts.length) fail(`Deployed artifact contains remote executable scripts:\n- ${remoteScripts.join('\n- ')}`);
  for (const expected of ['vendor/vue.global.prod.js', 'vendor/lunar.js', 'assets/app.css', 'assets/tailwind-utilities.css', 'js/app.js']) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing required file: ${expected}`);
  }
  const liuyaoContextualRoleBlindRequirements = [
    'semantic-contextual-object-role-blind-eval.html',
    'data/liuyao-contextual-object-role-blind-eval-v0.2.json',
    'js/liuyao-contextual-object-role-adapter.js',
    'js/liuyao-contextual-object-role-poc.js'
  ];
  for (const expected of liuyaoContextualRoleBlindRequirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao contextual role blind file: ${expected}`);
  }
  const liuyaoRouterV071Requirements = [
    'semantic-router-poc-v07.html',
    'js/liuyao-semantic-router-poc-v07.js',
    'data/liuyao-semantic-route-inventory-v0.2.json',
    'data/liuyao-semantic-route-training-v0.4-expansion.json',
    'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json'
  ];
  for (const expected of liuyaoRouterV071Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao semantic router v0.7.1 file: ${expected}`);
  }
  const liuyaoRouterV08Requirements = [
    'semantic-router-poc-v08.html',
    'js/liuyao-semantic-router-poc-v08.js',
    'data/liuyao-semantic-route-training-v0.5-targeted-22.json'
  ];
  for (const expected of liuyaoRouterV08Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao semantic router v0.8 file: ${expected}`);
  }
  const liuyaoRouterV081Requirements = [
    'semantic-router-poc-v081.html',
    'js/liuyao-semantic-router-poc-v081.js'
  ];
  for (const expected of liuyaoRouterV081Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao semantic router v0.8.1 file: ${expected}`);
  }
  const liuyaoRouterCandidateEvalRequirements = [
    'semantic-router-candidate-eval-v01.html',
    'js/liuyao-semantic-router-candidate-eval-v01.js',
    'data/liuyao-semantic-router-candidate-eval-v0.1.json',
    'js/liuyao-semantic-sufficiency.js'
  ];
  for (const expected of liuyaoRouterCandidateEvalRequirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao fresh candidate eval file: ${expected}`);
  }
  const liuyaoRouterDecisionV09Requirements = [
    'semantic-router-decision-v09.html',
    'js/liuyao-semantic-router-decision-v09.js',
    'js/liuyao-semantic-route-arbitration-v09.js',
    'data/liuyao-semantic-router-decision-v0.9-development.json',
    'data/liuyao-semantic-router-decision-v0.9-development-patch.json'
  ];
  for (const expected of liuyaoRouterDecisionV09Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao router decision v0.9 file: ${expected}`);
  }
  const liuyaoScopeGateV01Requirements = [
    'semantic-scope-gate-v01.html',
    'js/liuyao-semantic-scope-gate-v01.js',
    'data/liuyao-semantic-scope-gate-v0.1-development.json',
    'data/liuyao-semantic-scope-gate-v0.1-preuse-patch.json',
    'js/liuyao-semantic-route-arbitration-v091.js',
    'data/liuyao-semantic-router-decision-v0.9-validation-responsibility-audit.json'
  ];
  for (const expected of liuyaoScopeGateV01Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao Scope Gate v0.1 / arbitration v0.9.1 file: ${expected}`);
  }
  const liuyaoDecisionStackV010Requirements = [
    'semantic-decision-stack-v010.html',
    'js/liuyao-semantic-decision-stack-v010.js',
    'js/liuyao-semantic-route-identifiability-v010.js',
    'data/liuyao-semantic-decision-stack-v0.10-development.json',
    'js/liuyao-semantic-scope-gate-v01.js',
    'js/liuyao-semantic-router-poc-v081.js',
    'js/liuyao-semantic-route-arbitration-v091.js',
    'js/liuyao-semantic-sufficiency.js',
    'data/liuyao-semantic-route-inventory-v0.2.json'
  ];
  for (const expected of liuyaoDecisionStackV010Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao Semantic Decision Stack v0.10 file: ${expected}`);
  }
  const liuyaoDecisionStackV011Requirements = [
    'semantic-decision-stack-v011.html',
    'js/liuyao-semantic-decision-stack-v011.js',
    'js/liuyao-semantic-route-identity-v01.js',
    'js/liuyao-semantic-route-arbitration-v092.js',
    'data/liuyao-semantic-decision-stack-v0.11-development.json',
    'data/liuyao-semantic-decision-stack-v0.11-preuse-patch.json',
    'js/liuyao-semantic-scope-gate-v01.js',
    'js/liuyao-semantic-router-poc-v081.js',
    'js/liuyao-semantic-sufficiency.js',
    'data/liuyao-semantic-route-inventory-v0.2.json'
  ];
  for (const expected of liuyaoDecisionStackV011Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao Semantic Decision Stack v0.11 file: ${expected}`);
  }
  const liuyaoDecisionStackV011BlindRequirements = [
    'semantic-decision-stack-v011-sealed-blind-v01.html',
    'js/liuyao-semantic-decision-stack-v011-sealed-blind-v01.js',
    'data/liuyao-semantic-decision-stack-v0.11-sealed-blind-v0.1.json',
    'data/liuyao-semantic-decision-stack-v0.11-sealed-blind-v0.1-preuse-patch.json',
    'js/liuyao-semantic-decision-stack-v011.js',
    'js/liuyao-semantic-route-identity-v01.js',
    'js/liuyao-semantic-route-arbitration-v092.js',
    'js/liuyao-semantic-scope-gate-v01.js',
    'js/liuyao-semantic-router-poc-v081.js',
    'js/liuyao-semantic-sufficiency.js',
    'data/liuyao-semantic-route-inventory-v0.2.json'
  ];
  for (const expected of liuyaoDecisionStackV011BlindRequirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao Semantic Decision Stack v0.11 sealed blind file: ${expected}`);
  }
  const liuyaoDecisionStackV012Requirements = [
    'semantic-decision-stack-v012.html',
    'semantic-decision-stack-v012-sealed-blind-v01.html',
    'js/liuyao-semantic-decision-stack-v012.js',
    'js/liuyao-semantic-decision-stack-v012-sealed-blind-v01.js',
    'js/liuyao-semantic-route-evidence-v01.js',
    'js/liuyao-semantic-route-arbitration-v010.js',
    'js/liuyao-semantic-route-identity-v02.js',
    'data/liuyao-semantic-decision-stack-v0.12-development.json',
    'data/liuyao-semantic-decision-stack-v0.12-sealed-blind-v0.1.json',
    'js/liuyao-semantic-scope-gate-v01.js',
    'js/liuyao-semantic-router-poc-v081.js',
    'js/liuyao-semantic-sufficiency.js',
    'data/liuyao-semantic-route-inventory-v0.2.json'
  ];
  for (const expected of liuyaoDecisionStackV012Requirements) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing LiuYao Semantic Decision Stack v0.12 file: ${expected}`);
  }
  if (!fs.existsSync(path.join(target, 'vendor-lock.json'))) fail('Deployed artifact missing vendor-lock.json');
} else {
  const approvedRemoteScripts = new Set([
    'https://unpkg.com/vue@3.5.40/dist/vue.global.prod.js',
    'https://unpkg.com/lunar-javascript@1.7.7/lunar.js'
  ]);
  const unexpected = remoteScripts.filter((url) => !approvedRemoteScripts.has(url));
  if (unexpected.length) fail(`Source contains unexpected remote executable scripts:\n- ${unexpected.join('\n- ')}`);
}

if (!html.includes('<meta name="viewport"')) fail('Missing viewport meta');
if (!html.includes('<meta name="description"')) fail('Missing description meta');
if (!html.includes('<html lang="zh-CN">')) fail('Unexpected or missing html lang');

console.log(`Static site verification passed (${mode}): ${target}`);
console.log(`- ${refs.length} static refs inspected`);
console.log(`- ${remoteScripts.length} remote script ref(s)`);
