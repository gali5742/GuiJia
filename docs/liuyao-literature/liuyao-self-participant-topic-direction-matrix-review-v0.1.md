# 龟甲 · 六爻 Self-Participant Topic Direction Matrix Review v0.1

日期：2026-09-08

状态：`research_complete_design_only_topic_matrix_supported_no_global_shi_action_rule`

范围：六爻共享研究层 / 自占自身事项、自身作为互动一方、代占 / 他占中的世爻方向语义与动态作用资格；按诉讼、买卖 / 交易、婚姻、出行、行人 / 归期、事业职位、考试学业、失物等传统主题横向审查。

上游：

- `liuyao-shi-line-action-eligibility-self-proxy-divination-review-v0.1.md`
- `liuyao-three-harmony-coalition-membership-role-sensitive-directionality-review-v0.1.md`
- `liuyao-three-harmony-coalition-effectiveness-group-actor-target-review-v0.1.md`
- `liuyao-directed-interaction-effectiveness-research-v0.1.md`
- `liuyao-directed-interaction-path-control-transformation-review-v0.1.md`
- `liuyao-line-activity-fact-provenance-review-v0.1.md`
- `source-registry-provenance-normalization-v0.1.md`
- `litigation-dispute-research-v1.0.md`
- `person-return-research-v0.1.md`
- `travel-research-v1.0.md`
- `career-position-research-v1.0.md`
- `study-exam-research-v1.0.md`
- `lost-property-research-v1.0.md`

> 本研究只回答：不同传统主题中，“世爻发动”究竟意味着主动指向对方、角色行为变化、现实行动 / 执行状态、局部变爻反馈，还是没有足够证据产生 outward action edge。v0.1 不建立 executable Action Eligibility Resolver，不修改 Rule Registry、Time Engine、current-22、Candidate、训练数据或任何 runtime。

---

# 1. Executive Decision

本轮最大的结论是：

```text
Shi is moving
```

不能直接归一成：

```text
Shi may actively act on every relevant target
```

也不能归一成：

```text
Shi is only a passive final sink
```

传统主题横向比较至少出现五种不同结构：

```text
A. explicit_directed_action
   明确把“世动 + 指向关系”解释为我主动对彼

B. activity_qualified_role_behavior
   世动直接表达我方进退、压制、意愿、行为状态
   但并不等于一个通用五行传播 edge

C. execution_or_movement_state
   世动表示我本人行动、出发、执行、进退
   不等于世对目的地 / 用神发生主动生克

D. role_semantic_relation_only
   世与应 / 用存在传统生克关系
   但文本没有要求世必须发动

E. no_shared_outward_edge
   当前主题只稳定支持他源→世、用神本体动变、或世自身变爻反馈
   没有足够传统材料支持世动后向外发边
```

因此：

```text
Action Eligibility
```

不能只由：

```text
selfDivination
moving
Shi position
```

决定。

至少还要输入：

```text
Topic Responsibility
+
Represented Role
+
Analysis Layer
+
Relation Type
+
Activity Provenance
```

本轮形成的主题矩阵显示：

```text
诉讼 / 争竞
→ strongest explicit Shi outward action

婚姻
→ strong movement-qualified interpersonal behavior
   but not generic elemental action

自占出行
→ movement / execution state
   plus static Shi↔destination relation

买卖 / 交易
→ strong Shi↔Ying role relation
   but no shared generic moving-Shi outward formula found

事业 / 学业
→ target/use → Shi and static Shi↔use dominate
   no shared generic Shi-moving outward edge

失物
→ object movement / location state dominate
   no shared Shi→object action edge

行人 / 归期
→ explicit Shi↔Ying moving-direction formulas exist
   but usually proxy / non-self rather than self-participant
```

所以正式拒绝：

```text
shiCanAct: boolean
```

以及：

```text
if Shi is moving:
  connect Shi to every Primary / Ying / UseGod
```

最终状态：

```text
topic_direction_matrix = supported
explicit_universal_shi_action = rejected
explicit_topic_specific_shi_action = supported
role_semantics_vs_action_edge = still_required
movement_semantics_are_typed = required
career_study_lost_property_generic_shi_outward = insufficient_evidence
universal_action_eligibility_resolver = not_ready
Formal Expansion = not_authorized
```

---

# 2. 本轮不是“搜有没有世动”

如果只搜索：

```text
世动
```

会把完全不同的传统语义混成一类。

例如：

```text
世动克应，我兴词
```

和：

```text
出行宜世动
```

都包含：

```text
世动
```

但前者明确包含：

```text
source = 世
relation = 克
external target = 应
actor interpretation = 我主动兴讼
```

而后者首先表示：

```text
旅行者自身进入行动 / 可出发状态
```

不能因为两个句子都写“世动”，就把后者翻译成：

```text
Shi actively acts on destination Ying
```

因此本轮使用以下分类。

---

# 3. Direction Evidence Taxonomy v0.1

## T-A · Explicit Directed Action

最低要求：

```text
movement/activity of source
+
explicit relation to external target
+
actor-side semantic interpretation
```

典型：

```text
世动克应
→ 我兴词 / 己谋人 / 我必进
```

这类最接近未来：

```text
ACTION_ELIGIBILITY admitted
```

但仍须经过 source/target condition 与 path effectiveness。

## T-B · Activity-Qualified Role Behavior

例如：

```text
世动
→ 男家进退
→ 夫凌妻
```

这里 movement 已经有现实行为含义，但没有充分证据说明：

```text
世必然向某 target 输出一个 elemental interaction edge
```

因此：

```text
activity-qualified semantics
≠ active elemental edge
```

## T-C · Execution / Movement State

例如：

```text
出行宜世动
```

主要回答：

```text
我是否行动 / 能否动身 / 执行状态如何
```

不表示：

```text
Shi → destination
```

## T-D · Static Role-Semantic Relation

例如：

```text
世克应
应克世
世克用
用克世
```

传统可以直接用它解释现实双方关系，但未必要求 source moving。

它属于：

```text
ROLE_RELATION
```

不自动升级：

```text
ACTIVE_DIRECTED_INTERACTION
```

## T-E · Local Transform / Self-State

例如：

```text
世动化退
世动化回头克
世动化官生世
```

重点是：

```text
Shi → own changed line
```

或其本人的行动 / 状态变化。

不能自动生成：

```text
Shi → external UseGod
```

## T-F · Other-Source Directed Action

很多事业、学业、失物主题存在大量：

```text
动爻 / 官 / 财 / 父 / 兄 / 鬼
→ 世或用神
```

这证明这些主题有 active interaction，
但不能反向证明：

```text
moving Shi → external target
```

---

# 4. Topic Matrix · 总表

| Topic | Perspective | 主要传统关系 | “动”的主要含义 | Shi outward active edge 当前分类 |
|---|---|---|---|---|
| Litigation / Contest | self-participant | 世↔应 | 明确我彼主动对抗 | `explicit_active_direction` |
| Trade / Bargain | self-participant | 世↔应 + 财 | 交易双方关系、客方 / 利益变化 | `role_semantic_direction_only`；generic moving-Shi edge 未证 |
| Marriage / Couple | self-participant | 世↔应 + 财官 | 进退、允否、夫妻行为 / 权力动态 | `activity_qualified_role_behavior` |
| Self Travel | self-affair / self-execution | 世↔应(destination) | 动身、执行、进退、被阻 | `execution_state`; not generic Shi→Ying |
| Person Return | proxy/non-self | 世(home/querent reference) ↔ returning person / 应 | 来去、回返方向 | `explicit_active_direction` in classical formulas, but not self-participant |
| Career / Position | self-affair | 官/财/父/动爻→世；世与官关系 | 职位状态、外源生克、世自变 | `no_shared_generic_shi_outward_edge` |
| Study / Exam | self-affair | 父官↔世 | 成绩 / 功名关系、外源生克 | `static_role_relation_only`; modern detail-layer outward exists but shared classical not found |
| Lost Property | self-affair | object/use ↔ calendar/other lines; 世 as seeker context | 物体移动 / 藏伏 / 位置 | `no_shared_shi_to_object_edge` |

这张表不是 runtime contract。

它只表示：

```text
当前传统证据允许研究层把哪些 relation 看作什么类型
```

---

# 5. Litigation / Contest：最强 Explicit Directed Action

这是本轮最清楚的一组。

## 5.1 《增删卜易》

诉讼 / 争竞相关文本直接保存：

```text
世动克应，我兴词
```

以及：

```text
世宜旺动克应
```

这已经满足：

```text
moving source
+
external target
+
explicit control relation
+
actor-side meaning
```

所以不能把它降成：

```text
“世应只是静态标签”
```

## 5.2 《断易天机》 / 相关旧法

另有：

```text
应来克世人谋己
世动克应己谋人
```

作为 compatible witness。

但 provenance 要注意：

```text
断易天机 / 天玄赋 / 后世汇编
```

部分公式存在传抄与共享，不按书名机械计独立票。

## 5.3 《易林补遗》争竞

又保存：

```text
世旺克应
或世动克应
→ 我方取得主动 / 胜势
```

可作为后世同结构 witness。

## 5.4 结论

```text
Topic = direct contest / litigation interaction
Shi = self-side participant
Ying = opponent
Shi moving + controls Ying
```

可以在研究层标：

```text
explicit_action_eligibility_candidate
```

但不能直接输出：

```text
I win
```

因为仍要审核：

```text
Shi condition
Ying condition
third-party support
path modifiers
institutional / litigation pressure
```

这与上一轮 Directed Interaction Effectiveness 完全一致。

分类：

```text
traditional_direct_topic_specific
```

---

# 6. Litigation 中“世动”也不是所有时候都等于攻击

《黄金策 / 卜筮全书》词讼体系又有：

```text
世动我必使心用谋
应动他有谋略
```

说明同一个主题内部还存在：

```text
activity -> strategy / maneuver
```

而不是只有：

```text
activity -> elemental control
```

因此即便在最强 action topic 中也不能写：

```text
if Shi moving:
  attack Ying
```

更准确是：

```text
if explicit topic formula resolves relation:
  movement may qualify outward action
else:
  movement may only support self-side activity / strategy evidence
```

---

# 7. Trade / Bargain：强 Role Relation，不足以升级 Generic Moving-Shi Edge

## 7.1 《火珠林·占买卖》

直接结构：

```text
财福出现，买卖必利
世应相生，交易可成
```

并明确：

```text
外克内 / 应克世 → 易得财
内克外 / 世克应 → 难得利
```

这里：

```text
世 = 我方
应 = 对方 / 外部交易侧
```

的 directional role semantics 非常明确。

但原文并没有把：

```text
世动克应
```

立成买卖专门 action formula。

同段的“发动”主要落在：

```text
财发动
兄 / 鬼发动
```

等对象上。

因此：

```text
Shi ↔ Ying relation
= strong
```

不等于：

```text
moving Shi outward edge
= proven
```

## 7.2 《增删卜易·开行开店及各色铺面》

直接说：

```text
世为己，应为人
应生世，他益于我
世生应，我益于他
应克世，对方欺我
世克应，对方从我愿
```

仍然是非常强的：

```text
role-semantic direction
```

但不以：

```text
世必须发动
```

为前提。

## 7.3 卖货宜守宜动

《增删卜易》又大量使用：

```text
财持世而动
财化进 / 化退
世化退
```

来说明：

```text
卖货方向
守 / 动
外发 / 回旧地
```

这属于：

```text
commercial execution / movement state
```

而不是：

```text
Shi attacks counterparty
```

## 7.4 结论

买卖主题目前安全分类：

```text
Shi ↔ Ying
= strong role-semantic relation

Shi movement
= may carry decision / execution semantics

Generic moving Shi → Ying elemental action
= insufficient direct evidence
```

所以不能因为现代交易是“双方互动”，就自动照搬诉讼的：

```text
世动克应 = active attack
```

---

# 8. Marriage：Activity-Qualified Interpersonal Behavior，不等于 Generic Elemental Edge

婚姻是最容易误读的主题之一。

## 8.1 《火珠林》

直接说：

```text
世应有动便不成
```

并解释：

```text
世动 → 男家进退
应动 → 女家不肯
```

这里 movement 非常明显地携带：

```text
party-side intention / decision state
```

但并没有说：

```text
世动后自动生克应
```

## 8.2 《易隐》

夫妻结构中直接有：

```text
世动，夫凌妻
应动，妻欺夫
世应俱动，常争斗
```

这比《火珠林》更接近：

```text
activity-qualified interpersonal behavior
```

说明：

```text
世之动
```

在夫妻互动中可以表达：

```text
我方 / 夫方主动压制、行为增强
```

但仍没有必要把它强译成：

```text
moving Shi emits elemental edge toward Ying
```

因为原句成立的重点是：

```text
role + movement
```

而不是某个固定五行 relation。

## 8.3 《黄金策 / 卜筮全书》

还存在：

```text
世克应 → 用强劫娶
应生世 → 悦服成亲
```

说明：

```text
Shi ↔ Ying elemental relation
```

确实可以表达双方现实力量 / 意愿关系。

但这仍然可以在：

```text
static role-semantic relation
```

层成立。

## 8.4 《增删卜易》婚姻章

现代整理文本保存：

```text
世动化进 → 事在必成 / 进取
世动化退 → 难成
应动化退 → 对方反悔
财动生世 → 婚姻得到配偶侧支持
```

这些最稳定地说明：

```text
movement / transform
→ intention / progression / retreat
```

而不是一个“世动攻击用神”的通则。

## 8.5 结论

婚姻共享研究层更适合：

```text
Shi movement
→ activity-qualified role behavior
```

并与：

```text
Shi↔Ying elemental role relation
```

分别保存。

当前不授权：

```text
Shi moving
→ automatically activate Shi→spouse elemental edge
```

分类：

```text
cross_source_compatible_activity_role_semantics
```

---

# 9. Self Travel：最典型 Execution / Movement State

## 9.1 稳定传统主轴

现有 `travel-research-v1.0.md` 已确认：

```text
self travel
→ 世 = traveler
应 = destination / destination-side context
```

并且《黄金策 / 天玄赋》体系直接使用：

```text
世克应 → 所往通达
应克世 → 行程受阻 / 不利
```

这是：

```text
Shi ↔ destination role-semantic relation
```

## 9.2 “出行宜世动”

《断易天机》/相关旧法保存：

```text
出行宜世动
```

后世注释一般解释为：

```text
本人已有行动条件 / 准备出发
```

无论是否接受“世动必吉”的绝对注解，最少可以确认：

```text
movement of traveler
→ journey execution / departure state
```

不能推出：

```text
moving traveler
→ actively controls destination
```

## 9.3 《增删卜易》出行 / 谒贵

又有：

```text
世动化退 → 难行动 / 空返
世动遇空破 → 可进入应期解释
```

仍然说明：

```text
Shi movement
```

在这个主题首先属于：

```text
self execution / movement state
```

## 9.4 结论

```text
Travel:
Shi movement = execution state
Shi↔Ying = route/destination relation
```

两者不得融合成：

```text
Shi movement qualifies Shi→Ying active edge
```

除非未来出现额外、直接、主题特定传统证据。

---

# 10. Person Return：重要 Comparator，但通常不是 Self-Participant

现有 `person-return-research-v0.1.md` 已经确定：

```text
问他人何时回来
```

的主体应按真实亲属 / 人物关系取用，非亲可用应。

传统行人材料保存：

```text
世动克应 → 未归 / 去他处
应动克世 → 来归
```

以及类似的方向性结构。

这说明：

```text
moving Shi ↔ external person role
```

在 proxy / non-self topic 中可以是明确传统判断语言。

它与诉讼一起证明：

```text
moving Shi outward action is not globally forbidden
```

但两者代表完全不同 semantic responsibility：

```text
诉讼
→ self participant actively acts against opponent

行人
→ home/querent-side relation expresses absent person's return direction
```

因此不能把它们合成：

```text
Shi moving = outward action everywhere
```

---

# 11. Career / Position：主要是 Target / Other Source → Shi

现有 `career-position-research-v1.0.md` 已确认：

```text
官鬼 = position / office core
世 = applicant / incumbent
父母 = appointment / organization / formal document
```

## 11.1 古典常见方向

《增删卜易》序与升迁章反复出现：

```text
官星持世
官星生合世
日月 / 动爻作官星生合世
财动生官
官局 / 财局生世
```

这些主要是：

```text
target / supportive source → Shi
```

## 11.2 世动更多是自身变爻 / 状态

又有：

```text
世动化回头克
世动化官、官再生世
世动化退
```

这首先属于：

```text
Shi → own transformed line
```

或本人状态变化。

不能因为：

```text
世发动
```

就自动产生：

```text
Shi → 官鬼
```

## 11.3 《断易天机》

求官体系还直接讨论：

```text
官鬼生世
官鬼克世
旺爻克应
```

仍然没有形成一个共享：

```text
moving Shi actively acts on office target
```

通则。

## 11.4 结论

当前事业 / 职位主题：

```text
Role relation = supported
Target → Shi interaction = strongly supported
Shi local transform = supported
Generic Shi moving → Career Target = insufficient evidence
```

所以：

```text
career is self-affair
```

不能被用作：

```text
世永远不外动
```

的证明；

但同样没有传统依据让我们人为补一条 outward edge。

---

# 12. Study / Exam：Static Shi↔Use Relation 与 External Support 为主

现有 `study-exam-research-v1.0.md` 已确认：

```text
父母 = 文章 / 成绩 / 文书
官鬼 = 功名 / 名次 / 选拔维度
世 = actual examinee in self-divination
```

## 12.1 《断易天机》

考试 / 选举材料直接有：

```text
官爻生世 → 有利
世克官 / 父 → 榜上无名 / 徒劳
```

这里：

```text
世克官 / 父
```

是明确传统 role-semantic relation，
但文本没有要求：

```text
世必须发动
```

因此它仍是：

```text
static role-semantic relation
```

而不是：

```text
moving Shi outward edge
```

## 12.2 《增删卜易》

求名 / 学业主要强调：

```text
世、父母宜旺
官父结构
日月动爻生合世
子孙 / 忌神对官父的作用
```

仍以：

```text
external / target condition → examinee
```

为主。

## 12.3 现代 ZCB Detail Layer

用户提供的《古筮真诠》扫描本明确说明：

```text
自占自身事情
吉凶判断层
→ 世不参与旁爻连动

细节分析层
→ 上述限制不再生效
→ 世动可以作用旁爻
```

并用：

```text
世动生用神
```

解释卦主主动去赶考等细节行为。

这条现代材料很重要，因为它证明：

```text
same topic
same Shi movement
```

在不同：

```text
analysis layer
```

可能承担不同职责。

但它不能反过来填补：

```text
shared classical exam outcome layer
```

所缺失的 active edge。

## 12.4 结论

```text
Study / Exam outcome:
Generic Shi moving → Father/Officer target
= not shared-classically established

Study / Exam detail:
ZCB allows movement-qualified outward detail semantics
= modern school-specific
```

---

# 13. Lost Property：Object Movement 不等于 Seeker Action

现有 `lost-property-research-v1.0.md` 已经区分：

```text
Lost Object Primary
Recovery Assessment
Location Evidence
```

其中传统最稳定的“动”之一是：

```text
财动 / 用神动
→ 物已移动 / 转移
```

以及：

```text
墓 / 伏 / 合 / 空破
→ 隐藏、位置、难见、等待恢复等
```

## 13.1 世的职责

在失物 recovery 中，世可以承担：

```text
seeker / self context
```

并与失物本体发生静态生克 / 关系观察。

但本轮没有找到稳定传统公式：

```text
世动
+
指向失物用神
→ 表示我主动把物找回来
```

## 13.2 为什么不能用现实常识补

现实上当然是：

```text
我主动寻找
```

但六爻研究不能因此自行生成：

```text
Shi → LostObject active edge
```

传统目前主要把：

```text
object movement
```

用于定位 / 转移状态。

所以：

```text
Lost Property
Generic Shi outward action
= insufficient evidence
```

这类空白必须保留，而不是为了主题矩阵对称而补全。

---

# 14. 为什么 Career / Study / Lost Property 不能被诉讼规则“类推补齐”

一个很危险的现代推理是：

```text
诉讼中世动可以克应
↓
所以 moving Shi 本来就可以作用外部 target
↓
事业 / 学业 / 失物也自动允许
```

这个类推不成立。

因为诉讼结构有明确：

```text
self participant
vs
counterparty
```

并有传统专门 formula：

```text
世动克应
```

而事业 / 学业 / 失物的角色结构不同：

```text
self ↔ position
self ↔ exam/document/qualification
self ↔ lost object
```

传统文本在这些主题中大量使用：

```text
target → self
other source → target/self
object self-state
```

却没有同等强度的：

```text
Shi moving → target
```

因此必须遵守：

```text
topic-specific evidence cannot be promoted to global graph law
```

---

# 15. 同样不能反过来用 Career / Study 否定 Litigation

另一个错误方向：

```text
考试 / 升职中世主要是被观察对象
↓
所以 self-divination Shi 应该永远是 final sink
↓
诉讼里的“世动克应”也只能算静态描述
```

这同样违背直接文本。

传统诉讼明确把：

```text
世动 + 克应
```

解释为我方主动行为。

所以：

```text
Pure Self-Affair
```

与：

```text
Self-Participant Interaction
```

必须继续区分。

---

# 16. Modern Horizontal Check：WHY 与 ZCB 的分歧需要被 Topic Matrix 重新解释

## 16.1 MOD-WHY

王虎应体系总体更倾向：

```text
动爻根据生克关系参与对相关对象的实际作用
```

其世、应、用神关系通常也保留较宽泛的动态解释空间。

这与：

```text
诉讼 / 行人等古典 explicit direction
```

较容易兼容。

但：

```text
WHY broad doctrine
```

不能替 career / study / lost-property 补出古典没有找到的主题公式。

## 16.2 MOD-ZCB

用户提供的《古筮真诠》扫描本明确：

```text
自占自身事 + 吉凶判断层
→ 世作为最终目标
→ 不参与其他爻连动

自占自身事 + 细节层
→ 世可作用旁爻

代占 / 与自身无关
→ 世可参与普通连动
```

这是一套：

```text
perspective + analysis-layer
```

规则。

## 16.3 Topic Matrix 给 ZCB 规则提出新的边界问题

传统诉讼存在：

```text
本人参与诉讼
+
世动克应
→ 我主动兴词
```

因此如果把 ZCB 的：

```text
“凡占自身事情，吉凶层世不外动”
```

字面扩张到：

```text
所有本人参与互动题
```

会与古典诉讼专门公式形成 tension。

本轮没有找到足够 ZCB 原文证明他是否会对：

```text
诉讼 / 对抗 / 双方互动题
```

另设 exception。

所以只能登记：

```text
ZCB general self-affair rule
vs
classical explicit self-participant litigation formula
= scope-pressure / unresolved author-specific reconciliation
```

不能擅自替作者补一个 exception，
也不能用古典诉讼材料直接宣布整个 ZCB 理论错误。

## 16.4 当前现代结论

```text
WHY
→ broader dynamic compatibility

ZCB
→ explicit layer/perspective gating

Shared research
→ needs topic gate in addition to both
```

即：

```text
Topic
```

是两套现代体系之外必须单独保留的研究责任。

---

# 17. Perspective × Topic Matrix

## 17.1 Pure Self-Affair

典型：

```text
career
study
lost_property
self travel（若只问能否成行）
```

当前规律：

```text
Shi often = self subject / recipient / executor
```

但 movement 的具体语义仍不同：

```text
career → own transform / state
study → mostly self condition; ZCB detail action possible
lost → seeker context; object movement more important
travel → actual movement / execution
```

所以即使同属 Pure Self-Affair 也不能共享一个 movement handler。

## 17.2 Self-Participant Interaction

典型：

```text
litigation
contest
trade
marriage
```

这里传统更常保留：

```text
Shi ↔ Ying
```

但四个主题依旧不一致：

```text
litigation
→ explicit active directional action

trade
→ strong static role relation

marriage
→ movement-qualified role behavior
```

所以：

```text
selfParticipant = true
```

也不足以生成 action edge。

## 17.3 Proxy / Non-Self

行人 / 归期展示：

```text
moving Shi ↔ external person
```

可以用于方向判断。

ZCB 现代体系也明确允许 non-self 时世参与连动。

但仍必须由真实 Person Subject Resolver 决定：

```text
谁才是 returning person
```

不能固定：

```text
Ying = person
```

---

# 18. Minimal Topic Action Kernel v0.1

本轮可以安全抽出以下研究核。

## K1

```text
Shi movement has no universal semantic.
```

强度：

```text
strong cross-topic support
```

## K2

```text
Explicit topic formula can qualify an outward Shi action.
```

典型：

```text
litigation / contest
```

强度：

```text
classical direct
```

## K3

```text
Self-participant status alone does not qualify outward action.
```

因为：

```text
trade / marriage
```

与诉讼具有不同 movement semantics。

## K4

```text
Role-semantic relation may exist without source movement.
```

典型：

```text
trade Shi↔Ying
travel Shi↔destination
study Shi↔father/officer
```

## K5

```text
Movement can be a role-behavior fact without an elemental edge.
```

典型：

```text
marriage
```

## K6

```text
Movement can be execution state.
```

典型：

```text
self travel
```

## K7

```text
Local Shi transform feedback must not be mistaken for outward action.
```

典型：

```text
career
```

## K8

```text
Object movement must not be mistaken for seeker action.
```

典型：

```text
lost property
```

## K9

```text
Proxy / non-self topics can admit outward Shi relations.
```

典型：

```text
person return
```

## K10

```text
Action Eligibility requires topic responsibility.
```

最低输入：

```text
perspective
represented role
analysis layer
topic responsibility
relation type
activity provenance
```

---

# 19. Candidate Research-Level Direction Types

这里只作为研究分类，不是代码 enum。

```text
EXPLICIT_ACTION_EDGE
ACTIVITY_ROLE_BEHAVIOR
EXECUTION_STATE
STATIC_ROLE_RELATION
LOCAL_TRANSFORM_FEEDBACK
OBJECT_MOVEMENT_STATE
OTHER_SOURCE_ACTION
UNRESOLVED
```

禁止现在就把它们固化成 runtime schema。

原因是：

1. 不同主题仍需更细 topic rule；
2. 同一主题可能跨 outcome / detail / timing layer；
3. modern WHY / ZCB policy 尚未统一；
4. future group actor 还需共享这套职责；
5. 一些 relation 可能同时具有 role semantics 与 action eligibility。

---

# 20. Topic Matrix 不等于主题吉凶矩阵

本轮只判断：

```text
what kind of relation is this?
```

不是：

```text
is this favorable?
```

例如：

```text
世动克应
```

在诉讼里可承认 active direction，
但最终胜负仍需：

```text
世应 condition
官鬼 pressure
third-party support
path blockers
court / document evidence
```

而：

```text
世动
```

在婚姻中即使表示男方进退 / 夫方压制，
也不直接等于：

```text
婚姻失败
```

同样：

```text
出行世动
```

表示执行状态，
不等于：

```text
旅途一定顺利
```

---

# 21. 对 Directed Interaction Path 的接口影响

只有：

```text
relation type = EXPLICIT_ACTION_EDGE
```

或未来经 topic-specific gate 升级为 action edge 后，
才允许进入：

```text
source actionability
path state
third-party modifier
target condition
```

而以下关系：

```text
ACTIVITY_ROLE_BEHAVIOR
EXECUTION_STATE
STATIC_ROLE_RELATION
OBJECT_MOVEMENT_STATE
```

不应被强塞进同一 interaction graph。

否则会出现：

```text
出行世动
→ 世攻击目的地
```

或：

```text
婚姻世动
→ 世自动克应
```

这类没有传统依据的图边。

---

# 22. 对 Group Actor 的接口影响

此前三合研究已经确认：

```text
Group Actor ≠ Omnidirectional Actor
```

本轮把同一原则扩展到 line actor：

```text
Moving Line ≠ Omnidirectional Actor
```

未来如果：

```text
Shi belongs to Coalition
```

不能只因为：

```text
Shi moving
```

就让整个 coalition 获得所有 outward edges。

必须先问：

```text
当前 topic 对 line-level Shi movement 的语义是什么？
```

例如：

```text
Litigation coalition
```

可能更容易形成 self-side directed actor，
而：

```text
Travel coalition
```

未必意味着对 destination 的攻击性传播。

这仍需未来 group+topic adapter 研究。

---

# 23. 对 Semantic / Observation 架构的影响

当前复合观察规范已经坚持：

```text
Primary Subject
Role
Domain
```

分层。

本轮进一步说明：

```text
Role relation
```

也不能只存一个 elemental relation。

至少研究上需要知道：

```text
relation semantic type
```

否则：

```text
Shi controls Ying
```

在不同 topic 中可能分别表示：

```text
诉讼 → 我方主动压制 / 对抗
买卖 → 我方不易得利 / 对方受我条件
婚姻 → 我方强势 / 强求
出行 → 所向通达
```

五行拓扑相同，传统题义意义不同。

所以未来：

```text
Elemental Relation
```

不能直接生成 universal natural-language interpretation。

---

# 24. Runtime Audit Boundary

本轮不审计 / 不修改具体 runtime graph implementation。

原因是当前研究层刚确定：

```text
same elemental relation
```

在不同 topic 中可能属于不同 semantic type。

在 Formal Expansion 前直接修 runtime，容易制造第二轮错误抽象。

因此本轮只登记未来审计要求：

```text
A. 是否存在 moving Shi 自动连所有 observation target 的代码
B. 是否把世应 elemental relation 无条件转换成 action
C. 是否缺少 topic / relation semantic type
D. 是否把 execution-state movement 送入 Directed Interaction graph
E. 是否把 role behavior 当作 support/constraint
```

本 commit 不做代码改动。

---

# 25. Source / Provenance Summary

## 25.1 Litigation / contest

主要：

```text
SRC-ZSBY / TRAD-ZSBY
SRC-DYTJ / TRAD-DYTJ（具体公式独立性仍按 Evidence-level 审）
```

后世 compatible witness：

```text
易林补遗等
```

## 25.2 Trade

主要：

```text
SRC-HZL / TRAD-HZL
SRC-ZSBY / TRAD-ZSBY
```

## 25.3 Marriage

主要：

```text
SRC-HZL / TRAD-HZL
SRC-YY / TRAD-YY
SRC-ZSBY / TRAD-ZSBY
TRAD-HJC-TRANSMISSION for 黄金策/卜筮全书 inherited formulas
```

## 25.4 Travel / Person Return

主要：

```text
SRC-ZSBY
SRC-DYTJ
SRC-YY
TRAD-HJC-TRANSMISSION
```

## 25.5 Career / Study / Lost Property

优先复用已经完成的主题研究 provenance，
本轮不重新把同一材料重复计票。

## 25.6 Modern

```text
MOD-WHY
MOD-ZCB
```

仍按作者体系计 independence，
不是每本书一票。

---

# 26. Explicit Non-Inferences

本研究不得推出：

```text
世动 = 一定向外作用
世动 = 一定不向外作用
自占 = 世永远是 sink
代占 = 世一定可以作用所有爻
诉讼世动克应 = 所有主题都允许世动克应
交易有世应 = moving 世必能作用应
婚姻世动 = 自动生成 Shi→Ying elemental edge
出行世动 = 世生克目的地
事业世动 = 世主动控制官鬼
考试世动 = 世主动控制父母 / 官鬼
失物世动 = 我主动把物找回
用神动 = 世在行动
世克用 = 一定存在 dynamic edge
role relation = action edge
movement state = action edge
细节层规则 = 吉凶层规则
WHY broad policy = shared classical rule
ZCB self-affair rule = shared classical universal rule
```

---

# 27. Final Decision

```text
Self-Participant Topic Direction Matrix v0.1
= research complete

Topic Responsibility
= required Action Eligibility dimension

Litigation / Contest
= explicit active Shi outward direction supported

Trade / Bargain
= strong Shi↔Ying role semantics
= generic moving-Shi outward edge not established

Marriage / Couple
= activity-qualified interpersonal behavior supported
= generic elemental moving edge not established

Self Travel
= Shi movement as execution / movement state supported
= Shi↔destination relation separately supported

Person Return
= explicit moving direction supported in proxy/non-self tradition

Career
= target / other-source → Shi and local self-transform dominate
= generic Shi outward not established

Study / Exam
= static Shi↔father/officer relations supported
= generic outcome-layer Shi outward not established
= ZCB detail-layer outward is modern school-specific

Lost Property
= object movement / state dominates
= generic Shi→object action not established

single boolean shiCanAct
= rejected

universal action graph from moving Shi
= rejected

partial topic-specific action eligibility
= supported in principle

Executable Resolver
= not ready

Formal Expansion
= not authorized
```

---

# 28. Recommended Next Research

下一步不建议继续逐个主题无限扩张，而应研究一个已经被本轮明确暴露的共享接口：

```text
Role-Semantic Relation → Action Eligibility Promotion Review v0.1
```

只回答：

1. 一个已有的 `Shi controls Ying / UseGod` role relation，在什么条件下可以升级成 active action edge；
2. `movement` 是否是必要条件、充分条件，还是只是一种 qualifier；
3. topic-specific explicit formula 如何授权 promotion；
4. absence of explicit formula 时应保持 role-only 还是允许结构类推；
5. marriage 这类 activity-role behavior 是否需要第三种 relation class；
6. travel execution / object movement 如何从 interaction graph 中明确排除；
7. Group Actor 是否复用同一 promotion contract；
8. WHY / ZCB 是否应作为 school adapter 而不是 shared core。

如果这一步不能得到稳定共享 contract，合法结果应是：

```text
Shared Core
→ only explicit topic-authorized promotion

MOD-WHY
→ broader action adapter

MOD-ZCB
→ perspective/layer-gated adapter

Unresolved
→ preserve role relation without active edge
```

而不是为了形成统一 graph solver 强行补全所有方向。