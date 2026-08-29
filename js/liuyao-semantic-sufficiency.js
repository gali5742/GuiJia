(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.2';

    const SLOT_SCHEMA = Object.freeze({
        financial_scope:{ kind:'domain_context', label:'整体财务范围', description:'明确是在问整体财运、综合收入、总体进账或钱财状态。' },
        business_context:{ kind:'domain_context', label:'经营语境', description:'明确存在店铺、生意、经营、业务或创业经营对象。' },
        transaction_context:{ kind:'event_context', label:'商业交易语境', description:'明确存在有边界的一笔商业交易、订单、合同或成交事项。' },
        inventory_purchase_context:{ kind:'event_context', label:'经营进货语境', description:'明确存在为经营而进货、采购、补货或增加库存。' },
        inventory_sale_context:{ kind:'event_context', label:'经营库存销售语境', description:'明确存在经营库存、存货、尾货的出售、出清或出货。' },
        borrowing_context:{ kind:'domain_context', label:'借款语境', description:'明确存在贷款、借款、融资、授信或放款关系。' },
        lending_context:{ kind:'relation_context', label:'出借语境', description:'明确是占问者作为出借方把资金借给对方。' },
        debt_collection_context:{ kind:'relation_context', label:'债权回收语境', description:'明确是占问者收回别人所欠款项、催款或追回债权。' },
        debt_context:{ kind:'domain_context', label:'债务语境', description:'明确存在债务、欠款、还贷、还款或待清偿负债。' },
        partnership_context:{ kind:'relation_context', label:'合伙经营语境', description:'明确存在合伙人、共同经营、搭档经营或合伙创业关系。' },
        investment_target:{ kind:'target', label:'投资标的/投资对象', description:'明确存在股票、基金、标的、持仓、投资项目或其他可识别投资对象。' },
        position_context:{ kind:'state_context', label:'持仓处置语境', description:'明确存在持有、仓位、清仓、减仓、赎回、卖出或退出等持仓处置状态。' },
        employment_income_context:{ kind:'domain_context', label:'工资薪酬语境', description:'明确存在工资、薪水、月薪、调薪、加薪或固定薪酬。' },
        bonus_context:{ kind:'domain_context', label:'奖金语境', description:'明确存在年终奖、绩效奖、奖金、奖励金或项目奖励。' },
        delivery_context:{ kind:'event_context', label:'交付/收货语境', description:'明确存在收货、送达、发货、寄送、物流、快递或到手事件。' },
        delivery_target:{ kind:'target', label:'收货对象', description:'明确指出包裹、快递件、订单商品或待收取的具体物品。' },
        purchase_context:{ kind:'event_context', label:'购买语境', description:'明确是在问购买、入手、购入、值不值得买或买后是否后悔。' },
        purchase_object:{ kind:'target', label:'购买对象', description:'明确指出电脑、手机、耳机、设备、产品等具体可购买对象。' },
        specific_counterpart:{ kind:'participant', label:'特定关系对象', description:'明确指出现实中的特定男生、女生、朋友、对象、恋人或其他具体关系对象；裸代词不算。' },
        marriage_proposal_context:{ kind:'relation_context', label:'婚事/婚配语境', description:'明确出现亲事、婚事、婚约、领证、结婚、成为夫妻等婚配目标。' },
        existing_marriage_context:{ kind:'relation_context', label:'既有婚姻语境', description:'明确说明夫妻、丈夫、妻子、老公、老婆、已婚或既有婚姻。' }
    });

    const requirement = (requiredAll, options = {}) => Object.freeze({
        requiredAll:Object.freeze([...(requiredAll || [])]),
        requiredAny:Object.freeze((options.requiredAny || []).map((group) => Object.freeze({ id:group.id, slots:Object.freeze([...group.slots]) }))),
        optional:Object.freeze([...(options.optional || [])]),
        contextRecoverable:Object.freeze([...(options.contextRecoverable || [])]),
        requiresDivinationGoal:options.requiresDivinationGoal !== false,
        note:options.note || ''
    });

    const ROUTE_REQUIREMENTS = Object.freeze({
        financial_fortune:requirement(['financial_scope'], { contextRecoverable:['financial_scope'], note:'整体财运类不要求具体交易对象，但必须能确认是在问总体钱财状态。' }),
        business_operation:requirement(['business_context'], { contextRecoverable:['business_context'], note:'“赚钱/利润”本身不足以证明是经营，必须有经营对象或经营语境。' }),
        commercial_transaction:requirement(['transaction_context'], { contextRecoverable:['transaction_context'], note:'必须确认是在问一笔有边界的商业交易/订单/合同，而不是持续经营利润。' }),
        inventory_purchase:requirement(['inventory_purchase_context'], { contextRecoverable:['inventory_purchase_context'], note:'必须确认是为经营而进货、采购或补库存。' }),
        inventory_sale:requirement(['inventory_sale_context'], { contextRecoverable:['inventory_sale_context'], note:'必须确认是经营库存/存货的出售或出清，而不是个人二手转卖。' }),
        borrow_money:requirement(['borrowing_context'], { contextRecoverable:['borrowing_context'] }),
        lend_money:requirement(['lending_context'], { contextRecoverable:['lending_context'], note:'资金方向必须是占问者向外出借。' }),
        debt_collection:requirement(['debt_collection_context'], { contextRecoverable:['debt_collection_context'], note:'必须确认是收回别人所欠款项，而不是自己还债。' }),
        debt_repayment:requirement(['debt_context'], { contextRecoverable:['debt_context'], note:'“还完/结清/清掉”必须能落到明确债务或负债。' }),
        partnership:requirement(['partnership_context'], { contextRecoverable:['partnership_context'], note:'必须确认存在合伙/共同经营关系。' }),
        investment_profit:requirement(['investment_target'], { contextRecoverable:['investment_target'] }),
        investment_liquidation:requirement(['position_context'], { optional:['investment_target'], contextRecoverable:['position_context','investment_target'], note:'已确定退出/卖出/赎回时，必须有明确持仓处置语境；是否真正提出占问由通用 divination-goal contract 判断。' }),
        investment_suitability:requirement(['investment_target'], { contextRecoverable:['investment_target'] }),
        investment_position_decision:requirement(['position_context'], { optional:['investment_target'], contextRecoverable:['position_context','investment_target'], note:'持仓处置语义本身可以建立投资对象；只有“要不要卖”而无持仓语境时仍不足。' }),
        investment_price_trend:requirement(['investment_target'], { contextRecoverable:['investment_target'], note:'“会不会涨/跌”必须知道什么在涨跌。' }),
        income_salary:requirement(['employment_income_context'], { contextRecoverable:['employment_income_context'], note:'“收入增加”不自动等于工资，必须有雇佣/薪酬语境。' }),
        income_bonus:requirement(['bonus_context'], { contextRecoverable:['bonus_context'] }),
        receive_item:requirement(['delivery_context','delivery_target'], { contextRecoverable:['delivery_context','delivery_target'], note:'“什么时候能收到/到手”必须能确定所收取的对象或既有交付上下文。' }),
        item_purchase:requirement(['purchase_context','purchase_object'], { contextRecoverable:['purchase_context','purchase_object'], note:'“值不值得买”若只有指示代词而无具体对象，当前文本不足。' }),
        relationship_development:requirement(['specific_counterpart'], { contextRecoverable:['specific_counterpart'], note:'“我们有机会吗/对方会同意吗”在无前文时不自动假定特定关系对象。' }),
        marriage_match:requirement([], { requiredAny:[{ id:'marriage_target', slots:['specific_counterpart','marriage_proposal_context'] }], contextRecoverable:['specific_counterpart','marriage_proposal_context'], note:'明确婚事本身即可建立婚配目标；否则需有特定关系对象。' }),
        marital_relationship:requirement(['existing_marriage_context'], { contextRecoverable:['existing_marriage_context'], note:'必须明确这是已经存在的婚姻，而不是一般关系发展。' })
    });

    const SLOT_PATTERNS = Object.freeze({
        financial_scope:[/财运/,/钱财/,/财务/,/(?:整体|总体|综合)(?:收入|进账|赚钱|财务)/,/收入总体/,/赚钱能力/,/手头[^，。？！?]{0,8}(?:宽裕|充裕)/],
        business_context:[/开(?:的)?(?:店|网店|门店)/,/店铺|门店|网店|咖啡店|工作室|摊子/,/生意|买卖/,/经营|业务/,/创业(?:项目|生意|经营)?/],
        transaction_context:[/商业交易|商业买卖|批发交易|批发生意/,/(?:这笔|这单|这一单)[^，。？！?]{0,12}(?:交易|买卖|生意|订单|合同)/,/(?:客户|买家|供应商)[^，。？！?]{0,14}(?:成交|交易|签约|合同)/,/成交|签约成交/],
        inventory_purchase_context:[/进货|补货|采购库存|采购这批货|采购一批货|商业采购/,/(?:店里|门店|网店|仓库)[^，。？！?]{0,12}(?:采购|进货|补货)/],
        inventory_sale_context:[/库存|存货|尾货|经营库存/,/(?:出清|清库存|清仓库)/,/(?:库存|存货|这批货|尾货)[^，。？！?]{0,12}(?:卖掉|卖完|售出|出货|出清|清掉)/],
        borrowing_context:[/贷款|借款|借钱|融资|授信|信贷|信用贷|房贷/,/放款|放贷/],
        lending_context:[/借给|贷给|出借|作为出借人/,/(?:朋友|同事|亲戚|对方)[^，。？！?]{0,8}向我借/],
        debt_collection_context:[/欠我的|借出去的钱|借给[^，。？！?]{0,8}的钱|应收款|债权|催债|催款|讨债/,/(?:要回|收回|追回|讨回)[^，。？！?]{0,10}(?:钱|欠款|款项|债)/],
        debt_context:[/债务|负债|欠款|欠的钱|贷款余额|信用卡欠款/,/还贷|还款|清偿/,/房贷[^，。？！?]{0,12}(?:还|清|结)/],
        partnership_context:[/合伙|合伙人|共同经营|合伙经营|合伙创业/,/(?:我|我们)[^，。？！?]{0,12}(?:一起|共同)[^，。？！?]{0,8}(?:开店|经营|做生意)/],
        investment_target:[/股票|基金|ETF|etf|期货|外汇|标的|仓位|持仓/,/(?:这笔|这项|这次|这个)(?:投资|投资项目|投资机会)/,/投资项目|投资机会|入股/],
        position_context:[/持仓|仓位|持有|继续拿|拿着/,/卖掉|卖出|清仓|减仓|赎回|退出|离场|平仓|止盈|止损|套现|变现/],
        employment_income_context:[/工资|薪水|薪资|月薪|基本工资|固定工资|固定薪水|固定收入|薪酬/,/加薪|涨薪|调薪/],
        bonus_context:[/奖金|年终奖|绩效奖|奖励金|项目奖金|季度奖励|绩效奖金/],
        delivery_context:[/收到|拿到|到手|送到|送达|发货|寄出|寄到|快递|物流|包裹/],
        delivery_target:[/包裹|快递件|快递|订单|商品|货物|东西/,/电脑|手机|耳机|相机|显示器|键盘|平板|设备|机器/],
        purchase_context:[/购买|购入|入手|买(?:这|那|个|一|台|部|款|件|套|副|本|只|张)/,/值不值得买|值得买吗|该不该买|适不适合买|买了会不会后悔|买回来/],
        purchase_object:[/电脑|手机|耳机|相机|显示器|键盘|平板|设备|家电|机器|商品|产品|路由器|手表|镜头/],
        specific_counterpart:[/(?:这个|那个|这位|那位|一个|某个)(?:男生|女生|男人|女人|男性|女性|朋友|人)/,/(?:我的|我和)(?:对象|恋人|男朋友|女朋友)/,/(?:对象|恋人|男朋友|女朋友)/,/(?:喜欢的|追求的)(?:这个|那个|一位|一个)?(?:男生|女生|男人|女人|人)/],
        marriage_proposal_context:[/亲事|婚事|婚约|领证|结婚|成为夫妻|步入婚姻|婚礼|登记成为夫妻|把婚(?:结|办)/],
        existing_marriage_context:[/夫妻|老婆|妻子|老公|丈夫|已婚|婚后|这段婚姻|已有婚姻|已经结婚/]
    });

    const normalizeSlot = (slot, fallbackSource) => {
        if (typeof slot === 'string') return { id:slot, source:fallbackSource || 'question', evidence:'' };
        if (!slot || typeof slot !== 'object') return null;
        return { id:String(slot.id || '').trim(), source:slot.source || fallbackSource || 'question', evidence:String(slot.evidence || ''), confidence:slot.confidence || 'explicit', ...(slot.value != null ? { value:String(slot.value) } : {}) };
    };

    const validateSlots = (slots) => {
        const errors = [];
        (slots || []).forEach((raw, index) => {
            const slot = normalizeSlot(raw, 'question');
            if (!slot?.id) errors.push({ code:'slot_id_missing', index });
            else if (!SLOT_SCHEMA[slot.id]) errors.push({ code:'unknown_slot_id', index, slotId:slot.id });
        });
        return { valid:errors.length === 0, errors };
    };

    const extractExplicitSlots = (question) => {
        const text = String(question || '').trim();
        if (!text) return [];
        const slots = [];
        for (const [slotId, patterns] of Object.entries(SLOT_PATTERNS)) {
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (!match) continue;
                slots.push({ id:slotId, source:'question', evidence:match[0], confidence:'explicit' });
                break;
            }
        }
        return slots;
    };

    const indexSlots = (slots, fallbackSource) => {
        const map = new Map();
        for (const raw of slots || []) {
            const slot = normalizeSlot(raw, fallbackSource);
            if (!slot?.id || !SLOT_SCHEMA[slot.id]) continue;
            if (!map.has(slot.id)) map.set(slot.id, slot);
        }
        return map;
    };

    const evaluateSemanticSufficiency = (routeId, questionSlots = [], contextSlots = []) => {
        const spec = ROUTE_REQUIREMENTS[routeId];
        if (!spec) {
            return { version:VERSION, routeId, status:'unsupported_route', sufficient:false, reasonCode:'route_requirement_missing', resolvedSlots:[], usedContextSlots:[], missing:[] };
        }

        const questionMap = indexSlots(questionSlots, 'question');
        const rawContextMap = indexSlots(contextSlots, 'context');
        const contextMap = new Map();
        for (const slotId of spec.contextRecoverable) {
            if (rawContextMap.has(slotId)) contextMap.set(slotId, { ...rawContextMap.get(slotId), source:'context' });
        }
        const merged = new Map(questionMap);
        for (const [slotId, slot] of contextMap.entries()) if (!merged.has(slotId)) merged.set(slotId, slot);

        const missing = [];
        for (const slotId of spec.requiredAll) {
            if (!merged.has(slotId)) missing.push({ type:'required_slot', slotId, label:SLOT_SCHEMA[slotId]?.label || slotId, contextRecoverable:spec.contextRecoverable.includes(slotId) });
        }
        for (const group of spec.requiredAny) {
            if (!group.slots.some((slotId) => merged.has(slotId))) {
                missing.push({ type:'required_any', groupId:group.id, slots:[...group.slots], labels:group.slots.map((slotId) => SLOT_SCHEMA[slotId]?.label || slotId), contextRecoverable:group.slots.some((slotId) => spec.contextRecoverable.includes(slotId)) });
            }
        }

        const resolvedSlots = [...merged.values()];
        const usedContextSlots = resolvedSlots.filter((slot) => slot.source === 'context');
        const sufficient = missing.length === 0;
        return { version:VERSION, routeId, status:sufficient ? 'sufficient' : 'semantic_insufficient', sufficient, reasonCode:sufficient ? null : 'missing_required_semantics', resolvedSlots, usedContextSlots, missing, requirement:spec, goalCheck:'not_evaluated' };
    };

    const normalizeGoals = (intent) => {
        const goals = Array.isArray(intent?.goals) ? intent.goals : (intent?.goal ? [intent.goal] : []);
        return goals.map((goal) => typeof goal === 'string' ? goal : String(goal?.type || '')).filter(Boolean);
    };

    const evaluateDivinationGoal = (intent) => {
        const goals = normalizeGoals(intent);
        const accepted = goals.filter((goal) => !['unknown','none','unspecified'].includes(goal));
        return {
            evaluated:true,
            sufficient:accepted.length > 0,
            goals,
            acceptedGoals:accepted,
            source:'DivinationIntent.goals'
        };
    };

    const evaluateIntentSufficiency = (routeId, intent, questionSlots = [], contextSlots = []) => {
        const base = evaluateSemanticSufficiency(routeId, questionSlots, contextSlots);
        if (base.status === 'unsupported_route') return { ...base, intentVersion:intent?.version || null, goalCheck:evaluateDivinationGoal(intent) };

        const goalCheck = evaluateDivinationGoal(intent);
        const missing = [...base.missing];
        if (base.requirement?.requiresDivinationGoal && !goalCheck.sufficient) {
            missing.push({
                type:'required_semantic',
                semanticId:'divination_goal',
                label:'明确占问目标',
                source:'DivinationIntent.goals',
                contextRecoverable:false
            });
        }
        const sufficient = missing.length === 0;
        const onlyGoalMissing = missing.length === 1 && missing[0].semanticId === 'divination_goal';
        return {
            ...base,
            status:sufficient ? 'sufficient' : 'semantic_insufficient',
            sufficient,
            reasonCode:sufficient ? null : (onlyGoalMissing ? 'missing_divination_goal' : 'missing_required_semantics'),
            missing,
            intentVersion:intent?.version || null,
            goalCheck
        };
    };

    const evaluateQuestion = (routeId, question, contextSlots = [], intent = null) => {
        const questionSlots = extractExplicitSlots(question);
        const base = intent
            ? evaluateIntentSufficiency(routeId, intent, questionSlots, contextSlots)
            : evaluateSemanticSufficiency(routeId, questionSlots, contextSlots);
        return { question:String(question || ''), questionSlots, ...base };
    };

    GuiJia.liuyaoSemanticSufficiency = Object.freeze({
        version:VERSION,
        slotSchema:SLOT_SCHEMA,
        routeRequirements:ROUTE_REQUIREMENTS,
        validateSlots,
        extractExplicitSlots,
        evaluateSemanticSufficiency,
        evaluateDivinationGoal,
        evaluateIntentSufficiency,
        evaluateQuestion
    });
})(typeof window !== 'undefined' ? window : globalThis);