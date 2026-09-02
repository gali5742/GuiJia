# 龟甲 · 六爻 Line Relation Fact Provenance Review v0.1

日期：2026-09-02

状态：`provenance_review_complete_design_only`

范围：六爻结构事实层 / line-to-line relation provenance

上游：

- `js/liuyao-core.js`
- `js/liuyao-shi-ying-fact-adapter-pretraining-v01.js`
- `js/liuyao-line-status-fact-adapter-pretraining-v02.js`
- `travel-transport-blocking-evidence-resolution-research-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`

> 本文件只审计“爻 A 与爻 B 的五行 / 地支关系”能否作为 reading-scoped atomic Fact。它不判断某关系是否吉凶，不建立 transport blocking / support Evidence，也不修改正式 Fact / Rule Registry / Time Engine。

---

# 1. Review 问题

Travel transport blocking 研究后，最强下一候选是：

```text
resolved transport target
+
另一个活动爻对其形成 adverse relation
→ transport_blocking_interaction Evidence
```

但这要求先证明仓库存在、或能够无重算歧义地建立：

```text
Line A
→ structural relation
→ Line B
```

其中 relation Fact 必须：

1. reading-scoped；
2. source / target 明确；
3. 不依赖 legacy 用神选择；
4. 不带 final favorable / unfavorable judgment；
5. 不从 score / interpretation 文本反推；
6. 与 source activity Fact 分层。

本轮结论：

```text
relation computation provenance = available
existing generic atomic relation fact = absent
new design-only neutral adapter = provenance-ready
```

---

# 2. Core 中已有的纯结构映射

`liuyao-core.js` 使用基础映射：

```text
generateMap
controlMap
heMap
chongMap
```

其中：

```text
generateMap[A] === B
→ A 五行生 B 五行

controlMap[A] === B
→ A 五行克 B 五行

heMap[branchA] === branchB
→ A / B 地支六合

chongMap[branchA] === branchB
→ A / B 地支六冲
```

这些映射本身是结构关系，不依赖：

```text
旺衰
旬空
动静
月日权重
用神强弱
score
Assessment
```

所以 relation computation 的底层 provenance 是可审计的。

---

# 3. 世应关系已经提供 neutral precedent

Core 中 `getShiYingElementFact(shi, ying)` 已存在一套中性结构编码：

```text
SHI_YING_SAME_ELEMENT
SHI_GENERATES_YING
YING_GENERATES_SHI
SHI_CONTROLS_YING
YING_CONTROLS_SHI
SHI_YING_NO_DIRECT_ELEMENT_RELATION
```

并统一：

```text
type = neutral
```

随后 `buildShiYingSummary()` 还独立追加：

```text
SHI_YING_SIX_HARMONY
SHI_YING_SIX_CLASH
```

这证明当前 Core 本身已经接受一个重要架构原则：

```text
“谁生谁 / 谁克谁”
可以先作为结构 Fact
而不必在 Fact 层直接判吉凶。
```

`liuyao-shi-ying-fact-adapter-pretraining-v01.js` 又把这些结果转成：

```text
reading-scoped
atomic
conclusionShaped = false
formalEligible = false
```

的 design-only Fact。

这是未来通用 Line Relation Fact 最直接的工程 precedent。

---

# 4. 但世应 Adapter 不能直接泛化使用

当前 Shi-Ying Fact Adapter 的 source contract 固定为：

```text
liuyao-core.buildShiYingSummary
```

对象固定为：

```text
世
应
```

因此它不能处理：

```text
二爻妻财 → 克 → 五爻父母 transport
三爻官鬼 → 生 → 四爻父母 transport
任意 moving source → 任意 resolved target
```

Travel transport 需要的是：

```text
arbitrary line-to-line relation
```

而不是：

```text
shi-ying-only relation
```

所以不能伪造世应角色来复用 Adapter。

---

# 5. Legacy 用神 direct relation model

Core 另有：

```text
buildDirectMovingUseFacts(...)
directMovingElementFact(...)
```

它会对：

```text
visible moving line / changed line
→ selected legacy use-god target
```

产生：

```text
MOVING_LINE_GENERATES_USE
MOVING_LINE_CONTROLS_USE
CHANGED_LINE_GENERATES_USE
CHANGED_LINE_CONTROLS_USE
MOVING_LINE_SIX_HARMONY_USE
MOVING_LINE_SIX_CLASH_USE
...
```

这表面上非常接近 Travel 所需关系，但不能直接作为通用 relation Fact 使用。

---

# 6. 为什么 legacy `use-god-direct` 不能直接复用

## 6.1 Target provenance 不同

Legacy target 来自：

```text
use-god selection
```

Travel 新架构 target 来自：

```text
Semantic Intent
→ TR-TV-001-D
→ PRR-TRAVEL-TRANSPORT-OBJECT safe subset
→ resolved concrete transport line
```

若直接使用 legacy target，就会把：

```text
新 semantic object binding
```

重新绑回旧用神体系。

这会破坏：

```text
Modern Semantic Object ≠ Traditional Observation Object
```

的现有架构边界。

## 6.2 Fact 已带 polarity-style type

Legacy direct relation 将：

```text
生用神
→ type = support

克用神
→ type = constraint
```

这已经不再是纯：

```text
A generates B
A controls B
```

而是：

```text
相对于“用神”而言的 support / constraint interpretation
```

对于通用 relation layer 来说过早。

例如：

```text
A 克 B
```

只应先记录为：

```text
relation = controls
```

它是否形成：

```text
transport blocking
```

必须由 B 已绑定为 transport、A 的活动状态以及领域规则共同决定。

## 6.3 Activity 与 relation 被捆绑

Legacy `buildDirectMovingUseFacts()` 只遍历：

```text
line.moving === true
```

因此它实际上把：

```text
source is moving
+
source controls target
```

混在一个 legacy Fact generator 中。

新架构需要拆成：

```text
Line Activity Fact
+
Line Relation Fact
```

以允许：

```text
VISIBLE_MOVING
DARK_MOVING
```

具有不同 provenance，但都可在 Evidence 层与 relation 组合。

## 6.4 Reading scope contract 不统一

Legacy result 是 Core 内部 / 用神模型的一部分；它并不提供当前 design-only adapters 所要求的统一：

```text
readingRef
factRef
atomic
conclusionShaped
traceRefs
```

所以即便底层关系计算正确，也不能直接绕过 provenance adapter。

---

# 7. `elementRelation()` 也不能直接当 Fact

Core 中另有 `elementRelation(sourceElement, targetElement)` 一类 helper，会直接返回类似：

```text
favorable
unfavorable
neutral
```

并附：

```text
受生
受克
泄力
```

等判断。

它适合旧 Assessment / explanation，但不适合作为新 atomic relation Fact，因为它把：

```text
结构关系
```

和：

```text
target-relative effect polarity
```

放在同一层。

因此未来 adapter 应直接读取 / 复用：

```text
generateMap
controlMap
heMap
chongMap
```

所代表的确定结构关系，或建立一个纯 relation helper；不得把 `elementRelation()` 输出原样包装成 Fact。

---

# 8. Proposed neutral relation vocabulary

首轮建议只覆盖已有稳定、无歧义的基础关系：

```ts
relation:
  | 'same_element'
  | 'generates'
  | 'controls'
  | 'six_harmony'
  | 'six_clash'
  | 'none'
```

方向性：

```text
same_element  = symmetric
six_harmony   = symmetric
six_clash     = symmetric

generates    = directional
controls      = directional
```

因此：

```text
A controls B
```

与：

```text
B controls A
```

必须是不同 Fact。

---

# 9. Proposed atomic Fact shape

建议 design-only：

```ts
{
  factRef: string,
  factType: 'line_relation',
  family: 'structural_relation',
  schemaVersion: '0.1',
  readingRef: string,
  sourceLayer: 'liuyao_line_relation_structure',
  sourceRef: 'liuyao-core relation maps',
  relation:
    | 'same_element'
    | 'generates'
    | 'controls'
    | 'six_harmony'
    | 'six_clash'
    | 'none',
  sourceSubjectRef: {
    type: 'line',
    position: number
  },
  targetSubjectRef: {
    type: 'line',
    position: number
  },
  sourceElement?: string,
  targetElement?: string,
  sourceBranch?: string,
  targetBranch?: string,
  atomic: true,
  polarity: 'neutral',
  conclusionShaped: false,
  formalEligible: false,
  currentRuntimeReachable: false,
  traceRefs: string[]
}
```

注意：

```text
relation = controls
```

时仍然：

```text
polarity = neutral
```

因为 Fact 层只陈述：

```text
A 克 B
```

不陈述：

```text
A 对当前问题不利
```

---

# 10. Fact generation scope

首轮不建议为六爻六条线生成所有：

```text
6 × 5
```

有向关系 Fact 并长期存储。

更安全的 design-only接口是：

```text
input:
  readingRef
  rows
  requested source positions / target positions

output:
  requested pair relation facts
```

或：

```text
resolved target position
+
all candidate source lines
→ relation facts against that target
```

这样可以减少：

1. 无业务职责的事实膨胀；
2. 下游误把任意结构关系都当 Evidence；
3. 大量重复 symmetric Fact。

不过 adapter 本身必须保证：

```text
同一 pair 的 relation 计算不读取 theme / assessment
```

所以它仍是通用 Fact 层。

---

# 11. Five-element and branch relations must remain parallel

Core 当前已经有一个重要修订原则：

```text
地支值 / 合 / 冲
与
五行生克
是并行事实
```

不能用一条 `else-if` 链互相遮蔽。

因此 A/B 同时可能满足：

```text
A controls B by element
+
A six-harmony B by branch
```

或其他并存组合。

未来 Relation Fact Adapter 不应强制：

```text
one pair → exactly one relation
```

而应允许：

```text
one pair → multiple atomic relation facts
```

例如：

```text
REL:ELEMENT:CONTROLS
REL:BRANCH:SIX_HARMONY
```

分别保留。

这一点对后续 blocking research 很重要，因为：

```text
克 + 合
```

是否仍构成 active blocking，不能由 Fact 层决定。

---

# 12. What is NOT admitted yet

本 Review 只确认 provenance，不确认领域含义。

不得在 relation Fact 层写：

```text
controls → blocking
six_clash → blocking
six_harmony → restraint
six_harmony → support
generates → success
same_element → favorable
```

尤其：

```text
冲
```

虽然传统中经常具有触发 / 冲击含义，但本主题尚未完成：

```text
active source 六冲 transport
→ transport blocking
```

的独立 Rule Review。

所以 transport 第一轮 Evidence 如要继续，只应优先研究：

```text
active source + controls resolved transport
```

不要一次把：

```text
克 / 冲 / 合 / 生
```

全部塞进 blocking/support 二分法。

---

# 13. Dark moving boundary

Relation Fact 与 Activity Fact 必须正交。

例如：

```text
二爻 controls 五爻
```

无论二爻是：

```text
静
明动
暗动
```

其五行结构关系都不改变。

Activity 应由独立 Fact 表示：

```text
VISIBLE_MOVING
DARK_MOVING
```

因此未来 transport blocking Evidence 可以明确审查：

```text
VISIBLE_MOVING + controls
```

与：

```text
DARK_MOVING + controls
```

是否具有相同 Evidence tier。

不能把 dark-moving 逻辑重新塞进 relation adapter。

---

# 14. Hidden / changed line boundary

首轮 generic Line Relation Fact 建议只支持：

```text
visible original lines
```

原因：

- hidden spirit 有独立 fly /伏关系；
- changed line 是 transform result，不是与本卦六条线完全同层的 current actor；
- legacy `buildDirectMovingUseFacts()` 虽然会计算 changed-line→use relation，但其领域职责需要另行审计。

因此第一版不要为了“功能完整”把：

```text
visible
hidden
changed
```

混为同一种 source line。

状态：

```text
visible_original_line_relation = provenance_ready
changed_line_relation = deferred
hidden_line_relation = deferred
```

---

# 15. Provenance conclusion

当前仓库已经提供：

```text
pure relation maps
+
neutral Shi-Ying relation precedent
+
legacy direct-use relation computation examples
```

所以建立 design-only 通用 neutral Line Relation Fact 不需要重新发明传统规则，也不需要碰 Time Engine。

但当前**没有**可直接拿来给 Travel 使用的：

```text
reading-scoped arbitrary line-to-line neutral Fact Adapter
```

因此：

```text
lineRelationFactProvenance = complete
lineRelationFactImplementationReady = true
existingGenericAdapterReusable = false
```

---

# 16. Next research gate

有了这个 provenance 结论后，下一步才允许审：

```text
Transport Target-directed Blocking Evidence
```

优先只审最窄形式：

```text
transportBinding = resolved
+
source line VISIBLE_MOVING
+
source line CONTROLS transport line
+
same readingRef
→ transport_blocking_interaction ?
```

单独留待后续：

```text
DARK_MOVING + controls
six_clash + activity
six_harmony + activity
generates + activity
changed-line controls transport
hidden-line controls transport
```

这样可以避免从一个可审计的五行克关系突然扩张成万能“任何冲克合动都算阻碍”。

---

# 17. Final decision

```text
A generates / controls B
A / B six-harmony / six-clash
= structural relation facts
= Fact layer must stay neutral

legacy use-god direct facts
= useful provenance precedent
= NOT reusable as generic Travel relation facts

Shi-Ying neutral facts
= clean architectural precedent

new arbitrary visible-line relation Fact Adapter
= design-only implementation ready

transport blocking Evidence
= still requires separate Rule Review
```

Formal Expansion 仍未授权；当前 22-route、正式 Rule Registry、Time Engine 均不修改。
