(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};

    GuiJia.createIChingLoader = function createIChingLoader(ref, reactive) {
        const ichingTextRecords = ref([]);
        const ichingTextState = reactive({ loading: true, error: '', source: '' });
        const ICHING_TEXT_LOCAL_URL = './data/iching.json';
        const ICHING_TEXT_REMOTE_URL = 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/iching/iching.json';
        const ICHING_TEXT_CACHE_KEY = 'guijia:iching-text:v1';
        const isValidIChingData = (data) => Array.isArray(data) && data.length >= 64;
        const readIChingCache = () => {
            try {
                const raw = window.localStorage.getItem(ICHING_TEXT_CACHE_KEY);
                if (!raw) return null;
                const data = JSON.parse(raw);
                return isValidIChingData(data) ? data : null;
            } catch (error) {
                console.warn('读取周易经文缓存失败', error);
                return null;
            }
        };
        const writeIChingCache = (data) => {
            try {
                window.localStorage.setItem(ICHING_TEXT_CACHE_KEY, JSON.stringify(data));
            } catch (error) {
                console.warn('写入周易经文缓存失败', error);
            }
        };
        const fetchIChingData = async (url, cacheMode = 'default') => {
            const response = await fetch(url, { cache: cacheMode });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!isValidIChingData(data)) throw new Error('经文数据不完整');
            return data;
        };
        const loadIChingTexts = async () => {
            ichingTextState.loading = true;
            ichingTextState.error = '';
            ichingTextState.source = '';

            // GitHub Pages / HTTP 环境优先读取站内 data/iching.json。
            if (window.location.protocol !== 'file:') {
                try {
                    const localData = await fetchIChingData(ICHING_TEXT_LOCAL_URL, 'force-cache');
                    ichingTextRecords.value = localData;
                    ichingTextState.source = 'local';
                    writeIChingCache(localData);
                    ichingTextState.loading = false;
                    return;
                } catch (error) {
                    console.info('站内周易经文数据不可用，继续读取缓存或远程来源', error);
                }
            }

            const cachedData = readIChingCache();
            if (cachedData) {
                ichingTextRecords.value = cachedData;
                ichingTextState.source = 'cache';
                ichingTextState.loading = false;
                return;
            }

            try {
                const remoteData = await fetchIChingData(ICHING_TEXT_REMOTE_URL, 'force-cache');
                ichingTextRecords.value = remoteData;
                ichingTextState.source = 'remote';
                writeIChingCache(remoteData);
            } catch (error) {
                console.warn('读取周易经文失败', error);
                ichingTextState.error = '未能读取《周易》经文数据；排盘和纳甲结构不受影响。';
            } finally {
                ichingTextState.loading = false;
            }
        };
        void loadIChingTexts();
        return { ichingTextRecords, ichingTextState, loadIChingTexts };
    };
})(window);
