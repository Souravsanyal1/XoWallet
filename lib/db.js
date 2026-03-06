const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToDatabase(uri) {
    if (client) return;
    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('wallet_tracker');
        console.log('Connected to MongoDB');

        // Ensure collections exist
        const collections = await db.listCollections().toArray();
        if (!collections.some(c => c.name === 'wallets')) await db.createCollection('wallets');
        if (!collections.some(c => c.name === 'users')) await db.createCollection('users');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

async function getWallets() {
    return await db.collection('wallets').find({}).toArray();
}

async function addWallet(wallet) {
    return await db.collection('wallets').insertOne(wallet);
}

async function removeWallet(address) {
    return await db.collection('wallets').deleteOne({ address: address.toLowerCase() });
}

async function getUserLanguage(userId) {
    const user = await db.collection('users').findOne({ userId });
    return user ? user.language : 'en';
}

async function setUserLanguage(userId, language) {
    return await db.collection('users').updateOne(
        { userId },
        { $set: { userId, language } },
        { upsert: true }
    );
}

async function updateWalletName(chatId, address, newName) {
    return await db.collection('wallets').updateOne(
        { chatId, address: address.toLowerCase() },
        { $set: { name: newName } }
    );
}

async function toggleWalletFavorite(chatId, address) {
    const wallet = await db.collection('wallets').findOne({ chatId, address: address.toLowerCase() });
    if (!wallet) return null;
    const isFavorite = !!wallet.isFavorite;
    return await db.collection('wallets').updateOne(
        { chatId, address: address.toLowerCase() },
        { $set: { isFavorite: !isFavorite } }
    );
}

module.exports = { connectToDatabase, getWallets, addWallet, removeWallet, getUserLanguage, setUserLanguage, updateWalletName, toggleWalletFavorite };
