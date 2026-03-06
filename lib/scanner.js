const { ethers } = require('ethers');
const { getPrices } = require('./price');

const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/**
 * Starts a scanner for a specific network using controlled polling with jitter.
 */
async function startScanner(networkId, network, wallets, onTransaction) {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const iface = new ethers.Interface(ERC20_ABI);
    let lastProcessedBlock = null;

    console.log(`📡 [${network.name}] Scanner initialized (Polling mode)`);

    // Add jitter to spread out initial requests (0-10 seconds)
    const jitter = Math.floor(Math.random() * 10000);

    setTimeout(() => {
        console.log(`🚀 [${network.name}] Scanner started after ${jitter}ms jitter`);
        poll();
    }, jitter);

    async function poll() {
        try {
            const currentBlock = await provider.getBlockNumber();

            if (lastProcessedBlock === null) {
                lastProcessedBlock = currentBlock - 1;
            }

            if (currentBlock > lastProcessedBlock) {
                // Limit backlog to 10 blocks per poll to prevent event loop saturation
                const startBlock = lastProcessedBlock + 1;
                const endBlock = Math.min(currentBlock, startBlock + 10);

                for (let b = startBlock; b <= endBlock; b++) {
                    await processBlock(b);
                }
                lastProcessedBlock = endBlock;
            }
        } catch (error) {
            console.error(`❌ [${network.name}] Polling Error:`, error.message);
        } finally {
            // Schedule next poll (15 seconds)
            setTimeout(poll, 15000);
        }
    }

    async function processBlock(blockNumber) {
        try {
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions) return;

            const prices = await getPrices();

            // 1. Scan Native Transactions
            for (const tx of block.prefetchedTransactions) {
                const to = tx.to ? tx.to.toLowerCase() : null;
                const from = tx.from ? tx.from.toLowerCase() : null;

                const trackedWallet = wallets.find(w =>
                    (to && w.address.toLowerCase() === to) ||
                    (from && w.address.toLowerCase() === from)
                );

                if (trackedWallet) {
                    const type = to && trackedWallet.address.toLowerCase() === to ? 'Received' : 'Sent';
                    const valueStr = ethers.formatEther(tx.value);
                    const usdPrice = prices[network.symbol]?.price || 0;
                    const usdValue = (parseFloat(valueStr) * usdPrice).toFixed(2);

                    onTransaction({
                        network: network.name,
                        walletName: trackedWallet.name,
                        type,
                        amount: valueStr,
                        usdValue,
                        symbol: network.symbol,
                        from: tx.from,
                        to: tx.to,
                        hash: tx.hash,
                        color: network.color
                    });
                }
            }

            // 2. Scan Token Transfers
            const logs = await provider.getLogs({
                fromBlock: blockNumber,
                toBlock: blockNumber,
                topics: [ethers.id("Transfer(address,address,uint256)")]
            });

            for (const log of logs) {
                try {
                    const decoded = iface.parseLog(log);
                    const from = decoded.args.from.toLowerCase();
                    const to = decoded.args.to.toLowerCase();
                    const value = decoded.args.value;

                    const trackedWallet = wallets.find(w =>
                        w.address.toLowerCase() === to || w.address.toLowerCase() === from
                    );

                    if (trackedWallet) {
                        const type = trackedWallet.address.toLowerCase() === to ? 'Received' : 'Sent';
                        onTransaction({
                            network: network.name,
                            walletName: trackedWallet.name,
                            type: `${type} Token`,
                            amount: ethers.formatUnits(value, 18),
                            usdValue: '?',
                            symbol: 'Token',
                            from: decoded.args.from,
                            to: decoded.args.to,
                            hash: log.transactionHash,
                            color: '🪙'
                        });
                    }
                } catch (e) { }
            }
        } catch (error) {
            console.error(`❌ [${network.name}] Block ${blockNumber} Error:`, error.message);
        }
    }
}

module.exports = { startScanner };
