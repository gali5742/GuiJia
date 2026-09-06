# 龟甲 · 六爻 Three-Harmony Coalition Formation & Effectiveness Review v0.1

日期：2026-09-06

状态：`research_complete_design_only_formation_layered_modern_conflict_no_runtime_contract`

范围：六爻共享研究层 / 三合局 formation、group actor、current manifestation、effectiveness、temporal recovery，以及现代文献横向检验。

上游：

- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-line-effectiveness-synthesis-readiness-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：三合局何时可以从三个普通支关系升级成一个 group-level actor；其“成局”“当前发力”“受限后待时恢复”“整体生克目标”是否必须分层；传统文本与现代王虎应、朱辰彬两套体系在 formation scope 上是否一致。v0.1 不建立 executable coalition resolver，不修改 current-22、Rule Registry、Time Engine、训练数据或 Candidate 开发线。

---

# 1. Executive Decision

本轮确认：

```text
Three-Harmony Coalition
= 有传统依据的 group-level interaction structure
```

但必须拆成至少四层：

```text
A. formation topology
   三个构成支是否满足某种合法组合来源

B. formation / activation state
   该组合当前是否已经被传统规则承认为“局”

C. current manifestation
   空、破、墓、合绊等是否令其当前不能完整发力

D. group effectiveness
   成局之后整体五行对目标究竟生、克、比和，以及目标本身是否能承受
```

因此禁止：

```text
发现申 + 子 + 辰
→ 三合水局 active
→ 水局自动强力作用所有目标
```

也禁止：

```text
三合局存在
→ 把三个 constituent lines 的普通 pairwise edges 全部继续并行累计
```

传统材料及现代横向材料共同支持：

```text
合法成局后
三爻可以被提升为一个新的 group actor
```

但：

```text
formation contract
= 尚未形成跨传统、跨现代作者统一口径
```

最终分类：

```text
group_actor_structure = strongly_supported
formation_scope = conflicted / layered
current_manifestation = condition_dependent
universal_runtime_contract = not_ready
```

---

# 2. 首要校勘问题：“一爻动” vs “三爻动”不能静默修正

《增删卜易》现存电子文本存在明显版本差异。

一组版本作：

```text
一卦之内有一爻动而合局者
```

另一组版本作：

```text
一卦之内有三爻动而合局者
```

本轮查得：

```text
Wikisource / CText 某底本
→ 一爻动

识典古籍、劝学网、太乙书局等整理本
→ 三爻动
```

现代整理文章还明确指出：孙正治注译版存在“一爻动”字样，而其所查其他版本多作“三爻动”。

现代朱辰彬《古筮真诠》引用此段时采用：

```text
三爻动
```

王虎应《增删卜易评释》所引文本也采用：

```text
三爻动
```

因此可以说：

```text
“三爻动”获得较多现代整理与版本见证
```

但本研究不能直接把：

```text
“一爻动” = 已证明错字
```

注册为事实。

原因：

1. 当前尚未建立《增删卜易》版本谱系；
2. 电子整理本不等于底本校勘；
3. 现代作者采用某一版本，只能增加 witness，不能替代版本学证明。

当前状态：

```text
ZSBY_first_formation_phrase
= edition_conflicted
likely_reading = three_moving_lines
canonicalization = not_authorized
```

这一区别必须在未来 formal rule 前解决，不能由程序开发者凭“语义看起来合理”直接改成三爻动。

来源：

```text
SRC-ZSBY / TRAD-ZSBY
location = 三合章 / 六合章相关版本
```

---

# 3. 《增删卜易》本身存在“成局”与“待时成局”的语义层级

同一传统段落同时出现两种表述：

前段：

```text
两爻动，一爻不动，亦成合局
```

后段又说：

```text
三爻若有两爻动，不成其局
须待后来日月补凑
谓之虚一待用
```

如果机械按字面，就会形成矛盾：

```text
两动一静
→ 成局
and
→ 不成局
```

但结合后续案例及《卜筮正宗·十八问答》的处理，最安全的研究解释不是删掉其中一句，而是区分：

```text
structural coalition candidate / pending coalition
vs
currently manifested coalition
```

即：

```text
两动一静
→ 可以构成三合的待成结构
→ 当前未必完整发力
→ 待静爻值日 / 被冲起 / 时令补足后兑现
```

《卜筮正宗·十八问答》对两动一静直接给出：

```text
必待一爻静者值日应事
```

这更支持：

```text
formation topology
≠ current manifestation
```

而不是简单二值：

```text
formed / not formed
```

本轮因此建议研究层至少保留：

```text
coalition_candidate_complete
coalition_candidate_pending
coalition_currently_manifest
coalition_temporally_deferred
```

仅为研究概念，不是 runtime enum。

---

# 4. 虚一待用：不是普通“缺一个支也算成局”

《增删卜易》明确使用：

```text
虚一待用
```

描述三合缺一、等待日月补凑的情况。

案例中可以出现：

```text
两个有效 constituent 已出现
+
第三支当前缺失 / 未动
↓
等待后来的日或月补足
↓
合局在对应时机成立 / 应事
```

因此：

```text
partial triad
```

不能直接输出：

```text
active coalition
```

它至少包含明确的 temporal dependency。

本轮结论：

```text
virtual_one_waiting
= pending formation / timing structure
≠ current full coalition by default
```

这也与上一轮的 Time-aware Interaction 原则一致。

---

# 5. 明动 + 暗动可以共同参与：传统直接支持

《增删卜易》明确：

```text
一爻明动，一爻暗动，亦作两爻动
```

因此对于三合 formation 来说：

```text
VISIBLE_MOVING
and
DARK_MOVING
```

至少在这个特定传统合同中并非完全不同权。

但这里只能推出：

```text
DARK_MOVING may satisfy a moving-participant requirement in three-harmony research
```

不能泛化为：

```text
DARK_MOVING == VISIBLE_MOVING for all Directed Interaction rules
```

这正是为什么 DARK_MOVING 等价性仍需独立研究。

朱辰彬现代体系也在其第一类吉凶层三合中接受暗动参与，但强调暗动力不持久，并把这种 temporality 带回实占解释。

王虎应《六爻预测自修宝典》同样将暗动列入可参与合局的来源。

现代横向结论：

```text
DARK_MOVING participation in some coalition formation
= cross-author compatible
```

但仍不能升级为全局 activity equivalence。

---

# 6. 空、破、墓：多数材料共同支持“延迟 / 条件化兑现”而不是永久取消

《增删卜易》明确：

```text
三合局中有一空破
→ 待填实之日月成之

有一爻入墓
→ 待冲开之日成之
```

《卜筮正宗·十八问答》也继续按：

```text
空 → 出空
合 → 待冲
墓 → 待冲
绝 → 待生
```

处理应事时机。

朱辰彬《古筮真诠》在扫描本中进一步系统化为：

```text
局内日破 / 月破
→ 待值令 / 补破

局内旬空
→ 待填空 / 冲空

局内入墓
→ 待冲墓出墓

局内被日月或动爻绊住
→ 待冲绊
```

王虎应《六爻预测自修宝典》也保留：

```text
空破 → 待填实
入墓 → 待冲开
```

所以这一层的横向兼容度较高：

```text
coalition member constrained
≠ coalition permanently erased
```

更准确的是：

```text
formation / manifestation may be deferred or constrained
```

因此未来 Coalition 模型必须和 Time Engine 保持接口，而不能把空破墓直接转为：

```text
coalitionExists = false
```

---

# 7. 日月究竟能否“参与成局”：传统文本与现代作者不能压成一个口径

这是本轮最大的 substantive conflict。

## 7.1 《增删卜易》

文本既说：

```text
日建、月建但有一而在局中
谓之局旺
```

又大量使用：

```text
虚一待用
借日月补凑
```

案例中甚至直接出现日月与卦爻共同形成三合的解释。

所以至少可以确认：

```text
calendar branches can participate in coalition manifestation / completion / reinforcement
```

但“日月是否与卦中动爻完全同类地承担 current outcome-level formation constituent”仍需要层级解释。

## 7.2 王虎应

《六爻预测自修宝典》明确采用较宽口径：

```text
日月、动爻、变爻、暗动之爻皆可参与合局
静爻不可
```

并进一步限制：

```text
若两个动爻中有一个为局中间的四正支
可借日月成局
```

其《增删卜易评释》又明确补充：

```text
日月也入三合局
但局中中间地支须在卦中发动
且卦内先构成半局
方可接日月成局
```

因此王虎应不是：

```text
任何日月 + 任意两支 = 三合
```

而是存在明显 formation gate。

分类：

```text
MOD-WHY
calendar_participation = allowed_with_constraints
```

## 7.3 朱辰彬

朱辰彬明确把：

```text
吉凶判断层
vs
应期细节层
```

分开。

其《古筮真诠》认为吉凶层 formation 应更严格：

```text
完整三支都来自卦内有效动变结构
日月与普通静爻不能无条件作为吉凶层 constituent
```

而到了应期细节层：

```text
日建
月建
动爻
变爻
暗动
甚至特定静爻
```

都可以进入三合分析，并允许虚一待补。

分类：

```text
MOD-ZCB
calendar_participation = layer_dependent
```

## 7.4 横向结论

所以现代文献并没有形成：

```text
one shared modern formation rule
```

而是：

```text
王虎应：较宽的 current formation contract，但有中神 / 半局 gate
朱辰彬：严格区分 outcome-level formation 与 timing/detail formation
```

因此：

```text
modern_cross_author_consensus
= not established for calendar-based outcome-level formation
```

必须保留为：

```text
modern_school_conflict / scope difference
```

---

# 8. 朱辰彬的吉凶层三类 formation：现代 refinement，不是传统共识

《古筮真诠》把吉凶层当前有效三合归纳为三类。

## 8.1 三个主卦 constituent 全部发动

包括：

```text
明动
+
特定暗动
```

但不把变爻直接混入这一类。

可以概括：

```text
three_active_original_lines
```

## 8.2 内卦一、三爻动变形成三合

朱辰彬保留传统内卦特殊动变结构：

```text
初爻 + 三爻发动
+
各自变爻补齐三支
→ 内卦三合局
```

这里变爻不是普通全局节点，而是依赖特定爻位和变卦拓扑组成 group。

这与前轮：

```text
changed lines must not become arbitrary global nodes
```

并不矛盾。

它说明：

```text
transform participation can exist through a special coalition pattern
```

而不是任意 pairwise 传播。

## 8.3 外卦四、六爻动变形成三合

同理：

```text
四爻 + 六爻发动
+
其变爻补齐三支
→ 外卦三合局
```

## 8.4 研究职责

以上三类是：

```text
MOD-ZCB modern systematization
```

虽然它直接解释传统《增删卜易》材料，但不能据此注册：

```text
stable classical universal formation contract
```

只能作为现代 refinement 与传统案例之间的解释桥。

---

# 9. 王虎应的“中神 / 四正支”约束：另一套现代 formation gate

王虎应把三合局中与合局五行同类的中间支看作关键：

```text
申子辰 → 子
亥卯未 → 卯
寅午戌 → 午
巳酉丑 → 酉
```

其教材要求：

```text
两动爻借日月成局时
其中一个动爻应为局中间四正神
```

同时虚一待用 / 半局亦要求：

```text
两个已有支中包含中间地支
```

这是一个明确的现代 formation gate。

朱辰彬也把中间支进一步解释为“轴心”，认为三合力量汇聚于中间支。

两位现代作者都提高了中间支的重要性，因此存在：

```text
modern_cross_author_compatibility:
central_branch_is_structurally_special
```

但他们对其理论表达和 formation scope 并不完全相同。

所以当前只允许：

```text
central-branch special role = modern compatible hypothesis
```

禁止直接写成：

```text
classical proven energy always resides only in middle branch
```

因为《古筮真诠》自己也明确承认：古论通常只说三支合出某五行，并没有明说“能量聚在哪一爻”；“轴心”是作者自己的现代明确化。

---

# 10. Group Actor：一旦合法成局，不应继续拆成普通三条单爻路径

这是本轮相对稳定的结论。

《增删卜易》大量以：

```text
官局
财局
子孙局
兄弟局
```

直接作为整体来判断。

两村争水案例更进一步：

```text
内卦形成一个局
外卦形成另一个局
↓
以两个 group actors 代表两方人众
↓
比较金局与木局
```

《卜筮正宗·十八问答》明确用：

```text
成局者，结党也
```

并同样处理：

```text
内外两局
```

虽然该组例文与《增删卜易》高度接近，不能在 provenance 上机械计为完全独立传统 vote，但至少证明这类 group actor 解释在后续传统中持续传播。

朱辰彬现代体系明确强调：

```text
吉凶层三合局一旦形成
一般复合连动路线应让位于三合整体
不能再把 constituent 拆开逐条生克
```

这与传统案例的实际用法相容。

因此研究层可安全确认：

```text
valid coalition formation
→ constituent-level ordinary interaction may be superseded by group-level adjudication
```

但这里的 `may be superseded` 仍需后续研究其精确边界；目前不直接注册全部 constituent edge 都永久失效。

---

# 11. Group-level relation 仍然不是最终吉凶

传统文本并非说：

```text
成局 = 吉
```

而是根据：

```text
局的六亲 / 五行属性
+
世爻 / 用神是否在局中
+
局是否生世 / 克世
+
局是否生用 / 克用
+
局自身旺衰
+
目标自身状态
```

判断。

所以：

```text
coalition formation
≠ coalition favorable
```

同样：

```text
coalition controls target
≠ final domain failure
```

这与 Directed Interaction Effectiveness 的职责一致。

未来应是：

```text
Coalition Formation
↓
Coalition Manifestation
↓
Coalition → Target Directed Relation
↓
Coalition Effectiveness
↓
Domain Evidence
↓
Domain Assessment
```

而不是直接：

```text
三合忌神局
→ 现实事件必失败
```

---

# 12. “局旺”与“局成立”必须分开

《增删卜易》说：

```text
日建、月建但有一而在局中
谓之局旺
```

这至少说明：

```text
calendar support can increase coalition condition
```

但不能偷换成：

```text
calendar presence itself always creates the coalition
```

因此未来研究至少区分：

```text
formationSource
vs
coalitionCondition / coalitionVigor
```

例如：

```text
三支已通过合法卦内动变结构成局
+
月建恰为其中一支
→ coalition condition strengthened
```

和：

```text
卦内只有两支
+
月建补第三支
→ calendar-completed coalition candidate
```

不是同一个责任。

这也是王虎应与朱辰彬现代体系分歧的主要位置之一。

---

# 13. Coalition imperfection：应拆成 formation defect 与 manifestation defect

现有材料中：

```text
空
破
墓
合绊
缺一
```

都会影响三合，但它们不是同一种 defect。

更安全的研究拆分：

## 13.1 Formation incomplete

```text
缺一
两动一静且静爻尚未被激活
```

更接近：

```text
coalition not fully formed / pending
```

## 13.2 Formation complete but currently constrained

```text
constituent 旬空
constituent 月破 / 日破
constituent 入墓
constituent 被合绊
```

可能更接近：

```text
coalition topology exists
but current manifestation is constrained
```

这种区分能解释传统所谓：

```text
待填实
待出空
待冲墓
待冲绊
```

因此不能只有：

```text
coalitionValid = boolean
```

---

# 14. “当前成局”与“应期成局”不能混用

朱辰彬现代体系对这一点给出了最明确的层次化解释：

```text
吉凶判断层
→ formation gate 严格

应期细节层
→ formation source 更宽
→ 日月、变爻、暗动、特定静爻、虚一待补都可能参与
```

无论是否最终接受其全部细则，这个层次区分本身对解释《增删卜易》内部文本张力很有价值。

例如：

```text
两动一静
```

可以同时满足：

```text
具有三合结构潜力
```

而又：

```text
当前不能按完整 group actor 发力
```

直到静爻值日 / 被冲起。

因此本轮认为：

```text
formationTimeScope
```

是一个真实研究职责。

候选概念：

```text
current_outcome_scope
future_manifestation_scope
timing_detail_scope
```

不是 schema。

---

# 15. Group vs Group：传统确实存在 coalition-level competition

两村争水案例说明传统可以暂时放下普通：

```text
世 ↔ 应
```

而改用：

```text
inner coalition ↔ outer coalition
```

代表两方群体。

然后判断：

```text
金局克木局
+
两局各自旺衰
+
日辰制化
```

这证明：

```text
coalition can be target of another coalition
```

未来网络可能需要：

```text
Group Node → Group Node
```

而不只是：

```text
Group Node → Line Node
```

但这仍不能立即实现通用 graph solver，因为：

1. 哪些主题允许 group 取代世应角色并未统一；
2. 内外卦作为群体代理明显带有具体题义；
3. group-vs-group 的 relative force / third-party intervention 仍未 formalized。

所以：

```text
coalition-to-coalition relation
= traditionally evidenced
= generic runtime contract not ready
```

---

# 16. 现代横向比较：王虎应 vs 朱辰彬

| 研究问题 | 王虎应 | 朱辰彬 | 当前结论 |
|---|---|---|---|
| 三合局真实存在 | 是 | 是 | modern compatible |
| 中间四正支具有特殊地位 | 是 | 是，明确称轴心 | compatible，但理论表达不同 |
| 暗动可参与 | 是 | 吉凶层第一类可参与 | compatible |
| 日月可参与 | 可以，有 gate | 应期细节层可以；吉凶层更严格 | scope conflict |
| 变爻可参与 | 可以 | 吉凶层仅特定内外卦动变结构；应期层更宽 | conflict / scope difference |
| 普通静爻参与 | 不可 | 吉凶层不可；应期细节层可出现 | scope difference |
| 虚一待用 | 接受，强调中间支条件 | 接受，但主要放应期细节层 | compatible on temporality, not same formation tier |
| 空破墓影响 | 待填实 / 冲开 | 同，并扩展绊住等破绽 | compatible |
| 合局一旦形成是否整体化 | 强调局力量远大于单支 | 明确反对再按普通复合动分拆 | compatible direction |
| outcome-level formation contract | 较宽 | 较严格分层 | not consensus |

因此：

```text
MOD-WHY + MOD-ZCB
```

不能标记为：

```text
modern_consensus on full formation rules
```

只能拆 proposition：

```text
A. coalition exists            → compatible
B. central branch special      → compatible modern refinement
C. dark moving participation   → compatible in relevant scope
D. void/break/tomb recoverable → compatible
E. calendar participation      → scope conflict
F. transform participation     → scope conflict
G. static-line participation   → layer conflict
```

这正是 provenance normalization 要求的 proposition-level independence，而不是按作者整本书投票。

---

# 17. 传统来源独立性：卜筮正宗不能在这里自动算第二票

《卜筮正宗·十八问答》确实提供：

```text
成局者，结党也
两动一静待静爻值日
空待出空
合待冲
墓待冲
内外两局
虚一待用
```

等非常直接的材料。

但本轮比对发现，其三合案例与《增删卜易》高度重合，多个实例的结构、占题与断语都非常接近。

因此根据 Source Registry：

```text
SRC-BSZZ
```

虽然默认可使用：

```text
TRAD-BSZZ-INDEPENDENT
```

但只有在证明该具体证据是独立 commentary / evidence 后才能计独立 vote。

本轮不做这一假设。

当前最安全分类：

```text
ZSBY ↔ BSZZ three-harmony evidence
= transmission / reuse risk high
= do not count as two independent traditional lineages yet
```

这不影响其作为 additional textual witness 的价值。

---

# 18. 《黄金策》只能支持“合为结构因素”，不足以单独解决本轮 formation contract

《黄金策·总断千金赋》保存：

```text
生扶拱合
```

并在传承注解中将合包含六合、三合。

同时有：

```text
动值合而绊住
```

等 path 规则。

这些材料足以支持：

```text
三合属于六爻传统结构关系之一
```

但本轮没有得到《黄金策》自身足够完整、独立的：

```text
三爻 / 两动一静 / 虚一 / 内外动变
```

formation contract。

所以不能用 HJC 作为解决《增删卜易》版本冲突的外部裁判。

---

# 19. 《断易天机》当前只能提供较弱外部兼容支持

《断易天机》相关总断材料明确把：

```text
三合
```

作为卦中可观察关系，并解释申子辰等合局。

这可以作为：

```text
three-harmony concept existed outside ZSBY lineage
```

的外部兼容证据。

但目前检出的材料没有提供与本轮同粒度的 formation 细则。

因此：

```text
TRAD-DYTJ
supports concept existence
but does not resolve formation-detail conflict
```

---

# 20. Proposed Research Taxonomy v0.1

以下只作为研究 vocabulary，不是 executable enum。

## 20.1 topology

```text
triad_full_present
triad_partial_present
triad_missing_one
```

## 20.2 participant provenance

```text
original_visible_moving
original_dark_moving
original_static
transform_local
calendar_day
calendar_month
```

## 20.3 formation pattern

```text
all_original_active
inner_transform_pattern
outer_transform_pattern
calendar_completed_pattern
pending_virtual_one
```

## 20.4 manifestation constraints

```text
member_void
member_break
member_tomb
member_bound
member_static_pending
```

## 20.5 coalition state

```text
candidate_only
pending_temporal_completion
formed_currently_constrained
formed_manifest
formation_scope_conflicted
```

## 20.6 coalition relation

```text
coalition_generates_target
coalition_controls_target
coalition_same_element_target
coalition_vs_coalition
```

所有这些都允许：

```text
unresolved
```

---

# 21. Minimum Research Contract

如果未来继续 formalization，三合层至少要保存：

```text
triad identity
coalition element
constituent branches
constituent line identities if present
participant provenance per constituent
formation pattern
formation time scope
current manifestation state
constraint reasons[]
recovery conditions[]
coalition target identity
coalition-target relation
coalition condition / relative force evidence
source provenance refs
modern school interpretation refs
synthesis status
```

尤其不得只保存：

```text
sanHe = true
```

否则会永久丢失：

```text
当前成局
vs
虚一待用
vs
空破待实
vs
现代作者不同 scope
```

这些最关键的传统信息。

---

# 22. Explicit Non-Inferences

本研究不得推出：

```text
三支出现 = 当前成局
三支都在盘中 = 当前成局
一个动爻即可无条件成局
两动一静 = 当前已完整发力
日月永远可以补任何两支成局
变爻永远可以和任意本卦爻成局
静爻永远不参与任何层面的三合
暗动与明动在所有规则中完全同权
空破墓 = 三合永久不存在
虚一待用 = 现在已经是完整局
中间四正支轴心 = 已证明的古典普遍规则
成局后每个 constituent 仍应和 target 独立重复计票
成局 = 吉
忌神局 = 现实事件必败
三合局力量大 = 可以绕过 target condition
```

也不得把：

```text
王虎应 formation rules
```

或：

```text
朱辰彬 formation rules
```

任何一套直接标成：

```text
classical universal contract
```

---

# 23. 对 Interaction Precedence 的修订

上一轮将：

```text
Group-Level Adjudication（若合法成局）
```

放在 local precedence / bounded synthesis 之后。

本轮需要更精确：

```text
先检查 coalition formation eligibility
↓
如果合法形成当前 group actor
↓
该 group actor 可能 supersede 原 constituent 的普通复合动路径
↓
再做 group → target effectiveness
```

因此 group formation 不是单纯最后加一层：

```text
pair interactions first
then add coalition bonus
```

而可能发生：

```text
constituent interaction topology
→ coalition transformation
→ new group-level topology
```

这进一步证明 generic graph solver 不能简单遍历所有 pair edges 后求和。

---

# 24. 对“四处生克冲合”的影响

上一轮确认《增删卜易》存在：

```text
月
日
卦中动爻
本位回头变爻
```

四处综合。

三合局研究提醒：

```text
“卦中动爻”这一处
```

内部可能先发生：

```text
多个动爻 → 三合 coalition
```

然后才作为一个整体关系进入用神判断。

所以：

```text
multi-moving internal reducer
```

不能仅做：

```text
逐动爻先投票
```

必须先识别：

```text
coalition formation
continuous generation
path diversion
source suppression
```

等结构。

这解释了为什么“四处”虽然允许 bounded aggregation，却仍不能直接实现。

---

# 25. 对 Travel / Transport 与其他主题的影响

Three-Harmony Coalition 是共享层，不属于 Travel 私有。

任何主题未来都可能出现：

```text
Career target
Study target
Litigation target
Lost Property target
Person Return target
Transport target
```

被一个合法 coalition：

```text
生
克
比和
```

或 coalition 本身包含关键 role line。

但 shared coalition 层只能输出：

```text
合法 group actor
+
当前 manifestation
+
group → target relation/effect candidate
```

不能输出：

```text
航班取消
考试通过
录用成功
败诉
失物找回
行人归来
```

Domain Assessment 仍必须在下游。

---

# 26. 本轮正式 Gate

已解决：

```text
三合是否是真实传统 group structure
→ yes

合法三合是否可以整体取代部分 constituent-level 普通解释
→ yes, research-supported

formation 与 manifestation 是否必须分开
→ yes

空破墓合绊是否更适合 temporal / manifestation constraint
→ yes

虚一待用是否应保留 pending semantics
→ yes

暗动是否可在特定三合 formation 中参与
→ yes

现代作者是否完全一致
→ no
```

未解决：

```text
1. 《增删卜易》“一爻动 / 三爻动”版本 canonical reading
2. 两动一静在 current outcome scope 的精确 status
3. 日月补局在传统原层级上的统一解释
4. 变爻参与三合的跨传统拓扑边界
5. 中间四正支是否为 classical mandatory core
6. coalition formed 后 constituent ordinary edges 的 supersession 精确边界
7. coalition relative force 如何与日月 / target condition 合成
8. group vs group 的 generic adjudication
9. 三合局与普通六合 / 三刑 / 三会 group mechanism 的共享程度
```

因此：

```text
Three-Harmony Coalition Formation & Effectiveness
= research complete v0.1
= shared structure supported
= layered formation supported
= modern scope conflict preserved
= not synthesis-ready
= no Formal Expansion
```

---

# 27. 推荐下一研究

下一步不应马上写 Coalition Resolver。

优先研究：

```text
Three-Harmony Edition Witness & Formation Canonicalization Review v0.1
```

目标只解决：

```text
A. 一爻动 / 三爻动版本谱系
B. 两动一静“亦成局”与“不成局”的文本层级
C. 虚一待用的 current-vs-future semantics
D. 日月“在局中 / 补局 / 局旺”是否是三个不同职责
E. 内卦初三、外卦四六动变模式是否能获得 ZSBY 之外的独立传统支持
```

如果经过版本与独立传统审查仍无法收束，则合法结果应是：

```text
research completed
formation contract remains school/edition specific
formalization deferred
```

而不是为了程序实现选一个现代作者作为“正确答案”。

---

# 28. Final Decision

```text
Three-Harmony Coalition
= traditionally supported group-level actor

formation topology
≠ current formation
≠ current manifestation
≠ effectiveness
≠ final domain outcome

virtual-one-waiting
= temporally pending structure

void / break / tomb / binding
= manifestation / timing constraints
= not global erasure

modern WHY vs ZCB
= compatible on coalition existence, dark-moving participation, temporal recovery
= conflicted / differently layered on calendar, transform and static participation

central branch special role
= modern cross-author compatible refinement
= not yet classical universal rule

group formation may supersede ordinary constituent interaction paths
= supported direction
= exact boundary unresolved

runtime coalition resolver
= not authorized

Formal Expansion
= not authorized
```
