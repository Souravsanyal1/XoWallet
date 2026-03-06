require('dotenv').config();
const { ethers } = require('ethers');
const { startScanner } = require('./lib/scanner');
const { setupBot, sendTransactionAlert } = require('./lib/bot');
const { connectToDatabase, getWallets, addWallet, removeWallet, getUserLanguage, setUserLanguage, updateWalletName, toggleWalletFavorite } = require('./lib/db');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const { NETWORKS } = require('./lib/networks');

async function start() {
    try {
        if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env");
        await connectToDatabase(MONGODB_URI);

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

        // Start Scanners for all supported networks in PARALLEL
        console.log(`📡 Starting scanners for ${Object.keys(NETWORKS).length} networks...`);

        const scannerPromises = Object.entries(NETWORKS).map(async ([id, network]) => {
            try {
                const provider = new ethers.JsonRpcProvider(network.rpcUrl);

                // Set a timeout for RPC check to prevent hanging
                await Promise.race([
                    provider.getNetwork(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 10000))
                ]);

                startScanner(id, network, trackedWallets, async (txData) => {
                    console.log(`🔔 [${txData.network}] Transaction detected`);

                    const fromAddress = txData.from?.toLowerCase();
                    const toAddress = txData.to?.toLowerCase();
                    const notifiedUsers = new Set();

                    for (const w of trackedWallets) {
                        const walletAddress = w.address.toLowerCase();

                        if (walletAddress === fromAddress || walletAddress === toAddress) {
                            if (!notifiedUsers.has(w.chatId)) {
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
                                notifiedUsers.add(w.chatId);
                            }
                        }
                    }
                });
            } catch (err) {
                console.warn(`⚠️ [${network.name}] Failed to start scanner: ${err.message}`);
            }
        });

        await Promise.all(scannerPromises);

        console.log('🚀 EVM Multi-Chain Tracker Bot is running and monitoring all networks!');
    } catch (err) {
        console.error('💥 Failed to start bot:', err.message);
    }
}

start().catch(console.error);
