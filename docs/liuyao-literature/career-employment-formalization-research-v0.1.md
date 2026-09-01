# 龟甲 · 六爻事业正式手续专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed`

主题：`career_position.employment_formalization_outcome`

> 本文件只研究书面 offer、合同、任命 / 正式确认文书成为 current target 时的传统职责，不修改正式 Intent、Router、Rule Registry、current-22 或训练数据。

---

# 1. 研究问题

原 career Schema 已经区分：

```text
position_or_employment
formalization_document
```

并把后者暂缓。

本专项回答：

```text
当职位 / 工作本身不是当前唯一目标，
而书面 offer、合同、任命文书、正式手续本身成为 current target 时，
是否可以形成独立 Observation Rule？
```

---

# 2. 传统证据

## 2.1 《断易天机》/《火珠林》传统

可核验：

- https://ctext.org/wiki.pl?chapter=751078&if=gb&remap=gb
- https://ctext.org/wiki.pl?chapter=282766&if=en

关键结构：

```text
求官以官鬼为官职 / 官科
父母为印绶、文书
```

并明确：

```text
要官鬼有气旺相，并印绶不带空亡，印绶者父母爻也。
```

《天玄赋》相关文本又明确：

```text
谋望利名，先要鬼爻旺相；
斟量宣敕，但观父母兴衰。
```

及：

```text
宣敕者，父母是也。
```

因此传统本身已经区分：

```text
官鬼 → position / office
父母 → appointment / authorization / formal document
```

而不是所有求官问题只看一个爻。

---

## 2.2 《卜筮全书 · 求仕章》同源交叉

可核验：

- https://www.shidianguji.com/book/HY1394/chapter/1l3wdp13p3klr

文本明确：

```text
父母官鬼乃占官之根本，缺一则事难成。
```

这支持：

```text
position outcome
和
formal appointment/document
```

是两个可以同时存在、但职责不同的观察层。

### 同源性说明

《卜筮全书》与《天玄赋》相关内容存在承接，不机械计作完全独立来源。

---

# 3. 现代资料

## 3.1 朱辰彬

用户资料库《古筮真诠》可核验：

```text
工作前程 → 官鬼可表示工作
明确单位求职 → 父母可表示单位，官鬼可表示工作
```

并反复强调应按现实 current target / 真正所问对象取用，而不是看到“工作”便固定一个 selector。

这为现代 Schema 提供方法论连续性。

但本轮没有找到足够直接的：

```text
书面 offer 是否会发
劳动合同是否正式签成
任命文件是否下达
```

现代专项案例。

因此：

```text
modern_direct_formalization_case_support = limited
```

正式规则主要依据传统“官职 / 宣敕印绶”职责分离，并把现代 offer / contract 标记为 modern semantic mapping。

---

# 4. 不能把“合同阶段”自动等同 formalization current target

必须保留现有 Schema v0.2 原则：

```text
applicationStage = contract
```

只说明现实流程到了合同阶段。

它不自动推出：

```text
current target = formalization document
```

例如：

```text
合同已经发来了，我最后能不能顺利入职？
```

current target 仍可能是：

```text
employment acquisition / onboarding outcome
```

而：

```text
口头已经确定录用，这份正式合同最后能不能签下来？
```

current target 才是：

```text
employment_formalization_outcome
```

---

# 5. 建议新增 Duty

```text
careerDuty = employment_formalization_outcome
```

硬条件：

```text
currentTargetAspect = formalization_document
formalizationContext = explicit
```

首轮只支持 self career subject。

---

# 6. Observation 结构

建议：

```text
Primary
→ 父母
→ formal_employment_authorization_or_document
→ required

Domain
→ 官鬼
→ employment_or_position_being_formalized
→ required

Role
→ 世
→ career_subject_self
→ required
```

这里官鬼不再是 Primary，因为 current target 已经从：

```text
“我能不能拿到这份工作”
```

转成：

```text
“正式文书 / 任命手续能不能完成”
```

但官鬼仍是 required Domain，因为文书必须是对某个工作 / 职位进行 formalization，而不是一般无业务对象的纸张。

---

# 7. 与 Employer 父母职责的冲突

现有 career 现代规则还有：

```text
父母 → employer organization
```

这与：

```text
父母 → formal employment document
```

不是同一 semantic duty。

因此正式 ObservationPlan 不能只存：

```text
父母
```

而必须保留：

```text
semanticDuty
```

同一个六亲 selector 在不同现实职责下可以：

```text
same selector
!= same semantic object
```

如果 employer 与 formalization 同时需要观察，未来可：

1. 建两个 semantic subjects 指向同一 six-relative target；或
2. 单 target 保存多个 semantic duties。

当前 isolated contract 可先保留两个 duties，不尝试在 Semantic 层合并。

---

# 8. Hard Boundaries

## 8.1 Employment Acquisition

```text
这次最终会不会录用我？
能不能拿到 offer？
```

若 `offer` 实际语义是“录用决定”：

```text
job_application_outcome
```

不是 formalization。

## 8.2 Document Formalization

```text
已经口头录用了，书面 offer 最后会不会正式发？
任命文件能不能下来？
合同手续能不能正式办成？
```

才属于：

```text
employment_formalization_outcome
```

## 8.3 Physical Delivery

```text
纸质合同快递什么时候寄到？
```

current target 若是运输 / 收件：

```text
receive_item
```

而不是 career formalization。

## 8.4 Compensation

合同中薪资多少 / 奖金多少：

```text
income / compensation target
```

不进入 formalization。

---

# 9. Rule Candidates

## RC-CP-FORM-001

```text
position / employment 与 appointment / formal document 是不同 traditional duties。
support = stable_consensus_to_cross_source_compatible
```

## RC-CP-FORM-002

```text
formal employment authorization/document 成为 current target 时，父母可升为 Primary。
support = classical_direct + modern_semantic_mapping
```

## RC-CP-FORM-003

```text
官鬼保留被 formalize 的 employment / position required Domain。
support = cross_source_compatible
```

## RC-CP-FORM-004

```text
applicationStage 不决定 formalization duty。
support = semantic architecture boundary
```

---

# 10. Explicit Non-Candidates

```text
出现合同 → 自动父母 Primary
出现 offer → 自动父母 Primary
父母旺 → 一定拿到工作
父母空 → 一定不录用
官鬼旺 → 合同一定签成
公司 = 父母 与 合同 = 父母 可以不区分 semantic duty
书面 offer 物理寄送 → career formalization
```

---

# 11. 最终结论

原：

```text
formalization_document = deferred_until_schema_validation
```

现在可以更新为：

```text
employment_formalization_outcome
literatureResearch = completed_and_reviewed
ruleArchitecture = mature_for_design
modernDirectCaseCoverage = limited
```

它可以进入 Rule Review / Schema v0.3，并在 isolated 层实现：

```text
Primary 父母
+ required 官鬼 Domain
+ 世 Role
```

但仍不得进入 current route / training。