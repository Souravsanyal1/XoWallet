const { Telegraf, Markup } = require('telegraf');
const { ethers } = require('ethers');
const { getPrices } = require('./price');
const { NETWORKS } = require('./networks');

// --- TRANSLATION ENGINE ---
const i18n = {
    en: {
        welcome: (count) => `Welcome back to EVM Multi-Chain Tracker! 🚀\n\n📊 *Total Wallets Connected:* ${count}\n\nAdvanced Management Console:`,
        add_wallet: '➕ Add',
        list_wallets: '📋 List Wallets',
        check_balances: '💰 Balances',
        dashboard: '📊 Dashboard',
        remove_wallet: '🗑️ Remove',
        help: 'ℹ️ Help',
        back: '🔙 Back',
        lang: '🌐 Language',
        paste_address: '📥 *Please paste the EVM wallet address* you want to track (starting with 0x...).',
        no_wallets: 'No wallets tracked yet. Use "Add Wallet" to start!',
        tracked_wallets: '📑 *Tracked Wallets:*',
        scanning: 'Scanning portfolio... ⏳',
        market_data: '⏳ *Fetching live market data & gas...*',
        wallet_added: (name, addr) => `✅ *Success!* Wallet Added.\n\nName: *${name}*\nAddress: \`${addr}\``,
        address_detected: (addr) => `🔍 *Address Detected!*\n\nAddress: \`${addr}\`\n\nWhat *Name* should I give to this wallet? (Send name as a message)`,
        invalid_address: '⚠️ That doesn\'t look like a valid EVM address.',
        removal_confirm: (addr) => `✅ Wallet with address \`${addr}\` has been removed.`,
        access_denied: '🚫 *Access Denied*\n\nYou must join our official channels to use this bot. Click below to join and verify.',
        joined_btn: '✅ I have Joined',
        official_channel: '📢 Official Channel',
        tx_alert_title: (network) => `*${network} Transaction*`,
        wallet_name_label: 'Wallet Name',
        usd_value_label: 'USD Value',
        from_label: 'From',
        to_label: 'To',
        view_explorer_label: 'View on Explorer',
        'Received': 'Received',
        'Sent': 'Sent',
        'Received Token': 'Received Token',
        'Sent Token': 'Sent Token',
        dev_info: '👤 Bot Developer',
        dev_text: (name, username, id) => `
👤 *Bot Developer Information*

This bot was designed and developed for advanced EVM multi-chain tracking. 

🚀 *Bot Version:* 2.1.0 (Advanced UI)
👨‍💻 *Developer:* [${name}](tg://user?id=${id}) (${username})
🌐 *Services:* Custom Bot Development, EVM Tracking Solutions.

For support or business inquiries, feel free to contact.
        `.trim(),
        favorite_off: '⭐ Favorite: Off',
        favorite_on: '⭐ Favorite: On',
        filters_btn: '⚙️ Filters',
        networks_btn: '📡 Networks',
        rename_btn: '✏️ Rename',
        delete_btn: '🗑️ Delete',
        tx_hash: 'Tx hash',
        wallet_dashboard: (name) => `*${name}*`,
        all_networks: 'FTM · AVAX · LINEA · BNB · MATIC · ETH · ARB · OPBNB · MNT · OP · PLS · ZKS · BASE · BLAST · SCROLL · SONIC · UNI · HYPE-EVM · ABST · INK · BERA · PLASMA · STORY · MON · MEGAETH'
    },
    bn: {
        welcome: (count) => `EVM মাল্টি-চেইন ট্র্যাকারে আপনাকে স্বাগতম! 🚀\n\n📊 *মোট সংযুক্ত ওয়ালেট:* ${count}\n\nঅ্যাডভান্সড ম্যানেজমেন্ট কনসোল:`,
        add_wallet: '➕ যোগ',
        list_wallets: '📋 ওয়ালেট লিস্ট',
        check_balances: '💰 ব্যালেন্স',
        dashboard: '📊 ড্যাশবোর্ড',
        remove_wallet: '🗑️ মুছুন',
        help: 'ℹ️ সাহায্য',
        back: '🔙 পিছনে',
        lang: '🌐 ভাষা',
        paste_address: '📥 *দয়া করে ওয়ালেট অ্যাড্রেসটি পেস্ট করুন* (0x দিয়ে শুরু হওয়া ৪২ অক্ষরের অ্যাড্রেস)।',
        no_wallets: 'এখনো কোনো ওয়ালেট যোগ করা হয়নি। শুরু করতে "ওয়ালেট যোগ" বাটনে ক্লিক করুন!',
        tracked_wallets: '📑 *আপনার ওয়ালেট সমূহ:*',
        scanning: 'পোর্টফোলিও স্ক্যান করা হচ্ছে... ⏳',
        market_data: '⏳ *লাইভ মার্কেট এবং গ্যাস ডাটা আনা হচ্ছে...*',
        wallet_added: (name, addr) => `✅ *সফলভাবে যোগ হয়েছে!*\n\nনাম: *${name}*\nঅ্যাড্রেস: \`${addr}\``,
        address_detected: (addr) => `🔍 *অ্যাড্রেস পাওয়া গেছে!*\n\nঅ্যাড্রেস: \`${addr}\`\n\nএই ওয়ালেটের জন্য কি *নাম* দিতে চান? (নামটি মেসেজ হিসেবে পাঠান)`,
        invalid_address: '⚠️ এটি একটি সঠিক EVM অ্যাড্রেস নয়।',
        removal_confirm: (addr) => `✅ \`${addr}\` অ্যাড্রেসটি মুছে ফেলা হয়েছে।`,
        access_denied: '🚫 *বোট এ প্রবেশ নিষেধ!*\n\nআপনি বোট এর মধ্যে এখনো জয়েন করেননি দয়া করে জয়েন করে নিন। নিচের চ্যানেলগুলোতে জয়েন করে ভেরিফাই বাটনে ক্লিক করুন।',
        joined_btn: '✅ আমি জয়েন করেছি',
        official_channel: '📢 অফিসিয়াল চ্যানেল',
        tx_alert_title: (network) => `*${network} ট্রানজেকশন*`,
        wallet_name_label: 'ওয়ালেট নাম',
        usd_value_label: 'USD ভ্যালু',
        from_label: 'প্রেরক',
        to_label: 'প্রাপক',
        view_explorer_label: 'এক্সপ্লোরারে দেখুন',
        'Received': 'গৃহীত',
        'Sent': 'প্রেরিত',
        'Received Token': 'টোকেন পাওয়া গেছে',
        'Sent Token': 'টোকেন পাঠানো হয়েছে',
        dev_info: '👤 বোট ডেভেলপার',
        dev_text: (name, username, id) => `
👤 *বোট ডেভেলপারের তথ্য*

এই বোটটি অ্যাডভান্সড EVM মাল্টি-চেইন ট্র্যাকিংয়ের জন্য ডিজাইন এবং ডেভেলপ করা হয়েছে। 

🚀 *বোট ভার্সন:* ২.১.০ (অ্যাডভান্সড UI)
👨‍💻 *ডেভেলপার:* [${name}](tg://user?id=${id}) (${username})
🌐 *সার্ভিস:* কাস্টম বোট ডেভেলপমেন্ট, EVM ট্র্যাকিং সলিউশন।

সব ধরণের সাপোর্ট বা ব্যবসায়িক জিজ্ঞাসার জন্য যোগাযোগ করতে পারেন।
        `.trim(),
        favorite_off: '⭐ ফেভারিট: অফ',
        favorite_on: '⭐ ফেভারিট: অন',
        filters_btn: '⚙️ ফিল্টার',
        networks_btn: '📡 নেটওয়ার্ক',
        rename_btn: '✏️ রিনেম',
        delete_btn: '🗑️ ডিলিট',
        tx_hash: 'Tx hash',
        wallet_dashboard: (name) => `*${name}*`,
        all_networks: 'FTM · AVAX · LINEA · BNB · MATIC · ETH · ARB · OPBNB · MNT · OP · PLS · ZKS · BASE · BLAST · SCROLL · SONIC · UNI · HYPE-EVM · ABST · INK · BERA · PLASMA · STORY · MON · MEGAETH'
    }
};

/**
 * Sets up the Telegraf bot and defines command handlers.
 */
function setupBot(token, wallets, onAddWallet, onRemoveWallet, getUserLanguage, setUserLanguage, onRename, onToggleFavorite) {
    const bot = new Telegraf(token);

    // --- CACHES ---
    const userLanguageCache = new Map(); // userId -> lang code ('en'/'bn')
    const userMembershipCache = new Map(); // userId -> { lastCheck: timestamp, mustJoin: [] }
    const MEM_CACHE_TTL = 300000; // 5 minutes

    let devCache = {
        name: '𝚂𝙾𝚄𝚁𝙰𝚅 𝚂𝙰𝙽𝚈𝙰𝙻 𝐬❶',
        username: '@SouravSanyal',
        photoId: null,
        lastFetch: 0,
        isFetching: false
    };

    // Helper: Escape Markdown special characters to prevent "Bad Request: can't parse entities"
    const escapeMarkdown = (text) => {
        if (!text) return '';
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    };

    // Helper: API Timeout Wrapper (prevents hangs)
    const withTimeout = (promise, ms = 5000) => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), ms));
        return Promise.race([promise, timeout]);
    };

    const CHANNELS = [
        { id: process.env.CHANNEL_1_ID, link: process.env.CHANNEL_1_LINK },
        { id: process.env.CHANNEL_2_ID, link: process.env.CHANNEL_2_LINK }
    ].filter(c => c.id && c.id !== '@channel1_username' && c.id !== '');

    // Helper to get text based on user preference
    const getText = async (ctx, key, ...args) => {
        const userId = ctx?.from?.id;
        let lang = 'en';

        if (userId) {
            if (userLanguageCache.has(userId)) {
                lang = userLanguageCache.get(userId);
            } else {
                try {
                    lang = await getUserLanguage(userId) || 'en';
                    userLanguageCache.set(userId, lang);
                } catch (e) {
                    lang = 'en';
                }
            }
        }

        const template = i18n[lang][key] || i18n['en'][key] || key;
        const escapedArgs = args.map(arg => typeof arg === 'string' ? escapeMarkdown(arg) : arg);
        return typeof template === 'function' ? template(...escapedArgs) : template;
    };



    const getPersistentMenu = async (ctx) => {
        const add = await getText(ctx, 'add_wallet');
        const list = await getText(ctx, 'list_wallets');
        const bal = await getText(ctx, 'check_balances');
        const dash = await getText(ctx, 'dashboard');
        const lang = await getText(ctx, 'lang');
        const help = await getText(ctx, 'help');
        const rem = await getText(ctx, 'remove_wallet');
        const dev = await getText(ctx, 'dev_info');

        return Markup.keyboard([
            [add, list, bal],
            [lang, help, dash],
            [rem],
            [dev]
        ]).resize().persistent();
    };

    const getBackButton = async (ctx) => Markup.inlineKeyboard([Markup.button.callback(await getText(ctx, 'back'), 'menu_home')]);

    // State
    const pendingAdditions = new Map(); // chatId -> address
    const waitingForAddress = new Set(); // chatId
    const pendingRenames = new Map(); // chatId -> address

    // --- INTERACTION HANDLERS ---

    const handleHome = async (ctx) => {
        const msg = await getText(ctx, 'welcome', wallets.length);
        const menu = await getPersistentMenu(ctx);
        if (ctx.callbackQuery) {
            try {
                await ctx.answerCbQuery();
            } catch (e) { }
        }
        await ctx.reply(msg, {
            parse_mode: 'Markdown',
            reply_markup: menu.reply_markup
        });
    };

    const handleAdd = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery();
        waitingForAddress.add(ctx.chat.id);
        const msg = await getText(ctx, 'paste_address');
        const back = await getBackButton(ctx);
        if (ctx.callbackQuery) {
            try { await ctx.editMessageText(msg, { parse_mode: 'Markdown', ...back }); }
            catch (e) { await ctx.reply(msg, { parse_mode: 'Markdown', ...back }); }
        } else {
            await ctx.reply(msg, { parse_mode: 'Markdown', ...back });
        }
    };

    const handleList = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery();
        const back = await getBackButton(ctx);
        if (wallets.length === 0) {
            const msg = await getText(ctx, 'no_wallets');
            if (ctx.callbackQuery) return ctx.editMessageText(msg, back);
            return ctx.reply(msg, back);
        }

        const listText = await getText(ctx, 'tracked_wallets');
        const buttons = wallets.map(w => [Markup.button.callback(w.name, `wallet_info:${w.address}`)]);
        buttons.push([Markup.button.callback(await getText(ctx, 'back'), 'menu_home')]);

        const menu = Markup.inlineKeyboard(buttons);
        if (ctx.callbackQuery) {
            try { await ctx.editMessageText(listText, { parse_mode: 'Markdown', ...menu }); }
            catch (e) { await ctx.reply(listText, { parse_mode: 'Markdown', ...menu }); }
        } else {
            await ctx.reply(listText, { parse_mode: 'Markdown', ...menu });
        }
    };

    const handleWalletInfo = async (ctx, address) => {
        const wallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
        if (!wallet) return ctx.answerCbQuery('Wallet not found');

        const title = await getText(ctx, 'wallet_dashboard', wallet.name);
        const networks = await getText(ctx, 'all_networks');
        const favBtn = wallet.isFavorite ? await getText(ctx, 'favorite_on') : await getText(ctx, 'favorite_off');

        const msg = `
*${wallet.name}*
${networks}

\`${wallet.address}\`
        `.trim();

        const menu = Markup.inlineKeyboard([
            [Markup.button.callback(favBtn, `wallet_fav:${address}`)],
            [Markup.button.callback(await getText(ctx, 'filters_btn'), `wallet_filters:${address}`), Markup.button.callback(await getText(ctx, 'networks_btn'), `wallet_nets:${address}`)],
            [Markup.button.callback(await getText(ctx, 'rename_btn'), `wallet_rename:${address}`)],
            [Markup.button.callback(await getText(ctx, 'delete_btn'), `confirm_delete_init:${address}`)],
            [Markup.button.callback(await getText(ctx, 'back'), 'menu_list')]
        ]);

        if (ctx.callbackQuery) {
            try { await ctx.editMessageText(msg, { parse_mode: 'Markdown', ...menu }); }
            catch (e) { await ctx.reply(msg, { parse_mode: 'Markdown', ...menu }); }
        } else {
            await ctx.reply(msg, { parse_mode: 'Markdown', ...menu });
        }
    };

    const handleDashboard = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery('📡');
        const back = await getBackButton(ctx);
        const loadingMsg = await getText(ctx, 'market_data');
        if (ctx.callbackQuery) { try { await ctx.editMessageText(loadingMsg, { parse_mode: 'Markdown', ...back }); } catch (e) { } }
        else { await ctx.reply(loadingMsg, { parse_mode: 'Markdown', ...back }); }

        const prices = await getPrices();
        const now = new Date().toLocaleTimeString();
        const lang = await getUserLanguage(ctx.from?.id) || 'en';

        let status = lang === 'bn' ? '📊 *লাইভ মার্কেট ড্যাশবোর্ড*\n\n' : '📊 *Live Market Dashboard*\n\n';
        for (const [symbol, data] of Object.entries(prices)) {
            const trend = data.change >= 0 ? '🟢' : '🔴';
            const sign = data.change >= 0 ? '+' : '';
            status += `${trend} *${symbol}:* $${data.price.toLocaleString()} (${sign}${data.change.toFixed(2)}%)\n`;
        }

        status += lang === 'bn' ? '\n⛽ *লাইভ গ্যাস প্রাইস:*\n' : '\n⛽ *Live Gas Prices:*\n';
        for (const network of Object.values(NETWORKS)) {
            if (network.isGasTracked && !network.testnet) {
                try {
                    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                    const fee = await provider.getFeeData();
                    status += `  ${network.color} *${network.name}:* ${parseFloat(ethers.formatUnits(fee.gasPrice || 0, 'gwei')).toFixed(1)} Gwei\n`;
                } catch (e) { }
            }
        }
        status += lang === 'bn' ? `\n✅ *স্ট্যাটাস:* অনলাইন\n🕒 *আপডেট:* ${now}` : `\n✅ *Status:* Online\n🕒 *Updated:* ${now}`;

        const dashboardMenu = await getBackButton(ctx);
        if (ctx.callbackQuery) {
            try { await ctx.editMessageText(status, { parse_mode: 'Markdown', ...dashboardMenu }); }
            catch (e) { await ctx.reply(status, { parse_mode: 'Markdown', ...dashboardMenu }); }
        } else {
            await ctx.reply(status, { parse_mode: 'Markdown', ...dashboardMenu });
        }
    };

    const handleBalance = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery('⏳');
        const back = await getBackButton(ctx);
        if (wallets.length === 0) return ctx.reply(await getText(ctx, 'no_wallets'), back);

        const lang = await getUserLanguage(ctx.from?.id) || 'en';
        const loadingTxt = lang === 'bn' ? '⏳ *ব্যালেন্স স্ক্যান করা হচ্ছে...*' : '⏳ *Fetching multi-chain balances...*';
        const statusMsg = await ctx.reply(loadingTxt, { parse_mode: 'Markdown' });

        try {
            const prices = await getPrices();
            let totalMainnetUsd = 0;
            let totalTestnetUsd = 0;
            let report = lang === 'bn' ? '💰 *মাল্টি-চেইন পোর্টফোলিও ব্যালেন্স*\n\n' : '💰 *Multi-Chain Portfolio Balance*\n\n';

            const mainAssetTotals = {};
            const testAssetTotals = {};

            for (const wallet of wallets) {
                report += `👤 *Wallet:* ${wallet.name}\n\`${wallet.address}\`\n\n`;
                let walletMainnetUsd = 0;
                let walletMainnetInfo = '';
                let walletTestnetInfo = '';

                for (const network of Object.values(NETWORKS)) {
                    try {
                        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                        const nativeBalance = await provider.getBalance(wallet.address);
                        const nativeAmount = parseFloat(ethers.formatEther(nativeBalance));
                        const priceData = prices[network.symbol] || { price: 0 };
                        const nativeUsdValue = nativeAmount * priceData.price;

                        const usdtContract = new ethers.Contract(network.usdtAddress, [
                            "function balanceOf(address) view returns (uint256)",
                            "function decimals() view returns (uint8)"
                        ], provider);

                        let usdtAmount = 0;
                        try {
                            const usdtBalance = await usdtContract.balanceOf(wallet.address);
                            let decimals = 6;
                            try { decimals = await usdtContract.decimals(); } catch (e) { }
                            usdtAmount = parseFloat(ethers.formatUnits(usdtBalance, decimals));
                        } catch (e) { }

                        if (nativeAmount > 0.0001 || usdtAmount > 0.1) {
                            let line = `  ${network.color} *${network.name}:*\n`;
                            if (nativeAmount > 0.0001) {
                                line += `    - ${nativeAmount.toFixed(4)} ${network.symbol} (~$${nativeUsdValue.toFixed(2)})\n`;
                                if (network.testnet) testAssetTotals[network.symbol] = (testAssetTotals[network.symbol] || 0) + nativeAmount;
                                else mainAssetTotals[network.symbol] = (mainAssetTotals[network.symbol] || 0) + nativeAmount;
                            }
                            if (usdtAmount > 0.1) {
                                line += `    - ${usdtAmount.toFixed(2)} USDT\n`;
                                if (network.testnet) testAssetTotals['USDT'] = (testAssetTotals['USDT'] || 0) + usdtAmount;
                                else mainAssetTotals['USDT'] = (mainAssetTotals['USDT'] || 0) + usdtAmount;
                            }

                            if (network.testnet) {
                                walletTestnetInfo += line;
                                totalTestnetUsd += (nativeUsdValue + usdtAmount);
                            } else {
                                walletMainnetInfo += line;
                                walletMainnetUsd += (nativeUsdValue + usdtAmount);
                            }
                        }
                    } catch (err) { }
                }

                if (walletMainnetInfo) {
                    report += lang === 'bn' ? `🌐 *মেইননেট এসেট:*\n${walletMainnetInfo}` : `🌐 *Mainnet Assets:*\n${walletMainnetInfo}`;
                    report += lang === 'bn' ? `💵 *মেইননেট মোট:* $${walletMainnetUsd.toFixed(2)}\n\n` : `💵 *Mainnet Total:* $${walletMainnetUsd.toFixed(2)}\n\n`;
                    totalMainnetUsd += walletMainnetUsd;
                }
                if (walletTestnetInfo) report += lang === 'bn' ? `🧪 *টেস্টনেট এসেট:*\n${walletTestnetInfo}\n` : `🧪 *Testnet Assets:*\n${walletTestnetInfo}\n`;
                report += `────────────────────\n`;
            }

            report += lang === 'bn' ? `📊 *মোট এসেট সামারি:*\n\n` : `📊 *Total Asset Summary:*\n\n`;
            if (Object.keys(mainAssetTotals).length > 0) {
                report += lang === 'bn' ? `🌐 *মেইননেট মোট:*\n` : `🌐 *Mainnet Totals:*\n`;
                for (const [symbol, amount] of Object.entries(mainAssetTotals)) {
                    const price = symbol === 'USDT' ? 1 : (prices[symbol]?.price || 0);
                    report += `  • ${amount.toFixed(4)} ${symbol} (~$${(amount * price).toFixed(2)})\n`;
                }
            }
            if (Object.keys(testAssetTotals).length > 0) {
                report += lang === 'bn' ? `\n🧪 *টেস্টনেট মোট (ভ্যালু):*\n` : `\n🧪 *Testnet Totals (Valuation):*\n`;
                for (const [symbol, amount] of Object.entries(testAssetTotals)) {
                    const price = symbol === 'USDT' ? 1 : (prices[symbol]?.price || 0);
                    report += `  • ${amount.toFixed(4)} ${symbol} (~$${(amount * price).toFixed(2)})\n`;
                }
            }

            report += `────────────────────\n`;
            report += lang === 'bn' ? `💰 *পোর্টফোলিও মোট:* $${totalMainnetUsd.toFixed(2)}\n` : `💰 *Portfolio Total:* $${totalMainnetUsd.toFixed(2)}\n`;
            report += lang === 'bn' ? `🧪 *টেস্টনেট ভ্যালু:* $${totalTestnetUsd.toFixed(2)}\n\n` : `🧪 *Testnet Valuation:* $${totalTestnetUsd.toFixed(2)}\n\n`;
            report += lang === 'bn' ? `🏁 *একত্রে মোট ভ্যালু: $${(totalMainnetUsd + totalTestnetUsd).toFixed(2)}*` : `🏁 *Total Combined Value: $${(totalMainnetUsd + totalTestnetUsd).toFixed(2)}*`;

            try { await bot.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id); } catch (e) { }
            await ctx.reply(report, { parse_mode: 'Markdown', ...back });
        } catch (error) {
            console.error('Balance Calculation Error:', error);
            await ctx.reply(lang === 'bn' ? '❌ এরর। দয়া করে আবার চেষ্টা করুন।' : '❌ Error calculating balances.', back);
        }
    };

    const handleDelete = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery();
        const back = await getBackButton(ctx);
        if (wallets.length === 0) return ctx.reply(await getText(ctx, 'no_wallets'), back);
        const lang = await getUserLanguage(ctx.from?.id) || 'en';
        const buttons = wallets.map(w => [Markup.button.callback(`${lang === 'bn' ? '🗑️ মুছুন' : '🗑️ Delete'} ${w.name}`, `confirm_delete:${w.address}`)]);
        buttons.push([Markup.button.callback(await getText(ctx, 'back'), 'menu_home')]);
        await ctx.reply(lang === 'bn' ? 'একটি ওয়ালেট মুছুন:' : 'Select a wallet to remove:', Markup.inlineKeyboard(buttons));
    };

    const handleHelp = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery();
        const lang = await getUserLanguage(ctx.from?.id) || 'en';
        const help = lang === 'bn' ? `
ℹ️ *ট্র্যাকার তথ্য*

১. *ওয়ালেট যোগ:* যেকোনো 0x অ্যাড্রেস পেস্ট করে ট্র্যাক করুন।
২. *ড্যাশবোর্ড:* লাইভ প্রাইস এবং গ্যাস দেখুন।
৩. *ব্যালেন্স:* ৯টি নেটওয়ার্কের ব্যালেন্স চেক করুন।

*চ্যানেলে জয়েন:* বোট ব্যবহারের জন্য অবশ্যই আমাদের চ্যানেলে জয়েন থাকতে হবে।
        `.trim() : `
ℹ️ *Tracker Information*

1. *Add Wallet:* Paste any 0x address to track it.
2. *Dashboard:* Live native token prices and gas.
3. *Balances:* Valuation across 9 networks.

*Mandatory Channel Join:* You must be a member of our channels to access bot features.
        `.trim();
        await ctx.reply(help, { parse_mode: 'Markdown', ...await getBackButton(ctx) });
    };

    const handleLangMenu = async (ctx) => {
        if (ctx.callbackQuery) await ctx.answerCbQuery();
        const menu = Markup.inlineKeyboard([
            [Markup.button.callback('🇺🇸 English', 'set_lang_en'), Markup.button.callback('🇧🇩 বাংলা', 'set_lang_bn')],
            [Markup.button.callback(await getText(ctx, 'back'), 'menu_home')]
        ]);
        const msg = (await getUserLanguage(ctx.from?.id) || 'en') === 'bn' ? 'দয়া করে ভাষা সিলেক্ট করুন:' : 'Please select your language:';
        if (ctx.callbackQuery) { try { await ctx.editMessageText(msg, menu); } catch (e) { await ctx.reply(msg, menu); } }
        else { await ctx.reply(msg, menu); }
    };

    const handleDevInfo = async (ctx) => {
        const devId = '6427121076';
        const now = Date.now();
        const CACHE_TTL = 3600000; // 1 hour

        // 1. If we are currently fetching, don't start another request (spam protection)
        if (devCache.isFetching) {
            const msg = await getText(ctx, 'dev_text', devCache.name, devCache.username, devId);
            const back = await getPersistentMenu(ctx);
            return ctx.reply(msg, { parse_mode: 'Markdown', ...back });
        }

        // 2. If cache is fresh, use it
        if (now - devCache.lastFetch < CACHE_TTL && devCache.lastFetch !== 0) {
            const msg = await getText(ctx, 'dev_text', devCache.name, devCache.username, devId);
            const back = await getPersistentMenu(ctx);
            if (devCache.photoId) {
                return ctx.replyWithPhoto(devCache.photoId, { caption: msg, parse_mode: 'Markdown', ...back });
            }
            return ctx.reply(msg, { parse_mode: 'Markdown', ...back });
        }

        // 3. Otherwise fetch and update cache with locking
        devCache.isFetching = true;
        try {
            const devInfo = await withTimeout(bot.telegram.getChat(devId), 5000);
            devCache.name = devInfo.first_name + (devInfo.last_name ? ' ' + devInfo.last_name : '');
            devCache.username = devInfo.username ? `@${devInfo.username}` : 'N/A';

            try {
                const photos = await withTimeout(bot.telegram.getUserProfilePhotos(devId, 0, 1), 5000);
                if (photos && photos.total_count > 0) {
                    devCache.photoId = photos.photos[0][0].file_id;
                }
            } catch (pErr) { }
            devCache.lastFetch = now;
        } catch (error) {
            console.error('Dev Info Fetch Error:', error.message);
        } finally {
            devCache.isFetching = false;
        }

        const msg = await getText(ctx, 'dev_text', devCache.name, devCache.username, devId);
        const back = await getPersistentMenu(ctx);

        if (devCache.photoId) {
            await ctx.replyWithPhoto(devCache.photoId, { caption: msg, parse_mode: 'Markdown', ...back });
        } else {
            await ctx.reply(msg, { parse_mode: 'Markdown', ...back });
        }
    };

    // --- CHANNEL VERIFICATION MIDDLEWARE ---

    async function checkUserMembership(userId) {
        if (CHANNELS.length === 0) return [];

        // Check cache first
        const now = Date.now();
        const cached = userMembershipCache.get(userId);
        if (cached && (now - cached.lastCheck < MEM_CACHE_TTL)) {
            return cached.mustJoin;
        }

        let mustJoin = [];
        for (const channel of CHANNELS) {
            try {
                const member = await withTimeout(bot.telegram.getChatMember(channel.id, userId), 5000);
                const isMember = ['member', 'administrator', 'creator', 'restricted'].includes(member.status);
                if (!isMember) mustJoin.push(channel);
            } catch (e) {
                console.error(`Membership Check Exception for ${channel.id}:`, e.message);
            }
        }

        // Update cache
        userMembershipCache.set(userId, { lastCheck: now, mustJoin });
        return mustJoin;
    }

    bot.use(async (ctx, next) => {
        if (CHANNELS.length === 0) return next();
        if (!ctx.from || ctx.from.is_bot) return next();
        if (ctx.callbackQuery && (ctx.callbackQuery.data === 'check_join' || ctx.callbackQuery.data.startsWith('set_lang_'))) return next();

        const mustJoin = await checkUserMembership(ctx.from.id);
        if (mustJoin.length > 0) {
            const buttons = mustJoin.map((c, i) => [Markup.button.url(`📢 Join Channel ${i + 1}`, c.link)]);
            buttons.push([Markup.button.callback(await getText(ctx, 'joined_btn'), 'check_join')]);
            const msg = await getText(ctx, 'access_denied');
            if (ctx.callbackQuery) {
                await ctx.answerCbQuery('📢', { show_alert: true });
                try { await ctx.editMessageText(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }); }
                catch (e) { await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }); }
            } else { await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }); }
            return;
        }
        return next();
    });

    bot.action('check_join', async (ctx) => {
        // Clear cache on explicit check request to ensure refresh
        userMembershipCache.delete(ctx.from?.id);

        const mustJoin = await checkUserMembership(ctx.from.id);
        if (mustJoin.length > 0) {
            const lang = await getUserLanguage(ctx.from?.id) || 'en';
            return ctx.answerCbQuery(lang === 'bn' ? '❌ আগে সব চ্যানেলে জয়েন করুন!' : '❌ Join all channels first!', { show_alert: true });
        }
        await ctx.answerCbQuery('✅');
        await handleHome(ctx);
    });

    // --- BOOTSTRAP & REGISTRATION ---

    bot.start(handleHome);
    bot.action('menu_home', handleHome);
    bot.action('menu_add', handleAdd);
    bot.action('menu_list', handleList);
    bot.action('menu_dashboard', handleDashboard);
    bot.action('menu_balance', handleBalance);
    bot.action('menu_delete', handleDelete);
    bot.action('menu_help', handleHelp);
    bot.action('menu_lang', handleLangMenu);

    bot.action('set_lang_en', async (ctx) => {
        await setUserLanguage(ctx.from.id, 'en');
        userLanguageCache.set(ctx.from.id, 'en');
        await ctx.answerCbQuery('Language set to English 🇺🇸');
        await handleHome(ctx);
    });

    bot.action('set_lang_bn', async (ctx) => {
        await setUserLanguage(ctx.from.id, 'bn');
        userLanguageCache.set(ctx.from.id, 'bn');
        await ctx.answerCbQuery('ভাষা বাংলা সেট করা হয়েছে 🇧🇩');
        await handleHome(ctx);
    });

    bot.command('add', handleAdd);
    bot.command('list', handleList);
    bot.command('balances', handleBalance);
    bot.command('dashboard', handleDashboard);
    bot.command('delete', handleDelete);
    bot.command('help', handleHelp);
    bot.command('lang', handleLangMenu);

    bot.hears(/➕ Add|➕ যোগ/, handleAdd);
    bot.hears(/📋 List Wallets|📋 ওয়ালেট লিস্ট/, handleList);
    bot.hears(/💰 Balances|💰 ব্যালেন্স/, handleBalance);
    bot.hears(/📊 Dashboard|📊 ড্যাশবোর্ড/, handleDashboard);
    bot.hears(/🗑️ Remove|🗑️ মুছুন/, handleDelete);
    bot.hears(/ℹ️ Help|ℹ️ সাহায্য/, handleHelp);
    bot.hears(/🌐 Language|🌐 ভাষা/, handleLangMenu);
    bot.hears(/👤 Bot Developer|👤 বোট ডেভেলপার/, handleDevInfo);

    bot.action('menu_list', handleList);
    bot.action(/^wallet_info:(.+)$/, async (ctx) => {
        await ctx.answerCbQuery();
        await handleWalletInfo(ctx, ctx.match[1]);
    });
    bot.action(/^confirm_delete_init:(.+)$/, async (ctx) => {
        const address = ctx.match[1];
        await ctx.answerCbQuery();
        const msg = (await getText(ctx, 'lang') === 'bn') ? `⚠️ আপনি কি নিশ্চিত যে আপনি \`${address}\` ওয়ালেটটি মুছতে চান?` : `⚠️ Are you sure you want to delete wallet \`${address}\`?`;
        const menu = Markup.inlineKeyboard([
            [Markup.button.callback('🗑️ Yes, Delete', `confirm_delete:${address}`)],
            [Markup.button.callback('🔙 No, Cancel', `wallet_info:${address}`)]
        ]);
        await ctx.editMessageText(msg, { parse_mode: 'Markdown', ...menu });
    });

    // Detect direct EVM addresses and handle naming
    bot.on('text', async (ctx) => {
        if (!ctx.message?.text) return;
        const text = ctx.message.text.trim();
        const evmRegex = /^(0x[a-fA-F0-9]{40})$/;
        const chatId = ctx.chat.id;

        if (pendingAdditions.has(chatId)) {
            const address = pendingAdditions.get(chatId);
            const name = text;
            await onAddWallet({ name, address, chatId });
            pendingAdditions.delete(chatId);
            const msg = await getText(ctx, 'wallet_added', name, address);
            const menu = await getPersistentMenu(ctx);
            return ctx.reply(msg, {
                parse_mode: 'Markdown',
                reply_markup: menu.reply_markup
            });
        }

        if (pendingRenames.has(chatId)) {
            const address = pendingRenames.get(chatId);
            const newName = text;
            await onRename(chatId, address, newName);
            pendingRenames.delete(chatId);
            const lang = await getUserLanguage(ctx.from?.id) || 'en';
            const msg = lang === 'bn' ? `✅ ওয়ালেটের নাম পরিবর্তন করে *${newName}* করা হয়েছে।` : `✅ Wallet renamed to *${newName}*.`;
            await ctx.reply(msg, { parse_mode: 'Markdown' });
            return handleWalletInfo(ctx, address);
        }

        const match = text.match(evmRegex);
        if (match) {
            const address = match[1].toLowerCase();
            pendingAdditions.set(chatId, address);
            waitingForAddress.delete(chatId);
            const msg = await getText(ctx, 'address_detected', address);
            return ctx.reply(msg, { parse_mode: 'Markdown' });
        }

        if (!text.startsWith('/')) {
            if (waitingForAddress.has(chatId)) {
                return ctx.reply(await getText(ctx, 'invalid_address'), { parse_mode: 'Markdown' });
            }
        }
    });

    // Confirm Delete Callback
    bot.action(/^confirm_delete:(.+)$/, async (ctx) => {
        try {
            const address = ctx.match[1].toLowerCase();
            await onRemoveWallet(address);
            await ctx.answerCbQuery('✅');
            const msg = await getText(ctx, 'removal_confirm', address);
            await ctx.editMessageText(msg, { parse_mode: 'Markdown', ...await getBackButton(ctx) });
        } catch (e) { }
    });

    // Dashboard Actions
    bot.action(/^wallet_fav:(.+)$/, async (ctx) => {
        const address = ctx.match[1];
        await onToggleFavorite(ctx.chat.id, address);
        await ctx.answerCbQuery('⭐');
        await handleWalletInfo(ctx, address);
    });

    bot.action(/^wallet_rename:(.+)$/, async (ctx) => {
        const address = ctx.match[1];
        await ctx.answerCbQuery('✏️');
        pendingRenames.set(ctx.chat.id, address);
        const lang = await getUserLanguage(ctx.from?.id) || 'en';
        const msg = lang === 'bn' ? `✏️ *রিনেম ওয়ালেট*\n\nবর্তমান ওয়ালেটের জন্য একটি নতুন নাম লিখুন:` : `✏️ *Rename Wallet*\n\nEnter a new name for this wallet:`;
        await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    bot.action(/^wallet_filters:(.+)$/, async (ctx) => {
        await ctx.answerCbQuery('⚙️ Coming Soon');
    });

    bot.action(/^wallet_nets:(.+)$/, async (ctx) => {
        const networks = await getText(ctx, 'all_networks');
        const lang = await getUserLanguage(ctx.from?.id) || 'en';
        const msg = lang === 'bn' ? `📡 *সাপোর্টেড নেটওয়ার্কস:*\n\n${networks}` : `📡 *Supported Networks:*\n\n${networks}`;
        await ctx.answerCbQuery();
        await ctx.reply(msg, { parse_mode: 'Markdown', ...await getBackButton(ctx) });
    });

    return bot;
}

/**
 * Sends a transaction alert using standardized formatting.
 */
async function sendTransactionAlert(bot, chatId, txData, getUserLanguage) {
    const lang = await getUserLanguage(chatId) || 'en';
    const t = (key, ...args) => {
        const template = i18n[lang][key];
        return typeof template === 'function' ? template(...args) : template || key;
    };

    const isReceived = txData.type.includes('Received');
    const typeIcon = isReceived ? '🟢' : '🔴';
    const explorerLabel = t('tx_hash');

    const msg = `
*${txData.walletName} · ${txData.network} | 🖊️*
${typeIcon} *${txData.type}: ${txData.amount} ${txData.symbol} (~$${txData.usdValue})* To: [${txData.toName || (txData.to ? txData.to.slice(0, 10) + '...' : 'Contract')}](${txData.explorerUrl})
[${explorerLabel}](${txData.explorerUrl})
    `.trim();

    await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown', disable_web_page_preview: true });
}

module.exports = { setupBot, sendTransactionAlert };
