// chaincode/test/incanGold.test.js

const IncanGold = artifacts.require("IncanGold");
const truffleAssert = require('truffle-assertions'); // You'll need to install this: npm install truffle-assertions

contract("IncanGold", (accounts) => {
    let contract;
    const owner = accounts[0];
    const player1 = accounts[1];
    const player2 = accounts[2];
    const entryFee = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
        // Deploy a fresh contract for each test
        contract = await IncanGold.new(entryFee);
    });

    it("should set the owner correctly", async () => {
        assert.equal(await contract.owner(), owner);
    });

    it("should allow a player to join a game", async () => {
        await contract.joinGame({ from: player1, value: entryFee });
        
        const players = await contract.getPlayers(1);
        const pot = await contract.getPot(1);

        assert.equal(players.length, 1);
        assert.equal(players[0], player1);
        assert.equal(pot.toString(), entryFee);
    });

    it("should not allow a player to join with incorrect fee", async () => {
        const wrongFee = web3.utils.toWei("0.05", "ether");
        await truffleAssert.reverts(
            contract.joinGame({ from: player1, value: wrongFee }),
            "Incorrect entry fee sent"
        );
    });

    it("should allow the owner to settle the game and distribute winnings", async () => {
        // Two players join
        await contract.joinGame({ from: player1, value: entryFee });
        await contract.joinGame({ from: player2, value: entryFee });

        const initialBalancePlayer1 = await web3.eth.getBalance(player1);
        
        // Backend (owner) decides player1 is the winner and gets the whole pot
        const totalPot = await contract.getPot(1);
        await contract.settleGame(1, [player1], [totalPot], { from: owner });

        const finalBalancePlayer1 = await web3.eth.getBalance(player1);
        
        // The final balance should be higher (accounting for gas costs)
        assert.isTrue(new web3.utils.BN(finalBalancePlayer1).gt(new web3.utils.BN(initialBalancePlayer1)));
    });

    it("should not allow a non-owner to settle the game", async () => {
        await contract.joinGame({ from: player1, value: entryFee });
        
        await truffleAssert.reverts(
            contract.settleGame(1, [player1], [entryFee], { from: player2 }),
            "Caller is not the owner"
        );
    });
});
