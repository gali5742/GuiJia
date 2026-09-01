# 龟甲 · 六爻工作转正 / 任职状态确认专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_modern_mapping_caveat`

主题：`career_position.employment_status_confirmation`

> 本专项研究“试用期能否转正 / 临时岗位能否正式留下 / 当前工作能否由 provisional 转 confirmed”。不修改正式 Intent、Router、Rule Registry、current-22 或训练数据。

---

# 1. 原暂缓原因

此前没有足够依据证明：

```text
试用期转正 = 古典升迁
```

因此禁止：

```text
employment_status_confirmation
→ position_advancement
```

本专项继续保留这一否定结论。

---

# 2. 传统可用的连续性不是“升迁”，而是“在任 / 失位 / 任命”

## 2.1 《断易天机》

中国哲学书电子化计划：

- https://ctext.org/wiki.pl?chapter=751078&if=gb&remap=gb

直接存在：

```text
占官得替否
占现任官得多少时
占居官安否
```

其中官鬼稳定承担：

```text
现有官职 / 任职状态
```

例如：

```text
卦无官 → 现任职位将被替代
子孙动克官 → 官位可能失
官鬼旺相、世应相生 → 居官较安
```

这些不能直接照搬到现代劳动合同，但提供了稳定的上位连续性：

```text
current employment / position continuity
→ 官鬼职责
```

同书又另有：

```text
父母 → 诰牒任命书 / 印绶文书
```

说明：

```text
职位继续存在
!=
正式文书完成
```

是传统本身就能区分的两个层。

---

## 2.2 《易隐》

中国哲学书电子化计划：

- https://ctext.org/wiki.pl?chapter=888662&if=en&remap=gb

《易隐》卷六分别列：

```text
升迁
替代
```

并讨论官旺、官静、世官等现有职位变化。

这再次证明：

```text
position advancement
position retention / replacement
```

本来就是不同职责。

但《易隐》没有现代“试用期转正”制度，因此只能作为：

```text
traditional continuity evidence
```

不能声称古籍直接规定 probation conversion。

---

# 3. 现代直接案例

## 3.1 现代“转正”案例普遍以官鬼作为工作 / 去留核心

可核验公开例：

- https://zb.yi958.com/lyzb/7964
- https://www.daoy95.com/post/162.html
- https://www.itsmibo.art/d/787-qing-wa-meng-yin-liu-yao-yu-ce-ji-chu-ke-10wen-zi-gao-duan-gua-de-ji-ben-bu-zou/4

这些现代案例共同把：

```text
能否留下 / 能否转正
```

首先定位为：

```text
官鬼 → 工作 / 工作去留
世 → 本人
```

其中有些作者还观察父母、领导、审批等，但没有形成统一“转正必须父母 Primary”的现代共识。

### 证据等级限制

这些公开案例的作者层级、校订程度与经典来源不能等量齐观。

因此本专项不把它们标为：

```text
stable_consensus
```

而标：

```text
modern_practice_compatible
```

它们的作用是确认现代语义映射方向，而不是建立古典权威。

---

## 3.2 现代父母职责出现在哪里

部分现代案例把：

```text
父母
```

解释为：

```text
批准
文书
转正流程
通知
```

这与传统“父母 = 文书 / 印绶”连续。

但不能因此建立：

```text
转正 → 父母 Primary
```

因为现代“转正”真正问的常常是：

```text
我能不能继续作为正式员工留下
```

而不是：

```text
某张转正文件是否被签发
```

---

# 4. 最重要的语义拆分

“转正”必须拆成两个 current target。

## 4.1 Substantive Employment Status Confirmation

```text
试用期结束我能不能正式留下？
这次能不能顺利转成正式员工？
临时岗位能不能转长期正式岗位？
```

current target：

```text
current employment status
provisional → confirmed
```

建议 duty：

```text
employment_status_confirmation
```

Observation：

```text
Primary
→ 官鬼
→ current_employment_status
→ required

Role
→ 世
→ incumbent_self
→ required
```

Formalization 只有在明确存在审批 / 文件职责时才追加父母 Domain。

---

## 4.2 Formal Confirmation Document

```text
已经确定转正，转正通知什么时候下来？
转正合同能不能签完？
正式任命文件能不能批下来？
```

current target 已经是：

```text
formalization document / authorization
```

应进入已经完成的：

```text
employment_formalization_outcome
```

而不是 `employment_status_confirmation`。

---

# 5. 与 Employment Retention 的区别

```text
这轮裁员会不会裁到我？
→ employment_retention
```

当前状态是：

```text
confirmed employment
→ retained / lost
```

而转正：

```text
provisional employment
→ confirmed / not confirmed
```

两者都以 current employment / 官鬼为主轴，但 expected state 不同。

因此不应把转正暗塞进 retention。

---

# 6. 与 Position Advancement 的区别

```text
试用员工 → 正式员工
```

通常并不意味着：

```text
职位等级上升
权责升级
职称晋升
```

所以：

```text
employment_status_confirmation
!= position_advancement
```

除非现实问题同时明确：

```text
转正同时升职 / 升级
```

此时是 multi-target，不应自动只保留一个 career duty。

---

# 7. Formalization Context 的职责

对于 status confirmation：

```text
formalizationContext = explicit | context_supported
```

只能决定是否追加：

```text
父母 / formal_confirmation_process
```

不能把父母替换官鬼 Primary。

如果：

```text
currentTargetAspect = formalization_document
```

则应直接切换：

```text
careerDuty = employment_formalization_outcome
```

---

# 8. Proposed Rule Candidate

## RC-CP-STATUS-001

```text
proposition:
现代 probation / provisional employment 的“能否转正式”首先是 current employment status transition，不等于升迁。

support:
traditional continuity + modern_practice_compatible
```

## RC-CP-STATUS-002

```text
proposition:
status confirmation 的 Primary 为官鬼 current employment / position，世为本人。

support:
cross_source traditional continuity + modern direct examples
```

## RC-CP-STATUS-003

```text
proposition:
明确审批 / 转正文书时，父母可作为 formal confirmation Domain；文书本身为 current target 时切到 employment_formalization_outcome。

support:
traditional document continuity + architecture boundary
```

---

# 9. 证据成熟度

这一项与 `proceeding_acceptance` 不同。

后者存在古典直接“准理”规则；本项没有古典“试用期转正”同制度对应。

所以必须保留：

```text
classicalDirectInstitutionMatch = false
traditionalFunctionalContinuity = strong
modernDirectCaseSupport = present_but_lower_authority
```

因此如果进入正式 Rule Registry，建议：

```text
automationStatus = provisional_modern_mapping
```

而不是 `stable_traditional`。

---

# 10. Explicit Non-Candidates

```text
转正 = 升职
转正 = employment_retention
转正 = 父母 Primary
出现“试用期”就自动 career route
官鬼旺 = 一定转正
父母旺 = 一定批转正
父母空 = 一定不转正
转正通知什么时候寄到 = status confirmation
```

---

# 11. 最终结论

原：

```text
employment_status_confirmation
→ deferred / insufficient_rule_evidence
```

现在可以更新为：

```text
literatureResearch = completed_and_reviewed_with_modern_mapping_caveat
ruleArchitecture = mature_for_provisional_design
```

建议首轮：

```text
Primary → 官鬼 / current_employment_status
Role → 世 / incumbent_self
Conditional Domain → 父母 / formal_confirmation_process
```

并严格把：

```text
formal document as current target
```

交给 `employment_formalization_outcome`。

因此该项可以进入 provisional Rule Review / Schema Design，但正式 evidence tier 必须明确低于具有直接古典制度对应的规则。