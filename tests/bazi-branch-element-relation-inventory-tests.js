#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
function loadScripts(files) {
    const context = { console, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file }));
    return context.GuiJia;
}

const GuiJia = loadScripts(['js/common.js','js/bazi-core.js','js/bazi-branch-element-relation-inventory.js']);
const api = GuiJia.baziBranchElementRelationInventory;
const branches = [
    { actorKey:'surface-branch:0:丑', zhi:'丑', wuxing:'土', position:'year' },
    { actorKey:'surface-branch:1:子', zhi:'子', wuxing:'水', position:'month' },
    { actorKey:'surface-branch:2:亥', zhi:'亥', wuxing:'水', position:'day' },
    { actorKey:'surface-branch:3:酉', zhi:'酉', wuxing:'金', position:'hour' }
];

function pair(inventory, a, b) {
    return inventory.records.find((item) => item.participantActorKeys.includes(a) && item.participantActorKeys.includes(b));
}

test('Branch Element Relation Inventory v0.1 独立安装', () => {
    assert(api?.installed === true, 'inventory API 未安装');
    assert(api.VERSION === '0.1', '版本异常');
    assert(api.RELATION_KINDS.GENERATION === 'generation' && api.RELATION_KINDS.RESTRAINT === 'restraint' && api.RELATION_KINDS.PEER === 'peer', 'relation kinds 异常');
});

test('四个 surface branches 形成无重复的 6 组 pairwise inventory', () => {
    const inventory = api.buildInventory(branches);
    assert(inventory.complete === true, '固定盘 inventory 应完整');
    assert(inventory.expectedPairCount === 6 && inventory.actualPairCount === 6, '4 支应得到 6 组 pair');
    assert(new Set(inventory.records.map((item) => item.participantActorKeys.slice().sort().join('|'))).size === 6, 'pair 不得重复维护');
});

test('金生水保留五行固有方向，但不升级为 realized effect', () => {
    const inventory = api.buildInventory(branches);
    const record = pair(inventory, 'surface-branch:3:酉', 'surface-branch:1:子');
    assert(record?.relationKind === 'generation', '酉金与子水应为 generation');
    assert(record.direction?.fromZhi === '酉' && record.direction?.toZhi === '子', '金生水方向错误');
    assert(record.realizedEffect === null && record.effectiveness === null && record.directedCapacity === null, '普通生关系不得冒充兑现作用');
});

test('土克水保留五行固有方向', () => {
    const inventory = api.buildInventory(branches);
    const record = pair(inventory, 'surface-branch:0:丑', 'surface-branch:1:子');
    assert(record?.relationKind === 'restraint', '丑土与子水应为 restraint');
    assert(record.direction?.fromZhi === '丑' && record.direction?.toZhi === '子', '土克水方向错误');
});

test('同类关系不伪造施受方向', () => {
    const inventory = api.buildInventory(branches);
    const record = pair(inventory, 'surface-branch:1:子', 'surface-branch:2:亥');
    assert(record?.relationKind === 'peer', '子亥同属水，应为 peer');
    assert(record.directional === false && record.direction === null, 'peer 不得伪造 A→B 方向');
});

test('每个 actor 只读取自己参与的普通关系记录', () => {
    const inventory = api.buildInventory(branches);
    const zi = api.recordsForActor(inventory, 'surface-branch:1:子');
    assert(zi.length === 3, '四支盘中单个 actor 应参与 3 组普通关系');
    assert(zi.every((item) => item.participantActorKeys.includes('surface-branch:1:子')), 'actor filter 泄漏无关记录');
});

test('重复地支仍按不同 surface actor 保留，不按字面去重', () => {
    const repeated = api.buildInventory([
        { actorKey:'surface-branch:0:子', zhi:'子', position:'year' },
        { actorKey:'surface-branch:1:子', zhi:'子', position:'month' },
        { actorKey:'surface-branch:2:午', zhi:'午', position:'day' }
    ]);
    assert(repeated.complete === true && repeated.records.length === 3, '重复支的不同柱位 actor 不得被去重');
    const peer = pair(repeated, 'surface-branch:0:子', 'surface-branch:1:子');
    assert(peer?.relationKind === 'peer' && peer.direction === null, '重复子支之间应保留 peer identity');
});

test('上游五行字段与 baziCore 派生结果冲突时拒绝伪装完整', () => {
    const inventory = api.buildInventory([{ actorKey:'surface-branch:0:子', zhi:'子', wuxing:'火', position:'year' }, { actorKey:'surface-branch:1:寅', zhi:'寅', position:'month' }]);
    assert(inventory.complete === false, '五行冲突时 inventory 不得 resolved');
    assert(inventory.blockerRecords.some((item) => item.blockerType === 'surface-branch-element-mismatch'), '缺 element mismatch blocker');
});

test('Inventory 不包含 quality / score / effectiveness 聚合', () => {
    const inventory = api.buildInventory(branches);
    assert(inventory.computesQuality === false && inventory.computesStrength === false && inventory.numericAggregation === false, 'inventory 边界异常');
    inventory.records.forEach((record) => {
        assert(record.qualityMapping === null && record.numericWeight === null, '普通 relation 不得生成 quality/weight');
        assert(record.specialStructureIndependent === true, '必须与刑冲合害等 Structure 独立');
    });
});

console.log(`\nBranch Element Relation Inventory v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
