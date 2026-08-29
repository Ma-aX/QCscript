// ==UserScript==
// @name         Контроль Качества
// @namespace    https://forum.blackrussia.online
// @version      2.0
// @description  Для борьбы с форумом
// @author       @axxaxax55
// @match        https://forum.blackrussia.online/*
// @grant        none
// @license      MIT
// @icon         https://icons.iconarchive.com/icons/thesquid.ink/free-flat-sample/128/support-icon.png
// @downloadURL  https://update.greasyfork.org/scripts/451251/%D0%9A%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8C%20%D0%9A%D0%B0%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%B0%20%7C%20%D0%9F%D0%9A.user.js
// @updateURL    https://update.greasyfork.org/scripts/451251/%D0%9A%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8C%20%D0%9A%D0%B0%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%B0%20%7C%20%D0%9F%D0%9A.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // ============= ДЕБАГГЕР =============
    const DEBUG = true;
    function log(msg, data) {
        if (DEBUG) {
            if (data) {
                console.log(`[QC] ${msg}`, data);
            } else {
                console.log(`[QC] ${msg}`);
            }
        }
    }
    log('Скрипт запущен');

    // ============= STORAGE =============
    const Storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                if (item === null) return defaultValue;
                try { return JSON.parse(item); } catch (e) { return item; }
            } catch (e) { return defaultValue; }
        },
        set(key, value) {
            try {
                const val = typeof value === 'object' ? JSON.stringify(value) : value;
                localStorage.setItem(key, val);
            } catch (e) {}
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    };
    log('Storage инициализирован');

    // ============= НАСТРОЙКИ =============
    const THEME_KEY = 'qc_theme';
    const BG_IMAGE_KEY = 'qc_bg_image';
    const SAVED_TEXT_KEY = 'qc_saved_text';
    const SAVED_BTN_KEY = 'qc_saved_btn';
    const SAVED_DATA_KEY = 'qc_saved_data';
    const SAVED_REASON_KEY = 'qc_saved_reason';
    const SAVED_TEMPLATE_KEY = 'qc_saved_template';
    const CUSTOM_COLOR_KEY = 'qc_custom_color';

    let currentTheme = Storage.get(THEME_KEY, 'default');
    let customBgImage = Storage.get(BG_IMAGE_KEY, null);
    let customColor = Storage.get(CUSTOM_COLOR_KEY, null);

    log('Текущая тема:', currentTheme);
    log('Кастомный фон:', customBgImage ? 'установлен' : 'не установлен');
    log('Кастомный цвет:', customColor || 'не установлен');

    // ============= ОПРЕДЕЛЕНИЕ МОБИЛЬНОГО УСТРОЙСТВА =============
    function isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
        return mobileRegex.test(userAgent);
    }

    // ============= ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ =============
    function getCurrentUsername() {
        const usernameEl = document.querySelector('.memberHeader-name .username') ||
                          document.querySelector('.p-navgroup-linkText') ||
                          document.querySelector('.username--style40') ||
                          document.querySelector('.username--style41') ||
                          document.querySelector('.p-navgroup-link--user .username');

        if (usernameEl) {
            return usernameEl.textContent.trim();
        }

        const userLink = document.querySelector('.memberHeader-name a.username');
        if (userLink) {
            return userLink.textContent.trim();
        }

        return 'Гость';
    }

    // ============= ПРОВЕРКА ПРАВ ПОЛЬЗОВАТЕЛЯ =============
    function checkUserPermissions() {
        const banners = document.querySelectorAll('.memberHeader-banners .userBanner, .userBanner');
        for (let banner of banners) {
            const text = banner.textContent.trim();
            if (text.includes('Контроль качества') || text.includes('Глава контроля качества') || text.includes('Зам. главного тестировщика') || text.includes('Команда проекта')) {
                return true;
            }
        }

        const userLinks = document.querySelectorAll('.p-navgroup-linkText, .username, .memberHeader-name .username');
        for (let link of userLinks) {
            const classes = link.className;
            if (classes && (classes.includes('username--style40') || classes.includes('username--style41'))) {
                return true;
            }
        }

        const userNav = document.querySelector('.p-navgroup-link--user');
        if (userNav) {
            const badge = userNav.getAttribute('data-badge');
            if (badge && (badge.includes('40') || badge.includes('41'))) {
                return true;
            }
        }

        return false;
    }

    // ============= КОНСТАНТЫ =============
    const RASSMOTRENO_PREFIX = 9;
    const NARASSMOTRENII_PREFIX = 2;
    const QCUN_PREFIX = 15;
    const OBRATNOTECH_PREFIX = 13;
    const TECH_PREFIX = 13;
    const ARCHIVE_NODE = 230;
    const TECH_RETURN_NODE = 917;

    // ID разделов серверов
    const S1 = 226, S2 = 227, S3 = 228, S4 = 229, S5 = 245, S6 = 325, S7 = 365, S8 = 396, S9 = 408, S10 = 488;
    const S11 = 493, S12 = 554, S13 = 613, S14 = 653, S15 = 660, S16 = 701, S17 = 757, S18 = 815, S19 = 857, S20 = 925;
    const S21 = 1007, S22 = 1048, S23 = 1052, S24 = 1095, S25 = 1138, S26 = 1248, S27 = 1290, S28 = 1292, S29 = 1334, S30 = 1416;
    const S31 = 1458, S32 = 1460, S33 = 1502, S34 = 1544, S35 = 1586, S36 = 1628, S37 = 1670, S38 = 1712, S39 = 1758, S40 = 1800;
    const S41 = 1842, S42 = 1884, S43 = 1926, S44 = 1968, S45 = 2010, S46 = 2052, S47 = 2094, S48 = 2136, S49 = 2178, S50 = 2220;
    const S51 = 2262, S52 = 2304, S53 = 2346, S54 = 2388, S55 = 2430, S56 = 2472, S57 = 2514, S58 = 2516, S59 = 2598, S60 = 2639;
    const S61 = 2682, S62 = 2714, S63 = 2747, S64 = 2779, S65 = 2811, S66 = 2843, S67 = 2875, S68 = 2907, S69 = 2939, S70 = 2971;
    const S71 = 3003, S72 = 3035, S73 = 3289, S74 = 3324, S75 = 3359, S76 = 3394, S77 = 3429, S78 = 3464, S79 = 3499, S80 = 3535;
    const S81 = 3570, S82 = 3605, S83 = 3643, S84 = 3740, S85 = 3747, S86 = 3812, S87 = 3817, S88 = 3912, S89 = 3978, S90 = 3985, S91 = 4020;

    // Маппинг серверов
    const SERVER_MAP = {
        [S1]: { name: 'RED', id: 1 },
        [S2]: { name: 'GREEN', id: 2 },
        [S3]: { name: 'BLUE', id: 3 },
        [S4]: { name: 'YELLOW', id: 4 },
        [S5]: { name: 'ORANGE', id: 5 },
        [S6]: { name: 'PURPLE', id: 6 },
        [S7]: { name: 'LIME', id: 7 },
        [S8]: { name: 'PINK', id: 8 },
        [S9]: { name: 'CHERRY', id: 9 },
        [S10]: { name: 'BLACK', id: 10 },
        [S11]: { name: 'INDIGO', id: 11 },
        [S12]: { name: 'WHITE', id: 12 },
        [S13]: { name: 'MAGENTA', id: 13 },
        [S14]: { name: 'CRIMSON', id: 14 },
        [S15]: { name: 'GOLD', id: 15 },
        [S16]: { name: 'AZURE', id: 16 },
        [S17]: { name: 'PLATINUM', id: 17 },
        [S18]: { name: 'AQUA', id: 18 },
        [S19]: { name: 'GRAY', id: 19 },
        [S20]: { name: 'ICE', id: 20 },
        [S21]: { name: 'CHILLI', id: 21 },
        [S22]: { name: 'CHOCO', id: 22 },
        [S23]: { name: 'MOSCOW', id: 23 },
        [S24]: { name: 'SPB', id: 24 },
        [S25]: { name: 'UFA', id: 25 },
        [S26]: { name: 'SOCHI', id: 26 },
        [S27]: { name: 'KAZAN', id: 27 },
        [S28]: { name: 'SAMARA', id: 28 },
        [S29]: { name: 'ROSTOV', id: 29 },
        [S30]: { name: 'ANAPA', id: 30 },
        [S31]: { name: 'EKB', id: 31 },
        [S32]: { name: 'KRASNODAR', id: 32 },
        [S33]: { name: 'ARZAMAS', id: 33 },
        [S34]: { name: 'NOVOSIBIRSK', id: 34 },
        [S35]: { name: 'GROZNY', id: 35 },
        [S36]: { name: 'SARATOV', id: 36 },
        [S37]: { name: 'OMSK', id: 37 },
        [S38]: { name: 'IRKUTSK', id: 38 },
        [S39]: { name: 'VOLGOGRAD', id: 39 },
        [S40]: { name: 'VORONEZH', id: 40 },
        [S41]: { name: 'BELGOROD', id: 41 },
        [S42]: { name: 'MAKHACHKALA', id: 42 },
        [S43]: { name: 'VLADIKAVKAZ', id: 43 },
        [S44]: { name: 'VLADIVOSTOK', id: 44 },
        [S45]: { name: 'KALININGRAD', id: 45 },
        [S46]: { name: 'CHELYABINSK', id: 46 },
        [S47]: { name: 'KRASNOYARSK', id: 47 },
        [S48]: { name: 'CHEBOKSARY', id: 48 },
        [S49]: { name: 'KHABAROVSK', id: 49 },
        [S50]: { name: 'PERM', id: 50 },
        [S51]: { name: 'TULA', id: 51 },
        [S52]: { name: 'RYAZAN', id: 52 },
        [S53]: { name: 'MURMANSK', id: 53 },
        [S54]: { name: 'PENZA', id: 54 },
        [S55]: { name: 'KURSK', id: 55 },
        [S56]: { name: 'ARKHANGELSK', id: 56 },
        [S57]: { name: 'ORENBURG', id: 57 },
        [S58]: { name: 'KIROV', id: 58 },
        [S59]: { name: 'KEMEROVO', id: 59 },
        [S60]: { name: 'TYUMEN', id: 60 },
        [S61]: { name: 'TOLLYATTI', id: 61 },
        [S62]: { name: 'IVANOVO', id: 62 },
        [S63]: { name: 'STAVROPOL', id: 63 },
        [S64]: { name: 'SMOLENSK', id: 64 },
        [S65]: { name: 'PSKOV', id: 65 },
        [S66]: { name: 'BRYANSK', id: 66 },
        [S67]: { name: 'OREL', id: 67 },
        [S68]: { name: 'YAROSLAVL', id: 68 },
        [S69]: { name: 'BARNAUL', id: 69 },
        [S70]: { name: 'LIPETSK', id: 70 },
        [S71]: { name: 'ULYANOVSK', id: 71 },
        [S72]: { name: 'YAKUTSK', id: 72 },
        [S73]: { name: 'TAMBOV', id: 73 },
        [S74]: { name: 'BRATSK', id: 74 },
        [S75]: { name: 'ASTRAKHAN', id: 75 },
        [S76]: { name: 'CHITA', id: 76 },
        [S77]: { name: 'KOSTROMA', id: 77 },
        [S78]: { name: 'VLADIMIR', id: 78 },
        [S79]: { name: 'KALUGA', id: 79 },
        [S80]: { name: 'NOVGOROD', id: 80 },
        [S81]: { name: 'TAGANROG', id: 81 },
        [S82]: { name: 'VOLOGDA', id: 82 },
        [S83]: { name: 'TVER', id: 83 },
        [S84]: { name: 'TOMSK', id: 84 },
        [S85]: { name: 'IZHEVSK', id: 85 },
        [S86]: { name: 'SURGUT', id: 86 },
        [S87]: { name: 'PODOLSK', id: 87 },
        [S88]: { name: 'MAGADAN', id: 88 },
        [S89]: { name: 'CHEREPOVETS', id: 89 },
        [S90]: { name: 'NORILSK', id: 90 },
        [S91]: { name: 'ASTANA', id: 91 }
    };

    // ============= API =============
    const ForumAPI = {
        async post(endpoint, data = {}) {
            const formData = new FormData();
            formData.append('_xfToken', XF.config.csrf);
            formData.append('_xfRequestUri', window.location.pathname);
            formData.append('_xfWithData', 1);
            formData.append('_xfResponseType', 'json');

            Object.entries(data).forEach(([key, value]) => formData.append(key, value));

            const response = await fetch(endpoint, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(response.status);
            return await response.json();
        },

        async searchThreads(authorName, prefixId) {
            const searchUrl = `https://forum.blackrussia.online/search/search?search_type=thread&c[users]=${encodeURIComponent(authorName)}&c[prefix_id]=${prefixId}&c[newer_than]=weeks`;
            const response = await fetch(searchUrl, {
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!response.ok) throw new Error(response.status);
            return await response.text();
        },

        async getModeratorLogs(threadId) {
            const url = `https://forum.blackrussia.online/threads/${threadId}/moderator-actions`;
            const response = await fetch(url, {
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (!response.ok) throw new Error(response.status);
            return await response.text();
        }
    };

    // ============= DOM HELPERS =============
    const DOM = {
        getThreadTitle: () => {
            const el = document.querySelector('.p-title-value');
            return el ? el.lastChild.textContent.trim() : '';
        },
        getThreadUrl: () => {
            let url = window.location.href.split('?')[0].split('#')[0];
            if (!url.endsWith('/')) url += '/';
            return url;
        },
        getAuthorName: () => {
            const el = document.querySelector('.p-description .username') || document.querySelector('.message-userDetails a.username');
            return el ? el.textContent.trim() : '';
        },
        getAuthorId: () => {
            const el = document.querySelector('.message-userDetails a.username');
            return el ? el.getAttribute('data-user-id') : '';
        },
        getThreadId: () => {
            const match = window.location.href.match(/\.(\d+)(?:\/|$)/);
            return match ? match[1] : null;
        },
        getCurrentNodeId: () => {
            const match = window.location.href.match(/\.(\d+)\//);
            return match ? parseInt(match[1]) : null;
        }
    };

    // ============= ФУНКЦИЯ ДЛЯ ПАРСИНГА HEX ЦВЕТА =============
    function parseHexColor(hex) {
        hex = hex.replace(/[^0-9a-fA-F]/g, '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length === 6) {
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
        return null;
    }

    function isValidHex(hex) {
        const cleaned = hex.replace(/[^0-9a-fA-F]/g, '');
        return cleaned.length === 3 || cleaned.length === 6;
    }

    function hexToRgb(hex) {
        const rgb = parseHexColor(hex);
        if (!rgb) return null;
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    function hexToRgba(hex, alpha) {
        const rgb = parseHexColor(hex);
        if (!rgb) return null;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    // ============= ПОЛУЧЕНИЕ ЦВЕТОВ ДЛЯ ТЕМЫ =============
    function getThemeColors(theme) {
        // Если кастомный цвет установлен и тема 'custom'
        if (theme === 'custom' && customColor && isValidHex(customColor)) {
            const mainColor = customColor;
            const mainRgb = parseHexColor(mainColor);
            if (!mainRgb) return getDefaultColors();

            const r = mainRgb.r;
            const g = mainRgb.g;
            const b = mainRgb.b;

            // Создаем цвета на основе HEX
            const lighter = `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)})`;
            const darker = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
            const veryLight = `rgb(${Math.min(255, r + 120)}, ${Math.min(255, g + 120)}, ${Math.min(255, b + 120)})`;
            const glow = `rgba(${r}, ${g}, ${b}, 0.5)`;
            const glowStrong = `rgba(${r}, ${g}, ${b}, 0.6)`;
            const bgDark1 = `rgb(${Math.max(0, r - 80)}, ${Math.max(0, g - 80)}, ${Math.max(0, b - 80)})`;
            const bgDark2 = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;

            return {
                bgGradient1: bgDark1,
                bgGradient2: bgDark2,
                borderColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
                boxShadow: `0 25px 60px rgba(0,0,0,0.9)`,
                headerBorder: `rgba(${r}, ${g}, ${b}, 0.12)`,
                titleColor: lighter,
                titleAccent: `rgb(${r}, ${g}, ${b})`,
                titleAccentLight: veryLight,
                tabBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                tabBorder: `rgba(${r}, ${g}, ${b}, 0.12)`,
                tabColor: lighter,
                tabHoverBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                tabHoverColor: veryLight,
                tabHoverBorder: `rgba(${r}, ${g}, ${b}, 0.3)`,
                tabActiveGradient1: `rgb(${r}, ${g}, ${b})`,
                tabActiveGradient2: lighter,
                tabActiveColor: '#fff',
                tabActiveShadow: `0 4px 20px rgba(${r}, ${g}, ${b}, 0.4)`,
                btnBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                btnBorder: `rgba(${r}, ${g}, ${b}, 0.08)`,
                btnColor: veryLight,
                btnHoverBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                btnHoverBorder: `rgba(${r}, ${g}, ${b}, 0.3)`,
                btnHoverColor: '#fff',
                btnHoverShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.12)`,
                serverBtnBorder: `rgba(${r}, ${g}, ${b}, 0.12)`,
                serverBtnHoverBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                serverBtnHoverBorder: `rgba(${r}, ${g}, ${b}, 0.25)`,
                serverBtnShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.08)`,
                serverIdBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                serverIdBorder: `rgba(${r}, ${g}, ${b}, 0.08)`,
                serverIdColor: `rgba(255, 255, 255, 0.4)`,
                serverNameColor: veryLight,
                archiveBg: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15), rgba(${r}, ${g}, ${b}, 0.05))`,
                archiveBorder: `rgba(${r}, ${g}, ${b}, 0.3)`,
                archiveHoverBg: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.25), rgba(${r}, ${g}, ${b}, 0.1))`,
                archiveHoverBorder: `rgba(${r}, ${g}, ${b}, 0.5)`,
                counterBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                counterBorder: `rgba(${r}, ${g}, ${b}, 0.2)`,
                counterColor: lighter,
                modalMaxWidth: '500px',
                actionOptionBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                actionOptionBorder: `rgba(${r}, ${g}, ${b}, 0.12)`,
                actionOptionHoverBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                actionOptionHoverBorder: `rgba(${r}, ${g}, ${b}, 0.3)`,
                actionOptionTitle: '#fff',
                actionOptionDesc: lighter,
                inputBg: 'rgba(0,0,0,0.4)',
                inputBorder: `rgba(${r}, ${g}, ${b}, 0.2)`,
                inputColor: veryLight,
                inputFocusBorder: `rgb(${r}, ${g}, ${b})`,
                inputFocusShadow: `0 0 20px rgba(${r}, ${g}, ${b}, 0.12)`,
                inputFocusBg: 'rgba(0,0,0,0.5)',
                inputPlaceholder: `rgba(255, 255, 255, 0.3)`,
                actionBtnGradient1: lighter,
                actionBtnGradient2: `rgb(${r}, ${g}, ${b})`,
                actionBtnColor: '#0a0a0a',
                actionBtnShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.3)`,
                footerBorder: `rgba(${r}, ${g}, ${b}, 0.08)`,
                footerColor: `rgba(255, 255, 255, 0.4)`,
                footerUsername: lighter,
                footerRoleBg: 'rgba(255, 215, 0, 0.12)',
                footerRoleBorder: 'rgba(255, 215, 0, 0.2)',
                footerRoleColor: '#ffd700',
                searchBg: 'rgba(0,0,0,0.4)',
                searchBorder: `rgba(${r}, ${g}, ${b}, 0.1)`,
                searchColor: veryLight,
                searchFocusBorder: `rgb(${r}, ${g}, ${b})`,
                searchFocusShadow: `0 0 20px rgba(${r}, ${g}, ${b}, 0.12)`,
                searchFocusBg: 'rgba(0,0,0,0.5)',
                searchPlaceholder: `rgba(255, 255, 255, 0.3)`,
                dupBg: `rgba(${r}, ${g}, ${b}, 0.1)`,
                dupBorder: `rgba(${r}, ${g}, ${b}, 0.15)`,
                dupLinkBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                dupLinkBorder: `rgba(${r}, ${g}, ${b}, 0.08)`,
                dupLinkColor: veryLight,
                dupLinkHoverBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
                dupLinkHoverBorder: `rgba(${r}, ${g}, ${b}, 0.25)`,
                dupLinkHoverColor: '#fff',
                dupDateColor: lighter,
                spinnerColor1: `rgba(${r}, ${g}, ${b}, 0.15)`,
                spinnerColor2: `rgb(${r}, ${g}, ${b})`,
                lightningColor: '#ffd700',
                copyBg: '#db2309',
                copyColor: '#fff',
                copyShadow: '0 2px 8px rgba(219, 35, 9, 0.3)',
                copyHoverBg: '#f0280a',
                copyHoverShadow: '0 4px 12px rgba(219, 35, 9, 0.4)',
                copyCopiedBg: '#2e7d32',
                copyCopiedShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                toastBg: 'rgba(0,0,0,0.9)',
                toastColor: lighter,
                toastBorder: `rgba(${r}, ${g}, ${b}, 0.25)`,
                scrollTrack: 'transparent',
                scrollThumb: `rgba(${r}, ${g}, ${b}, 0.25)`,
                errorText: '#f87171',
                errorSubtext: lighter,
                errorBtnBg: `linear-gradient(135deg, ${lighter}, rgb(${r}, ${g}, ${b}))`,
                errorBtnColor: '#0a0a0a',
                errorBtnShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.25)`,
                closeBtnBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
                closeBtnColor: lighter,
                closeBtnBorder: `rgba(${r}, ${g}, ${b}, 0.12)`,
                closeBtnHoverColor: '#fff',
                closeBtnHoverBg: `rgba(${r}, ${g}, ${b}, 0.2)`,
                closeBtnHoverBorder: `rgba(${r}, ${g}, ${b}, 0.35)`,
                textColor: veryLight,
                textMuted: `rgba(255, 255, 255, 0.5)`,
                textStrong: lighter,
                glowColor: glowStrong
            };
        }

        if (theme === 'pinky') {
            return {
                bgGradient1: '#2d1b2a',
                bgGradient2: '#4a2d45',
                borderColor: 'rgba(255, 105, 180, 0.3)',
                boxShadow: '0 25px 60px rgba(255, 105, 180, 0.15)',
                headerBorder: 'rgba(255, 105, 180, 0.15)',
                titleColor: '#ff85c1',
                titleAccent: '#ff69b4',
                titleAccentLight: '#ffb6c1',
                tabBg: 'rgba(255, 105, 180, 0.08)',
                tabBorder: 'rgba(255, 105, 180, 0.15)',
                tabColor: '#ff85c1',
                tabHoverBg: 'rgba(255, 105, 180, 0.15)',
                tabHoverColor: '#ffa0c8',
                tabHoverBorder: 'rgba(255, 105, 180, 0.3)',
                tabActiveGradient1: '#db2777',
                tabActiveGradient2: '#ec4899',
                tabActiveColor: '#fff',
                tabActiveShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
                btnBg: 'rgba(255, 105, 180, 0.08)',
                btnBorder: 'rgba(255, 105, 180, 0.12)',
                btnColor: '#ffb6c1',
                btnHoverBg: 'rgba(255, 105, 180, 0.15)',
                btnHoverBorder: 'rgba(255, 105, 180, 0.3)',
                btnHoverColor: '#fff',
                btnHoverShadow: '0 6px 20px rgba(255, 105, 180, 0.1)',
                serverBtnBorder: 'rgba(255, 105, 180, 0.15)',
                serverBtnHoverBg: 'rgba(255, 105, 180, 0.08)',
                serverBtnHoverBorder: 'rgba(255, 105, 180, 0.25)',
                serverBtnShadow: '0 6px 20px rgba(255, 105, 180, 0.08)',
                serverIdBg: 'rgba(255, 105, 180, 0.15)',
                serverIdBorder: 'rgba(255, 105, 180, 0.1)',
                serverIdColor: 'rgba(255, 182, 193, 0.5)',
                serverNameColor: '#ffb6c1',
                archiveBg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.08))',
                archiveBorder: 'rgba(236, 72, 153, 0.3)',
                archiveHoverBg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(219, 39, 119, 0.15))',
                archiveHoverBorder: 'rgba(236, 72, 153, 0.5)',
                counterBg: 'rgba(255, 105, 180, 0.12)',
                counterBorder: 'rgba(255, 105, 180, 0.2)',
                counterColor: '#ff85c1',
                modalMaxWidth: '500px',
                actionOptionBg: 'rgba(255, 105, 180, 0.08)',
                actionOptionBorder: 'rgba(255, 105, 180, 0.15)',
                actionOptionHoverBg: 'rgba(255, 105, 180, 0.15)',
                actionOptionHoverBorder: 'rgba(255, 105, 180, 0.3)',
                actionOptionTitle: '#fff',
                actionOptionDesc: '#ff85c1',
                inputBg: 'rgba(45, 27, 42, 0.6)',
                inputBorder: 'rgba(255, 105, 180, 0.2)',
                inputColor: '#ffb6c1',
                inputFocusBorder: '#ec4899',
                inputFocusShadow: '0 0 20px rgba(236, 72, 153, 0.12)',
                inputFocusBg: 'rgba(45, 27, 42, 0.7)',
                inputPlaceholder: 'rgba(255, 182, 193, 0.3)',
                actionBtnGradient1: '#db2777',
                actionBtnGradient2: '#ec4899',
                actionBtnColor: '#1a0f18',
                actionBtnShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                footerBorder: 'rgba(255, 105, 180, 0.1)',
                footerColor: 'rgba(255, 182, 193, 0.4)',
                footerUsername: '#ff85c1',
                footerRoleBg: 'rgba(255, 215, 0, 0.12)',
                footerRoleBorder: 'rgba(255, 215, 0, 0.2)',
                footerRoleColor: '#ffd700',
                searchBg: 'rgba(45, 27, 42, 0.6)',
                searchBorder: 'rgba(255, 105, 180, 0.15)',
                searchColor: '#ffb6c1',
                searchFocusBorder: '#ec4899',
                searchFocusShadow: '0 0 20px rgba(236, 72, 153, 0.12)',
                searchFocusBg: 'rgba(45, 27, 42, 0.7)',
                searchPlaceholder: 'rgba(255, 182, 193, 0.3)',
                dupBg: 'rgba(236, 72, 153, 0.12)',
                dupBorder: 'rgba(236, 72, 153, 0.2)',
                dupLinkBg: 'rgba(255, 105, 180, 0.08)',
                dupLinkBorder: 'rgba(255, 105, 180, 0.1)',
                dupLinkColor: '#ffb6c1',
                dupLinkHoverBg: 'rgba(255, 105, 180, 0.15)',
                dupLinkHoverBorder: 'rgba(255, 105, 180, 0.25)',
                dupLinkHoverColor: '#fff',
                dupDateColor: '#ff85c1',
                spinnerColor1: 'rgba(255, 105, 180, 0.2)',
                spinnerColor2: '#ec4899',
                lightningColor: '#ffd700',
                copyBg: '#db2309',
                copyColor: '#fff',
                copyShadow: '0 2px 8px rgba(219, 35, 9, 0.3)',
                copyHoverBg: '#f0280a',
                copyHoverShadow: '0 4px 12px rgba(219, 35, 9, 0.4)',
                copyCopiedBg: '#2e7d32',
                copyCopiedShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                toastBg: 'rgba(45, 27, 42, 0.95)',
                toastColor: '#ff85c1',
                toastBorder: 'rgba(255, 105, 180, 0.25)',
                scrollTrack: 'transparent',
                scrollThumb: 'rgba(255, 105, 180, 0.25)',
                errorText: '#f87171',
                errorSubtext: '#ff85c1',
                errorBtnBg: 'linear-gradient(135deg, #db2777, #ec4899)',
                errorBtnColor: '#1a0f18',
                errorBtnShadow: '0 4px 15px rgba(236, 72, 153, 0.25)',
                closeBtnBg: 'rgba(255, 105, 180, 0.08)',
                closeBtnColor: '#ff85c1',
                closeBtnBorder: 'rgba(255, 105, 180, 0.15)',
                closeBtnHoverColor: '#fff',
                closeBtnHoverBg: 'rgba(255, 105, 180, 0.2)',
                closeBtnHoverBorder: 'rgba(255, 105, 180, 0.35)',
                textColor: '#ffb6c1',
                textMuted: 'rgba(255, 182, 193, 0.6)',
                textStrong: '#ff85c1',
                glowColor: 'rgba(255, 105, 180, 0.6)'
            };
        }

        // Дефолтная тема (фирменная)
        return {
            bgGradient1: '#0d1b2a',
            bgGradient2: '#1b2d45',
            borderColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            headerBorder: 'rgba(0, 255, 255, 0.08)',
            titleColor: '#80deea',
            titleAccent: '#4dd0e1',
            titleAccentLight: '#b2ebf2',
            tabBg: 'rgba(0, 255, 255, 0.04)',
            tabBorder: 'rgba(0, 255, 255, 0.08)',
            tabColor: '#4dd0e1',
            tabHoverBg: 'rgba(0, 255, 255, 0.08)',
            tabHoverColor: '#80deea',
            tabHoverBorder: 'rgba(0, 255, 255, 0.25)',
            tabActiveGradient1: '#0288d1',
            tabActiveGradient2: '#03a9f4',
            tabActiveColor: '#fff',
            tabActiveShadow: '0 4px 20px rgba(3, 169, 244, 0.35)',
            btnBg: 'rgba(0, 255, 255, 0.04)',
            btnBorder: 'rgba(0, 255, 255, 0.06)',
            btnColor: '#b2ebf2',
            btnHoverBg: 'rgba(0, 255, 255, 0.08)',
            btnHoverBorder: 'rgba(0, 255, 255, 0.25)',
            btnHoverColor: '#fff',
            btnHoverShadow: '0 6px 20px rgba(0, 255, 255, 0.06)',
            serverBtnBorder: 'rgba(0, 255, 255, 0.08)',
            serverBtnHoverBg: 'rgba(0, 255, 255, 0.04)',
            serverBtnHoverBorder: 'rgba(0, 255, 255, 0.2)',
            serverBtnShadow: '0 6px 20px rgba(0, 255, 255, 0.06)',
            serverIdBg: 'rgba(0, 255, 255, 0.08)',
            serverIdBorder: 'rgba(0, 255, 255, 0.06)',
            serverIdColor: 'rgba(178, 235, 242, 0.5)',
            serverNameColor: '#b2ebf2',
            archiveBg: 'linear-gradient(135deg, rgba(4, 169, 244, 0.12), rgba(4, 169, 244, 0.04))',
            archiveBorder: 'rgba(4, 169, 244, 0.25)',
            archiveHoverBg: 'linear-gradient(135deg, rgba(4, 169, 244, 0.2), rgba(4, 169, 244, 0.08))',
            archiveHoverBorder: 'rgba(4, 169, 244, 0.4)',
            counterBg: 'rgba(0, 255, 255, 0.08)',
            counterBorder: 'rgba(0, 255, 255, 0.15)',
            counterColor: '#4dd0e1',
            modalMaxWidth: '500px',
            actionOptionBg: 'rgba(0, 255, 255, 0.04)',
            actionOptionBorder: 'rgba(0, 255, 255, 0.08)',
            actionOptionHoverBg: 'rgba(0, 255, 255, 0.08)',
            actionOptionHoverBorder: 'rgba(0, 255, 255, 0.25)',
            actionOptionTitle: '#fff',
            actionOptionDesc: '#4dd0e1',
            inputBg: 'rgba(0,0,0,0.4)',
            inputBorder: 'rgba(0, 255, 255, 0.15)',
            inputColor: '#b2ebf2',
            inputFocusBorder: '#03a9f4',
            inputFocusShadow: '0 0 20px rgba(3, 169, 244, 0.08)',
            inputFocusBg: 'rgba(0,0,0,0.5)',
            inputPlaceholder: 'rgba(178, 235, 242, 0.3)',
            actionBtnGradient1: '#4dd0e1',
            actionBtnGradient2: '#03a9f4',
            actionBtnColor: '#0a2a3a',
            actionBtnShadow: '0 4px 15px rgba(3, 169, 244, 0.25)',
            footerBorder: 'rgba(0, 255, 255, 0.06)',
            footerColor: 'rgba(178, 235, 242, 0.4)',
            footerUsername: '#4dd0e1',
            footerRoleBg: 'rgba(255, 215, 0, 0.12)',
            footerRoleBorder: 'rgba(255, 215, 0, 0.2)',
            footerRoleColor: '#ffd700',
            searchBg: 'rgba(0,0,0,0.4)',
            searchBorder: 'rgba(0, 255, 255, 0.08)',
            searchColor: '#b2ebf2',
            searchFocusBorder: '#03a9f4',
            searchFocusShadow: '0 0 20px rgba(3, 169, 244, 0.08)',
            searchFocusBg: 'rgba(0,0,0,0.5)',
            searchPlaceholder: 'rgba(178, 235, 242, 0.3)',
            dupBg: 'rgba(3, 169, 244, 0.08)',
            dupBorder: 'rgba(3, 169, 244, 0.15)',
            dupLinkBg: 'rgba(0, 255, 255, 0.04)',
            dupLinkBorder: 'rgba(0, 255, 255, 0.06)',
            dupLinkColor: '#b2ebf2',
            dupLinkHoverBg: 'rgba(0, 255, 255, 0.08)',
            dupLinkHoverBorder: 'rgba(0, 255, 255, 0.2)',
            dupLinkHoverColor: '#fff',
            dupDateColor: '#4dd0e1',
            spinnerColor1: 'rgba(0, 255, 255, 0.15)',
            spinnerColor2: '#03a9f4',
            lightningColor: '#ffd700',
            copyBg: '#db2309',
            copyColor: '#fff',
            copyShadow: '0 2px 8px rgba(219, 35, 9, 0.3)',
            copyHoverBg: '#f0280a',
            copyHoverShadow: '0 4px 12px rgba(219, 35, 9, 0.4)',
            copyCopiedBg: '#2e7d32',
            copyCopiedShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
            toastBg: 'rgba(0,0,0,0.9)',
            toastColor: '#4dd0e1',
            toastBorder: 'rgba(0, 255, 255, 0.2)',
            scrollTrack: 'transparent',
            scrollThumb: 'rgba(0, 255, 255, 0.2)',
            errorText: '#f87171',
            errorSubtext: '#4dd0e1',
            errorBtnBg: 'linear-gradient(135deg, #4dd0e1, #03a9f4)',
            errorBtnColor: '#0a2a3a',
            errorBtnShadow: '0 4px 15px rgba(3, 169, 244, 0.25)',
            closeBtnBg: 'rgba(0, 255, 255, 0.05)',
            closeBtnColor: '#4dd0e1',
            closeBtnBorder: 'rgba(0, 255, 255, 0.08)',
            closeBtnHoverColor: '#fff',
            closeBtnHoverBg: 'rgba(0, 255, 255, 0.15)',
            closeBtnHoverBorder: 'rgba(0, 255, 255, 0.3)',
            textColor: '#b2ebf2',
            textMuted: 'rgba(178, 235, 242, 0.6)',
            textStrong: '#4dd0e1',
            glowColor: 'rgba(0, 255, 255, 0.5)'
        };
    }

    function getDefaultColors() {
        return {
            bgGradient1: '#0d1b2a',
            bgGradient2: '#1b2d45',
            borderColor: 'rgba(0, 255, 255, 0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            headerBorder: 'rgba(0, 255, 255, 0.08)',
            titleColor: '#80deea',
            titleAccent: '#4dd0e1',
            titleAccentLight: '#b2ebf2',
            tabBg: 'rgba(0, 255, 255, 0.04)',
            tabBorder: 'rgba(0, 255, 255, 0.08)',
            tabColor: '#4dd0e1',
            tabHoverBg: 'rgba(0, 255, 255, 0.08)',
            tabHoverColor: '#80deea',
            tabHoverBorder: 'rgba(0, 255, 255, 0.25)',
            tabActiveGradient1: '#0288d1',
            tabActiveGradient2: '#03a9f4',
            tabActiveColor: '#fff',
            tabActiveShadow: '0 4px 20px rgba(3, 169, 244, 0.35)',
            btnBg: 'rgba(0, 255, 255, 0.04)',
            btnBorder: 'rgba(0, 255, 255, 0.06)',
            btnColor: '#b2ebf2',
            btnHoverBg: 'rgba(0, 255, 255, 0.08)',
            btnHoverBorder: 'rgba(0, 255, 255, 0.25)',
            btnHoverColor: '#fff',
            btnHoverShadow: '0 6px 20px rgba(0, 255, 255, 0.06)',
            serverBtnBorder: 'rgba(0, 255, 255, 0.08)',
            serverBtnHoverBg: 'rgba(0, 255, 255, 0.04)',
            serverBtnHoverBorder: 'rgba(0, 255, 255, 0.2)',
            serverBtnShadow: '0 6px 20px rgba(0, 255, 255, 0.06)',
            serverIdBg: 'rgba(0, 255, 255, 0.08)',
            serverIdBorder: 'rgba(0, 255, 255, 0.06)',
            serverIdColor: 'rgba(178, 235, 242, 0.5)',
            serverNameColor: '#b2ebf2',
            archiveBg: 'linear-gradient(135deg, rgba(4, 169, 244, 0.12), rgba(4, 169, 244, 0.04))',
            archiveBorder: 'rgba(4, 169, 244, 0.25)',
            archiveHoverBg: 'linear-gradient(135deg, rgba(4, 169, 244, 0.2), rgba(4, 169, 244, 0.08))',
            archiveHoverBorder: 'rgba(4, 169, 244, 0.4)',
            counterBg: 'rgba(0, 255, 255, 0.08)',
            counterBorder: 'rgba(0, 255, 255, 0.15)',
            counterColor: '#4dd0e1',
            modalMaxWidth: '500px',
            actionOptionBg: 'rgba(0, 255, 255, 0.04)',
            actionOptionBorder: 'rgba(0, 255, 255, 0.08)',
            actionOptionHoverBg: 'rgba(0, 255, 255, 0.08)',
            actionOptionHoverBorder: 'rgba(0, 255, 255, 0.25)',
            actionOptionTitle: '#fff',
            actionOptionDesc: '#4dd0e1',
            inputBg: 'rgba(0,0,0,0.4)',
            inputBorder: 'rgba(0, 255, 255, 0.15)',
            inputColor: '#b2ebf2',
            inputFocusBorder: '#03a9f4',
            inputFocusShadow: '0 0 20px rgba(3, 169, 244, 0.08)',
            inputFocusBg: 'rgba(0,0,0,0.5)',
            inputPlaceholder: 'rgba(178, 235, 242, 0.3)',
            actionBtnGradient1: '#4dd0e1',
            actionBtnGradient2: '#03a9f4',
            actionBtnColor: '#0a2a3a',
            actionBtnShadow: '0 4px 15px rgba(3, 169, 244, 0.25)',
            footerBorder: 'rgba(0, 255, 255, 0.06)',
            footerColor: 'rgba(178, 235, 242, 0.4)',
            footerUsername: '#4dd0e1',
            footerRoleBg: 'rgba(255, 215, 0, 0.12)',
            footerRoleBorder: 'rgba(255, 215, 0, 0.2)',
            footerRoleColor: '#ffd700',
            searchBg: 'rgba(0,0,0,0.4)',
            searchBorder: 'rgba(0, 255, 255, 0.08)',
            searchColor: '#b2ebf2',
            searchFocusBorder: '#03a9f4',
            searchFocusShadow: '0 0 20px rgba(3, 169, 244, 0.08)',
            searchFocusBg: 'rgba(0,0,0,0.5)',
            searchPlaceholder: 'rgba(178, 235, 242, 0.3)',
            dupBg: 'rgba(3, 169, 244, 0.08)',
            dupBorder: 'rgba(3, 169, 244, 0.15)',
            dupLinkBg: 'rgba(0, 255, 255, 0.04)',
            dupLinkBorder: 'rgba(0, 255, 255, 0.06)',
            dupLinkColor: '#b2ebf2',
            dupLinkHoverBg: 'rgba(0, 255, 255, 0.08)',
            dupLinkHoverBorder: 'rgba(0, 255, 255, 0.2)',
            dupLinkHoverColor: '#fff',
            dupDateColor: '#4dd0e1',
            spinnerColor1: 'rgba(0, 255, 255, 0.15)',
            spinnerColor2: '#03a9f4',
            lightningColor: '#ffd700',
            copyBg: '#db2309',
            copyColor: '#fff',
            copyShadow: '0 2px 8px rgba(219, 35, 9, 0.3)',
            copyHoverBg: '#f0280a',
            copyHoverShadow: '0 4px 12px rgba(219, 35, 9, 0.4)',
            copyCopiedBg: '#2e7d32',
            copyCopiedShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
            toastBg: 'rgba(0,0,0,0.9)',
            toastColor: '#4dd0e1',
            toastBorder: 'rgba(0, 255, 255, 0.2)',
            scrollTrack: 'transparent',
            scrollThumb: 'rgba(0, 255, 255, 0.2)',
            errorText: '#f87171',
            errorSubtext: '#4dd0e1',
            errorBtnBg: 'linear-gradient(135deg, #4dd0e1, #03a9f4)',
            errorBtnColor: '#0a2a3a',
            errorBtnShadow: '0 4px 15px rgba(3, 169, 244, 0.25)',
            closeBtnBg: 'rgba(0, 255, 255, 0.05)',
            closeBtnColor: '#4dd0e1',
            closeBtnBorder: 'rgba(0, 255, 255, 0.08)',
            closeBtnHoverColor: '#fff',
            closeBtnHoverBg: 'rgba(0, 255, 255, 0.15)',
            closeBtnHoverBorder: 'rgba(0, 255, 255, 0.3)',
            textColor: '#b2ebf2',
            textMuted: 'rgba(178, 235, 242, 0.6)',
            textStrong: '#4dd0e1',
            glowColor: 'rgba(0, 255, 255, 0.5)'
        };
    }

    // ============= ГЕНЕРАЦИЯ СТИЛЕЙ =============
    function generateStyles(theme) {
        const c = getThemeColors(theme);

        return `
        .qc-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483647; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box; backdrop-filter: blur(12px); }
        .qc-overlay.qc-active { display: flex; animation: qcOverlayShow 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes qcOverlayShow { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .qc-modal { width: 100%; max-width: 900px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; border-radius: 24px; margin: auto; transition: all 0.3s ease; background: linear-gradient(145deg, ${c.bgGradient1}, ${c.bgGradient2}); border: 1px solid ${c.borderColor}; box-shadow: ${c.boxShadow}; position: relative; }
        ${customBgImage ? `
        .qc-modal::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${customBgImage}') center/cover no-repeat;
            opacity: 0.4;
            border-radius: 24px;
            z-index: 0;
            filter: brightness(0.8);
        }
        .qc-modal > * {
            position: relative;
            z-index: 1;
        }
        ` : ''}
        @media (max-width: 768px) { .qc-modal { width: 96% !important; max-width: 480px !important; } .qc-modal .qc-grid-inner { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        .qc-modal .qc-header { display: flex; flex-direction: column; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border-bottom: 1px solid ${c.headerBorder}; padding: 12px 0 0 0; }
        .qc-modal .qc-header-top { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 12px 16px; flex-wrap: wrap; gap: 8px; }
        .qc-modal .qc-title { color: ${c.titleColor}; font-family: 'Segoe UI', Oswald, sans-serif; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; }
        .qc-modal .qc-title img { width: 24px; height: 24px; border-radius: 4px; vertical-align: middle; }
        .qc-modal .qc-title span { color: ${c.titleAccent}; font-weight: 300; font-size: 11px; opacity: 0.6; letter-spacing: 0.5px; }
        .qc-modal .qc-header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-left: auto; }
        .qc-modal .qc-counter { background: ${c.counterBg}; border: 1px solid ${c.counterBorder}; color: ${c.counterColor}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-family: Oswald, sans-serif; display: flex; align-items: center; gap: 6px; }
        .qc-modal .qc-counter svg { width: 14px; height: 14px; }
        .qc-modal .qc-tabs { display: flex; gap: 6px; overflow-x: auto; padding: 4px 16px 12px 16px; box-sizing: border-box; width: 100%; scrollbar-width: none; min-height: 40px; }
        .qc-modal .qc-tabs::-webkit-scrollbar { display: none; }
        .qc-modal .qc-tab { flex-shrink: 0; padding: 8px 16px; background: ${c.tabBg}; border: 1px solid ${c.tabBorder}; color: ${c.tabColor}; cursor: pointer; transition: all 0.25s; font-family: Oswald, sans-serif; font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.8px; border-radius: 10px; }
        .qc-modal .qc-tab:not(.qc-active):hover { background: ${c.tabHoverBg}; color: ${c.tabHoverColor}; border-color: ${c.tabHoverBorder}; }
        .qc-modal .qc-tab.qc-active { background: linear-gradient(135deg, ${c.tabActiveGradient1}, ${c.tabActiveGradient2}); color: ${c.tabActiveColor}; box-shadow: ${c.tabActiveShadow}; border: none; }
        .qc-modal .qc-close-btn { background: ${c.closeBtnBg}; color: ${c.closeBtnColor}; border: 1px solid ${c.closeBtnBorder}; width: 34px; height: 34px; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 18px; transition: all 0.2s ease; border-radius: 10px; }
        .qc-modal .qc-close-btn:hover { color: ${c.closeBtnHoverColor}; background: ${c.closeBtnHoverBg}; border-color: ${c.closeBtnHoverBorder}; transform: rotate(90deg); }
        .qc-modal .qc-body { padding: 16px; overflow-y: auto; flex-grow: 1; box-sizing: border-box; }
        .qc-modal .qc-body::-webkit-scrollbar { width: 4px; }
        .qc-modal .qc-body::-webkit-scrollbar-track { background: ${c.scrollTrack}; }
        .qc-modal .qc-body::-webkit-scrollbar-thumb { background: ${c.scrollThumb}; border-radius: 4px; }
        .qc-modal .qc-panel { display: none; width: 100%; box-sizing: border-box; animation: fadeIn 0.25s ease-out; }
        .qc-modal .qc-panel.qc-active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .qc-modal .qc-grid-inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; width: 100%; box-sizing: border-box; align-items: stretch; }
        .qc-modal .qc-btn { padding: 8px 12px; cursor: pointer; transition: all 0.2s; display: flex; justify-content: center; text-align: center; align-items: center; font-family: Oswald, sans-serif; font-size: 12px; text-transform: uppercase; position: relative; box-sizing: border-box; width: 100%; margin: 0; overflow: hidden; letter-spacing: 0.5px; background: ${c.btnBg}; border: 1px solid ${c.btnBorder}; color: ${c.btnColor}; border-radius: 10px; min-height: 36px; font-weight: 600; }
        .qc-modal .qc-btn:hover { background: ${c.btnHoverBg}; border-color: ${c.btnHoverBorder}; color: ${c.btnHoverColor}; transform: translateY(-2px); box-shadow: ${c.btnHoverShadow}; }
        .qc-modal .qc-btn:active { transform: translateY(0px); }
        .qc-modal .qc-btn-server { background: transparent; border: 1px solid ${c.serverBtnBorder}; padding: 0; overflow: hidden; min-height: 34px; }
        .qc-modal .qc-btn-server:hover { background: ${c.serverBtnHoverBg}; border-color: ${c.serverBtnHoverBorder}; transform: translateY(-2px); box-shadow: ${c.serverBtnShadow}; }
        .qc-lightning { display: inline-block; font-size: 11px; margin-right: 4px; opacity: 0.6; color: ${c.lightningColor}; }
        .qc-modal .qc-action-btn { flex: 1; padding: 10px 16px; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.25s; border: none; letter-spacing: 0.5px; }
        .qc-modal .qc-action-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .qc-modal .qc-action-btn:active { transform: translateY(0px); }
        .qc-modal .qc-btn-blue { background: linear-gradient(135deg, ${c.actionBtnGradient1}, ${c.actionBtnGradient2}); color: ${c.actionBtnColor}; box-shadow: ${c.actionBtnShadow}; }
        .qc-footer { padding: 12px 16px; border-top: 1px solid ${c.footerBorder}; text-align: center; font-family: Oswald, sans-serif; font-size: 11px; color: ${c.footerColor}; letter-spacing: 0.5px; }
        .qc-footer .qc-username { color: ${c.footerUsername}; font-weight: 600; text-shadow: 0 0 10px ${c.glowColor}, 0 0 20px ${c.glowColor}; }
        .qc-footer .qc-role { color: ${c.footerRoleColor}; font-weight: 600; margin-left: 6px; padding: 2px 10px; border-radius: 12px; background: ${c.footerRoleBg}; border: 1px solid ${c.footerRoleBorder}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .qc-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid ${c.spinnerColor1}; border-top-color: ${c.spinnerColor2}; border-radius: 50%; animation: qc-spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; flex-shrink: 0; }
        @keyframes qc-spin { 100% { transform: rotate(360deg); } }
        .qc-dup-link { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: ${c.dupLinkBg}; border: 1px solid ${c.dupLinkBorder}; border-radius: 8px; color: ${c.dupLinkColor}; text-decoration: none; transition: all 0.2s; font-size: 12px; }
        .qc-dup-link:hover { background: ${c.dupLinkHoverBg}; border-color: ${c.dupLinkHoverBorder}; color: ${c.dupLinkHoverColor}; }
        .qc-dup-link .qc-dup-date { color: ${c.dupDateColor}; font-size: 10px; opacity: 0.6; white-space: nowrap; }
        .qc-action-modal .qc-modal { max-width: ${c.modalMaxWidth} !important; }
        .qc-action-modal .qc-action-options { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
        .qc-action-modal .qc-action-option { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: ${c.actionOptionBg}; border: 1px solid ${c.actionOptionBorder}; border-radius: 12px; cursor: pointer; transition: all 0.25s; text-align: left; width: 100%; box-sizing: border-box; }
        .qc-action-modal .qc-action-option:hover { background: ${c.actionOptionHoverBg}; border-color: ${c.actionOptionHoverBorder}; transform: translateX(4px); }
        .qc-action-modal .qc-action-option .qc-option-icon { font-size: 24px; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; border-radius: 10px; flex-shrink: 0; }
        .qc-action-modal .qc-action-option .qc-option-text { display: flex; flex-direction: column; gap: 2px; }
        .qc-action-modal .qc-action-option .qc-option-title { color: ${c.actionOptionTitle}; font-family: Oswald, sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .qc-action-modal .qc-action-option .qc-option-desc { color: ${c.actionOptionDesc}; font-family: Verdana, sans-serif; font-size: 11px; opacity: 0.7; }
        .qc-action-modal .qc-action-option.qc-return .qc-option-icon { background: rgba(255, 167, 38, 0.15); }
        .qc-action-modal .qc-action-option.qc-return:hover { border-color: rgba(255, 167, 38, 0.4); }
        .qc-action-modal .qc-action-option.qc-closeqc .qc-option-icon { background: rgba(3, 169, 244, 0.15); }
        .qc-action-modal .qc-action-option.qc-closeqc:hover { border-color: rgba(3, 169, 244, 0.4); }
        .qc-action-modal .qc-action-option.qc-nothing .qc-option-icon { background: rgba(156, 163, 175, 0.15); }
        .qc-action-modal .qc-action-option.qc-nothing:hover { border-color: rgba(156, 163, 175, 0.4); }
        .qc-reason-modal .qc-modal { max-width: 450px !important; }
        .qc-reason-modal .qc-reason-input { width: 100%; background: ${c.inputBg}; border: 1px solid ${c.inputBorder}; color: ${c.inputColor}; border-radius: 10px; padding: 12px 15px; font-family: Verdana, sans-serif; font-size: 13px; outline: none; transition: all 0.2s; box-sizing: border-box; min-height: 80px; resize: vertical; }
        .qc-reason-modal .qc-reason-input:focus { border-color: ${c.inputFocusBorder}; box-shadow: ${c.inputFocusShadow}; background: ${c.inputFocusBg}; }
        .qc-reason-modal .qc-reason-actions { display: flex; gap: 10px; margin-top: 12px; }
        .qc-reason-modal .qc-reason-actions button { flex: 1; padding: 10px 16px; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.25s; border: none; letter-spacing: 0.5px; }
        .qc-reason-modal .qc-reason-actions button:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .qc-reason-modal .qc-reason-submit { background: linear-gradient(135deg, ${c.actionBtnGradient1}, ${c.actionBtnGradient2}); color: ${c.actionBtnColor}; box-shadow: ${c.actionBtnShadow}; }
        .qc-reason-modal .qc-reason-cancel { background: rgba(255, 255, 255, 0.05); color: ${c.textStrong}; border: 1px solid rgba(255, 255, 255, 0.08); }
        .qc-text-modal .qc-modal { max-width: 450px !important; }
        .qc-text-modal .qc-text-input { width: 100%; background: ${c.inputBg}; border: 1px solid ${c.inputBorder}; color: ${c.inputColor}; border-radius: 10px; padding: 12px 15px; font-family: Verdana, sans-serif; font-size: 13px; outline: none; transition: all 0.2s; box-sizing: border-box; min-height: 100px; resize: vertical; }
        .qc-text-modal .qc-text-input:focus { border-color: ${c.inputFocusBorder}; box-shadow: ${c.inputFocusShadow}; background: ${c.inputFocusBg}; }
        .qc-text-modal .qc-text-actions { display: flex; gap: 10px; margin-top: 12px; }
        .qc-text-modal .qc-text-actions button { flex: 1; padding: 10px 16px; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.25s; border: none; letter-spacing: 0.5px; }
        .qc-text-modal .qc-text-actions button:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .qc-text-modal .qc-text-submit { background: linear-gradient(135deg, ${c.actionBtnGradient1}, ${c.actionBtnGradient2}); color: ${c.actionBtnColor}; box-shadow: ${c.actionBtnShadow}; }
        .qc-text-modal .qc-text-cancel { background: rgba(255, 255, 255, 0.05); color: ${c.textStrong}; border: 1px solid rgba(255, 255, 255, 0.08); }
        .qc-error-modal .qc-modal { max-width: 450px !important; }
        .qc-error-modal .qc-error-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
        .qc-error-modal .qc-error-text { color: ${c.errorText}; font-family: Verdana, sans-serif; font-size: 13px; text-align: center; padding: 5px 0; line-height: 1.6; }
        .qc-error-modal .qc-error-subtext { color: ${c.errorSubtext}; font-family: Verdana, sans-serif; font-size: 12px; text-align: center; padding: 5px 0; opacity: 0.7; line-height: 1.5; }
        .qc-error-modal .qc-error-center { display: flex; justify-content: center; margin-top: 15px; }
        .qc-error-modal .qc-error-btn { padding: 10px 30px; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.25s; border: none; letter-spacing: 0.5px; background: ${c.errorBtnBg}; color: ${c.errorBtnColor}; box-shadow: ${c.errorBtnShadow}; }
        .qc-search-container { margin-bottom: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
        .qc-search-input { flex: 1; min-width: 120px; background: ${c.searchBg}; border: 1px solid ${c.searchBorder}; color: ${c.searchColor}; border-radius: 8px; padding: 6px 12px; font-family: Oswald, sans-serif; font-size: 11px; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .qc-search-input:focus { border-color: ${c.searchFocusBorder}; box-shadow: ${c.searchFocusShadow}; background: ${c.searchFocusBg}; }
        .qc-search-input::placeholder { color: ${c.searchPlaceholder}; }
        .qc-server-btn { display: flex; align-items: center; height: 100%; width: 100%; background: transparent; border: none; padding: 0; margin: 0; cursor: pointer; font-family: Oswald, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: ${c.btnColor}; overflow: hidden; border-radius: 10px; font-weight: 600; }
        .qc-server-btn:hover { background: ${c.serverBtnHoverBg}; }
        .qc-server-btn:active { transform: scale(0.98); }
        .qc-server-id-wrap { background: ${c.serverIdBg}; padding: 6px 10px 6px 12px; border-radius: 10px 0 0 10px; display: flex; align-items: center; justify-content: center; min-height: 32px; border-right: 1px solid ${c.serverIdBorder}; flex-shrink: 0; }
        .qc-server-id { color: ${c.serverIdColor}; font-weight: 400; font-size: 11px; letter-spacing: 0.3px; }
        .qc-server-name-wrap { padding: 6px 12px 6px 10px; border-radius: 0 10px 10px 0; display: flex; align-items: center; justify-content: center; min-height: 32px; flex: 1; background: transparent; }
        .qc-server-name { color: ${c.serverNameColor}; font-weight: 600; font-size: 12px; text-align: center; }
        .qc-btn-archive { grid-column: 1 / -1 !important; justify-content: center !important; text-align: center !important; background: ${c.archiveBg} !important; border-color: ${c.archiveBorder} !important; min-height: 44px !important; font-size: 13px !important; font-weight: 600 !important; letter-spacing: 0.5px !important; border-radius: 10px !important; margin: 4px 0 !important; }
        .qc-btn-archive:hover { background: ${c.archiveHoverBg} !important; border-color: ${c.archiveHoverBorder} !important; }
        .qc-copy-btn { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; background: #db2309 !important; color: #fff !important; border: none; border-radius: 6px; font-family: inherit; font-size: 16px; cursor: pointer; transition: all 0.2s; touch-action: manipulation; white-space: nowrap; margin-left: 4px; box-shadow: 0 2px 8px rgba(219, 35, 9, 0.3) !important; width: 38px; height: 34px; vertical-align: middle; }
        .qc-copy-btn:hover { background: #f0280a !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(219, 35, 9, 0.4) !important; }
        .qc-copy-btn:active { transform: translateY(0px); box-shadow: 0 1px 4px rgba(219, 35, 9, 0.2) !important; }
        .qc-copy-btn .qc-copy-icon { display: inline-flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1; }
        .qc-copy-btn.copied { background: #2e7d32 !important; box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25) !important; }
        .qc-copy-btn.copied:hover { background: #388e3c !important; }
        #qc-main-open-menu { margin: 0 4px; font-family: Oswald, sans-serif; text-transform: uppercase; transition: all 0.2s; background: linear-gradient(135deg, ${c.tabActiveGradient1}, ${c.tabActiveGradient2}); color: ${c.tabActiveColor}; border: none; box-shadow: ${c.tabActiveShadow}; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; touch-action: manipulation; white-space: nowrap; }
        #qc-main-open-menu:hover { filter: brightness(1.1); transform: translateY(-1px); }
        #qc-main-open-menu:active { transform: translateY(0px); }
        .qc-header-actions .qc-settings-icon { display: inline-flex; align-items: center; justify-content: center; margin-left: auto; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.2s; color: ${c.titleColor}; background: transparent; border: none; }
        .qc-header-actions .qc-settings-icon:hover { background: rgba(255,255,255,0.05); transform: rotate(60deg); }
        .qc-bg-preview { margin-top: 8px; border-radius: 8px; overflow: hidden; max-height: 120px; background-size: cover; background-position: center; border: 1px solid ${c.borderColor}; display: flex; align-items: center; justify-content: center; min-height: 60px; }
        .qc-bg-preview img { width: 100%; height: 100%; object-fit: cover; max-height: 120px; }
        .qc-bg-empty { color: ${c.textMuted}; font-size: 12px; font-family: Verdana, sans-serif; }
        .qc-bg-upload-btn { padding: 6px 14px; background: ${c.btnBg}; border: 1px solid ${c.btnBorder}; color: ${c.btnColor}; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; transition: all 0.2s; }
        .qc-bg-upload-btn:hover { background: ${c.btnHoverBg}; border-color: ${c.btnHoverBorder}; color: ${c.btnHoverColor}; }
        .qc-bg-remove-btn { padding: 6px 14px; background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.2); color: #f87171; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; transition: all 0.2s; }
        .qc-bg-remove-btn:hover { background: rgba(255, 0, 0, 0.2); border-color: rgba(255, 0, 0, 0.3); }
        .qc-bg-actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .qc-color-input-container { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 8px; }
        .qc-color-input { width: 80px; height: 36px; padding: 2px; border: 2px solid ${c.borderColor}; border-radius: 8px; background: transparent; cursor: pointer; }
        .qc-color-input::-webkit-color-swatch-wrapper { padding: 0; }
        .qc-color-input::-webkit-color-swatch { border: none; border-radius: 6px; }
        .qc-color-text-input { flex: 1; min-width: 100px; background: ${c.inputBg}; border: 1px solid ${c.inputBorder}; color: ${c.inputColor}; border-radius: 8px; padding: 6px 12px; font-family: Oswald, sans-serif; font-size: 12px; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .qc-color-text-input:focus { border-color: ${c.inputFocusBorder}; box-shadow: ${c.inputFocusShadow}; background: ${c.inputFocusBg}; }
        .qc-color-text-input::placeholder { color: ${c.inputPlaceholder}; }
        .qc-color-apply-btn { padding: 6px 16px; background: linear-gradient(135deg, ${c.actionBtnGradient1}, ${c.actionBtnGradient2}); color: ${c.actionBtnColor}; border: none; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; transition: all 0.2s; box-shadow: ${c.actionBtnShadow}; }
        .qc-color-apply-btn:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); }
        .qc-color-remove-btn { padding: 6px 16px; background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.2); color: #f87171; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; transition: all 0.2s; }
        .qc-color-remove-btn:hover { background: rgba(255, 0, 0, 0.2); border-color: rgba(255, 0, 0, 0.3); }
        .qc-color-preview { display: inline-block; width: 20px; height: 20px; border-radius: 4px; border: 1px solid ${c.borderColor}; vertical-align: middle; margin-left: 8px; }
        .qc-settings-section { margin-bottom: 16px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid ${c.borderColor}; }
        .qc-settings-section .qc-section-title { font-family: Oswald, sans-serif; font-size: 14px; font-weight: 600; color: ${c.titleColor}; margin-bottom: 8px; }
        .qc-theme-btn { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 12px; text-transform: uppercase; transition: all 0.25s; flex: 1; min-width: 120px; border: 2px solid transparent; }
        .qc-theme-btn:hover { transform: translateY(-2px); }
        .qc-theme-btn.qc-active-theme { border-color: ${c.titleAccent} !important; box-shadow: 0 0 20px ${c.glowColor}; }
        @media (max-width: 768px) {
            .qc-modal .qc-grid-inner { grid-template-columns: repeat(2, 1fr) !important; gap: 4px !important; }
            .qc-modal .qc-btn { padding: 8px 8px !important; font-size: 11px !important; min-height: 32px !important; }
            .qc-modal .qc-header-top { padding: 6px 10px 6px 10px !important; }
            .qc-modal .qc-title { font-size: 12px !important; }
            .qc-modal .qc-title img { width: 18px !important; height: 18px !important; }
            .qc-modal .qc-tabs { padding: 4px 10px 6px 10px !important; gap: 4px !important; min-height: 32px !important; }
            .qc-modal .qc-tab { padding: 6px 10px !important; font-size: 9px !important; min-height: 28px !important; }
            .qc-modal .qc-body { padding: 8px !important; }
            .qc-modal .qc-action-btn { padding: 8px 10px !important; font-size: 10px !important; min-height: 36px !important; }
            .qc-modal .qc-counter { font-size: 9px !important; padding: 3px 8px !important; }
            .qc-modal .qc-close-btn { width: 28px !important; height: 28px !important; font-size: 14px !important; }
            .qc-modal textarea.qc-input { min-height: 50px !important; }
            .qc-action-modal .qc-action-option { padding: 10px 12px !important; min-height: 44px !important; }
            .qc-action-modal .qc-action-option .qc-option-icon { width: 30px !important; height: 30px !important; font-size: 18px !important; }
            .qc-action-modal .qc-action-option .qc-option-title { font-size: 11px !important; }
            .qc-action-modal .qc-action-option .qc-option-desc { font-size: 10px !important; }
            .qc-dup-link { font-size: 10px !important; padding: 6px 8px !important; min-height: 34px !important; }
            .qc-reason-modal .qc-reason-input { font-size: 12px !important; min-height: 60px !important; }
            .qc-text-modal .qc-text-input { font-size: 12px !important; min-height: 60px !important; }
            .qc-search-input { font-size: 10px !important; padding: 6px 10px !important; min-height: 30px !important; }
            .qc-btn-archive { min-height: 38px !important; font-size: 12px !important; }
            .qc-server-id { font-size: 10px !important; }
            .qc-server-name { font-size: 11px !important; }
            .qc-server-id-wrap { padding: 4px 8px 4px 10px !important; min-height: 26px !important; }
            .qc-server-name-wrap { padding: 4px 10px 4px 8px !important; min-height: 26px !important; }
            .qc-footer { font-size: 10px !important; padding: 8px 12px !important; }
            .qc-footer .qc-role { font-size: 9px !important; padding: 1px 6px !important; }
            .qc-copy-btn { width: 34px !important; height: 30px !important; font-size: 14px !important; padding: 4px 10px !important; }
            .qc-copy-btn .qc-copy-icon { font-size: 14px !important; }
            .qc-lightning { font-size: 10px !important; margin-right: 3px !important; }
            #qc-main-open-menu { font-size: 11px !important; padding: 5px 10px !important; min-height: 32px !important; margin: 0 2px !important; }
            .qc-header-actions .qc-settings-icon { font-size: 16px !important; padding: 2px 6px !important; }
            .qc-bg-preview { max-height: 80px !important; min-height: 40px !important; }
            .qc-color-input { width: 60px !important; height: 30px !important; }
            .qc-color-text-input { font-size: 10px !important; min-width: 80px !important; padding: 4px 8px !important; }
            .qc-color-apply-btn { font-size: 10px !important; padding: 4px 12px !important; }
        }
        @media (max-width: 480px) {
            .qc-modal .qc-grid-inner { grid-template-columns: 1fr 1fr !important; gap: 3px !important; }
            .qc-modal .qc-btn { font-size: 10px !important; padding: 6px 6px !important; min-height: 28px !important; }
            .qc-modal .qc-title { font-size: 10px !important; }
            .qc-modal .qc-tabs { padding: 3px 6px 4px 6px !important; min-height: 28px !important; }
            .qc-modal .qc-tab { font-size: 8px !important; padding: 4px 8px !important; min-height: 24px !important; }
            .qc-modal .qc-body { padding: 6px !important; }
            #qc-main-open-menu { font-size: 9px !important; padding: 4px 6px !important; min-height: 28px !important; margin: 0 2px !important; }
            .qc-header-actions .qc-settings-icon { font-size: 14px !important; padding: 2px 4px !important; }
            .qc-search-input { font-size: 9px !important; padding: 4px 8px !important; min-height: 26px !important; }
            .qc-btn-archive { min-height: 34px !important; font-size: 11px !important; }
            .qc-server-id { font-size: 9px !important; }
            .qc-server-name { font-size: 10px !important; }
            .qc-server-id-wrap { padding: 3px 6px 3px 8px !important; min-height: 22px !important; }
            .qc-server-name-wrap { padding: 3px 8px 3px 6px !important; min-height: 22px !important; }
            .qc-footer { font-size: 9px !important; padding: 6px 10px !important; }
            .qc-footer .qc-role { font-size: 8px !important; padding: 1px 4px !important; }
            .qc-copy-btn { width: 30px !important; height: 26px !important; font-size: 12px !important; padding: 3px 8px !important; }
            .qc-copy-btn .qc-copy-icon { font-size: 12px !important; }
            .qc-lightning { font-size: 9px !important; margin-right: 2px !important; }
            .qc-bg-preview { max-height: 60px !important; min-height: 30px !important; }
            .qc-color-input { width: 50px !important; height: 26px !important; }
            .qc-color-text-input { font-size: 9px !important; min-width: 60px !important; padding: 3px 6px !important; }
            .qc-color-apply-btn { font-size: 9px !important; padding: 3px 10px !important; }
        }
        `;
    }

    // ============= ШАБЛОНЫ =============
    const getThreadData = () => {
        const firstPostUser = document.querySelector('.message-userDetails a.username');
        const fallbackUser = document.querySelector('a.username');
        const targetUser = firstPostUser || fallbackUser;
        const authorID = targetUser ? targetUser.getAttribute('data-user-id') : '';
        const authorName = targetUser ? targetUser.textContent.trim() : 'Неизвестный пользователь';
        const hours = new Date().getHours();

        return {
            user: {
                id: authorID,
                name: authorName,
                mention: authorID ? `[USER=${authorID}]${authorName}[/USER]` : authorName,
            },
            greeting: () => 4 < hours && hours <= 11 ? 'Доброе утро' :
                           11 < hours && hours <= 15 ? 'Добрый день' :
                           15 < hours && hours <= 21 ? 'Добрый вечер' : 'Доброй ночи'
        };
    };

    const generateTemplate = (title, content, prefix = null, status = false, moveToArchive = false, showReturnOption = false, isCustomText = false, needsReason = false, hasLightning = false) => ({
        title,
        content,
        prefix,
        status,
        moveToArchive,
        showReturnOption,
        isCustomText,
        needsReason,
        hasLightning
    });

    // ============= СОЗДАЕМ КНОПКИ ДЛЯ СЕРВЕРОВ =============
    function createServerButtons() {
        const serverButtons = [];
        const sortedServers = Object.entries(SERVER_MAP).sort((a, b) => a[1].id - b[1].id);

        for (const [prefix, data] of sortedServers) {
            serverButtons.push({
                title: `${data.id} ${data.name}`,
                content: `[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>` +
                    `[CENTER]Данная тема передается обратно Техническому специалисту.[/CENTER]<br>` +
                    `[CENTER]Последующие решения будут приниматься им.[/CENTER]<br><br>` +
                    `[CENTER]На рассмотрении у Технического специалиста сервера «${data.name}».[/CENTER][/SIZE][/FONT]`,
                prefix: parseInt(prefix),
                status: true,
                moveToArchive: false,
                showReturnOption: false,
                isCustomText: false,
                needsReason: false,
                isServer: true,
                serverId: data.id,
                serverName: data.name,
                hasLightning: true
            });
        }
        return serverButtons;
    }

    // ============= КНОПКИ =============
    const buttons = [
        generateTemplate('Свой текст',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]{{ custom_text }}[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true, true
        ),
        generateTemplate('На рассмотрении',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Ваше обращение взято на рассмотрение.[/CENTER][/SIZE][/FONT]',
            NARASSMOTRENII_PREFIX, true, false, false, false, false, false
        ),
        generateTemplate('Обнаружено',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]После проверки вашего обращения ошибка/недоработка была обнаружена.[/CENTER]<br>' +
            '[CENTER]Данная ошибка/недоработка передана разработчикам проекта.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Kaiten(iOS)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Ошибка/недоработка будет передана и проверена соответствующими специалистами.[/CENTER]<br>' +
            '[CENTER]Если в ходе проверки специалистами ошибка/недоработка будет обнаружена, она будет передана разработчикам проекта.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Не обнаружено(SERV)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]После проверки вашего обращения ошибка/недоработка не была обнаружена.[/CENTER]<br>' +
            '[CENTER]Скорее всего, данная ошибка/недоработка произошла из-за серверных ошибок либо уже была исправлена.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Не обнаружено(CLIENT)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]После проверки вашего обращения ошибка/недоработка не была обнаружена.[/CENTER]<br>' +
            '[CENTER]Если проблема актуальна, попробуйте заново скачать лаунчер с официального сайта: https://blackrussia.online[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Известно',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]После проверки вашего обращения стало ясно, что данная ошибка/недоработка уже известна.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Не баг',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данная система не является ошибкой/недоработкой.[/CENTER]<br>' +
            '[CENTER]{{ reason }}[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false, false, true
        ),
        generateTemplate('Не воспроизвести(SERV)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данную проблему невозможно воспроизвести специально, либо данная ошибка/недоработка могла произойти по одной из следующих причин:[/CENTER]<br>' +
            '[CENTER][QUOTE]1. Из-за серверных ошибок/сбоев;[/CENTER]<br><br>' +
            '[CENTER]2. Либо данный баг уже был исправлен.[/QUOTE][/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Не воспроизвести(CLIENT)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данную проблему невозможно воспроизвести специально, либо данная ошибка/недоработка могла произойти по одной из следующих причин:[/CENTER]<br>' +
            '[CENTER][QUOTE]1. Из-за проблемы в вашем телефоне;[/CENTER]<br><br>' +
            '[CENTER]2. Из-за плохого интернет-соединения;[/CENTER]<br><br>' +
            '[CENTER]3. Из-за стороннего установленного клиента (лаунчера);[/CENTER]<br><br>' +
            '[CENTER]4. Либо данный баг уже был исправлен.[/QUOTE][/CENTER]<br><br>' +
            '[CENTER]Для решения проблемы попробуйте заново скачать лаунчер с официального сайта: https://blackrussia.online[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, true
        ),
        generateTemplate('Дубль',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Ответ дан в другом ранее созданном вами обращении.[/CENTER]<br><br>' +
            '[CENTER]Дубль.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Нет ответа(24ч+)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Поскольку от вас не поступило ответа, я вынужден закрыть ваше обращение.[/CENTER]<br>' +
            '[CENTER]Если проблема осталась актуальной, создайте новое обращение в техническом разделе вашего сервера и приложите информацию, запрошенную мной ранее.[/CENTER]<br><br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('В «Заявки с окончательными ответами»',
            '',
            QCUN_PREFIX, false, false, false
        ),
        generateTemplate('Вернуть в раздел КК',
            '',
            null, false, false, false, false, false, false
        ),
        { title: '━━━━━━━ ДОПОЛНИТЕЛЬНЫЕ КНОПКИ ━━━━━━━' },
        generateTemplate('Не слышу радио',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Если вы не слышите радио, то воспользуйтесь следующим методом:[/CENTER]<br>' +
            '[CENTER]Откройте планшет >> нажмите на иконку «Настройки игры» >> перейдите во вкладку «Звук» >> пролистайте в конец и отключите блокировку подключения к аудиопотокам (ползунок должен быть серым).[/CENTER]<br>' +
            '[CENTER]Если у вас уже был ползунок серый, то нужно включить блокировку подключения к аудиопотокам и выключить.[/CENTER]<br>' +
            '[CENTER]В случае, если по инструкции выше радио не слышно, нужно включить блокировку подключения к аудиопотокам.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Создание семьи',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данная система не является ошибкой/недоработкой.[/CENTER]<br>' +
            '[CENTER]Количество созданных семей на одном сервере ограничено, поэтому создать больше положенного не получится, и придёт уведомление снизу: «Попробуйте создать семью позже».[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Шрифт',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Вам нужно уменьшить размер текста в настройках вашего телефона. Для этого: перейдите в Настройки >> Экран >> Размер текста и уменьшите его (рекомендую поставить размер «S»).[/CENTER]<br>' +
            '[CENTER]Расположение размера шрифта может на некоторых телефонах различаться, поэтому воспользуйтесь поиском в настройках и введите ключевые слова, например: размер текста, размер, текст и т. п.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Календарь(бонусы)',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данная система не является ошибкой/недоработкой.[/CENTER]<br>' +
            '[CENTER]Под словом "БОНУСЫ" пишется число, которое показывает, сколько дней подряд вы заходили. Как только там будет написано число, которое соответствует наградам, - вы сможете забрать призы.[/CENTER]<br>' +
            '[CENTER]Например: если под словом "БОНУСЫ" стоит число 30 и в наградах есть такое условие, что нужно заходить 30 дней подряд и отыгрывать определенное количество времени, - вам станет доступна награда.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Цвет.код',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Официально нигде не прописаны цветовые коды. Вы на свое усмотрение ставите тот код, который нашли. Если он как-либо не работает, то это не ошибка/баг игры.[/CENTER]<br>' +
            '[CENTER]Для семьи: пользуйтесь стандартными цветами семьи, найти которые можно в настройках семьи.[/CENTER]<br>' +
            '[CENTER]Для Транспортной Компании (ТК) и Строительной Компании (СК): цвет чата системно не предусмотрен для изменения.[/CENTER]<br><br>' +
            '[CENTER]Если у вас возникли проблемы, которые произошли именно из-за цветового кода, – измените название семьи/ТК/СК и т.п. на то, в котором отсутствует цветовой код.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        generateTemplate('Акс',
            '[FONT=Georgia][SIZE=4][CENTER]Приветствую, уважаемый(-ая)[B] {{ user.mention }}[/B]![/CENTER]<br><br>' +
            '[CENTER]Данная система не является ошибкой/недоработкой.[/CENTER]<br>' +
            '[CENTER]Данная ошибка у игроков возникает в основном из-за того, что у них на нижних слотах инвентаря лежат различные предметы.[/CENTER]<br>' +
            '[CENTER]Для решения данной проблемы вам нужно все предметы, которые находятся у вас на нижних слотах инвентаря, переместить наверх.[/CENTER]<br><br>' +
            '[CENTER]Проверено Контролем Качества.[/CENTER]<br>' +
            '[CENTER]Закрыто.[/CENTER][/SIZE][/FONT]',
            null, false, true, false
        ),
        { title: '━━━━━━━ ПЕРЕМЕЩЕНИЕ ПО СЕРВЕРАМ ━━━━━━━' },
        ...createServerButtons()
    ];

    // ============= ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ ВВОДА =============
    function saveInputState(btnId, customText, reason, data, templateContent) {
        Storage.set(SAVED_BTN_KEY, btnId);
        Storage.set(SAVED_TEXT_KEY, customText || '');
        if (reason) {
            Storage.set(SAVED_REASON_KEY, reason);
        }
        if (data) {
            Storage.set(SAVED_DATA_KEY, JSON.stringify(data));
        }
        if (templateContent) {
            Storage.set(SAVED_TEMPLATE_KEY, templateContent);
        }
        log('Сохранено состояние ввода');
    }

    function clearInputState() {
        Storage.remove(SAVED_BTN_KEY);
        Storage.remove(SAVED_TEXT_KEY);
        Storage.remove(SAVED_DATA_KEY);
        Storage.remove(SAVED_REASON_KEY);
        Storage.remove(SAVED_TEMPLATE_KEY);
        log('Очищено состояние ввода');
    }

    function getSavedInputState() {
        const btnId = Storage.get(SAVED_BTN_KEY);
        const customText = Storage.get(SAVED_TEXT_KEY, '');
        const dataStr = Storage.get(SAVED_DATA_KEY);
        const reason = Storage.get(SAVED_REASON_KEY, '');
        const templateContent = Storage.get(SAVED_TEMPLATE_KEY, '');
        const data = dataStr ? JSON.parse(dataStr) : null;
        return { btnId, customText, data, reason, templateContent };
    }

    // ============= ОСНОВНАЯ ЛОГИКА =============

    // Функция для обновления стилей при смене темы
    function updateStyles(theme) {
        let styleEl = document.getElementById('qc-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'qc-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = generateStyles(theme);
    }

    // Инициализируем стили с текущей темой
    updateStyles(currentTheme);

    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.id = 'qc-main-overlay';
    overlay.className = 'qc-overlay';
    document.body.appendChild(overlay);

    // Создаем модальное окно для выбора действия
    const actionModal = document.createElement('div');
    actionModal.id = 'qc-action-modal';
    actionModal.className = 'qc-overlay qc-action-modal';
    actionModal.innerHTML = `
        <div class="qc-modal" style="max-width: 500px;">
            <div class="qc-header">
                <div class="qc-header-top" style="padding: 12px 16px;">
                    <div class="qc-title" style="font-size: 13px;">⚡ Выберите действие</div>
                    <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                </div>
            </div>
            <div class="qc-body" id="qc-action-content" style="padding: 16px;"></div>
        </div>
    `;
    document.body.appendChild(actionModal);

    actionModal.querySelector('.qc-close-btn').onclick = () => actionModal.classList.remove('qc-active');
    actionModal.onclick = (e) => { if (e.target === actionModal) actionModal.classList.remove('qc-active'); };

    // Создаем модальное окно для ввода причины "не баг"
    const reasonModal = document.createElement('div');
    reasonModal.id = 'qc-reason-modal';
    reasonModal.className = 'qc-overlay qc-reason-modal';
    reasonModal.innerHTML = `
        <div class="qc-modal" style="max-width: 450px;">
            <div class="qc-header">
                <div class="qc-header-top" style="padding: 12px 16px;">
                    <div class="qc-title" style="font-size: 13px;">✏️ Укажите почему это не баг</div>
                    <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                </div>
            </div>
            <div class="qc-body" style="padding: 16px;">
                <div style="color: ${getThemeColors(currentTheme).textStrong}; font-family: Verdana, sans-serif; font-size: 12px; margin-bottom: 10px; opacity: 0.8;">
                    Укажите причину, почему данная ситуация не является багом:
                </div>
                <textarea id="qc-reason-text" class="qc-reason-input" placeholder="Например: Антирадар оповещает о наличии радара (за 300 метров), он не освобождает вас от штрафов."></textarea>
                <div class="qc-reason-actions">
                    <button class="qc-reason-cancel" id="qc-reason-cancel">ОТМЕНА</button>
                    <button class="qc-reason-submit" id="qc-reason-submit">ПОДТВЕРДИТЬ</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(reasonModal);

    reasonModal.querySelector('.qc-close-btn').onclick = () => reasonModal.classList.remove('qc-active');
    reasonModal.onclick = (e) => { if (e.target === reasonModal) reasonModal.classList.remove('qc-active'); };

    // Создаем модальное окно для ввода текста "Свой текст"
    const textModal = document.createElement('div');
    textModal.id = 'qc-text-modal';
    textModal.className = 'qc-overlay qc-text-modal';
    textModal.innerHTML = `
        <div class="qc-modal" style="max-width: 450px;">
            <div class="qc-header">
                <div class="qc-header-top" style="padding: 12px 16px;">
                    <div class="qc-title" style="font-size: 13px;">✏️ Введите свой текст</div>
                    <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                </div>
            </div>
            <div class="qc-body" style="padding: 16px;">
                <div style="color: ${getThemeColors(currentTheme).textStrong}; font-family: Verdana, sans-serif; font-size: 12px; margin-bottom: 10px; opacity: 0.8;">
                    Введите текст ответа. Поддерживается BB-коды форума.
                </div>
                <textarea id="qc-text-input" class="qc-text-input" placeholder="Введите ваш текст..."></textarea>
                <div class="qc-text-actions">
                    <button class="qc-text-cancel" id="qc-text-cancel">ОТМЕНА</button>
                    <button class="qc-text-submit" id="qc-text-submit">ПОДТВЕРДИТЬ</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(textModal);

    textModal.querySelector('.qc-close-btn').onclick = () => textModal.classList.remove('qc-active');
    textModal.onclick = (e) => { if (e.target === textModal) textModal.classList.remove('qc-active'); };

    // ============= ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ИСТОРИИ ПЕРЕМЕЩЕНИЙ =============

    async function getOriginalNodeId() {
        const threadId = DOM.getThreadId();
        if (!threadId) return null;

        try {
            const html = await ForumAPI.getModeratorLogs(threadId);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const rows = doc.querySelectorAll('.dataList-row');
            let firstMoveNodeId = null;
            let moveCount = 0;

            rows.forEach(row => {
                const actionCell = row.querySelector('td:nth-child(2)');
                if (actionCell) {
                    const text = actionCell.textContent.trim();
                    if (text.includes('Тема перемещена из форума')) {
                        const match = text.match(/из форума "([^"]+)"/);
                        if (match) {
                            const forumName = match[1];
                            for (let key in SERVER_MAP) {
                                if (forumName.includes(SERVER_MAP[key].name) || forumName.includes(SERVER_MAP[key].name.toUpperCase())) {
                                    if (moveCount === 0) {
                                        firstMoveNodeId = parseInt(key);
                                    }
                                    moveCount++;
                                    break;
                                }
                            }
                        }

                        if (!firstMoveNodeId) {
                            const link = row.querySelector('td:last-child a');
                            if (link) {
                                const href = link.getAttribute('href');
                                const idMatch = href.match(/\.(\d+)/);
                                if (idMatch) {
                                    const nodeId = parseInt(idMatch[1]);
                                    if (nodeId !== DOM.getCurrentNodeId() && nodeId !== ARCHIVE_NODE) {
                                        if (moveCount === 0) {
                                            firstMoveNodeId = nodeId;
                                        }
                                        moveCount++;
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return firstMoveNodeId;
        } catch (e) {
            console.error('Ошибка получения истории перемещений:', e);
            return null;
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ НАЗВАНИЯ СЕРВЕРА ПО ID РАЗДЕЛА =============

    function getServerNameByNodeId(nodeId) {
        for (let key in SERVER_MAP) {
            if (parseInt(key) === nodeId) {
                return SERVER_MAP[key].name;
            }
        }
        return null;
    }

    // ============= ФУНКЦИЯ ДЛЯ ВОЗВРАТА ТЕМЫ ТЕХ.СПЕЦИАЛИСТУ =============

    async function returnToTechSpecialist(targetNodeId, serverName) {
        try {
            await editThreadDataWithoutReload(TECH_PREFIX, true);
            await moveThreadWithoutReload(TECH_PREFIX, targetNodeId);
            return true;
        } catch (e) {
            console.error('Ошибка при возврате тех.специалисту:', e);
            return false;
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО ПЕРЕМЕЩЕНИЯ В АРХИВ =============

    async function autoMoveToArchive() {
        try {
            const threadId = DOM.getThreadId();
            if (!threadId) return false;

            await editThreadDataWithoutReload(QCUN_PREFIX, false);
            await moveThreadWithoutReload(QCUN_PREFIX, ARCHIVE_NODE);

            incrementCounter();
            return true;
        } catch (e) {
            console.error('Ошибка при автоматическом архивировании:', e);
            return false;
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ПРОВЕРКИ НАЛИЧИЯ МОЛНИИ =============

    function hasLightningIcon(btnData) {
        if (!btnData) return false;
        if (btnData.showReturnOption || btnData.isCustomText) {
            return true;
        }
        if (btnData.hasLightning) {
            return true;
        }
        return false;
    }

    // ============= ФУНКЦИЯ ДЛЯ ВОЗВРАТА В РАЗДЕЛ КК =============
    async function returnToKK() {
        try {
            const currentNodeId = DOM.getCurrentNodeId();
            if (currentNodeId === ARCHIVE_NODE) {
                showErrorModal(
                    'Тема находится в архиве.',
                    'Нельзя вернуть тему из архива.'
                );
                return false;
            }

            await editThreadDataWithoutReload(NARASSMOTRENII_PREFIX, true);
            await moveThreadWithoutReload(NARASSMOTRENII_PREFIX, TECH_RETURN_NODE);

            showCopyNotification('✅ Тема возвращена в раздел "Баги из технического раздела" с префиксом "На рассмотрении"!');
            setTimeout(() => location.reload(), 1500);
            return true;
        } catch (e) {
            console.error('Ошибка при возврате в раздел КК:', e);
            showErrorModal(
                'Произошла ошибка при возврате темы.',
                'Пожалуйста, попробуйте еще раз или верните тему вручную.'
            );
            return false;
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ВЫПОЛНЕНИЯ ДЕЙСТВИЯ =============

    async function executeAction(action, btnId, templateContent, data, customText = '', reason = '') {
        let originalNodeId = null;
        let serverName = null;

        let finalContent = templateContent;

        if (buttons[btnId] && buttons[btnId].isCustomText) {
            finalContent = finalContent.replace('{{ custom_text }}', customText);
        }

        if (buttons[btnId] && buttons[btnId].needsReason) {
            finalContent = finalContent.replace('{{ reason }}', reason);
        }

        if (action === 'return') {
            originalNodeId = await getOriginalNodeId();

            if (!originalNodeId) {
                saveInputState(btnId, customText, reason, data, templateContent);
                showErrorWithRetry(
                    'Не удалось определить исходный раздел для возврата обращения.',
                    'Ваш текст сохранен. Нажмите "Повторить" чтобы попробовать снова.',
                    btnId,
                    templateContent,
                    data,
                    customText,
                    reason
                );
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');
                return;
            }

            if (originalNodeId) {
                serverName = getServerNameByNodeId(originalNodeId);
            }

            const lines = finalContent.split('<br>');
            let cleanedLines = [];

            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line.includes('Проверено Контролем Качества') ||
                    line.includes('Проверено Контролем Качества.') ||
                    line.includes('Закрыто') ||
                    line.includes('Проверено КК') ||
                    (line.includes('[CENTER]') && line.includes('Закрыто'))) {
                    continue;
                }
                if (line.includes('Проверено') && line.includes('Качества')) {
                    continue;
                }
                cleanedLines.unshift(lines[i]);
            }

            finalContent = cleanedLines.join('<br>');

            finalContent = finalContent.replace(/\[CENTER\]Проверено Контролем Качества\.\[\/CENTER\]/g, '');
            finalContent = finalContent.replace(/\[CENTER\]Закрыто\.\[\/CENTER\]/g, '');
            finalContent = finalContent.replace(/\[CENTER\]Проверено КК\.\[\/CENTER\]/g, '');
            finalContent = finalContent.replace(/Проверено Контролем Качества\./g, '');
            finalContent = finalContent.replace(/Закрыто\./g, '');
            finalContent = finalContent.replace(/Проверено КК\./g, '');

            finalContent = finalContent.replace(/(<br>\s*){3,}/g, '<br><br>');

            const serverText = serverName ? `сервера «${serverName}»` : 'технического специалиста';
            finalContent +=
                `<br>[CENTER][SIZE=4]Данная тема передается обратно техническому специалисту.[/SIZE][/CENTER]<br>` +
                `[CENTER][SIZE=4]Последующие решения будут приниматься им.[/SIZE][/CENTER]<br><br>` +
                `[CENTER][SIZE=4][B]На рассмотрении у технического специалиста ${serverText}.[/B][/SIZE][/CENTER]`;
        }

        clearInputState();
        await pasteContentWithOptions(btnId, finalContent, data, action, originalNodeId);
    }

    // ============= ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ ОШИБКИ С КНОПКОЙ ПОВТОРА =============
    function showErrorWithRetry(message, submessage, btnId, templateContent, data, customText, reason) {
        const colors = getThemeColors(currentTheme);
        const oldError = document.querySelector('.qc-error-modal');
        if (oldError) oldError.remove();

        const errorModal = document.createElement('div');
        errorModal.className = 'qc-overlay qc-error-modal';
        errorModal.innerHTML = `
            <div class="qc-modal" style="max-width: 450px;">
                <div class="qc-header">
                    <div class="qc-header-top" style="padding: 12px 16px;">
                        <div class="qc-title" style="font-size: 13px;">⚠️ Ошибка</div>
                        <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                    </div>
                </div>
                <div class="qc-body" style="padding: 16px;">
                    <div class="qc-error-icon">⚠️</div>
                    <div class="qc-error-text">${message}</div>
                    ${submessage ? `<div class="qc-error-subtext">${submessage}</div>` : ''}
                    <div class="qc-error-center" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <button class="qc-error-btn" id="qc-error-retry" style="flex: 1; min-width: 120px;">🔄 ПОВТОРИТЬ</button>
                        <button class="qc-error-btn" id="qc-error-close" style="flex: 1; min-width: 120px; background: rgba(255,255,255,0.1); color: ${colors.textColor}; box-shadow: none;">✕ ЗАКРЫТЬ</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);

        setTimeout(() => {
            errorModal.classList.add('qc-active');
        }, 100);

        errorModal.querySelector('.qc-close-btn').onclick = () => {
            errorModal.remove();
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        };
        errorModal.onclick = (e) => {
            if (e.target === errorModal) {
                errorModal.remove();
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');
            }
        };

        document.getElementById('qc-error-close').onclick = () => {
            errorModal.remove();
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        };

        document.getElementById('qc-error-retry').onclick = async () => {
            errorModal.remove();
            renderMenu();
            overlay.classList.add('qc-active');

            const savedState = getSavedInputState();
            if (savedState.btnId !== null && savedState.btnId !== undefined) {
                const btn = buttons[savedState.btnId];
                if (btn) {
                    if (btn.needsReason && savedState.reason) {
                        setTimeout(() => {
                            document.getElementById('qc-reason-text').value = savedState.reason;
                            reasonModal.classList.add('qc-active');
                        }, 300);
                    } else if (btn.isCustomText && savedState.customText) {
                        setTimeout(() => {
                            document.getElementById('qc-text-input').value = savedState.customText;
                            textModal.classList.add('qc-active');
                        }, 300);
                    }
                }
            }
        };

        setTimeout(() => {
            if (errorModal.parentNode) {
                errorModal.remove();
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');
            }
        }, 30000);
    }

    // ============= ФУНКЦИЯ ДЛЯ ПОКАЗА МОДАЛЬНОГО ОКНА ВЫБОРА =============

    let pendingAction = null;
    let pendingBtnId = null;
    let pendingTemplateContent = null;
    let pendingData = null;

    function showActionModal(btnId, templateContent, data) {
        const btn = buttons[btnId];
        const showReturn = btn && btn.showReturnOption;
        const isCustomText = btn && btn.isCustomText;
        const needsReason = btn && btn.needsReason;

        const savedState = getSavedInputState();
        if (savedState.btnId !== null && savedState.btnId !== undefined && savedState.btnId === btnId) {
            log('Найдено сохраненное состояние:', savedState);
            if (needsReason && savedState.reason) {
                document.getElementById('qc-reason-text').value = savedState.reason;
            }
            if (isCustomText && savedState.customText) {
                document.getElementById('qc-text-input').value = savedState.customText;
            }
        }

        if (needsReason) {
            const savedReason = Storage.get(SAVED_REASON_KEY, '');
            document.getElementById('qc-reason-text').value = savedReason;
            reasonModal.classList.add('qc-active');
            setTimeout(() => {
                document.getElementById('qc-reason-text').focus();
            }, 100);

            pendingAction = null;
            pendingBtnId = btnId;
            pendingTemplateContent = templateContent;
            pendingData = data;

            const submitBtn = document.getElementById('qc-reason-submit');
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
            newSubmitBtn.onclick = () => {
                const reason = document.getElementById('qc-reason-text').value.trim();
                reasonModal.classList.remove('qc-active');

                if (reason === '') {
                    const warningModal = document.createElement('div');
                    warningModal.className = 'qc-overlay qc-action-modal';
                    warningModal.innerHTML = `
                        <div class="qc-modal" style="max-width: 400px;">
                            <div class="qc-header">
                                <div class="qc-header-top" style="padding: 12px 16px;">
                                    <div class="qc-title" style="font-size: 13px;">⚠️ Внимание</div>
                                    <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                                </div>
                            </div>
                            <div class="qc-body" style="padding: 16px;">
                                <div style="color: ${getThemeColors(currentTheme).textStrong}; font-family: Verdana, sans-serif; font-size: 13px; text-align: center; padding: 10px 0;">
                                    Пожалуйста, укажите причину, почему это не баг.
                                </div>
                                <div class="qc-reason-actions">
                                    <button class="qc-reason-submit" style="flex: 1; padding: 10px 16px; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.25s; border: none; letter-spacing: 0.5px; background: linear-gradient(135deg, ${getThemeColors(currentTheme).actionBtnGradient1}, ${getThemeColors(currentTheme).actionBtnGradient2}); color: ${getThemeColors(currentTheme).actionBtnColor}; box-shadow: ${getThemeColors(currentTheme).actionBtnShadow};" id="qc-warning-ok">ОК</button>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(warningModal);
                    warningModal.querySelector('.qc-close-btn').onclick = () => warningModal.remove();
                    warningModal.onclick = (e) => { if (e.target === warningModal) warningModal.remove(); };
                    document.getElementById('qc-warning-ok').onclick = () => {
                        warningModal.remove();
                        reasonModal.classList.add('qc-active');
                        document.getElementById('qc-reason-text').focus();
                    };
                    return;
                }

                saveInputState(btnId, '', reason, data, templateContent);
                overlay.classList.remove('qc-active');
                executeAction('close', btnId, templateContent, data, '', reason);
            };

            const cancelBtn = document.getElementById('qc-reason-cancel');
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.onclick = () => {
                reasonModal.classList.remove('qc-active');
                clearInputState();
                pendingAction = null;
                pendingBtnId = null;
                pendingTemplateContent = null;
                pendingData = null;
            };

            return;
        }

        if (isCustomText) {
            const savedText = Storage.get(SAVED_TEXT_KEY, '');
            document.getElementById('qc-text-input').value = savedText;
            textModal.classList.add('qc-active');
            setTimeout(() => {
                document.getElementById('qc-text-input').focus();
            }, 100);

            pendingAction = null;
            pendingBtnId = btnId;
            pendingTemplateContent = templateContent;
            pendingData = data;

            const submitBtn = document.getElementById('qc-text-submit');
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
            newSubmitBtn.onclick = () => {
                const customText = document.getElementById('qc-text-input').value.trim();
                textModal.classList.remove('qc-active');

                if (customText === '') {
                    showErrorModal(
                        'Текст не может быть пустым.',
                        'Пожалуйста, введите текст ответа.'
                    );
                    textModal.classList.add('qc-active');
                    document.getElementById('qc-text-input').focus();
                    return;
                }

                saveInputState(btnId, customText, '', data, templateContent);
                showActionChoice(btnId, templateContent, data, customText, '');
            };

            const cancelBtn = document.getElementById('qc-text-cancel');
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            newCancelBtn.onclick = () => {
                textModal.classList.remove('qc-active');
                clearInputState();
                pendingAction = null;
                pendingBtnId = null;
                pendingTemplateContent = null;
                pendingData = null;
            };

            return;
        }

        if (showReturn) {
            showActionChoice(btnId, templateContent, data, '', '');
        } else {
            overlay.classList.remove('qc-active');
            clearInputState();
            executeAction('close', btnId, templateContent, data);
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ПОКАЗА ВЫБОРА ДЕЙСТВИЯ =============

    function showActionChoice(btnId, templateContent, data, customText = '', reason = '') {
        const contentDiv = document.getElementById('qc-action-content');
        const btnData = buttons[btnId];
        const isCustomText = btnData && btnData.isCustomText;

        let optionsHtml = `
            <div style="margin-bottom: 12px; color: ${getThemeColors(currentTheme).textStrong}; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6; text-align: center;">
                Выберите, что делать с обращением:
            </div>
            <div class="qc-action-options">
        `;

        if (isCustomText) {
            optionsHtml += `
                <div class="qc-action-option qc-nothing" data-action="nothing">
                    <div class="qc-option-icon">⏭️</div>
                    <div class="qc-option-text">
                        <div class="qc-option-title">Ничего не делать</div>
                        <div class="qc-option-desc">Только отправить сообщение, не изменяя тему</div>
                    </div>
                </div>
            `;
        }

        optionsHtml += `
                <div class="qc-action-option qc-return" data-action="return">
                    <div class="qc-option-icon">🔄</div>
                    <div class="qc-option-text">
                        <div class="qc-option-title">Вернуть тех. специалисту</div>
                        <div class="qc-option-desc">Тема будет возвращена в исходный тех. раздел, закреплена и открыта</div>
                    </div>
                </div>
                <div class="qc-action-option qc-closeqc" data-action="close">
                    <div class="qc-option-icon">📌</div>
                    <div class="qc-option-text">
                        <div class="qc-option-title">В «Заявки с окончательными ответами»</div>
                        <div class="qc-option-desc">Обращение будет закрыто, откреплено и перемещено с префиксом "Проверено КК"</div>
                    </div>
                </div>
            </div>
        `;

        contentDiv.innerHTML = optionsHtml;

        actionModal.classList.add('qc-active');

        contentDiv.querySelectorAll('.qc-action-option').forEach(option => {
            option.onclick = () => {
                const action = option.getAttribute('data-action');
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');

                let finalContent = templateContent;
                if (buttons[btnId] && buttons[btnId].isCustomText && customText) {
                    finalContent = finalContent.replace('{{ custom_text }}', customText);
                }
                if (buttons[btnId] && buttons[btnId].needsReason && reason) {
                    finalContent = finalContent.replace('{{ reason }}', reason);
                }

                if (action === 'nothing') {
                    let cleanContent = finalContent;
                    cleanContent = cleanContent.replace(/\[CENTER\]Проверено Контролем Качества\.\[\/CENTER\]/g, '');
                    cleanContent = cleanContent.replace(/\[CENTER\]Закрыто\.\[\/CENTER\]/g, '');
                    cleanContent = cleanContent.replace(/Проверено Контролем Качества\./g, '');
                    cleanContent = cleanContent.replace(/Закрыто\./g, '');
                    cleanContent = cleanContent.replace(/(<br>\s*){3,}/g, '<br><br>');
                    clearInputState();
                    pasteContentOnly(btnId, cleanContent, data);
                } else {
                    executeAction(action, btnId, finalContent, data, customText, reason);
                }
            };
        });
    }

    // ============= ФУНКЦИЯ ДЛЯ ОТПРАВКИ ТОЛЬКО СООБЩЕНИЯ =============

    async function pasteContentOnly(btnId, content, data) {
        const rendered = renderTemplate(content, data);

        try {
            const viewP = document.querySelector('.fr-element.fr-view p');
            if (viewP && viewP.textContent.trim() === '') viewP.innerHTML = '';
            document.querySelectorAll('span.fr-placeholder').forEach(el => el.innerHTML = '');

            const containerP = document.querySelector('div.fr-element.fr-view p');
            const containerView = document.querySelector('div.fr-element.fr-view');

            if (containerP) {
                containerP.insertAdjacentHTML('beforeend', rendered);
            } else if (containerView) {
                containerView.insertAdjacentHTML('beforeend', rendered);
            }

            const closer = document.querySelector('a.overlay-titleCloser');
            if (closer) closer.click();

            saveRecent(btnId);

            const threadId = DOM.getThreadId();
            if (threadId) Storage.remove(`qc_draft_${threadId}`);

            const bbCodeMessage = rendered.replace(/<br\s*\/?>/gi, '\n');

            await ForumAPI.post(`${DOM.getThreadUrl()}add-reply`, { message: bbCodeMessage });

            incrementCounter();
            location.reload();
        } catch (e) {
            console.error('Ошибка при отправке:', e);
            showErrorModal(
                'Произошла ошибка при отправке ответа.',
                'Пожалуйста, попробуйте еще раз или отправьте ответ вручную.'
            );
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ВСТАВКИ С ОПЦИЯМИ =============

    async function pasteContentWithOptions(btnId, content, data, action, targetNodeId = null) {
        const rendered = renderTemplate(content, data);

        try {
            const viewP = document.querySelector('.fr-element.fr-view p');
            if (viewP && viewP.textContent.trim() === '') viewP.innerHTML = '';
            document.querySelectorAll('span.fr-placeholder').forEach(el => el.innerHTML = '');

            const containerP = document.querySelector('div.fr-element.fr-view p');
            const containerView = document.querySelector('div.fr-element.fr-view');

            if (containerP) {
                containerP.insertAdjacentHTML('beforeend', rendered);
            } else if (containerView) {
                containerView.insertAdjacentHTML('beforeend', rendered);
            }

            const closer = document.querySelector('a.overlay-titleCloser');
            if (closer) closer.click();

            saveRecent(btnId);

            const threadId = DOM.getThreadId();
            if (threadId) Storage.remove(`qc_draft_${threadId}`);

            const bbCodeMessage = rendered.replace(/<br\s*\/?>/gi, '\n');

            await ForumAPI.post(`${DOM.getThreadUrl()}add-reply`, { message: bbCodeMessage });

            const btnData = buttons[btnId];
            const hasLightning = btnData && (btnData.showReturnOption || btnData.isCustomText || btnData.hasLightning);
            const isNarassmotrenii = btnData && btnData.prefix === NARASSMOTRENII_PREFIX;

            if (action === 'return' && targetNodeId) {
                await editThreadDataWithoutReload(TECH_PREFIX, true);
                await moveThreadWithoutReload(TECH_PREFIX, targetNodeId);
            } else if (action === 'close' || (!hasLightning && !isNarassmotrenii)) {
                await editThreadDataWithoutReload(QCUN_PREFIX, false);
                await moveThreadWithoutReload(QCUN_PREFIX, ARCHIVE_NODE);
            }

            incrementCounter();
            location.reload();
        } catch (e) {
            console.error('Ошибка при отправке:', e);
            showErrorModal(
                'Произошла ошибка при отправке ответа.',
                'Пожалуйста, попробуйте еще раз или отправьте ответ вручную.'
            );
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        }
    }

    // ============= ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕМОЙ БЕЗ ПЕРЕЗАГРУЗКИ =============

    async function editThreadDataWithoutReload(prefix, pin = false) {
        const threadTitle = DOM.getThreadTitle();
        const threadUrl = DOM.getThreadUrl();

        const data = {
            prefix_id: prefix,
            title: threadTitle,
            _xfToken: XF.config.csrf,
            _xfRequestUri: window.location.pathname,
            _xfWithData: 1,
            _xfResponseType: 'json'
        };

        if (pin) {
            data.discussion_open = 1;
            data.sticky = 1;
        } else {
            data.discussion_open = 0;
            data.sticky = 0;
        }

        await fetch(`${threadUrl}edit`, {
            method: 'POST',
            body: getFormData(data)
        });
    }

    async function moveThreadWithoutReload(prefix, targetNodeId) {
        const threadTitle = DOM.getThreadTitle();
        const threadUrl = DOM.getThreadUrl();

        const data = {
            prefix_id: prefix,
            title: threadTitle,
            target_node_id: targetNodeId,
            redirect_type: 'none',
            notify_watchers: 1,
            starter_alert: 1,
            starter_alert_reason: "",
            _xfToken: XF.config.csrf,
            _xfRequestUri: window.location.pathname,
            _xfWithData: 1,
            _xfResponseType: 'json'
        };

        await fetch(`${threadUrl}move`, {
            method: 'POST',
            body: getFormData(data)
        });
    }

    // ============= ОСТАЛЬНЫЕ ФУНКЦИИ =============

    let currentTab = '1';

    // Функция для загрузки фонового изображения
    function setupBackgroundUpload() {
        const fileInput = document.getElementById('qc-bg-upload');
        if (!fileInput) return;

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const imageUrl = event.target.result;

                customBgImage = imageUrl;
                Storage.set(BG_IMAGE_KEY, imageUrl);

                updateStyles(currentTheme);
                renderMenu();
                overlay.classList.add('qc-active');

                showCopyNotification('✅ Фоновое изображение установлено!');
            };
            reader.readAsDataURL(file);
        });
    }

    // ============= ФУНКЦИЯ ДЛЯ УСТАНОВКИ КАСТОМНОГО ЦВЕТА =============
    function setupCustomColor() {
        const colorInput = document.getElementById('qc-color-picker');
        const textInput = document.getElementById('qc-color-text');
        const applyBtn = document.getElementById('qc-color-apply');
        const removeBtn = document.getElementById('qc-color-remove');
        const preview = document.getElementById('qc-color-preview');

        if (!colorInput || !textInput || !applyBtn) return;

        // Синхронизация color picker и текстового поля
        colorInput.addEventListener('input', function() {
            textInput.value = this.value.toUpperCase();
            if (preview) {
                preview.style.backgroundColor = this.value;
            }
        });

        textInput.addEventListener('input', function() {
            let val = this.value.trim();
            if (val.startsWith('#')) {
                val = val.substring(1);
            }
            val = val.toUpperCase();
            if (isValidHex(val)) {
                const hex = '#' + val;
                colorInput.value = hex;
                if (preview) {
                    preview.style.backgroundColor = hex;
                }
                this.style.borderColor = getThemeColors(currentTheme).inputFocusBorder;
            } else {
                this.style.borderColor = '#f87171';
            }
        });

        applyBtn.addEventListener('click', function() {
            let val = textInput.value.trim();
            if (val.startsWith('#')) {
                val = val.substring(1);
            }
            val = val.toUpperCase();

            if (isValidHex(val)) {
                customColor = '#' + val;
                Storage.set(CUSTOM_COLOR_KEY, customColor);
                currentTheme = 'custom';
                Storage.set(THEME_KEY, 'custom');

                updateStyles('custom');
                renderMenu();
                overlay.classList.add('qc-active');

                showCopyNotification(`✅ Цвет изменен на ${customColor}!`);
            } else {
                showErrorModal(
                    'Неверный HEX-код цвета.',
                    'Введите корректный HEX-код (например: FF5733 или #FF5733)'
                );
            }
        });

        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                customColor = null;
                Storage.remove(CUSTOM_COLOR_KEY);
                currentTheme = 'default';
                Storage.set(THEME_KEY, 'default');

                updateStyles('default');
                renderMenu();
                overlay.classList.add('qc-active');

                showCopyNotification('✅ Кастомный цвет удален, восстановлена фирменная тема');
            });
        }
    }

    // ============= ФУНКЦИЯ ДЛЯ ОБРАБОТКИ КНОПКИ ВОЗВРАТА =============
    function handleReturnToKK() {
        const returnBtn = document.querySelector('#qc-return-kk-btn');
        if (returnBtn) {
            returnBtn.onclick = async () => {
                overlay.classList.remove('qc-active');
                await returnToKK();
            };
        }
    }

    function renderMenu() {
        const categories = {
            '1': { name: 'ОСНОВНЫЕ', items: [] },
            '2': { name: 'ДОПОЛНИТЕЛЬНЫЕ', items: [] },
            '3': { name: 'ПЕРЕМЕЩЕНИЕ', items: [] },
            '4': { name: 'НАСТРОЙКИ', items: [] }
        };

        let currentCat = '1';
        let sepCounter = 0;

        buttons.forEach((btn, idx) => {
            if (btn.title && btn.title.includes('━━━')) {
                sepCounter++;
                if (sepCounter === 1) currentCat = '2';
                else if (sepCounter === 2) currentCat = '3';
                return;
            }

            if (btn.title && categories[currentCat]) {
                categories[currentCat].items.push({ ...btn, idx });
            }
        });

        // Добавляем настройки в категорию 4
        const infoItems = [
            { title: 'ℹ️ Информация', isInfo: true },
        ];
        const colorItems = [
            { title: '🎨 Изменение цвета', isColor: true },
        ];
        const bgItems = [
            { title: '🖼️ Фоновое изображение', isBackground: true },
        ];
        categories['4'].items = [...infoItems, ...colorItems, ...bgItems];

        const username = getCurrentUsername();

        // Убираем вкладку "НАСТРОЙКИ" из табов, оставляем только шестеренку
        const tabsHtml = Object.entries(categories).filter(([id]) => id !== '4').map(([id, cat]) =>
            `<button class="qc-tab ${currentTab === id ? 'qc-active' : ''}" data-tab="${id}">${cat.name}</button>`
        ).join('');

        const panelsHtml = Object.entries(categories).map(([id, cat]) => {
            let content = '';

            if (id === '4') {
                const items = cat.items || [];
                let buttonsHtml = items.map(item => {
                    if (item.isInfo) {
                        return `<div class="qc-settings-section">
                            <div class="qc-section-title">${item.title}</div>
                            <div style="font-family: Verdana, sans-serif; font-size: 12px; color: ${getThemeColors(currentTheme).textColor}; opacity: 0.8; line-height: 1.6;">
                                <p><strong>Контроль Качества</strong> — скрипт для быстрого ответа на обращения в тех. разделе.</p>
                                <p><strong>Версия:</strong> 0.1.0</p>
                                <p><strong>Автор:</strong> @axxaxax55</p>
                                <p><strong>Описание:</strong> Скрипт позволяет быстро отвечать на обращения, используя готовые шаблоны ответов, перемещать темы между серверами и многое другое.</p>
                            </div>
                        </div>`;
                    }
                    if (item.isColor) {
                        const currentThemeName = currentTheme === 'pinky' ? 'Пикми (розовый)' :
                                                currentTheme === 'custom' ? 'Кастомный цвет' :
                                                'Фирменный (дефолт)';
                        const currentColorPreview = currentTheme === 'custom' && customColor ? customColor : 'transparent';
                        return `<div class="qc-settings-section">
                            <div class="qc-section-title">${item.title}</div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                    <button class="qc-theme-btn ${currentTheme === 'default' ? 'qc-active-theme' : ''}" data-theme="default" style="background: ${currentTheme === 'default' ? getThemeColors('default').tabActiveGradient1 : getThemeColors('default').btnBg}; color: ${currentTheme === 'default' ? '#fff' : getThemeColors('default').btnColor};">
                                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #0d1b2a, #1b2d45); vertical-align: middle; margin-right: 8px; border: 1px solid rgba(0,255,255,0.3);"></span>
                                        Фирменный
                                        ${currentTheme === 'default' ? ' ✅' : ''}
                                    </button>
                                    <button class="qc-theme-btn ${currentTheme === 'pinky' ? 'qc-active-theme' : ''}" data-theme="pinky" style="background: ${currentTheme === 'pinky' ? getThemeColors('pinky').tabActiveGradient1 : getThemeColors('pinky').btnBg}; color: ${currentTheme === 'pinky' ? '#fff' : getThemeColors('pinky').btnColor};">
                                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #2d1b2a, #4a2d45); vertical-align: middle; margin-right: 8px; border: 1px solid rgba(255,105,180,0.3);"></span>
                                        Пикми
                                        ${currentTheme === 'pinky' ? ' ✅' : ''}
                                    </button>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid ${getThemeColors(currentTheme).borderColor};">
                                    <span style="font-family: Oswald, sans-serif; font-size: 11px; color: ${getThemeColors(currentTheme).textColor}; opacity: 0.7;">Свой цвет:</span>
                                    <div class="qc-color-input-container">
                                        <input type="color" id="qc-color-picker" class="qc-color-input" value="${customColor || '#4dd0e1'}">
                                        <input type="text" id="qc-color-text" class="qc-color-text-input" placeholder="HEX код (например: FF5733)" value="${customColor ? customColor.replace('#', '') : ''}">
                                        <button class="qc-color-apply-btn" id="qc-color-apply">Применить</button>
                                        ${customColor ? `<button class="qc-color-remove-btn" id="qc-color-remove">✕ Удалить</button>` : ''}
                                        <span class="qc-color-preview" id="qc-color-preview" style="background-color: ${customColor || 'transparent'};"></span>
                                    </div>
                                </div>
                                <div style="font-family: Verdana, sans-serif; font-size: 11px; color: ${getThemeColors(currentTheme).textColor}; opacity: 0.5; margin-top: 2px;">
                                    Текущая тема: <strong style="color: ${getThemeColors(currentTheme).textStrong};">${currentThemeName}</strong>
                                    ${currentTheme === 'custom' && customColor ? ` (${customColor})` : ''}
                                </div>
                            </div>
                        </div>`;
                    }
                    if (item.isBackground) {
                        const hasBg = customBgImage !== null;
                        return `<div class="qc-settings-section">
                            <div class="qc-section-title">${item.title}</div>
                            <div class="qc-bg-preview" style="background-image: ${hasBg ? `url('${customBgImage}')` : 'none'};">
                                ${hasBg ? `<img src="${customBgImage}" alt="Фон">` : `<span class="qc-bg-empty">Фоновое изображение не установлено</span>`}
                            </div>
                            <div class="qc-bg-actions">
                                <label class="qc-bg-upload-btn" style="cursor: pointer;">
                                    📁 ${hasBg ? 'Заменить' : 'Загрузить'}
                                    <input type="file" id="qc-bg-upload" accept="image/*" style="display: none;">
                                </label>
                                ${hasBg ? `<button class="qc-bg-remove-btn" id="qc-bg-remove">🗑️ Удалить</button>` : ''}
                            </div>
                            <div style="font-family: Verdana, sans-serif; font-size: 11px; color: ${getThemeColors(currentTheme).textColor}; opacity: 0.5; margin-top: 8px;">
                                ${hasBg ? '✅ Фоновое изображение установлено.' : 'Загрузите изображение для кастомного фона.'}
                            </div>
                        </div>`;
                    }
                    return '';
                }).join('');

                content = `<div style="display: flex; flex-direction: column; gap: 4px;">${buttonsHtml}</div>`;
            } else if (id === '3') {
                const items = cat.items || [];
                let buttonsHtml = '';

                const sortedItems = items.slice().sort((a, b) => {
                    if (a.isServer && b.isServer) return a.serverId - b.serverId;
                    return 0;
                });

                buttonsHtml = sortedItems.map(item => {
                    const isServer = item.isServer;
                    if (isServer) {
                        return `<button class="qc-btn qc-btn-server qc-btn" data-idx="${item.idx}">
                            <span class="qc-server-btn">
                                <span class="qc-server-id-wrap">
                                    <span class="qc-server-id">${String(item.serverId).padStart(2, '0')}</span>
                                </span>
                                <span class="qc-server-name-wrap">
                                    <span class="qc-server-name">${item.serverName}</span>
                                </span>
                            </span>
                        </button>`;
                    }
                    return `<button class="qc-btn qc-btn" data-idx="${item.idx}">${item.title}</button>`;
                }).join('');

                content = `
                    <div class="qc-search-container">
                        <input type="text" class="qc-search-input" id="qc-server-search" placeholder="🔍 Поиск по номеру или названию сервера...">
                    </div>
                    <div class="qc-grid-inner" id="qc-server-list">${buttonsHtml}</div>
                `;
            } else {
                const items = cat.items || [];
                let buttonsHtml = '';
                if (items.length === 0) {
                    buttonsHtml = `<div class="qc-empty">Нет доступных шаблонов</div>`;
                } else {
                    const archiveIdx = items.findIndex(item => item.title === 'В «Заявки с окончательными ответами»');
                    const returnKKIdx = items.findIndex(item => item.title === 'Вернуть в раздел КК');

                    const sortedItems = [];
                    items.forEach((item, idx) => {
                        if (idx === archiveIdx) return;
                        if (idx === returnKKIdx) return;
                        sortedItems.push({ ...item, originalIdx: idx });
                    });

                    if (archiveIdx !== -1) {
                        sortedItems.push({ ...items[archiveIdx], originalIdx: archiveIdx, isArchive: true });
                    }
                    if (returnKKIdx !== -1) {
                        sortedItems.push({ ...items[returnKKIdx], originalIdx: returnKKIdx, isReturnKK: true });
                    }

                    buttonsHtml = sortedItems.map(item => {
                        const isServer = item.isServer;
                        if (isServer) {
                            return `<button class="qc-btn qc-btn-server qc-btn" data-idx="${item.originalIdx}">
                                <span class="qc-server-btn">
                                    <span class="qc-server-id-wrap">
                                        <span class="qc-server-id">${String(item.serverId).padStart(2, '0')}</span>
                                    </span>
                                    <span class="qc-server-name-wrap">
                                        <span class="qc-server-name">${item.serverName}</span>
                                    </span>
                                </span>
                            </button>`;
                        }
                        if (item.isArchive) {
                            return `<button class="qc-btn qc-btn-archive qc-btn" data-idx="${item.originalIdx}">
                                📦 ${item.title}
                            </button>`;
                        }
                        if (item.isReturnKK) {
                            return `<button class="qc-btn qc-btn-archive qc-btn" id="qc-return-kk-btn" data-idx="${item.originalIdx}">
                                🔄 ${item.title}
                            </button>`;
                        }
                        const hasReturn = item.showReturnOption || item.isCustomText || item.hasLightning;
                        const showLightning = hasReturn && !item.needsReason;
                        return `<button class="qc-btn qc-btn" data-idx="${item.originalIdx}">
                            ${showLightning ? '<span class="qc-lightning">⚡</span> ' : ''}${item.title}
                        </button>`;
                    }).join('');
                }
                content = `<div class="qc-grid-inner">${buttonsHtml}</div>`;
            }

            return `<div class="qc-panel ${currentTab === id ? 'qc-active' : ''}" id="qc-panel-${id}">${content}</div>`;
        }).join('');

        overlay.innerHTML = `
            <div class="qc-modal">
                <div class="qc-header">
                    <div class="qc-header-top">
                        <div class="qc-title">
                            <img src="https://icons.iconarchive.com/icons/thesquid.ink/free-flat-sample/128/support-icon.png">
                            Контроль Качества
                            <span>v0.2.67</span>
                        </div>
                        <div class="qc-header-actions">
                            <button class="qc-settings-icon" id="qc-settings-btn" title="Настройки">⚙️</button>
                            <div class="qc-counter">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                <span id="qc-counter">${Storage.get('qc_answers_count', 0)}</span>
                            </div>
                            <button id="qc-find-dups" class="qc-action-btn qc-btn-blue" style="padding: 4px 14px; font-size: 10px;">🔍 ДУБЛИКАТЫ</button>
                            <button class="qc-close-btn">✕</button>
                        </div>
                    </div>
                    <div class="qc-tabs">${tabsHtml}</div>
                </div>
                <div class="qc-body">${panelsHtml}</div>
                <div class="qc-footer">
                    Hello, <span class="qc-username">${username}</span>
                </div>
            </div>
        `;

        // Обработчик для кнопки настроек (шестеренки)
        const settingsBtn = overlay.querySelector('#qc-settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => {
                const settingsPanel = overlay.querySelector('#qc-panel-4');
                if (settingsPanel) {
                    const isVisible = settingsPanel.classList.contains('qc-active');
                    overlay.querySelectorAll('.qc-panel').forEach(p => p.classList.remove('qc-active'));
                    overlay.querySelectorAll('.qc-tab').forEach(t => t.classList.remove('qc-active'));
                    if (!isVisible) {
                        settingsPanel.classList.add('qc-active');
                        const tabsContainer = overlay.querySelector('.qc-tabs');
                        let settingsTab = tabsContainer.querySelector('.qc-tab-settings');
                        if (!settingsTab) {
                            settingsTab = document.createElement('button');
                            settingsTab.className = 'qc-tab qc-tab-settings qc-active';
                            settingsTab.textContent = 'НАСТРОЙКИ';
                            settingsTab.dataset.tab = '4';
                            tabsContainer.appendChild(settingsTab);
                            settingsTab.onclick = () => {
                                overlay.querySelectorAll('.qc-panel').forEach(p => p.classList.remove('qc-active'));
                                overlay.querySelectorAll('.qc-tab').forEach(t => t.classList.remove('qc-active'));
                                settingsTab.classList.add('qc-active');
                                settingsPanel.classList.add('qc-active');
                            };
                        } else {
                            settingsTab.classList.add('qc-active');
                        }
                    } else {
                        const settingsTab = overlay.querySelector('.qc-tab-settings');
                        if (settingsTab) settingsTab.remove();
                        const firstTab = overlay.querySelector('.qc-tab:not(.qc-tab-settings)');
                        if (firstTab) {
                            firstTab.classList.add('qc-active');
                            const panelId = firstTab.dataset.tab;
                            overlay.querySelector(`#qc-panel-${panelId}`).classList.add('qc-active');
                        }
                    }
                }
            };
        }

        overlay.querySelectorAll('.qc-tab:not(.qc-tab-settings)').forEach(tab => {
            tab.onclick = () => {
                overlay.querySelectorAll('.qc-panel').forEach(p => p.classList.remove('qc-active'));
                overlay.querySelectorAll('.qc-tab').forEach(t => t.classList.remove('qc-active'));
                tab.classList.add('qc-active');
                currentTab = tab.getAttribute('data-tab');
                overlay.querySelector(`#qc-panel-${currentTab}`).classList.add('qc-active');

                const settingsTab = overlay.querySelector('.qc-tab-settings');
                if (settingsTab) settingsTab.remove();

                if (currentTab === '3') {
                    const searchInput = document.getElementById('qc-server-search');
                    if (searchInput) setTimeout(() => searchInput.focus(), 100);
                }
            };
        });

        const searchInput = document.getElementById('qc-server-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                const serverList = document.getElementById('qc-server-list');
                if (!serverList) return;

                const buttons = serverList.querySelectorAll('.qc-btn');
                buttons.forEach(btn => {
                    const text = btn.textContent.toLowerCase();
                    const match = text.includes(query);
                    btn.style.display = match ? 'flex' : 'none';
                });
            });
        }

        overlay.querySelector('.qc-close-btn').onclick = () => overlay.classList.remove('qc-active');
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('qc-active'); };

        setupBackgroundUpload();
        setupCustomColor();

        const removeBgBtn = document.getElementById('qc-bg-remove');
        if (removeBgBtn) {
            removeBgBtn.onclick = () => {
                customBgImage = null;
                Storage.remove(BG_IMAGE_KEY);
                updateStyles(currentTheme);
                renderMenu();
                overlay.classList.add('qc-active');
                showCopyNotification('✅ Фоновое изображение удалено');
            };
        }

        overlay.querySelectorAll('.qc-theme-btn').forEach(btn => {
            btn.onclick = () => {
                const theme = btn.getAttribute('data-theme');
                if (theme !== currentTheme) {
                    if (theme === 'custom' && !customColor) {
                        showErrorModal(
                            'Кастомный цвет не установлен.',
                            'Сначала установите свой цвет в разделе настроек.'
                        );
                        return;
                    }
                    currentTheme = theme;
                    Storage.set(THEME_KEY, theme);
                    updateStyles(theme);
                    updateModalColors(theme);
                    renderMenu();
                    const themeName = theme === 'pinky' ? 'Пикми (розовый)' :
                                    theme === 'custom' ? 'Кастомный цвет' :
                                    'Фирменный (дефолт)';
                    showCopyNotification(`✅ Тема изменена на: ${themeName}`);
                }
            };
        });

        overlay.querySelectorAll('.qc-btn:not(.qc-theme-btn)').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const btnData = buttons[idx];

                if (btnData && btnData.title === 'Вернуть в раздел КК') {
                    overlay.classList.remove('qc-active');
                    returnToKK();
                    return;
                }

                if (btnData && (btnData.showReturnOption || btnData.isCustomText || btnData.needsReason)) {
                    overlay.classList.remove('qc-active');
                    const templateContent = btnData.content;
                    const data = getThreadData();
                    showActionModal(idx, templateContent, data);
                } else if (btnData) {
                    overlay.classList.remove('qc-active');
                    clearInputState();
                    pasteContent(idx, getThreadData(), true);
                }
            };
        });

        const findDupsBtn = overlay.querySelector('#qc-find-dups');
        if (findDupsBtn) {
            findDupsBtn.onclick = () => {
                overlay.classList.remove('qc-active');
                findQCDuplicates();
            };
        }

        setTimeout(handleReturnToKK, 50);
    }

    // ============= ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ЦВЕТОВ В МОДАЛЬНЫХ ОКНАХ =============
    function updateModalColors(theme) {
        const colors = getThemeColors(theme);

        document.querySelectorAll('.qc-reason-modal .qc-modal, .qc-text-modal .qc-modal, .qc-error-modal .qc-modal, .qc-action-modal .qc-modal').forEach(el => {
            el.style.background = `linear-gradient(145deg, ${colors.bgGradient1}, ${colors.bgGradient2})`;
            el.style.borderColor = colors.borderColor;
        });

        document.querySelectorAll('.qc-reason-modal .qc-title, .qc-text-modal .qc-title, .qc-error-modal .qc-title, .qc-action-modal .qc-title').forEach(el => {
            el.style.color = colors.titleColor;
        });

        document.querySelectorAll('.qc-reason-modal .qc-body > div, .qc-text-modal .qc-body > div').forEach(el => {
            if (el.style.color) {
                el.style.color = colors.textStrong;
            }
        });
    }

    function renderTemplate(templateStr, data) {
        let result = templateStr;
        const matches = templateStr.match(/\{\{\s*([\w.]+)\s*\}\}/g) || [];
        matches.forEach(match => {
            const key = match.replace(/\{\{\s*|\s*\}\}/g, '').trim();
            let val = data;
            for (const k of key.split('.')) {
                val = val ? val[k] : undefined;
            }
            const replacement = typeof val === 'function' ? val() : (val !== undefined ? val : '');
            result = result.replace(match, replacement);
        });
        return result;
    }

    function pasteContent(id, data = {}, send = false) {
        const btn = buttons[id];
        if (!btn) return;

        const rendered = renderTemplate(btn.content, data);

        const viewP = document.querySelector('.fr-element.fr-view p');
        if (viewP && viewP.textContent.trim() === '') viewP.innerHTML = '';
        document.querySelectorAll('span.fr-placeholder').forEach(el => el.innerHTML = '');

        const containerP = document.querySelector('div.fr-element.fr-view p');
        const containerView = document.querySelector('div.fr-element.fr-view');

        if (containerP) {
            containerP.insertAdjacentHTML('beforeend', rendered);
        } else if (containerView) {
            containerView.insertAdjacentHTML('beforeend', rendered);
        }

        const closer = document.querySelector('a.overlay-titleCloser');
        if (closer) closer.click();

        saveRecent(id);

        if (send) {
            const threadId = DOM.getThreadId();
            if (threadId) Storage.remove(`qc_draft_${threadId}`);

            const hasLightning = btn.showReturnOption || btn.isCustomText || btn.hasLightning;
            const isNarassmotrenii = btn.prefix === NARASSMOTRENII_PREFIX;

            if (btn.prefix !== null && btn.prefix !== undefined) {
                if (btn.prefix === QCUN_PREFIX) {
                    editThreadData(QCUN_PREFIX, false);
                    moveThread(QCUN_PREFIX, ARCHIVE_NODE);
                } else if (SERVER_MAP[btn.prefix]) {
                    editThreadData(TECH_PREFIX, true);
                    moveThread(TECH_PREFIX, btn.prefix);
                } else if (btn.moveToArchive || (!hasLightning && !isNarassmotrenii)) {
                    editThreadData(btn.prefix, false, true);
                } else {
                    editThreadData(btn.prefix, btn.status, false);
                }
            } else if (!hasLightning && !isNarassmotrenii) {
                autoMoveToArchive();
            }

            const bbCodeMessage = rendered.replace(/<br\s*\/?>/gi, '\n');
            ForumAPI.post(`${DOM.getThreadUrl()}add-reply`, { message: bbCodeMessage })
                .then(() => {
                    incrementCounter();
                    location.reload();
                })
                .catch(() => {
                    const replyBtn = document.querySelector('.button--icon.button--icon--reply.rippleButton');
                    if (replyBtn) replyBtn.click();
                });
        }
    }

    function saveRecent(id) {
        const btn = buttons[id];
        if (!btn || !btn.title || btn.title.includes('━━━')) return;

        let recents = Storage.get('qc_recent', []);
        recents = recents.filter(item => item.title !== btn.title);
        recents.unshift({
            title: btn.title,
            originalIdx: id,
            timestamp: Date.now()
        });
        if (recents.length > 20) recents.pop();
        Storage.set('qc_recent', recents);
    }

    function incrementCounter() {
        let count = Storage.get('qc_answers_count', 0);
        count++;
        Storage.set('qc_answers_count', count);
        const counter = document.getElementById('qc-counter');
        if (counter) counter.textContent = count;
    }

    function editThreadData(prefix, pin = false, moveToArchive = false) {
        const threadTitle = DOM.getThreadTitle();
        const threadUrl = DOM.getThreadUrl();

        const data = {
            prefix_id: prefix,
            title: threadTitle,
            _xfToken: XF.config.csrf,
            _xfRequestUri: window.location.pathname,
            _xfWithData: 1,
            _xfResponseType: 'json'
        };

        if (pin) {
            data.discussion_open = 1;
            data.sticky = 1;
        } else {
            data.discussion_open = 0;
            data.sticky = 0;
        }

        fetch(`${threadUrl}edit`, {
            method: 'POST',
            body: getFormData(data)
        }).then(() => {
            if (moveToArchive) {
                moveThread(prefix, ARCHIVE_NODE);
            }
        }).catch(() => {});
    }

    function moveThread(prefix, targetNodeId) {
        const threadTitle = DOM.getThreadTitle();
        const threadUrl = DOM.getThreadUrl();

        const data = {
            prefix_id: prefix,
            title: threadTitle,
            target_node_id: targetNodeId,
            redirect_type: 'none',
            notify_watchers: 1,
            starter_alert: 1,
            starter_alert_reason: "",
            _xfToken: XF.config.csrf,
            _xfRequestUri: window.location.pathname,
            _xfWithData: 1,
            _xfResponseType: 'json'
        };

        fetch(`${threadUrl}move`, {
            method: 'POST',
            body: getFormData(data)
        }).then(() => {
            location.reload();
        }).catch(() => {});
    }

    function getFormData(data) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        return formData;
    }

    // ============= ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ ОШИБКИ =============
    function showErrorModal(message, submessage = '') {
        const colors = getThemeColors(currentTheme);
        const oldError = document.querySelector('.qc-error-modal');
        if (oldError) oldError.remove();

        const errorModal = document.createElement('div');
        errorModal.className = 'qc-overlay qc-error-modal';
        errorModal.innerHTML = `
            <div class="qc-modal" style="max-width: 450px;">
                <div class="qc-header">
                    <div class="qc-header-top" style="padding: 12px 16px;">
                        <div class="qc-title" style="font-size: 13px;">❌ Ошибка</div>
                        <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                    </div>
                </div>
                <div class="qc-body" style="padding: 16px;">
                    <div class="qc-error-icon">⚠️</div>
                    <div class="qc-error-text">${message}</div>
                    ${submessage ? `<div class="qc-error-subtext">${submessage}</div>` : ''}
                    <div class="qc-error-center">
                        <button class="qc-error-btn" id="qc-error-ok">ПОНЯТНО</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);

        setTimeout(() => {
            errorModal.classList.add('qc-active');
        }, 100);

        errorModal.querySelector('.qc-close-btn').onclick = () => {
            errorModal.remove();
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        };
        errorModal.onclick = (e) => {
            if (e.target === errorModal) {
                errorModal.remove();
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');
            }
        };
        document.getElementById('qc-error-ok').onclick = () => {
            errorModal.remove();
            actionModal.classList.remove('qc-active');
            overlay.classList.remove('qc-active');
        };

        setTimeout(() => {
            if (errorModal.parentNode) {
                errorModal.remove();
                actionModal.classList.remove('qc-active');
                overlay.classList.remove('qc-active');
            }
        }, 10000);
    }

    // ============= ФУНКЦИЯ ДЛЯ ПОИСКА ДУБЛИКАТОВ =============
    async function findQCDuplicates() {
        const authorName = DOM.getAuthorName();
        if (!authorName) {
            alert('Не удалось определить автора темы.');
            return;
        }

        const currentThreadId = DOM.getThreadId();

        const dupModal = createDupModal();
        dupModal.open();

        const contentDiv = document.getElementById('qc-dup-content');
        contentDiv.innerHTML = `
            <div style="text-align:center; padding: 25px;">
                <div class="qc-spinner" style="display:inline-block;"></div>
                <p style="color: ${getThemeColors(currentTheme).textStrong}; margin-top: 12px; font-family: Oswald, sans-serif; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
                    Поиск обращений с префиксом "Проверено контролем качества"<br>
                    <span style="opacity:0.5; font-size:10px;">от ${authorName}</span>
                </p>
            </div>
        `;

        try {
            const html = await ForumAPI.searchThreads(authorName, QCUN_PREFIX);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const topics = [];
            doc.querySelectorAll('.contentRow').forEach(row => {
                const link = row.querySelector('.contentRow-title a');
                const timeEl = row.querySelector('time');
                if (link) {
                    const title = link.textContent.trim();
                    const href = link.getAttribute('href');
                    const dateStr = timeEl ? timeEl.textContent.trim() : '';
                    if (title && href && href.includes('/threads/')) {
                        topics.push({ title, href, dateStr });
                    }
                }
            });

            const filtered = topics.filter(t => {
                const tId = t.href.match(/\.(\d+)/);
                if (tId && tId[1] === currentThreadId) return false;
                return t.title.toLowerCase().includes('проверено контролем качества');
            });

            let finalHtml = '';

            if (filtered.length === 0) {
                finalHtml = `
                    <div style="text-align:center; padding: 30px 20px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                        <strong style="font-family: Oswald, sans-serif; font-size: 16px; text-transform: uppercase; color: ${getThemeColors(currentTheme).titleColor};">
                            Обращения с префиксом "Проверено контролем качества" не найдены
                        </strong>
                        <p style="color: ${getThemeColors(currentTheme).textStrong}; margin-top: 8px; font-size: 12px; opacity: 0.5;">
                            У пользователя ${authorName} нет закрытых обращений с префиксом "Проверено контролем качества".
                        </p>
                    </div>
                `;
            } else {
                finalHtml = `
                    <div style="background: ${getThemeColors(currentTheme).dupBg}; border: 1px solid ${getThemeColors(currentTheme).dupBorder}; padding: 8px 14px; border-radius: 8px; margin-bottom: 14px;">
                        <strong style="color: ${getThemeColors(currentTheme).textStrong}; font-family: Oswald, sans-serif; font-size: 12px; text-transform: uppercase;">
                            📋 Найдено обращений: ${filtered.length}
                        </strong>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; padding-right: 4px;">
                        ${filtered.map(t => `
                            <a href="${t.href}" target="_blank" class="qc-dup-link">
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${t.title}</span>
                                <span class="qc-dup-date">${t.dateStr}</span>
                            </a>
                        `).join('')}
                    </div>
                `;
            }

            finalHtml += `
                <div style="display: flex; gap: 8px; margin-top: 14px;">
                    <button id="qc-dup-close" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.06); color: ${getThemeColors(currentTheme).textColor}; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-family: Oswald, sans-serif; font-size: 11px; cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px;"
                            onmouseover="this.style.background='rgba(255,255,255,0.12)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                        ✕ ЗАКРЫТЬ
                    </button>
                    <button id="qc-dup-open-menu" style="flex: 1; padding: 10px; background: linear-gradient(135deg, ${getThemeColors(currentTheme).tabActiveGradient1}, ${getThemeColors(currentTheme).tabActiveGradient2}); color: #fff; border: none; border-radius: 8px; font-family: Oswald, sans-serif; font-size: 11px; cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; box-shadow: 0 4px 15px rgba(3, 169, 244, 0.25);"
                            onmouseover="this.style.filter='brightness(1.05)'; this.style.boxShadow='0 6px 25px rgba(3, 169, 244, 0.4)';"
                            onmouseout="this.style.filter='none'; this.style.boxShadow='0 4px 15px rgba(3, 169, 244, 0.25)';">
                        📋 ОТКРЫТЬ МЕНЮ
                    </button>
                </div>
            `;

            contentDiv.innerHTML = finalHtml;

            document.getElementById('qc-dup-close').onclick = () => dupModal.close();
            document.getElementById('qc-dup-open-menu').onclick = () => {
                dupModal.close();
                document.getElementById('qc-main-open-menu')?.click() || openMenuViaFab();
            };

        } catch (e) {
            console.error(e);
            contentDiv.innerHTML = `
                <div style="text-align:center; padding: 25px 20px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
                    <strong style="font-family: Oswald, sans-serif; font-size: 14px; color: ${getThemeColors(currentTheme).textStrong};">Ошибка при поиске</strong>
                    <p style="color: ${getThemeColors(currentTheme).textStrong}; margin-top: 6px; font-size: 12px; opacity: 0.5;">${e.message || 'Неизвестная ошибка'}</p>
                    <button id="qc-dup-close-error" style="margin-top: 12px; padding: 8px 24px; background: rgba(255,255,255,0.06); color: ${getThemeColors(currentTheme).textColor}; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; font-family: Oswald, sans-serif; font-size: 11px; text-transform: uppercase;">
                        ✕ ЗАКРЫТЬ
                    </button>
                </div>
            `;
            document.getElementById('qc-dup-close-error').onclick = () => dupModal.close();
        }
    }

    function createDupModal() {
        let overlay = document.getElementById('qc-dup-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'qc-dup-overlay';
            overlay.className = 'qc-overlay';
            overlay.innerHTML = `
                <div class="qc-modal" style="max-width: 580px;">
                    <div class="qc-header">
                        <div class="qc-header-top" style="padding: 12px 16px;">
                            <div class="qc-title" style="font-size: 13px;">🔍 Дубликаты</div>
                            <button class="qc-close-btn" style="width: 30px; height: 30px; font-size: 16px;">✕</button>
                        </div>
                    </div>
                    <div class="qc-body" id="qc-dup-content" style="padding: 16px;"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('.qc-close-btn').onclick = () => overlay.classList.remove('qc-active');
            overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('qc-active'); };
        }
        return {
            open: () => overlay.classList.add('qc-active'),
            close: () => overlay.classList.remove('qc-active')
        };
    }

    // ============= КОПИРОВАНИЕ ССЫЛКИ =============
    function copyThreadLink() {
        const url = window.location.href;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showCopyNotification('✅ Ссылка скопирована!');
            }).catch(() => {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopyNotification('✅ Ссылка скопирована!');
        } catch (e) {
            showCopyNotification('❌ Не удалось скопировать ссылку');
        }
        document.body.removeChild(textarea);
    }

    function showCopyNotification(text) {
        const colors = getThemeColors(currentTheme);
        const toast = document.createElement('div');
        toast.textContent = text;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors.toastBg};
            color: ${colors.toastColor};
            padding: 10px 20px;
            border-radius: 12px;
            font-family: Oswald, sans-serif;
            font-size: 14px;
            z-index: 2147483647;
            border: 1px solid ${colors.toastBorder};
            backdrop-filter: blur(10px);
            animation: fadeInOut 2s forwards;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        `;
        document.body.appendChild(toast);

        if (!document.getElementById('qc-toast-style')) {
            const style = document.createElement('style');
            style.id = 'qc-toast-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => toast.remove(), 2000);
    }

    // ============= ДОБАВЛЕНИЕ КНОПКИ КОПИРОВАНИЯ =============
    function addCopyButton() {
        if (document.getElementById('qc-copy-btn')) return;

        const pageAction = document.querySelector('.p-title-pageAction');
        if (!pageAction) return;

        const copyBtn = document.createElement('button');
        copyBtn.id = 'qc-copy-btn';
        copyBtn.className = 'qc-copy-btn';
        copyBtn.innerHTML = '<span class="qc-copy-icon">🔗</span>';
        copyBtn.title = 'Скопировать ссылку на тему';

        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copyThreadLink();
            copyBtn.classList.add('copied');
            setTimeout(() => copyBtn.classList.remove('copied'), 2000);
        });

        pageAction.appendChild(copyBtn);
        log('Кнопка копирования добавлена');
    }

    // ============= ДОБАВЛЕНИЕ КНОПКИ МЕНЮ =============

    function addButton(name, id) {
        if (document.getElementById(id)) return true;

        const replyBtn = document.querySelector('.button--icon--reply, .button--link.button--icon--reply, .button--primary.button--icon--reply, .js-quickReply-button');

        if (replyBtn && replyBtn.parentElement) {
            const existing = replyBtn.parentElement.querySelector(`#${id}`);
            if (existing) return true;

            const newBtn = document.createElement('button');
            newBtn.type = 'button';
            newBtn.id = id;
            newBtn.className = 'button rippleButton';
            newBtn.textContent = '>>>>>>>>>>>>>>>>>>>>>>МЕНЮ<<<<<<<<<<<<<<<<<<<<<<';

            newBtn.setAttribute('style', '');

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                renderMenu();
                overlay.classList.add('qc-active');
            });

            replyBtn.parentElement.insertBefore(newBtn, replyBtn);

            log('Кнопка MENU добавлена');
            return true;
        }

        return false;
    }

    // ============= ПЛАВАЮЩАЯ КНОПКА ДЛЯ МОБИЛЬНЫХ =============
    function addFloatingButton() {
        if (document.getElementById('qc-fab')) return;

        const fab = document.createElement('button');
        fab.id = 'qc-fab';
        fab.textContent = '📋';
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${getThemeColors(currentTheme).tabActiveGradient1}, ${getThemeColors(currentTheme).tabActiveGradient2});
            color: #fff;
            border: none;
            box-shadow: ${getThemeColors(currentTheme).tabActiveShadow};
            font-size: 24px;
            z-index: 9999;
            cursor: pointer;
            touch-action: manipulation;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s;
        `;

        fab.addEventListener('click', () => {
            renderMenu();
            overlay.classList.add('qc-active');
        });

        document.body.appendChild(fab);
        log('Плавающая кнопка добавлена');
    }

    // ============= ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ МЕНЮ =============
    function openMenuViaFab() {
        renderMenu();
        overlay.classList.add('qc-active');
    }

    // ============= ИНИЦИАЛИЗАЦИЯ =============

    function init() {
        log('init() запущен');

        if (!checkUserPermissions()) {
            log('Нет прав доступа');
            return;
        }
        log('Права есть');

        let buttonAdded = false;
        const tryAddButton = () => {
            if (!buttonAdded) {
                buttonAdded = addButton('', 'qc-main-open-menu');
                if (buttonAdded) {
                    log('Кнопка успешно добавлена');
                }
            }
        };

        tryAddButton();

        if (!buttonAdded) {
            const interval = setInterval(() => {
                if (!buttonAdded) {
                    tryAddButton();
                } else {
                    clearInterval(interval);
                }
            }, 2000);

            setTimeout(() => {
                clearInterval(interval);
                if (!buttonAdded) {
                    log('Не удалось добавить кнопку');
                }
            }, 10000);
        }

        setTimeout(addCopyButton, 1000);

        if (isMobileDevice()) {
            setTimeout(addFloatingButton, 1500);
        }

        const observer = new MutationObserver(() => {
            if (!document.getElementById('qc-main-open-menu')) {
                addButton('', 'qc-main-open-menu');
            }
            if (!document.getElementById('qc-copy-btn')) {
                addCopyButton();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        log('init() завершен');
    }

    log('Ожидание готовности DOM...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        if (typeof XF === 'undefined') {
            log('XF не найден, ожидание...');
            const waitForXF = setInterval(() => {
                if (typeof XF !== 'undefined') {
                    clearInterval(waitForXF);
                    log('XF найден');
                    init();
                }
            }, 500);
        } else {
            log('XF уже загружен');
            init();
        }
    }

})();
