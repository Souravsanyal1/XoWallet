require('dotenv').config();
const { ethers } = require('ethers');
const { startScanner } = require('./lib/scanner');
const { setupBot, sendTransactionAlert } = require('./lib/bot');
const { connectToDatabase, getWallets, addWallet, removeWallet, getUserLanguage, setUserLanguage, updateWalletName, toggleWalletFavorite } = require('./lib/db');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🤖 EVM Multi-Chain Tracker Bot is running!'));
app.listen(PORT, () => console.log(`🌍 Health check server listening on port ${PORT}`));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const { NETWORKS } = require('./lib/networks');

async function start() {
    try {
        console.log('🔌 Connecting to database...');
        if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env");
        await connectToDatabase(MONGODB_URI);

        console.log('🤖 Initializing bot engine...');
        let trackedWallets = await getWallets();
        console.log(`✅ Loaded ${trackedWallets.length} wallets from database.`);

        const bot = setupBot(BOT_TOKEN, trackedWallets,
            async (newWallet) => {
                await addWallet(newWallet);
                trackedWallets.push(newWallet);
                console.log(`➕ Added wallet: ${newWallet.name} (${newWallet.address})`);
            },
            async (address) => {
                await removeWallet(address);
                const index = trackedWallets.findIndex(w => w.address.toLowerCase() === address.toLowerCase());
                if (index !== -1) {
                    trackedWallets.splice(index, 1);
                }
                console.log(`🗑️ Removed wallet: ${address}`);
            },
            getUserLanguage,
            setUserLanguage,
            async (chatId, address, newName) => {
                await updateWalletName(chatId, address, newName);
                const wallet = trackedWallets.find(w => w.address.toLowerCase() === address.toLowerCase() && w.chatId === chatId);
                if (wallet) wallet.name = newName;
                console.log(`✏️ Renamed wallet ${address} to ${newName}`);
            },
            async (chatId, address) => {
                await toggleWalletFavorite(chatId, address);
                const wallet = trackedWallets.find(w => w.address.toLowerCase() === address.toLowerCase() && w.chatId === chatId);
                if (wallet) wallet.isFavorite = !wallet.isFavorite;
                console.log(`⭐ Toggled favorite for ${address}`);
            }
        );

        // Core Launch
        await bot.launch();
        console.log('✅ Bot engine is online and listening for commands!');

        // Start Scanners in the background to avoid blocking the bot's main loop
        console.log(`📡 Starting scanners for ${Object.keys(NETWORKS).length} networks in the background...`);

        // Deduplication Cache: chatId -> Set of txHashes
        const notifiedTransactions = new Map();

        // Cleanup cache every 10 minutes to prevent memory growth
        setInterval(() => {
            const now = Date.now();
            console.log('🧹 Cleaning up transaction deduplication cache...');
            notifiedTransactions.clear(); // Simple clear for safety, could be more granular
        }, 600000);

        Object.entries(NETWORKS).forEach(async ([id, network]) => {
            try {
                const provider = new ethers.JsonRpcProvider(network.rpcUrl);

                // Fast connectivity check
                await Promise.race([
                    provider.getNetwork(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);

                startScanner(id, network, trackedWallets, async (txData) => {
                    const fromAddress = txData.from?.toLowerCase();
                    const toAddress = txData.to?.toLowerCase();
                    const txHash = txData.hash?.toLowerCase();

                    for (const w of trackedWallets) {
                        const walletAddress = w.address.toLowerCase();
                        if (walletAddress === fromAddress || walletAddress === toAddress) {

                            // Initialize user's notified set if not exists
                            if (!notifiedTransactions.has(w.chatId)) {
                                notifiedTransactions.set(w.chatId, new Set());
                            }

                            const userNotifiedSet = notifiedTransactions.get(w.chatId);

                            // Check for duplicates
                            if (!userNotifiedSet.has(txHash)) {
                                const userWallets = trackedWallets.filter(uw => uw.chatId === w.chatId);
                                const fromName = userWallets.find(uw => uw.address.toLowerCase() === fromAddress)?.name;
                                const toName = userWallets.find(uw => uw.address.toLowerCase() === toAddress)?.name;

                                const enrichedData = {
                                    ...txData,
                                    walletName: fromName || toName || txData.walletName,
                                    fromName: fromName,
                                    toName: toName
                                };

                                await sendTransactionAlert(bot, w.chatId, enrichedData, getUserLanguage);

                                // Mark as notified
                                userNotifiedSet.add(txHash);
                                console.log(`🔔 Alert sent to ${w.chatId} for tx ${txHash}`);
                            } else {
                                console.log(`⏭️ Duplicate alert skipped for ${w.chatId} (tx ${txHash})`);
                            }
                        }
                    }
                });
            } catch (err) {
                console.warn(`⚠️ [${network.name}] Failed to start scanner: ${err.message}`);
            }
        });

        console.log('🚀 EVM Multi-Chain Tracker Bot is fully operational!');
    } catch (err) {
        console.error('💥 Critical Error during bot startup:', err.message);
    }
}

start().catch(console.error);
