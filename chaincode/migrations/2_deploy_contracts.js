// chaincode/migrations/2_deploy_contracts.js

const IncanGold = artifacts.require("IncanGold");

module.exports = function (deployer) {
  // Let's set the entry fee to 0.1 Ether for testing.
  // 1 Ether = 1e18 wei, so 0.1 Ether = 1e17 wei.
  const entryFee = web3.utils.toWei("0.01", "ether");
  deployer.deploy(IncanGold, entryFee);
};
