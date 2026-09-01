# 龟甲 · 六爻教育选择 Choice Adapter 专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_adapter_ready_partial`

主题：

```text
study_exam.education_choice_comparison
```

上游：

- `choice-suitability-shared-architecture-v0.1.md`
- `study-application-admission-institution-resolver-research-v0.1.md`
- `study-exam-intent-schema-design-v0.4.md`

> 本专项研究 A/B 学校、项目、导师等教育 Alternative 如何进入共享 Comparison Frame。它不输出 Winner，不把学校固定映射为父母或应。

---

# 1. 核心结论

教育选择不是：

```text
A 学校 = 世
B 学校 = 应
```

也不是：

```text
A = 第一个父母
B = 第二个父母
```

正确流程：

```text
Modern Education Alternatives
↓
PRR-EDUCATION-INSTITUTION per alternative
↓
Alternative-specific ObservationPlan
↓
Admission / fit / requirement dimension evidence
↓
Shared Comparison Frame
```

当前：

```text
adapterReady = true
alternativeTraditionalAnchoring = may remain partial
overallRecommendation = null
```

---

# 2. 传统教育关系本身就是多对象结构

《黄金策·求师》明确：

```text
师 → 父母主象
学者 → 世或实际关系人
师弟二主 → 需分别观察
```

《黄金策·学馆》又明确：

```text
父母 → 书馆 / education place
应 → 东家 / external counterparty role
世 → 西席 / self role
```

且存在：

```text
父化父 → 两处书馆
卦有两父 → 两处书馆
```

说明传统体系能够容纳：

```text
multiple education entities
```

但需要上下文识别，而不是按数组顺序命名。

来源：

- https://ctext.org/wiki.pl?chapter=50010&if=gb&remap=gb
- https://zh.wikisource.org/zh-hans/%E9%BB%84%E9%87%91%E7%AD%96

---

# 3. 朱辰彬多个学校案例

用户资料库《古筮真诠》“考后占此校能录取否”案例中：

```text
应位父母巳火 → 指定所问学校
父母午火 → 另一学校
兄弟动 → 竞争者
```

最终：

```text
指定学校未录取
另一学校录取
```

该案例证明：

```text
1. 同一卦可以有多个 institution candidates
2. 父母只是 class constraint，不足以区分 A / B
3. 应位可以为其中一个学校提供 contextual anchor
4. 另一个学校不必也是应
```

所以：

```text
PRR-EDUCATION-INSTITUTION
```

必须是 per-alternative resolver。

---

# 4. Education Choice 的 Alternative Types

首轮建议：

```text
specific_institution
specific_program
specific_supervisor_or_teacher
current_school_vs_target_school
```

暂不自动支持：

```text
generic_major_choice
generic_city_choice
education_vs_employment
```

这些属于跨域或更抽象选择，需要另行研究。

---

# 5. Alternative Semantic Record

```ts
{
  id,
  type:
    | 'institution'
    | 'program'
    | 'supervisor_or_teacher',
  label,
  specificity:'specific' | 'context_bounded',
  admissionMode?:'exam_based' | 'application_based' | 'mixed' | 'not_applicable',
  learnerRelation,
  knownRequirements?:[],
  currentStatus?:'not_applied' | 'applied' | 'admitted' | 'enrolled' | 'unknown'
}
```

不得包含：

```text
父母 / 应 / 世
```

---

# 6. Institution Alternative Adapter

每个 institution alternative 先调用：

```text
PRR-EDUCATION-INSTITUTION
```

可能返回：

```text
resolved
partial
conflicted
unresolved
```

如果：

```text
Alternative A = partial
Alternative B = partial
```

共享 Comparison Frame 仍可存在：

```text
overall = partial
```

但不能根据未锚定父母爻比较旺衰。

---

# 7. 合法 Comparison Dimensions

教育主题首轮建议只允许：

```text
target_outcome
institution_fit
stability
```

其中：

## target_outcome

如果用户尚未录取：

```text
exam-based alternative
→ reuse exam_based_admission_outcome

application-based alternative
→ reuse application_based_admission partial contract
```

如果已经录取：

```text
target_outcome
```

不再表示“能否录取”，需要 semantic context 明确用户真正比较什么。

## institution_fit

传统《求师》《学馆》的：

```text
师弟相生合
世应主宾相合
教育实体旺衰
```

可以提供“关系 / 匹配”类传统连续性。

但不能直接转成：

```text
institutionFitScore = number
```

只能输出：

```text
fit evidence
```

## stability

仅当用户比较：

```text
能否长期顺利就读 / 完成项目
```

且有对应 academic-progress evidence 时允许。

不自动加入。

---

# 8. 不应默认加入的现代维度

以下虽然现实中很重要，但当前六爻研究尚无统一契约：

```text
学校排名
学费
就业率
城市偏好
学术声誉
生活成本
移民便利
社交体验
```

这些只能作为用户 preference / external factual dimensions 保存，不能让传统层自由生成。

其中：

```text
学费 / 奖学金
```

如成为 current target，应调用 finance 相关主题，而不是让 education adapter 自行判断。

---

# 9. Supervisor / Teacher Alternative

若 A/B 比较的是：

```text
跟导师 A 还是导师 B
```

传统“师 = 父母”提供 entity class continuity。

但两个导师都可能是父母候选，因此仍需要：

```text
specific teacher anchoring
```

不能：

```text
第一个父母 = A
第二个父母 = B
```

Relation evidence 可使用：

```text
teacher ↔ learner relation
```

但 Winner 仍不输出。

---

# 10. Current School vs Target School

这类问题容易照搬：

```text
世 = 当前学校
应 = 新学校
```

禁止。

正确：

```text
current institution
→ its own semantic alternative + resolver

target institution
→ its own semantic alternative + resolver
```

即使传统个案出现世应对照，也只能作为 contextual evidence，不得升级 fixed mapping。

---

# 11. Preference Policy

用户所谓“哪个好”至少可能表示：

```text
更容易录取
更适合学习
更容易顺利毕业
更稳定
更符合个人偏好
```

因此必须要求：

```text
decisionDimensions
```

如果用户只问：

```text
A 和 B 哪个好？
```

而没有任何维度：

```text
semantic choice recognized
comparison target insufficient
```

不能让传统层自行定义“好”。

---

# 12. Theme Adapter Contract

```ts
educationChoiceAdapter(alternative) => {
  status:'resolved' | 'partial' | 'unresolved',
  institutionResolution,
  observationPlan,
  dimensionEvidence:{
    target_outcome?:[],
    institution_fit?:[],
    stability?:[]
  },
  unresolvedAnchors:[]
}
```

Shared layer 保持：

```text
overallRecommendation = null
scalarScore = null
```

---

# 13. Status Matrix

```text
education_choice_comparison semantic duty
→ ready

education theme adapter
→ design_ready_partial

multiple institution representation
→ traditional precedent exists

per-institution line anchoring
→ PRR-EDUCATION-INSTITUTION required

institution fit evidence
→ traditional continuity exists / non-scalar

A/B fixed 世应 mapping
→ forbidden

A/B fixed father-line order mapping
→ forbidden

overall winner
→ not ready
```

---

# 14. Final Conclusion

本专项解除：

```text
education choice theme-adapter architecture blocker
```

仍未解除：

```text
specific institution traditional anchoring in every case
normalized cross-alternative Assessment
preference weighting
overall winner
```

因此未来可进入 isolated Theme Adapter，但必须保留 partial alternatives 与 no-winner policy。

当前 v0.13 next-topic boundary 仍为 design-only。