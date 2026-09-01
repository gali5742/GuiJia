# 龟甲 · 六爻音信 / 联系专项研究 v0.1

日期：2026-09-01

状态：`completed_and_reviewed_with_split_promotion`

来源：

```text
person_return.person_news_contact residual
```

建议新相邻主题候选：

```text
person_contact
```

> 本专项只处理普通联系人 / 在外人员的音信与联系行为。不处理失踪、紧急安危、疾病生死，也不修改 Time Engine、正式 Intent / Router / Rule Registry / current-22 / training。

---

# 1. 为什么不能继续留在 person_return

传统行人章节常同时讨论：

```text
归期
所在
安危
音信
```

但现代语义已经明显分离：

```text
他什么时候回来？
→ person_return_timing

什么时候能收到他的消息？
→ person_news_arrival / person_contact_timing

他会不会主动给我回消息？
→ person_contact_response
```

一个人完全可能：

```text
长期不回来
但马上发消息
```

也可能：

```text
已经返程
但暂时没有联系
```

因此：

```text
physical return
≠ communication event
```

---

# 2. 《断易天机》的直接音信结构

《断易天机·占行人》明确：

```text
父临朱雀爻交，音信须来
```

注解进一步说明：

```text
父母、朱雀皆为音信
父母 / 朱雀发动 → 有信至
五爻动 → 信在路
父母 / 朱雀空 → 音信可能受阻
父母并勾陈 → 书信迟滞
```

同书又单列：

```text
占音信
```

说明“音信”并非必须附属于“本人回来”。

来源：

- https://shuyuan.zhiming.life/read/%E6%96%AD%E6%98%93%E5%A4%A9%E6%9C%BA/16
- https://shuyuan.zhiming.life/read/%E6%96%AD%E6%98%93%E5%A4%A9%E6%9C%BA/18

证据分类：

```text
stable_traditional_for_message/news artifact
```

---

# 3. 父母为什么只能代表“音信职责”，不能包办联系人行动

古典父母职责来自：

```text
书信 / 文书 / 信息载体
```

现代可以有功能连续性：

```text
letter
message
notification
written communication
```

朱辰彬现代类象也明确把：

```text
电话 / 文件 / 证书
```

归入父母类象体系。

但这只证明：

```text
communication artifact / channel
→ 父母-compatible
```

不能推出：

```text
person sends/replies
→ 父母 Primary
```

因为：

```text
“消息是否到达”
```

和：

```text
“某人是否采取联系行动”
```

是两个 current target。

---

# 4. Duty A · Person News Arrival

现代例：

```text
这几天能不能收到他的消息？
会不会有家里的来信？
最近能不能收到父亲那边的消息？
```

current target：

```text
news / message arrival
```

建议：

```text
person_news_arrival
```

首轮 Observation：

```text
Primary
→ 父母
→ news_or_message_artifact
→ required

Role
→ source person / related person
→ contextual or required when explicit
```

如果来源人物明确：

```text
父亲消息 → 父母 relation role may also exist
孩子消息 → 子孙 relation role
朋友消息 → 兄弟 / context-sensitive
```

必须保留：

```text
same selector may refer to message artifact and source person
```

不能语义合并。

成熟度：

```text
traditional support = strong
modern mapping = functionally compatible
status = provisional_rule_review_ready
```

---

# 5. Duty B · Person Contact Response

现代例：

```text
他会不会主动联系我？
我发了消息，他会不会回复？
父亲今天会不会给我打电话？
朋友会不会回我微信？
```

这里 current target 是：

```text
specific person's communication action
```

不是 message artifact。

因此建议：

```text
person_contact_response
```

首轮语义结构：

```text
Primary
→ contact actor / actual person

Domain
→ communication artifact or channel / 父母-compatible
→ conditional
```

但目前缺少足够跨来源直接证据证明：

```text
contact actor relation selector
+
父母 Domain
```

可以构成统一传统 Base Rule。

尤其陌生人 / 非亲属联系人是否应使用：

```text
应
```

仍是 contextual role 问题。

所以：

```text
person_contact_response
→ partial_design_ready
→ requires PRR-CONTACT-ACTOR
```

禁止：

```text
看到“消息 / 电话 / 微信”
→ 父母 Primary
```

---

# 6. Duty C · Person Contact Timing

现代例：

```text
什么时候会收到他的消息？
他大概什么时候会回复？
哪天能联系上？
```

这里必须继续拆：

```text
news arrival timing
vs
person action timing
```

## 6.1 News Arrival Timing

如果目标是：

```text
message / news arrival
```

可围绕：

```text
父母 / message artifact
```

形成 timing trigger evidence。

传统《断易天机》存在：

```text
父母 / 朱雀动
五爻在路
空亡 / 勾陈迟滞
```

等音信应期类象。

项目只转成：

```text
message_in_transit_trigger
message_void_delay_trigger
message_release_trigger
message_value_trigger
```

不得自行计算具体日期。

## 6.2 Contact Actor Timing

如果用户问：

```text
他什么时候主动回复
```

Primary 仍是人的行动；Time Trigger 必须绑定 contact actor 的 ObservationPlan。

当前：

```text
partial_design
```

不得因为目标含“什么时候”就退回父母 message timing。

---

# 7. Subject / Source Person Resolver

可以复用关系人语义框架，但不与 `person_return` 强绑定。

建议：

```text
PRR-CONTACT-ACTOR
```

输入：

```ts
{
  relationToQuerent:
    | 'parent'
    | 'child'
    | 'wife'
    | 'husband'
    | 'sibling'
    | 'friend_or_peer'
    | 'known_nonkin'
    | 'unknown',
  specificity:
    | 'specific'
    | 'context_bounded'
    | 'generic'
    | 'unknown'
}
```

第一层关系候选：

```text
parent → 父母
child → 子孙
wife → 妻财
husband → 官鬼
sibling → 兄弟
friend_or_peer → provisional 兄弟 candidate
known_nonkin → contextual role unresolved
unknown → unresolved
```

不得默认：

```text
known_nonkin = 应
```

除非未来 contextual-role research 支持。

---

# 8. Modern Channel 不决定 Traditional Primary

现代渠道：

```text
电话
短信
微信
LINE
邮件
社交平台私信
```

只允许保存在：

```text
communicationChannel
```

不能做：

```text
电话 → 父母
所以整个问题 Primary = 父母
```

例如：

```text
他会不会打电话给我？
```

电话只是渠道；current target 仍是：

```text
他的行动
```

---

# 9. 与其他主题边界

```text
他什么时候回来
→ person_return

他这趟路上安全吗
→ travel

什么时候收到他的消息
→ person_contact / news arrival

他会不会主动回复
→ person_contact / contact response

快递什么时候给我发通知
→ receive_item / delivery context

公司会不会发 offer 邮件
→ career formalization

学校会不会发录取通知
→ study admission / formalization context
```

因此“消息 / 通知 / 邮件”关键词不能抢 current target。

---

# 10. Status Matrix

```text
person_news_arrival
→ provisional_rule_review_ready

person_news_arrival_timing
→ timing-contract-ready

person_contact_response
→ partial_design_ready
→ PRR-CONTACT-ACTOR required

person_contact_response_timing
→ partial_design_ready

person_return.person_news_contact
→ deprecated_as_too_coarse
```

---

# 11. Rule Candidates

## RC-PC-001

```text
消息 / 音信 arrival 以父母作为 communication artifact Primary 有直接传统支持。
status = stable_traditional + modern_functional_continuity
```

## RC-PC-002

```text
具体人的联系 / 回复行为，Primary 应保持为 actor，而不是父母 message artifact。
status = semantic_stable / traditional_partial
```

## RC-PC-003

```text
communication channel 不决定传统 Primary。
status = modern_semantic_boundary
```

## RC-PC-004

```text
音信 timing 只能输出 timing trigger descriptors，不得另造 Time Engine。
status = architecture_required
```

---

# 12. Final Conclusion

原 residual：

```text
person_return.person_news_contact
```

应该废弃为过粗概念。

新的方向：

```text
person_contact
├─ person_news_arrival
├─ person_news_arrival_timing
├─ person_contact_response
└─ person_contact_response_timing
```

其中：

```text
news arrival
→ 可进入 provisional Rule Review

contact response
→ 保持 partial，等待 actor resolver
```

这使“人在不在回来”和“有没有消息 / 是否回复”彻底分责。

当前仍：

```text
formal integration = blocked
training = false
current route = false
```

当前 v0.13 next-topic boundary 仍为 design-only。