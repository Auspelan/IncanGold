// /home/zephyr/IncanGold/server/src/controllers/gameControl.controller.js

const blockchainService = require('../services/blockchain.service');

exports.testapi = async (req, res) => {
    try {
        res.status(200).json('test ok');
    } catch (error) {
        console.error('Get Error:', error);
        res.status(500).json({ error: 'Get Error' });
    }
};

/**
 * Provides the frontend with the contract address and ABI.
 * The frontend needs this to interact with the smart contract.
 */
exports.getContractInfo = async (req, res) => {
    try {
        res.status(200).json({
            address: blockchainService.contractAddress,
            abi: blockchainService.contractABI,
        });
    } catch (error) {
        console.error('Error getting contract info:', error);
        res.status(500).json({ error: 'Failed to get contract info' });
    }
};

/**
 * This is the main function your game logic will call when a game ends.
 * It takes the results and tells the smart contract to distribute the funds.
 */
exports.settleGame = async (req, res) => {
    try {
        // In a real app, you would validate the request body here.
        const { gameId, winners, payouts } = req.body;

        if (!gameId || !winners || !payouts) {
            return res.status(400).json({ error: 'Missing required fields: gameId, winners, payouts' });
        }

        // This is where your backend calls the blockchain
        const receipt = await blockchainService.settleGameOnChain(gameId, winners, payouts);

        res.status(200).json({
            message: 'Game settled successfully on blockchain!',
            transactionHash: receipt.transactionHash,
        });

    } catch (error) {
        console.error('Error settling game:', error);
        res.status(500).json({ error: error.message });
    }
};