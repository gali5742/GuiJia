(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { buildLiteratureContextLines, formatNaturalCount = (value) => String(value) } = GuiJia.common || {};
    const { getWuXing, heMap, chongMap } = GuiJia.baziCore || {};
    const { hasStatusCode, hasMoveCode } = GuiJia.liuyaoCore;

    const SUPPORT_CODES = new Set([
        'MONTH_COMMAND', 'MONTH_HARMONY', 'MONTH_GENERATE', 'MONTH_SUPPORT',
        'DAY_COMMAND', 'DAY_GENERATE', 'DAY_SUPPORT',
        'RETURN_GENERATE', 'PROGRESS', 'TRANSFORM_GROWTH', 'TRANSFORM_PROSPER'
    ]);
    const CONSTRAINT_CODES = new Set([
        'MONTH_BREAK', 'MONTH_CONTROL', 'DAY_CONTROL', 'DAY_BREAK', 'VOID',
        'RETURN_CONTROL', 'RETREAT', 'TRANSFORM_TOMB', 'TRANSFORM_EXTINCTION',
        'TRANSFORM_VOID', 'TRANSFORM_MONTH_BREAK'
    ]);
    const TRIGGER_CODES = new Set([
        'DAY_CLASH', 'DARK_MOVING', 'DAY_HARMONY', 'RETURN_CLASH', 'RETURN_HARMONY'
    ]);

    const ensureSentenceEnd = (text) => {
        const value = String(text || '').trim();
        if (!value) return '';
        return /[。！？]$/.test(value) ? value : `${value}。`;
    };

    const makeJudgment = (id, title, summary, evidence = [], tags = [], priority = 0, points = []) => ({
        id,
        title,
        summary,
        points: [...new Set((points || []).map((item) => String(item || '').trim()).filter(Boolean))],
        evidence: [...new Set(evidence.filter(Boolean))],
        tags: [...new Set(tags.filter(Boolean))],
        priority
    });

    const targetLabel = (target) => target
        ? `${target.relation || ''}${target.branch || ''}${target.element || ''}`
        : '当前观察对象';

    const tagText = (tags = []) => [...new Set(tags.map((tag) => tag?.text).filter(Boolean))];
    const tagCodes = (tags = []) => new Set(tags.map((tag) => tag?.code).filter(Boolean));

    const isDisplayStartSelection = (resultObj) => resultObj?.useGodSelection?.specificity === 'display-start'
        && Number(resultObj?.useGodSelection?.candidateCount || 0) > 1;
    const isObservationSelection = (resultObj) => isDisplayStartSelection(resultObj) || resultObj?.useGodSelection?.focusId === 'travel';
    const focusNoun = (resultObj) => isObservationSelection(resultObj) ? '当前观察对象' : '用神';
    const focusTermText = (resultObj, text = '') => isObservationSelection(resultObj)
        ? String(text).replaceAll('用神', '当前观察对象')
        : String(text);
    const linePositionText = (target) => {
        if (!target) return '';
        const labels = ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        if (target.type === 'hidden') return `${labels[target.position] || ''}下伏${targetLabel(target)}`;
        const role = target.isShi ? '（世）' : target.isYing ? '（应）' : '';
        return `${labels[target.position] || ''}${role}${targetLabel(target)}`;
    };

    function calendarRelationText(resultObj, target, scope = 'context') {
        if (!target) return [];
        const tags = target.statusTags || [];
        const has = (code) => tags.some((tag) => tag.code === code);
        const monthZhi = resultObj?.monthZhi || '';
        const dayZhi = resultObj?.dayZhi || '';
        const monthElement = monthZhi && getWuXing ? getWuXing(monthZhi) : '';
        const dayElement = dayZhi && getWuXing ? getWuXing(dayZhi) : '';
        const subject = scope === 'context' ? `${focusNoun(resultObj)}【${target.branch}】${target.element}` : `${target.branch}${target.element}`;
        const parts = [];
        const season = tags.find((tag) => tag.code === 'SEASON_STATE')?.text?.replace(/^月令/, '') || '';
        if (monthZhi && season) parts.push(scope === 'context' ? `${monthZhi}月${target.element}${season}` : `${monthZhi}月${target.element}处“${season}”`);

        if (monthZhi) {
            if (has('MONTH_COMMAND')) parts.push(`${subject}临月建【${monthZhi}】`);
            else {
                if (has('MONTH_HARMONY')) parts.push(`月建【${monthZhi}】与${subject}六合`);
                if (has('MONTH_BREAK')) parts.push(`月建【${monthZhi}】冲${subject}`);
                if (has('MONTH_GENERATE')) parts.push(`月建【${monthZhi}】${monthElement}生${subject}`);
                else if (has('MONTH_CONTROL')) parts.push(`月建【${monthZhi}】${monthElement}克${subject}`);
                else if (has('MONTH_SUPPORT')) parts.push(`月建【${monthZhi}】${monthElement}与${subject}比和`);
            }
        }
        if (dayZhi) {
            if (has('DAY_COMMAND')) parts.push(`${subject}临日辰【${dayZhi}】`);
            else {
                if (has('DAY_HARMONY')) parts.push(`日辰【${dayZhi}】与${subject}六合`);
                if (has('DAY_CLASH') || has('DAY_BREAK') || has('DARK_MOVING')) parts.push(`日辰【${dayZhi}】冲${subject}`);
                if (has('DAY_GENERATE')) parts.push(`日辰【${dayZhi}】${dayElement}生${subject}`);
                else if (has('DAY_CONTROL')) parts.push(`日辰【${dayZhi}】${dayElement}克${subject}`);
                else if (has('DAY_SUPPORT')) parts.push(`日辰【${dayZhi}】${dayElement}与${subject}比和`);
            }
        }
        if (has('VOID')) parts.push(`${subject}旬空`);
        return parts;
    }

    function contextRoleDistribution(text, staticHexagram) {
        if (!staticHexagram) return text || '—';
        return String(text || '—')
            .split('；')
            .filter((part) => !/^变爻/.test(part.trim()))
            .join('；');
    }

    function sameRelationDistributionText(useGodAnalysis, target, staticHexagram) {
        const presence = useGodAnalysis?.relationPresence?.[target?.relation];
        if (!presence) return '';
        const parts = [];
        const visible = (presence.visible || []).map((line) => {
            const current = target?.type !== 'hidden' && line.position === target.position;
            const flags = `${line.isShi ? '（世）' : ''}${line.isYing ? '（应）' : ''}`;
            return `${line.label}${flags}${line.relation}${line.branch}${line.element}${current ? '（当前观察对象）' : ''}`;
        });
        const changed = (presence.changed || []).map((line) => `${line.label}化${line.changedRelation || target.relation}${line.changedBranch}${line.changedElement}`);
        const hidden = (presence.hiddenCandidates || []).map((item) => {
            const current = target?.type === 'hidden' && item.position === target.position;
            return `${item.label}下伏${item.hiddenRelation}${item.hiddenBranch}${item.hiddenElement}${current ? '（当前观察对象）' : ''}`;
        });
        parts.push(visible.length ? `明爻：${visible.join('、')}` : '明爻未见');
        if (!staticHexagram) parts.push(changed.length ? `变爻：${changed.join('、')}` : '变爻未见');
        if (hidden.length) parts.push(`伏神候选：${hidden.join('、')}`);
        return parts.join('；');
    }

    function compactShiYingFactLine(shiYing) {
        if (!shiYing?.shi || !shiYing?.ying) return `世应：${String(shiYing?.text || '—').replace(/[。；]+$/g, '')}`;
        const { shi, ying } = shiYing;
        const codes = tagCodes(shiYing.tags || []);
        const relations = [];
        if (codes.has('SHI_GENERATES_YING')) relations.push('世生应');
        if (codes.has('YING_GENERATES_SHI')) relations.push('应生世');
        if (codes.has('SHI_CONTROLS_YING')) relations.push('世克应');
        if (codes.has('YING_CONTROLS_SHI')) relations.push('应克世');
        if (codes.has('SHI_YING_SIX_HARMONY')) relations.push(`${shi.branch}${ying.branch}六合`);
        if (codes.has('SHI_YING_SIX_CLASH')) relations.push(`${shi.branch}${ying.branch}六冲`);
        if (codes.has('SHI_YING_BOTH_MOVING')) relations.push('世应俱动');
        else {
            if (codes.has('SHI_MOVING')) relations.push('世爻发动');
            if (codes.has('YING_MOVING')) relations.push('应爻发动');
        }
        if (codes.has('SHI_VOID')) relations.push('世爻旬空');
        if (codes.has('YING_VOID')) relations.push('应爻旬空');
        const base = `世爻为${shi.label}${shi.relation}${shi.branch}${shi.element}，应爻为${ying.label}${ying.relation}${ying.branch}${ying.element}`;
        return `世应：${base}${relations.length ? `；${relations.join('，')}` : ''}`;
    }

    function classifyTargetState(target) {
        const status = target?.statusTags || [];
        const move = target?.moveTags || [];
        const tags = [...status, ...move];
        const codes = new Set([...tagCodes(status), ...tagCodes(move)]);
        const support = tags.filter((tag) => tag?.type === 'support' || SUPPORT_CODES.has(tag?.code));
        const constraint = tags.filter((tag) => ['constraint', 'void'].includes(tag?.type) || CONSTRAINT_CODES.has(tag?.code));
        const trigger = tags.filter((tag) => tag?.type === 'trigger' || TRIGGER_CODES.has(tag?.code));
        return { codes, support, constraint, trigger };
    }

    function statusTitleParts(target) {
        const tags = target?.statusTags || [];
        const season = tags.find((tag) => tag.code === 'SEASON_STATE')?.text?.replace(/^月令/, '') || '';
        const preferredCodes = [
            ['MONTH_COMMAND', '临月建'], ['MONTH_HARMONY', '月合'], ['MONTH_GENERATE', '月生'], ['MONTH_SUPPORT', '月比扶'],
            ['MONTH_BREAK', '月破'], ['MONTH_CONTROL', '月克'],
            ['DAY_COMMAND', '临日辰'], ['DAY_HARMONY', '日合'], ['DAY_GENERATE', '日生'], ['DAY_SUPPORT', '日比扶'],
            ['DAY_CONTROL', '日克'], ['DAY_BREAK', '日破'], ['DARK_MOVING', '暗动提示'], ['VOID', '旬空']
        ];
        const parts = preferredCodes
            .filter(([code]) => tags.some((tag) => tag.code === code))
            .map(([, text]) => text);
        return { season, parts: [...new Set(parts)] };
    }

    function targetRolePrefix(target) {
        if (target?.type === 'hidden') return '伏神';
        if (target?.isShi) return '世爻';
        if (target?.isYing) return '应爻';
        return '';
    }

    function buildTargetSpecificTitle(target) {
        const label = `${targetRolePrefix(target)}${targetLabel(target)}`;
        const { season, parts } = statusTitleParts(target);
        const selected = parts.slice(0, 2);
        let title = label;
        if (selected.length) title += selected.join('、');
        if (season) title += `${selected.length ? '，' : ''}季节上处${season}`;
        return title;
    }

    function lineReadableState(line) {
        const texts = tagText(line?.statusTags || []);
        const movement = line?.moving
            ? '动'
            : hasStatusCode(line, 'DARK_MOVING') ? '静（暗动提示）' : '静';
        return `${line.label}${line.relation}${line.branch}${movement}${texts.length ? `（${texts.join('、')}）` : ''}`;
    }

    function deityRoleByElement(element, useGodAnalysis) {
        if (!element || !useGodAnalysis) return '';
        if (element === useGodAnalysis.sourceElement) return '元神';
        if (element === useGodAnalysis.tabooElement) return '忌神';
        if (element === useGodAnalysis.enemyElement) return '仇神';
        return '';
    }

    function displayRoleLabel(role, resultObj) {
        if (!isObservationSelection(resultObj)) return role;
        return ({
            '元神':'生扶五行',
            '忌神':'克制五行',
            '仇神':'间接制约五行'
        })[role] || role;
    }

    function shiYingRelationPhrase(tags = []) {
        const codes = tagCodes(tags);
        const parts = [];
        if (codes.has('SHI_YING_SIX_CLASH')) parts.push('相冲');
        if (codes.has('SHI_YING_SIX_HARMONY')) parts.push('相合');
        if (codes.has('YING_CONTROLS_SHI') || codes.has('SHI_CONTROLS_YING')) parts.push('相克');
        if (codes.has('YING_GENERATES_SHI') || codes.has('SHI_GENERATES_YING')) parts.push('相生');
        return [...new Set(parts)].join('');
    }

    function shiYingRelationDetails(target, tags = []) {
        const codes = tagCodes(tags);
        const parts = [];
        if (codes.has('SHI_YING_SIX_CLASH')) parts.push('与用神六冲');
        if (codes.has('SHI_YING_SIX_HARMONY')) parts.push('与用神六合');
        if (target?.isShi) {
            if (codes.has('YING_CONTROLS_SHI')) parts.push('克用神');
            if (codes.has('SHI_CONTROLS_YING')) parts.push('受用神所克');
            if (codes.has('YING_GENERATES_SHI')) parts.push('生用神');
            if (codes.has('SHI_GENERATES_YING')) parts.push('受用神所生');
        } else if (target?.isYing) {
            if (codes.has('SHI_CONTROLS_YING')) parts.push('克用神');
            if (codes.has('YING_CONTROLS_SHI')) parts.push('受用神所克');
            if (codes.has('SHI_GENERATES_YING')) parts.push('生用神');
            if (codes.has('YING_GENERATES_SHI')) parts.push('受用神所生');
        }
        return [...new Set(parts)];
    }

    const MONTH_STATUS_CODES = new Set([
        'MONTH_COMMAND', 'MONTH_HARMONY', 'MONTH_GENERATE', 'MONTH_SUPPORT', 'MONTH_BREAK', 'MONTH_CONTROL'
    ]);
    const DAY_STATUS_CODES = new Set([
        'DAY_COMMAND', 'DAY_HARMONY', 'DAY_GENERATE', 'DAY_SUPPORT', 'DAY_CONTROL', 'DAY_BREAK', 'DAY_CLASH', 'DARK_MOVING'
    ]);

    function buildUseStateTitle(resultObj, target) {
        const codes = classifyTargetState(target).codes;
        const parts = [];
        const ordered = [
            ['MONTH_COMMAND', '临月建'], ['MONTH_BREAK', '月破'], ['MONTH_CONTROL', '月克'], ['MONTH_HARMONY', '月合'], ['MONTH_GENERATE', '月生'], ['MONTH_SUPPORT', '月比扶'],
            ['DAY_COMMAND', '临日辰'], ['DAY_BREAK', '日破'], ['DAY_CONTROL', '日克'], ['DAY_HARMONY', '日合'], ['DAY_GENERATE', '日生'], ['DAY_SUPPORT', '日比扶'],
            ['VOID', '旬空'], ['DARK_MOVING', '暗动']
        ];
        ordered.forEach(([code, text]) => { if (codes.has(code)) parts.push(text); });
        const noun = isObservationSelection(resultObj) ? '观察对象' : '用神';
        if (parts.length) return `${noun}${parts.slice(0, 3).join('、')}`;
        if (target?.type === 'hidden') return `${noun}伏藏`;
        if (target?.moving) return `${noun}发动`;
        return `${noun}静爻`; 
    }

    function buildTargetStateJudgment(resultObj, target) {
        if (!target) return null;
        const roleLabel = `${targetRolePrefix(target)}${targetLabel(target)}`;
        const tags = target.statusTags || [];
        const season = tags.find((tag) => tag.code === 'SEASON_STATE')?.text?.replace(/^月令/, '') || '';
        const monthTexts = tagText(tags.filter((tag) => MONTH_STATUS_CODES.has(tag.code)));
        const dayTexts = tagText(tags.filter((tag) => DAY_STATUS_CODES.has(tag.code)));
        const moveTexts = tagText(target.moveTags || []).filter((text) => text !== '动而有变');
        const displayStart = isObservationSelection(resultObj);
        const sentences = [displayStart ? `${linePositionText(target)}为当前观察对象。` : `${roleLabel}为当前用神。`];
        const calendarParts = calendarRelationText(resultObj, target, 'judgment');
        if (calendarParts.length) {
            calendarParts.forEach((part) => sentences.push(`${part}。`));
        } else {
            const monthClause = [
                season ? `${resultObj?.monthZhi || '月令'}月${target.element}处“${season}”` : '',
                monthTexts.length ? `${target.branch}逢${monthTexts.join('、')}` : ''
            ].filter(Boolean).join('，');
            if (monthClause) sentences.push(`${monthClause}。`);
            if (dayTexts.length) {
                const dayNatural = dayTexts.map((text) => ({
                    '日辰比扶':'日辰对其比扶', '日辰生':'日辰生扶', '日辰克':'日辰克制', '临日辰':'本支临日辰'
                }[text] || text)).join('、');
                sentences.push(`${dayNatural}。`);
            }
            if (hasStatusCode(target, 'VOID')) sentences.push('本爻旬空。');
        }
        if (target.type === 'hidden') {
            const hiddenSource = String(target.sourceText || '').replace(/^伏于/, '伏于').replace(/（[^）]+）$/, '');
            sentences.push(hiddenSource ? `${hiddenSource}。` : `${displayStart ? '当前观察对象' : '当前用神'}为伏神。`);
        } else if (target.moving) {
            const change = target.changedBranch
                ? `，化${target.changedRelation || ''}${target.changedBranch}${target.changedElement || ''}`
                : '';
            sentences.push(`本爻发动${change}${moveTexts.length ? `，动变见${moveTexts.join('、')}` : ''}。`);
        } else if (hasStatusCode(target, 'DARK_MOVING')) {
            sentences.push('本爻为静爻，日冲形成暗动。');
        } else {
            sentences.push('本爻静。');
        }
        const summary = sentences.join('');
        return makeJudgment(
            'use-state',
            buildUseStateTitle(resultObj, target),
            summary,
            [
                `${displayStart ? '当前观察对象' : '当前用神'}：${displayStart ? linePositionText(target) : roleLabel}${target.sourceText ? `；${target.sourceText}` : ''}`, 
                tags.length ? `日月与空破：${tagText(tags).join('、')}` : '',
                target.type === 'hidden' ? '形态：伏神' : target.moving ? `动变：${tagText(target.moveTags).join('、') || '发动而有变'}` : '动静：静爻'
            ],
            [displayStart ? '观察对象' : '用神'],
            100,
            sentences
        );
    }

    function layerPresenceText(entries = []) {
        const labels = [];
        if (entries.some((entry) => entry.layer === 'visible')) labels.push('明爻');
        if (entries.some((entry) => entry.layer === 'changed')) labels.push('变爻');
        if (entries.some((entry) => entry.layer === 'hidden')) labels.push('伏神候选');
        return labels.join('、');
    }

    function roleEntryKey(entry) {
        return `${entry.layer || 'visible'}:${entry.position || 0}:${entry.roleLabel || ''}`;
    }

    function entryPositionLabel(entry) {
        if (!entry) return '';
        const flags = `${entry.isShi ? '（世）' : ''}${entry.isYing ? '（应）' : ''}`;
        return `${entry.label || ''}${flags}`;
    }

    function entryLocatorLabel(entry) {
        if (!entry) return '';
        if (entry.layer === 'changed') return `${entry.label || ''}之变`;
        if (entry.layer === 'hidden') return `${entry.label || ''}下伏`;
        return entryPositionLabel(entry);
    }

    function directRelationNotes(entries = [], oppositeContext = null, resultObj = null) {
        const genericTexts = new Set(['生用神', '克用神', '受用神所生', '受用神所克', '与用神五行比和']);
        const facts = new Map();
        entries.forEach((entry) => {
            (entry.directFacts || []).forEach((fact) => {
                if (!fact?.text) return;
                if (!facts.has(fact.text)) facts.set(fact.text, []);
                facts.get(fact.text).push(entry);
            });
        });
        const grouped = new Map();
        facts.forEach((members, text) => {
            const uniqueMembers = [...new Map(members.map((entry) => [roleEntryKey(entry), entry])).values()];
            const includesOpposite = oppositeContext && uniqueMembers.some((entry) => entry.position === oppositeContext.position && entry.layer === 'visible');
            if (genericTexts.has(text) && uniqueMembers.length === 1 && !includesOpposite) return;
            const key = uniqueMembers.map(roleEntryKey).sort().join('|');
            if (!grouped.has(key)) grouped.set(key, { members:uniqueMembers, texts:[] });
            grouped.get(key).texts.push(text);
        });
        return [...grouped.values()].map(({ members, texts }) => {
            const joined = [...new Set(texts)].map((text) => focusTermText(resultObj, text)).join('并');
            if (members.length === 1) return `${entryLocatorLabel(members[0])}${joined}`;
            const allVisible = members.every((entry) => entry.layer === 'visible');
            const subject = allVisible
                ? (members.length === 2 ? '两爻' : `${members.map(entryPositionLabel).join('、')}`)
                : (members.length === 2 ? '两处' : `${members.map(entryLocatorLabel).join('、')}`);
            return `${subject}均${joined}`;
        });
    }

    function groupVisibleRoleEntries(entries = []) {
        const groups = new Map();
        entries.forEach((entry) => {
            const key = `${entry.relation}|${entry.branch}|${entry.element}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
        });
        return [...groups.values()].map((group) => {
            const first = group[0];
            return `${group.map(entryPositionLabel).join('、')}${first.relation}${first.branch}${first.element}`;
        });
    }

    function buildRoleDistributionSentence(role, element, entries = [], oppositeContext = null, resultObj = null) {
        if (!entries.length) return '';
        const roleText = displayRoleLabel(role, resultObj);
        const visible = entries.filter((entry) => entry.layer === 'visible');
        const changed = entries.filter((entry) => entry.layer === 'changed');
        const hidden = entries.filter((entry) => entry.layer === 'hidden');
        const layerClauses = [];
        if (visible.length) layerClauses.push(`${roleText}${element}见${groupVisibleRoleEntries(visible).join('、')}`);
        if (changed.length) {
            const changedText = changed.map((entry) => `${entry.label}化${entry.relation}${entry.branch}${entry.element}`).join('、');
            layerClauses.push(`${visible.length ? '变爻另见' : `${roleText}${element}见变爻`}${changedText}`);
        }
        if (hidden.length) {
            const hiddenText = hidden.map((entry) => `${entry.label}下伏${entry.relation}${entry.branch}${entry.element}`).join('、');
            layerClauses.push(`${visible.length || changed.length ? '伏神候选另见' : `${roleText}${element}见`}${hiddenText}`);
        }

        const notes = directRelationNotes(entries, oppositeContext, resultObj);
        const oppositeEntry = oppositeContext
            ? visible.find((entry) => entry.position === oppositeContext.position)
            : null;
        if (oppositeEntry && !(oppositeEntry.directFacts || []).length && oppositeContext.details?.length) {
            notes.push(`${entryPositionLabel(oppositeEntry)}${oppositeContext.details.map((text) => focusTermText(resultObj, text)).join('且')}`);
        }

        const darkMoving = visible.filter((entry) => hasStatusCode(entry, 'DARK_MOVING'));
        if (darkMoving.length) {
            if (darkMoving.length === visible.length && visible.length > 1) notes.push(`${darkMoving.length === 2 ? '两爻' : '这些爻'}均带暗动提示`);
            else notes.push(`${darkMoving.map(entryPositionLabel).join('、')}带暗动提示`);
        }
        const voidEntries = visible.filter((entry) => hasStatusCode(entry, 'VOID'));
        if (voidEntries.length) notes.push(`${voidEntries.map(entryPositionLabel).join('、')}旬空`);

        return `${layerClauses.join('；')}${notes.length ? `；${[...new Set(notes)].join('；')}` : ''}。`;
    }

    function buildMovingRelationSentences(resultObj, target, useGodAnalysis, coveredEntries) {
        const moving = (resultObj?.lines || []).filter((line) => line.moving && (target.type === 'hidden' || line.position !== target.position));
        const directFacts = useGodAnalysis?.directMovingFacts || [];
        return moving.map((line) => {
            const originalRole = deityRoleByElement(line.element, useGodAnalysis);
            const changedRole = deityRoleByElement(line.changedElement, useGodAnalysis);
            const facts = directFacts.filter((fact) => fact.sourcePosition === line.position);
            if (!originalRole && !changedRole && !facts.length) return '';
            if (originalRole) coveredEntries.add(`visible:${line.position}:${originalRole}`);
            if (changedRole) coveredEntries.add(`changed:${line.position}:${changedRole}`);
            const base = `${line.label}${line.relation}${line.branch}${line.element}发动${line.changedBranch ? `，变为${line.changedRelation || ''}${line.changedBranch}${line.changedElement || ''}` : ''}`;
            const details = [];
            const visibleFacts = [];
            const changedFacts = [];
            facts.forEach((fact) => {
                const role = fact.sourceLayer === 'changed' ? changedRole : originalRole;
                const duplicate = (role === '元神' && fact.text === '生用神') || (role === '忌神' && fact.text === '克用神');
                if (duplicate) return;
                (fact.sourceLayer === 'changed' ? changedFacts : visibleFacts).push(focusTermText(resultObj, fact.text));
            });
            const visibleUnique = [...new Set(visibleFacts)];
            const changedUnique = [...new Set(changedFacts)];
            if (originalRole) details.push(`本爻为${displayRoleLabel(originalRole, resultObj)}${visibleUnique.length ? `并${visibleUnique.join('、')}` : ''}`);
            else if (visibleUnique.length) details.push(`本爻${visibleUnique.join('、')}`);
            if (changedRole) details.push(`变爻为${displayRoleLabel(changedRole, resultObj)}${changedUnique.length ? `并${changedUnique.join('、')}` : ''}`);
            else if (changedUnique.length) details.push(`变爻${changedUnique.join('、')}`);
            return `${base}${details.length ? `；${details.join('，')}` : ''}。`;
        }).filter(Boolean);
    }

    function hiddenTargetFlyContext(resultObj, target, useGodAnalysis) {
        if (target?.type !== 'hidden') return null;
        const item = (resultObj?.flyingHidden || []).find((entry) => entry.position === target.position
            && entry.hiddenRelation === target.relation && entry.hiddenBranch === target.branch);
        if (!item) return null;
        const fly = `飞神${item.flyRelation}${item.flyBranch}${item.flyElement}`;
        const hidden = `伏神${target.relation}${target.branch}${target.element}`;
        const relationMap = {
            '飞来生伏': `${fly}生${hidden}`,
            '伏去生飞': `${hidden}生${fly}`,
            '飞来克伏': `${fly}克${hidden}`,
            '伏去克飞': `${hidden}克${fly}`,
            '飞伏比和': `${fly}与${hidden}五行比和`
        };
        const details = [];
        if (relationMap[item.relationText]) details.push(relationMap[item.relationText]);
        if (heMap?.[item.flyBranch] === target.branch) details.push(`${item.flyBranch}${target.branch}六合`);
        if (chongMap?.[item.flyBranch] === target.branch) details.push(`${item.flyBranch}${target.branch}六冲`);
        const sentence = `${target.relation}${target.branch}${target.element}伏于${item.label}${item.flyRelation}${item.flyBranch}${item.flyElement}之下${details.length ? `；${details.join('，')}` : ''}。`;
        const covered = (useGodAnalysis?.sourceEntries || [])
            .concat(useGodAnalysis?.tabooEntries || [], useGodAnalysis?.enemyEntries || [])
            .filter((entry) => entry.layer === 'visible' && entry.position === item.position)
            .map(roleEntryKey);
        return { item, sentence, covered, evidence:`飞伏：${item.flyRelation}${item.flyBranch}${item.flyElement} / ${item.hiddenRelation}${item.hiddenBranch}${item.hiddenElement} / ${item.relationText}` };
    }

    function buildUseRelationJudgment(resultObj, target, useGodAnalysis) {
        if (!resultObj || !target || !useGodAnalysis) return null;
        const sentences = [];
        const evidence = [];
        const coveredEntries = new Set();
        const full = resultObj.fullStructure;
        const relationPhrase = shiYingRelationPhrase(full?.shiYing?.tags || []);
        let oppositeContext = null;
        const hiddenFly = hiddenTargetFlyContext(resultObj, target, useGodAnalysis);
        if (hiddenFly) {
            sentences.push(hiddenFly.sentence);
            hiddenFly.covered.forEach((key) => coveredEntries.add(key));
            evidence.push(hiddenFly.evidence);
        }

        if (target.isShi || target.isYing) {
            const oppositeRole = target.isShi ? '应爻' : '世爻';
            const opposite = (resultObj.lines || []).find((line) => target.isShi ? line.isYing : line.isShi);
            if (opposite) {
                const deityRole = deityRoleByElement(opposite.element, useGodAnalysis);
                const relationDetails = shiYingRelationDetails(target, full?.shiYing?.tags || []).map((text) => focusTermText(resultObj, text));
                if (deityRole) {
                    oppositeContext = { position:opposite.position, role:deityRole, details:relationDetails };
                } else if (relationDetails.length) {
                    sentences.push(`${oppositeRole}${opposite.relation}${opposite.branch}${opposite.element}，${relationDetails.join('，')}。`);
                }
                evidence.push(full?.shiYing?.text || '');
                if (relationPhrase) evidence.push(`世应关系：${relationPhrase}`);
            }
        } else if (relationPhrase) {
            sentences.push(`世爻与应爻另见${relationPhrase}。`);
            evidence.push(full?.shiYing?.text || '');
        }

        sentences.push(...buildMovingRelationSentences(resultObj, target, useGodAnalysis, coveredEntries));

        const roleRows = [
            ['元神', useGodAnalysis.sourceElement, useGodAnalysis.sourceEntries || [], useGodAnalysis.sourceLines],
            ['忌神', useGodAnalysis.tabooElement, useGodAnalysis.tabooEntries || [], useGodAnalysis.tabooLines],
            ['仇神', useGodAnalysis.enemyElement, useGodAnalysis.enemyEntries || [], useGodAnalysis.enemyLines]
        ];
        roleRows.forEach(([role, element, entries, lines]) => {
            evidence.push(`${role}${element}：${lines}`);
            const remaining = entries.filter((entry) => !coveredEntries.has(roleEntryKey(entry)));
            if (!remaining.length) return;
            const context = oppositeContext?.role === role ? oppositeContext : null;
            const sentence = buildRoleDistributionSentence(role, element, remaining, context, resultObj);
            if (sentence) sentences.push(sentence);
        });

        if (!sentences.length) {
            if (isObservationSelection(resultObj)) {
                sentences.push(`生扶五行${useGodAnalysis.sourceElement}见于${layerPresenceText(useGodAnalysis.sourceEntries || []) || '当前未见'}；克制五行${useGodAnalysis.tabooElement}见于${layerPresenceText(useGodAnalysis.tabooEntries || []) || '当前未见'}；间接制约五行${useGodAnalysis.enemyElement}见于${layerPresenceText(useGodAnalysis.enemyEntries || []) || '当前未见'}。`);
            } else {
                sentences.push(`元神${useGodAnalysis.sourceElement}见于${layerPresenceText(useGodAnalysis.sourceEntries || []) || '当前未见'}；忌神${useGodAnalysis.tabooElement}见于${layerPresenceText(useGodAnalysis.tabooEntries || []) || '当前未见'}；仇神${useGodAnalysis.enemyElement}见于${layerPresenceText(useGodAnalysis.enemyEntries || []) || '当前未见'}。`);
            }
        }

        const tags = [isObservationSelection(resultObj) ? '生克' : '元忌'];
        if (target.isShi || target.isYing || relationPhrase) tags.push('世应');
        if ((useGodAnalysis.directMovingFacts || []).length) tags.push('动变');
        return makeJudgment(
            'use-relations',
            isObservationSelection(resultObj) ? '观察对象关系链' : '用神关系链',
            sentences.join(''),
            evidence,
            tags,
            90,
            sentences
        );
    }

    function movingLineOwnStructureSentence(resultObj, line) {
        const calendar = calendarRelationText(resultObj, line, 'judgment')
            .filter((part) => !/月.+处“/.test(part));
        const changed = line.changedBranch
            ? `化${line.changedRelation || ''}${line.changedBranch}${line.changedElement || ''}`
            : '';
        let first = `${line.label}${line.relation}${line.branch}${line.element}发动`;
        if (calendar.length) first += `，${calendar.join('，')}`;
        if (changed) first += `，${changed}`;

        const effects = [];
        const extra = [];
        (line.moveTags || []).forEach((tag) => {
            if (!tag?.code || tag.code === 'MOVING_CHANGE') return;
            if (tag.code === 'RETURN_GENERATE') effects.push(`变爻${line.changedBranch}${line.changedElement}回头生${line.branch}${line.element}`);
            else if (tag.code === 'RETURN_CONTROL') effects.push(`变爻${line.changedBranch}${line.changedElement}回头克${line.branch}${line.element}`);
            else if (tag.code === 'RETURN_HARMONY') effects.push(`变爻${line.changedBranch}与本爻${line.branch}回头合`);
            else if (tag.code === 'RETURN_CLASH') effects.push(`变爻${line.changedBranch}与本爻${line.branch}回头冲`);
            else if (tag.code === 'TRANSFORM_PEER') effects.push('本变五行比和');
            else extra.push(tag.text);
        });
        let tail = '';
        if (effects.length) tail += `；${effects.join('，')}`;
        if (extra.length) tail += `${effects.length ? '，' : '；'}并见${[...new Set(extra)].join('、')}`;
        return `${first}${tail}。`;
    }

    function darkMovingStructureSentences(resultObj, target) {
        const darkLines = (resultObj?.lines || []).filter((line) => !line.moving && hasStatusCode(line, 'DARK_MOVING') && line.position !== target?.position);
        if (!darkLines.length) return [];
        const groups = new Map();
        darkLines.forEach((line) => {
            const key = `${line.relation}|${line.branch}|${line.element}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(line);
        });
        return [...groups.values()].map((group) => {
            const first = group[0];
            const labels = group.map((line) => line.label).join('、');
            const subject = `${labels}${first.relation}${first.branch}${first.element}`;
            return `${subject}${group.length > 1 ? '均' : ''}受日辰【${resultObj?.dayZhi || '—'}】冲，带暗动提示。`;
        });
    }

    function buildWholeStructureJudgment(resultObj, target) {
        const full = resultObj?.fullStructure;
        if (!full) return null;
        const complete = full.sanHe?.complete || [];
        const deferred = full.sanHe?.deferred || [];
        const pending = full.sanHe?.pending || [];
        const fanFu = full.fanFu || [];
        const movingLines = (resultObj?.lines || []).filter((line) => line.moving);
        const darkSentences = darkMovingStructureSentences(resultObj, target);
        const specialNature = full.originalNatureCode !== 'NEUTRAL' || full.changedNatureCode !== 'NEUTRAL';
        if (!specialNature && !complete.length && !deferred.length && !pending.length && !fanFu.length && !movingLines.length && !darkSentences.length) return null;

        const summaryBits = [];
        const staticHexagram = !movingLines.length;
        movingLines.forEach((line) => summaryBits.push(movingLineOwnStructureSentence(resultObj, line).replace(/。$/,'')));
        darkSentences.forEach((text) => summaryBits.push(text.replace(/。$/,'')));
        if (staticHexagram) {
            if (full.originalNatureCode !== 'NEUTRAL') summaryBits.push(`本卦为${full.originalNature}，当前为静卦`);
            else summaryBits.push('当前为静卦，本卦不属六冲、六合');
        } else if (full.originalNatureCode !== 'NEUTRAL' && full.changedNatureCode !== 'NEUTRAL') {
            summaryBits.push(`本卦为${full.originalNature}，变卦为${full.changedNature}`);
        } else if (full.originalNatureCode !== 'NEUTRAL') {
            summaryBits.push(`本卦为${full.originalNature}；变卦不属六冲、六合`);
        } else if (full.changedNatureCode !== 'NEUTRAL') {
            summaryBits.push(`本卦不属六冲、六合，变卦为${full.changedNature}`);
        }
        if (complete.length) summaryBits.push(`三合结构见${complete.join('、')}`);
        else if (deferred.length) summaryBits.push(`三合待实见${deferred.join('、')}`);
        else if (pending.length) summaryBits.push(`三合待补见${pending.join('、')}`);
        if (fanFu.length) summaryBits.push(`另见${fanFu.join('、')}`);
        const evidence = [];
        movingLines.forEach((line) => evidence.push(`${line.label}动变：${line.relation}${line.branch}${line.element} → ${line.changedRelation || ''}${line.changedBranch}${line.changedElement || ''}${line.moveTags?.length ? `；${tagText(line.moveTags).join('、')}` : ''}`));
        darkSentences.forEach((text) => evidence.push(`暗动：${text}`));
        if (specialNature) evidence.push(`六合／六冲：${full.transition}`);
        if (complete.length) evidence.push(`三合结构：${complete.join('、')}`);
        else if (deferred.length) evidence.push(`三合待实：${deferred.join('、')}`);
        else if (pending.length) evidence.push(`三合待补：${pending.join('、')}`);
        if (fanFu.length) evidence.push(`反吟／伏吟：${fanFu.join('、')}`);

        return makeJudgment(
            'whole-structure',
            '动变与卦体结构',
            `${summaryBits.join('；')}。`,
            evidence,
            ['全卦'],
            80,
            summaryBits.map((item) => `${item}。`)
        );
    }

    function buildHeadline(resultObj, target, useGodAnalysis, judgments) {
        if (!resultObj || !target) return '尚未确认用神或观察对象。';
        const clauses = [];
        const state = classifyTargetState(target);
        const roleLabel = `${targetRolePrefix(target)}${targetLabel(target)}`;
        if (state.codes.has('MONTH_BREAK') || state.codes.has('MONTH_CONTROL')) clauses.push(`${roleLabel}受月建制约`);
        else if (state.codes.has('DAY_CONTROL') || state.codes.has('DAY_BREAK')) clauses.push(`${roleLabel}受日辰制约`);
        else if (state.codes.has('VOID')) clauses.push(`${roleLabel}见旬空`);
        else if (state.support.length) clauses.push(`${roleLabel}得日月扶助`);
        else clauses.push(roleLabel);

        if (target.isShi || target.isYing) {
            const opposite = (resultObj.lines || []).find((line) => target.isShi ? line.isYing : line.isShi);
            const deityRole = opposite ? deityRoleByElement(opposite.element, useGodAnalysis) : '';
            const relationPhrase = shiYingRelationPhrase(resultObj.fullStructure?.shiYing?.tags || []);
            if (deityRole && opposite) clauses.push(`${deityRole}落${target.isShi ? '应爻' : '世爻'}${relationPhrase ? `并与${isObservationSelection(resultObj) ? '当前观察对象' : '用神'}${relationPhrase}` : ''}`);
            else if (relationPhrase) clauses.push(`世应见${relationPhrase}`);
        } else if ((useGodAnalysis?.directMovingFacts || []).length) {
            clauses.push(`动爻与变爻进入${isObservationSelection(resultObj) ? '观察对象' : '用神'}关系链`);
        }

        const full = resultObj.fullStructure;
        const wholeBits = [];
        if (full?.originalNatureCode !== 'NEUTRAL') wholeBits.push(full.originalNature);
        if (full?.sanHe?.complete?.length) wholeBits.push('三合成局');
        else if (full?.sanHe?.deferred?.length) wholeBits.push('三合待实');
        else if (full?.sanHe?.pending?.length) wholeBits.push('三合待补');
        if (full?.fanFu?.length) wholeBits.push('反吟／伏吟');
        if (wholeBits.length) clauses.push(`卦体另见${wholeBits.slice(0, 2).join('、')}`);
        return `${clauses.slice(0, 3).join('；')}。`;
    }

    function buildLiuYaoInterpretation(resultObj, target, useGodAnalysis, timingCandidates = []) {
        if (!resultObj) return {
            headline: '尚未生成六爻排盘。',
            judgments: [],
            limitations: []
        };
        if (!target) return {
            headline: '尚未确认用神或观察对象。',
            judgments: [],
            limitations: []
        };

        const judgments = [
            buildTargetStateJudgment(resultObj, target),
            buildUseRelationJudgment(resultObj, target, useGodAnalysis),
            buildWholeStructureJudgment(resultObj, target)
        ].filter(Boolean);
        return {
            headline: buildHeadline(resultObj, target, useGodAnalysis, judgments),
            judgments,
            limitations: []
        };
    }

    function isStaticHexagram(resultObj) {
        return !(resultObj?.lines || []).some((line) => line.moving);
    }

    function compactLiuYaoLiteratureForContext(literature = []) {
        const preferredKeys = ['darkMoving', 'void', 'sanHe', 'fanFu', 'progressRetreat', 'moving', 'hexHarmony', 'hexClash', 'useGod', 'shiYing', 'flyingHidden', 'jingPalace'];
        const firstByKey = new Map();
        const fallback = [];
        (literature || []).forEach((item) => {
            if (item?.matchKey) {
                if (!firstByKey.has(item.matchKey)) firstByKey.set(item.matchKey, item);
            } else {
                fallback.push(item);
            }
        });
        const selected = preferredKeys.map((key) => firstByKey.get(key)).filter(Boolean);
        fallback.forEach((item) => {
            if (selected.length < 7) selected.push(item);
        });
        return selected
            .slice(0, 7)
            .map((item) => ({ ...item, contextMatch: item.match || item.contextMatch || '' }));
    }

    function hexagramNaturePhrase(subject, nature) {
        const value = nature || '非六冲六合卦';
        return value.startsWith('非') ? `${subject}${value}` : `${subject}为${value}`;
    }

    function buildCompactStructureFactLines(resultObj) {
        const full = resultObj?.fullStructure;
        if (!full) return [];
        const staticHexagram = isStaticHexagram(resultObj);
        const lines = [];
        const originalNature = full.originalNature || '非六冲六合卦';
        const changedNature = full.changedNature || originalNature;
        if (staticHexagram) {
            lines.push(`卦体：${hexagramNaturePhrase('本卦', originalNature)}；静卦`);
        } else if (originalNature === changedNature) {
            lines.push(`卦体：${originalNature.startsWith('非') ? `本卦、变卦均${originalNature}` : `本卦、变卦均为${originalNature}`}`);
        } else {
            lines.push(`卦体：${hexagramNaturePhrase('本卦', originalNature)}，${hexagramNaturePhrase('变卦', changedNature)}`);
        }
        lines.push(compactShiYingFactLine(full.shiYing));
        if (!staticHexagram && full.sanHe?.complete?.length) lines.push(`三合结构：${full.sanHe.complete.join('、')}`);
        else if (!staticHexagram && full.sanHe?.deferred?.length) lines.push(`三合待实：${full.sanHe.deferred.join('、')}`);
        else if (!staticHexagram && full.sanHe?.pending?.length) lines.push(`三合待补：${full.sanHe.pending.join('、')}`);
        if (!staticHexagram && full.fanFu?.length) lines.push(`反吟／伏吟：${full.fanFu.join('、')}`);
        return lines;
    }

    function buildLiuYaoContextText(resultObj, target, useGodAnalysis, interpretation, timingCandidates = [], literature = [], questionTimeFocus = null) {
        if (!resultObj) return '';
        const lines = [];
        const add = (text = '') => lines.push(text);
        const staticHexagram = isStaticHexagram(resultObj);
        add('【龟甲 · 六爻分析上下文】');
        add(`所占之事：${resultObj.question || '未填写'}`);
        add(`起卦时间：${resultObj.solarText || '—'}`);
        add(`农历：${resultObj.lunarText || '—'}`);
        add(`月建日辰：${resultObj.monthGanZhi || '—'}月 · ${resultObj.dayGanZhi || '—'}日`);
        add(`日辰换日：${resultObj.dayChangeLabel || '24:00 换日（默认）'}`);
        add(`旬空：${resultObj.xunKong || '—'}`);
        add(`本卦：${resultObj.original?.symbol || ''} ${resultObj.original?.name || '—'}（第${resultObj.original?.number || '—'}卦）`);
        add(staticHexagram
            ? '变卦：无独立变卦（静卦）'
            : `变卦：${resultObj.changed?.symbol || ''} ${resultObj.changed?.name || '—'}（第${resultObj.changed?.number || '—'}卦）`);
        add(`八宫：${resultObj.palace?.palace || '—'}宫 · ${resultObj.palace?.stage || '—'} · 五行${resultObj.palace?.element || '—'}`);
        add(`动爻：${resultObj.movingText || '—'}`);
        add('');

        const travelSelection = resultObj?.useGodSelection?.focusId === 'travel';
        add(travelSelection ? '【主要观察爻】' : '【当前用神／观察对象】');
        if (target) {
            const movementText = target.type === 'hidden' ? '伏神' : target.moving ? '发动' : hasStatusCode(target, 'DARK_MOVING') ? '静爻（暗动提示）' : '静爻';
            const targetLine = (resultObj.lines || []).find((line) => line.position === target.position);
            const basePositionLabel = targetLine?.label || String(target.label || `${target.position || '—'}爻`).split(' · ')[0].replace(/（世）|（应）|（动）/g, '').trim();
            const positionText = target.type === 'hidden'
                ? `${basePositionLabel}下伏`
                : `${basePositionLabel}${target.isShi ? '（世）' : ''}${target.isYing ? '（应）' : ''}`;
            add(travelSelection
                ? `${positionText}${targetLabel(target)}；${target.sourceText || '—'}；${movementText}`
                : `${targetLabel(target)}；${positionText}；${target.sourceText || '—'}；${movementText}`);
            const sameRelation = sameRelationDistributionText(useGodAnalysis, target, staticHexagram);
            if (sameRelation) add(`同类六亲分布：${sameRelation}`);
            const statusTexts = tagText(target.statusTags);
            const moveTexts = tagText(target.moveTags);
            const calendarParts = calendarRelationText(resultObj, target, 'context');
            add(`日月状态：${calendarParts.length ? `${calendarParts.join('；')}。` : (statusTexts.length ? statusTexts.join('、') : '无额外特殊标签')}`);
            if (target.moving) add(`动变关系：${moveTexts.length ? moveTexts.join('、') : '动而有变'}`);
            const selection = resultObj.useGodSelection || null;
            const concreteTargetText = `${positionText}${targetLabel(target)}`;
            if (selection?.mode === 'focus' && selection.focusLabel) {
                if (selection.focusId === 'travel') {
                    add(`选择方式：按观察重点“${selection.focusLabel}”选择当前观察对象；当前以世爻观察自身状态，并参考应爻与行程结构。`);
                } else if (selection.specificity === 'display-start' && selection.candidateCount > 1) {
                    add(`选择方式：按观察重点“${selection.focusLabel}”确定【${selection.target}】类别；本卦有${formatNaturalCount(selection.candidateCount)}处候选，当前以${concreteTargetText}作为展示起点，同类候选完整保留在盘面中。`);
                } else {
                    add(`选择方式：按观察重点“${selection.focusLabel}”选择当前观察对象。`);
                }
            } else if (selection?.mode === 'suggestion' && selection.target) {
                if (selection.focusId === 'travel') {
                    add(`选择方式：占问文字高置信识别为【出行、旅行与行程】；当前以世爻作为主要观察对象，并参考应爻与行程结构。`);
                } else if (selection.focusId === 'lost-item') {
                    if (selection.specificity === 'display-start' && selection.candidateCount > 1) {
                        add(`选择方式：占问文字高置信识别为【失物与寻找】；取用类别为【妻财】，本卦有${formatNaturalCount(selection.candidateCount)}处候选，当前以${concreteTargetText}作为展示起点，同类候选完整保留在盘面中。`);
                    } else {
                        add(`选择方式：占问文字高置信识别为【失物与寻找】；当前以${concreteTargetText}作为主要观察对象。`);
                    }
                } else if (selection.specificity === 'display-start' && selection.candidateCount > 1) {
                    add(`选择方式：取用类别由占问文字高置信识别为【${selection.target}】；本卦有${formatNaturalCount(selection.candidateCount)}处${selection.target}候选，当前以${concreteTargetText}作为展示起点，同类候选完整保留在盘面中。`);
                } else {
                    add(`选择方式：取用类别由占问文字高置信识别为【${selection.target}】；当前以${concreteTargetText}作为主要观察对象。`);
                }
            } else if (selection?.mode === 'manual') {
                add('选择方式：手动选择具体观察爻。');
            } else if (selection?.mode === 'default') {
                add('选择方式：占问未形成明确取用建议，当前暂以世爻作为展示起点。');
            } else if (!String(resultObj.question || '').trim()) {
                add('选择方式：当前观察对象为人工选定。');
            }
        } else add('尚未确认用神。');
        if (useGodAnalysis) {
            if (travelSelection) {
                add(`围绕主观察爻的生扶五行：${useGodAnalysis.sourceElement}；${contextRoleDistribution(useGodAnalysis.sourceLines, staticHexagram)}`);
                add(`围绕主观察爻的克制五行：${useGodAnalysis.tabooElement}；${contextRoleDistribution(useGodAnalysis.tabooLines, staticHexagram)}`);
                add(`生克链中的间接制约五行：${useGodAnalysis.enemyElement}；${contextRoleDistribution(useGodAnalysis.enemyLines, staticHexagram)}`);
            } else {
                add(`元神：${useGodAnalysis.sourceElement}；${contextRoleDistribution(useGodAnalysis.sourceLines, staticHexagram)}`);
                add(`忌神：${useGodAnalysis.tabooElement}；${contextRoleDistribution(useGodAnalysis.tabooLines, staticHexagram)}`);
                add(`仇神：${useGodAnalysis.enemyElement}；${contextRoleDistribution(useGodAnalysis.enemyLines, staticHexagram)}`);
            }
        }
        add('');

        if (questionTimeFocus?.kind === 'range') {
            add('【目标时间范围】');
            add(`${questionTimeFocus.title}`);
            add(`分析方式：${questionTimeFocus.modeLabel}；${questionTimeFocus.note}`);
            if (questionTimeFocus.comparisonBasisNote) add(questionTimeFocus.comparisonBasisNote);
            if (questionTimeFocus.comparison?.summary) add(`比较结果：${questionTimeFocus.comparison.summary}`);
            if (questionTimeFocus.keyNodes?.length) {
                add('关键节点：');
                questionTimeFocus.keyNodes.forEach((entry) => {
                    add(`- ${entry.title}`);
                    if (entry.assessment?.text) add(`  - 日期判断：${ensureSentenceEnd(entry.assessment.text)}`);
                    if (entry.effectSummary) add(`  - 节点效力：${ensureSentenceEnd(entry.effectSummary)}`);
                    (entry.facts || []).forEach((fact) => add(`  - ${ensureSentenceEnd(fact)}`));
                });
            } else {
                add('当前范围内未提取到高区分度的结构节点。');
            }
            add('');
        } else if (questionTimeFocus?.entries?.length) {
            add('【目标时点】');
            if (questionTimeFocus.comparisonBasisNote) add(questionTimeFocus.comparisonBasisNote);
            if (questionTimeFocus.comparison?.summary) add(`比较结果：${questionTimeFocus.comparison.summary}`);
            questionTimeFocus.entries.forEach((entry) => {
                add(`- ${entry.title}`);
                if (entry.assessment?.text) add(`  - 日期判断：${ensureSentenceEnd(entry.assessment.text)}`);
                if (entry.effectSummary) add(`  - 节点效力：${ensureSentenceEnd(entry.effectSummary)}`);
                (entry.facts || []).forEach((fact) => add(`  - ${ensureSentenceEnd(fact)}`));
            });
            add('');
        }

        add('【结构解读】');
        (interpretation?.judgments || []).forEach((item, index) => {
            add(`${index + 1}. ${item.title}`);
            add(`   ${item.summary}`);
        });
        add('');

        add('【逐爻状态】');
        (resultObj.displayLines || []).forEach((line) => {
            const positions = `${line.label}${line.isShi ? '（世）' : ''}${line.isYing ? '（应）' : ''}`;
            const spirit = line.spirit ? ` · ${line.spirit}` : '';
            const status = tagText(line.statusTags).join('、') || '无额外特殊标签';
            let text = `${positions}${spirit}：${line.relation}${line.branch}${line.element}；${status}`;
            if (line.moving) {
                const moves = tagText(line.moveTags).join('、') || '动而有变';
                text += `；动 → ${line.changedRelation}${line.changedBranch}${line.changedElement}；${moves}`;
            }
            add(`- ${text}`);
        });
        add('');

        const hiddenCandidates = (resultObj.flyingHidden || []).filter((item) => item.candidate);
        if (hiddenCandidates.length) {
            add('【飞伏】');
            hiddenCandidates.forEach((item) => {
                const status = tagText(item.statusTags).join('、');
                add(`- ${item.label}：飞神${item.flyRelation}${item.flyBranch}${item.flyElement}；伏神${item.hiddenRelation}${item.hiddenBranch}${item.hiddenElement}；${item.relationText}${status ? `；伏神状态：${status}` : ''}`);
            });
            add('');
        }

        add('【结构事实】');
        buildCompactStructureFactLines(resultObj).forEach(add);
        add('');

        if (timingCandidates.length && questionTimeFocus?.kind !== 'range' && !questionTimeFocus?.suppressTimingCandidates) {
            add('【应期观察】');
            timingCandidates.forEach((item) => {
                add(`- ${item.contextTitle || item.title}`);
                if (item.triggers?.length) item.triggers.forEach((trigger) => add(`  - ${trigger.label}：${trigger.reason}`));
                else if (item.reason) add(`  ${item.reason}`);
                const dates = item.contextDates?.length ? item.contextDates : item.dates;
                if (dates?.length) add(`  日期：${dates.join('、')}`);
            });
            add('');
        }

        add('【古籍参考】');
        const compactLiterature = compactLiuYaoLiteratureForContext(literature);
        buildLiteratureContextLines(compactLiterature, '当前暂无直接相关的古籍文段或条目定位。').forEach(add);
        add('');

        add('【使用要求】');
        add('请只基于以上已列六爻结构进行综合解释；不要自行重排卦象，不要虚构盘中不存在的日月、动变、世应、飞伏或古籍原文。');
        return lines.join('\n');
    }

    GuiJia.liuyaoInterpretation = {
        buildLiuYaoInterpretation,
        buildLiuYaoContextText,
        classifyTargetState
    };
})(window);
