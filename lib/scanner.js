const { ethers } = require('ethers');
const { getPrices } = require('./price');

const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/**
 * Starts a scanner for a specific network.
 */
async function startScanner(networkId, network, wallets, onTransaction) {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const iface = new ethers.Interface(ERC20_ABI);

    console.log(`📡 [${network.name}] Scanner starting...`);

    provider.on('block', async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            if (!block || !block.prefetchedTransactions) return;

            const prices = await getPrices();

            // 1. Scan Native Transactions (BNB, ETH, etc.)
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

            // 2. Scan Token Transfers (ERC-20)
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
                        // Note: For real USD value of tokens, we'd need a more complex price fetcher per token.
                        // For now, we show the raw amount.

                        onTransaction({
                            network: network.name,
                            walletName: trackedWallet.name,
                            type: `${type} Token`,
                            amount: ethers.formatUnits(value, 18), // Assuming 18 decimals for most tokens
                            usdValue: '?',
                            symbol: 'Token',
                            from: decoded.args.from,
                            to: decoded.args.to,
                            hash: log.transactionHash,
                            color: '🪙'
                        });
                    }
                } catch (e) { /* Skip non-standard or error logs */ }
            }

        } catch (error) {
            console.error(`❌ [${network.name}] Error:`, error.message);
        }
    });

    provider.on('error', (err) => console.error(`🚨 [${network.name}] Provider Error:`, err));
}

module.exports = { startScanner };
