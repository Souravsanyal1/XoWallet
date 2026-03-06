const axios = require('axios');

const COIN_MAP = {
    'BNB': 'binancecoin',
    'ETH': 'ethereum',
    'POL': 'polygon-ecosystem-token',
    'AVAX': 'avalanche-2'
};

const FALLBACK_PRICES = {
    'BNB': { price: 600, change: 0 },
    'ETH': { price: 3500, change: 0 },
    'POL': { price: 1.0, change: 0 },
    'AVAX': { price: 40.0, change: 0 }
};

let priceCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches real-time prices for native tokens including 24h change.
 */
async function getPrices() {
    const now = Date.now();
    if (priceCache && (now - lastFetchTime < CACHE_TTL)) {
        return priceCache;
    }

    try {
        const ids = Object.values(COIN_MAP).join(',');
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
            timeout: 10000,
            headers: { 'Accept': 'application/json' }
        });

        const prices = {};
        if (response.data) {
            for (const [symbol, id] of Object.entries(COIN_MAP)) {
                if (response.data[id]) {
                    prices[symbol] = {
                        price: response.data[id].usd || FALLBACK_PRICES[symbol].price,
                        change: response.data[id].usd_24h_change || 0
                    };
                } else {
                    prices[symbol] = FALLBACK_PRICES[symbol];
                }
            }
            priceCache = prices;
            lastFetchTime = now;
        } else {
            return priceCache || FALLBACK_PRICES;
        }
        return prices;
    } catch (error) {
        console.error('Price Fetch Error:', error.message);
        return priceCache || FALLBACK_PRICES;
    }
}

module.exports = { getPrices };
