// /home/zephyr/IncanGold/server/simulate-players.js

require('dotenv').config();
const { Web3 } = require('web3');
const contractABI = require('../chaincode/build/contracts/IncanGold.json').abi;

const web3 = new Web3(process.env.RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function simulatePlayers() {
    try {
        // --- MODIFICATION START ---
        // Get the ID of the game that is about to be created
        const nextGameId = await contract.methods.nextGameId().call();
        console.log(`Preparing to simulate players for Game ID: ${nextGameId}`);
        // --- MODIFICATION END ---

        const entryFee = await contract.methods.entryFee().call();
        console.log(`Entry fee is: ${web3.utils.fromWei(entryFee, 'ether')} ETH`);

        const accounts = await web3.eth.getAccounts();
        const player1 = accounts[1];
        const player2 = accounts[2];
        const player3 = accounts[3];

        console.log(`Simulating ${player1} joining the game...`);
        await contract.methods.joinGame().send({ from: player1, value: entryFee, gas: 500000 });
        console.log(`-> ${player1} joined.`);

        console.log(`Simulating ${player2} joining the game...`);
        await contract.methods.joinGame().send({ from: player2, value: entryFee, gas: 500000 });
        console.log(`-> ${player2} joined.`);

        console.log(`Simulating ${player3} joining the game...`);
        await contract.methods.joinGame().send({ from: player3, value: entryFee, gas: 500000 });
        console.log(`-> ${player3} joined.`);

        const pot = await contract.methods.getPot(nextGameId).call();
        console.log(`\n✅ Game ${nextGameId} pot is now: ${web3.utils.fromWei(pot, 'ether')} ETH`);
        console.log(`\n--- Use this command to settle Game ${nextGameId} ---`);
        console.log(`curl -X POST -H "Content-Type: application/json" -d '{"gameId": ${nextGameId}, "winners": ["0x8b4bE9Fc120859a98BeC8f9b7186A9593c7b9933"], "payouts": ["${pot}"]}' http://localhost:5000/api/gameControl/settle-game`);

    } catch (error) {
        console.error("❌ Error simulating players:", error.message);
        console.log("Please ensure Ganache is running and your .env file is correct.");
    }
}

simulatePlayers();