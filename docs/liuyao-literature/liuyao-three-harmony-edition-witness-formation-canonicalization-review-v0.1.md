# 龟甲 · 六爻 Three-Harmony Edition Witness & Formation Canonicalization Review v0.1

日期：2026-09-06

状态：`research_complete_design_only_partial_canonical_kernel_no_textual_emendation`

范围：六爻共享研究层 / 三合局文本异文、版本见证、formation 最小共享核、传统交叉见证与现代横向校验。

上游：

- `liuyao-three-harmony-coalition-formation-effectiveness-review-v0.1.md`
- `liuyao-interaction-precedence-multi-moving-adjudication-review-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`

> 本研究只回答：面对《增删卜易》三合章存在的异文与内部语义张力，当前证据允许我们把“三合 formation 的共享研究口径”定到什么程度。v0.1 不替古籍校勘定本，不建立 executable coalition resolver，不修改 current-22、Rule Registry、Time Engine、训练数据或 Candidate 开发线。

---

# 1. Executive Decision

本轮最重要的结论是：

```text
可以 canonicalize 研究解释边界
≠
可以 canonicalize 古籍原文
```

当前确实可以抽出一个较小的、跨研究继续使用的：

```text
Three-Harmony Formation Research Kernel
```

但不能把现存异文直接改写成单一“正确文本”。

尤其两个关键 locus：

```text
A. 一爻动 / 三爻动
B. 虚三待用 / 虚一待用
```

都必须保留：

```text
edition_conflicted
```

状态。

因此本轮允许的是：

```text
text witness normalization
+
proposition-level canonical research boundary
```

不允许的是：

```text
silent textual emendation
```

最终总体分类：

```text
classical_text_canonicalization = not_authorized
research_kernel_canonicalization = partially_supported
runtime_formation_contract = not_ready
```

---

# 2. 方法论先决条件：网页数量不是版本数量

本轮版本核查首先确认一条必须长期保留的方法论约束：

```text
same wording on 5 websites
≠ 5 independent edition witnesses
```

电子古籍网站可能来自：

- 同一公开电子转录；
- 同一整理本的再次复制；
- OCR 后的二次传播；
- 未标明底本的排印文本；
- 现代作者引用后的再转载。

因此版本见证必须至少区分：

```text
A. digital transcription witness
B. named printed-edition witness
C. modern recension / quotation witness
D. independently verified historical edition witness
```

其中只有 D 才真正接近版本学意义上的独立底本见证。

当前本研究拥有较多 A、少量 B 的二手报告，以及 C；尚没有形成完整 D 级别的《增删卜易》三合章版本谱系。

所以：

```text
majority of websites
```

只能增加：

```text
probable reading confidence
```

不能直接授权：

```text
canonical text correction
```

这一区分是本轮所有结论的基础。

---

# 3. Edition Locus A：“一爻动” vs “三爻动”

## 3.1 当前见证分布

《增删卜易》三合章第一类 formation 现存至少有两种明显读法。

### A 组：`一爻动`

当前可查电子转录包括：

```text
Wikisource
CText
```

相关文本作：

```text
一卦之内有一爻动而合局者
```

### B 组：`三爻动`

当前可查整理文本包括：

```text
识典古籍
劝学网
若干现代整理本 / 校正文档
```

相关文本作：

```text
一卦之内有三爻动而合局者
```

现代作者方面：

```text
王虎应
朱辰彬
```

在其三合论述 / 引文中均采用：

```text
三爻动
```

朱辰彬用户提供扫描本《古筮真诠》亦明确引用：

```text
三合者有四。一卦之内，有三爻动而合局者，一也……
```

来源：

```text
SRC-ZCB-GSZZ
independenceGroup = MOD-ZCB
scan_verified
```

## 3.2 命名版本信息的当前上限

本轮还找到现代整理文章报告：

```text
孙正治注译版 / 中医古籍出版社 / 对应页
→ 一爻动
```

并称其所核其他版本多为：

```text
三爻动
```

但当前这条属于：

```text
secondary named-edition report
```

而非本研究直接逐页核验该纸本。

因此不能把它提升为：

```text
direct historical-edition witness
```

## 3.3 文义上为什么“三爻动”更可理解

紧接第一类之后，文本又列：

```text
两爻动，一爻不动
```

以及：

```text
内卦初、三爻动而变出第三支
外卦四、六爻动而变出第三支
```

从结构平行性看：

```text
三爻动
```

明显更像第一类“完整三支直接发动”的对应项。

同时后文反复讨论：

```text
三爻齐发
两爻发动但缺一
```

也更容易和“三爻动”协调。

所以本轮允许：

```text
probable_reading = 三爻动
```

但文义合理性仍不能替代底本校勘。

## 3.4 本 locus 的正式状态

```text
ZSBY_locus_A
= edition_conflicted

reading_A
= 一爻动

reading_B
= 三爻动

probable_reading
= 三爻动

formal_textual_emendation
= not_authorized
```

因此未来研究文档可以写：

```text
多数当前现代整理 / 现代作者采用“三爻动”
```

但不能写：

```text
《增删卜易》原文确定就是“三爻动”
```

---

# 4. Edition Locus B：“虚三待用” vs “虚一待用”

本轮发现第二处关键异文，且它不能被视为第一处的简单附属。

## 4.1 当前见证分布

### `虚三待用`

当前电子文本可见于：

```text
Wikisource
CText
部分其他电子转录
```

其上下文仍是：

```text
三爻若有两爻动
须待后来日月补凑合成其局
```

但名词作：

```text
虚三待用
```

### `虚一待用`

当前整理文本可见于：

```text
识典古籍
劝学网
若干校正 / 整理文本
```

并为现代：

```text
王虎应
朱辰彬
```

共同采用。

朱辰彬扫描本直接解释：

```text
三合局只有两支 / 两动一静
↓
等待后来日月补足所缺的一支
↓
虚一待用
```

来源：

```text
SRC-ZCB-GSZZ
MOD-ZCB
scan_verified
```

## 4.2 此 locus 与第一处异文不能强行归成一个固定版本簇

本轮核对发现：

```text
一爻动
```

与：

```text
虚三待用
```

确实在部分电子转录中共现。

但其他整理文本还可见：

```text
三爻动
+
虚三待用
```

因此不能建立：

```text
Version Cluster A
= 一爻动 + 虚三

Version Cluster B
= 三爻动 + 虚一
```

这样的过度简化。

更安全的是：

```text
locus_A
locus_B
```

作为两个独立校勘点；它们的转录历史可能部分重叠，但目前没有建立足够的版本谱系来证明固定绑定。

## 4.3 文义上为什么“虚一”更强

本段明确描述：

```text
三合共有三支
当前只有两支具备作用条件
缺一支
等待日月补一支
```

所以现代汉语 / 规则语义上：

```text
虚一
```

显著更符合“缺一个”的结构。

后续案例也直接称：

```text
内少寅字
须待寅日
应虚一以待用
```

因此本轮可允许：

```text
probable_reading = 虚一待用
```

但依旧：

```text
semantic plausibility
≠ textual proof
```

## 4.4 本 locus 的正式状态

```text
ZSBY_locus_B
= edition_conflicted

reading_A
= 虚三待用

reading_B
= 虚一待用

probable_reading
= 虚一待用

formal_textual_emendation
= not_authorized
```

---

# 5. 两处异文共同说明：不能让程序开发替代版本学

如果为了实现方便直接写：

```text
三爻动
+
虚一待用
```

并把它称作：

```text
canonical classical text
```

会把三个不同层次混在一起：

```text
A. probable textual reading
B. modern interpretive preference
C. executable rule choice
```

本研究要求三者始终拆开。

未来即使最终工程层选择一种 operational reading，也必须标记为：

```text
implementation interpretation
```

而不是伪装为：

```text
textually proven original wording
```

因此本轮明确禁止：

```text
repo source normalization
→ silently rewrite historical quotation
```

---

# 6. “两动一静亦成局” vs “两动不成局”：是文本张力，不是可直接删改的错误

《增删卜易》同一三合章出现：

```text
若两爻动，一爻不动，亦成合局
```

随后又说：

```text
三爻若有两爻动，不成其局
须待后来日月补凑合成其局
```

这在字面上构成真实张力。

## 6.1 本轮拒绝两种简单处理

禁止 A：

```text
删除“亦成合局”
```

禁止 B：

```text
删除“不成其局”
```

因为当前没有版本证据证明哪一句属于后加、误抄或衍文。

## 6.2 《卜筮正宗》提供的语义辅助

《卜筮正宗·十八问答》保存：

```text
如一爻静，二爻发者
必待一爻静者值日应事
```

同时把三合称作：

```text
成局者，结党也
```

这说明传统后续解释至少能容纳：

```text
结构已经具备三合关系
+
当前应事 / 发力仍需等待静爻取得时间条件
```

但由于该组三合材料与《增删卜易》高度重合，本轮仍不把它机械计为独立传统 vote。

它的作用是：

```text
additional textual witness
+
semantic clarification
```

而不是：

```text
second independent lineage proof
```

## 6.3 当前最安全的分层解释

本轮继续保留上一研究提出的解释：

```text
formation topology / coalition candidate
≠
current manifestation
```

于是：

```text
两动一静
```

可以解释为：

```text
已经形成可识别的三合候选结构
```

但：

```text
尚未满足当前完整表现条件
```

需要：

```text
静爻值日
日月补足
或相关触发
```

之后才兑现。

重要：

```text
这是一种跨文本相容的研究解释
≠
已经证明原作者故意设计了 topology / manifestation 两层术语
```

分类：

```text
semantic_layered_reconciliation
= supported_interpretation

textual_emendation
= not_authorized
```

---

# 7. 现代横向检验：朱辰彬把这层张力明确制度化

朱辰彬《古筮真诠》扫描本明确将三合拆成：

```text
吉凶判断层
vs
应期细节层
```

并直接指出《增删卜易》原三合分类：

```text
层次不清
```

其现代体系中：

## 吉凶判断层

formation 更严格：

```text
1. 主卦三支均活动（明动 / 暗动）
2. 内卦初、三位动变形成特定三合
3. 外卦四、六位动变形成特定三合
```

普通：

```text
两动一静
缺一待补
日月直接补齐
```

一般不作为当前吉凶层完整 formation。

## 应期细节层

则大幅放宽：

```text
日建
月建
动爻
变爻
暗动
特定静爻 / 世用
缺一待补
```

均可进入动态三合分析。

用户提供扫描本明确支持这一层次化口径。

来源：

```text
SRC-ZCB-GSZZ
MOD-ZCB
scan_verified
```

这条现代材料的重要价值是：

```text
它提供了一个可以解释古典文本内部张力的现代系统化方案
```

但不能反推：

```text
野鹤原文已明确区分这两层
```

---

# 8. 王虎应横向体系：formation scope 更宽，但同样承认等待补足

王虎应《六爻预测自修宝典》公开文本明确：

```text
日月
动爻
变爻
暗动
```

均可参与三合，普通静爻不可。

并规定：

```text
若卦中有两个动爻
其中一个为局中四正神 / 中间支
可借日月合局
```

若只有两支且其中包含中间支，又没有日月当前补足，则：

```text
虚一待用
```

待后续第三支出现。

其《六爻疑惑指迷》材料也继续强调：

```text
三合至少两个动爻
+
子午卯酉需要在卦中发动
```

来源：

```text
SRC-WHY-ZX
SRC-WHY-YH
MOD-WHY
```

同作者多书：

```text
= multiple witnesses
≠ multiple independent author-school votes
```

## 与朱辰彬的真正分歧

两家并不是“一个对、一个错”的简单关系，而是 formation 层次定义不同。

王虎应倾向：

```text
较宽的当前 formation participant set
```

朱辰彬倾向：

```text
吉凶层严格 formation
+
应期层宽 formation
```

所以当前：

```text
modern_full_formation_consensus
= false
```

---

# 9. Calendar Role 必须拆成至少四种职责

本轮把上一研究里“日月参与三合”的混合概念进一步拆开。

至少存在：

```text
A. coalition_vigor
B. future_formation_completion
C. manifestation_recovery
D. activity_trigger
```

这四类都有不同传统 / 现代证据，不可再用一个：

```text
calendarParticipatesInCoalition = true
```

覆盖。

---

# 10. Calendar Role A：局旺 / coalition vigor

《增删卜易》多数整理文本保存：

```text
日建、月建，但有一而在局中，谓之局旺
```

这里最安全的含义是：

```text
calendar presence can strengthen an already recognized coalition context
```

即：

```text
coalition condition / vigor
```

但这句话本身不足以证明：

```text
任何时候只要日月补足第三支
→ 当前吉凶层 coalition formation 自动成立
```

因此：

```text
calendar_as_vigor
= traditional_supported
```

与：

```text
calendar_as_current_member
```

必须分开。

---

# 11. Calendar Role B：虚一补足 / future formation completion

《增删卜易》明确有：

```text
三合缺一
+
后来的日月补凑
→ 成局 / 应事
```

并有实际案例：

```text
寅午戌少寅
→ 待寅日
```

这清楚支持：

```text
calendar can complete a pending coalition in future timing
```

即：

```text
calendar_future_completion
= traditional_supported
```

这仍不等于：

```text
calendar_current_membership
= universally supported
```

---

# 12. Calendar Role C：manifestation recovery

传统及后续现代材料都存在：

```text
空 → 待填 / 冲空
破 → 待填实 / 补破
墓 → 待冲开
合绊 → 待冲开
```

对应三合 constituent 或 coalition 当前不能完整兑现时的恢复条件。

因此日月还承担：

```text
temporal_recovery_trigger
```

这和“补缺形成 coalition”又不同。

例如：

```text
三支 topology 已完整
+
其中一支旬空
↓
不是缺第三支
↓
而是已有 constituent 当前 manifestation constrained
```

故未来 Time 层必须区分：

```text
completion
vs
recovery
```

---

# 13. Calendar Role D：activity trigger / 暗动触发

日辰冲特定旺相静爻可形成：

```text
DARK_MOVING
```

随后该原卦爻取得：

```text
activity qualification
```

在三合研究中，这意味着：

```text
calendar
→ triggers line activity
→ line may become eligible coalition constituent
```

这里日辰不是：

```text
直接作为 coalition member
```

而是：

```text
activity trigger
```

朱辰彬扫描本在 outcome-level 三合第一类中明确允许：

```text
暗动
```

王虎应也允许暗动参与。

所以：

```text
calendar_activity_trigger
= traditional-path-compatible
+
modern cross-author compatible
```

---

# 14. 当前不能统一的 Calendar Role：direct current membership

真正存在分歧的是：

```text
日月本身是否可以作为当前吉凶层 coalition 的 ordinary constituent
```

王虎应：

```text
可以
但有中间支 / 动爻 gate
```

朱辰彬：

```text
吉凶判断层一般不以日月直接补成普通 coalition
应期细节层可以
```

《增删卜易》原文本身同时保存：

```text
局旺
后来日月补凑
借月建成局的案例表达
```

但这些语句究竟属于：

```text
当前 formation
future formation
vigor
manifestation
```

并未以现代层次术语分清。

因此当前只能：

```text
calendar_current_membership
= school_specific / unresolved
```

不得放进共享 classical kernel。

---

# 15. 内卦初三 / 外卦四六动变成局：ZSBY 直接，但独立传统复核不足

《增删卜易》的“四类三合”明确列：

```text
内卦初爻、三爻动
动而变出之爻成三合
```

以及：

```text
外卦四爻、六爻动
动而变出之爻成三合
```

这说明在 ZSBY 体系中：

```text
changed-line participation
```

存在特定位置拓扑例外。

## 15.1 朱辰彬现代体系直接采用并强化这两类

《古筮真诠》把它们列为吉凶层三合仅有的三类 formation 中的第二、第三类。

同时其现代解释强调：

```text
这些变爻参与不是一般“所有变爻自由入局”
而是特定内 / 外卦位置动变复合结构
```

这与 ZSBY 的文字高度相容。

## 15.2 王虎应只提供广义兼容，不提供相同严格 positional contract

王虎应允许：

```text
变爻参与三合
```

但当前材料不足以证明其共享：

```text
只有初三 / 四六这两个 positional transform modes
```

的严格限制。

所以：

```text
WHY compatibility
= broad transform participation
≠ same formation contract
```

## 15.3 独立传统来源仍不足

本轮继续检查：

```text
卜筮正宗
断易天机
易隐
火珠林
```

未获得足够明确、独立的：

```text
内初三动变成局
外四六动变成局
```

公式见证。

《卜筮正宗》十八问答主要处理：

```text
三爻齐发
两动一静
空 / 合 / 墓 / 绝的应期
```

而非重复这两个 positional mode。

因此当前分类：

```text
inner_1_3_transform_mode
outer_4_6_transform_mode
= classical_single_lineage_direct
+ modern_ZCB_adoption
+ broad_WHY_compatibility
+ independent_traditional_corroboration_not_established
```

不得升级为：

```text
stable_shared_classical_consensus
```

---

# 16. 中间四正支 / 轴心：现代横向相容，但不是古典共享 gate

王虎应现代体系强调：

```text
三合若只两个动爻
需要局中的四正神 / 中间支参与发动
```

《六爻疑惑指迷》同样强调：

```text
子午卯酉必须在相关 formation 中发动
```

朱辰彬也把：

```text
子午卯酉
```

解释为三合局的：

```text
轴心
```

但其《古筮真诠》同时明确指出：

```text
古论主要说明三支合出何种五行
并没有明确说明“力量聚于哪个爻”
```

因此应分类：

```text
central_branch_special_role
= modern_cross_author_compatible_refinement
```

而：

```text
central_branch_mandatory_classical_gate
= not_established
```

不能把现代两家都接受的 refinement 反投射成：

```text
classical stable consensus
```

---

# 17. Group Actor 本身比 Formation Syntax 更稳定

虽然 formation 的具体入口存在异文与现代分歧，但更高一层结构反而稳定得多。

传统与后续材料共同支持：

```text
一旦被承认为三合成局
→ 三支不再只是三个独立 pairwise actors
→ 可以作为一个整体“局”参与判断
```

《卜筮正宗》直接称：

```text
成局者，结党也
```

两村争水案例进一步表明：

```text
inner coalition
vs
outer coalition
```

可以作为两个 group actors 比较。

朱辰彬现代体系更明确提出：

```text
吉凶层三合一旦形成
不能再按普通复合动拆开判断
```

因此：

```text
group_actor_semantics
= stronger and more stable
```

而：

```text
exact formation syntax
= less stable
```

这也是为什么未来研究应该：

```text
先严格 gate formation
再允许 group-level adjudication
```

而不能反过来看到三个支就自动建 group node。

---

# 18. 可 canonicalize 的最小 Research Kernel

经过版本、传统、现代横向复核，本轮允许形成以下：

```text
Three-Harmony Formation Research Kernel v0.1
```

注意：

```text
Research Kernel
≠ executable rule set
```

## K1. 四组三合身份稳定

```text
申子辰 → 水
巳酉丑 → 金
寅午戌 → 火
亥卯未 → 木
```

这一层没有本轮关键争议。

状态：

```text
stable_consensus_identity
```

## K2. 三支共同出现不等于当前 active coalition

禁止：

```text
branch-set complete
→ active coalition
```

还必须考虑：

```text
activity / transform / timing / defect / source-specific formation rules
```

状态：

```text
cross_source_compatible
```

## K3. 主卦三支均具活动资格，是安全 admitted formation case

无论第一异文最终如何定本：

```text
三支在主卦均为明动 / 经规则成立的暗动
```

作为完整三合 formation case，获得：

```text
ZSBY probable reading
BSZZ three-active witness
WHY compatibility
ZCB explicit acceptance
```

因此可作为：

```text
shared research admitted formation case
```

注意这仍不自动推出：

```text
coalition currently effective
```

## K4. 两动一静 / 缺一必须保留 pending / conditional state

当前不能把它强制统一成：

```text
formed now
```

也不能统一成：

```text
not a coalition at all
```

至少应保留：

```text
pending_or_conditional_formation
```

并交给时间 / source-specific doctrine 进一步判断。

状态：

```text
semantic_reconciliation_supported
full_contract_unresolved
```

## K5. 空破墓合绊更接近 manifestation constraints，而非删除 topology

这些状态有明确：

```text
填实
冲空
冲墓
冲绊
```

恢复语义。

因此 Research Kernel 允许：

```text
formation topology may exist
+
current manifestation constrained
```

状态：

```text
cross_source_compatible_temporal_structure
```

## K6. Calendar role 必须 typed

至少保留：

```text
coalition_vigor
future_completion
manifestation_recovery
activity_trigger
```

不允许一个布尔字段吞并。

状态：

```text
research_required_shared_boundary
```

## K7. Calendar direct current membership 不进入共享 kernel

当前保留：

```text
school_specific / unresolved
```

## K8. 初三 / 四六动变模式不进入共享 kernel

它们：

```text
ZSBY direct
ZCB adopted
```

但独立传统复核不足。

因此只能作为：

```text
source_specific_classical_candidate
```

不能作为共享 formation contract。

## K9. 中间四正支强制 gate 不进入 classical kernel

它是：

```text
modern cross-author compatible refinement
```

但未取得足够古典直接依据。

## K10. Coalition formation 与 effectiveness 永远分层

即使 formation 已 admitted：

```text
formation
≠ manifestation
≠ strength
≠ directional effect
≠ final domain outcome
```

这一层继续继承 Directed Interaction Effectiveness 的总架构。

---

# 19. 哪些内容本轮明确不 canonicalize

以下不得写成共享传统事实：

```text
《增删卜易》原文确定是“三爻动”
《增删卜易》原文确定是“虚一待用”
两动一静在任何流派下一律当前成局
两动一静在任何流派下一律不成局
日月永远可以直接作为当前吉凶层 coalition member
日月永远不能作为当前吉凶层 coalition member
所有变爻都可以自由加入三合
只有初三 / 四六变爻才能加入三合
子午卯酉在古典传统中已被证明是强制 formation gate
三支齐全即可建 group actor
coalition 一旦形成便不受空破墓合影响
```

这些均超出当前证据。

---

# 20. 对上一轮 Three-Harmony Review 的精确修订

上一轮已经提出：

```text
formation topology
formation / activation
current manifestation
group effectiveness
```

本轮保留该四层，但对第一层再加入：

```text
textual-source scope
```

因此更完整的研究链为：

```text
Text / School Formation Doctrine
↓
Formation Topology Candidate
↓
Formation Admission State
↓
Current Manifestation State
↓
Coalition Directed Relation
↓
Coalition Effectiveness
↓
Domain Evidence
```

为什么第一层必须存在：

因为：

```text
WHY formation doctrine
≠ ZCB outcome-layer formation doctrine
≠ unresolved ZSBY text itself
```

如果不保留 doctrine provenance，就会把现代学派差异提前消失。

---

# 21. 对 Provenance Registry 的要求

本轮不修改 source registry，但未来若 formalize 三合 evidence，至少要记录：

```text
sourceId
edition / transcription witness if known
textual locus
reading variant
proposition scope
interpretive layer
independence group
```

尤其不能只写：

```text
sourceId = SRC-ZSBY
```

然后假装：

```text
ZSBY 三合原文没有异文
```

对两个关键 locus，应未来允许类似：

```text
textVariantRefs[]
```

的 provenance information。

这是研究建议，不是 schema 变更授权。

---

# 22. 传统映射状态与工程状态必须继续分离

本研究完成后，状态是：

```text
文献研究
= complete v0.1

三合 group actor 传统结构
= solved at architecture level

三合最小共享 research kernel
= partially solved

古籍原文校勘定本
= unresolved

完整 formation rule
= unresolved / source-specific

runtime resolver
= not started / not authorized

Formal Expansion
= not authorized
```

因此不能因为现在已有 kernel，就说：

```text
三合规则已经完成，可以实现
```

还没有。

---

# 23. 当前最大剩余缺口已经从“formation 是什么”转向“时间怎样让 formation 生效”

版本核查之后，下一层真正共享的缺口变得更清楚：

```text
当前已成
未来补成
已有但受限
被日冲激活
待填空
待补破
待冲墓
待冲绊
```

这些状态如何在时间轴上相互转换。

尤其需要避免把：

```text
calendar completes missing branch
```

和：

```text
calendar restores a broken constituent
```

以及：

```text
calendar triggers dark moving
```

写成同一事件。

因此下一研究应是：

```text
Three-Harmony Temporal Manifestation & Calendar Role Review v0.1
```

重点只处理：

1. current formation vs future formation；
2. `虚一待用` 的时间职责；
3. 空 / 破 / 墓 / 绊的 recovery 类型；
4. 日月补局 vs 日月局旺；
5. 日冲触发 DARK_MOVING 与直接入局的区别；
6. formation-time 与 manifestation-time 是否可建立共享状态机；
7. WHY / ZCB 在时间层是否比 formation 层更接近；
8. 哪些应期规则仍然是 school-specific。

---

# 24. Final Decision

```text
Three-Harmony Edition Witness Review
= complete v0.1

“一爻动 / 三爻动”
= edition-conflicted
= 三爻动 probable
= no textual emendation authorized

“虚三待用 / 虚一待用”
= edition-conflicted
= 虚一待用 probable
= no textual emendation authorized

两动一静
= genuine textual tension
= layered semantic reconciliation supported
= universal formation verdict unresolved

all-three-active original triad
= admitted shared research formation case

calendar vigor / future completion / recovery / activity trigger
= distinct responsibilities

calendar direct current membership
= school-specific / unresolved

inner 1/3 and outer 4/6 transform modes
= direct ZSBY evidence
= ZCB adopted
= independent classical corroboration insufficient

central cardinal branch mandatory gate
= modern cross-author refinement
= not classical shared kernel

group actor structure
= strongly supported

complete formation resolver
= not ready

runtime implementation
= not authorized

Formal Expansion
= not authorized
```

下一步：

```text
Three-Harmony Temporal Manifestation & Calendar Role Review v0.1
```

继续 research-only。