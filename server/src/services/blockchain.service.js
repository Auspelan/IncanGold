// /home/zephyr/IncanGold/server/src/services/blockchain.service.js

const { Web3 } = require('web3');
const contractABI = require('../../../chaincode/build/contracts/IncanGold.json').abi;

require('dotenv').config();

const web3 = new Web3(process.env.RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const ownerAccount = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);

const contract = new web3.eth.Contract(contractABI, contractAddress);

/**
 * Settles a game on the blockchain by distributing the pot to winners.
 * @param {number} gameId - The ID of the game to settle.
 * @param {string[]} winners - An array of winner addresses.
 * @param {number[]} payouts - An array of payout amounts in wei.
 * @returns {Promise<object>} - The transaction receipt.
 */
const settleGameOnChain = async (gameId, winners, payouts) => {
    try {
        // Get the transaction data for the settleGame function
        const txData = contract.methods.settleGame(gameId, winners, payouts).encodeABI();

        // --- MODIFICATION START ---
        // Get the current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();
        // --- MODIFICATION END ---

        // Build the transaction
        const tx = {
            from: ownerAccount.address,
            to: contractAddress,
            gas: 500000, // Set a reasonable gas limit
            gasPrice: gasPrice, // Add the fetched gas price here
            data: txData,
        };

        // Sign the transaction with the owner's private key
        const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.OWNER_PRIVATE_KEY);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(`Game ${gameId} settled successfully. Transaction hash: ${receipt.transactionHash}`);
        return receipt;

    } catch (error) {
        console.error("Error settling game on-chain:", error);
        throw new Error("Blockchain transaction failed.");
    }
};

/**
 * Gets the entry fee required to join a game.
 * @returns {Promise<string>} - The entry fee in wei.
 */
const getEntryFee = async () => {
    try {
        const fee = await contract.methods.entryFee().call();
        return fee;
    } catch (error) {
        console.error("Error getting entry fee:", error);
        throw new Error("Could not fetch entry fee from contract.");
    }
};

module.exports = {
    settleGameOnChain,
    getEntryFee,
    contractAddress, // Export this for the frontend
    contractABI,     // Export this for the frontend
};