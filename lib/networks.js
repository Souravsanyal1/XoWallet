/**
 * Registry of supported EVM networks.
 */
const NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        rpcUrl: 'https://eth.llamarpc.com',
        explorerUrl: 'https://etherscan.io',
        color: '🔵',
        usdtAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        testnet: false,
        isGasTracked: true
    },
    56: {
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorerUrl: 'https://bscscan.com',
        color: '🟡',
        usdtAddress: '0x55d398326f99059ff775485246999027b3197955',
        testnet: false,
        isGasTracked: true
    },
    137: {
        name: 'Polygon',
        symbol: 'POL',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        color: '🟣',
        usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        testnet: false,
        isGasTracked: true
    },
    42161: {
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        color: '🔵',
        usdtAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        testnet: false,
        isGasTracked: true
    },
    10: {
        name: 'Optimism',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
        color: '🔴',
        usdtAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        testnet: false,
        isGasTracked: true
    },
    8453: {
        name: 'Base Mainnet',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        color: '🔵',
        usdtAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        testnet: false,
        isGasTracked: true
    },
    43114: {
        name: 'Avalanche C-Chain',
        symbol: 'AVAX',
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        explorerUrl: 'https://snowtrace.io',
        color: '🔺',
        usdtAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4df4A8c7',
        testnet: false,
        isGasTracked: true
    },
    250: {
        name: 'Fantom Opera',
        symbol: 'FTM',
        rpcUrl: 'https://rpc.fantom.network',
        explorerUrl: 'https://ftmscan.com',
        color: '🔵',
        usdtAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        testnet: false,
        isGasTracked: true
    },
    59144: {
        name: 'Linea',
        symbol: 'ETH',
        rpcUrl: 'https://rpc.linea.build',
        explorerUrl: 'https://lineascan.build',
        color: '🔵',
        usdtAddress: '0xA21943dC0d9777398D5674061A0c868ac41Ec2B8',
        testnet: false,
        isGasTracked: true
    },
    204: {
        name: 'opBNB',
        symbol: 'BNB',
        rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
        explorerUrl: 'https://mainnet.opbnbscan.com',
        color: '🟡',
        usdtAddress: '0x9e5aac1ba1a2e6aed6d32689dfcf62a509ca93f3',
        testnet: false,
        isGasTracked: true
    },
    5000: {
        name: 'Mantle',
        symbol: 'MNT',
        rpcUrl: 'https://rpc.mantle.xyz',
        explorerUrl: 'https://mantlescan.xyz',
        color: '🟣',
        usdtAddress: '0x201EBa5f8E8f4da2Cd1FD6541f53198fA0160161',
        testnet: false,
        isGasTracked: true
    },
    369: {
        name: 'PulseChain',
        symbol: 'PLS',
        rpcUrl: 'https://rpc.pulsechain.com',
        explorerUrl: 'https://scan.pulsechain.com',
        color: '💖',
        usdtAddress: '0x0Cb8f5202613bC7FC028424EE10a300EE87532B0',
        testnet: false,
        isGasTracked: true
    },
    324: {
        name: 'ZKSync Era',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.era.zksync.io',
        explorerUrl: 'https://explorer.zksync.io',
        color: '🧊',
        usdtAddress: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
        testnet: false,
        isGasTracked: true
    },
    81457: {
        name: 'Blast',
        symbol: 'ETH',
        rpcUrl: 'https://rpc.blast.io',
        explorerUrl: 'https://blastscan.io',
        color: '💥',
        usdtAddress: '0x4300000000000000000000000000000000000003',
        testnet: false,
        isGasTracked: true
    },
    534352: {
        name: 'Scroll',
        symbol: 'ETH',
        rpcUrl: 'https://rpc.scroll.io',
        explorerUrl: 'https://scrollscan.com',
        color: '📜',
        usdtAddress: '0xf5511284d6ad30E14923DB37622998f8A8707C5F',
        testnet: false,
        isGasTracked: true
    },
    146: {
        name: 'Sonic',
        symbol: 'S',
        rpcUrl: 'https://rpc.soniclabs.com',
        explorerUrl: 'https://sonicscan.org',
        color: '⚡',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    130: {
        name: 'Unichain',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.unichain.org',
        explorerUrl: 'https://uniscan.xyz',
        color: '🦄',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    999: {
        name: 'Hyperliquid',
        symbol: 'HYPE',
        rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
        explorerUrl: 'https://hyperevmscan.io/',
        color: '📈',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    2741: {
        name: 'Abstract',
        symbol: 'ETH',
        rpcUrl: 'https://api.mainnet.abs.xyz',
        explorerUrl: 'https://abscan.org',
        color: '🌑',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    57073: {
        name: 'Ink',
        symbol: 'ETH',
        rpcUrl: 'https://rpc-gel.inkonchain.com',
        explorerUrl: 'https://explorer.inkonchain.com',
        color: '🖋️',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    80094: {
        name: 'Berachain',
        symbol: 'BERA',
        rpcUrl: 'https://rpc.berachain.com/',
        explorerUrl: 'https://berascan.com/',
        color: '🐻',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    9745: {
        name: 'Plasma',
        symbol: 'XPL',
        rpcUrl: 'https://rpc.plasma.to',
        explorerUrl: 'https://plasmascan.to',
        color: '🧪',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    1514: {
        name: 'Story Protocol',
        symbol: 'IP',
        rpcUrl: 'https://mainnet.storyrpc.io',
        explorerUrl: 'https://mainnet.storyscan.xyz',
        color: '📚',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    143: {
        name: 'Monad',
        symbol: 'MON',
        rpcUrl: 'https://rpc.monad.xyz',
        explorerUrl: 'https://monadscan.com',
        color: '🟣',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    },
    4326: {
        name: 'MegaETH',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.megaeth.com/rpc',
        explorerUrl: 'https://megaeth.blockscout.com',
        color: '⚡',
        usdtAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        testnet: false,
        isGasTracked: true
    }
};

module.exports = { NETWORKS };
