(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
    const includesAny = (text, terms = []) => terms.some((term) => text.includes(term));

    const UNSUPPORTED_DOMAIN_TERMS = Object.freeze([
        '疾病','病情','生病','治病','治疗','手术','癌','寿命','寿夭','能活多久','死亡','死期'
    ]);

    const TIME_ONLY_TERMS = Object.freeze([
        '今天','今日','明天','明日','后天','本周','这周','下周','本月','这个月','下个月','今年','明年','什么时候','何时','几时'
    ]);

    const EVENT_SIGNAL_GROUPS = Object.freeze([
        { event:'financial_fortune', terms:['财运','财福'] },
        { event:'business_operation', terms:['开店','创业','经营','生意'] },
        { event:'partnership', terms:['合伙','合伙人'] },
        { event:'borrow_money', terms:['借钱','贷款','房贷','融资贷款','贷款申请','申请贷款'] },
        { event:'debt_repayment', terms:['还清房贷','还完房贷','还清贷款','还完贷款','还清债','还完债','偿清贷款','偿还贷款','信用卡债'] },
        { event:'investment', terms:['投资','股票','基金','ETF','etf','期货','外汇','加密','持股','持有这只股票'] },
        { event:'income', terms:['工资','薪水','年终奖','奖金','提成','佣金','收入'] },
        { event:'receive_item', terms:['收到','收货','快递','包裹','邮寄','寄到','送到'] },
        { event:'item_purchase', terms:['买这台','买这个','购买这台','购买这个'] },
        { event:'marriage_match', terms:['婚事','结婚','婚姻能不能成','婚姻能否成'] },
        { event:'marital_relationship', terms:['妻子','老婆','丈夫','老公'] },
        { event:'relationship_development', terms:['表白','喜欢我','喜欢她','喜欢他','恋爱','暧昧','复合','和好','女朋友','男朋友'] }
    ]);

    const detectMultipleGoals = (text) => {
        const hits = EVENT_SIGNAL_GROUPS
            .filter((group) => includesAny(text, group.terms))
            .map((group) => group.event);
        const unique = [...new Set(hits.filter((event) => event !== 'item_purchase'))];

        // Sub-events that naturally belong to the same coherent goal must not be split.
        const compatible = new Set(['investment|item_purchase', 'item_purchase|investment']);
        if (unique.length <= 1) return [];
        if (unique.length === 2 && compatible.has(`${unique[0]}|${unique[1]}`)) return [];

        // Explicit conjunction between independent high-level domains is a hard stop.
        if (/(而且|并且|同时|另外|还有)/.test(text)) return unique;
        if (text.includes('财运') && /(结婚|婚事|婚姻)/.test(text)) return unique;
        return [];
    };

    const detectGoal = (text) => {
        if (/(什么时候|何时|几时|哪天|多久能)/.test(text)) return 'timing';
        if (/(继续.*还是|还是现在|要不要|适不适合|值不值得|好不好)/.test(text)) return 'choice';
        if (/(怎么样|如何|走势|什么态度|喜欢我吗|喜欢我\?|喜欢我？)/.test(text)) return 'state';
        if (/(能不能|能否|会不会|有没有|可不可以|能成吗|能成\?|能成？)/.test(text)) return 'outcome';
        return 'unknown';
    };

    const detectDeliveryMode = (text) => {
        if (text.includes('快递')) return 'courier';
        if (text.includes('邮寄') || text.includes('邮件')) return 'mail';
        if (/(寄来|寄到|寄回|发货|包裹)/.test(text)) return 'shipped';
        if (/(自取|取货|去拿|上门拿)/.test(text)) return 'pickup';
        if (/(亲自送|送给我|送过来)/.test(text)) return 'hand_delivery';
        return 'unknown';
    };

    const detectIncomeType = (text) => {
        if (/(工资|薪水|薪资)/.test(text)) return 'salary';
        if (/(年终奖|奖金)/.test(text)) return 'bonus';
        if (/(提成|佣金)/.test(text)) return 'commission';
        if (/(自由职业|接稿|接单)/.test(text)) return 'freelance';
        if (/(副业)/.test(text)) return 'side_business';
        if (/(收入)/.test(text)) return 'other';
        return 'unknown';
    };

    const detectInvestmentAction = (text) => {
        if (/(买入|买这只股票|进场|介入|建仓)/.test(text)) return 'enter';
        if (/(继续持有|持股|拿着|持仓)/.test(text)) return 'hold';
        if (/(卖出|抛出|套现|退出|出货|清仓)/.test(text)) return 'exit';
        return 'none';
    };

    const detectInvestmentPosition = (text) => {
        if (/(已经持有|已经持股|目前持有|我持有|持仓中|满仓)/.test(text)) return 'holding';
        if (/(已经卖出|已经退出|已经清仓)/.test(text)) return 'exited';
        if (/(做空|空仓)/.test(text)) return text.includes('做空') ? 'short' : 'none';
        return 'unknown';
    };

    const detectInvestmentGoal = (text) => {
        if (/(适不适合投资|值不值得投|值得投资|适宜投资|适合投资)/.test(text)) return 'suitability';
        if (/(继续持有.*还是|持股.*还是|持有.*还是.*卖|卖.*还是.*持)/.test(text)) return 'position_decision';
        if (/(走势|涨不涨|会不会涨|会不会跌|价格趋势|大盘)/.test(text)) return 'price_trend';
        if (/(什么时候买|何时买|买入时机|进场时机)/.test(text)) return 'entry_timing';
        if (/(赚钱|获利|有财|回本|利润|收益|盈利)/.test(text)) return 'profit';
        if (/(套现|卖出|抛出|出货|清仓)/.test(text)) return 'liquidation';
        return 'unknown';
    };

    const detectRomanticStage = (text) => {
        if (/(表白)/.test(text)) return 'confession_pending';
        if (/(追求|追她|追他)/.test(text)) return 'active_pursuit';
        if (/(复合|和好)/.test(text)) return 'former_partner';
        if (/(女朋友|男朋友|恋爱中|在一起)/.test(text)) return 'dating';
        if (/(喜欢|暧昧)/.test(text)) return 'unestablished_interest';
        return 'unknown';
    };

    const detectQuerentSex = (text) => {
        if (/(我是男生|我是男的|我是男方|男占|男问)/.test(text)) return 'male';
        if (/(我是女生|我是女的|我是女方|女占|女问)/.test(text)) return 'female';
        return 'unknown';
    };

    const detectCounterpartSex = (text) => {
        if (/(女生|女孩|女方|她|妻子|老婆|媳妇)/.test(text)) return 'female';
        if (/(男生|男孩|男方|他|丈夫|老公)/.test(text)) return 'male';
        return 'unknown';
    };

    const detectExpectedState = (text, event, helpers = {}) => {
        if (event === 'borrow_money' && /(批下来|审批|批准|批贷)/.test(text)) return 'approval';
        if (event === 'debt_repayment' && /(还清|还完|偿清)/.test(text)) return 'fully_repaid';
        if (event === 'investment') {
            if (helpers.investmentGoal === 'profit') return 'profit';
            if (helpers.investmentGoal === 'suitability') return 'suitable';
            if (helpers.investmentGoal === 'position_decision') return 'hold_or_exit';
            if (helpers.investmentGoal === 'price_trend') return 'price_trend';
        }
        if (event === 'income') {
            if (helpers.incomeType === 'salary' && /(涨|增加|加薪)/.test(text)) return 'increase';
            if (helpers.incomeType === 'bonus' && /(发|发下来|拿到)/.test(text)) return 'issued';
        }
        if (event === 'receive_item' && /(收到|送到|寄到|到吗|到\?|到？)/.test(text)) return 'received';
        if (event === 'relationship_development') {
            if (text.includes('表白')) return 'accepted_confession';
            if (/(复合|和好)/.test(text)) return 'reconciled';
            if (/(喜欢我)/.test(text)) return 'partner_interest';
        }
        if (event === 'marriage_match' && /(能成|结婚|婚事)/.test(text)) return 'marriage_established';
        if (event === 'marital_relationship' && /(和好|复合)/.test(text)) return 'reconciled';
        if (event === 'financial_fortune') return 'wealth_state';
        if (event === 'business_operation' || event === 'partnership') {
            if (/(赚钱|获利|利润)/.test(text)) return 'profit';
        }
        return '';
    };

    const detectEvent = (text) => {
        if (/(还清房贷|还完房贷|还清贷款|还完贷款|还清债|还完债|偿清贷款|偿还贷款|信用卡债|(?:房贷|贷款|债务|债|信用卡)[^，。？！?]{0,10}(?:还清|还完|偿清|偿还)|(?:还清|还完|偿清|偿还)[^，。？！?]{0,10}(?:房贷|贷款|债务|债|信用卡))/.test(text)) return 'debt_repayment';
        if (/(房贷|贷款|借钱|申请贷款|贷款申请|融资贷款)/.test(text)) return 'borrow_money';
        if (text.includes('财运') || text.includes('财福')) return 'financial_fortune';
        if (/(合伙|合伙人)/.test(text) && /(赚钱|开店|经营|项目|投资)/.test(text)) return 'partnership';
        if (/(开店|开[^，。？！?]{0,6}店|创业|经营)/.test(text)) return 'business_operation';
        if (/(股票|基金|ETF|etf|期货|外汇|加密|投资|持股|持仓)/.test(text)) return 'investment';
        if (/(工资|薪水|薪资|年终奖|奖金|提成|佣金)/.test(text)) return 'income';
        if (/(快递|邮寄|包裹|寄来|寄到|送到)/.test(text) && /(收到|到吗|到\?|到？|送达|寄到)/.test(text)) return 'receive_item';
        if (/(买这台|购买这台|买这个|购买这个)/.test(text)) return 'item_purchase';
        if (/(儿子|女儿|孩子).*(婚事|婚姻|结婚)/.test(text)) return 'marriage_match';
        if (/(妻子|老婆|丈夫|老公)/.test(text) && /(感情|关系|和好|复合|婚姻)/.test(text)) return 'marital_relationship';
        if (/(婚事|婚姻|结婚)/.test(text)) return 'marriage_match';
        if (/(表白|喜欢我|喜欢她|喜欢他|恋爱|暧昧|复合|和好|女朋友|男朋友)/.test(text)) return 'relationship_development';
        return 'unknown';
    };

    const detectPurchaseGoal = (text) => {
        if (/(好不好用|实不实用|耐不耐用|容易坏|使用)/.test(text)) return 'usability';
        if (/(值不值|值不值得|价格|划算)/.test(text)) return 'value';
        if (/(成交|交易能不能|买得到|能不能买到)/.test(text)) return 'transaction_completion';
        if (/(收藏|升值|保值|投资)/.test(text)) return 'investment';
        if (/(能不能买|买不买)/.test(text)) return 'acquisition';
        return 'unknown';
    };

    const detectTransactionPurpose = (text) => {
        if (/(批发|商贩|做生意|商业买卖)/.test(text)) return 'commercial_trade';
        if (/(自己用|自用|我买)/.test(text)) return 'personal_purchase';
        if (/(二手卖|卖掉我的|把我的.*卖)/.test(text)) return 'personal_sale';
        return 'unknown';
    };

    const detectFortuneScope = (text) => {
        if (/(一生|终身|长期财运|一辈子)/.test(text)) return 'long_term_or_lifetime';
        return 'short_or_bounded';
    };

    const parseDivinationIntent = (question) => {
        const rawQuestion = String(question || '').trim();
        if (!rawQuestion) return null;
        const text = normalize(rawQuestion);

        if (includesAny(text, UNSUPPORTED_DOMAIN_TERMS)) {
            return {
                version:'0.1', rawQuestion, status:'blocked', blockReason:'unsupported_domain',
                goals:[], participants:[], confidence:1, ambiguities:[]
            };
        }

        const multipleEvents = detectMultipleGoals(text);
        if (multipleEvents.length > 1) {
            return {
                version:'0.1', rawQuestion, status:'blocked', blockReason:'multiple_goals',
                goals:multipleEvents.map((event) => ({ type:'unknown', event })),
                participants:[], confidence:0.95, ambiguities:[]
            };
        }

        const event = detectEvent(text);
        const goalType = detectGoal(text);

        const hasOnlyTimeAndModal = event === 'unknown'
            && includesAny(text, TIME_ONLY_TERMS)
            && /能不能|能否|会不会|怎么样|如何|\?|？/.test(text);
        if (hasOnlyTimeAndModal) {
            return {
                version:'0.1', rawQuestion, status:'blocked', blockReason:'partial',
                goals:[], participants:[], confidence:0.98, ambiguities:[{ code:'missing_event', message:'占问缺少具体事项。' }]
            };
        }

        const incomeType = detectIncomeType(text);
        const investmentAction = detectInvestmentAction(text);
        const investmentGoal = detectInvestmentGoal(text);
        const investmentPosition = detectInvestmentPosition(text);
        const deliveryMode = detectDeliveryMode(text);
        const purchaseGoal = detectPurchaseGoal(text);
        const transactionPurpose = detectTransactionPurpose(text);
        const romanticStage = detectRomanticStage(text);
        const querentSex = detectQuerentSex(text);
        const counterpartSex = detectCounterpartSex(text);
        const fortuneScope = detectFortuneScope(text);
        const expectedState = detectExpectedState(text, event, { incomeType, investmentGoal });

        const participants = [];
        if (event === 'borrow_money') {
            if (/(银行|金融机构|贷款机构)/.test(text)) participants.push({ role:'lender', text:'银行/金融机构', relationToQuerent:'other', specificity:'specific', institutionType:'institutional_lender' });
            else participants.push({ role:'lender', relationToQuerent:'other', specificity:'unknown', institutionType:'unknown' });
        }
        if (event === 'partnership') participants.push({ role:'partner', relationToQuerent:text.includes('朋友') ? 'friend' : 'other', specificity:'specific' });
        if (event === 'relationship_development') participants.push({ role:'romantic_counterpart', relationToQuerent:'partner', specificity:'specific', sex:counterpartSex });
        if (event === 'marital_relationship') participants.push({ role:'spouse', relationToQuerent:'spouse', specificity:'specific', sex:counterpartSex });
        if (event === 'marriage_match' && /(儿子|女儿|孩子)/.test(text)) {
            participants.push({ role:'represented_subject', relationToQuerent:'child', specificity:'specific', sex:text.includes('儿子') ? 'male' : text.includes('女儿') ? 'female' : 'unknown' });
        }

        let timeScope = null;
        try {
            timeScope = GuiJia.questionTime?.parseQuestionTimeScope?.(rawQuestion, new Date()) || null;
        } catch (_error) {
            timeScope = null;
        }

        const ambiguities = [];
        if (event === 'unknown') ambiguities.push({ code:'unknown_event', message:'尚未识别到已登记的现代事项类型。' });
        if (event === 'relationship_development' && (querentSex === 'unknown' || counterpartSex === 'unknown')) {
            ambiguities.push({ code:'romantic_sex_role_unknown', message:'当前规则需要明确占问者与特定恋爱对象的传统男女角色。' });
        }

        return {
            version:'0.1',
            rawQuestion,
            status:'resolved',
            goals:[{ type:goalType }],
            event:{ type:event },
            participants,
            targetTime:timeScope,
            expectedState,
            confidence:event === 'unknown' ? 0.45 : 0.9,
            ambiguities,
            semantics:{
                incomeType,
                investmentAction,
                investmentGoal,
                investmentPosition,
                deliveryMode,
                purchaseGoal,
                transactionPurpose,
                romanticStage,
                querentSex,
                counterpartSex,
                fortuneScope
            }
        };
    };

    GuiJia.liuyaoIntent = Object.freeze({
        parseDivinationIntent,
        normalizeQuestionText: normalize
    });
})(typeof window !== 'undefined' ? window : globalThis);
