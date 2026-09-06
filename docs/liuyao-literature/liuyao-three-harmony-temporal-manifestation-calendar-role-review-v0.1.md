# 龟甲 · 六爻 Three-Harmony Temporal Manifestation & Calendar Role Review v0.1

日期：2026-09-06

状态：`research_complete_design_only_typed_calendar_roles_partial_transition_kernel_runtime_mismatch_detected`

范围：六爻共享研究层 / 三合局 temporal manifestation、calendar role、补局、填实、出空、冲空、月破恢复、冲墓、解绊、暗动触发、局旺，以及既有 Time v2 与最新研究口径的只读审计。

上游：

- `liuyao-three-harmony-edition-witness-formation-canonicalization-review-v0.1.md`
- `liuyao-three-harmony-coalition-formation-effectiveness-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：当三合 coalition 已具备、部分具备或受限时，日月与后续时令究竟是在“补足 formation”“解除 manifestation blocker”“增强局势”“触发原爻活动”“定位应期”，还是承担其他职责。v0.1 不修改 frozen Time v2，不建立 executable state machine，不执行 Formal Expansion，不修改 current-22、Rule Registry、训练数据或 Candidate 开发线。

---

# 1. Executive Decision

本轮最大的结论是：

```text
calendar participates in sanhe
```

不是一个足够精确的传统命题。

日月 / 后续时令至少承担五种不同职责：

```text
A. formation_completion
   补足缺失 constituent / 使 pending coalition 进入复核

B. manifestation_release
   解除空、破、墓、合绊等当前限制

C. coalition_vigor
   coalition 已成立后，日月在局中使“局旺”

D. activity_trigger
   日冲静爻，在满足条件时使其暗动，从而改变原爻活动资格

E. response_locator
   coalition 已形成且无 formation defect 时，后续时令仅定位何时兑现 / 应事
```

因此禁止：

```text
calendarHit = true
→ sanheActive = true
```

也禁止：

```text
日冲
→ activate
```

这种未区分对象状态的通用映射。

传统文本明确表明，同一个“日冲”至少可能意味着：

```text
旺相静爻受冲 → 暗动
衰弱静爻受冲 → 日破
旬空受冲       → 冲空则实 / 冲空观察
合住受冲       → 冲合则开
```

所以：

```text
calendar relation
≠ temporal role
```

必须经过：

```text
subject state
+
relation type
+
current research layer
↓
typed temporal role
```

才能进入三合 temporal reasoning。

最终总体分类：

```text
typed_calendar_roles = strongly_supported
partial_transition_kernel = supported
universal_transition_state_machine = not_ready
compound_blocker_reducer = not_ready
runtime_research_alignment = mismatch_detected
Formal Expansion = not_authorized
```

---

# 2. 研究先决条件：formation、manifestation、vigor、应期必须继续分层

上一轮已经建立：

```text
formation topology
≠ formation / activation
≠ current manifestation
≠ group effectiveness
```

本轮再增加一个必要拆分：

```text
current manifestation
≠ response-date localization
```

例如：

```text
三支已合法成局
+
没有空破墓绊
```

可能表示：

```text
coalition 当前具备作用条件
```

但现实事件究竟在何日、何月显现，仍然可能需要：

```text
response_locator
```

反过来：

```text
当前 coalition 尚缺一支
```

后续某日补足，则该日首先承担：

```text
formation_completion
```

而不能不加区分地说：

```text
该日只是“应期”
```

同理：

```text
coalition 已具 formation topology
+
其中一支旬空
```

后续填实 / 冲空 / 出空首先承担：

```text
manifestation_release
```

不应重新生成一个全新的 coalition identity。

因此本轮建议研究层使用：

```text
formation identity persists
+
temporal state changes
```

而不是每遇一个恢复日就“重新成一个三合局”。

---

# 3. 传统核心证据 A：《增删卜易》三合段落

当前多版本均保存以下结构，即使个别字句存在版本异文：

```text
两爻动而未足
→ 待后来日月补凑

一明动 + 一暗动
→ 可视为两动

局中一空破
→ 待填实之日月

局中一爻入墓
→ 待冲开之日
```

来源：

```text
SRC-ZSBY
independenceGroup = TRAD-ZSBY
location = 三合 / 六合相关章
```

本轮只抽取时间结构，不借此解决上一轮仍未定案的 formation 全部范围。

可以安全得到：

```text
pending formation
can have a future completion condition
```

以及：

```text
formed / formation-ready coalition
can have current manifestation blockers
```

分类：

```text
classical_direct_temporal_transition_support
```

注意：

```text
“待日月补凑”
```

不等于：

```text
“当前吉凶判断层允许日月直接补局”
```

前者明确是未来时间条件；后者在现代王虎应与朱辰彬之间已有真实 scope conflict。

---

# 4. 传统核心证据 B：《卜筮正宗·十八问答》提供更细的 timing matrix

《卜筮正宗·十八问答》第四问保存一组非常直接的三合时序说明：

```text
三爻齐发
→ 先看局与病关

一静两发
→ 待静爻值日

静 / 动 / 化爻逢空
→ 待出空

空而逢合
静而逢合
动而逢合
→ 待冲

自化合 / 与日合
→ 待冲

自化墓 / 墓于日
→ 待冲

自化绝 / 绝于日
→ 待生
```

来源：

```text
SRC-BSZZ
location = 十八问答附占验 / 第四问
```

但 provenance 必须继续谨慎：

```text
ZSBY ↔ BSZZ 三合材料
```

存在明显复用 / 传承风险，所以本轮将 BSZZ 主要视作：

```text
additional textual witness
+
more explicit timing exposition
```

不机械增加一个独立传统 vote。

这段材料最重要的价值，是证明三合 temporal reasoning 不能只有：

```text
blocked / unblocked
```

而要保留：

```text
blocker type
+
release trigger type
```

---

# 5. Calendar Role A：formation_completion

## 5.1 缺一支 / 两动结构

《增删卜易》明确给出：

```text
两爻动
+
第三支不足
↓
待后来日月补凑
```

因此：

```text
missing_branch
→ later calendar branch supplies missing member
```

可以登记为：

```text
formation_completion_candidate
```

### 5.1.1 不能进一步偷换成 current-outcome rule

本轮仍保留上一研究的限制：

```text
future calendar completion
= traditionally supported
```

不等于：

```text
current day/month is always allowed to be a full outcome-layer constituent
```

后者仍是：

```text
school_specific / unresolved
```

## 5.2 两动一静

《卜筮正宗》给出的时间句是：

```text
一爻静、二爻发
→ 待静者值日应事
```

这支持：

```text
static_member_value
```

作为一种：

```text
future manifestation / completion candidate
```

但本轮不把：

```text
任意冲静爻
```

自动视为同义替代。

因为静爻受日冲还必须区分：

```text
暗动
vs
日破
```

具体取决于爻当前旺衰等条件。

---

# 6. Calendar Role B：activity_trigger

《增删卜易·日辰章》明确区分：

```text
冲旺相静爻
→ 暗动

冲衰弱静爻
→ 日破
```

并进一步规定：

```text
冲空即起 / 冲空则实
冲合即开
```

所以：

```text
day_clash
```

不是一个统一触发器。

研究层必须先问：

```text
被冲对象是什么状态？
```

至少有：

| subject state | 同样的日冲可能承担的职责 |
|---|---|
| 旺相静爻 | `activity_trigger / dark_moving_candidate` |
| 衰弱静爻 | `break_or_damage / day_break_candidate` |
| 旬空爻 | `void_release / clash_open_candidate` |
| 被合住之爻 | `binding_release / clash_open_candidate` |
| 普通动爻 | 动性加剧 / 是否冲散仍需条件审查 |

因此未来 Time layer 禁止：

```text
branchClash(day, line)
→ ACTIVATED
```

必须 typed。

分类：

```text
classical_direct_typed_day_clash_semantics
```

---

# 7. Calendar Role C：manifestation_release · VOID

## 7.1 三合专门文本

《增删卜易》三合段落对：

```text
局中一空破
```

直接说：

```text
待填实之日月成之
```

这首先支持：

```text
VOID / BREAK constituent
→ current manifestation constrained
→ future recovery exists
```

## 7.2 旬空一般理论扩展了 release trigger

《增删卜易》的旬空与日辰体系又明确存在：

```text
出旬 / 出空
填实
冲空则实
```

因此对于三合 constituent 的 VOID，当前最安全研究结论不是：

```text
only VALUE can clear void
```

而是：

```text
void release candidates include:
- out_of_void
- fill / value
- clash_open
```

但 exact applicability 仍须考虑：

```text
近占 / 远占
旺衰
动静
是否还有其他 blocker
```

所以：

```text
VOID
→ one universal release date
```

不成立。

## 7.3 当前状态建议

```text
coalition_topology = retained
manifestation = constrained_by_void
recoverability = supported
releaseCandidates = [out, fill, clash]
exactTransition = context_dependent
```

注意：这是 research model，不是 runtime enum。

---

# 8. Calendar Role D：manifestation_release · MONTH_BREAK

## 8.1 三合段落给出的直接结构

三合专门文字将“空破”并列，并说待：

```text
填实之日月
```

说明：

```text
MONTH_BREAK constituent
```

不必等价于：

```text
coalition permanently invalid
```

## 8.2 一般月破理论显示恢复方式不止一种

《增删卜易·各门类应期总注》保存：

```text
月破喜填
```

并举：

```text
破而逢合
填实之月
```

作为恢复 / 应期结构。

《月破章》又明确反对“月破永远无用”的绝对旧说，提出：

```text
出月则不破
实破之日则不破
合之日则不破
```

因此三合 temporal research 对 MONTH_BREAK 至少必须保留：

```text
value / fill
harmony repair
out_of_month
```

三个不同候选方向。

但不能简单把三者全部无条件注册为同等规则，因为：

1. 三合专门段落只明示“填实”；
2. 一般应期章增加“破而逢合”；
3. 月破章再加入“出月”；
4. 近事 / 远事使用的时间尺度不同。

当前分类：

```text
month_break_recoverability = strongly_supported
exact_release_trigger_set = context_dependent
```

这也直接说明：

```text
MONTH_BREAK -> one fixed recovery opcode
```

不够。

---

# 9. Calendar Role E：manifestation_release · TOMB

这一项是本轮最稳定的时间转移之一。

《增删卜易》三合段落：

```text
有一爻入墓
→ 待冲开之日成之
```

一般应期总注：

```text
入三墓俱喜冲开
```

《卜筮正宗·十八问答》也保存：

```text
自化墓 / 墓于日
→ 待冲
```

因此：

```text
TOMB / confinement
→ clash_open
```

作为 temporal release pattern 有较强跨文本相容性。

但依旧禁止：

```text
any tomb tag -> immediate coalition invalid
```

因为前一轮已经确认：

```text
墓
= confinement / availability condition
≠ permanent ineffectiveness
```

当前分类：

```text
tomb_release_by_clash = cross_text_compatible
```

---

# 10. Calendar Role F：manifestation_release · BINDING / HARMONY

《增删卜易·日辰章》：

```text
冲合即开
```

一般应期总注：

```text
遇六合亦宜相击
```

《卜筮正宗·十八问答》进一步列：

```text
空而逢合
静而逢合
动而逢合
自化合
与日合
→ 待冲
```

因此：

```text
binding_release_by_clash
```

也是较稳定的 temporal path。

但这里必须保留上一轮 Path Review 的条件：

```text
HARMONY
≠ automatically BOUND
```

只有先经过：

```text
this harmony functions as binding in this context
```

的传统规则审核，才允许后续：

```text
binding -> clash_open
```

不能把所有六合 / 三合 / 日合都自动生成为 blocker。

---

# 11. Compound blocker：不能把每个 blocker 当独立开关

本轮一个非常重要的限制来自《卜筮正宗》：

```text
空而逢合
→ 必待冲
```

如果未来使用简单独立状态机：

```text
VOID
+
BOUND
```

可能会被写成：

```text
clearVoid()
clearBound()
```

然后任意顺序运行。

传统材料却表明：

```text
VOID + BOUND
```

可能形成：

```text
compound timing condition
```

其应期直接集中在：

```text
clash / opening
```

而不是先任意解除其中之一。

因此：

```text
blockers[]
```

可以保存事实，但：

```text
release = blockers.every(independentClear)
```

当前没有传统依据。

必须保留：

```text
compound_blocker_rule
```

这一未来研究职责。

分类：

```text
independent_blocker_reducer = rejected_for_now
```

---

# 12. Calendar Role G：coalition_vigor / 局旺

《增删卜易》部分整理版本明确保存：

```text
日建、月建，但有一而在局中，谓之局旺
```

这一命题与：

```text
日月补足缺支
```

不是同一个职责。

更准确的区分：

```text
A. coalition 已由合法结构成立
+
日 / 月恰为其中一支
→ coalition_vigor

B. coalition 当前缺一
+
日 / 月提供缺支
→ formation_completion
```

两者即使现实上都出现：

```text
calendar branch ∈ sanhe branches
```

推理职责完全不同。

因此研究层必须禁止：

```text
calendarMember = true
```

一个布尔值同时承担：

```text
formation
+
vigor
+
response timing
```

当前分类：

```text
calendar_as_vigor = classical textual support
calendar_as_current_outcome_member = not shared-kernel
```

---

# 13. Calendar Role H：response_locator

这是最容易与 formation_completion 混淆的一层。

## 13.1 传统层能确认的最低结构

一般应期规则反复使用：

```text
静逢值冲
动逢值合
空待填冲
墓待冲
合待冲
破待填 / 合
```

这说明：

```text
已经存在的结构
```

仍然可以通过：

```text
后续值 / 合 / 冲 / 填
```

定位现实兑现时间。

## 13.2 不能推出一套三合通用 locator

本轮没有足够独立传统材料支持：

```text
所有完美三合局
→ 固定逢中神值 / 合时应事
```

或：

```text
所有内局
→ 必须冲破一支才应
```

这些更完整的 timing architecture 在朱辰彬现代体系中有系统表达，但不能反投射成共享古典规则。

因此当前只允许：

```text
response_locator exists as a distinct responsibility
```

不允许：

```text
universal sanhe response-locator formula
```

---

# 14. 现代横向检验：王虎应与朱辰彬在 temporal layer 比 formation layer 更相容

前一轮确认，两位现代作者在：

```text
current outcome-layer formation scope
```

存在真实分歧。

但本轮聚焦 temporal recovery 后，相容性明显提高。

## 14.1 王虎应体系

根据：

```text
SRC-WHY-ZX
SRC-WHY-YH / related material
independenceGroup = MOD-WHY
```

其现代处理总体接受：

```text
缺支 → 后续补足
空破 → 待填实 / 恢复
墓 → 待冲开
暗动 → 可参与合局
```

并较宽地允许日月进入合局讨论。

## 14.2 朱辰彬体系

根据用户提供并已 scan-verified 的：

```text
SRC-ZCB-GSZZ
SRC-ZCB-GSZZ-JJ
independenceGroup = MOD-ZCB
```

朱辰彬明确把：

```text
吉凶判断层
vs
应期细节层
```

分开。

其三合 timing/detail 处理明确包括：

```text
局内破
→ 待值令 / 补破

局内墓
→ 待冲墓出墓

局内空
→ 待填空 / 冲空

局内被绊
→ 待冲绊
```

并明确指出：

```text
虚一待填
```

主要属于动态的应期细节层，而不是静态吉凶层的 formation 依据。

## 14.3 横向结论

现代作者对：

```text
恢复机制具有时间性
```

总体相容。

但仍不能宣称：

```text
WHY + ZCB
= full modern consensus on every transition trigger
```

因为在：

```text
日月是否直接进入当前局
变爻范围
静爻范围
完美局如何定位应期
```

仍有 scope difference。

当前 proposition-level 分类：

| proposition | WHY | ZCB | 当前研究分类 |
|---|---|---|---|
| 缺支未来可补 | 支持 | 支持（应期层） | modern compatible |
| 空可待恢复 | 支持 | 支持 | modern compatible |
| 破可待恢复 | 支持 | 支持 | modern compatible |
| 墓可待冲开 | 支持 | 支持 | modern compatible |
| 合绊可待冲开 | 相容 | 明确 | compatible direction |
| 暗动可改变 participation | 支持 | 支持 | modern compatible |
| 日月直接当前成局 | 较宽 | 吉凶层严格限制 | conflict |
| 完美外局逢值 / 合定位 | 未形成同等明确共享公式 | 明确 | ZCB-specific refinement |
| 完美内局须破 | 未形成同等明确共享公式 | 明确 | ZCB-specific refinement |

---

# 15. 朱辰彬“外局喜成、内局要破”只能保留为现代 school-specific timing model

《古筮真诠》扫描材料明确提出：

```text
外局喜成
内局要破
```

并进一步给出：

```text
无破绽外局
→ 待合局整体临值 / 临合而应

世 / 用在完美内局
→ 如困罗网
→ 冲掉 constituent 后应验
```

这套模型具有很高的内部一致性，也对解释具体现代案例很有帮助。

但传统共享层目前只能够确认：

```text
用神在三合内可能被合而留
```

以及一般：

```text
合待冲开
```

还不足以把：

```text
所有内局必须破
所有外局必须值 / 合
```

提升为 stable classical consensus。

因此：

```text
ZCB outer/inner timing architecture
= modern_author_specific_refinement
```

可用于比较，不进入共享 temporal kernel。

---

# 16. 时距尺度：日 / 月不能脱离问题 horizon 使用

《增删卜易》一般应期总论明确提醒：

```text
远近当分
远事定之以年月
近事应之于日時
```

因此即使我们知道：

```text
missingBranch = 寅
```

也不能写成：

```text
一定寅日
```

而必须保留：

```text
candidate branch = 寅
+
time scale = question horizon / timing scope
```

可能表现为：

```text
寅日
寅月
甚至更远相应层级
```

这也是为什么：

```text
formation_completion
```

和：

```text
calendar date generation
```

必须是两个职责。

---

# 17. Partial Temporal Transition Kernel v0.1

本轮允许抽出以下最小 shared research kernel。

## T1 · Missing-member completion

```text
state:
coalition pending because one constituent is missing

future:
matching branch appears in later calendar

result:
formation / manifestation re-review candidate
```

强度：

```text
classical_direct
```

限制：

```text
current outcome-layer calendar formation remains unresolved
```

## T2 · Static-member value

```text
state:
two active + one static constituent

future:
static constituent reaches its value time

result:
manifestation / event candidate
```

强度：

```text
traditional textual support
transmission independence caution
```

## T3 · Void release

```text
state:
constituent void

future candidates:
out_of_void
fill/value
clash-open

result:
manifestation re-review
```

强度：

```text
cross-chapter compatible
exact trigger context-dependent
```

## T4 · Month-break release

```text
state:
constituent month-broken

future candidates:
fill/value
harmony repair
out_of_month

result:
manifestation re-review
```

强度：

```text
recoverability strongly supported
exact trigger context-dependent
```

## T5 · Tomb release

```text
state:
constituent confined in tomb

future:
clash tomb / out of tomb

result:
manifestation re-review
```

强度：

```text
cross-text compatible
```

## T6 · Binding release

```text
state:
constituent has been adjudicated as bound

future:
clash / opening

result:
manifestation re-review
```

强度：

```text
cross-text compatible
```

## T7 · Dark-moving trigger

```text
state:
static constituent
+
state supports dark-moving interpretation

calendar:
day clash

result:
activity qualification changes
→ sanhe formation must be re-reviewed
```

强度：

```text
classical direct conditional
```

限制：

```text
day clash on weak static line may instead be day break
```

## T8 · Coalition vigor

```text
state:
coalition already admitted

calendar:
day/month branch is within coalition

result:
coalition condition / vigor strengthened
```

强度：

```text
classical textual support
```

限制：

```text
not equivalent to formation completion
```

---

# 18. Explicitly NOT in the Shared Temporal Kernel

以下规则当前不得进入共享 kernel：

```text
A. 日月只要补到缺支
   → 当前吉凶层必定成局

B. 任意静爻被日冲
   → 必定暗动

C. VOID 只有填实才能解除

D. MONTH_BREAK 只有值日才能解除

E. 所有 blocker 都能独立 clear 后自动成局

F. 所有完美外局逢中神值 / 合必应

G. 所有完美内局必须冲破一支才应

H. 三合存在
   → 后续所有 calendar relation 都是 activation

I. 进入某一恢复日
   → coalition final effectiveness 自动成立
```

这些要么被传统文本直接否定，要么只是某一现代体系的 refinement，要么证据不足。

---

# 19. 现有 Time v2 只读审计：已经存在三合 temporal semantics

本轮同时审计当前冻结实现，目的不是从代码找“传统证据”，而是识别：

```text
historical runtime policy
vs
new research kernel
```

现有：

```text
js/liuyao-time-facts.js
js/liuyao-time-effects.js
js/liuyao-core.js
```

已经包含三合相关时间事实。

所以必须明确：

```text
Time v2 is not blank
```

它已经携带旧研究 / 旧设计阶段形成的假设。

本轮不修改这些实现。

---

# 20. TimeFact 当前已有的 SanHe transition vocabulary

`liuyao-time-facts.js` 当前能够把 legacy code 归一为：

```text
SANHE_MEMBER_VALUE
→ formation member-value

SANHE_PENDING
→ formation missing-branch-supplied

SANHE_DEFERRED_OUT
→ formation void-blocker-out

SANHE_DEFERRED_FILL
→ formation void-blocker-filled

SANHE_DEFERRED_CLASH
→ formation void-blocker-clash-open
```

这说明 frozen TimeFact 已经具备：

```text
pending
+
void recovery
```

的部分结构表达。

与本轮研究相容的地方：

```text
missing member completion is a distinct fact
void out / fill / clash are distinct transitions
```

这是良好结构，不需要为了研究方便推翻。

但：

```text
fact exists
```

仍不等于：

```text
traditional synthesis is fully solved
```

---

# 21. TimeEffect 当前仍把多种 formation transition 压到 trigger

`liuyao-time-effects.js` 当前将：

```text
branch-relation
void-transition
month-break-review
formation
structural-event
```

广义映射进：

```text
trigger
```

并在 formation 带有：

```text
formationElement
observerElement
```

时计算 coalition element 与观察对象之间的相对五行关系。

这并不一定是错误，但本轮研究显示：

```text
trigger
```

不足以表达日月在三合 temporal layer 的全部职责。

至少还要研究性区分：

```text
formation_completion
manifestation_release
coalition_vigor
activity_trigger
response_locator
```

所以现有：

```text
formation fact → trigger
```

只能看作：

```text
coarse frozen representation
```

不得反向证明：

```text
这些事件传统上同属一种 trigger
```

---

# 22. 当前 SanHe blocker 实现与文献核之间存在覆盖缺口

`liuyao-core.js` 当前 `sanHeBlocker()` 识别：

```text
VOID / TRANSFORM_VOID
MONTH_BREAK / TRANSFORM_MONTH_BREAK
TRANSFORM_TOMB
```

并把 coalition 分成：

```text
complete
vs
deferred
vs
pending
```

这与：

```text
formation topology may persist while manifestation is deferred
```

这一研究方向相容。

但覆盖并不完整：

```text
BOUND / binding
```

当前并未作为同层 SanHe blocker 被统一登记。

而传统研究已经确认：

```text
被合绊
→ 待冲开
```

是明确 temporal responsibility。

因此：

```text
binding blocker coverage
= research-supported
= runtime gap candidate
```

但本轮不修改 runtime。

---

# 23. 当前日期侧 SanHe recovery 主要只完整处理 VOID

在当前 range / date event generation 中：

```text
pendingDetails
```

已经会在：

```text
missingBranch == dayBranch
```

生成：

```text
SANHE_PENDING
```

同时：

```text
deferredDetails
```

对 VOID 已分别生成：

```text
SANHE_DEFERRED_OUT
SANHE_DEFERRED_FILL
SANHE_DEFERRED_CLASH
```

但同一日期侧逻辑尚未对：

```text
MONTH_BREAK
TRANSFORM_TOMB
BOUND
```

建立同样完整、typed 的 SanHe transition events。

因此当前状态是：

```text
VOID temporal transition coverage
= relatively mature

MONTH_BREAK transition coverage
= partial

TOMB transition coverage
= structural blocker only / date transition incomplete

BOUND transition coverage
= not represented in sanhe blocker path
```

这与本轮文献结果形成一个清楚的未来审计清单。

仍然：

```text
no code change in this review
```

---

# 24. 最大 runtime-research mismatch：CALENDAR_COMPLETED_ACTIVE_PAIR

当前 `liuyao-core.js` 存在：

```text
CALENDAR_COMPLETED_ACTIVE_PAIR
```

其行为大意为：

```text
卦内已有两个 active constituent
+
当前日辰或月建正好是 missing branch
↓
直接把 calendar source 加入 formation
↓
按三支补足并成局处理
```

当前 formation priority 甚至给它单独等级：

```text
INNER_FIRST_THIRD_CHANGE      30
OUTER_FOURTH_SIXTH_CHANGE    30
CALENDAR_COMPLETED_ACTIVE_PAIR 25
ORIGINAL_BRANCHES            20
```

这与最新研究出现实质 tension。

最新 shared research kernel 已明确：

```text
future calendar completion
= supported
```

但：

```text
current day/month may always become an outcome-layer constituent
= not shared-kernel
= modern school conflict
```

王虎应体系相对宽；朱辰彬吉凶判断层明确更严格。

因此：

```text
CALENDAR_COMPLETED_ACTIVE_PAIR
```

当前只能被分类为：

```text
frozen historical runtime policy
```

而不能被引用为：

```text
traditional rule already proven
```

正式标记：

```text
runtime_research_mismatch_candidate
future_separate_audit_required
```

本轮不修改，不回退，不偷偷“修正”。

---

# 25. 另一个 mismatch candidate：formationPriority 不能成为传统优先级证据

现有实现把：

```text
INNER_FIRST_THIRD_CHANGE
OUTER_FOURTH_SIXTH_CHANGE
CALENDAR_COMPLETED_ACTIVE_PAIR
ORIGINAL_BRANCHES
```

赋予 numerical priority。

这是历史实现选择。

而此前研究已经确认：

```text
inner 1&3 / outer 4&6 transform modes
```

虽然在 ZSBY 有直接文本、在 ZCB 有现代采用，但尚未进入：

```text
shared classical kernel
```

同时：

```text
calendar completed active pair
```

也尚有 school conflict。

所以：

```text
formationPriority numeric order
```

不得反向解释为：

```text
traditional precedence table
```

它只属于：

```text
legacy implementation ordering
```

---

# 26. Current Runtime / Research Alignment Table

| 事项 | 最新研究 | 当前 frozen runtime | 审计结论 |
|---|---|---|---|
| pending missing branch | 支持 | 已有 `SANHE_PENDING` | 基本相容 |
| VOID 出空 | 支持候选 | 已有 `DEFERRED_OUT` | 相容 |
| VOID 填实 | 支持 | 已有 `DEFERRED_FILL` | 相容 |
| VOID 冲空 | 支持候选 | 已有 `DEFERRED_CLASH` | 相容但仍需条件审核 |
| MONTH_BREAK blocker | 支持 | structural blocker 已有 | 部分相容 |
| MONTH_BREAK typed recovery | 填 / 合 / 出月候选 | 日期侧未完整 | runtime gap candidate |
| TOMB blocker | 支持 | 仅 `TRANSFORM_TOMB` | 覆盖偏窄 |
| TOMB clash release | 强支持 | 日期侧未完整 | runtime gap candidate |
| BOUND blocker | 支持 | sanhe blocker 未纳入 | runtime gap candidate |
| BOUND clash release | 强支持 | 未形成 sanhe transition | runtime gap candidate |
| typed day clash | 强支持 | 多处旧事件有分类，但 sanhe 层未形成统一 typed role contract | partial |
| coalition vigor / 局旺 | 有文本支持 | 未独立 typed | missing research responsibility |
| calendar current completion | 共享口径 unresolved | 已有 `CALENDAR_COMPLETED_ACTIVE_PAIR` | mismatch candidate |
| inner 1&3 / outer 4&6 priority | 非共享 classical kernel | 已有高 priority | historical policy only |
| compound blocker reducer | 不可简单独立 clear | 未见正式 compound contract | research gap |

---

# 27. 对 Time Engine 的研究性接口边界

未来如果进入 formal design，三合时间层至少不能只收到：

```text
calendarBranch
+
coalition
```

然后输出：

```text
active / inactive
```

研究上至少需要知道：

```text
coalition formation identity
current formation status
constituent identities
constituent source type
constituent activity provenance
current blockers[]
compound blocker relations if any
calendar relation to each constituent
question time horizon
requested time scope
current vs future analysis layer
```

输出也至少需要概念上区分：

```text
formation_completion_candidate
manifestation_release_candidate
coalition_vigor_candidate
activity_trigger_candidate
response_locator_candidate
unresolved
```

这里仍然只是研究职责，不是 schema proposal。

---

# 28. Why a generic finite-state machine is still premature

表面上我们已经可以画：

```text
pending
→ complete

deferred_void
→ manifest

deferred_break
→ manifest

deferred_tomb
→ manifest

deferred_bound
→ manifest
```

但现在仍不应直接做通用 FSM。

原因至少有五个：

1. `VOID + BOUND` 等 compound blocker 有专门规则；
2. 同一 day clash 可能暗动、日破、冲空、解合；
3. MONTH_BREAK 有多个恢复候选且受时距影响；
4. current outcome formation 与 future timing formation 在现代体系中分层不同；
5. 完美 coalition 的 response locator 尚无 shared universal rule。

因此当前状态：

```text
transition facts
= enough for research taxonomy

generic executable state machine
= not ready
```

---

# 29. 对 Directed Interaction Effectiveness 的进一步影响

三合 coalition 一旦成为 group actor，其时间状态也不能被压成：

```text
coalitionEffective = true / false
```

更安全的链条是：

```text
Coalition Formation Identity
↓
Temporal Manifestation State
↓
Coalition Vigor / Availability
↓
Coalition → Target Directed Relation
↓
Group-Actor Effectiveness
↓
Domain Evidence
```

其中本轮只完成第二层到第三层之间的职责边界。

例如：

```text
亥卯未木局 topology exists
+
未旬空
```

当前只能说：

```text
coalition manifestation constrained by void
```

未来未日 / 申日 / 出旬等时点可能形成：

```text
manifestation re-review
```

仍不能直接说：

```text
wood coalition effectively supports target
```

因为 target-relative effectiveness 仍需下一层研究。

---

# 30. 对 Travel / Transport 等主题的限制

即使未来某 transport reading 中出现：

```text
transport target
+
three-harmony coalition
```

本轮也不允许直接推：

```text
coalition active
→ transport blocked / supported
```

必须继续区分：

```text
coalition 当前是否 manifest
coalition 对 transport 的方向关系
coalition 是否实际能作用 transport
transport 自身 condition
其他 path modifier
```

因此本轮没有把任何三合 temporal rule 写成：

```text
travel outcome rule
```

它属于 LiuYao shared research layer。

---

# 31. Evidence Classification Summary

## 31.1 较强 classical support

```text
缺一可待未来日月补足
一明一暗可形成两活动来源候选
空 / 破不是永久删除 coalition
墓可待冲开
合绊可待冲开
日冲静爻需区分暗动与日破
冲空 / 冲合具有不同语义
月破存在填实 / 合 / 出月等恢复思路
日月在既有局中可以承担局旺职责
```

## 31.2 仍需 context / school review

```text
VOID 三种 release candidate 的统一优先顺序
MONTH_BREAK 各 release candidate 的具体适用边界
日月是否可直接构成当前 outcome-layer member
完美 coalition 的通用 response locator
内局是否一律必须冲破
外局是否一律逢值 / 合才应
多个 blocker 同时存在时的完整 precedence
```

## 31.3 现代 compatible refinement

```text
空破墓绊均具有 temporal recovery 语义
暗动能够改变三合 participation
formation 与 timing layer 应区分
```

## 31.4 现代 conflict / author-specific

```text
WHY broad calendar formation
vs
ZCB stricter outcome-layer formation

ZCB 外局喜成 / 内局要破
= author-specific systematic refinement
```

---

# 32. Explicit Non-Inferences

本研究不得推出：

```text
日月出现三合缺支 = 当前一定成局
日冲三合成员 = 一定暗动
旬空 = 一定等出旬才恢复
旬空 = 一定逢值才恢复
月破 = 一定逢值才恢复
月破 = 一定出月才恢复
入墓 = 永久失效
合住 = 永久失效
任何冲都等于 activation
任何合都等于 binding
任何 blocker 都能独立 clear
局旺 = 成局
成局 = manifest
manifest = effective
coalition controls target = domain failure
完美外局一定逢值/合应
完美内局一定逢冲破局应
当前 runtime priority = traditional precedence
当前 runtime behavior = 文献证据
```

---

# 33. Research Decision for Existing Time v2

当前最重要的工程边界不是立即修 code，而是：

```text
freeze historical behavior
+
register research mismatch
+
do not use runtime to prove tradition
```

所以：

```text
CALENDAR_COMPLETED_ACTIVE_PAIR
formationPriority
current SANHE blocker set
current range transition coverage
```

全部只记录审计结果。

本轮明确不做：

```text
patch
migration
compat shim
schema change
test rewrite
runtime feature flag
```

这些都属于未来独立 formal review。

---

# 34. Final Decision

```text
Three-Harmony Temporal Manifestation
= traditional-research-supported shared responsibility

typed calendar roles
= required

calendar relation
≠ calendar role

formation_completion
≠ manifestation_release
≠ coalition_vigor
≠ activity_trigger
≠ response_locator

partial transition kernel
= supported

VOID recovery
= multi-path / context dependent

MONTH_BREAK recovery
= multi-path / context dependent

TOMB clash release
= strongly supported

BOUND clash release
= strongly supported

compound blockers
= cannot assume independent clearing

perfect coalition universal timing formula
= not established

existing Time v2
= contains partial compatible structures
+ historical assumptions
+ identified mismatch candidates

CALENDAR_COMPLETED_ACTIVE_PAIR
= frozen historical policy
≠ shared traditional proof

runtime transition state machine
= not ready

Formal Expansion
= not authorized
```

---

# 35. Recommended Next Research

下一步不再继续扩大 calendar transition 细枝，而应进入：

```text
Three-Harmony Coalition Effectiveness / Group-Actor → Target Review v0.1
```

重点只回答：

1. coalition 合法 formation 且当前 manifest 后，何时可以视作一个真正可作用的 group actor；
2. coalition → target 的生 / 克 / 比和如何与 target 自身 condition 联合判断；
3. “局旺”究竟增强的是 actor force、availability，还是只是一类 calendar support；
4. constituent-level support / control 是否在 group actor 成立后被 supersede，边界在哪里；
5. coalition 与普通 moving source、calendar、另一个 coalition 同时出现时，是否有可证的相对力规则；
6. 内局 / 外局与 target-in-coalition 是否属于 group effectiveness，还是 domain / timing adapter；
7. 哪些结论是古典共享结构，哪些只属于 WHY / ZCB 等现代体系。

在该层完成前：

```text
Three-Harmony Coalition
```

仍不得直接输出：

```text
supportive / adverse final evidence
```

更不得直接输出任何主题现实结果。