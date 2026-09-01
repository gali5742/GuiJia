# 龟甲 · 六爻考试学业主题文献研究 v1.0

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`study_exam`

```text
literatureResearchStatus = completed_and_reviewed
trainingEligible = false
calibrationEligible = false
blindEligible = false
currentRoute = false
formal Observation Rule = not_yet_registered
```

> 本文件完成 `study_exam` 主题的传统文献研究与现代职责边界审计。它不修改当前 22-route Semantic Candidate，不修改 Intent Schema、Rule Registry、Time Engine，也不产生训练语料。

---

# 1. 最终研究问题

本研究回答：

1. 现代“考试”能否统一写成 `父母` Primary？
2. 父母、官鬼、世 / 代占关系爻在考试中分别承担什么职责？
3. 成绩、名次、通过、录取是否属于同一个传统 current target？
4. 学校 / 教育机构是否可以固定映射父母或应爻？
5. 学业进展、论文文书、择校、奖学金是否应并入同一主题？
6. 公务员 / 招聘 / 职称等考试与 `career_position` 如何分界？

最终结论：

```text
“考试学业 → 父母”只能作为 legacy heuristic，不能升级为统一正式规则。

study_exam 至少必须区分：
- exam performance / score
- rank / selection
- admission institution
- ongoing academic progress
- represented examinee
```

---

# 2. 来源书目与 provenance

## 2.1 传统来源

### A. 《黄金策·求名》 / 《卜筮全书》收录系统

直接文字：

```text
父为文章
鬼为官职
二者一卦之主
```

并明确：

```text
世乃求名之人
若代占，则看是何人；子侄求名看子，朋友看兄类
```

它证明“文章 / 考试材料”“功名 / 录取后的名位”“实际考生”是三个不同职责。

来源关系说明：《卜筮全书》《卜筮正宗》大量收录、注释《黄金策》，因此不能按三个书名机械算三份独立证据。

### B. 《易隐》卷六“小试占”

直接说：

```text
童子试及科举，俱以父母为用
父母乃文章
官鬼则试官
```

并进一步区分命题、文字、试官、名次等观察维度。

这与《黄金策》“官父二者一卦之主”并不完全相同，说明古典内部对考试 Primary 的配置已经存在不同体系，不能伪造单一古法。

### C. 《断易天机》考试 / 选举相关条目

直接有：

```text
凡占选举及求官，便把卦中鬼爻看
鬼旺父兴须有份
```

同时另有“占文字中程式否”，以父母表示文字，讨论父母、考官与内外关系。

因此该体系更强调官鬼对选举 / 求官结果的作用，但并未否定父母的文字 / 考试表现职责。

### D. 《增删卜易》学业章

直接建立：

```text
世爻、父母皆宜旺相
```

把父母与本人作为长期儒业 / 学业的核心观察；财克父表示文章 / 学业受损，官的存在又关系最终功名。

这为“持续学业进展”与“一次考试结果”分责提供了直接传统依据。

---

## 2.2 现代来源

### E. 王虎应《六爻预测自修宝典》第二十八章“预测考试”

核心框架：

```text
官鬼和父母为用神
官鬼 = 名次
父母 = 成绩与录取通知书
```

大量大学、中学、研究生、职称考试案例均以官父组合观察。

在较新的案例里，王虎应有时直接以官鬼为主、父母为参考；因此他的现代体系本身也不等于“考试固定父母”。

### F. 王虎应《六爻用神答疑》

重要目标优先案例：

```text
口试结果关系奖学金
→ 最终 current target 是奖学金财
→ 看财，而不是机械看考试官父
```

这直接支持龟甲现有 Semantic 原则：现实 current target 优先于背景事件词。

另有“申请平面设计系能否成功”问例，以父母表示文书 / 设计图纸，说明申请材料本身可能把父母职责提升，但不能推成“所有学校申请 = 父母唯一 Primary”。

### G. 朱辰彬《古筮真诠》

已核代表材料：

- 道考 / 乡试等取得资格的考试，以父母为用；
- 会试若直接关联后续官职，则取官鬼；
- 明确提出现代类比：只为取得某种资格的考试可取父母，直接决定入职的终考取官鬼；
- 考后问某校能否录取时，指定学校可由应位父母承担；另一所学校又可由另一个父母爻承担。

### H. 朱辰彬《古筮真诠·进阶篇》

现代案例：

```text
注册会计师考试能否通过
→ 父母为用

六级考试能否通过
→ 按卦题应取父母为用
```

这对“资格 / 水平型现代考试 → 父母主轴”提供了直接现代支持。

---

# 3. 来源冲突不能消平

本主题存在真实而有价值的体系差异：

```text
《易隐》
→ 科举以父母为用，官鬼偏试官

《黄金策》
→ 父母文章 + 官鬼官职，二者同为主要观察

《断易天机》
→ 选举 / 求官更强调官鬼，父母兴起为重要条件

王虎应
→ 官父双观察；官鬼名次，父母成绩 / 通知

朱辰彬
→ 按考试现实目的切分：资格型偏父母，直接入职终考偏官鬼
```

因此本研究**拒绝**产生：

```text
考试 = 父母
考试 = 官鬼
```

任一单值通则。

形式化时必须保存“考试当前现实职责”。

---

# 4. 最终研究结论矩阵

| ID | 命题 | 分类 | Rule Review 资格 |
|---|---|---|---|
| SE-F-001 | 考试不可统一为父母单用 | `stable_consensus_as_non_simplification` | ✅ 架构约束 |
| SE-F-002 | 父母稳定承担文章、成绩、知识、文书类职责 | `stable_consensus` | ✅ |
| SE-F-003 | 官鬼稳定关联功名、名次、选拔 / 名位结果，但是否为 Primary 随体系和目标变化 | `cross_source_compatible` | ✅ |
| SE-F-004 | 自占本人以世为考试主体 Role | `stable_consensus` | ✅ |
| SE-F-005 | 代占考试需保留实际考生关系爻，不得仍把世当被测者 | `stable_consensus` | ✅ |
| SE-F-006 | 现代分数 / 成绩 current target 以父母为 Primary | `cross_source_compatible_to_stable` | ✅ |
| SE-F-007 | 现代名次 / 排名 current target 以官鬼为主要选择对象 | `cross_source_compatible` | ✅ |
| SE-F-008 | 资格 / 水平型考试通过以父母为主轴 | `cross_source_compatible` | ✅，官鬼可条件 Domain |
| SE-F-009 | 一般“考试能否通过”存在官父双观察需求，不宜强制单 Primary | `cross_source_compatible` | ✅，需 resolver / composite design |
| SE-F-010 | 直接决定取得工作 / 职位的终考，若 current target 已是职位取得，应切向 `career_position` | `cross_source_compatible + semantic_boundary` | ✅ 边界 |
| SE-F-011 | 指定学校 / 教育机构不能固定映射为父母或应爻 | `conflicted / role_sensitive` | ✅ 架构约束 |
| SE-F-012 | 学校录取可需要 institution contextual observation | `cross_source_compatible` | ✅，需 contextual resolver |
| SE-F-013 | 持续学业进展以父母 + 实际学习主体为核心 | `stable_consensus_to_cross_source_compatible` | ✅ |
| SE-F-014 | 论文 / 毕业论文 / 答辩可直接套父母统一规则 | `insufficient_direct_evidence` | ❌ 暂缓 |
| SE-F-015 | 多学校择校 / 多 offer 式教育选择可用一个静态世应公式 | `unsupported` | ❌ 暂缓 resolver 研究 |
| SE-F-016 | 奖学金问题因发生在考试环境就属于 study_exam | `false_boundary` | ❌ 当前目标为钱时进入财务主题 |
| SE-F-017 | 兄弟在竞争性考试可形成竞争者 Evidence | `cross_source_compatible` | ✅ 条件 Evidence，不是绝对结论 |
| SE-F-018 | 子孙发动必然落榜 | `unsupported_absolute_rule` | ❌ |
| SE-F-019 | 宽泛无时段“学业怎么样”可直接进入首轮规则 | `semantic_insufficient` | ❌；需 bounded progress |

---

# 5. 现代问题应拆成的现实职责

本研究建议把原 inventory：

```text
exam_outcome
academic_progress
education_application_choice
```

修正为至少：

```text
exam_result
education_admission_outcome
academic_progress
education_choice_comparison   [deferred]
academic_document_outcome     [deferred]
```

其中 `exam_result` 还必须保存 result aspect：

```text
score
rank
pass_fail
qualification
selection_stage
```

不能只记录“考试”。

---

# 6. Exam Result 的传统结构

## 6.1 Score / Performance

现代问法：

```text
这次考试能考多少分 / 成绩怎么样？
```

研究支持：

```text
Primary
→ 父母
→ exam_performance / score

Role
→ actual examinee
```

官鬼只在名次 / 选拔相关语境中增加职责。

---

## 6.2 Rank / Competitive Standing

现代问法：

```text
这次能排第几？
能不能进前三 / 进面？
```

研究支持：

```text
Primary candidate
→ 官鬼
→ rank / selection standing

Domain
→ 父母
→ exam performance / written result
```

兄弟只能在明确竞争环境下作为 competition Evidence / Domain candidate。

---

## 6.3 Qualification / Pass-Fail

现代问法：

```text
六级能不能过？
CPA 这科能不能通过？
资格证考试能不能过？
```

朱辰彬现代案例直接以父母为用；《易隐》科举父母主轴与《增删》学业父母结构可提供传统连续性。

建议首轮：

```text
Primary
→ 父母
→ qualification_exam_result

Role
→ actual examinee

Domain（条件）
→ 官鬼
→ competitive / selection / title dimension
```

但不把这条扩张到“直接取得职位的终考”。

---

## 6.4 Generic bounded pass/fail

现代问法：

```text
这次考试能不能通过？
```

如果无法确定：

```text
资格型
排名型
录取型
职位终考型
```

则传统层不应猜。

允许：

```text
Semantic event = study_exam resolved
Traditional exam-purpose resolution = unresolved
```

这是本主题非常重要的 abstain 状态。

---

# 7. Education Admission Outcome

现代问法：

```text
这次能不能被 A 大学录取？
申请这所学校能不能成功？
考后这所学校会不会录我？
```

文献显示至少三个职责可能同时存在：

```text
考试成绩 / 材料 → 父母
录取 / 名次条件 → 官鬼（部分体系）
指定学校本体   → contextual institution observation
```

## 7.1 学校不能硬编码父母

朱辰彬案例可用应位父母表示指定学校；但王虎应现代案例又直接说“应爻即学校”，同时父母表示通知 / 学业信息。

因此禁止：

```text
school → 父母
school → 应
```

单值映射。

更合理：

```text
education institution
→ contextual target role
→ may resolve to 应 / 父母-bearing target / unresolved
```

需要未来 `PRR-EDUCATION-INSTITUTION`。

---

# 8. Academic Progress

《增删卜易·学业章》直接建立：

```text
世 + 父母
```

为儒业 / 学业长期结构核心。

王虎应答疑也把父母作为知识、学习、导师等相关职责，并有“财动父母弱，学业艰辛”的直接现代判断。

因此首轮允许 bounded academic progress：

```text
这个学期学习能不能顺利？
这阶段学业进展怎么样？
目前这门课程能不能跟上？
```

最小结构：

```text
Primary
→ 父母
→ academic_learning_or_progress

Role
→ actual learner
```

但必须有现实边界：

```text
bounded term / course / stage
```

宽泛：

```text
我的一生学业怎么样？
```

不进入首轮 Semantic training。

---

# 9. Represented Examinee / Learner

本主题不能像 `career_position` 首轮那样只支持 self。

原因：

1. 《黄金策》明确：自占看世，代占则按真实关系看本主；子侄看子，朋友看兄等；
2. 王虎应大量“父母问子女考试”现代案例仍以官父观察考试，同时子孙可承担孩子本人信息；
3. 现代教育场景中家长代问极常见。

因此未来应设计：

```text
Primary exam / study observation
+
PRR-STUDY-SUBJECT
```

第一阶段至少支持：

```text
self  → 世
child → 子孙
```

其他 represented relations 可识别但在未完成关系表审查前允许 unresolved。

关键：

```text
子孙 = 被代问的孩子
```

不等于：

```text
子孙 = 考试结果 Primary
```

两者必须分层。

---

# 10. 与 career_position 的双向边界

这是本研究对上一主题的正式反向复核。

## study_exam

当前目标是考试阶段本身：

```text
公务员笔试能不能通过？
招聘考试能不能进下一轮？
教师资格考试能不能过？
```

→ `study_exam`

## career_position

当前目标已经是职位取得：

```text
这次公务员考试最终能不能上岸拿到岗位？
通过终面 / 终考后能不能正式录用？
```

→ `career_position`

## 必须保留 current-target 优先

不能：

```text
只要出现“考试” → study_exam
只要出现“公务员 / 招聘” → career_position
```

要看用户正在问：

```text
考试阶段结果
还是
最终职位取得
```

这一结论应回写未来 career_position collision matrix。

---

# 11. 与 finance 的边界

王虎应答疑中：

```text
口试结果关系奖学金
```

若真正问的是：

```text
能不能拿到奖学金钱
```

则 current target 是财，不因考试背景进入 study_exam。

同理：

```text
学费能不能筹够
奖学金金额多少
留学费用能不能承担
```

都不属于本主题的考试 / 学业 Primary。

---

# 12. 论文 / 文书暂缓

传统父母明确有文章、文字、文书职责，这对论文类问题具有明显连续性。

但本轮没有找到足够多的直接、独立现代“论文完成 / 答辩结果”案例来证明：

```text
academic_document_outcome
```

应该如何区分：

```text
论文文本质量
导师审批
答辩排名 / 通过
毕业资格
```

因此当前只允许研究假设：

```text
父母高度相关
```

不得登记正式 Base Rule。

---

# 13. 择校 / 多学校比较暂缓

朱辰彬有同一卦中“所报学校 / 另一学校”映射两个父母爻的案例，证明教育 alternatives 可以进入卦象。

但这不足以形成跨体系静态公式。

禁止：

```text
世 = 当前学校
应 = 目标学校
```

或：

```text
父母 A = 第一志愿
父母 B = 第二志愿
```

作为统一规则。

`education_choice_comparison` 应等后续 resolver 专项设计。

---

# 14. Traditional Evidence formalization boundary

以下可以成为 Evidence，但不直接等于最终结论：

```text
父母旺衰 / 空破
官鬼旺衰 / 空破
父母与官鬼生合关系
Primary / subject 生合
竞争环境中的兄弟
财克父
子孙克官
父母化官 / 官化父
```

禁止直接写：

```text
父母旺 = 一定高分
官鬼旺 = 一定录取
兄弟动 = 一定被竞争者淘汰
子孙动 = 一定落榜
父母空 = 一定没有通知
```

事实、Evidence、Assessment 必须分层。

---

# 15. 首轮 Rule Review 准入职责

允许进入下一阶段：

```text
study.exam_score_result
study.exam_rank_result
study.qualification_exam_outcome
study.education_admission_outcome
study.academic_progress
study.represented_subject_role
```

需要 resolver / composite，而不是静态规则的：

```text
study.generic_exam_pass_outcome
study.education_institution_context
```

暂缓：

```text
study.academic_document_outcome
study.education_choice_comparison
```

明确 cross-route：

```text
study.scholarship_money_outcome
→ finance

job-linked final acquisition outcome
→ career_position
```

---

# 16. 最终结论

本主题最稳定的结构不是：

```text
考试学业 → 父母
```

而是：

```text
Exam / Study Event
↓
Current target responsibility
├─ performance / score / qualification → 父母主轴
├─ rank / competitive standing        → 官鬼主轴
├─ admission                          → 官父 + institution context
└─ academic progress                  → 父母 + actual learner

Actual learner
├─ self  → 世
└─ represented → relation resolver
```

因此：

```text
literatureResearchStatus = completed_and_reviewed
matureEnoughForRuleRegistryDesign = true
```

但只对本文件列出的 Rule Review 准入职责成立。

仍保持：

```text
trainingEligible = false
currentRoute = false
```

并继续受当前 v0.13 `nextTopicBoundary` design-only gate 约束。